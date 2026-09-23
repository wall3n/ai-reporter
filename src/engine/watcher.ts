import { ALL_COLLECTORS } from "../collectors";
import { canonicalize, validateEvent, type RawEvent, type TelemetryEvent } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { openCursorStore } from "../storage/cursors";
import { getDatabase, type ReporterDatabase } from "../storage/db";
import { writeSpool } from "../storage/spool";

export const IDLE_AFTER_MS = 10 * 60 * 1000;
export const IDLE_INTERVAL_MS = 60 * 1000;

export type ScanResult = {
  totalNew: number;
  totalFound: number;
  byHarness: Record<string, number>;
  durationMs: number;
  failedHarnesses: string[];
};

export type WatcherOptions = {
  intervalMs?: number;
  verbose?: boolean;
  onEvent?: (event: TelemetryEvent) => void;
  onScanComplete?: (result: ScanResult) => void;
  onLog?: (message: string) => void;
};

export class Watcher {
  private db: ReporterDatabase;
  private cursors = openCursorStore();
  private baseIntervalMs: number;
  private verbose: boolean;
  private running = false;
  private paused = false;
  private stopRequested = false;
  private lastActivityAt = Date.now();
  private wakeResolver?: () => void;
  private onEvent?: (event: TelemetryEvent) => void;
  private onScanComplete?: (result: ScanResult) => void;
  private onLog: (message: string) => void;

  constructor(options: WatcherOptions = {}) {
    this.db = getDatabase();
    this.baseIntervalMs = options.intervalMs ?? 30_000;
    this.verbose = Boolean(options.verbose);
    this.onEvent = options.onEvent;
    this.onScanComplete = options.onScanComplete;
    this.onLog = options.onLog ?? (() => {});
  }

  public log(msg: string): void {
    this.onLog(msg);
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) {
      this.wake();
    }
  }

  public togglePause(): boolean {
    this.setPaused(!this.paused);
    return this.paused;
  }

  public wake(): void {
    if (this.wakeResolver) {
      const resolve = this.wakeResolver;
      this.wakeResolver = undefined;
      resolve();
    }
  }

  public stop(): void {
    this.stopRequested = true;
    this.wake();
  }

  public async scanOnce(): Promise<ScanResult> {
    const start = Date.now();
    this.cursors.reload?.();
    const result: ScanResult = {
      byHarness: {},
      durationMs: 0,
      failedHarnesses: [],
      totalFound: 0,
      totalNew: 0,
    };

    const ctx: CollectorContext = {
      cursors: this.cursors,
      log: (msg) => this.log(msg),
    };

    // Prepare collectors that need setup (e.g. cursor hook setup)
    for (const collector of ALL_COLLECTORS) {
      try {
        await collector.prepare?.(ctx.log);
      } catch (e) {
        this.log(`${collector.id}: prepare warning: ${String(e)}`);
      }
    }

    const batch: TelemetryEvent[] = [];

    for (const collector of ALL_COLLECTORS) {
      try {
        const roots = await collector.discover();
        if (roots.length === 0) {
          continue;
        }

        for await (const raw of collector.collect(ctx)) {
          if (raw.type !== "usage") {
            continue;
          }
          const event = canonicalize(raw);
          const problems = validateEvent(event);
          if (problems.length > 0) {
            this.log(`${collector.id}: dropped invalid event: ${problems.join("; ")}`);
            continue;
          }

          result.totalFound++;
          batch.push(event);
          result.byHarness[collector.id] = (result.byHarness[collector.id] ?? 0) + 1;
        }
      } catch (error) {
        result.failedHarnesses.push(collector.id);
        this.log(`${collector.id}: collection failed: ${String(error)}`);
      }
    }

    if (batch.length > 0) {
      const inserted = this.db.insertEvents(batch);
      result.totalNew = inserted;
      if (inserted > 0) {
        this.lastActivityAt = Date.now();
        writeSpool(batch);
        for (const ev of batch) {
          this.onEvent?.(ev);
        }
      }
    }

    this.cursors.save();
    result.durationMs = Date.now() - start;
    this.onScanComplete?.(result);
    return result;
  }

  public currentInterval(): number {
    const idleTime = Date.now() - this.lastActivityAt;
    if (idleTime >= IDLE_AFTER_MS) {
      return Math.max(this.baseIntervalMs, IDLE_INTERVAL_MS);
    }
    return this.baseIntervalMs;
  }

  public async run(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    this.stopRequested = false;

    try {
      while (!this.stopRequested) {
        if (!this.paused) {
          try {
            await this.scanOnce();
          } catch (err) {
            this.log(`scan error: ${String(err)}`);
          }
        }

        if (this.stopRequested) {
          break;
        }

        const waitMs = this.paused ? 5000 : this.currentInterval();
        await new Promise<void>((resolve) => {
          this.wakeResolver = resolve;
          const timer = setTimeout(() => {
            this.wakeResolver = undefined;
            resolve();
          }, waitMs);
        });
      }
    } finally {
      this.running = false;
      this.cursors.save();
    }
  }
}

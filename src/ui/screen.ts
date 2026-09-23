import readline from "node:readline";
import { banner } from "./banner";
import { c, colorEnabled, rgb, stripAnsi, terminalText, width } from "./style";
import { renderTable } from "./table";
import { box, compactNumber, fit, formatAgo, formatUsd, gauge, pad, wrap } from "./tui";
import type { HarnessId, TelemetryEvent } from "../core/schema";
import type { HarnessSummary, UsageSummary } from "../core/types";
import { getDatabase } from "../storage/db";
import { getServiceStatus } from "../service/launchd";
import type { Watcher } from "../engine/watcher";

export const HARNESS_INFO: Record<
  string,
  { name: string; glyph: string; color: (t: string) => string }
> = {
  antigravity: { color: c.purple, glyph: "◠", name: "Antigravity" },
  "claude-code": { color: c.orange, glyph: "✻", name: "Claude Code" },
  cursor: { color: c.cyan, glyph: "▍", name: "Cursor" },
  opencode: { color: c.green, glyph: "◆", name: "OpenCode" },
  copilot: { color: c.blue, glyph: "◉", name: "Copilot" },
  "gemini-cli": { color: c.gold, glyph: "✦", name: "Gemini CLI" },
  codex: { color: c.teal, glyph: "⬡", name: "Codex" },
  cline: { color: c.purple, glyph: "▣", name: "Cline" },
  "kilo-code": { color: c.gold, glyph: "⬢", name: "Kilo Code" },
  pi: { color: c.orange, glyph: "π", name: "Pi" },
  omp: { color: c.purple, glyph: "π", name: "Oh My Pi" },
  "qwen-code": { color: c.blue, glyph: "❋", name: "Qwen Code" },
  devin: { color: c.cyan, glyph: "◈", name: "Devin" },
};

function harnessLabel(id: string): string {
  const info = HARNESS_INFO[id];
  if (!info) return id;
  return `${info.color(info.glyph)} ${info.name}`;
}

export type ScreenState = {
  watcher: Watcher;
  nextScanAt: number;
  lastScanDurationMs: number;
  newInLastScan: number;
  statusMessage: string;
};

export type ScreenOptions = {
  mode?: "standalone" | "attached";
  attachedPid?: number;
};

export class Screen {
  private watcher: Watcher;
  private options: ScreenOptions;
  private timer?: NodeJS.Timeout;
  private running = false;
  private nextScanAt = Date.now() + 30_000;
  private lastScanDurationMs = 0;
  private newInLastScan = 0;
  private statusMessage = "Initializing scanner...";
  private lastRenderedLines: string[] = [];
  public onExit?: () => void;
  private lastKnownTotalRequests = -1;
  private isScanning = false;

  constructor(watcher: Watcher, options: ScreenOptions = {}) {
    this.watcher = watcher;
    this.options = options;
    if (options.mode === "attached") {
      this.statusMessage = options.attachedPid
        ? `Live stream active (PID ${options.attachedPid})`
        : "Live stream active";
    }
  }

  public isAttached(): boolean {
    return this.options.mode === "attached";
  }

  public async triggerScan(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;
    try {
      const res = await this.watcher.scanOnce();
      this.onScanResult(res.totalNew, res.durationMs);
    } catch (e: any) {
      this.statusMessage = `Scan failed: ${e.message || String(e)}`;
      this.render();
    } finally {
      this.isScanning = false;
    }
  }

  public start(): void {
    if (this.running) return;
    this.running = true;

    // Switch to alternate screen buffer, hide cursor
    process.stdout.write("\x1b[?1049h\x1b[?25l");

    // Handle terminal resize
    process.stdout.on("resize", () => {
      this.render();
    });

    // Handle keypresses
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      process.stdin.on("keypress", async (_ch, key) => {
        if (!key) return;
        if (key.ctrl && key.name === "c") {
          this.stop();
          process.exit(0);
        } else if (key.name === "q") {
          this.stop();
        } else if (key.name === "p") {
          const paused = this.watcher.togglePause();
          this.statusMessage = paused ? "Watcher paused" : "Watcher resumed";
          this.render();
        } else if (key.name === "s") {
          if (this.isScanning) return;
          this.statusMessage = "Immediate scan triggered...";
          this.render();
          if (this.isAttached()) {
            await this.triggerScan();
          } else {
            this.watcher.wake();
          }
        } else if (key.name === "r") {
          this.render();
        }
      });
    }

    // Tick every second for clock, countdown gauge, and UI updates
    this.timer = setInterval(() => {
      this.render();
    }, 1000);

    this.render();
  }

  public onScanResult(totalNew: number, durationMs: number): void {
    this.newInLastScan = totalNew;
    this.lastScanDurationMs = durationMs;
    this.nextScanAt = Date.now() + this.watcher.currentInterval();
    this.statusMessage =
      totalNew > 0
        ? `Found ${totalNew} new usage event${totalNew === 1 ? "" : "s"} (${durationMs}ms)`
        : `Scan complete: up to date (${durationMs}ms)`;
    this.render();
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    if (!this.isAttached()) {
      this.watcher.stop();
    }

    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // Ignored
      }
      process.stdin.pause();
    }

    // Restore main screen buffer and show cursor
    process.stdout.write("\x1b[?25h\x1b[?1049l");

    this.onExit?.();
  }

  private render(): void {
    if (!this.running) return;

    const cols = process.stdout.columns ?? 80;
    const rows = process.stdout.rows ?? 24;

    const lines: string[] = [];
    const now = Date.now();
    const db = getDatabase();

    const allSummary = db.getSummary();

    // Detect new events committed to SQLite by the background service
    if (this.lastKnownTotalRequests >= 0 && allSummary.totalRequests > this.lastKnownTotalRequests) {
      const diff = allSummary.totalRequests - this.lastKnownTotalRequests;
      this.statusMessage = `Live: +${diff} new request${diff === 1 ? "" : "s"} recorded by 24/7 service`;
      this.nextScanAt = now + this.watcher.currentInterval();
    } else if (this.isAttached() && now >= this.nextScanAt) {
      this.nextScanAt = now + this.watcher.currentInterval();
    }
    this.lastKnownTotalRequests = allSummary.totalRequests;

    // 1. Header Banner
    const bannerSubtitle = this.isAttached()
      ? "24/7 AI Token & Spend Tracker · Live Monitor"
      : "24/7 AI Token & Spend Tracker";
    lines.push(banner(bannerSubtitle, cols));
    lines.push("");

    // 2. Status & Countdown Gauge
    const remainingMs = Math.max(0, this.nextScanAt - now);
    const intervalMs = this.watcher.currentInterval();
    const fraction = Math.min(1, Math.max(0, 1 - remainingMs / intervalMs));
    const countdownSec = Math.ceil(remainingMs / 1000);

    const daemonStatus = getServiceStatus();
    const daemonTag = daemonStatus.running
      ? c.green(`● 24/7 Service active (pid ${daemonStatus.pid})`)
      : daemonStatus.installed
        ? c.yellow("○ Service installed but stopped")
        : c.dim("○ Service not installed (run 'ai-reporter service install')");

    const modeTag = this.isAttached() ? c.bold(c.cyan(" [LIVE STREAM]")) : "";
    const pausedTag = this.watcher.isPaused() ? c.yellow(" [PAUSED]") : "";
    const gaugeWidth = Math.max(10, Math.min(24, cols - 60));
    const scanLabel = this.isAttached() ? "Next sync in" : "Next scan in";
    const countdownLine = this.watcher.isPaused()
      ? `  ${c.yellow("⏸")}  ${c.bold("PAUSED")} · Press ${c.bold("p")} to resume`
      : `  ${gauge(fraction, gaugeWidth)}  ${scanLabel} ${c.bold(`${countdownSec}s`)} · ${c.dim(this.statusMessage)}`;

    lines.push(`${countdownLine}  ·  ${daemonTag}${modeTag}${pausedTag}`);
    lines.push("");

    // 3. Today & All-Time Summaries
    const todayStr = new Date(now).toISOString().slice(0, 10);
    const todaySummary = db.getSummary({ since: `${todayStr}T00:00:00.000Z` });

    const summaryW = Math.min(cols - 4, 110);
    const todayLine = `${c.bold(compactNumber(todaySummary.totalTokens))} tokens  ${c.dim("(")}${compactNumber(todaySummary.inputTokens)} in · ${compactNumber(todaySummary.outputTokens)} out · ${c.dim(`${compactNumber(todaySummary.cacheReadTokens)} cached)`)}  ·  Cost: ${c.bold(c.gold(formatUsd(todaySummary.totalCostUsd)))}  ·  Saved by cache: ${c.green(formatUsd(todaySummary.totalCostSavingsUsd))}`;
    const allLine = `${c.bold(compactNumber(allSummary.totalTokens))} tokens  across ${c.bold(compactNumber(allSummary.totalRequests))} requests  ·  Total Cost: ${c.bold(c.gold(formatUsd(allSummary.totalCostUsd)))}  ·  All-time cache savings: ${c.green(formatUsd(allSummary.totalCostSavingsUsd))}`;

    const summaryBox = box(
      { accent: "cyan", title: "Usage & Spend Overview" },
      [
        `Today:    ${todayLine}`,
        `All-Time: ${allLine}`,
      ],
      summaryW
    );
    for (const l of summaryBox) {
      lines.push(`  ${l}`);
    }
    lines.push("");

    // 4. Harnesses Table
    const harnessSummaries = db.getHarnessSummaries();
    const harnessRows: string[][] = [];

    for (const [id, info] of Object.entries(HARNESS_INFO)) {
      const found = harnessSummaries.find((h) => h.harness === id);
      const isLive =
        found?.lastEventAt && now - Date.parse(found.lastEventAt) < 5 * 60 * 1000;
      const statusStr = isLive
        ? c.green("● live")
        : found?.lastEventAt
          ? c.dim("● idle")
          : c.dim("○ no data");

      harnessRows.push([
        harnessLabel(id),
        statusStr,
        found ? compactNumber(found.requests) : c.dim("–"),
        found ? compactNumber(found.tokens) : c.dim("–"),
        found ? c.dim(compactNumber(found.cached)) : c.dim("–"),
        found ? c.gold(formatUsd(found.costUsd)) : c.dim("–"),
        found?.lastEventAt ? c.dim(formatAgo(Date.parse(found.lastEventAt), now)) : c.dim("–"),
      ]);
    }

    const harnessTableLines = renderTable(
      harnessRows,
      ["Harness", "Status", "Requests", "Tokens", "Cached", "Cost", "Last Active"],
      ["left", "left", "right", "right", "right", "right", "right"]
    ).split("\n");

    const harnessBox = box(
      { accent: "gold", title: "AI Coding Harnesses" },
      harnessTableLines,
      summaryW
    );
    for (const l of harnessBox) {
      lines.push(`  ${l}`);
    }
    lines.push("");

    // 5. Recent Requests Stream (up to 8 requests)
    const recent = db.getRecentEvents({ limit: 8 });
    if (recent.length > 0) {
      const reqRows = recent.map((r) => {
        const time = new Date(r.occurredAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const hInfo = HARNESS_INFO[r.harness];
        const hGlyph = hInfo ? `${hInfo.color(hInfo.glyph)} ${r.harness}` : r.harness;
        return [
          c.dim(time),
          hGlyph,
          fit(r.model.name, 18),
          compactNumber(r.tokens.input),
          compactNumber(r.tokens.output),
          c.dim(compactNumber(r.tokens.cacheRead)),
          compactNumber(r.tokens.total),
          c.gold(formatUsd(r.costUsd)),
          r.project?.name ? fit(r.project.name, 16) : c.dim("–"),
        ];
      });

      const recentTableLines = renderTable(
        reqRows,
        ["Time", "Harness", "Model", "In", "Out", "Cached", "Total", "Cost", "Project"],
        ["left", "left", "left", "right", "right", "right", "right", "right", "left"]
      ).split("\n");

      const recentBox = box(
        { accent: "teal", title: "Recent Requests" },
        recentTableLines,
        summaryW
      );
      for (const l of recentBox) {
        lines.push(`  ${l}`);
      }
      lines.push("");
    }

    // 6. Footer Navigation / Keybindings
    const footer = `  ${c.bold("q")} Quit  ·  ${c.bold("p")} Pause/Resume  ·  ${c.bold("s")} Scan Now  ·  ${c.bold("r")} Refresh  ·  ${c.dim("AI-Reporter running 24/7")}`;
    lines.push(footer);

    // Render cleanly: clear screen, print buffer
    const screenBuffer = lines.slice(0, rows).join("\n");
    process.stdout.write(`\x1b[H\x1b[2J${screenBuffer}`);
  }
}

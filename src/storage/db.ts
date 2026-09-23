import { DatabaseSync } from "node:sqlite";
import { dirname } from "node:path";
import { dbPath, ensureDir } from "../core/config";
import type {
  DailyUsage,
  HarnessSummary,
  ModelSummary,
  PeriodBucket,
  PeriodStats,
  PeriodType,
  ProjectSummary,
  UsageSummary,
} from "../core/types";
import { computeFunMetrics } from "../core/fun-metrics";
import type { HarnessId, TelemetryEvent } from "../core/schema";

export class ReporterDatabase {
  private db: DatabaseSync;

  constructor(customPath?: string) {
    const path = customPath || dbPath();
    ensureDir(dirname(path));
    this.db = new DatabaseSync(path);
    this.init();
  }

  private init(): void {
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        eventId TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        occurredAt TEXT NOT NULL,
        observedAt TEXT NOT NULL,
        harness TEXT NOT NULL,
        harnessVersion TEXT,
        sessionId TEXT NOT NULL,
        projectName TEXT,
        projectDirHash TEXT,
        gitBranch TEXT,
        repo TEXT,
        modelRaw TEXT NOT NULL,
        modelName TEXT NOT NULL,
        modelFamily TEXT NOT NULL,
        modelProvider TEXT NOT NULL,
        tokensInput INTEGER NOT NULL DEFAULT 0,
        tokensOutput INTEGER NOT NULL DEFAULT 0,
        tokensCacheRead INTEGER NOT NULL DEFAULT 0,
        tokensCacheWrite INTEGER NOT NULL DEFAULT 0,
        tokensReasoning INTEGER NOT NULL DEFAULT 0,
        tokensTotal INTEGER NOT NULL DEFAULT 0,
        costUsd REAL NOT NULL DEFAULT 0,
        costSavingsUsd REAL NOT NULL DEFAULT 0,
        nativeRequestId TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_events_occurredAt ON events(occurredAt);
      CREATE INDEX IF NOT EXISTS idx_events_harness ON events(harness);
      CREATE INDEX IF NOT EXISTS idx_events_modelName ON events(modelName);
      CREATE INDEX IF NOT EXISTS idx_events_projectName ON events(projectName);

      CREATE TABLE IF NOT EXISTS cursors (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  public insertEvents(events: TelemetryEvent[]): number {
    if (events.length === 0) {
      return 0;
    }

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO events (
        eventId, type, occurredAt, observedAt, harness, harnessVersion,
        sessionId, projectName, projectDirHash, gitBranch, repo,
        modelRaw, modelName, modelFamily, modelProvider,
        tokensInput, tokensOutput, tokensCacheRead, tokensCacheWrite, tokensReasoning, tokensTotal,
        costUsd, costSavingsUsd, nativeRequestId
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    let inserted = 0;
    this.db.exec("BEGIN TRANSACTION;");
    try {
      for (const ev of events) {
        const changes = stmt.run(
          ev.eventId,
          ev.type,
          ev.occurredAt,
          ev.observedAt,
          ev.harness,
          ev.harnessVersion || null,
          ev.sessionId,
          ev.project?.name || null,
          ev.project?.dirHash || null,
          ev.project?.gitBranch || null,
          ev.project?.repo || null,
          ev.model.raw,
          ev.model.name,
          ev.model.family,
          ev.model.provider,
          ev.tokens.input,
          ev.tokens.output,
          ev.tokens.cacheRead,
          ev.tokens.cacheWrite,
          ev.tokens.reasoning || 0,
          ev.tokens.total,
          ev.costUsd,
          ev.costSavingsUsd,
          ev.native?.requestId || null
        ).changes;
        if (Number(changes) > 0) {
          inserted++;
        }
      }
      this.db.exec("COMMIT;");
    } catch (e) {
      this.db.exec("ROLLBACK;");
      throw e;
    }
    return inserted;
  }

  public getSummary(options?: { since?: string; until?: string; harness?: string }): UsageSummary {
    const conditions: string[] = ["type = 'usage'"];
    const params: any[] = [];

    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }
    if (options?.harness) {
      conditions.push("harness = ?");
      params.push(options.harness);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `
      SELECT
        COUNT(*) as totalRequests,
        COUNT(DISTINCT sessionId) as totalSessions,
        COALESCE(SUM(tokensTotal), 0) as totalTokens,
        COALESCE(SUM(tokensInput), 0) as inputTokens,
        COALESCE(SUM(tokensOutput), 0) as outputTokens,
        COALESCE(SUM(tokensCacheRead), 0) as cacheReadTokens,
        COALESCE(SUM(tokensCacheWrite), 0) as cacheWriteTokens,
        COALESCE(SUM(tokensReasoning), 0) as reasoningTokens,
        COALESCE(SUM(costUsd), 0) as totalCostUsd,
        COALESCE(SUM(costSavingsUsd), 0) as totalCostSavingsUsd,
        MIN(occurredAt) as firstEventAt,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
    `;

    const row = this.db.prepare(query).get(...params) as any;
    return {
      totalRequests: Number(row.totalRequests) || 0,
      totalSessions: Number(row.totalSessions) || 0,
      totalTokens: Number(row.totalTokens) || 0,
      inputTokens: Number(row.inputTokens) || 0,
      outputTokens: Number(row.outputTokens) || 0,
      cacheReadTokens: Number(row.cacheReadTokens) || 0,
      cacheWriteTokens: Number(row.cacheWriteTokens) || 0,
      reasoningTokens: Number(row.reasoningTokens) || 0,
      totalCostUsd: Math.round((Number(row.totalCostUsd) || 0) * 1000) / 1000,
      totalCostSavingsUsd: Math.round((Number(row.totalCostSavingsUsd) || 0) * 1000) / 1000,
      firstEventAt: row.firstEventAt || undefined,
      lastEventAt: row.lastEventAt || undefined,
    };
  }

  public getHarnessSummaries(options?: { since?: string; until?: string }): HarnessSummary[] {
    const conditions: string[] = ["type = 'usage'"];
    const params: any[] = [];

    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const query = `
      SELECT
        harness,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd,
        COALESCE(SUM(costSavingsUsd), 0) as costSavingsUsd,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
      GROUP BY harness
      ORDER BY tokens DESC
    `;

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      harness: r.harness as HarnessId,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      input: Number(r.input) || 0,
      output: Number(r.output) || 0,
      cached: Number(r.cached) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1000) / 1000,
      costSavingsUsd: Math.round((Number(r.costSavingsUsd) || 0) * 1000) / 1000,
      lastEventAt: r.lastEventAt || undefined,
    }));
  }

  public getModelSummaries(options?: { since?: string; until?: string; limit?: number }): ModelSummary[] {
    const conditions: string[] = ["type = 'usage'"];
    const params: any[] = [];

    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const limit = options?.limit ?? 15;
    const query = `
      SELECT
        modelName,
        modelFamily,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd
      FROM events
      ${where}
      GROUP BY modelName, modelFamily
      ORDER BY tokens DESC
      LIMIT ?
    `;

    params.push(limit);
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      modelName: r.modelName,
      modelFamily: r.modelFamily,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      input: Number(r.input) || 0,
      output: Number(r.output) || 0,
      cached: Number(r.cached) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1000) / 1000,
    }));
  }

  public getProjectSummaries(options?: { since?: string; until?: string; limit?: number }): ProjectSummary[] {
    const conditions: string[] = ["type = 'usage' AND projectName IS NOT NULL"];
    const params: any[] = [];

    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const limit = options?.limit ?? 10;
    const query = `
      SELECT
        projectName,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(costUsd), 0) as costUsd,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
      GROUP BY projectName
      ORDER BY tokens DESC
      LIMIT ?
    `;

    params.push(limit);
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      projectName: r.projectName,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1000) / 1000,
      lastEventAt: r.lastEventAt || undefined,
    }));
  }

  public getDailyUsage(days = 14): DailyUsage[] {
    const query = `
      SELECT
        substr(occurredAt, 1, 10) as day,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd
      FROM events
      WHERE type = 'usage'
      GROUP BY day
      ORDER BY day DESC
      LIMIT ?
    `;

    const rows = this.db.prepare(query).all(days) as any[];
    return rows
      .map((r) => ({
        day: r.day,
        requests: Number(r.requests) || 0,
        tokens: Number(r.tokens) || 0,
        input: Number(r.input) || 0,
        output: Number(r.output) || 0,
        cached: Number(r.cached) || 0,
        costUsd: Math.round((Number(r.costUsd) || 0) * 1000) / 1000,
      }))
      .reverse();
  }

  public getPeriodStats(
    type: PeriodType,
    offset = 0,
    refDate = new Date()
  ): PeriodStats {
    const refYear = refDate.getUTCFullYear();
    const refMonth = refDate.getUTCMonth();
    const refDateNum = refDate.getUTCDate();
    const refDay = refDate.getUTCDay();

    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let label = "";
    let rangeLabel = "";
    let prevLabel = "";
    const buckets: PeriodBucket[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const shortMonthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    if (type === "week") {
      const diffToMon = (refDay === 0 ? -6 : 1) - refDay;
      const mondayOffset = diffToMon + offset * 7;
      start = new Date(Date.UTC(refYear, refMonth, refDateNum + mondayOffset, 0, 0, 0, 0));
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999));

      prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() - 7, 0, 0, 0, 0));
      prevEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 7, 23, 59, 59, 999));

      const isoWeek = getISOWeekNumber(start);
      const startStr = `${shortMonthNames[start.getUTCMonth()]} ${start.getUTCDate()}`;
      const endStr = `${shortMonthNames[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
      label = `Week ${isoWeek} · ${startStr} – ${endStr}`;
      rangeLabel = `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`;
      prevLabel = `Week ${getISOWeekNumber(prevStart)}`;

      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i, 0, 0, 0, 0));
        const key = d.toISOString().slice(0, 10);
        buckets.push({
          cached: 0,
          costUsd: 0,
          input: 0,
          key,
          label: `${dayNames[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, "0")}`,
          output: 0,
          requests: 0,
          subLabel: dayNames[d.getUTCDay()],
          tokens: 0,
        });
      }
    } else if (type === "month") {
      start = new Date(Date.UTC(refYear, refMonth + offset, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999));

      prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1, 0, 0, 0, 0));
      prevEnd = new Date(Date.UTC(prevStart.getUTCFullYear(), prevStart.getUTCMonth() + 1, 0, 23, 59, 59, 999));

      label = `${monthNames[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
      rangeLabel = `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`;
      prevLabel = `${shortMonthNames[prevStart.getUTCMonth()]} ${prevStart.getUTCFullYear()}`;

      const daysInMonth = end.getUTCDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i, 0, 0, 0, 0));
        const key = d.toISOString().slice(0, 10);
        buckets.push({
          cached: 0,
          costUsd: 0,
          input: 0,
          key,
          label: String(i).padStart(2, "0"),
          output: 0,
          requests: 0,
          subLabel: dayNames[d.getUTCDay()],
          tokens: 0,
        });
      }
    } else {
      // type === "year"
      const targetYear = refYear + offset;
      start = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));

      prevStart = new Date(Date.UTC(targetYear - 1, 0, 1, 0, 0, 0, 0));
      prevEnd = new Date(Date.UTC(targetYear - 1, 11, 31, 23, 59, 59, 999));

      label = `Year ${targetYear}`;
      rangeLabel = `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`;
      prevLabel = `Year ${targetYear - 1}`;

      for (let m = 0; m < 12; m++) {
        const key = `${targetYear}-${String(m + 1).padStart(2, "0")}`;
        buckets.push({
          cached: 0,
          costUsd: 0,
          input: 0,
          key,
          label: shortMonthNames[m],
          output: 0,
          requests: 0,
          subLabel: monthNames[m],
          tokens: 0,
        });
      }
    }

    const since = start.toISOString();
    const until = end.toISOString();

    const bucketSubstrLen = type === "year" ? 7 : 10;
    const bucketQuery = `
      SELECT
        substr(occurredAt, 1, ${bucketSubstrLen}) as bucketKey,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd
      FROM events
      WHERE type = 'usage' AND occurredAt >= ? AND occurredAt <= ?
      GROUP BY bucketKey
    `;
    const bucketRows = this.db.prepare(bucketQuery).all(since, until) as any[];
    const bucketMap = new Map<string, any>();
    for (const r of bucketRows) {
      bucketMap.set(r.bucketKey, r);
    }

    for (const b of buckets) {
      const match = bucketMap.get(b.key);
      if (match) {
        b.requests = Number(match.requests) || 0;
        b.tokens = Number(match.tokens) || 0;
        b.input = Number(match.input) || 0;
        b.output = Number(match.output) || 0;
        b.cached = Number(match.cached) || 0;
        b.costUsd = Math.round((Number(match.costUsd) || 0) * 1000) / 1000;
      }
    }

    const summary = this.getSummary({ since, until });
    const prevSummary = this.getSummary({
      since: prevStart.toISOString(),
      until: prevEnd.toISOString(),
    });

    let tokenDeltaPercent: number | undefined;
    if (prevSummary.totalTokens > 0) {
      tokenDeltaPercent =
        Math.round(
          ((summary.totalTokens - prevSummary.totalTokens) / prevSummary.totalTokens) * 1000
        ) / 10;
    }
    let costDeltaPercent: number | undefined;
    if (prevSummary.totalCostUsd > 0) {
      costDeltaPercent =
        Math.round(
          ((summary.totalCostUsd - prevSummary.totalCostUsd) / prevSummary.totalCostUsd) * 1000
        ) / 10;
    }

    const harnesses = this.getHarnessSummaries({ since, until });
    const models = this.getModelSummaries({ limit: 10, since, until });
    const projects = this.getProjectSummaries({ limit: 10, since, until });
    const funMetrics = computeFunMetrics(summary);

    return {
      buckets,
      costDeltaPercent,
      funMetrics,
      harnesses,
      label,
      models,
      offset,
      prevLabel,
      prevSummary,
      projects,
      rangeLabel,
      since,
      summary,
      tokenDeltaPercent,
      type,
      until,
    };
  }

  public getRecentEvents(options?: {
    limit?: number;
    harness?: string;
    since?: string;
  }): TelemetryEvent[] {
    const conditions: string[] = ["type = 'usage'"];
    const params: any[] = [];

    if (options?.harness) {
      conditions.push("harness = ?");
      params.push(options.harness);
    }
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }

    const limit = options?.limit ?? 50;
    const where = `WHERE ${conditions.join(" AND ")}`;
    const query = `
      SELECT * FROM events
      ${where}
      ORDER BY occurredAt DESC
      LIMIT ?
    `;

    params.push(limit);
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      eventId: r.eventId,
      type: r.type,
      occurredAt: r.occurredAt,
      observedAt: r.observedAt,
      harness: r.harness,
      harnessVersion: r.harnessVersion || undefined,
      sessionId: r.sessionId,
      project: r.projectName
        ? {
            name: r.projectName,
            dirHash: r.projectDirHash || "",
            gitBranch: r.gitBranch || undefined,
            repo: r.repo || undefined,
          }
        : undefined,
      model: {
        raw: r.modelRaw,
        name: r.modelName,
        family: r.modelFamily,
        provider: r.modelProvider,
      },
      tokens: {
        input: Number(r.tokensInput),
        output: Number(r.tokensOutput),
        cacheRead: Number(r.tokensCacheRead),
        cacheWrite: Number(r.tokensCacheWrite),
        reasoning: Number(r.tokensReasoning),
        total: Number(r.tokensTotal),
      },
      costUsd: Number(r.costUsd),
      costSavingsUsd: Number(r.costSavingsUsd),
      native: r.nativeRequestId ? { requestId: r.nativeRequestId } : undefined,
    }));
  }

  public getCursor<T>(key: string): T | null {
    const row = this.db
      .prepare("SELECT value FROM cursors WHERE key = ?")
      .get(key) as any;
    if (!row?.value) {
      return null;
    }
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  public setCursor(key: string, value: unknown): void {
    const stmt = this.db.prepare(`
      INSERT INTO cursors (key, value, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
    `);
    stmt.run(key, JSON.stringify(value), new Date().toISOString());
  }

  public getAllCursors(): Map<string, any> {
    const map = new Map<string, any>();
    const rows = this.db.prepare("SELECT key, value FROM cursors").all() as any[];
    for (const r of rows) {
      try {
        map.set(r.key, JSON.parse(r.value));
      } catch {
        // Skip malformed
      }
    }
    return map;
  }

  public saveCursorsBatch(entries: [string, any][]): void {
    if (entries.length === 0) return;
    const stmt = this.db.prepare(`
      INSERT INTO cursors (key, value, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
    `);
    const now = new Date().toISOString();
    this.db.exec("BEGIN TRANSACTION;");
    try {
      for (const [k, v] of entries) {
        stmt.run(k, JSON.stringify(v), now);
      }
      this.db.exec("COMMIT;");
    } catch (e) {
      this.db.exec("ROLLBACK;");
      throw e;
    }
  }

  public close(): void {
    this.db.close();
  }
}

let defaultDb: ReporterDatabase | null = null;

export function getDatabase(): ReporterDatabase {
  if (!defaultDb) {
    defaultDb = new ReporterDatabase();
  }
  return defaultDb;
}

export function getISOWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

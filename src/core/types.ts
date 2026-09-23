import type { HarnessId, RawEvent, TelemetryEvent } from "./schema";

export interface CursorStore {
  get(key: string): any;
  set(key: string, value: any): void;
  save(): void;
  reload?(): void;
}

export type CollectorContext = {
  cursors: CursorStore;
  log: (message: string) => void;
  since?: number;
};

export interface Collector {
  id: HarnessId;
  name: string;
  discover(): Promise<string[]>;
  collect(ctx: CollectorContext): AsyncIterable<RawEvent>;
  prepare?(log: (message: string) => void): Promise<void>;
}

export type UsageSummary = {
  totalRequests: number;
  totalSessions: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
  totalCostUsd: number;
  totalCostSavingsUsd: number;
  firstEventAt?: string;
  lastEventAt?: string;
};

export type HarnessSummary = {
  harness: HarnessId;
  requests: number;
  tokens: number;
  input: number;
  output: number;
  cached: number;
  costUsd: number;
  costSavingsUsd: number;
  lastEventAt?: string;
};

export type ModelSummary = {
  modelName: string;
  modelFamily: string;
  requests: number;
  tokens: number;
  input: number;
  output: number;
  cached: number;
  costUsd: number;
};

export type ProjectSummary = {
  projectName: string;
  requests: number;
  tokens: number;
  costUsd: number;
  lastEventAt?: string;
};

export type DailyUsage = {
  day: string; // YYYY-MM-DD
  requests: number;
  tokens: number;
  input: number;
  output: number;
  cached: number;
  costUsd: number;
};

export type { FunMetrics } from "./fun-metrics";

export type PeriodType = "week" | "month" | "year";

export type PeriodBucket = {
  key: string;         // '2026-09-21' or '2026-09'
  label: string;       // 'Mon 21' or 'Sep 2026'
  subLabel?: string;   // e.g. day of week or month name
  tokens: number;
  input: number;
  output: number;
  cached: number;
  costUsd: number;
  requests: number;
};

export type PeriodStats = {
  type: PeriodType;
  offset: number;
  label: string;             // e.g. "Week 39 · Sep 21 – Sep 27, 2026"
  rangeLabel: string;        // e.g. "2026-09-21 → 2026-09-27"
  since: string;             // ISO timestamp string
  until: string;             // ISO timestamp string
  summary: UsageSummary;
  prevSummary?: UsageSummary;
  prevLabel?: string;
  tokenDeltaPercent?: number; // e.g. +15.4 or -8.2
  costDeltaPercent?: number;  // e.g. +22.1
  buckets: PeriodBucket[];
  harnesses: HarnessSummary[];
  models: ModelSummary[];
  projects: ProjectSummary[];
  funMetrics: import("./fun-metrics").FunMetrics;
};

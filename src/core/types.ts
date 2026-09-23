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

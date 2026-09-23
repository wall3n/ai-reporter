import { calculateCost } from "./pricing";
import type { ProjectRef } from "./project";

export const HARNESSES = [
  "antigravity",
  "claude-code",
  "cursor",
  "opencode",
  "copilot",
  "gemini-cli",
  "codex",
  "cline",
  "kilo-code",
  "pi",
  "omp",
  "qwen-code",
  "devin",
] as const;

export type HarnessId = (typeof HARNESSES)[number];

export const MODEL_FAMILIES = [
  "claude",
  "gpt",
  "gemini",
  "qwen",
  "deepseek",
  "mistral",
  "other",
] as const;

export type ModelFamily = (typeof MODEL_FAMILIES)[number];

export type CanonicalModel = {
  raw: string;
  name: string;
  family: ModelFamily;
  provider: string;
};

export type TokenCounts = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  reasoning?: number;
};

export type TelemetryEvent = {
  eventId: string;
  type: "usage" | "session.start" | "session.end";
  occurredAt: string; // ISO string
  observedAt: string; // ISO string
  harness: HarnessId;
  harnessVersion?: string;
  sessionId: string;
  project?: ProjectRef;
  model: CanonicalModel;
  tokens: TokenCounts & { total: number };
  costUsd: number;
  costSavingsUsd: number;
  native?: {
    requestId?: string;
    costUsd?: number;
  };
};

export type RawEvent = {
  eventId: string;
  type: "usage" | "session.start" | "session.end";
  occurredAt: string;
  harness: HarnessId;
  harnessVersion?: string;
  sessionId: string;
  project?: ProjectRef;
  model?: {
    raw: string;
    family?: ModelFamily;
    provider?: string;
  };
  tokens?: TokenCounts;
  costUsd?: number;
  native?: {
    requestId?: string;
  };
};

export function eventId(
  harness: HarnessId,
  sessionId: string,
  nativeId: string | number
): string {
  return `${harness}:${sessionId}:${nativeId}`;
}

const OPENAI_PATTERN = /\bgpt|o[1-9]-|codex|openai/;

export function modelFamily(raw: string): ModelFamily {
  const model = raw.toLowerCase();
  if (model.includes("claude")) {
    return "claude";
  }
  if (OPENAI_PATTERN.test(model)) {
    return "gpt";
  }
  if (model.includes("gemini")) {
    return "gemini";
  }
  if (model.includes("deepseek")) {
    return "deepseek";
  }
  if (model.includes("qwen")) {
    return "qwen";
  }
  if (model.includes("mistral") || model.includes("codestral")) {
    return "mistral";
  }
  return "other";
}

const CLOUD_PREFIX = /^(?:[a-z]{2,4}\.)?(?:anthropic|amazon|meta|mistral|cohere)\./;
const VARIANT_SUFFIX = /[:@].*$/;
const DATE_SUFFIX = /-(?:\d{8}|\d{4}-\d{2}-\d{2})$/;
const REVISION_SUFFIX = /-v\d+$/;
const VERSION_DOT = /(\d)\.(?=\d)/g;

export function modelName(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const name = lower
    .slice(lower.lastIndexOf("/") + 1)
    .replace(VARIANT_SUFFIX, "")
    .replace(CLOUD_PREFIX, "")
    .replace(REVISION_SUFFIX, "")
    .replace(DATE_SUFFIX, "")
    .replaceAll(VERSION_DOT, "$1-");
  return name || lower || "unknown";
}

const FAMILY_PROVIDER: Record<ModelFamily, string> = {
  claude: "anthropic",
  gemini: "google",
  gpt: "openai",
  deepseek: "deepseek",
  qwen: "alibaba",
  mistral: "mistral",
  other: "unknown",
};

const PROVIDER_ALIASES: Record<string, string> = {
  "alibaba-cloud": "alibaba",
  "claude-code": "anthropic",
  dashscope: "alibaba",
  gemini: "google",
  "openai-codex": "openai",
  "openai-native": "openai",
  qwen: "alibaba",
  "vertex-ai": "vertex",
};

export function modelProvider(
  reported: string | undefined,
  family: ModelFamily
): string {
  const slug = reported?.trim().toLowerCase().replaceAll(/[\s_]+/g, "-");
  if (!slug) {
    return FAMILY_PROVIDER[family];
  }
  return PROVIDER_ALIASES[slug] ?? slug;
}

export function canonicalModel(
  raw: string,
  reportedProvider?: string
): CanonicalModel {
  const family = modelFamily(raw);
  return {
    family,
    name: modelName(raw),
    provider: modelProvider(reportedProvider, family),
    raw,
  };
}

export function totalTokens(tokens: TokenCounts): number {
  return (
    (tokens.input || 0) +
    (tokens.output || 0) +
    (tokens.cacheRead || 0) +
    (tokens.cacheWrite || 0)
  );
}

export function outputWithReasoning(input: {
  output: number;
  prompt?: number;
  reasoning: number;
  separateByDefault?: boolean;
  total?: number;
}): number {
  if (input.total !== undefined && input.prompt !== undefined) {
    return Math.max(
      input.output,
      input.total - input.prompt
    );
  }
  return input.separateByDefault
    ? input.output + input.reasoning
    : input.output;
}

export function canonicalize(raw: RawEvent, observedAt = new Date()): TelemetryEvent {
  const model = raw.model
    ? canonicalModel(raw.model.raw, raw.model.provider)
    : {
        family: "other" as const,
        name: "unknown",
        provider: "unknown",
        raw: "unknown",
      };

  const tokens = raw.tokens ?? {
    cacheRead: 0,
    cacheWrite: 0,
    input: 0,
    output: 0,
  };

  const total = totalTokens(tokens);
  const cost = calculateCost(
    {
      input: tokens.input,
      output: tokens.output,
      cacheRead: tokens.cacheRead,
      cacheWrite: tokens.cacheWrite,
    },
    model.name,
    model.family,
    raw.costUsd
  );

  return {
    eventId: raw.eventId,
    type: raw.type,
    occurredAt: raw.occurredAt,
    observedAt: observedAt.toISOString(),
    harness: raw.harness,
    harnessVersion: raw.harnessVersion,
    sessionId: raw.sessionId,
    project: raw.project,
    model,
    tokens: {
      ...tokens,
      total,
    },
    costUsd: cost.costUsd,
    costSavingsUsd: cost.costSavingsUsd,
    native: {
      ...(raw.native?.requestId ? { requestId: raw.native.requestId } : {}),
      ...(raw.costUsd !== undefined ? { costUsd: raw.costUsd } : {}),
    },
  };
}

export function validateEvent(event: TelemetryEvent): string[] {
  const issues: string[] = [];
  if (!event.eventId) {
    issues.push("missing eventId");
  }
  if (!event.occurredAt || Number.isNaN(Date.parse(event.occurredAt))) {
    issues.push("invalid occurredAt");
  }
  if (!HARNESSES.includes(event.harness)) {
    issues.push(`unrecognized harness: ${event.harness}`);
  }
  if (event.tokens) {
    for (const [k, v] of Object.entries(event.tokens)) {
      if (typeof v === "number" && (v < 0 || !Number.isFinite(v))) {
        issues.push(`invalid token count for ${k}: ${v}`);
      }
    }
  }
  return issues;
}

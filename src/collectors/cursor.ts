import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { ensureDir, readJsonFile, stateDir, writeFileAtomic } from "../core/config";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const CURSOR = "cursor" as const;

type CursorHookRecord = {
  cache_read_tokens?: unknown;
  cache_write_tokens?: unknown;
  conversation_id?: unknown;
  cursor_version?: unknown;
  generation_id?: unknown;
  input_tokens?: unknown;
  model?: unknown;
  occurred_at?: unknown;
  output_tokens?: unknown;
  workspace_roots?: unknown;
};

type HooksConfig = {
  hooks?: Record<string, unknown>;
  version?: number;
  [key: string]: unknown;
};

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function token(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function cursorHome(): string {
  return process.env.CURSOR_HOME?.trim() || join(homedir(), ".cursor");
}

export function cursorEventPath(): string {
  return join(stateDir(), "cursor-events.jsonl");
}

export function cursorHookCommand(): string {
  return "ai-reporter _cursor-hook";
}

export function recordCursorHook(
  value: unknown,
  path = cursorEventPath(),
  now = Date.now()
): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const input = value as CursorHookRecord;
  const conversationId = nonEmpty(input.conversation_id);
  const generationId = nonEmpty(input.generation_id);
  const model = nonEmpty(input.model);
  if (!(conversationId && generationId && model)) {
    return false;
  }
  const record = {
    cache_read_tokens: token(input.cache_read_tokens),
    cache_write_tokens: token(input.cache_write_tokens),
    conversation_id: conversationId,
    ...(nonEmpty(input.cursor_version)
      ? { cursor_version: nonEmpty(input.cursor_version) }
      : {}),
    generation_id: generationId,
    input_tokens: token(input.input_tokens),
    model,
    occurred_at: new Date(now).toISOString(),
    output_tokens: token(input.output_tokens),
    workspace_roots: Array.isArray(input.workspace_roots)
      ? input.workspace_roots.filter(
          (root): root is string => typeof root === "string" && root.length > 0
        )
      : [],
  };
  if (
    record.input_tokens +
      record.output_tokens +
      record.cache_read_tokens +
      record.cache_write_tokens ===
    0
  ) {
    return false;
  }
  ensureDir(dirname(path), 0o700);
  appendFileSync(path, `${JSON.stringify(record)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  return true;
}

export function normalizeCursorHook(value: unknown): RawEvent | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const row = value as CursorHookRecord;
  const sessionId = nonEmpty(row.conversation_id);
  const nativeId = nonEmpty(row.generation_id);
  const model = nonEmpty(row.model);
  const occurredAt = nonEmpty(row.occurred_at);
  if (!(sessionId && nativeId && model && occurredAt)) {
    return null;
  }
  const roots = Array.isArray(row.workspace_roots)
    ? row.workspace_roots.filter(
        (root): root is string => typeof root === "string" && root.length > 0
      )
    : [];
  return {
    eventId: eventId(CURSOR, sessionId, nativeId),
    harness: CURSOR,
    harnessVersion: nonEmpty(row.cursor_version),
    model: { family: modelFamily(model), provider: "cursor", raw: model },
    occurredAt,
    project: projectRef(roots[0]),
    sessionId,
    tokens: {
      cacheRead: token(row.cache_read_tokens),
      cacheWrite: token(row.cache_write_tokens),
      input: token(row.input_tokens),
      output: token(row.output_tokens),
    },
    type: "usage",
  };
}

export function installCursorHooks(home = cursorHome()): "installed" | "unchanged" | "error" {
  const hooksPath = join(home, "hooks.json");
  let config: HooksConfig = {};
  if (existsSync(hooksPath)) {
    try {
      config = JSON.parse(readFileSync(hooksPath, "utf8")) as HooksConfig;
    } catch {
      return "error";
    }
  }

  const cmd = cursorHookCommand();
  const hooks = (config.hooks ?? {}) as Record<string, unknown>;

  const hookPayload = [{ command: cmd }];
  let changed = false;

  for (const hookName of ["afterAgentResponse", "stop"]) {
    const existing = hooks[hookName];
    if (JSON.stringify(existing) !== JSON.stringify(hookPayload)) {
      hooks[hookName] = hookPayload;
      changed = true;
    }
  }

  if (changed) {
    ensureDir(home);
    writeFileAtomic(
      hooksPath,
      `${JSON.stringify({ ...config, hooks, version: 1 }, null, 2)}\n`
    );
    return "installed";
  }
  return "unchanged";
}

export async function* collectCursor(
  eventPath = cursorEventPath(),
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  if (!existsSync(eventPath)) {
    return;
  }
  let result;
  try {
    result = tailJsonl(eventPath, ctx.cursors);
  } catch (error) {
    ctx.log(`cursor: cannot tail ${eventPath}: ${String(error)}`);
    return;
  }
  for (const line of result.lines) {
    const row = parseJsonLine(line);
    const event = normalizeCursorHook(row);
    if (!event) {
      continue;
    }
    if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
      continue;
    }
    yield event;
  }
  ctx.cursors.set(eventPath, result.cursor);
}

export const cursorCollector: Collector = {
  id: CURSOR,
  name: "Cursor",
  discover: () => {
    const home = cursorHome();
    const eventLog = cursorEventPath();
    const found = existsSync(home) || existsSync(eventLog);
    return Promise.resolve(found ? [home] : []);
  },
  prepare: async (log) => {
    if (existsSync(cursorHome())) {
      try {
        const res = installCursorHooks();
        if (res === "installed") {
          log("cursor: installed afterAgentResponse and stop hooks in ~/.cursor/hooks.json");
        }
      } catch (e) {
        log(`cursor: hook setup warning: ${String(e)}`);
      }
    }
  },
  collect: (ctx) => collectCursor(cursorEventPath(), ctx),
};

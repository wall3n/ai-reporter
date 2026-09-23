import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const CODEX = "codex" as const;

type CodexLine = {
  type?: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export function codexHome(): string {
  return process.env.CODEX_HOME?.trim() || join(homedir(), ".codex");
}

function listCodexRollouts(home = codexHome()): string[] {
  const sessions = join(home, "sessions");
  if (!existsSync(sessions)) {
    return [];
  }
  const files: string[] = [];
  const walk = (dir: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.startsWith("rollout-") && entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(sessions);
  return files;
}

export function normalizeCodexLine(
  row: unknown,
  lineIndex: number,
  sessionMeta: { sessionId?: string; cwd?: string; model?: string; version?: string }
): RawEvent | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const line = row as CodexLine;
  if (line.type === "session_meta" && line.payload) {
    if (typeof line.payload.session_id === "string") {
      sessionMeta.sessionId = line.payload.session_id;
    }
    if (typeof line.payload.cwd === "string") {
      sessionMeta.cwd = line.payload.cwd;
    }
    if (typeof line.payload.cli_version === "string") {
      sessionMeta.version = line.payload.cli_version;
    }
    return null;
  }
  if (line.type === "turn_context" && line.payload) {
    if (typeof line.payload.model === "string") {
      sessionMeta.model = line.payload.model;
    }
    return null;
  }
  if (line.type !== "event_msg" || !line.payload || line.payload.type !== "token_count") {
    return null;
  }

  const payload = line.payload;
  const lastUsage = (payload.last_token_usage || {}) as Record<string, unknown>;
  const inputTotal = typeof lastUsage.input_tokens === "number" ? lastUsage.input_tokens : 0;
  const cachedInput = typeof lastUsage.cached_input_tokens === "number" ? lastUsage.cached_input_tokens : 0;
  const input = Math.max(0, inputTotal - cachedInput);
  const output = typeof payload.output_tokens === "number" ? payload.output_tokens : 0;
  const cacheWrite = typeof lastUsage.cache_write_input_tokens === "number" ? lastUsage.cache_write_input_tokens : 0;
  const reasoning = typeof payload.reasoning_output_tokens === "number" ? payload.reasoning_output_tokens : 0;

  if (input + output + cachedInput + cacheWrite === 0) {
    return null;
  }

  const occurredAt = line.timestamp ? new Date(line.timestamp).toISOString() : new Date().toISOString();
  const sessionId = sessionMeta.sessionId || "unknown-codex";
  const model = sessionMeta.model || "codex";

  return {
    eventId: eventId(CODEX, sessionId, lineIndex),
    harness: CODEX,
    harnessVersion: sessionMeta.version,
    model: { family: modelFamily(model), provider: "openai", raw: model },
    occurredAt,
    project: projectRef(sessionMeta.cwd),
    sessionId,
    tokens: {
      cacheRead: cachedInput,
      cacheWrite,
      input,
      output,
      ...(reasoning > 0 ? { reasoning } : {}),
    },
    type: "usage",
  };
}

export async function* collectCodex(
  files: string[],
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  for (const path of files) {
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    const sessionMeta = {
      sessionId: previous?.sessionId,
      cwd: previous?.cwd,
      model: previous?.model,
      version: previous?.version,
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`codex: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    let idx = previous?.lastLineIdx || 0;
    for (const line of result.lines) {
      idx++;
      const row = parseJsonLine(line);
      const event = normalizeCodexLine(row, idx, sessionMeta);
      if (!event) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      yield event;
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      lastLineIdx: idx,
      sessionId: sessionMeta.sessionId,
      cwd: sessionMeta.cwd,
      model: sessionMeta.model,
      version: sessionMeta.version,
    });
  }
}

export const codexCollector: Collector = {
  id: CODEX,
  name: "Codex",
  discover: () => {
    const files = listCodexRollouts();
    return Promise.resolve(files.length > 0 ? [codexHome()] : []);
  },
  collect: (ctx) => collectCodex(listCodexRollouts(), ctx),
};

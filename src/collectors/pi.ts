import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const PI = "pi" as const;
export const OMP = "omp" as const;
type PiHarness = typeof PI | typeof OMP;
type SessionState = { sessionId?: string; project?: RawEvent["project"] };

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function count(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}

export function normalizePi(
  value: unknown,
  state: SessionState,
  harness: PiHarness
): RawEvent | null {
  const entry = record(value);
  if (!entry) {
    return null;
  }
  if (entry.type === "session") {
    state.sessionId = typeof entry.id === "string" ? entry.id : undefined;
    state.project = projectRef(
      typeof entry.cwd === "string" ? entry.cwd : undefined
    );
    return null;
  }
  const message = record(entry.message);
  const usage = record(message?.usage);
  if (
    entry.type !== "message" ||
    typeof entry.id !== "string" ||
    !entry.id ||
    typeof entry.timestamp !== "string" ||
    !state.sessionId ||
    message?.role !== "assistant" ||
    typeof message.model !== "string" ||
    !message.model ||
    !usage
  ) {
    return null;
  }
  const occurred = Date.parse(entry.timestamp);
  const input = count(usage.input);
  const output = count(usage.output);
  const cacheRead = count(usage.cacheRead);
  const cacheWrite = count(usage.cacheWrite);
  if (
    Number.isNaN(occurred) ||
    input === undefined ||
    output === undefined ||
    cacheRead === undefined ||
    cacheWrite === undefined ||
    input + output + cacheRead + cacheWrite === 0
  ) {
    return null;
  }
  const reasoning = count(
    harness === PI ? usage.reasoning : usage.reasoningTokens
  );
  const cost = record(usage.cost)?.total;
  return {
    costUsd:
      typeof cost === "number" && Number.isFinite(cost) && cost >= 0
        ? cost
        : undefined,
    eventId: eventId(harness, state.sessionId, entry.id),
    harness,
    model: {
      family: modelFamily(message.model),
      provider:
        typeof message.provider === "string" ? message.provider : undefined,
      raw: message.model,
    },
    occurredAt: new Date(occurred).toISOString(),
    project: state.project,
    sessionId: state.sessionId,
    tokens: {
      cacheRead,
      cacheWrite,
      input,
      output,
      ...(reasoning !== undefined ? { reasoning } : {}),
    },
    type: "usage",
  };
}

function listSessions(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  const walk = (d: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(d, e);
      let s;
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(full);
      } else if (e.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(dir);
  return files;
}

export async function* collectPiLike(
  harness: PiHarness,
  sessionsDir: string,
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  const files = listSessions(sessionsDir);
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
    const state: SessionState = {
      project: previous?.project,
      sessionId: previous?.sessionId,
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`${harness}: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizePi(row, state, harness);
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
      project: state.project,
      sessionId: state.sessionId,
    });
  }
}

export function piSessionsDir(home = homedir()): string {
  return join(home, ".pi", "agent", "sessions");
}

export function ompSessionsDir(home = homedir()): string {
  return join(home, ".omp", "agent", "sessions");
}

export const piCollector: Collector = {
  id: PI,
  name: "Pi",
  discover: () => {
    const d = piSessionsDir();
    return Promise.resolve(existsSync(d) ? [d] : []);
  },
  collect: (ctx) => collectPiLike(PI, piSessionsDir(), ctx),
};

export const ompCollector: Collector = {
  id: OMP,
  name: "Oh My Pi",
  discover: () => {
    const d = ompSessionsDir();
    return Promise.resolve(existsSync(d) ? [d] : []);
  },
  collect: (ctx) => collectPiLike(OMP, ompSessionsDir(), ctx),
};

import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const COPILOT = "copilot" as const;

type CopilotUsage = {
  cacheReadTokens: number;
  cacheWriteTokens: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
};

type CopilotState = {
  cliVersion?: string;
  cwd?: string;
  gitBranch?: string;
  previous: Record<string, CopilotUsage>;
  sessionId: string;
};

type CopilotLine = {
  data?: Record<string, unknown>;
  id?: unknown;
  timestamp?: unknown;
  type?: unknown;
};

const EVENTS_FILE = "events.jsonl";

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function usage(value: unknown): CopilotUsage | undefined {
  const row = record(value);
  if (!row) {
    return;
  }
  return {
    cacheReadTokens: count(row.cacheReadTokens),
    cacheWriteTokens: count(row.cacheWriteTokens),
    inputTokens: count(row.inputTokens),
    outputTokens: count(row.outputTokens),
    reasoningTokens: count(row.reasoningTokens),
  };
}

function delta(
  current: CopilotUsage,
  previous: CopilotUsage | undefined
): CopilotUsage {
  const subtract = (next: number, prior: number | undefined): number =>
    prior === undefined || next < prior ? next : next - prior;
  return {
    cacheReadTokens: subtract(
      current.cacheReadTokens,
      previous?.cacheReadTokens
    ),
    cacheWriteTokens: subtract(
      current.cacheWriteTokens,
      previous?.cacheWriteTokens
    ),
    inputTokens: subtract(current.inputTokens, previous?.inputTokens),
    outputTokens: subtract(current.outputTokens, previous?.outputTokens),
    reasoningTokens: subtract(
      current.reasoningTokens,
      previous?.reasoningTokens
    ),
  };
}

export function copilotHome(): string {
  return process.env.COPILOT_HOME?.trim() || join(homedir(), ".copilot");
}

export function initialCopilotState(path: string): CopilotState {
  return {
    previous: {},
    sessionId: basename(dirname(path)),
  };
}

export function updateCopilotState(
  state: CopilotState,
  entry: CopilotLine
): RawEvent[] {
  const data = record(entry.data);
  if (entry.type === "session.start") {
    state.sessionId = text(data?.sessionId) ?? state.sessionId;
    state.cliVersion = text(data?.copilotVersion) ?? state.cliVersion;
    state.cwd = text(data?.contextCwd) ?? state.cwd;
    state.gitBranch = text(data?.gitBranch) ?? state.gitBranch;
    return [];
  }
  if (entry.type !== "session.shutdown") {
    return [];
  }
  const occurredAt = text(entry.timestamp);
  const nativeId = text(entry.id);
  const metrics = record(data?.modelMetrics);
  if (!(occurredAt && nativeId && metrics)) {
    return [];
  }
  const models = Object.keys(metrics).sort();
  const events: RawEvent[] = [];
  for (const [index, model] of models.entries()) {
    const rawUsage = usage(metrics[model]);
    if (!rawUsage) {
      continue;
    }
    const diff = delta(rawUsage, state.previous[model]);
    state.previous[model] = rawUsage;
    const cacheRead = diff.cacheReadTokens;
    const cacheWrite = diff.cacheWriteTokens;
    const input = Math.max(0, diff.inputTokens - cacheRead - cacheWrite);
    const output = diff.outputTokens;
    if (input + output + cacheRead + cacheWrite === 0) {
      continue;
    }
    events.push({
      eventId: eventId(
        COPILOT,
        state.sessionId,
        models.length === 1 ? nativeId : `${nativeId}:${index}`
      ),
      harness: COPILOT,
      harnessVersion: state.cliVersion,
      model: { family: modelFamily(model), provider: "github", raw: model },
      occurredAt,
      project: projectRef(state.cwd, state.gitBranch),
      sessionId: state.sessionId,
      tokens: {
        cacheRead,
        cacheWrite,
        input,
        output,
        ...(diff.reasoningTokens > 0
          ? { reasoning: diff.reasoningTokens }
          : {}),
      },
      type: "usage",
    });
  }
  return events;
}

export function listCopilotSessions(home = copilotHome()): string[] {
  const root = join(home, "session-state");
  if (!existsSync(root)) {
    return [];
  }
  let dirs: string[];
  try {
    dirs = readdirSync(root);
  } catch {
    return [];
  }
  return dirs
    .map((name) => join(root, name, EVENTS_FILE))
    .filter((path) => existsSync(path));
}

export async function* collectCopilot(
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
    const state: CopilotState =
      previous?.copilotState ?? initialCopilotState(path);
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`copilot: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    const announced = new Set(result.cursor.seenSessions || []);
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const parsed = record(row) as CopilotLine | undefined;
      if (!parsed) {
        continue;
      }
      for (const event of updateCopilotState(state, parsed)) {
        if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
          continue;
        }
        if (!announced.has(event.sessionId)) {
          announced.add(event.sessionId);
          yield {
            eventId: eventId(COPILOT, event.sessionId, "start"),
            harness: COPILOT,
            occurredAt: event.occurredAt,
            project: event.project,
            sessionId: event.sessionId,
            type: "session.start",
          };
        }
        yield event;
      }
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      copilotState: state,
      seenSessions: [...announced],
    });
  }
}

export const copilotCollector: Collector = {
  id: COPILOT,
  name: "GitHub Copilot",
  discover: () => {
    const files = listCopilotSessions();
    return Promise.resolve(files.length > 0 ? [copilotHome()] : []);
  },
  collect: (ctx) => collectCopilot(listCopilotSessions(), ctx),
};

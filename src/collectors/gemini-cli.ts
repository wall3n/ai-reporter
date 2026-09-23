import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily, outputWithReasoning } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const GEMINI_CLI = "gemini-cli" as const;

type MetadataLine = {
  sessionId: string;
  projectHash?: string;
  startTime?: string;
  kind?: string;
  directories?: string[];
};

type MessageLine = {
  id: string;
  timestamp: string;
  type: string;
  model?: string;
  tokens?: {
    input?: number;
    output?: number;
    cached?: number;
    thoughts?: number;
    tool?: number;
    total?: number;
  } | null;
};

const JSONL_EXTENSION = /\.jsonl$/;
const SESSION_FILE_NAME = /^session-.*-([A-Za-z0-9_-]{8})$/;

export type GeminiState = {
  sessionId?: string;
  cwd?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMetadata(value: unknown): value is MetadataLine {
  return (
    isRecord(value) &&
    typeof value.sessionId === "string" &&
    value.id === undefined
  );
}

function isMessage(value: unknown): value is MessageLine {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.type === "string"
  );
}

export function sessionIdFromName(path: string): string {
  const name = basename(path).replace(JSONL_EXTENSION, "");
  const match = SESSION_FILE_NAME.exec(name);
  return match?.[1] ?? name;
}

function count(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : 0;
}

export function normalizeGeminiCli(
  value: unknown,
  state: GeminiState,
  fallbackSessionId: string
): RawEvent | null {
  if (isMetadata(value)) {
    state.sessionId = value.sessionId;
    const dir = value.directories?.find((d) => typeof d === "string");
    if (dir) {
      state.cwd = dir;
    }
    return null;
  }
  if (!isMessage(value) || value.type !== "gemini" || !value.tokens) {
    return null;
  }
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const prompt = count(value.tokens.input);
  const cacheRead = count(value.tokens.cached);
  const input = Math.max(0, prompt - cacheRead);
  const reasoning = count(value.tokens.thoughts);
  const output = outputWithReasoning({
    output: count(value.tokens.output),
    prompt,
    reasoning,
    separateByDefault: true,
    total: value.tokens.total === undefined ? undefined : count(value.tokens.total),
  });
  if (input + output + cacheRead === 0) {
    return null;
  }
  const model = value.model ?? "unknown";
  const sessionId = state.sessionId ?? fallbackSessionId;
  return {
    eventId: eventId(GEMINI_CLI, sessionId, value.id),
    harness: GEMINI_CLI,
    model: { family: modelFamily(model), provider: "google", raw: model },
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(state.cwd),
    sessionId,
    tokens: {
      cacheRead,
      cacheWrite: 0,
      input,
      output,
      ...(reasoning > 0 ? { reasoning } : {}),
    },
    type: "usage",
  };
}

export function geminiCliHome(): string {
  return process.env.GEMINI_CLI_HOME?.trim() || join(homedir(), ".gemini");
}

function listGeminiChats(home = geminiCliHome()): string[] {
  const tmp = join(home, "tmp");
  if (!existsSync(tmp)) {
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
      } else if (entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(tmp);
  return files;
}

export async function* collectGeminiCli(
  files: string[],
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  const seenEvents = new Set<string>();
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
    const fallbackId = sessionIdFromName(path);
    const state: GeminiState = {
      cwd: previous?.geminiCwd,
      sessionId: previous?.geminiSessionId,
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`gemini-cli: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    const announced = new Set(result.cursor.seenSessions || []);
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizeGeminiCli(row, state, fallbackId);
      if (!event || seenEvents.has(event.eventId)) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      seenEvents.add(event.eventId);
      if (!announced.has(event.sessionId)) {
        announced.add(event.sessionId);
        yield {
          eventId: eventId(GEMINI_CLI, event.sessionId, "start"),
          harness: GEMINI_CLI,
          occurredAt: event.occurredAt,
          project: event.project,
          sessionId: event.sessionId,
          type: "session.start",
        };
      }
      yield event;
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      geminiCwd: state.cwd,
      geminiSessionId: state.sessionId,
      seenSessions: [...announced],
    });
  }
}

export const geminiCliCollector: Collector = {
  id: GEMINI_CLI,
  name: "Gemini CLI",
  discover: () => {
    const files = listGeminiChats();
    return Promise.resolve(files.length > 0 ? [geminiCliHome()] : []);
  },
  collect: (ctx) => collectGeminiCli(listGeminiChats(), ctx),
};

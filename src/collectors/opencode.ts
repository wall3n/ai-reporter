import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { HarnessId, RawEvent } from "../core/schema";
import { eventId, modelFamily, outputWithReasoning } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { lastWriteMs, openReadOnly } from "./sqlite";

export const OPENCODE = "opencode" as const;

type MessageData = {
  role?: string;
  modelID?: string;
  providerID?: string;
  cost?: number;
  path?: { cwd?: string };
  tokens?: {
    input?: number;
    output?: number;
    reasoning?: number;
    total?: number;
    cache?: { read?: number; write?: number };
  };
  time?: { created?: number; completed?: number };
};

export type MessageRow = {
  id: string;
  session_id: string;
  time_updated: number;
  data: string;
};

export function normalizeOpenCode(
  row: MessageRow,
  harness: HarnessId = OPENCODE
): RawEvent | null {
  let data: MessageData;
  try {
    data = JSON.parse(row.data) as MessageData;
  } catch {
    return null;
  }
  if (data.role !== "assistant" || !data.tokens || !data.time?.completed) {
    return null;
  }
  const model = data.modelID ?? "unknown";
  const cacheRead = data.tokens.cache?.read ?? 0;
  const cacheWrite = data.tokens.cache?.write ?? 0;
  const input = data.tokens.input ?? 0;
  const output = outputWithReasoning({
    output: data.tokens.output ?? 0,
    prompt: input + cacheRead + cacheWrite,
    reasoning: data.tokens.reasoning ?? 0,
    separateByDefault: true,
    total: data.tokens.total ?? 0,
  });
  return {
    eventId: eventId(harness, row.session_id, row.id),
    harness,
    model: {
      family: modelFamily(model),
      provider: data.providerID,
      raw: model,
    },
    occurredAt: new Date(data.time.completed).toISOString(),
    project: projectRef(data.path?.cwd),
    sessionId: row.session_id,
    tokens: {
      cacheRead,
      cacheWrite,
      input,
      output,
      ...(data.tokens.reasoning === undefined
        ? {}
        : { reasoning: data.tokens.reasoning }),
    },
    type: "usage",
    ...(typeof data.cost === "number" && data.cost > 0
      ? { costUsd: data.cost }
      : {}),
  };
}

export function openCodeDbPath(): string {
  const data =
    process.env.XDG_DATA_HOME?.trim() || join(homedir(), ".local", "share");
  return join(data, "opencode", "opencode.db");
}

export async function* collectOpenCodeFromDb(
  path: string,
  ctx: CollectorContext,
  harness: HarnessId = OPENCODE
): AsyncIterable<RawEvent> {
  if (!existsSync(path)) {
    return;
  }
  const mtimeMs = lastWriteMs(path);
  const previous = ctx.cursors.get(path);
  if (previous && previous.mtimeMs === mtimeMs) {
    return;
  }
  const announced = new Set(previous?.seenSessions || []);
  let mark = typeof previous?.mark === "number" ? previous.mark : 0;
  let db: DatabaseSync | undefined;
  let rows: MessageRow[];
  try {
    db = openReadOnly(path);
    rows = db
      .prepare(
        "SELECT id, session_id, time_updated, data FROM message WHERE time_updated > ? ORDER BY time_updated ASC"
      )
      .all(mark) as MessageRow[];
  } catch (error) {
    ctx.log(`${harness}: cannot read ${path}: ${String(error)}`);
    return;
  } finally {
    db?.close();
  }
  for (const row of rows) {
    mark = Math.max(mark, row.time_updated);
    const event = normalizeOpenCode(row, harness);
    if (!event || (ctx.since && Date.parse(event.occurredAt) < ctx.since)) {
      continue;
    }
    if (!announced.has(row.session_id)) {
      announced.add(row.session_id);
      yield {
        eventId: eventId(harness, row.session_id, "start"),
        harness,
        occurredAt: event.occurredAt,
        project: event.project,
        sessionId: row.session_id,
        type: "session.start",
      };
    }
    yield event;
  }
  ctx.cursors.set(path, {
    mark,
    mtimeMs,
    offset: 0,
    seenSessions: [...announced],
  });
}

export const openCodeCollector: Collector = {
  id: OPENCODE,
  name: "OpenCode",
  discover: () => {
    const p = openCodeDbPath();
    return Promise.resolve(existsSync(p) ? [p] : []);
  },
  collect: (ctx) => collectOpenCodeFromDb(openCodeDbPath(), ctx, OPENCODE),
};

import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { lastWriteMs, openReadOnly } from "./sqlite";

export const DEVIN = "devin" as const;

type Metrics = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
  cache_creation_tokens?: number | null;
};

type ChatMessage = {
  role?: string;
  message_id?: string;
  metadata?: { metrics?: Metrics | null } | null;
};

export type SessionRow = {
  id: string;
  working_directory: string | null;
  backend_type: string | null;
  model: string | null;
};

export type MessageRow = {
  row_id: number;
  session_id: string;
  created_at: number;
  chat_message: string;
};

export function normalizeDevin(
  row: MessageRow,
  session: SessionRow | undefined
): RawEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(row.chat_message);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const message = parsed as ChatMessage;
  const metrics = message.metadata?.metrics;
  if (message.role !== "assistant" || !metrics || !message.message_id) {
    return null;
  }
  const input = metrics.input_tokens ?? 0;
  const output = metrics.output_tokens ?? 0;
  const cacheRead = metrics.cache_read_tokens ?? 0;
  const cacheWrite = metrics.cache_creation_tokens ?? 0;
  if (input + output + cacheRead + cacheWrite === 0) {
    return null;
  }
  const occurred = new Date(row.created_at * 1000);
  if (!Number.isFinite(occurred.getTime())) {
    return null;
  }
  const model = session?.model || "unknown";
  return {
    eventId: eventId(DEVIN, row.session_id, message.message_id),
    harness: DEVIN,
    model: {
      family: modelFamily(model),
      provider: session?.backend_type || undefined,
      raw: model,
    },
    occurredAt: occurred.toISOString(),
    project: projectRef(session?.working_directory || undefined),
    sessionId: row.session_id,
    tokens: { cacheRead, cacheWrite, input, output },
    type: "usage",
  };
}

export function devinDbPath(): string {
  if (process.env.AI_REPORTER_DEVIN_DB?.trim()) {
    return process.env.AI_REPORTER_DEVIN_DB.trim();
  }
  const data =
    process.env.XDG_DATA_HOME?.trim() || join(homedir(), ".local", "share");
  return join(data, "devin", "cli", "sessions.db");
}

export async function* collectDevin(
  dbPath: string,
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  if (!existsSync(dbPath)) {
    return;
  }
  const mtimeMs = lastWriteMs(dbPath);
  const previous = ctx.cursors.get(dbPath);
  if (previous && previous.mtimeMs === mtimeMs) {
    return;
  }
  let mark = typeof previous?.mark === "number" ? previous.mark : 0;
  let db: DatabaseSync | undefined;
  let sessions = new Map<string, SessionRow>();
  let rows: MessageRow[];
  try {
    db = openReadOnly(dbPath);
    const sessionRows = db
      .prepare(
        "SELECT id, working_directory, backend_type, model FROM sessions"
      )
      .all() as SessionRow[];
    for (const s of sessionRows) {
      sessions.set(s.id, s);
    }
    rows = db
      .prepare(
        "SELECT rowid as row_id, session_id, created_at, chat_message FROM message_nodes WHERE rowid > ? ORDER BY rowid ASC"
      )
      .all(mark) as MessageRow[];
  } catch (error) {
    ctx.log(`devin: cannot read ${dbPath}: ${String(error)}`);
    return;
  } finally {
    db?.close();
  }
  const seenMessages = new Set<string>();
  for (const row of rows) {
    mark = Math.max(mark, row.row_id);
    const session = sessions.get(row.session_id);
    const event = normalizeDevin(row, session);
    if (!event || seenMessages.has(event.eventId)) {
      continue;
    }
    if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
      continue;
    }
    seenMessages.add(event.eventId);
    yield event;
  }
  ctx.cursors.set(dbPath, {
    mark,
    mtimeMs,
    offset: 0,
  });
}

export const devinCollector: Collector = {
  id: DEVIN,
  name: "Devin",
  discover: () => {
    const p = devinDbPath();
    return Promise.resolve(existsSync(p) ? [p] : []);
  },
  collect: (ctx) => collectDevin(devinDbPath(), ctx),
};

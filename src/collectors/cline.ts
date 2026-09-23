import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { readJsonFile } from "../core/config";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";

export const CLINE = "cline" as const;

type UiMessage = {
  ts?: number;
  type?: string;
  say?: string;
  text?: string;
};

type ApiReq = {
  tokensIn?: number;
  tokensOut?: number;
  cacheWrites?: number;
  cacheReads?: number;
  cost?: number;
};

type TaskMetadata = {
  model_usage?: {
    model_id?: string;
    model_provider_id?: string;
    ts?: number;
  }[];
  cwdOnTaskInitialization?: string;
};

export type ClineTask = {
  taskId: string;
  messages: unknown;
  metadata?: TaskMetadata | null;
};

export function normalizeCline(
  task: ClineTask,
  afterTs: number
): { events: RawEvent[]; mark: number } {
  const events: RawEvent[] = [];
  let mark = afterTs;
  if (!Array.isArray(task.messages)) {
    return { events, mark };
  }
  const models = (task.metadata?.model_usage ?? [])
    .filter((m) => typeof m.model_id === "string")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
  const modelAt = (ts: number) =>
    models.findLast((model) => (model.ts ?? 0) <= ts) ?? models[0];
  const cwd = task.metadata?.cwdOnTaskInitialization;
  const sorted = (task.messages as UiMessage[])
    .filter(
      (m) =>
        m?.type === "say" &&
        m.say === "api_req_started" &&
        typeof m.ts === "number"
    )
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

  for (const message of sorted) {
    const ts = message.ts ?? 0;
    if (ts <= afterTs) {
      continue;
    }
    let req: ApiReq;
    try {
      req = JSON.parse(message.text ?? "{}") as ApiReq;
    } catch {
      continue;
    }
    if (typeof req.tokensIn !== "number" && typeof req.tokensOut !== "number") {
      continue;
    }
    const model = modelAt(ts);
    const raw = model?.model_id ?? "unknown";
    events.push({
      eventId: eventId(CLINE, task.taskId, ts),
      harness: CLINE,
      model: {
        family: modelFamily(raw),
        provider: model?.model_provider_id,
        raw,
      },
      occurredAt: new Date(ts).toISOString(),
      project: projectRef(cwd),
      sessionId: task.taskId,
      tokens: {
        cacheRead: req.cacheReads ?? 0,
        cacheWrite: req.cacheWrites ?? 0,
        input: req.tokensIn ?? 0,
        output: req.tokensOut ?? 0,
      },
      type: "usage",
      ...(typeof req.cost === "number" && req.cost > 0
        ? { costUsd: req.cost }
        : {}),
    });
    mark = Math.max(mark, ts);
  }
  return { events, mark };
}

export function clineStorageDirs(home = homedir()): string[] {
  const isMac = process.platform === "darwin";
  const vscodeDir = isMac
    ? join(home, "Library", "Application Support", "Code", "User", "globalStorage")
    : join(home, ".config", "Code", "User", "globalStorage");

  const candidates = [
    join(vscodeDir, "saoudrizwan.claude-dev", "tasks"),
    join(vscodeDir, "rooveterinaryinc.roo-cline", "tasks"),
  ];

  return candidates.filter((p) => {
    try {
      return statSync(p).isDirectory();
    } catch {
      return false;
    }
  });
}

export async function* collectCline(
  taskDirs: string[],
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  for (const root of taskDirs) {
    let taskIds: string[];
    try {
      taskIds = readdirSync(root);
    } catch {
      continue;
    }
    for (const taskId of taskIds) {
      const taskFolder = join(root, taskId);
      const msgFile = join(taskFolder, "ui_messages.json");
      if (!existsSync(msgFile)) {
        continue;
      }
      let stat;
      try {
        stat = statSync(msgFile);
      } catch {
        continue;
      }
      const previous = ctx.cursors.get(msgFile);
      if (previous && previous.mtimeMs === stat.mtimeMs) {
        continue;
      }
      let rawMessages: unknown;
      try {
        rawMessages = JSON.parse(readFileSync(msgFile, "utf8"));
      } catch {
        continue;
      }
      const metadata = readJsonFile<TaskMetadata>(join(taskFolder, "task_metadata.json"));
      const mark = typeof previous?.mark === "number" ? previous.mark : 0;
      const { events, mark: nextMark } = normalizeCline(
        { taskId, messages: rawMessages, metadata },
        mark
      );
      for (const ev of events) {
        if (ctx.since && Date.parse(ev.occurredAt) < ctx.since) {
          continue;
        }
        yield ev;
      }
      ctx.cursors.set(msgFile, {
        mark: nextMark,
        mtimeMs: stat.mtimeMs,
      });
    }
  }
}

export const clineCollector: Collector = {
  id: CLINE,
  name: "Cline",
  discover: () => {
    const dirs = clineStorageDirs();
    return Promise.resolve(dirs);
  },
  collect: (ctx) => collectCline(clineStorageDirs(), ctx),
};

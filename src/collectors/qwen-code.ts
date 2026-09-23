import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily, outputWithReasoning } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const QWEN_CODE = "qwen-code" as const;

type QwenLine = {
  uuid: string;
  sessionId: string;
  timestamp: string;
  type: string;
  cwd?: string;
  version?: string;
  gitBranch?: string;
  model?: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    cachedContentTokenCount?: number;
    thoughtsTokenCount?: number;
    toolUsePromptTokenCount?: number;
    totalTokenCount?: number;
  } | null;
};

function isQwenLine(value: unknown): value is QwenLine {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.uuid === "string" &&
    typeof v.sessionId === "string" &&
    typeof v.timestamp === "string" &&
    typeof v.type === "string"
  );
}

function count(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : 0;
}

export function normalizeQwenCode(value: unknown): RawEvent | null {
  if (
    !isQwenLine(value) ||
    value.type !== "assistant" ||
    !value.usageMetadata
  ) {
    return null;
  }
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const u = value.usageMetadata;
  const prompt = count(u.promptTokenCount);
  const cached = Math.min(count(u.cachedContentTokenCount), prompt);
  const reasoning = count(u.thoughtsTokenCount);
  const output = outputWithReasoning({
    output: count(u.candidatesTokenCount),
    prompt,
    reasoning,
    separateByDefault: false,
    total: count(u.totalTokenCount),
  });
  if (prompt === 0 && output === 0 && count(u.totalTokenCount) === 0) {
    return null;
  }
  const model = value.model ?? "qwen";
  return {
    eventId: eventId(QWEN_CODE, value.sessionId, value.uuid),
    harness: QWEN_CODE,
    harnessVersion: value.version === "unknown" ? undefined : value.version,
    model: { family: modelFamily(model), provider: "alibaba", raw: model },
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(value.cwd, value.gitBranch),
    sessionId: value.sessionId,
    tokens: {
      cacheRead: cached,
      cacheWrite: 0,
      input: Math.max(0, prompt - cached),
      output,
      ...(reasoning > 0 ? { reasoning } : {}),
    },
    type: "usage",
  };
}

export function qwenHome(): string {
  return process.env.QWEN_HOME?.trim() || join(homedir(), ".qwen");
}

function listQwenChats(home = qwenHome()): string[] {
  const projects = join(home, "projects");
  if (!existsSync(projects)) {
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
  walk(projects);
  return files;
}

export async function* collectQwenCode(
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
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`qwen-code: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizeQwenCode(row);
      if (!event) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      yield event;
    }
    ctx.cursors.set(path, result.cursor);
  }
}

export const qwenCodeCollector: Collector = {
  id: QWEN_CODE,
  name: "Qwen Code",
  discover: () => {
    const files = listQwenChats();
    return Promise.resolve(files.length > 0 ? [qwenHome()] : []);
  },
  collect: (ctx) => collectQwenCode(listQwenChats(), ctx),
};

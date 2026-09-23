import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { projectRef } from "../core/project";
import type { RawEvent } from "../core/schema";
import { eventId, modelFamily } from "../core/schema";
import type { Collector, CollectorContext } from "../core/types";
import { parseJsonLine, tailJsonl } from "./jsonl-tail";

export const CLAUDE_CODE = "claude-code" as const;

type AssistantLine = {
  type: "assistant";
  sessionId: string;
  timestamp: string;
  cwd?: string;
  gitBranch?: string;
  version?: string;
  requestId?: string;
  apiBlockIndex?: number;
  message: {
    id: string;
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      output_tokens_details?: { thinking_tokens?: number };
    };
  };
};

function isAssistantLine(value: unknown): value is AssistantLine {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  const message = v.message as Record<string, unknown> | undefined;
  return (
    v.type === "assistant" &&
    typeof v.sessionId === "string" &&
    typeof v.timestamp === "string" &&
    typeof message?.id === "string" &&
    typeof message.usage === "object" &&
    message.usage !== null
  );
}

export function normalizeClaudeCode(value: unknown): RawEvent | null {
  if (!isAssistantLine(value)) {
    return null;
  }
  const { model } = value.message;
  if (!model || model === "<synthetic>") {
    return null;
  }
  const usage = value.message.usage ?? {};
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const reasoning = usage.output_tokens_details?.thinking_tokens;
  return {
    eventId: eventId(CLAUDE_CODE, value.sessionId, value.message.id),
    harness: CLAUDE_CODE,
    harnessVersion: value.version,
    model: { family: modelFamily(model), provider: "anthropic", raw: model },
    native: value.requestId ? { requestId: value.requestId } : undefined,
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(value.cwd, value.gitBranch),
    sessionId: value.sessionId,
    tokens: {
      cacheRead: usage.cache_read_input_tokens ?? 0,
      cacheWrite: usage.cache_creation_input_tokens ?? 0,
      input: usage.input_tokens ?? 0,
      output: usage.output_tokens ?? 0,
      ...(reasoning === undefined ? {} : { reasoning }),
    },
    type: "usage",
  };
}

export function claudeConfigDir(): string {
  return process.env.CLAUDE_CONFIG_DIR?.trim() || join(homedir(), ".claude");
}

function listTranscripts(root: string): string[] {
  const projects = join(root, "projects");
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

export async function* collectClaudeCode(
  roots: string[],
  ctx: CollectorContext
): AsyncIterable<RawEvent> {
  const seenMessages = new Set<string>();
  for (const root of roots) {
    const files = listTranscripts(root);
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
        ctx.log(`claude-code: cannot tail ${path}: ${String(error)}`);
        continue;
      }
      const announced = new Set(result.cursor.seenSessions || []);
      for (const line of result.lines) {
        const row = parseJsonLine(line);
        const event = normalizeClaudeCode(row);
        if (!event || seenMessages.has(event.eventId)) {
          continue;
        }
        if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
          continue;
        }
        seenMessages.add(event.eventId);
        if (!announced.has(event.sessionId)) {
          announced.add(event.sessionId);
          yield {
            eventId: eventId(CLAUDE_CODE, event.sessionId, "start"),
            harness: CLAUDE_CODE,
            harnessVersion: event.harnessVersion,
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
        seenSessions: [...announced],
      });
    }
  }
}

export const claudeCodeCollector: Collector = {
  id: CLAUDE_CODE,
  name: "Claude Code",
  discover: () => {
    const dir = claudeConfigDir();
    return Promise.resolve(existsSync(dir) ? [dir] : []);
  },
  collect: (ctx) => collectClaudeCode([claudeConfigDir()], ctx),
};

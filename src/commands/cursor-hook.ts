import type { Command } from "commander";
import { recordCursorHook } from "../collectors/cursor";

const MAX_HOOK_BYTES = 8 * 1024 * 1024;

async function readStdin(): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of process.stdin) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > MAX_HOOK_BYTES) {
      return null;
    }
    chunks.push(buf);
  }

  try {
    const raw = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function registerCursorHook(program: Command): void {
  program
    .command("_cursor-hook", { hidden: true })
    .description("Internal hook receiver for Cursor afterAgentResponse and stop")
    .action(async () => {
      const input = await readStdin();
      if (input !== null) {
        recordCursorHook(input);
      }
    });
}

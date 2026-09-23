import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, spoolDir } from "../core/config";
import type { TelemetryEvent } from "../core/schema";

export function writeSpool(events: TelemetryEvent[]): void {
  if (events.length === 0) return;
  const dir = spoolDir();
  ensureDir(dir);

  // Group events by day based on occurredAt
  const byDay = new Map<string, TelemetryEvent[]>();
  for (const ev of events) {
    const day = ev.occurredAt.slice(0, 10);
    const list = byDay.get(day) || [];
    list.push(ev);
    byDay.set(day, list);
  }

  for (const [day, list] of byDay.entries()) {
    const file = join(dir, `${day}.ndjson`);
    const lines = list.map((e) => JSON.stringify(e)).join("\n") + "\n";
    appendFileSync(file, lines, { encoding: "utf8", mode: 0o600 });
  }
}

export function* readSpool(): Iterable<TelemetryEvent> {
  const dir = spoolDir();
  if (!existsSync(dir)) return;

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".ndjson"))
    .sort();

  for (const file of files) {
    const content = readFileSync(join(dir, file), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed) as TelemetryEvent;
      } catch {
        // Skip malformed
      }
    }
  }
}

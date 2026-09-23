import type { Command } from "commander";
import { writeFileSync } from "node:fs";
import { getDatabase } from "../storage/db";
import { ui } from "../ui/output";

export function registerExport(program: Command): void {
  program
    .command("export")
    .description("Export recorded AI usage data to JSON or CSV")
    .option("-f, --format <format>", "export format: json or csv", "json")
    .option("-o, --out <file>", "write to file instead of stdout")
    .action((options: { format: string; out?: string }) => {
      const db = getDatabase();
      const events = db.getRecentEvents({ limit: 100_000 });

      let output = "";
      if (options.format.toLowerCase() === "csv") {
        const headers = [
          "eventId",
          "occurredAt",
          "harness",
          "model",
          "inputTokens",
          "outputTokens",
          "cacheReadTokens",
          "cacheWriteTokens",
          "totalTokens",
          "costUsd",
          "costSavingsUsd",
          "project",
        ];
        const rows = [headers.join(",")];
        for (const e of events) {
          rows.push([
            JSON.stringify(e.eventId),
            JSON.stringify(e.occurredAt),
            JSON.stringify(e.harness),
            JSON.stringify(e.model.name),
            e.tokens.input,
            e.tokens.output,
            e.tokens.cacheRead,
            e.tokens.cacheWrite,
            e.tokens.total,
            e.costUsd,
            e.costSavingsUsd,
            JSON.stringify(e.project?.name || ""),
          ].join(","));
        }
        output = rows.join("\n");
      } else {
        output = JSON.stringify(events, null, 2);
      }

      if (options.out) {
        writeFileSync(options.out, output, "utf8");
        ui.success(`Exported ${events.length} records to ${options.out}`);
      } else {
        process.stdout.write(output + "\n");
      }
    });
}

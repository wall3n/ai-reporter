import type { Command } from "commander";
import { getDatabase } from "../storage/db";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { compactNumber, formatUsd } from "../ui/tui";
import { HARNESS_INFO } from "../ui/screen";

export function registerLog(program: Command): void {
  program
    .command("log")
    .alias("history")
    .description("View recent token usage requests and transactions")
    .option("-n, --limit <count>", "number of requests to display", "25")
    .option("--harness <name>", "filter by specific harness")
    .option("--json", "output logs as JSON")
    .action((options: { limit: string; harness?: string; json?: boolean }) => {
      const limit = Math.max(1, Number(options.limit) || 25);
      const db = getDatabase();
      const events = db.getRecentEvents({ harness: options.harness, limit });

      if (options.json) {
        ui.json(events);
        return;
      }

      ui.intro(`Recent Requests · Showing ${events.length} records`);

      if (events.length === 0) {
        ui.info("No usage events found yet. Run 'ai-reporter scan' to discover existing logs.");
        return;
      }

      const rows = events.map((e) => {
        const time = new Date(e.occurredAt).toLocaleString("en-GB", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          second: "2-digit",
        });
        const info = HARNESS_INFO[e.harness];
        const harnessLabel = info ? `${info.color(info.glyph)} ${info.name}` : e.harness;

        return [
          c.dim(time),
          harnessLabel,
          e.model.name,
          compactNumber(e.tokens.input),
          compactNumber(e.tokens.output),
          c.dim(compactNumber(e.tokens.cacheRead)),
          c.bold(compactNumber(e.tokens.total)),
          c.gold(formatUsd(e.costUsd)),
          e.project?.name || c.dim("–"),
        ];
      });

      ui.table(
        rows,
        ["Occurred", "Harness", "Model", "In", "Out", "Cached", "Total", "Cost", "Project"]
      );
      ui.line();
      ui.outro("Use 'ai-reporter log --limit 50' or 'ai-reporter stats' for aggregated totals.");
    });
}

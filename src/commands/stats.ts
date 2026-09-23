import type { Command } from "commander";
import { getDatabase } from "../storage/db";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { compactNumber, formatUsd, gauge } from "../ui/tui";
import { renderTable } from "../ui/table";
import { HARNESS_INFO } from "../ui/screen";

export function registerStats(program: Command): void {
  program
    .command("stats")
    .alias("summary")
    .description("View token usage, spending, and model analytics")
    .option("--today", "show usage for today only")
    .option("--yesterday", "show usage for yesterday only")
    .option("--week", "show usage for the last 7 days")
    .option("--month", "show usage for the last 30 days")
    .option("--all", "show all-time usage (default)")
    .option("--json", "output stats as raw JSON")
    .action((options: { today?: boolean; yesterday?: boolean; week?: boolean; month?: boolean; all?: boolean; json?: boolean }) => {
      const db = getDatabase();
      const now = new Date();
      let since: string | undefined;
      let until: string | undefined;
      let timeframeLabel = "All Time";

      if (options.today) {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        since = d.toISOString();
        timeframeLabel = "Today";
      } else if (options.yesterday) {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        since = start.toISOString();
        until = end.toISOString();
        timeframeLabel = "Yesterday";
      } else if (options.week) {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        since = d.toISOString();
        timeframeLabel = "Last 7 Days";
      } else if (options.month) {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        since = d.toISOString();
        timeframeLabel = "Last 30 Days";
      }

      const summary = db.getSummary({ since, until });
      const harnesses = db.getHarnessSummaries({ since, until });
      const models = db.getModelSummaries({ since, until, limit: 10 });
      const projects = db.getProjectSummaries({ since, until, limit: 10 });
      const daily = db.getDailyUsage(14);

      if (options.json) {
        ui.json({
          daily,
          harnesses,
          models,
          projects,
          summary,
          timeframe: timeframeLabel,
        });
        return;
      }

      ui.intro(`Usage & Spend Statistics · ${timeframeLabel}`);

      // Overview Card
      const overviewRows: [string, string][] = [
        ["Total Tokens", `${c.bold(compactNumber(summary.totalTokens))} tokens`],
        ["Prompt Tokens (Input)", `${compactNumber(summary.inputTokens)} tokens`],
        ["Completion Tokens (Output)", `${compactNumber(summary.outputTokens)} tokens`],
        ["Cache Read Tokens", `${compactNumber(summary.cacheReadTokens)} tokens`],
        ["Cache Write Tokens", `${compactNumber(summary.cacheWriteTokens)} tokens`],
        ["Total Estimated Cost", c.bold(c.gold(formatUsd(summary.totalCostUsd)))],
        ["Saved by Prompt Caching", c.green(formatUsd(summary.totalCostSavingsUsd))],
        ["Total Requests Recorded", `${compactNumber(summary.totalRequests)} requests`],
        ["Active Sessions", `${compactNumber(summary.totalSessions)} sessions`],
      ];
      if (summary.firstEventAt) {
        overviewRows.push([
          "Date Range",
          `${new Date(summary.firstEventAt).toLocaleDateString()} → ${new Date(summary.lastEventAt || summary.firstEventAt).toLocaleDateString()}`,
        ]);
      }

      ui.card("Overall Summary", overviewRows.map(([k, v]) => `${c.dim(k)}: ${v}`).join("\n"));
      ui.line();

      // By Harness Table
      if (harnesses.length > 0) {
        ui.line(c.bold(c.cyan("✦ Breakdown by Harness:")));
        const hRows = harnesses.map((h) => {
          const info = HARNESS_INFO[h.harness];
          const label = info ? `${info.color(info.glyph)} ${info.name}` : h.harness;
          return [
            label,
            compactNumber(h.requests),
            compactNumber(h.tokens),
            compactNumber(h.input),
            compactNumber(h.output),
            c.dim(compactNumber(h.cached)),
            c.bold(c.gold(formatUsd(h.costUsd))),
            c.green(formatUsd(h.costSavingsUsd)),
          ];
        });
        ui.table(
          hRows,
          ["Harness", "Requests", "Tokens", "In", "Out", "Cached", "Cost", "Savings"]
        );
        ui.line();
      }

      // By Model Table
      if (models.length > 0) {
        ui.line(c.bold(c.cyan("✦ Top Models:")));
        const mRows = models.map((m) => [
          m.modelName,
          c.dim(m.modelFamily),
          compactNumber(m.requests),
          compactNumber(m.tokens),
          compactNumber(m.input),
          compactNumber(m.output),
          c.dim(compactNumber(m.cached)),
          c.bold(c.gold(formatUsd(m.costUsd))),
        ]);
        ui.table(
          mRows,
          ["Model", "Family", "Requests", "Tokens", "In", "Out", "Cached", "Cost"]
        );
        ui.line();
      }

      // By Project Table
      if (projects.length > 0) {
        ui.line(c.bold(c.cyan("✦ Top Projects:")));
        const pRows = projects.map((p) => [
          p.projectName,
          compactNumber(p.requests),
          compactNumber(p.tokens),
          c.bold(c.gold(formatUsd(p.costUsd))),
          p.lastEventAt ? new Date(p.lastEventAt).toLocaleDateString() : "–",
        ]);
        ui.table(pRows, ["Project", "Requests", "Tokens", "Cost", "Last Active"]);
        ui.line();
      }

      // Daily Trend (ASCII Chart)
      if (daily.length > 1) {
        ui.line(c.bold(c.cyan("✦ Daily Activity (Last 14 Days):")));
        const maxTokens = Math.max(...daily.map((d) => d.tokens), 1);
        for (const day of daily) {
          const barFraction = day.tokens / maxTokens;
          const bar = gauge(barFraction, 20, c.cyan);
          ui.line(
            `  ${c.dim(day.day)}  ${bar}  ${compactNumber(day.tokens).padStart(7)} tokens  ${c.gold(formatUsd(day.costUsd)).padStart(8)}  ${c.dim(`(${day.requests} reqs)`)}`
          );
        }
        ui.line();
      }

      ui.outro("Run 'ai-reporter watch' for a real-time live terminal monitor.");
    });
}

import type { Command } from "commander";
import { writeFileSync } from "node:fs";
import { getDatabase } from "../storage/db";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { box, compactNumber, formatUsd, gauge } from "../ui/tui";
import { renderTable } from "../ui/table";
import { HARNESS_INFO, Screen } from "../ui/screen";
import { computeFunMetrics } from "../core/fun-metrics";
import { renderStatsLines } from "../ui/stats-render";
import { generateHtmlStatsReport } from "../ui/html-report";
import { tryAcquireLock } from "../engine/lock";
import { Watcher } from "../engine/watcher";
import type { PeriodType } from "../core/types";

export function registerStats(program: Command): void {
  const statsCmd = program
    .command("stats")
    .alias("summary")
    .description("View token usage, spending, and model analytics with fun environmental metrics")
    .option("--today", "show usage for today only")
    .option("--yesterday", "show usage for yesterday only")
    .option("-w, --week", "show usage for this week (Mon-Sun breakdown)")
    .option("-m, --month", "show usage for this month (daily breakdown)")
    .option("-y, --year", "show usage for this year (monthly breakdown)")
    .option("--all", "show all-time usage (default)")
    .option("-i, --interactive", "launch full-terminal interactive statistics page")
    .option("--page", "alias for --interactive")
    .option("--html [filename]", "export standalone interactive HTML dashboard")
    .option("--json", "output stats as raw JSON")
    .action(
      async (options: {
        today?: boolean;
        yesterday?: boolean;
        week?: boolean;
        month?: boolean;
        year?: boolean;
        all?: boolean;
        interactive?: boolean;
        page?: boolean;
        html?: string | boolean;
        json?: boolean;
      }) => {
        const db = getDatabase();

        // 1. Export HTML dashboard
        if (options.html) {
          const filename =
            typeof options.html === "string" ? options.html : "ai-reporter-stats.html";
          const weekStats = db.getPeriodStats("week");
          const monthStats = db.getPeriodStats("month");
          const yearStats = db.getPeriodStats("year");
          const html = generateHtmlStatsReport(weekStats, monthStats, yearStats);
          writeFileSync(filename, html, "utf8");
          ui.success(`HTML statistics dashboard exported to ${c.bold(filename)}`);
          return;
        }

        // 2. Interactive TUI statistics page
        if (options.interactive || options.page) {
          const initialPeriod: PeriodType = options.week
            ? "week"
            : options.year
              ? "year"
              : "month";
          await launchInteractiveStats(initialPeriod);
          return;
        }

        // 3. Period-based statistics (Week / Month / Year)
        if (options.week || options.month || options.year) {
          const periodType: PeriodType = options.week
            ? "week"
            : options.year
              ? "year"
              : "month";
          const periodStats = db.getPeriodStats(periodType, 0);

          if (options.json) {
            ui.json(periodStats);
            return;
          }

          const lines = renderStatsLines(periodStats, {
            activeTab: periodType,
            cols: process.stdout.columns || 80,
            interactive: false,
          });
          for (const line of lines) {
            console.log(line);
          }
          ui.line();
          ui.outro("Run 'ai-reporter stats -i' to explore periods interactively.");
          return;
        }

        // 4. Default / Today / Yesterday / All-time view
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
        }

        const summary = db.getSummary({ since, until });
        const funMetrics = computeFunMetrics(summary);
        const harnesses = db.getHarnessSummaries({ since, until });
        const models = db.getModelSummaries({ limit: 10, since, until });
        const projects = db.getProjectSummaries({ limit: 10, since, until });
        const daily = db.getDailyUsage(14);

        if (options.json) {
          ui.json({
            daily,
            funMetrics,
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

        // Fun Metrics Box
        const cardW = Math.min((process.stdout.columns || 80) - 4, 110);
        const f = funMetrics;
        const lakesFmt =
          f.drownLakes >= 0.01
            ? f.drownLakes.toFixed(4)
            : f.drownLakes >= 0.0001
              ? f.drownLakes.toFixed(5)
              : f.drownLakes.toFixed(6);

        const funLines = [
          `${c.bold(c.cyan("🌊 Water Footprint (\"Drown Lakes\"):"))} ${c.bold(c.gold(`${lakesFmt} lakes drained`))} ${c.dim(`[${f.lakeBadge}]`)}`,
          `   💧 ${compactNumber(f.waterLiters)} L cooling water evaporated  ${c.dim("≈")}  🏊 ${f.olympicPools} Olympic pools  ${c.dim("·")}  🛁 ${compactNumber(f.bathtubs)} bathtubs  ${c.dim("·")}  🥤 ${compactNumber(f.waterBottles)} bottles`,
          `   ${c.italic(f.lakeCommentary)}`,
          "",
          `${c.bold(c.gold("⚡ Compute Energy & Hardware:"))} ${c.bold(`${f.kwh} kWh`)}`,
          `   🍞 ${compactNumber(f.toastsRun)} slices of bread toasted  ${c.dim("·")}  📱 ${compactNumber(f.smartphonesCharged)} phone charges  ${c.dim("·")}  💡 ${compactNumber(f.ledLightbulbHours)}h LED bulb`,
          `   🌱 ${f.co2Kg} kg CO₂ emitted  ${c.dim("≈")}  🚗 ${compactNumber(f.carKmDriven)} km driven in car  ${c.dim("·")}  🌳 ${f.treeYearsToOffset} tree-years to absorb`,
          "",
          `${c.bold(c.purple("⌨️  Human Scale & Literature:"))} ${compactNumber(f.wordsEquivalent)} words generated`,
          `   ✍️  Typing equivalent: ${f.humanTypingDays >= 1 ? `${f.humanTypingDays} days` : `${f.humanTypingHours}h`} non-stop at 50 WPM`,
          `   📚 ${f.warAndPeaceCopies}x War & Peace  ${c.dim("·")}  🧙 ${f.harryPotterSeries}x complete Harry Potter box sets`,
          "",
          `${c.bold(c.teal("☕ Developer Fuel & Cost:"))} ☕ ${compactNumber(f.coffeesEquivalent)} flat whites  ${c.dim("·")}  🍕 ${compactNumber(f.pizzasEquivalent)} artisan pizzas`,
        ];

        const funBox = box(
          { accent: "gold", title: "🌊 Fun Metrics: Environmental & Physical Footprint" },
          funLines,
          cardW
        );
        for (const l of funBox) {
          ui.line(`  ${l}`);
        }
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

        ui.outro("Run 'ai-reporter stats --week', '--month', '--year' or '-i' for the full interactive view.");
      }
    );

  // Subcommand alias: ai-reporter stats page
  statsCmd
    .command("page")
    .description("Launch full interactive statistics page in terminal")
    .action(async () => {
      await launchInteractiveStats("month");
    });
}

async function launchInteractiveStats(initialPeriod: PeriodType = "month"): Promise<void> {
  const lockResult = tryAcquireLock();
  const watcher = new Watcher({
    intervalMs: 30000,
    verbose: false,
    onLog: () => {},
  });

  const screen = new Screen(watcher, {
    attachedPid: lockResult.acquired ? undefined : lockResult.pid,
    initialPeriod,
    initialTab: "stats",
    mode: lockResult.acquired ? "standalone" : "attached",
  });

  const handleSigint = () => {
    screen.stop();
    if (lockResult.acquired) {
      lockResult.release();
    }
    process.exit(0);
  };

  process.on("SIGINT", handleSigint);
  process.on("SIGTERM", handleSigint);

  try {
    screen.onExit = () => {
      if (lockResult.acquired) {
        lockResult.release();
      }
    };
    screen.start();

    if (lockResult.acquired) {
      await watcher.run();
    } else {
      await new Promise<void>((resolve) => {
        screen.onExit = () => {
          resolve();
        };
      });
    }
  } finally {
    screen.stop();
    if (lockResult.acquired) {
      lockResult.release();
    }
  }
}

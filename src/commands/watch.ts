import type { Command } from "commander";
import { tryAcquireLock } from "../engine/lock";
import { Watcher } from "../engine/watcher";
import { Screen } from "../ui/screen";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { compactNumber, formatUsd } from "../ui/tui";
import { getDatabase } from "../storage/db";

export function registerWatch(program: Command): void {
  program
    .command("watch")
    .description("Live interactive token dashboard and continuous file monitor")
    .option("-i, --interval <seconds>", "seconds between scans", "30")
    .option("--once", "scan once, print summary, and exit")
    .option("--plain", "line-by-line output instead of full-terminal TUI")
    .option("--stats", "open directly to statistics page (month/week/year)")
    .option("-v, --verbose", "log details of every scan")
    .action(async (options: { interval: string; once?: boolean; plain?: boolean; stats?: boolean; verbose?: boolean }) => {
      const intervalSec = Math.max(5, Number(options.interval) || 30);
      const intervalMs = intervalSec * 1000;
      const isPlain = Boolean(options.plain || options.once || !process.stdout.isTTY);

      const lockResult = tryAcquireLock();

      const watcher = new Watcher({
        intervalMs,
        verbose: options.verbose,
        onLog: (msg) => {
          if (options.verbose || isPlain) {
            ui.line(c.dim(`[log] ${msg}`));
          }
        },
      });

      if (options.once) {
        try {
          ui.intro("AI-Reporter · One-off Scan");
          ui.line(c.dim("Scanning local AI coding harness sessions..."));
          const result = await watcher.scanOnce();
          ui.success(`Scan completed in ${result.durationMs}ms`);
          ui.line(`New events recorded: ${c.bold(compactNumber(result.totalNew))}`);
          for (const [harness, count] of Object.entries(result.byHarness)) {
            ui.line(`  • ${harness}: ${compactNumber(count)} events`);
          }
          if (result.failedHarnesses.length > 0) {
            ui.warn(`Warnings/failures in: ${result.failedHarnesses.join(", ")}`);
          }
          ui.outro("Done. Database updated.");
        } finally {
          if (lockResult.acquired) {
            lockResult.release();
          }
        }
        return;
      }

      if (isPlain) {
        if (!lockResult.acquired) {
          ui.intro("AI-Reporter · Plain Watch Mode");
          ui.line(
            c.dim(
              `Connected to 24/7 Service (PID ${lockResult.pid}) · Monitoring live updates · Press Ctrl+C to stop`
            )
          );

          let lastCount = -1;
          const pollInterval = Math.max(2, Math.min(intervalSec, 10)) * 1000;
          const db = getDatabase();

          const poll = () => {
            const summary = db.getSummary();
            if (lastCount >= 0 && summary.totalRequests > lastCount) {
              const diff = summary.totalRequests - lastCount;
              const time = new Date().toLocaleTimeString();
              ui.line(
                `[${time}] +${c.bold(compactNumber(diff))} new events recorded by 24/7 service · Total: ${compactNumber(summary.totalTokens)} tokens (${c.gold(formatUsd(summary.totalCostUsd))})`
              );
            }
            lastCount = summary.totalRequests;
          };

          poll();
          const timer = setInterval(poll, pollInterval);

          const handleSigint = () => {
            clearInterval(timer);
            ui.outro("Stopped.");
            process.exit(0);
          };

          process.on("SIGINT", handleSigint);
          process.on("SIGTERM", handleSigint);

          await new Promise<void>(() => {});
          return;
        }

        try {
          ui.intro("AI-Reporter · Plain Watch Mode");
          ui.line(c.dim(`Scanning every ${intervalSec}s · Press Ctrl+C to stop`));

          watcher["onScanComplete"] = (res) => {
            const time = new Date().toLocaleTimeString();
            ui.line(
              `[${time}] Scan finished in ${res.durationMs}ms · ${c.bold(compactNumber(res.totalNew))} new events`
            );
          };

          const handleSigint = () => {
            watcher.stop();
            lockResult.release();
            ui.outro("Stopped.");
            process.exit(0);
          };

          process.on("SIGINT", handleSigint);
          process.on("SIGTERM", handleSigint);

          await watcher.run();
        } finally {
          lockResult.release();
        }
        return;
      }

      // Full interactive TUI
      if (!lockResult.acquired) {
        // Live monitor attached to running 24/7 service
        const screen = new Screen(watcher, {
          attachedPid: lockResult.pid,
          initialTab: options.stats ? "stats" : "watch",
          mode: "attached",
        });

        const handleSigint = () => {
          screen.stop();
          process.exit(0);
        };

        process.on("SIGINT", handleSigint);
        process.on("SIGTERM", handleSigint);

        await new Promise<void>((resolve) => {
          screen.onExit = () => resolve();
          screen.start();
        });
        return;
      }

      // Standalone interactive TUI
      const screen = new Screen(watcher, {
        initialTab: options.stats ? "stats" : "watch",
        mode: "standalone",
      });
      watcher["onScanComplete"] = (res) => {
        screen.onScanResult(res.totalNew, res.durationMs);
      };

      const handleSigint = () => {
        screen.stop();
        lockResult.release();
        process.exit(0);
      };

      process.on("SIGINT", handleSigint);
      process.on("SIGTERM", handleSigint);

      try {
        screen.onExit = () => watcher.stop();
        screen.start();
        await watcher.run();
      } finally {
        screen.stop();
        lockResult.release();
      }
    });
}

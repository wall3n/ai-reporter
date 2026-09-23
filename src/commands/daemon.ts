import type { Command } from "commander";
import { acquireLock } from "../engine/lock";
import { Watcher } from "../engine/watcher";

export function registerDaemon(program: Command): void {
  const daemon = program
    .command("daemon")
    .description("Internal background daemon runner");

  daemon
    .command("run")
    .description("Run the continuous 24/7 scanning worker headlessly")
    .option("-i, --interval <seconds>", "seconds between scans", "30")
    .action(async (options: { interval: string }) => {
      const intervalMs = Math.max(5, Number(options.interval) || 30) * 1000;
      let releaseLock: () => void;
      try {
        releaseLock = acquireLock();
      } catch (err: any) {
        console.error(`[daemon] Error acquiring lock: ${err.message}`);
        process.exit(1);
      }

      console.log(`[daemon] AI-Reporter 24/7 worker started (pid: ${process.pid})`);

      const watcher = new Watcher({
        intervalMs,
        onLog: (msg) => {
          console.log(`[daemon] ${msg}`);
        },
        onScanComplete: (res) => {
          if (res.totalNew > 0) {
            console.log(
              `[daemon] Scan finished: ${res.totalNew} new usage records saved in ${res.durationMs}ms`
            );
          }
        },
      });

      const shutdown = () => {
        console.log("[daemon] Shutting down cleanly...");
        watcher.stop();
        releaseLock();
        process.exit(0);
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);

      try {
        await watcher.run();
      } finally {
        releaseLock();
      }
    });
}

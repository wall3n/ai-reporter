import type { Command } from "commander";
import { Watcher } from "../engine/watcher";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { compactNumber } from "../ui/tui";

export function registerScan(program: Command): void {
  program
    .command("scan")
    .alias("sync")
    .description("Perform an immediate catchup scan of all local AI harnesses")
    .option("-v, --verbose", "show verbose scan logs")
    .action(async (options: { verbose?: boolean }) => {
      ui.intro("AI-Reporter · Scan");
      ui.line(c.dim("Scanning Claude Code, Antigravity, Cursor, Copilot, OpenCode, Gemini CLI, etc..."));

      const watcher = new Watcher({
        verbose: options.verbose,
        onLog: (msg) => {
          if (options.verbose) {
            ui.line(c.dim(`  [log] ${msg}`));
          }
        },
      });

      const res = await watcher.scanOnce();
      ui.success(`Scan completed in ${res.durationMs}ms`);
      ui.line(`New usage records saved: ${c.bold(compactNumber(res.totalNew))}`);
      ui.line(`Total matching records observed: ${compactNumber(res.totalFound)}`);

      if (Object.keys(res.byHarness).length > 0) {
        ui.line(c.bold("Records by harness:"));
        for (const [h, count] of Object.entries(res.byHarness)) {
          ui.line(`  • ${h}: ${compactNumber(count)}`);
        }
      }

      if (res.failedHarnesses.length > 0) {
        ui.warn(`Warnings/failures encountered for: ${res.failedHarnesses.join(", ")}`);
      }

      ui.outro("All local databases and session logs are up to date.");
    });
}

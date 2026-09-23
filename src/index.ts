import { Command } from "commander";
import { registerCursorHook } from "./commands/cursor-hook";
import { registerDaemon } from "./commands/daemon";
import { registerExport } from "./commands/export";
import { registerLog } from "./commands/log";
import { registerPricing } from "./commands/pricing";
import { registerScan } from "./commands/scan";
import { registerService } from "./commands/service";
import { registerStats } from "./commands/stats";
import { registerWatch } from "./commands/watch";
import { getServiceStatus } from "./service/launchd";
import { getDatabase } from "./storage/db";
import { banner } from "./ui/banner";
import { ui } from "./ui/output";
import { BRAND, c } from "./ui/style";
import { compactNumber, formatUsd } from "./ui/tui";
import { VERSION } from "./version";

// Gracefully handle piping to tools like head, less, grep
process.stdout.on("error", (err: any) => {
  if (err?.code === "EPIPE") {
    process.exit(0);
  }
});

const program = new Command();

program
  .name("ai-reporter")
  .description("Track all AI tokens and spend 24/7 across Claude Code, Antigravity, Cursor, Copilot and more")
  .version(VERSION);

registerWatch(program);
registerStats(program);
registerScan(program);
registerLog(program);
registerService(program);
registerDaemon(program);
registerPricing(program);
registerExport(program);
registerCursorHook(program);

// Default action when no subcommand is specified
program.action(() => {
  const db = getDatabase();
  const summary = db.getSummary();
  const service = getServiceStatus();

  console.log(banner());
  console.log();

  ui.card(
    "Live Summary",
    [
      `Total Tokens Tracked:  ${c.bold(compactNumber(summary.totalTokens))} tokens across ${compactNumber(summary.totalRequests)} requests`,
      `Total Estimated Spend: ${c.bold(c.gold(formatUsd(summary.totalCostUsd)))} (Saved ${c.green(formatUsd(summary.totalCostSavingsUsd))} with prompt cache)`,
      `24/7 Background Agent: ${service.running ? c.green(`Active (PID: ${service.pid})`) : service.installed ? c.yellow("Installed (Stopped)") : c.dim("Not installed")}`,
    ].join("\n"),
    "cyan"
  );

  console.log();
  ui.line(c.bold("Commands:"));
  ui.line(`  ${c.bold(c.cyan("ai-reporter watch"))}              Live full-terminal dashboard & file watcher`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter stats"))}              Detailed spend & model analytics (--today, --week, etc.)`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter scan"))}               Scan and catch up all local session files now`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter log"))}                View recent requests stream`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter service install"))}    Run 24/7 in the background on macOS (launchd)`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter pricing list"))}       View or customize model token pricing`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter export"))}             Export data to JSON or CSV`);
  console.log();
});

program.parse(process.argv);

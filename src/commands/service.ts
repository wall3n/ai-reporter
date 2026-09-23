import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { Command } from "commander";
import {
  getServiceStatus,
  installService,
  startService,
  stopService,
  stdoutLogPath,
  uninstallService,
} from "../service/launchd";
import { ui } from "../ui/output";
import { c } from "../ui/style";

export function registerService(program: Command): void {
  const service = program
    .command("service")
    .description("Manage the 24/7 background agent on macOS (launchd) or Linux (systemd)");

  service
    .command("status")
    .description("Check the background service status")
    .action(() => {
      ui.intro("24/7 Background Service Status");
      const status = getServiceStatus();

      if (!status.installed) {
        ui.warn("Service is NOT installed.");
        ui.line("To run AI-Reporter 24/7 in the background across restarts, run:");
        ui.line(`  ${c.bold(c.cyan("ai-reporter service install"))}`);
        ui.outro("");
        return;
      }

      if (status.running) {
        ui.success(`Service is ACTIVE and RUNNING (PID: ${c.bold(String(status.pid))})`);
      } else {
        ui.warn("Service is INSTALLED but not currently running.");
      }

      ui.line();
      ui.kv([
        [process.platform === "darwin" ? "LaunchAgent Plist" : "systemd Service", status.plistPath],
        ["Log Output", status.logPath],
        ["Error Output", status.errPath],
      ]);
      ui.outro("");
    });

  service
    .command("install")
    .description("Install and start the 24/7 background service")
    .action(() => {
      ui.intro("Installing 24/7 Service");
      try {
        const res = installService();
        if (res.success) {
          ui.success(res.message);
          ui.line(c.dim(`Service file: ${res.plist}`));
          ui.line("AI-Reporter is now running 24/7 silently in the background.");
          ui.line("It will restart automatically on system reboot.");
        } else {
          ui.error(res.message);
        }
      } catch (e: any) {
        ui.error(`Installation failed: ${e.message}`);
      }
      ui.outro("");
    });

  service
    .command("uninstall")
    .description("Stop and remove the 24/7 background service")
    .action(() => {
      ui.intro("Uninstalling Service");
      try {
        const res = uninstallService();
        if (res.success) {
          ui.success(res.message);
        } else {
          ui.error(res.message);
        }
      } catch (e: any) {
        ui.error(`Uninstall failed: ${e.message}`);
      }
      ui.outro("");
    });

  service
    .command("start")
    .description("Start the installed background service")
    .action(() => {
      ui.intro("Starting Service");
      try {
        startService();
        ui.success("Service start signal sent.");
      } catch (e: any) {
        ui.error(`Start failed: ${e.message}`);
      }
      ui.outro("");
    });

  service
    .command("stop")
    .description("Stop the running background service")
    .action(() => {
      ui.intro("Stopping Service");
      try {
        stopService();
        ui.success("Service stopped.");
      } catch (e: any) {
        ui.error(`Stop failed: ${e.message}`);
      }
      ui.outro("");
    });

  service
    .command("logs")
    .description("View recent 24/7 background service logs")
    .option("-f, --follow", "follow log stream in real time")
    .option("-n, --lines <number>", "number of lines to display", "25")
    .action((opts: { follow?: boolean; lines: string }) => {
      const log = stdoutLogPath();
      if (!existsSync(log)) {
        ui.warn(`Log file not found at ${log}`);
        return;
      }
      const lines = Math.max(1, Number(opts.lines) || 25);
      if (opts.follow) {
        const proc = spawn("tail", ["-n", String(lines), "-f", log], { stdio: "inherit" });
        process.on("SIGINT", () => {
          proc.kill();
          process.exit(0);
        });
      } else {
        try {
          const out = execSync(`tail -n ${lines} "${log}"`, { encoding: "utf8" });
          process.stdout.write(out);
        } catch (e: any) {
          ui.error(`Failed to read logs: ${e.message}`);
        }
      }
    });

  service
    .command("watch")
    .alias("live")
    .description("Launch the live interactive dashboard connected to the 24/7 service")
    .action(async () => {
      await program.parseAsync([process.argv[0], "ai-reporter", "watch"]);
    });
}

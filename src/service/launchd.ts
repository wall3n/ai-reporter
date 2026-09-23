import { execSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDir, stateDir } from "../core/config";

export const SERVICE_LABEL = "com.ai-reporter.daemon";

export function plistPath(): string {
  return join(homedir(), "Library", "LaunchAgents", `${SERVICE_LABEL}.plist`);
}

export function stdoutLogPath(): string {
  return join(stateDir(), "daemon.log");
}

export function stderrLogPath(): string {
  return join(stateDir(), "daemon.err");
}

export function generatePlist(nodePath: string, cliEntryPath: string): string {
  const stdout = stdoutLogPath();
  const stderr = stderrLogPath();
  const currentPath = process.env.PATH || "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${SERVICE_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${cliEntryPath}</string>
        <string>daemon</string>
        <string>run</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${stdout}</string>
    <key>StandardErrorPath</key>
    <string>${stderr}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${currentPath}</string>
    </dict>
</dict>
</plist>
`;
}

export function getCliEntry(): string {
  const currentFile = fileURLToPath(import.meta.url);
  if (currentFile.endsWith("index.js") || currentFile.endsWith("ai-reporter.mjs")) {
    return currentFile;
  }

  const currentDir = dirname(currentFile);
  const candidates = [
    resolve(currentDir, "index.js"),
    resolve(currentDir, "..", "index.js"),
    resolve(currentDir, "..", "dist", "index.js"),
    resolve(currentDir, "..", "..", "dist", "index.js"),
    resolve(currentDir, "..", "bin", "ai-reporter.mjs"),
    resolve(currentDir, "..", "..", "bin", "ai-reporter.mjs"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return currentFile;
}

export const SYSTEMD_SERVICE_NAME = "ai-reporter.service";

export function systemdServicePath(): string {
  return join(homedir(), ".config", "systemd", "user", SYSTEMD_SERVICE_NAME);
}

export function serviceFilePath(): string {
  return process.platform === "darwin" ? plistPath() : systemdServicePath();
}

export function generateSystemdService(nodePath: string, cliEntryPath: string): string {
  const stdout = stdoutLogPath();
  const stderr = stderrLogPath();
  const currentPath = process.env.PATH || "/usr/local/bin:/usr/bin:/bin";

  return `[Unit]
Description=AI-Reporter 24/7 AI Token & Spend Tracker
After=network.target

[Service]
Type=simple
ExecStart=${nodePath} ${cliEntryPath} daemon run
Restart=always
RestartSec=5
StandardOutput=append:${stdout}
StandardError=append:${stderr}
Environment="PATH=${currentPath}"

[Install]
WantedBy=default.target
`;
}

export function installService(): { success: boolean; message: string; plist: string } {
  if (process.platform !== "darwin" && process.platform !== "linux") {
    throw new Error(`Background service installation is only supported on macOS and Linux (got ${process.platform}).`);
  }

  ensureDir(stateDir());

  const nodePath = process.execPath;
  const cliEntry = getCliEntry();

  if (process.platform === "darwin") {
    const file = plistPath();
    ensureDir(dirname(file));
    const content = generatePlist(nodePath, cliEntry);
    writeFileSync(file, content, { encoding: "utf8", mode: 0o644 });

    try {
      try {
        execSync(`launchctl unload "${file}" 2>/dev/null || true`);
      } catch {
        // Ignore
      }
      execSync(`launchctl load "${file}"`);
      return {
        message: `24/7 background agent installed and started as ${SERVICE_LABEL}.`,
        plist: file,
        success: true,
      };
    } catch (e: any) {
      return {
        message: `Failed to load launchd service: ${e.message}`,
        plist: file,
        success: false,
      };
    }
  } else {
    // Linux systemd user service
    const file = systemdServicePath();
    ensureDir(dirname(file));
    const content = generateSystemdService(nodePath, cliEntry);
    writeFileSync(file, content, { encoding: "utf8", mode: 0o644 });

    try {
      execSync("systemctl --user daemon-reload 2>/dev/null || true");
      execSync(`systemctl --user enable --now ${SYSTEMD_SERVICE_NAME}`);
      return {
        message: `24/7 background agent installed and started as ${SYSTEMD_SERVICE_NAME}.`,
        plist: file,
        success: true,
      };
    } catch (e: any) {
      return {
        message: `Failed to enable systemd user service: ${e.message}`,
        plist: file,
        success: false,
      };
    }
  }
}

export function uninstallService(): { success: boolean; message: string } {
  if (process.platform !== "darwin" && process.platform !== "linux") {
    throw new Error(`Background service is only supported on macOS and Linux (got ${process.platform}).`);
  }

  const file = serviceFilePath();
  if (!existsSync(file)) {
    return { message: "Service is not installed.", success: true };
  }

  if (process.platform === "darwin") {
    try {
      execSync(`launchctl unload "${file}" 2>/dev/null || true`);
    } catch {
      // Ignore
    }
  } else {
    try {
      execSync(`systemctl --user disable --now ${SYSTEMD_SERVICE_NAME} 2>/dev/null || true`);
    } catch {
      // Ignore
    }
  }

  try {
    unlinkSync(file);
    if (process.platform === "linux") {
      try {
        execSync("systemctl --user daemon-reload 2>/dev/null || true");
      } catch {
        // Ignore
      }
    }
    return { message: "Service successfully uninstalled.", success: true };
  } catch (e: any) {
    return { message: `Failed to remove service file: ${e.message}`, success: false };
  }
}

export type ServiceStatus = {
  installed: boolean;
  running: boolean;
  pid?: number;
  plistPath: string;
  logPath: string;
  errPath: string;
};

export function getServiceStatus(): ServiceStatus {
  const file = serviceFilePath();
  const installed = existsSync(file);
  const logPath = stdoutLogPath();
  const errPath = stderrLogPath();

  if (!installed) {
    return {
      errPath,
      installed: false,
      logPath,
      plistPath: file,
      running: false,
    };
  }

  let running = false;
  let pid: number | undefined;

  if (process.platform === "darwin") {
    try {
      const output = execSync("launchctl list 2>/dev/null", { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.includes(SERVICE_LABEL)) {
          const parts = line.trim().split(/\s+/);
          if (parts[0] && parts[0] !== "-") {
            pid = Number(parts[0]);
            running = Number.isFinite(pid) && pid > 0;
          } else {
            running = false;
          }
          break;
        }
      }
    } catch {
      // Ignore
    }
  } else if (process.platform === "linux") {
    try {
      const statusOut = execSync(`systemctl --user is-active ${SYSTEMD_SERVICE_NAME} 2>/dev/null`, { encoding: "utf8" }).trim();
      running = statusOut === "active";
      if (running) {
        const pidOut = execSync(`systemctl --user show --property=MainPID ${SYSTEMD_SERVICE_NAME} 2>/dev/null`, { encoding: "utf8" }).trim();
        const m = pidOut.match(/MainPID=(\d+)/);
        if (m && m[1]) {
          pid = Number(m[1]);
        }
      }
    } catch {
      // Ignore
    }
  }

  return {
    errPath,
    installed,
    logPath,
    pid,
    plistPath: file,
    running,
  };
}

export function startService(): void {
  const file = serviceFilePath();
  if (!existsSync(file)) {
    throw new Error("Service is not installed. Run 'ai-reporter service install' first.");
  }
  if (process.platform === "darwin") {
    execSync(`launchctl start ${SERVICE_LABEL}`);
  } else if (process.platform === "linux") {
    execSync(`systemctl --user start ${SYSTEMD_SERVICE_NAME}`);
  }
}

export function stopService(): void {
  const file = serviceFilePath();
  if (!existsSync(file)) {
    throw new Error("Service is not installed.");
  }
  if (process.platform === "darwin") {
    execSync(`launchctl stop ${SERVICE_LABEL}`);
  } else if (process.platform === "linux") {
    execSync(`systemctl --user stop ${SYSTEMD_SERVICE_NAME}`);
  }
}

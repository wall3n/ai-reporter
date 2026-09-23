import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export function stateDir(): string {
  const base =
    process.env.AI_REPORTER_STATE_DIR?.trim() ||
    process.env.XDG_STATE_HOME?.trim() ||
    join(homedir(), ".local", "state");
  return join(base, "ai-reporter");
}

export function configDir(): string {
  const base =
    process.env.AI_REPORTER_CONFIG_DIR?.trim() ||
    process.env.XDG_CONFIG_HOME?.trim() ||
    join(homedir(), ".config");
  return join(base, "ai-reporter");
}

export function dbPath(): string {
  return join(stateDir(), "ai-reporter.db");
}

export function spoolDir(): string {
  return join(stateDir(), "telemetry");
}

export function lockPath(): string {
  return join(stateDir(), "ai-reporter.lock");
}

export function ensureDir(dir: string, mode = 0o700): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode });
  }
}

export function writeFileAtomic(
  path: string,
  content: string | Uint8Array,
  mode = 0o600
): void {
  ensureDir(dirname(path));
  const tempPath = `${path}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  writeFileSync(tempPath, content, { mode });
  renameSync(tempPath, path);
}

export function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export function writeJsonAtomic(path: string, data: unknown, mode = 0o600): void {
  writeFileAtomic(path, `${JSON.stringify(data, null, 2)}\n`, mode);
}

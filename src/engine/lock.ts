import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ensureDir, lockPath } from "../core/config";

export type LockResult =
  | { acquired: true; release: () => void }
  | { acquired: false; pid: number };

export function tryAcquireLock(): LockResult {
  const path = lockPath();
  ensureDir(dirname(path));

  if (existsSync(path)) {
    const raw = readFileSync(path, "utf8").trim();
    const pid = Number(raw);
    let alive = false;
    if (Number.isFinite(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        alive = true;
      } catch {
        alive = false;
      }
    }
    if (alive && pid !== process.pid) {
      return { acquired: false, pid };
    }
  }

  writeFileSync(path, `${process.pid}\n`, { mode: 0o600 });

  const release = () => {
    try {
      if (existsSync(path)) {
        const raw = readFileSync(path, "utf8").trim();
        if (Number(raw) === process.pid) {
          unlinkSync(path);
        }
      }
    } catch {
      // Ignored
    }
  };

  return { acquired: true, release };
}

export function acquireLock(): () => void {
  const res = tryAcquireLock();
  if (!res.acquired) {
    throw new Error(`Another AI-Reporter watcher/daemon is running (pid ${res.pid}).`);
  }
  return res.release;
}

export function isLockActive(): { active: boolean; pid?: number } {
  const path = lockPath();
  if (!existsSync(path)) {
    return { active: false };
  }
  try {
    const raw = readFileSync(path, "utf8").trim();
    const pid = Number(raw);
    if (Number.isFinite(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        return { active: true, pid };
      } catch {
        return { active: false, pid };
      }
    }
  } catch {
    // Ignore
  }
  return { active: false };
}

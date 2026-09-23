import { DatabaseSync } from "node:sqlite";
import { existsSync, statSync } from "node:fs";

export function openReadOnly(path: string): DatabaseSync {
  return new DatabaseSync(path, { readOnly: true });
}

export function lastWriteMs(path: string): number {
  const wal = `${path}-wal`;
  return Math.max(
    statSync(path).mtimeMs,
    existsSync(wal) ? statSync(wal).mtimeMs : 0
  );
}

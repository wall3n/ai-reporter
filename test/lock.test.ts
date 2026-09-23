import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { lockPath } from "../src/core/config";
import { tryAcquireLock, isLockActive, acquireLock } from "../src/engine/lock";

test("tryAcquireLock acquires and releases cleanly", () => {
  const path = lockPath();
  // Clear any existing lock from this process
  if (existsSync(path)) {
    try {
      unlinkSync(path);
    } catch {
      // Ignore
    }
  }

  const res1 = tryAcquireLock();
  assert.equal(res1.acquired, true);

  if (res1.acquired) {
    const status = isLockActive();
    assert.equal(status.active, true);
    assert.equal(status.pid, process.pid);

    res1.release();
    assert.equal(existsSync(path), false);
  }
});

test("tryAcquireLock detects active process lock", () => {
  const path = lockPath();
  // Write current process pid to lock
  writeFileSync(path, `${process.pid}\n`);

  // An attempt with current pid allows re-acquiring or maintaining
  const res = tryAcquireLock();
  assert.equal(res.acquired, true);
  if (res.acquired) {
    res.release();
  }
});

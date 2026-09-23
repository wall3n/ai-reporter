import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ReporterDatabase } from "../src/storage/db";
import { canonicalize, type RawEvent } from "../src/core/schema";

test("ReporterDatabase stores events and queries statistics", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "ai-reporter-test-"));
  const dbFile = join(tempDir, "test.db");

  try {
    const db = new ReporterDatabase(dbFile);

    const raw1: RawEvent = {
      eventId: "claude-code:sess-1:req-1",
      harness: "claude-code",
      model: { raw: "claude-3-7-sonnet" },
      occurredAt: "2026-09-23T10:00:00.000Z",
      sessionId: "sess-1",
      tokens: {
        cacheRead: 2000,
        cacheWrite: 0,
        input: 100,
        output: 50,
      },
      type: "usage",
    };

    const raw2: RawEvent = {
      eventId: "antigravity:sess-2:step-1",
      harness: "antigravity",
      model: { raw: "gemini-2-5-pro" },
      occurredAt: "2026-09-23T11:00:00.000Z",
      sessionId: "sess-2",
      tokens: {
        cacheRead: 5000,
        cacheWrite: 0,
        input: 200,
        output: 100,
      },
      type: "usage",
    };

    const ev1 = canonicalize(raw1);
    const ev2 = canonicalize(raw2);

    const inserted = db.insertEvents([ev1, ev2]);
    assert.equal(inserted, 2);

    // Duplicate insert should be ignored
    const dupInserted = db.insertEvents([ev1]);
    assert.equal(dupInserted, 0);

    // Test getSummary
    const summary = db.getSummary();
    assert.equal(summary.totalRequests, 2);
    assert.equal(summary.totalSessions, 2);
    assert.equal(summary.inputTokens, 300);
    assert.equal(summary.outputTokens, 150);
    assert.equal(summary.cacheReadTokens, 7000);
    assert.equal(summary.totalTokens, 300 + 150 + 7000);
    assert.ok(summary.totalCostUsd > 0);

    // Test getHarnessSummaries
    const harnesses = db.getHarnessSummaries();
    assert.equal(harnesses.length, 2);

    // Test cursors
    db.setCursor("test-cursor", { offset: 1234 });
    const cursor = db.getCursor<{ offset: number }>("test-cursor");
    assert.equal(cursor?.offset, 1234);

    db.close();
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ReporterDatabase } from "../src/storage/db";
import { canonicalize, type RawEvent } from "../src/core/schema";

test("ReporterDatabase getPeriodStats computes week, month, and year accurately", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "ai-reporter-periods-test-"));
  const dbFile = join(tempDir, "test.db");

  try {
    const db = new ReporterDatabase(dbFile);

    // Create events across different days in Sep 2026
    const rawEvents: RawEvent[] = [
      // Monday Sep 21
      {
        eventId: "ev-1",
        harness: "claude-code",
        model: { raw: "claude-3-7-sonnet" },
        occurredAt: "2026-09-21T10:00:00.000Z",
        sessionId: "sess-1",
        tokens: { cacheRead: 10000, cacheWrite: 0, input: 1000, output: 500 },
        type: "usage",
      },
      // Tuesday Sep 22
      {
        eventId: "ev-2",
        harness: "antigravity",
        model: { raw: "gemini-2-5-pro" },
        occurredAt: "2026-09-22T14:30:00.000Z",
        sessionId: "sess-2",
        tokens: { cacheRead: 20000, cacheWrite: 0, input: 2000, output: 1000 },
        type: "usage",
      },
      // Earlier in month: Sep 05
      {
        eventId: "ev-3",
        harness: "opencode",
        model: { raw: "gpt-4o" },
        occurredAt: "2026-09-05T09:00:00.000Z",
        sessionId: "sess-3",
        tokens: { cacheRead: 5000, cacheWrite: 0, input: 500, output: 250 },
        type: "usage",
      },
      // Earlier in year: Jun 15
      {
        eventId: "ev-4",
        harness: "cursor",
        model: { raw: "claude-3-5-sonnet" },
        occurredAt: "2026-06-15T12:00:00.000Z",
        sessionId: "sess-4",
        tokens: { cacheRead: 8000, cacheWrite: 0, input: 800, output: 400 },
        type: "usage",
      },
    ];

    const inserted = db.insertEvents(rawEvents.map((r) => canonicalize(r)));
    assert.equal(inserted, 4);

    // Reference date: Wednesday Sep 23, 2026
    const refDate = new Date("2026-09-23T12:00:00.000Z");

    // 1. Week View
    const weekStats = db.getPeriodStats("week", 0, refDate);
    assert.equal(weekStats.type, "week");
    assert.ok(weekStats.label.includes("Week"));
    assert.equal(weekStats.buckets.length, 7); // 7 days Mon-Sun
    // Sep 21 and Sep 22 are in this week (total tokens = (10k+1k+500) + (20k+2k+1k) = 11,500 + 23,000 = 34,500)
    assert.equal(weekStats.summary.totalRequests, 2);
    assert.equal(weekStats.summary.totalTokens, 34500);
    assert.equal(weekStats.harnesses.length, 2);
    assert.ok(weekStats.funMetrics.waterLiters > 0);

    // Test bucket mapping
    const monBucket = weekStats.buckets.find((b) => b.key === "2026-09-21");
    assert.ok(monBucket);
    assert.equal(monBucket.requests, 1);
    assert.equal(monBucket.tokens, 11500);

    const tueBucket = weekStats.buckets.find((b) => b.key === "2026-09-22");
    assert.ok(tueBucket);
    assert.equal(tueBucket.requests, 1);
    assert.equal(tueBucket.tokens, 23000);

    // 2. Month View (September 2026)
    const monthStats = db.getPeriodStats("month", 0, refDate);
    assert.equal(monthStats.type, "month");
    assert.equal(monthStats.label, "September 2026");
    assert.equal(monthStats.buckets.length, 30); // Sep has 30 days
    // Sep 05, Sep 21, Sep 22 are in this month (3 events)
    assert.equal(monthStats.summary.totalRequests, 3);
    assert.equal(monthStats.summary.totalTokens, 11500 + 23000 + 5750);
    assert.equal(monthStats.harnesses.length, 3);
    assert.ok(monthStats.funMetrics.drownLakes >= 0);

    // 3. Year View (Year 2026)
    const yearStats = db.getPeriodStats("year", 0, refDate);
    assert.equal(yearStats.type, "year");
    assert.equal(yearStats.label, "Year 2026");
    assert.equal(yearStats.buckets.length, 12); // 12 months
    // All 4 events are in 2026
    assert.equal(yearStats.summary.totalRequests, 4);
    assert.equal(yearStats.harnesses.length, 4);

    const junBucket = yearStats.buckets.find((b) => b.key === "2026-06");
    assert.ok(junBucket);
    assert.equal(junBucket.requests, 1);
    assert.equal(junBucket.tokens, 9200);

    const sepBucket = yearStats.buckets.find((b) => b.key === "2026-09");
    assert.ok(sepBucket);
    assert.equal(sepBucket.requests, 3);

    // 4. Period Navigation with Offset
    const prevYearStats = db.getPeriodStats("year", -1, refDate);
    assert.equal(prevYearStats.label, "Year 2025");
    assert.equal(prevYearStats.summary.totalRequests, 0);

    db.close();
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
});

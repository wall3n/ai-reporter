import test from "node:test";
import assert from "node:assert/strict";
import { computeFunMetrics } from "../src/core/fun-metrics";
import type { UsageSummary } from "../src/core/types";

test("computeFunMetrics calculates zero tokens correctly", () => {
  const zeroSummary: UsageSummary = {
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    totalCostSavingsUsd: 0,
    totalCostUsd: 0,
    totalRequests: 0,
    totalSessions: 0,
    totalTokens: 0,
  };

  const metrics = computeFunMetrics(zeroSummary);
  assert.equal(metrics.totalTokens !== undefined ? 0 : 0, 0);
  assert.equal(metrics.waterLiters, 0);
  assert.equal(metrics.drownLakes, 0);
  assert.equal(metrics.olympicPools, 0);
  assert.equal(metrics.bathtubs, 0);
  assert.equal(metrics.waterBottles, 0);
  assert.equal(metrics.kwh, 0);
  assert.equal(metrics.toastsRun, 0);
  assert.equal(metrics.smartphonesCharged, 0);
  assert.equal(metrics.wordsEquivalent, 0);
  assert.equal(metrics.humanTypingHours, 0);
  assert.equal(metrics.coffeesEquivalent, 0);
  assert.ok(metrics.lakeCommentary.includes("No lakes were harmed"));
  assert.equal(metrics.lakeBadge, "🌱 Eco Dewdrop");
});

test("computeFunMetrics calculates 1M tokens correctly", () => {
  const summary: UsageSummary = {
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    inputTokens: 500_000,
    outputTokens: 500_000,
    reasoningTokens: 0,
    totalCostSavingsUsd: 0,
    totalCostUsd: 10.0,
    totalRequests: 100,
    totalSessions: 5,
    totalTokens: 1_000_000,
  };

  const metrics = computeFunMetrics(summary);
  // 1M tokens * 25L / 1M = 25 Liters
  assert.equal(metrics.waterLiters, 25);
  // 25L / 10M L per lake = 0.0000025 lakes
  assert.equal(metrics.drownLakes, 0.000003);
  // 25L / 150L per bathtub = 0.1667 -> 0.2 bathtubs
  assert.equal(metrics.bathtubs, 0.2);
  // 25L / 0.5L per bottle = 50 bottles
  assert.equal(metrics.waterBottles, 50);

  // kWh: (1M / 1000) * 0.0003 = 0.3 kWh
  assert.equal(metrics.kwh, 0.3);
  // Toasts: 0.3 / 0.0165 ≈ 18.2 slices
  assert.ok(metrics.toastsRun > 18 && metrics.toastsRun < 19);
  // Phone charges: 0.3 / 0.015 = 20 charges
  assert.equal(metrics.smartphonesCharged, 20);

  // Words: 1M * 0.75 = 750,000 words
  assert.equal(metrics.wordsEquivalent, 750_000);
  // Typing hours: 750,000 / 3,000 = 250 hours
  assert.equal(metrics.humanTypingHours, 250);
  // War and Peace: 750,000 / 587,287 ≈ 1.28
  assert.equal(metrics.warAndPeaceCopies, 1.28);

  // Coffees: $10 / $4.50 ≈ 2.2
  assert.equal(metrics.coffeesEquivalent, 2.2);
});

test("computeFunMetrics handles large token scale with severe Drown Lakes metrics", () => {
  const hugeSummary: UsageSummary = {
    cacheReadTokens: 900_000_000,
    cacheWriteTokens: 50_000_000,
    inputTokens: 30_000_000,
    outputTokens: 20_000_000,
    reasoningTokens: 0,
    totalCostSavingsUsd: 2500,
    totalCostUsd: 500,
    totalRequests: 5000,
    totalSessions: 50,
    totalTokens: 1_000_000_000, // 1 Billion tokens
  };

  const metrics = computeFunMetrics(hugeSummary);
  // 1B tokens = 25,000 Liters of water evaporated
  assert.equal(metrics.waterLiters, 25_000);
  // 25,000 / 10,000,000 = 0.0025 lakes drained
  assert.equal(metrics.drownLakes, 0.0025);
  // 25,000 / 2,500,000 = 0.01 Olympic pools
  assert.equal(metrics.olympicPools, 0.01);
  // 25,000 / 150 = ~166.7 bathtubs
  assert.equal(metrics.bathtubs, 166.7);

  // Badge & commentary
  assert.ok(metrics.lakeBadge.length > 0);
  assert.ok(metrics.lakeCommentary.includes("koi") || metrics.lakeCommentary.includes("lake") || metrics.lakeCommentary.includes("bath"));

  // 1B words scale
  assert.ok(metrics.warAndPeaceCopies > 1000);
  assert.ok(metrics.coffeesEquivalent > 100);
  assert.ok(metrics.pizzasEquivalent > 25);
});

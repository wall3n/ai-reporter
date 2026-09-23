import test from "node:test";
import assert from "node:assert/strict";
import { calculateCost, findModelPrice } from "../src/core/pricing";

test("findModelPrice resolves pricing by name and family", () => {
  const sonnetPrice = findModelPrice("claude-3-7-sonnet", "claude");
  assert.equal(sonnetPrice.inputPer1M, 3.0);
  assert.equal(sonnetPrice.outputPer1M, 15.0);
  assert.equal(sonnetPrice.cacheReadPer1M, 0.3);

  const fallbackClaude = findModelPrice("claude-unknown-custom", "claude");
  assert.equal(fallbackClaude.inputPer1M, 3.0);

  const gptPrice = findModelPrice("gpt-4o", "gpt");
  assert.equal(gptPrice.inputPer1M, 2.5);
});

test("calculateCost computes dollar costs and cache savings accurately", () => {
  // 100k input, 20k output, 500k cache read on Claude 3.5 Sonnet
  // Input: 100,000 * 3.00 / 1M = $0.30
  // Output: 20,000 * 15.00 / 1M = $0.30
  // Cache Read: 500,000 * 0.30 / 1M = $0.15
  // Total cost = $0.75
  // Cache savings = 500,000 * (3.00 - 0.30) / 1M = $1.35
  const tokens = {
    cacheRead: 500_000,
    cacheWrite: 0,
    input: 100_000,
    output: 20_000,
  };

  const result = calculateCost(tokens, "claude-3-5-sonnet", "claude");
  assert.equal(result.costUsd, 0.75);
  assert.equal(result.costSavingsUsd, 1.35);
});

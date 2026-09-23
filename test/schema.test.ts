import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalize,
  canonicalModel,
  eventId,
  modelFamily,
  modelName,
  totalTokens,
  validateEvent,
  type RawEvent,
} from "../src/core/schema";

test("modelFamily classifies model strings correctly", () => {
  assert.equal(modelFamily("claude-3-7-sonnet"), "claude");
  assert.equal(modelFamily("anthropic/claude-3-5-haiku-20241022"), "claude");
  assert.equal(modelFamily("gpt-4o"), "gpt");
  assert.equal(modelFamily("openai/o3-mini"), "gpt");
  assert.equal(modelFamily("gemini-2.5-pro"), "gemini");
  assert.equal(modelFamily("deepseek-chat"), "deepseek");
  assert.equal(modelFamily("qwen-2.5-coder-32b"), "qwen");
});

test("modelName sanitizes provider tags and versions", () => {
  assert.equal(modelName("anthropic/claude-sonnet-4.5"), "claude-sonnet-4-5");
  assert.equal(modelName("claude-sonnet-4-5-20250929"), "claude-sonnet-4-5");
  assert.equal(modelName("models/gemini-2.5-pro"), "gemini-2-5-pro");
});

test("totalTokens computes accurate sum of all 4 counters", () => {
  const sum = totalTokens({
    cacheRead: 100,
    cacheWrite: 50,
    input: 200,
    output: 300,
    reasoning: 50,
  });
  assert.equal(sum, 650);
});

test("canonicalize produces valid TelemetryEvent", () => {
  const raw: RawEvent = {
    eventId: eventId("claude-code", "sess-123", "msg-456"),
    harness: "claude-code",
    model: { raw: "claude-3-5-sonnet-20241022" },
    occurredAt: "2026-09-23T12:00:00.000Z",
    sessionId: "sess-123",
    tokens: {
      cacheRead: 1000,
      cacheWrite: 0,
      input: 500,
      output: 200,
    },
    type: "usage",
  };

  const event = canonicalize(raw);
  assert.equal(event.eventId, "claude-code:sess-123:msg-456");
  assert.equal(event.tokens.total, 1700);
  assert.equal(event.model.name, "claude-3-5-sonnet");
  assert.equal(event.model.family, "claude");
  assert.ok(event.costUsd > 0);

  const errors = validateEvent(event);
  assert.deepEqual(errors, []);
});

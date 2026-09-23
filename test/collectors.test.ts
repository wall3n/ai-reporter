import test from "node:test";
import assert from "node:assert/strict";
import { decodeMessage } from "../src/collectors/antigravity";
import { normalizeClaudeCode } from "../src/collectors/claude-code";
import { normalizeCursorHook } from "../src/collectors/cursor";
import { normalizeOpenCode } from "../src/collectors/opencode";

test("decodeMessage parses varint protobuf fields", () => {
  // Field 1 (tag 8, varint) = 42
  const bytes = new Uint8Array([0x08, 0x2a]);
  const fields = decodeMessage(bytes);
  assert.equal(fields.length, 1);
  assert.equal(fields[0]?.number, 1);
  assert.equal(fields[0]?.value, 42);
});

test("normalizeClaudeCode parses assistant lines with usage", () => {
  const line = {
    apiBlockIndex: 0,
    cwd: "/Users/test/project",
    gitBranch: "main",
    message: {
      id: "msg_123",
      model: "claude-3-5-sonnet-20241022",
      usage: {
        cache_creation_input_tokens: 10,
        cache_read_input_tokens: 50,
        input_tokens: 100,
        output_tokens: 200,
      },
    },
    requestId: "req_abc",
    sessionId: "sess_xyz",
    timestamp: "2026-09-23T15:00:00.000Z",
    type: "assistant",
    version: "2.1.261",
  };

  const event = normalizeClaudeCode(line);
  assert.ok(event);
  assert.equal(event?.harness, "claude-code");
  assert.equal(event?.sessionId, "sess_xyz");
  assert.equal(event?.tokens?.input, 100);
  assert.equal(event?.tokens?.output, 200);
  assert.equal(event?.tokens?.cacheRead, 50);
  assert.equal(event?.tokens?.cacheWrite, 10);
});

test("normalizeCursorHook parses hook records", () => {
  const record = {
    cache_read_tokens: 300,
    cache_write_tokens: 0,
    conversation_id: "conv-1",
    generation_id: "gen-1",
    input_tokens: 150,
    model: "claude-3.5-sonnet",
    occurred_at: "2026-09-23T15:00:00.000Z",
    output_tokens: 80,
    workspace_roots: ["/Users/test/workspace"],
  };

  const event = normalizeCursorHook(record);
  assert.ok(event);
  assert.equal(event?.harness, "cursor");
  assert.equal(event?.tokens?.input, 150);
  assert.equal(event?.tokens?.output, 80);
  assert.equal(event?.tokens?.cacheRead, 300);
});

test("normalizeOpenCode parses assistant message row", () => {
  const row = {
    data: JSON.stringify({
      cost: 0.05,
      modelID: "claude-3-5-sonnet",
      path: { cwd: "/Users/test/repo" },
      providerID: "anthropic",
      role: "assistant",
      time: { completed: 1774350000000, created: 1774349990000 },
      tokens: {
        cache: { read: 500, write: 0 },
        input: 100,
        output: 200,
        reasoning: 50,
        total: 850,
      },
    }),
    id: "msg-opencode-1",
    session_id: "sess-opencode-1",
    time_updated: 1774350000000,
  };

  const event = normalizeOpenCode(row);
  assert.ok(event);
  assert.equal(event?.harness, "opencode");
  assert.equal(event?.tokens?.input, 100);
  assert.equal(event?.tokens?.output, 250); // includes reasoning
  assert.equal(event?.tokens?.cacheRead, 500);
  assert.equal(event?.costUsd, 0.05);
});

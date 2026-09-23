import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { generatePlist, getCliEntry, SERVICE_LABEL } from "../src/service/launchd";

test("generatePlist creates expected launchd XML configuration", () => {
  const plist = generatePlist("/usr/local/bin/node", "/opt/ai-reporter/dist/index.js");
  assert.ok(plist.includes(`<string>${SERVICE_LABEL}</string>`));
  assert.ok(plist.includes("<string>/usr/local/bin/node</string>"));
  assert.ok(plist.includes("<string>/opt/ai-reporter/dist/index.js</string>"));
  assert.ok(plist.includes("<string>daemon</string>"));
  assert.ok(plist.includes("<string>run</string>"));
  assert.ok(plist.includes("<key>RunAtLoad</key>"));
  assert.ok(plist.includes("<true/>"));
});

test("getCliEntry resolves without throwing ReferenceError for __dirname", () => {
  const entry = getCliEntry();
  assert.ok(typeof entry === "string" && entry.length > 0);
  assert.ok(existsSync(entry), `Entry path ${entry} should exist`);
});

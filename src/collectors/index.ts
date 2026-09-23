import type { Collector } from "../core/types";
import { antigravityCollector } from "./antigravity";
import { claudeCodeCollector } from "./claude-code";
import { cursorCollector } from "./cursor";
import { openCodeCollector } from "./opencode";
import { copilotCollector } from "./copilot";
import { geminiCliCollector } from "./gemini-cli";
import { codexCollector } from "./codex";
import { clineCollector } from "./cline";
import { devinCollector } from "./devin";
import { ompCollector, piCollector } from "./pi";
import { qwenCodeCollector } from "./qwen-code";
import { kiloCodeCollector } from "./kilo-code";

export {
  antigravityCollector,
  claudeCodeCollector,
  cursorCollector,
  openCodeCollector,
  copilotCollector,
  geminiCliCollector,
  codexCollector,
  clineCollector,
  devinCollector,
  piCollector,
  ompCollector,
  qwenCodeCollector,
  kiloCodeCollector,
};

export const ALL_COLLECTORS: Collector[] = [
  antigravityCollector,
  claudeCodeCollector,
  cursorCollector,
  openCodeCollector,
  copilotCollector,
  geminiCliCollector,
  codexCollector,
  clineCollector,
  devinCollector,
  piCollector,
  ompCollector,
  qwenCodeCollector,
  kiloCodeCollector,
];

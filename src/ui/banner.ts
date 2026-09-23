import { BRAND, c, colorEnabled, width } from "./style";

const ROWS = 6;

const GLYPHS: Record<string, string[]> = {
  A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  I: ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
  " ": ["   ", "   ", "   ", "   ", "   ", "   "],
  "-": ["      ", "      ", "██████", "╚═════╝", "      ", "      "],
  R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  P: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔═══╝ ", "██║     ", "╚═╝     "],
  O: [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  T: ["████████╗", "╚══██╔══╝", "   ██║   ", "   ██║   ", "   ██║   ", "   ╚═╝   "],
};

export function wordmarkRows(word = "AI REPORTER"): string[] {
  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(
      [...word]
        .map((ch) => {
          const glyph = GLYPHS[ch] ?? GLYPHS[" "];
          return glyph![r] ?? "";
        })
        .join("")
    );
  }
  return rows;
}

export const WORDMARK_WIDTH = (wordmarkRows()[0] ?? "").length;

const CYAN_GOLD_GRADIENT = [
  [56, 189, 248], // Sky cyan
  [45, 212, 191], // Teal cyan
  [52, 211, 153], // Emerald
  [234, 182, 25], // Gold
  [245, 158, 11], // Amber
  [217, 107, 42], // Orange
] as const;

function tint(text: string, row: number): string {
  if (!colorEnabled) {
    return text;
  }
  const [r, g, b] = CYAN_GOLD_GRADIENT[Math.min(row, CYAN_GOLD_GRADIENT.length - 1)] ?? [
    255, 255, 255,
  ];
  return `\x1B[38;2;${r};${g};${b}m${text}\x1B[39m`;
}

export function wordmarkLines(word = "AI REPORTER"): string[] {
  return wordmarkRows(word).map((row, i) => tint(row, i));
}

export function banner(
  tagline = "24/7 AI Token & Spend Tracker · All Coding Agents",
  columns = process.stdout.columns ?? 80
): string {
  if (columns < WORDMARK_WIDTH + 2) {
    return `${BRAND} ${c.dim(`· ${tagline}`)}`;
  }
  return `${wordmarkLines().join("\n")}\n${c.dim(tagline)}`;
}

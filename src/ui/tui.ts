import { c, rgb, stripAnsi, width } from "./style";

export const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const GRAPHEMES = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function pad(text: string, size: number): string {
  return text + " ".repeat(Math.max(0, size - width(text)));
}

export function padLeft(text: string, size: number): string {
  return " ".repeat(Math.max(0, size - width(text))) + text;
}

export function fit(text: string, max: number): string {
  if (width(text) <= max) {
    return text;
  }
  let out = "";
  for (const { segment: ch } of GRAPHEMES.segment(stripAnsi(text))) {
    if (width(`${out}${ch}`) > Math.max(0, max - 1)) {
      break;
    }
    out += ch;
  }
  return `${out}…`;
}

export function wrap(text: string, w: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && width(`${current} ${word}`) > w) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length ? lines : [""];
}

export type BoxAccent = "gold" | "cyan" | "teal" | "purple" | "green" | "dim";

export type BoxOptions = {
  title: string;
  subtitle?: string;
  accent?: BoxAccent;
  height?: number;
};

const accentPaint: Record<BoxAccent, (text: string) => string> = {
  cyan: c.cyan,
  dim: c.dim,
  gold: c.gold,
  green: c.green,
  purple: c.purple,
  teal: c.teal,
};

export function box(options: BoxOptions, lines: string[], w: number): string[] {
  const inner = Math.max(4, w - 4);
  const border = accentPaint[options.accent ?? "cyan"];
  const title = `${border("╭─ ")}${c.bold(options.title)}${border(" ")}`;
  const sub = options.subtitle
    ? `${c.dim(options.subtitle)}${border(" ")}`
    : "";
  const filler = Math.max(0, w - width(title) - width(sub) - 1);
  const top = `${title}${border("─".repeat(filler))}${sub}${border("╮")}`;
  const rows =
    options.height === undefined ? [...lines] : lines.slice(0, options.height);
  while (options.height !== undefined && rows.length < options.height) {
    rows.push("");
  }
  const body = rows.map(
    (line) => `${border("│")} ${pad(fit(line, inner), inner)} ${border("│")}`
  );
  const bottom = border(`╰${"─".repeat(Math.max(0, w - 2))}╯`);
  return [top, ...body, bottom];
}

export function kvLines(rows: [string, string][], inner: number): string[] {
  if (rows.length === 0) {
    return [];
  }
  const keyW = Math.max(...rows.map(([key]) => width(key)));
  return rows.map(([key, value]) => {
    const keyPad = `${c.dim(pad(key, keyW))}  `;
    return `${keyPad}${fit(value, Math.max(8, inner - width(keyPad)))}`;
  });
}

export function gauge(
  fraction: number,
  size: number,
  color: (text: string) => string = c.cyan
): string {
  const safeFraction = Math.max(0, Math.min(1, fraction));
  const filled = Math.round(safeFraction * size);
  return `${color("█".repeat(filled))}${c.dim("░".repeat(Math.max(0, size - filled)))}`;
}

export function compactNumber(num: number): string {
  if (!Number.isFinite(num) || num === 0) {
    return "0";
  }
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return num.toLocaleString("en-US");
}

export function formatUsd(dollars: number): string {
  if (dollars === 0) {
    return "$0.00";
  }
  if (dollars < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function formatAgo(timestampMs: number, now = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((now - timestampMs) / 1000));
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

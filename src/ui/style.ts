/**
 * Terminal colors and text formatting for AI-Reporter.
 */

export const colorEnabled: boolean =
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb" &&
  (Boolean(process.env.FORCE_COLOR) || Boolean(process.stdout.isTTY));

function wrap(open: string, close = "\x1B[39m") {
  return (text: string): string =>
    colorEnabled ? `${open}${text}${close}` : text;
}

export const rgb = (r: number, g: number, b: number) =>
  `\x1B[38;2;${r};${g};${b}m`;

export const c = {
  bold: wrap("\x1b[1m", "\x1b[22m"),
  dim: wrap("\x1b[2m", "\x1b[22m"),
  italic: wrap("\x1b[3m", "\x1b[23m"),
  cyan: wrap("\x1b[36m"),
  green: wrap("\x1b[32m"),
  yellow: wrap("\x1b[33m"),
  blue: wrap("\x1b[34m"),
  magenta: wrap("\x1b[35m"),
  red: wrap("\x1b[31m"),
  gold: wrap(rgb(234, 182, 25)),
  orange: wrap(rgb(217, 107, 42)),
  purple: wrap(rgb(139, 92, 246)),
  teal: wrap(rgb(53, 133, 138)),
  navy: wrap(rgb(143, 184, 209)),
};

export const BRAND = `${c.cyan("✦")} ${c.bold(c.gold("AI-Reporter"))}`;

const ANSI_REGEX =
  /[\u001B\u009B][[()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, "");
}

const CONTROL_CHARACTERS = /\p{Cc}/gu;
const BIDI_CONTROL = /\p{Bidi_Control}/gu;

export function terminalText(text: string): string {
  return stripAnsi(text)
    .replaceAll(BIDI_CONTROL, "")
    .replaceAll(CONTROL_CHARACTERS, (character) =>
      character === "\n" || character === "\t" ? character : ""
    );
}

const GRAPHEMES = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Calculates visible width of terminal string (ignoring ANSI, counting emojis / wide chars as 2).
 */
export function width(text: string): number {
  const clean = stripAnsi(text);
  let len = 0;
  for (const { segment } of GRAPHEMES.segment(clean)) {
    const code = segment.codePointAt(0) ?? 0;
    // Check for wide chars / emojis
    if (
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2329 && code <= 0x232a) ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x1f300 && code <= 0x1f64f) ||
      (code >= 0x1f900 && code <= 0x1f9ff)
    ) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

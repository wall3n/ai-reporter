import { BRAND, c, terminalText } from "./style";
import { renderTable } from "./table";
import { box, kvLines, wrap } from "./tui";

const INDENT = "  ";

export const MARK = {
  err: c.red("✗"),
  info: c.cyan("●"),
  ok: c.green("✓"),
  step: c.gold("·"),
  warn: c.yellow("!"),
};

export class Ui {
  private isJson: boolean;

  constructor(json = false) {
    this.isJson = json;
  }

  public intro(title: string): void {
    if (this.isJson) return;
    console.log(`\n${INDENT}${BRAND} ${c.dim("·")} ${c.bold(c.cyan(title))}`);
  }

  public outro(message: string): void {
    if (this.isJson) return;
    console.log(`${INDENT}${c.dim(message)}\n`);
  }

  public info(message: string): void {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.info}  ${line}`);
    }
  }

  public success(message: string): void {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.ok}  ${line}`);
    }
  }

  public warn(message: string): void {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.warn}  ${line}`);
    }
  }

  public error(message: string): void {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.err}  ${line}`);
    }
  }

  public line(text = ""): void {
    if (this.isJson) return;
    for (const l of text.split("\n")) {
      console.log(l ? `${INDENT}${l}` : "");
    }
  }

  public kv(rows: [string, string][], w = (process.stdout.columns ?? 80) - 4): void {
    if (this.isJson) return;
    for (const l of kvLines(rows, w)) {
      console.log(`${INDENT}${l}`);
    }
  }

  public table(rows: string[][], header?: string[]): void {
    if (this.isJson) return;
    const str = renderTable(rows, header);
    for (const l of str.split("\n")) {
      console.log(`${INDENT}${l}`);
    }
  }

  public card(title: string, body: string, accent?: any): void {
    if (this.isJson) return;
    const w = Math.min(100, Math.max(40, (process.stdout.columns ?? 80) - 4));
    const inner = w - 4;
    const lines = body.split("\n").flatMap((l) => wrap(l, inner));
    const b = box({ accent, title }, lines, w);
    for (const l of b) {
      console.log(`${INDENT}${l}`);
    }
  }

  public json(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
  }
}

export const ui = new Ui();

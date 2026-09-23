import { c, width } from "./style";
import { pad, padLeft } from "./tui";

export type ColumnAlign = "left" | "right";

export function renderTable(
  rows: string[][],
  header?: string[],
  alignments?: ColumnAlign[]
): string {
  const all = header ? [header, ...rows] : rows;
  if (all.length === 0) {
    return "";
  }
  const widths: number[] = [];
  for (const row of all) {
    for (const [i, cell] of row.entries()) {
      widths[i] = Math.max(widths[i] ?? 0, width(cell));
    }
  }

  const renderRow = (row: string[], isHeader = false) =>
    row
      .map((cell, i) => {
        const align = alignments?.[i] ?? "left";
        const w = widths[i] ?? 0;
        return align === "right" ? padLeft(cell, w) : pad(cell, w);
      })
      .join("  ")
      .trimEnd();

  const lines = all.map((r, i) => renderRow(r, i === 0 && Boolean(header)));
  if (header) {
    lines[0] = c.bold(lines[0] ?? "");
    lines.splice(1, 0, c.dim(widths.map((w) => "─".repeat(w)).join("  ")));
  }
  return lines.join("\n");
}

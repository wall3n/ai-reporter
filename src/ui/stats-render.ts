import type { PeriodStats } from "../core/types";
import { c, stripAnsi, width } from "./style";
import { box, compactNumber, fit, formatUsd, gauge, pad, padLeft } from "./tui";
import { renderTable } from "./table";
import { HARNESS_INFO } from "./screen";

export type StatsRenderOptions = {
  cols?: number;
  interactive?: boolean;
  activeTab?: "week" | "month" | "year";
};

export function renderStatsLines(stats: PeriodStats, options: StatsRenderOptions = {}): string[] {
  const cols = options.cols ?? (process.stdout.columns || 80);
  const isInteractive = Boolean(options.interactive);
  const cardW = Math.min(cols - 4, 110);
  const lines: string[] = [];

  // 1. Period Selector & Navigation Bar
  const tabWeek = stats.type === "week" ? c.bold(c.gold("● [W] Week")) : c.dim("○ [w] Week");
  const tabMonth = stats.type === "month" ? c.bold(c.gold("● [M] Month")) : c.dim("○ [m] Month");
  const tabYear = stats.type === "year" ? c.bold(c.gold("● [Y] Year")) : c.dim("○ [y] Year");

  const navLeft = isInteractive ? c.dim("◄ [h/←] ") : "";
  const navRight = isInteractive ? c.dim(" [l/→] ►") : "";
  const periodTitle = `${navLeft}${c.bold(c.cyan(`📅 ${stats.label}`))}${navRight}`;
  const rangeTag = c.dim(`(${stats.rangeLabel})`);

  lines.push(`  ${c.bold(c.cyan("✦ AI-Reporter"))} ${c.dim("·")} ${c.bold("Usage & Spend Statistics")}  ${c.dim("│")}  ${tabWeek}  ${tabMonth}  ${tabYear}`);
  lines.push(`  ${periodTitle}  ${rangeTag}`);
  lines.push("");

  // 2. Overview Card with deltas
  const s = stats.summary;
  const tokenDelta =
    stats.tokenDeltaPercent !== undefined
      ? stats.tokenDeltaPercent >= 0
        ? c.orange(` ▲ +${stats.tokenDeltaPercent}%`)
        : c.green(` ▼ ${stats.tokenDeltaPercent}%`)
      : "";
  const costDelta =
    stats.costDeltaPercent !== undefined
      ? stats.costDeltaPercent >= 0
        ? c.orange(` ▲ +${stats.costDeltaPercent}%`)
        : c.green(` ▼ ${stats.costDeltaPercent}%`)
      : "";
  const prevNote = stats.prevLabel ? c.dim(` vs ${stats.prevLabel}`) : "";

  const overviewRows = [
    `Total Tokens:  ${c.bold(compactNumber(s.totalTokens))} tokens${tokenDelta}${prevNote}  ${c.dim("across")} ${compactNumber(s.totalRequests)} requests (${compactNumber(s.totalSessions)} sessions)`,
    `Total Spend:   ${c.bold(c.gold(formatUsd(s.totalCostUsd)))}${costDelta}${prevNote}  ${c.dim("·")}  Saved by Cache: ${c.green(formatUsd(s.totalCostSavingsUsd))}`,
    `Token Split:   ${compactNumber(s.inputTokens)} in  ${c.dim("·")}  ${compactNumber(s.outputTokens)} out  ${c.dim("·")}  ${compactNumber(s.cacheReadTokens)} cache read  ${c.dim("·")}  ${compactNumber(s.cacheWriteTokens)} cache write`,
  ];

  const overviewBox = box(
    { accent: "cyan", title: `${stats.label} Overview` },
    overviewRows,
    cardW
  );
  for (const l of overviewBox) lines.push(`  ${l}`);
  lines.push("");

  // 3. Fun Metrics Card (Drown Lakes, Toasters, Books, Coffee)
  const f = stats.funMetrics;
  const funRows: string[] = [];

  // Section A: Drown Lakes & Water Evaporation
  const lakesFmt = f.drownLakes >= 0.01 ? f.drownLakes.toFixed(4) : f.drownLakes >= 0.0001 ? f.drownLakes.toFixed(5) : f.drownLakes.toFixed(6);
  funRows.push(
    `${c.bold(c.cyan("🌊 Water Footprint (\"Drown Lakes\"):"))} ${c.bold(c.gold(`${lakesFmt} lakes drained`))} ${c.dim(`[${f.lakeBadge}]`)}`
  );
  funRows.push(
    `   💧 ${compactNumber(f.waterLiters)} L cooling water evaporated  ${c.dim("≈")}  🏊 ${f.olympicPools} Olympic pools  ${c.dim("·")}  🛁 ${compactNumber(f.bathtubs)} bathtubs  ${c.dim("·")}  🥤 ${compactNumber(f.waterBottles)} bottles`
  );
  funRows.push(`   ${c.italic(f.lakeCommentary)}`);
  funRows.push("");

  // Section B: Energy & Appliances
  funRows.push(
    `${c.bold(c.gold("⚡ Compute Energy & Hardware:"))} ${c.bold(`${f.kwh} kWh`)}`
  );
  funRows.push(
    `   🍞 ${compactNumber(f.toastsRun)} slices of bread toasted  ${c.dim("·")}  📱 ${compactNumber(f.smartphonesCharged)} phone charges  ${c.dim("·")}  💡 ${compactNumber(f.ledLightbulbHours)}h LED lightbulb`
  );
  funRows.push(
    `   🌱 ${f.co2Kg} kg CO₂ emitted  ${c.dim("≈")}  🚗 ${compactNumber(f.carKmDriven)} km driven in car  ${c.dim("·")}  🌳 ${f.treeYearsToOffset} tree-years to absorb`
  );
  funRows.push("");

  // Section C: Human Typing & Literature
  const typingFmt =
    f.humanTypingDays >= 1
      ? `${f.humanTypingDays} continuous days (${compactNumber(f.humanTypingHours)}h)`
      : `${f.humanTypingHours} continuous hours`;
  funRows.push(
    `${c.bold(c.purple("⌨️  Human Scale & Literature:"))} ${compactNumber(f.wordsEquivalent)} words generated`
  );
  funRows.push(
    `   ✍️  Typing equivalent: ${typingFmt} non-stop at 50 WPM`
  );
  funRows.push(
    `   📚 ${f.warAndPeaceCopies}x copies of War & Peace  ${c.dim("·")}  🧙 ${f.harryPotterSeries}x complete Harry Potter box sets`
  );
  funRows.push("");

  // Section D: Developer Sustenance & Cash Equivalencies
  funRows.push(
    `${c.bold(c.teal("☕ Developer Fuel & Cost Equivalents:"))}`
  );
  funRows.push(
    `   ☕ ${compactNumber(f.coffeesEquivalent)} specialty oat flat whites  ${c.dim("·")}  🍕 ${compactNumber(f.pizzasEquivalent)} artisan pizzas`
  );

  const funBox = box(
    { accent: "gold", title: "🌊 Fun Metrics: Environmental & Physical Footprint" },
    funRows,
    cardW
  );
  for (const l of funBox) lines.push(`  ${l}`);
  lines.push("");

  // 4. Activity Histogram (Buckets)
  const maxTokens = Math.max(...stats.buckets.map((b) => b.tokens), 1);
  const activeBuckets = stats.buckets.filter((b) => b.tokens > 0 || stats.type === "week" || stats.type === "year");
  
  if (activeBuckets.length > 0) {
    const histTitle =
      stats.type === "week"
        ? "✦ Daily Breakdown (This Week):"
        : stats.type === "month"
          ? `✦ Daily Activity (${stats.label}):`
          : `✦ Monthly Activity (${stats.label}):`;
    lines.push(`  ${c.bold(c.cyan(histTitle))}`);

    // If month has lots of days, limit display or render smartly
    const displayBuckets =
      stats.type === "month" && activeBuckets.length > 16
        ? stats.buckets.filter((b) => b.tokens > 0)
        : activeBuckets;

    const gaugeSize = Math.max(10, Math.min(22, cols - 65));
    for (const b of displayBuckets) {
      const frac = b.tokens / maxTokens;
      const bar = gauge(frac, gaugeSize, c.cyan);
      const isToday = b.key === new Date().toISOString().slice(0, 10);
      const keyFmt = isToday ? c.bold(c.gold(`${b.label}*`)) : c.dim(b.label);
      lines.push(
        `    ${pad(keyFmt, 12)} ${bar}  ${compactNumber(b.tokens).padStart(7)} tokens  ${c.gold(formatUsd(b.costUsd)).padStart(8)}  ${c.dim(`(${compactNumber(b.requests)} reqs)`)}`
      );
    }
    lines.push("");
  }

  // 5. Harnesses Breakdown Table
  if (stats.harnesses.length > 0) {
    lines.push(`  ${c.bold(c.cyan("✦ Breakdown by Harness:"))}`);
    const hRows = stats.harnesses.map((h) => {
      const info = HARNESS_INFO[h.harness];
      const label = info ? `${info.color(info.glyph)} ${info.name}` : h.harness;
      return [
        label,
        compactNumber(h.requests),
        compactNumber(h.tokens),
        compactNumber(h.input),
        compactNumber(h.output),
        c.dim(compactNumber(h.cached)),
        c.bold(c.gold(formatUsd(h.costUsd))),
        c.green(formatUsd(h.costSavingsUsd)),
      ];
    });
    const table = renderTable(
      hRows,
      ["Harness", "Requests", "Tokens", "In", "Out", "Cached", "Cost", "Savings"]
    );
    for (const l of table.split("\n")) {
      lines.push(`  ${l}`);
    }
    lines.push("");
  }

  // 6. Top Models Table
  if (stats.models.length > 0) {
    lines.push(`  ${c.bold(c.cyan("✦ Top Models:"))}`);
    const mRows = stats.models.slice(0, 6).map((m) => [
      m.modelName,
      c.dim(m.modelFamily),
      compactNumber(m.requests),
      compactNumber(m.tokens),
      compactNumber(m.input),
      compactNumber(m.output),
      c.dim(compactNumber(m.cached)),
      c.bold(c.gold(formatUsd(m.costUsd))),
    ]);
    const mTable = renderTable(
      mRows,
      ["Model", "Family", "Requests", "Tokens", "In", "Out", "Cached", "Cost"]
    );
    for (const l of mTable.split("\n")) {
      lines.push(`  ${l}`);
    }
    lines.push("");
  }

  // 7. Footer
  if (isInteractive) {
    const footer = `  ${c.bold("[w]")} Week View  ${c.bold("[m]")} Month View  ${c.bold("[y]")} Year View  ${c.bold("[h/l]")} Prev/Next  ${c.bold("[0]")} Current  ${c.bold("[Tab]")} Live Monitor  ${c.bold("[q]")} Quit`;
    lines.push(footer);
  }

  return lines;
}

import type { PeriodStats, UsageSummary } from "../core/types";
import { compactNumber, formatUsd } from "./tui";

export function generateHtmlStatsReport(
  weekStats: PeriodStats,
  monthStats: PeriodStats,
  yearStats: PeriodStats
): string {
  const generatedAt = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI-Reporter ✦ Token & Spend Statistics</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-dim: #8b949e;
      --cyan: #58a6ff;
      --gold: #eab619;
      --green: #3fb950;
      --purple: #bc8cff;
      --teal: #39c5bb;
      --orange: #f0883e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1080px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    .brand { font-size: 24px; font-weight: bold; color: var(--gold); }
    .brand span { color: var(--cyan); }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab-btn {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--gold);
      color: #000;
      border-color: var(--gold);
    }
    .view-container { display: none; }
    .view-container.active { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px;
    }
    .card-title { font-size: 13px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; }
    .card-value { font-size: 26px; font-weight: bold; color: var(--cyan); }
    .card-value.gold { color: var(--gold); }
    .card-value.green { color: var(--green); }
    .card-sub { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
    
    .fun-banner {
      background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(234, 182, 25, 0.1));
      border: 1px solid var(--gold);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .fun-title { font-size: 18px; font-weight: bold; color: var(--gold); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .fun-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .fun-item { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; }
    .fun-item-val { font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 2px; }
    .fun-item-desc { font-size: 12px; color: var(--text-dim); }
    .commentary { margin-top: 14px; font-style: italic; color: var(--teal); font-size: 13px; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); }
    th { color: var(--text-dim); font-size: 12px; text-transform: uppercase; }
    tr:hover { background: rgba(255, 255, 255, 0.02); }
    .chart-bar-bg { background: rgba(255, 255, 255, 0.08); border-radius: 4px; height: 16px; overflow: hidden; }
    .chart-bar-fill { background: var(--cyan); height: 100%; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="brand">✦ AI-<span>Reporter</span></div>
        <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">24/7 AI Token, Spend & Environmental Analytics</div>
      </div>
      <div style="font-size: 12px; color: var(--text-dim);">Generated ${generatedAt}</div>
    </header>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('week')">📅 Week View</button>
      <button class="tab-btn" onclick="switchTab('month')">📅 Month View</button>
      <button class="tab-btn" onclick="switchTab('year')">📅 Year View</button>
    </div>

    ${renderViewHtml("week", weekStats, true)}
    ${renderViewHtml("month", monthStats, false)}
    ${renderViewHtml("year", yearStats, false)}
  </div>

  <script>
    function switchTab(viewId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('view-' + viewId).classList.add('active');
    }
  </script>
</body>
</html>`;
}

function renderViewHtml(id: string, s: PeriodStats, isActive: boolean): string {
  const f = s.funMetrics;
  const maxBucket = Math.max(...s.buckets.map((b) => b.tokens), 1);

  return `
    <div id="view-${id}" class="view-container ${isActive ? "active" : ""}">
      <h2 style="font-size: 20px; margin-bottom: 16px; color: #fff;">${s.label} <span style="font-size: 13px; color: var(--text-dim); font-weight: normal;">(${s.rangeLabel})</span></h2>

      <div class="grid">
        <div class="card">
          <div class="card-title">Total Tokens</div>
          <div class="card-value">${compactNumber(s.summary.totalTokens)}</div>
          <div class="card-sub">${compactNumber(s.summary.totalRequests)} requests across ${compactNumber(s.summary.totalSessions)} sessions</div>
        </div>
        <div class="card">
          <div class="card-title">Estimated Spend</div>
          <div class="card-value gold">${formatUsd(s.summary.totalCostUsd)}</div>
          <div class="card-sub">Saved ${formatUsd(s.summary.totalCostSavingsUsd)} with prompt cache</div>
        </div>
        <div class="card">
          <div class="card-title">Prompt vs Output</div>
          <div class="card-value">${compactNumber(s.summary.inputTokens)} in / ${compactNumber(s.summary.outputTokens)} out</div>
          <div class="card-sub">${compactNumber(s.summary.cacheReadTokens)} tokens read from cache</div>
        </div>
      </div>

      <div class="fun-banner">
        <div class="fun-title">🌊 Environmental & Fun Equivalencies <span style="font-size: 12px; background: rgba(234, 182, 25, 0.2); padding: 2px 8px; border-radius: 12px; color: var(--gold);">${f.lakeBadge}</span></div>
        <div class="fun-grid">
          <div class="fun-item">
            <div class="fun-item-val" style="color: var(--cyan);">${f.drownLakes >= 0.001 ? f.drownLakes.toFixed(4) : f.drownLakes.toFixed(6)} Lakes</div>
            <div class="fun-item-desc">Drowned/drained by GPU cooling (${compactNumber(f.waterLiters)} L ≈ ${compactNumber(f.bathtubs)} bathtubs)</div>
          </div>
          <div class="fun-item">
            <div class="fun-item-val" style="color: var(--gold);">${compactNumber(f.toastsRun)} Slices of Toast</div>
            <div class="fun-item-desc">Compute electricity (${f.kwh} kWh ≈ ${compactNumber(f.smartphonesCharged)} phone charges)</div>
          </div>
          <div class="fun-item">
            <div class="fun-item-val" style="color: var(--purple);">${f.warAndPeaceCopies}x War & Peace</div>
            <div class="fun-item-desc">Typing equivalent: ${f.humanTypingHours}h human typing non-stop</div>
          </div>
          <div class="fun-item">
            <div class="fun-item-val" style="color: var(--teal);">${compactNumber(f.coffeesEquivalent)} Flat Whites</div>
            <div class="fun-item-desc">Equivalent developer fuel (${compactNumber(f.pizzasEquivalent)} artisan pizzas)</div>
          </div>
        </div>
        <div class="commentary">${f.lakeCommentary}</div>
      </div>

      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title">Activity Breakdown (${s.type === "week" ? "Days" : s.type === "month" ? "Daily" : "Months"})</div>
        <table>
          <thead>
            <tr><th>Period</th><th>Volume</th><th>Tokens</th><th>Requests</th><th>Cost</th></tr>
          </thead>
          <tbody>
            ${s.buckets
              .map((b) => {
                const pct = Math.round((b.tokens / maxBucket) * 100);
                return `<tr>
                  <td style="font-weight: 500;">${b.label}</td>
                  <td style="width: 35%;"><div class="chart-bar-bg"><div class="chart-bar-fill" style="width: ${pct}%;"></div></div></td>
                  <td>${compactNumber(b.tokens)}</td>
                  <td>${compactNumber(b.requests)}</td>
                  <td style="color: var(--gold);">${formatUsd(b.costUsd)}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      ${
        s.harnesses.length > 0
          ? `<div class="card">
        <div class="card-title">Breakdown by AI Harness</div>
        <table>
          <thead><tr><th>Harness</th><th>Requests</th><th>Tokens</th><th>Prompt</th><th>Output</th><th>Cost</th></tr></thead>
          <tbody>
            ${s.harnesses
              .map(
                (h) => `<tr>
              <td><strong>${h.harness}</strong></td>
              <td>${compactNumber(h.requests)}</td>
              <td>${compactNumber(h.tokens)}</td>
              <td>${compactNumber(h.input)}</td>
              <td>${compactNumber(h.output)}</td>
              <td style="color: var(--gold);">${formatUsd(h.costUsd)}</td>
            </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
          : ""
      }
    </div>
  `;
}

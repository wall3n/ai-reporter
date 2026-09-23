import type { Command } from "commander";
import { loadPricing, saveCustomPricing } from "../core/pricing";
import { ui } from "../ui/output";
import { c } from "../ui/style";
import { formatUsd } from "../ui/tui";

export function registerPricing(program: Command): void {
  const pricing = program
    .command("pricing")
    .description("View and configure token pricing per million tokens");

  pricing
    .command("list")
    .description("List all model rates per 1M tokens")
    .action(() => {
      ui.intro("AI-Reporter · Model Pricing Catalog");
      const catalog = loadPricing();
      const rows = Object.entries(catalog).map(([name, price]) => [
        name,
        `$${price.inputPer1M.toFixed(2)}`,
        `$${price.outputPer1M.toFixed(2)}`,
        `$${price.cacheReadPer1M.toFixed(2)}`,
        `$${price.cacheWritePer1M.toFixed(2)}`,
      ]);

      ui.table(rows, ["Model", "Input / 1M", "Output / 1M", "Cache Read / 1M", "Cache Write / 1M"]);
      ui.line();
      ui.line("To override or add a price: 'ai-reporter pricing set <model> <input> <output> <cacheRead> <cacheWrite>'");
      ui.outro("");
    });

  pricing
    .command("set <model> <input> <output> [cacheRead] [cacheWrite]")
    .description("Set custom price per 1M tokens for a model")
    .action((model: string, inputStr: string, outputStr: string, cacheReadStr?: string, cacheWriteStr?: string) => {
      const input = Number(inputStr);
      const output = Number(outputStr);
      const cacheRead = cacheReadStr !== undefined ? Number(cacheReadStr) : 0;
      const cacheWrite = cacheWriteStr !== undefined ? Number(cacheWriteStr) : 0;

      if (!Number.isFinite(input) || !Number.isFinite(output)) {
        ui.error("Input and Output prices must be valid numbers.");
        return;
      }

      saveCustomPricing(model, {
        cacheReadPer1M: cacheRead,
        cacheWritePer1M: cacheWrite,
        inputPer1M: input,
        outputPer1M: output,
      });

      ui.success(`Updated pricing for ${model}:`);
      ui.line(`  Input:       $${input}/1M`);
      ui.line(`  Output:      $${output}/1M`);
      ui.line(`  Cache Read:  $${cacheRead}/1M`);
      ui.line(`  Cache Write: $${cacheWrite}/1M`);
    });
}

import { join } from "node:path";
import { configDir, readJsonFile, writeJsonAtomic } from "./config";

export type ModelPrice = {
  inputPer1M: number;
  outputPer1M: number;
  cacheReadPer1M: number;
  cacheWritePer1M: number;
};

export const DEFAULT_PRICING: Record<string, ModelPrice> = {
  // Anthropic Claude
  "claude-3-7-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0, cacheReadPer1M: 0.3, cacheWritePer1M: 3.75 },
  "claude-3-5-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0, cacheReadPer1M: 0.3, cacheWritePer1M: 3.75 },
  "claude-3-5-haiku": { inputPer1M: 0.8, outputPer1M: 4.0, cacheReadPer1M: 0.08, cacheWritePer1M: 1.0 },
  "claude-3-opus": { inputPer1M: 15.0, outputPer1M: 75.0, cacheReadPer1M: 1.5, cacheWritePer1M: 18.75 },
  "claude-3-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0, cacheReadPer1M: 0.75, cacheWritePer1M: 3.75 },
  "claude-3-haiku": { inputPer1M: 0.25, outputPer1M: 1.25, cacheReadPer1M: 0.0625, cacheWritePer1M: 0.3125 },

  // OpenAI
  "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10.0, cacheReadPer1M: 1.25, cacheWritePer1M: 0 },
  "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6, cacheReadPer1M: 0.075, cacheWritePer1M: 0 },
  "o1": { inputPer1M: 15.0, outputPer1M: 60.0, cacheReadPer1M: 7.5, cacheWritePer1M: 0 },
  "o1-mini": { inputPer1M: 3.0, outputPer1M: 12.0, cacheReadPer1M: 1.5, cacheWritePer1M: 0 },
  "o3-mini": { inputPer1M: 1.1, outputPer1M: 4.4, cacheReadPer1M: 0.55, cacheWritePer1M: 0 },
  "gpt-4-turbo": { inputPer1M: 10.0, outputPer1M: 30.0, cacheReadPer1M: 0, cacheWritePer1M: 0 },

  // Google Gemini
  "gemini-2-5-pro": { inputPer1M: 1.25, outputPer1M: 5.0, cacheReadPer1M: 0.3125, cacheWritePer1M: 0 },
  "gemini-2-5-flash": { inputPer1M: 0.075, outputPer1M: 0.3, cacheReadPer1M: 0.01875, cacheWritePer1M: 0 },
  "gemini-2-0-flash": { inputPer1M: 0.1, outputPer1M: 0.4, cacheReadPer1M: 0.025, cacheWritePer1M: 0 },
  "gemini-1-5-pro": { inputPer1M: 1.25, outputPer1M: 5.0, cacheReadPer1M: 0.3125, cacheWritePer1M: 0 },
  "gemini-1-5-flash": { inputPer1M: 0.075, outputPer1M: 0.3, cacheReadPer1M: 0.01875, cacheWritePer1M: 0 },

  // DeepSeek
  "deepseek-v3": { inputPer1M: 0.14, outputPer1M: 0.28, cacheReadPer1M: 0.014, cacheWritePer1M: 0 },
  "deepseek-r1": { inputPer1M: 0.55, outputPer1M: 2.19, cacheReadPer1M: 0.14, cacheWritePer1M: 0 },

  // Qwen
  "qwen-2-5-coder": { inputPer1M: 0.2, outputPer1M: 0.6, cacheReadPer1M: 0.05, cacheWritePer1M: 0 },
  "qwen-2-5": { inputPer1M: 0.2, outputPer1M: 0.6, cacheReadPer1M: 0.05, cacheWritePer1M: 0 },

  // Mistral
  "codestral": { inputPer1M: 0.3, outputPer1M: 0.9, cacheReadPer1M: 0, cacheWritePer1M: 0 },
  "mistral-large": { inputPer1M: 2.0, outputPer1M: 6.0, cacheReadPer1M: 0, cacheWritePer1M: 0 },
};

export function pricingFilePath(): string {
  return join(configDir(), "pricing.json");
}

let cachedUserPricing: Record<string, ModelPrice> | null = null;

export function loadPricing(): Record<string, ModelPrice> {
  if (cachedUserPricing) {
    return { ...DEFAULT_PRICING, ...cachedUserPricing };
  }
  const file = pricingFilePath();
  const user = readJsonFile<Record<string, ModelPrice>>(file);
  cachedUserPricing = user || {};
  return { ...DEFAULT_PRICING, ...cachedUserPricing };
}

export function saveCustomPricing(model: string, price: ModelPrice): void {
  const current = readJsonFile<Record<string, ModelPrice>>(pricingFilePath()) || {};
  current[model] = price;
  writeJsonAtomic(pricingFilePath(), current);
  cachedUserPricing = current;
}

export function findModelPrice(
  canonicalName: string,
  family: string
): ModelPrice {
  const catalog = loadPricing();
  // Direct match
  if (catalog[canonicalName]) {
    return catalog[canonicalName]!;
  }

  // Prefix or partial match
  for (const [key, price] of Object.entries(catalog)) {
    if (canonicalName.includes(key) || key.includes(canonicalName)) {
      return price;
    }
  }

  // Fallback by family
  if (family === "claude") {
    return catalog["claude-3-5-sonnet"]!;
  }
  if (family === "gemini") {
    return catalog["gemini-2-0-flash"]!;
  }
  if (family === "gpt") {
    return catalog["gpt-4o"]!;
  }
  if (family === "deepseek") {
    return catalog["deepseek-v3"]!;
  }
  if (family === "qwen") {
    return catalog["qwen-2-5-coder"]!;
  }

  return { inputPer1M: 1.0, outputPer1M: 3.0, cacheReadPer1M: 0.2, cacheWritePer1M: 0 };
}

export function calculateCost(
  tokens: { input: number; output: number; cacheRead: number; cacheWrite: number },
  canonicalName: string,
  family: string,
  nativeCostUsd?: number
): { costUsd: number; costSavingsUsd: number } {
  const price = findModelPrice(canonicalName, family);

  // If native cost is explicitly provided and non-zero (e.g. from OpenCode or Pi), respect it or take computed
  const computedCost =
    (tokens.input * price.inputPer1M +
      tokens.output * price.outputPer1M +
      tokens.cacheRead * price.cacheReadPer1M +
      tokens.cacheWrite * price.cacheWritePer1M) /
    1_000_000;

  // Dollar savings from caching = cacheRead * (inputPrice - cacheReadPrice)
  const savings = Math.max(
    0,
    (tokens.cacheRead * (price.inputPer1M - price.cacheReadPer1M)) / 1_000_000
  );

  const costUsd =
    typeof nativeCostUsd === "number" && nativeCostUsd > 0
      ? nativeCostUsd
      : computedCost;

  return {
    costUsd: Math.round(costUsd * 100_000) / 100_000,
    costSavingsUsd: Math.round(savings * 100_000) / 100_000,
  };
}

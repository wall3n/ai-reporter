import type { UsageSummary } from "./types";

export type FunMetrics = {
  // 1. Water Footprint & "Drown Lakes"
  waterLiters: number;
  drownLakes: number;          // Standard lakes drained/evaporated (10M liters = 1 lake)
  olympicPools: number;        // 2,500,000 liters
  bathtubs: number;            // 150 liters
  waterBottles: number;        // 500 mL bottles
  lakeCommentary: string;      // Humorous contextual narrative
  lakeBadge: string;           // Badge e.g. "🌊 Lake Evaporator Class IV"

  // 2. Compute Energy & Appliances
  kwh: number;
  toastsRun: number;           // Slices of bread toasted
  smartphonesCharged: number;  // Full smartphone charge cycles
  ledLightbulbHours: number;   // 10W LED bulb hours

  // 3. Carbon Emissions & Ecology
  co2Kg: number;
  carKmDriven: number;
  treeYearsToOffset: number;

  // 4. Human Scale & Literature
  wordsEquivalent: number;
  humanTypingHours: number;
  humanTypingDays: number;
  warAndPeaceCopies: number;
  harryPotterSeries: number;

  // 5. Developer Sustenance & Spending
  coffeesEquivalent: number;
  pizzasEquivalent: number;
};

// Conversions & Constants
const LITERS_PER_MILLION_TOKENS = 25.0; // UC Riverside datacenter evaporative cooling + power water footprint
const LAKE_LITERS = 10_000_000;        // Small recreational lake / pond (10,000 m³)
const OLYMPIC_POOL_LITERS = 2_500_000; // Standard 50m x 25m x 2m pool
const BATHTUB_LITERS = 150;            // Standard residential bathtub
const BOTTLE_LITERS = 0.5;             // 500 mL water bottle

const KWH_PER_THOUSAND_TOKENS = 0.0003; // ~0.3 kWh per 1M tokens (cluster GPU inference + cooling PUE)
const KWH_PER_TOAST_SLICE = 0.0165;     // 1000W toaster for 1 minute
const KWH_PER_PHONE_CHARGE = 0.015;     // 15 Wh modern smartphone battery
const KWH_PER_LED_HOUR = 0.01;          // 10W LED bulb for 1 hour

const CO2_KG_PER_KWH = 0.385;           // Global grid average (385g CO2/kWh)
const CO2_KG_PER_CAR_KM = 0.25;         // Average gasoline passenger vehicle
const CO2_KG_PER_TREE_YEAR = 22.0;      // Mature tree absorption per year

const WORDS_PER_TOKEN = 0.75;
const WORDS_PER_TYPING_HOUR = 50 * 60;  // 50 words per minute = 3,000 words/hour
const WAR_AND_PEACE_WORDS = 587_287;
const HARRY_POTTER_SERIES_WORDS = 1_084_170;

const SPECIALTY_COFFEE_USD = 4.50;
const PIZZA_USD = 18.00;

export function computeFunMetrics(summary: UsageSummary): FunMetrics {
  const tokens = Math.max(0, summary.totalTokens || 0);
  const costUsd = Math.max(0, summary.totalCostUsd || 0);

  // Water calculations
  const waterLiters = (tokens / 1_000_000) * LITERS_PER_MILLION_TOKENS;
  const drownLakes = waterLiters / LAKE_LITERS;
  const olympicPools = waterLiters / OLYMPIC_POOL_LITERS;
  const bathtubs = waterLiters / BATHTUB_LITERS;
  const waterBottles = waterLiters / BOTTLE_LITERS;

  // Lake commentary & badge
  let lakeCommentary = "🌿 Pristine Nature: Zero drops evaporated. No lakes were harmed in the making of this code.";
  let lakeBadge = "🌱 Eco Dewdrop";

  if (drownLakes >= 1.0) {
    lakeCommentary = `🚨 Catastrophic Drought: You have personally evaporated ${drownLakes.toFixed(2)} freshwater lakes to debug your agentic loops!`;
    lakeBadge = "🌊 Lake Destroyer Class IX";
  } else if (drownLakes >= 0.1) {
    lakeCommentary = `⚠️ Environmental Emergency: Local wildlife is drafting a cease-and-desist over ${drownLakes.toFixed(3)} lakes evaporated.`;
    lakeBadge = "🏊 Olympic Basin Drainer";
  } else if (drownLakes >= 0.01) {
    lakeCommentary = `🌊 Lake Drainer: Walden Pond would be dropping noticeably (${olympicPools.toFixed(2)} Olympic pools boiled off into cloud steam).`;
    lakeBadge = "🦆 Pond Vaporizer";
  } else if (drownLakes >= 0.001) {
    lakeCommentary = `🦆 Pond Alert: Local koi fish are nervously sweating as your tokens boiled off ${bathtubs.toFixed(0)} bathtubs of water.`;
    lakeBadge = "🛁 Bathtub Boiler";
  } else if (bathtubs >= 5) {
    lakeCommentary = `🛁 Steamy Session: Enough GPU cooling water evaporated to fill ${bathtubs.toFixed(0)} warm bubble baths for rubber ducks.`;
    lakeBadge = "💧 Hydration Overload";
  } else if (waterLiters >= 1) {
    lakeCommentary = `🥤 Thirsty LLM: Your AI agent drank ${waterBottles.toFixed(0)} bottles of chilled spring water while writing code.`;
    lakeBadge = "🥤 Bottle Chugger";
  } else if (tokens > 0) {
    lakeCommentary = `🌱 Modest Sip: Datacenter cooling merely took a polite sip of ${waterLiters.toFixed(2)} Liters of water.`;
    lakeBadge = "💧 Gentle Sipper";
  }

  // Energy calculations
  const kwh = (tokens / 1_000) * KWH_PER_THOUSAND_TOKENS;
  const toastsRun = kwh / KWH_PER_TOAST_SLICE;
  const smartphonesCharged = kwh / KWH_PER_PHONE_CHARGE;
  const ledLightbulbHours = kwh / KWH_PER_LED_HOUR;

  // Carbon calculations
  const co2Kg = kwh * CO2_KG_PER_KWH;
  const carKmDriven = co2Kg / CO2_KG_PER_CAR_KM;
  const treeYearsToOffset = co2Kg / CO2_KG_PER_TREE_YEAR;

  // Human typing & literature scale
  const wordsEquivalent = tokens * WORDS_PER_TOKEN;
  const humanTypingHours = wordsEquivalent / WORDS_PER_TYPING_HOUR;
  const humanTypingDays = humanTypingHours / 24;
  const warAndPeaceCopies = wordsEquivalent / WAR_AND_PEACE_WORDS;
  const harryPotterSeries = wordsEquivalent / HARRY_POTTER_SERIES_WORDS;

  // Developer sustenance
  const coffeesEquivalent = costUsd / SPECIALTY_COFFEE_USD;
  const pizzasEquivalent = costUsd / PIZZA_USD;

  return {
    bathtubs: round(bathtubs, 1),
    carKmDriven: round(carKmDriven, 1),
    co2Kg: round(co2Kg, 2),
    coffeesEquivalent: round(coffeesEquivalent, 1),
    drownLakes: round(drownLakes, 6),
    harryPotterSeries: round(harryPotterSeries, 2),
    humanTypingDays: round(humanTypingDays, 1),
    humanTypingHours: round(humanTypingHours, 1),
    kwh: round(kwh, 3),
    lakeBadge,
    lakeCommentary,
    ledLightbulbHours: round(ledLightbulbHours, 1),
    olympicPools: round(olympicPools, 4),
    pizzasEquivalent: round(pizzasEquivalent, 1),
    smartphonesCharged: round(smartphonesCharged, 1),
    toastsRun: round(toastsRun, 1),
    treeYearsToOffset: round(treeYearsToOffset, 2),
    warAndPeaceCopies: round(warAndPeaceCopies, 2),
    waterBottles: round(waterBottles, 0),
    waterLiters: round(waterLiters, 2),
    wordsEquivalent: Math.round(wordsEquivalent),
  };
}

function round(value: number, decimals: number): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

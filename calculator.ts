// PromptCarbon — AI Carbon Footprint Calculator Engine v2.1
// All calculations run client-side.
// Methodology: Energy-first (Wh per query), location-based grid intensity.
// Primary source: Jegham et al. 2025, supplemented by Google/OpenAI disclosures.

// ─── Constants ───────────────────────────────────────────────────────────────

export const WORKING_DAYS_PER_YEAR = 230;

// ─── Query Length Tiers ──────────────────────────────────────────────────────

export type QueryLength = "short" | "medium" | "long";

export const QUERY_LENGTH_INFO: Record<QueryLength, { label: string; description: string }> = {
  short: { label: "Short", description: "Quick questions, simple lookups, code autocomplete (<500 tokens)" },
  medium: { label: "Medium", description: "Standard work — drafting, summarising, coding (500–2,000 tokens)" },
  long: { label: "Long", description: "Deep analysis, long documents, extended conversations (2,000+ tokens)" },
};

// ─── AI Model Energy Factors (Wh per query) ─────────────────────────────────

/** Wh per query by query length tier */
export interface ModelFactor {
  short: number;
  medium: number;
  long: number;
  source: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "ESTIMATED";
}

export const MODEL_ENERGY_FACTORS: Record<string, ModelFactor> = {
  "Google Gemini": {
    short: 0.24, medium: 0.60, long: 1.50,
    source: "Google Cloud Blog Aug 2025",
    confidence: "HIGH",
  },
  "ChatGPT / GPT-4o": {
    short: 0.42, medium: 1.10, long: 1.79,
    source: "Jegham et al. 2025",
    confidence: "MEDIUM",
  },
  "GPT-4o mini": {
    short: 0.18, medium: 0.45, long: 0.80,
    source: "Jegham et al. 2025",
    confidence: "MEDIUM",
  },
  "Claude (Anthropic)": {
    short: 0.35, medium: 0.90, long: 1.50,
    source: "Estimated from Jegham eco-efficiency ranking",
    confidence: "LOW",
  },
  "Microsoft Copilot M365": {
    short: 0.30, medium: 0.75, long: 1.30,
    source: "Estimated — hybrid model routing (Phi-4 / GPT-4o)",
    confidence: "LOW",
  },
  "GitHub Copilot": {
    short: 0.12, medium: 0.30, long: 0.60,
    source: "Estimated — short code completions",
    confidence: "LOW",
  },
  "AI Image Generation": {
    short: 3.50, medium: 5.00, long: 8.00,
    source: "IEA; MIT Technology Review",
    confidence: "MEDIUM",
  },
  "Custom AI API": {
    short: 0.42, medium: 1.10, long: 1.79,
    source: "Uses GPT-4o as proxy",
    confidence: "LOW",
  },
  "Other / Don't know": {
    short: 0.35, medium: 0.85, long: 1.50,
    source: "Weighted average",
    confidence: "ESTIMATED",
  },
};

export const AI_TOOLS = Object.keys(MODEL_ENERGY_FACTORS);

// ─── Reasoning Model Overhead ────────────────────────────────────────────────

export type ReasoningUsage = "none" | "occasionally" | "regularly";

export const REASONING_USAGE_INFO: Record<ReasoningUsage, { label: string; description: string; multiplier: number }> = {
  none: { label: "No", description: "We don't use reasoning/thinking models", multiplier: 1.0 },
  occasionally: { label: "Occasionally", description: "Some tasks use o3, Deep Research, or extended thinking (~10% of queries)", multiplier: 1.9 },
  regularly: { label: "Regularly", description: "Many tasks use reasoning models (~30% of queries)", multiplier: 3.7 },
};

// ─── Usage Intensity ─────────────────────────────────────────────────────────

export type UsageIntensity = "exploring" | "adopting" | "embedded" | "ai-native";

export const USAGE_INTENSITY: Record<
  UsageIntensity,
  { queriesPerDay: number; adoptionPct: number; label: string; description: string }
> = {
  exploring: { queriesPerDay: 5, adoptionPct: 0.15, label: "Exploring", description: "A few people try it occasionally for specific tasks" },
  adopting: { queriesPerDay: 15, adoptionPct: 0.4, label: "Adopting", description: "Many staff use AI tools weekly as part of their work" },
  embedded: { queriesPerDay: 35, adoptionPct: 0.7, label: "Embedded", description: "Most staff use AI daily — it's part of how we operate" },
  "ai-native": { queriesPerDay: 80, adoptionPct: 0.9, label: "AI-native", description: "AI is core to our product or service — we couldn't work without it" },
};

// ─── Company ─────────────────────────────────────────────────────────────────

export const EMPLOYEE_RANGES = [
  { label: "1 - 10", midpoint: 5 },
  { label: "11 - 50", midpoint: 30 },
  { label: "51 - 200", midpoint: 125 },
  { label: "201 - 500", midpoint: 350 },
  { label: "501 - 2,000", midpoint: 1250 },
  { label: "2,000+", midpoint: 3000 },
];

export const INDUSTRIES = [
  "Technology / SaaS",
  "Professional Services",
  "Finance",
  "Retail / E-commerce",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Other",
];

// ─── Grid Carbon Intensity (location-based, kgCO₂e/kWh) ────────────────────

export const COUNTRIES = [
  { label: "United Kingdom", gridIntensity: 0.128 },
  { label: "Germany", gridIntensity: 0.350 },
  { label: "France", gridIntensity: 0.052 },
  { label: "Netherlands", gridIntensity: 0.280 },
  { label: "United States", gridIntensity: 0.390 },
  { label: "Other EU", gridIntensity: 0.250 },
  { label: "Other", gridIntensity: 0.300 },
];

// ─── Cloud Infrastructure ────────────────────────────────────────────────────

export const CLOUD_PROVIDERS = ["AWS", "Azure", "GCP", "Other / On-premise", "Don't know"];

export const CLOUD_SPEND_RANGES = [
  { label: "\u00a30 - 500", midpoint: 250 },
  { label: "\u00a3500 - 2,000", midpoint: 1250 },
  { label: "\u00a32,000 - 10,000", midpoint: 6000 },
  { label: "\u00a310,000 - 50,000", midpoint: 30000 },
  { label: "\u00a350,000+", midpoint: 75000 },
];

// v2.1: Discounted region adjustments (raw grid ratio × ~0.75 for hyperscaler efficiency)
export const CLOUD_REGIONS = [
  { label: "UK", multiplier: 1.0 },
  { label: "EU West", multiplier: 1.50 },
  { label: "EU North (Nordics)", multiplier: 0.25 },
  { label: "US East", multiplier: 2.20 },
  { label: "US West", multiplier: 1.10 },
  { label: "Asia Pacific", multiplier: 2.80 },
  { label: "Don't know", multiplier: 1.20 },
];

// ─── Devices ─────────────────────────────────────────────────────────────────

export type DeviceType = "laptops" | "desktops" | "mix";
export type RefreshCycle = "2-3" | "3-4" | "4-5" | "5+";
export type WorkPattern = "office" | "hybrid" | "remote";

const DEVICE_KWH: Record<DeviceType, number> = {
  laptops: 92,
  desktops: 331,  // v2.1: 180W (incl monitor) × 8hrs × 230 days
  mix: 212,       // v2.1: blended average
};

// v2.1: Desktop embodied = 500kg (incl monitor), Laptop = 300kg, Mix = 400kg
const EMBODIED_LAPTOP: Record<RefreshCycle, number> = { "2-3": 120, "3-4": 86, "4-5": 67, "5+": 50 };
const EMBODIED_DESKTOP: Record<RefreshCycle, number> = { "2-3": 200, "3-4": 143, "4-5": 111, "5+": 83 };
const EMBODIED_MIX: Record<RefreshCycle, number> = { "2-3": 160, "3-4": 114, "4-5": 89, "5+": 67 };

function getEmbodied(device: DeviceType, refresh: RefreshCycle): number {
  if (device === "laptops") return EMBODIED_LAPTOP[refresh];
  if (device === "desktops") return EMBODIED_DESKTOP[refresh];
  return EMBODIED_MIX[refresh];
}

// v2.1: Work pattern multiplier
const WORK_PATTERN_MULTIPLIER: Record<WorkPattern, number> = {
  office: 1.00,
  hybrid: 0.95,
  remote: 0.90,
};

// ─── Video Conferencing ──────────────────────────────────────────────────────

export const VIDEO_LEVELS = [
  { label: "Rarely", factor: 4 },
  { label: "A few times a week", factor: 20 },
  { label: "Daily", factor: 60 },
  { label: "Multiple hours daily", factor: 120 },
];

// ─── Custom API Volume ───────────────────────────────────────────────────────

export const CUSTOM_API_VOLUMES = [
  { label: "Under 1,000", midpoint: 500 },
  { label: "1,000 - 10,000", midpoint: 5000 },
  { label: "10,000 - 100,000", midpoint: 50000 },
  { label: "100,000+", midpoint: 200000 },
];

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CalculatorInput {
  // Step 1: Company
  companyName: string;
  employees: number;
  industry: string;
  country: string;

  // Step 2: AI Tools
  aiTools: string[];

  // Step 3: Usage intensity + query length + reasoning
  usageIntensity: UsageIntensity;
  queryLength: QueryLength;
  reasoningUsage: ReasoningUsage;
  customApiVolume: number | null;

  // Step 4: Cloud
  cloudProviders: string[];
  cloudSpend: number;
  cloudRegion: string;

  // Step 5: Devices
  deviceType: DeviceType;
  workPattern: WorkPattern;
  refreshCycle: RefreshCycle;

  // Step 6: Video
  videoIndex: number;

  // Step 7: Contact
  email: string;
  jobTitle: string;
  optIn: boolean;
}

export interface CalculatorBreakdown {
  ai: number;
  cloud: number;
  devices: number;
  video: number;
}

export interface CalculatorResult {
  breakdown: CalculatorBreakdown;
  totalKg: number;
  totalTonnes: number;
  equivalences: {
    flights: number;
    drivingKm: number;
    households: number;
    smartphones: number;
    trees: number;
  };
  perEmployee: number;
}

// ─── Calculation Functions ───────────────────────────────────────────────────

function calcAI(input: CalculatorInput): number {
  const { employees, aiTools, usageIntensity, queryLength, reasoningUsage, customApiVolume, country } = input;
  const intensity = USAGE_INTENSITY[usageIntensity];
  const totalDailyQueries = employees * intensity.adoptionPct * intensity.queriesPerDay;

  if (aiTools.length === 0) return 0;

  // Get grid intensity for energy → carbon conversion
  const countryData = COUNTRIES.find((c) => c.label === country);
  const gridIntensity = countryData?.gridIntensity ?? 0.300;

  // Check for custom API with explicit volume
  const hasCustomApi = aiTools.includes("Custom AI API");
  const nonCustomTools = aiTools.filter((t) => t !== "Custom AI API");
  const toolCount = nonCustomTools.length;

  // Standard tools: split queries equally
  let dailyEnergy_Wh = 0;
  if (toolCount > 0) {
    const queriesPerTool = totalDailyQueries / (hasCustomApi && customApiVolume ? toolCount : aiTools.length);
    for (const tool of nonCustomTools) {
      const factor = MODEL_ENERGY_FACTORS[tool]?.[queryLength] ?? MODEL_ENERGY_FACTORS["Other / Don't know"][queryLength];
      dailyEnergy_Wh += queriesPerTool * factor;
    }
    // Custom API without explicit volume gets its share
    if (hasCustomApi && !customApiVolume) {
      const queriesPerToolAll = totalDailyQueries / aiTools.length;
      dailyEnergy_Wh += queriesPerToolAll * MODEL_ENERGY_FACTORS["Custom AI API"][queryLength];
    }
  } else if (hasCustomApi && !customApiVolume) {
    dailyEnergy_Wh = totalDailyQueries * MODEL_ENERGY_FACTORS["Custom AI API"][queryLength];
  }

  // Apply reasoning model overhead
  const reasoningMultiplier = REASONING_USAGE_INFO[reasoningUsage].multiplier;
  dailyEnergy_Wh *= reasoningMultiplier;

  // Annualise (230 working days for employee tools)
  let annualEnergy_Wh = dailyEnergy_Wh * WORKING_DAYS_PER_YEAR;

  // Custom API with explicit volume: runs 365 days
  if (hasCustomApi && customApiVolume) {
    const customFactor = MODEL_ENERGY_FACTORS["Custom AI API"][queryLength];
    annualEnergy_Wh += customApiVolume * customFactor * reasoningMultiplier * 365;
  }

  // Convert Wh to kgCO₂e: (Wh / 1000) × gridIntensity
  return (annualEnergy_Wh / 1000) * gridIntensity;
}

function calcCloud(input: CalculatorInput): number {
  const { cloudSpend, cloudRegion } = input;
  const region = CLOUD_REGIONS.find((r) => r.label === cloudRegion);
  const regionAdj = region?.multiplier ?? 1.20;

  // v2.1: Simplified — no separate PUE factor (absorbed into region discount)
  // annual_cloud_spend × 0.233 × region_adjustment
  return cloudSpend * 12 * 0.233 * regionAdj;
}

function calcDevices(input: CalculatorInput): number {
  const { employees, deviceType, refreshCycle, workPattern, country } = input;
  const countryData = COUNTRIES.find((c) => c.label === country);
  const gridIntensity = countryData?.gridIntensity ?? 0.300;

  const operationalKwh = DEVICE_KWH[deviceType];
  const embodied = getEmbodied(deviceType, refreshCycle);
  const workMultiplier = WORK_PATTERN_MULTIPLIER[workPattern];

  // employees × (operational_kWh × grid_intensity + amortised_embodied) × work_pattern
  return employees * (operationalKwh * gridIntensity + embodied) * workMultiplier;
}

function calcVideo(input: CalculatorInput): number {
  const { employees, videoIndex } = input;
  const factor = VIDEO_LEVELS[videoIndex]?.factor ?? 4;
  return employees * factor;
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export function calculate(input: CalculatorInput): CalculatorResult {
  const breakdown: CalculatorBreakdown = {
    ai: calcAI(input),
    cloud: calcCloud(input),
    devices: calcDevices(input),
    video: calcVideo(input),
  };

  const totalKg = breakdown.ai + breakdown.cloud + breakdown.devices + breakdown.video;
  const totalTonnes = totalKg / 1000;

  return {
    breakdown,
    totalKg,
    totalTonnes,
    equivalences: {
      flights: totalKg / 3950,        // DEFRA 2025: London–NY return
      drivingKm: totalKg / 0.166,     // DEFRA 2025: avg petrol car per km
      households: totalKg / 1060,      // DEFRA 2025: avg UK household electricity
      smartphones: totalKg / 0.012,    // IEA
      trees: totalKg / 22,            // EEA: mature tree absorption per year
    },
    perEmployee: input.employees > 0 ? totalKg / input.employees : 0,
  };
}

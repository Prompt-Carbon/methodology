// PromptCarbon — AI Carbon Footprint Calculator Engine
// All calculations run client-side. Units: kgCO2e unless noted.

// ─── Constants ───────────────────────────────────────────────────────────────

export const WORKING_DAYS_PER_YEAR = 230;

/** gCO2e per query */
export const EMISSION_FACTORS: Record<string, number> = {
  "Google Gemini": 0.03,
  "GitHub Copilot": 0.15,
  "Microsoft Copilot M365": 0.5,
  "Claude (Anthropic)": 0.55,
  "ChatGPT / GPT-4o": 0.7,
  "Custom AI API": 1.2,
  "AI Image Generation": 3.5,
  "Other / Don't know": 0.6,
};

export const AI_TOOLS = Object.keys(EMISSION_FACTORS);

export type UsageIntensity = "exploring" | "adopting" | "embedded" | "ai-native";

export const USAGE_INTENSITY: Record<
  UsageIntensity,
  { queriesPerDay: number; adoptionPct: number; label: string; description: string }
> = {
  exploring: { queriesPerDay: 5, adoptionPct: 0.15, label: "Exploring", description: "A few people try it occasionally" },
  adopting: { queriesPerDay: 15, adoptionPct: 0.4, label: "Adopting", description: "Many staff use AI tools weekly" },
  embedded: { queriesPerDay: 35, adoptionPct: 0.7, label: "Embedded", description: "Most staff use AI daily" },
  "ai-native": { queriesPerDay: 80, adoptionPct: 0.9, label: "AI-native", description: "AI is core to our product or service" },
};

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

export const COUNTRIES = [
  { label: "United Kingdom", gridIntensity: 0.128 },
  { label: "Germany", gridIntensity: 0.35 },
  { label: "France", gridIntensity: 0.052 },
  { label: "Netherlands", gridIntensity: 0.328 },
  { label: "United States", gridIntensity: 0.38 },
  { label: "Other EU", gridIntensity: 0.25 },
  { label: "Other", gridIntensity: 0.4 },
];

// Cloud
export const CLOUD_PROVIDERS = ["AWS", "Azure", "GCP", "Other / On-premise", "Don't know"];

export const PROVIDER_PUE: Record<string, number> = {
  AWS: 0.94,
  Azure: 0.92,
  GCP: 0.85,
  "Other / On-premise": 1.25,
  "Don't know": 1.0,
};

export const CLOUD_SPEND_RANGES = [
  { label: "\u00a30 - 500", midpoint: 250 },
  { label: "\u00a3500 - 2,000", midpoint: 1250 },
  { label: "\u00a32,000 - 10,000", midpoint: 6000 },
  { label: "\u00a310,000 - 50,000", midpoint: 30000 },
  { label: "\u00a350,000+", midpoint: 75000 },
];

export const CLOUD_REGIONS = [
  { label: "UK", multiplier: 1.0 },
  { label: "EU West", multiplier: 1.95 },
  { label: "EU North (Nordics)", multiplier: 0.23 },
  { label: "US East", multiplier: 2.97 },
  { label: "US West", multiplier: 1.41 },
  { label: "Asia Pacific", multiplier: 3.52 },
  { label: "Don't know", multiplier: 1.56 },
];

// Devices
export type DeviceType = "laptops" | "desktops" | "mix";
export type RefreshCycle = "2-3" | "3-4" | "4-5" | "5+";

const DEVICE_KWH: Record<DeviceType, number> = {
  laptops: 92,
  desktops: 276,
  mix: 184,
};

const EMBODIED_LAPTOP: Record<RefreshCycle, number> = { "2-3": 120, "3-4": 86, "4-5": 67, "5+": 55 };
const EMBODIED_DESKTOP: Record<RefreshCycle, number> = { "2-3": 160, "3-4": 114, "4-5": 89, "5+": 73 };
const EMBODIED_MIX: Record<RefreshCycle, number> = { "2-3": 140, "3-4": 100, "4-5": 78, "5+": 64 };

function getEmbodied(device: DeviceType, refresh: RefreshCycle): number {
  if (device === "laptops") return EMBODIED_LAPTOP[refresh];
  if (device === "desktops") return EMBODIED_DESKTOP[refresh];
  return EMBODIED_MIX[refresh];
}

// SaaS
export const SAAS_RANGES = [
  { label: "1 - 5 tools", factor: 50 },
  { label: "5 - 15 tools", factor: 100 },
  { label: "15 - 30 tools", factor: 150 },
  { label: "30+ tools", factor: 200 },
];

// Storage
export const STORAGE_RANGES = [
  { label: "Minimal (< 100 GB)", factor: 5 },
  { label: "Moderate (100 GB - 1 TB)", factor: 25 },
  { label: "Heavy (1 - 10 TB)", factor: 120 },
  { label: "Very heavy (10 TB+)", factor: 500 },
];

// Video
export const VIDEO_LEVELS = [
  { label: "Rarely", factor: 4 },
  { label: "A few times a week", factor: 20 },
  { label: "Daily", factor: 60 },
  { label: "Multiple hours daily", factor: 120 },
];

// Custom API volume
export const CUSTOM_API_VOLUMES = [
  { label: "Under 1,000", midpoint: 500 },
  { label: "1,000 - 10,000", midpoint: 5000 },
  { label: "10,000 - 100,000", midpoint: 50000 },
  { label: "100,000+", midpoint: 200000 },
];

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CalculatorInput {
  // Step 1
  companyName: string;
  employees: number; // midpoint
  industry: string;
  country: string; // label

  // Step 2
  aiTools: string[];

  // Step 3
  usageIntensity: UsageIntensity;
  customApiVolume: number | null; // daily calls midpoint, null if not applicable

  // Step 4
  cloudProviders: string[];
  cloudSpend: number; // midpoint
  cloudRegion: string; // label

  // Step 5
  deviceType: DeviceType;
  workPattern: "office" | "hybrid" | "remote";
  refreshCycle: RefreshCycle;

  // Step 6
  saasIndex: number; // index into SAAS_RANGES
  storageIndex: number; // index into STORAGE_RANGES
  videoIndex: number; // index into VIDEO_LEVELS

  // Step 7
  email: string;
  jobTitle: string;
  optIn: boolean;
}

export interface CalculatorBreakdown {
  ai: number;
  cloud: number;
  devices: number;
  saas: number;
  storage: number;
  video: number;
}

export interface CalculatorResult {
  breakdown: CalculatorBreakdown;
  totalKg: number;
  totalTonnes: number;
  equivalences: {
    flights: number;
    drivingMiles: number;
    households: number;
    smartphones: number;
  };
  perEmployee: number;
}

// ─── Calculation Functions ───────────────────────────────────────────────────

function calcAI(input: CalculatorInput): number {
  const { employees, aiTools, usageIntensity, customApiVolume } = input;
  const intensity = USAGE_INTENSITY[usageIntensity];
  const queriesPerDay = employees * intensity.adoptionPct * intensity.queriesPerDay;

  if (aiTools.length === 0) return 0;

  // Check for custom API with explicit volume
  const hasCustomApi = aiTools.includes("Custom AI API");
  const nonCustomTools = aiTools.filter((t) => t !== "Custom AI API");
  const toolCount = nonCustomTools.length;

  // Standard tools: split queries equally
  let standardCarbon = 0;
  if (toolCount > 0) {
    const queriesPerTool = queriesPerDay / (hasCustomApi && customApiVolume ? toolCount : aiTools.length);
    for (const tool of nonCustomTools) {
      const factor = EMISSION_FACTORS[tool] ?? 0.6;
      // gCO2e → kgCO2e
      standardCarbon += queriesPerTool * WORKING_DAYS_PER_YEAR * factor / 1000;
    }
    // If custom API present but no explicit volume, it gets its share of queries
    if (hasCustomApi && !customApiVolume) {
      const queriesPerToolAll = queriesPerDay / aiTools.length;
      standardCarbon += queriesPerToolAll * WORKING_DAYS_PER_YEAR * EMISSION_FACTORS["Custom AI API"] / 1000;
    }
  } else if (hasCustomApi && !customApiVolume) {
    // Only custom API selected, no explicit volume
    standardCarbon = queriesPerDay * WORKING_DAYS_PER_YEAR * EMISSION_FACTORS["Custom AI API"] / 1000;
  }

  // Custom API with explicit volume: volume x 1.20g x 365 days
  let customCarbon = 0;
  if (hasCustomApi && customApiVolume) {
    customCarbon = customApiVolume * 1.2 * 365 / 1000; // gCO2e → kgCO2e
  }

  return standardCarbon + customCarbon;
}

function calcCloud(input: CalculatorInput): number {
  const { cloudProviders, cloudSpend, cloudRegion } = input;
  const region = CLOUD_REGIONS.find((r) => r.label === cloudRegion);
  const regionAdj = region?.multiplier ?? 1.56;

  // Average PUE of selected providers
  let pueSum = 0;
  let pueCount = 0;
  for (const p of cloudProviders) {
    if (PROVIDER_PUE[p] !== undefined) {
      pueSum += PROVIDER_PUE[p];
      pueCount++;
    }
  }
  const avgPue = pueCount > 0 ? pueSum / pueCount : 1.0;

  // monthly_spend_midpoint x 12 x 0.233 x region_adjustment x provider_efficiency
  return cloudSpend * 12 * 0.233 * regionAdj * avgPue;
}

function calcDevices(input: CalculatorInput): number {
  const { employees, deviceType, refreshCycle, country } = input;
  const countryData = COUNTRIES.find((c) => c.label === country);
  const gridIntensity = countryData?.gridIntensity ?? 0.4;

  const operationalKwh = DEVICE_KWH[deviceType];
  const embodied = getEmbodied(deviceType, refreshCycle);

  // employees x (operational_kWh x grid_intensity + amortised_embodied)
  return employees * (operationalKwh * gridIntensity + embodied);
}

function calcSaaS(input: CalculatorInput): number {
  const { employees, saasIndex } = input;
  const factor = SAAS_RANGES[saasIndex]?.factor ?? 50;
  return employees * factor;
}

function calcStorage(input: CalculatorInput): number {
  const { storageIndex } = input;
  return STORAGE_RANGES[storageIndex]?.factor ?? 5;
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
    saas: calcSaaS(input),
    storage: calcStorage(input),
    video: calcVideo(input),
  };

  const totalKg =
    breakdown.ai + breakdown.cloud + breakdown.devices + breakdown.saas + breakdown.storage + breakdown.video;

  const totalTonnes = totalKg / 1000;

  return {
    breakdown,
    totalKg,
    totalTonnes,
    equivalences: {
      flights: totalKg / 3950,
      drivingMiles: totalKg / 0.27,
      households: totalKg / 1100,
      smartphones: totalKg / 0.012,
    },
    perEmployee: input.employees > 0 ? totalKg / input.employees : 0,
  };
}

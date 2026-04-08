# PromptCarbon Methodology v2.1

Open-source emission factors and calculation methodology for estimating the carbon footprint of AI usage.

**Website:** [promptcarbon.com](https://promptcarbon.com)

---

## What This Is

This repository contains the emission factors, data sources, and calculation logic behind [PromptCarbon](https://promptcarbon.com) — a free tool that helps businesses estimate the carbon footprint of their AI and digital infrastructure.

Everything here is open for inspection, challenge, and improvement. If you think a number is wrong, open an issue or submit a PR.

**Approach:** Energy-first (Wh per query), location-based grid intensity. Primary source: Jegham et al. 2025, supplemented by Google and OpenAI disclosures.

---

## Known Holes

PromptCarbon believes transparency about what we don't know is as important as what we do know. Here are the significant sources of uncertainty in our methodology.

### Hole 1: Batch size is unobservable and changes estimates by up to 80%

When a server processes multiple AI requests simultaneously (batching), the fixed energy overhead is shared across all requests. The assumed batch size dramatically affects per-query estimates. EcoLogits assumes 64 concurrent requests. Jegham et al. suggest real-world batch sizes are closer to 4-16. Moving from a batch size of 8 to 64 reduces estimated energy by roughly 80%.

We cannot observe actual batch sizes at commercial AI providers. This is the single largest source of uncertainty in any per-query energy estimate, including ours. Our factors are derived from the Jegham et al. framework which uses empirically-observed latency data to implicitly capture batching effects, but the uncertainty remains substantial.

Source: Jegham et al. 2025, Table 4 sensitivity analysis.

### Hole 2: Hardware is unknown for most providers

EcoLogits cannot distinguish between a model running on cutting-edge NVIDIA H200 GPUs versus older A100s. Jegham et al. use statistical inference to estimate likely hardware, but this is still estimation. Critically, GPT-4o mini running on A100 hardware actually consumes more energy than the larger GPT-4o running on H200s.

Source: Jegham et al. 2025; EcoLogits methodology documentation.

### Hole 3: Anthropic, Microsoft, and most providers publish no energy data

Only two companies have disclosed per-query energy figures: Google (Gemini, August 2025, comprehensive methodology) and OpenAI (ChatGPT, June 2025, CEO statement without detailed methodology). Anthropic has not disclosed per-query energy figures and has not reported Scope 1, 2, or 3 emissions in any public filing as of March 2026. Microsoft has not published per-query data for Copilot. Perplexity, xAI's Grok, and Apple have published no per-query environmental metrics.

Our estimates for Claude, Copilot, and GitHub Copilot are derived from inference based on comparable architectures and the Jegham et al. eco-efficiency rankings. They carry LOW confidence and we welcome better data from any source.

Source: Earth911 survey of provider disclosures, March 2026; MIT Technology Review, August 2025.

### Hole 4: Google's 0.03g figure uses market-based accounting that may understate impact

Google reports 0.03g CO2e per Gemini query using market-based emissions, which credits renewable energy purchases. Using location-based accounting (actual grid carbon intensity), the same 0.24 Wh query produces substantially higher carbon at most grid intensities.

Google's figure also uses their fleet-wide average carbon intensity, which benefits from large renewable energy investments. The physical electricity powering any specific query may come from fossil fuels even if Google has purchased equivalent renewable certificates elsewhere.

PromptCarbon uses location-based accounting because it better reflects the physical carbon impact.

Source: Google Cloud Blog, August 2025; Hannah Ritchie analysis, August 2025; MIT Technology Review, August 2025.

### Hole 5: Output tokens consume far more energy than input tokens

The energy cost of generating a response is not evenly distributed across tokens. The "prefill" phase (processing the input prompt) is parallelised and relatively efficient. The "decode" phase (generating output tokens one by one) is sequential and energy-intensive.

Our calculator asks about typical usage patterns (quick lookups vs long document analysis) to partially capture this asymmetry, but it remains an approximation.

Source: EcoLogits GitHub Discussion #86; ACL 2025; arXiv:2407.04014.

### Hole 6: AI efficiency is improving at extraordinary speed, making factors stale quickly

Google reported that the energy and carbon footprint of the median Gemini text prompt dropped by 33x and 44x respectively over a 12-month period. This means any per-model emission factor becomes substantially outdated within months.

PromptCarbon commits to reviewing and updating all emission factors at least quarterly. Every factor carries a "last verified" date so users can assess staleness.

Source: Google Cloud Blog, August 2025.

### Hole 7: The cloud spend-based method is inherently imprecise

Converting GBP of cloud spend to kgCO2e using DEFRA SIC code factors is a Tier 1 estimation method — the least granular level recognised by the GHG Protocol. It doesn't distinguish between compute-intensive GPU workloads and low-energy storage.

We use this method because most companies don't know their cloud kWh consumption. We recommend using your cloud provider's carbon dashboard for higher accuracy and clearly label this as a "Tier 1 estimate."

Source: GHG Protocol Corporate Standard, Scope 3 Calculation Guidance.

### Hole 8: Agentic AI and RAG systems multiply energy beyond single-query estimates

Modern AI applications often involve multiple sequential LLM calls per user request. A RAG system might make 3-5 LLM calls per user query. An agentic system might make 10-50+. Our calculator estimates based on "queries" as perceived by the user, but the actual number of underlying API calls may be much higher.

For companies with custom AI applications, we recommend counting actual API calls rather than user-facing queries. Our calculator provides a separate input for Custom API volume for this reason.

Source: arXiv:2604.00053 (2026).

---

## AI Model Energy Factors (Wh per query)

### Methodology choice

We evaluated three methodological frameworks:

**1. EcoLogits (GenAI Impact / open-source)** — Fits a linear regression to Hugging Face LLM Perf Leaderboard data. Open source and includes embodied emissions, but assumes a generic 80GB A100 GPU and batch size of 64 (likely too high). Useful for relative comparisons but absolute values carry high uncertainty.

**2. Jegham et al. 2025 "How Hungry is AI?"** — Infrastructure-aware framework combining real-time API performance data, statistical inference of hardware configurations, provider-specific environmental multipliers, and Monte Carlo uncertainty analysis. Currently the most rigorous independent framework for estimating commercial LLM inference energy. We use this as our primary source.

**3. Google Gemini disclosure (August 2025)** — Direct measurement of internal infrastructure including active accelerators, host CPUs, DRAM, idle machine provisioning, and data centre overhead. High confidence for Gemini energy data (0.24 Wh). Market-based carbon figure (0.03g) requires adjustment for location-based use.

**Our approach:** We use Jegham et al. as the primary framework for all models, supplemented by Google's direct disclosure for Gemini and OpenAI's CEO statement for ChatGPT. Where neither source covers a model, we state this explicitly and provide our estimation reasoning.

### Standard models

| Model | Short (Wh) | Medium (Wh) | Long (Wh) | Source | Confidence | Last verified |
|---|---|---|---|---|---|---|
| Google Gemini | 0.24 | 0.60 | 1.50 | Google Cloud Blog Aug 2025 (comprehensive methodology incl. idle capacity + PUE) | HIGH | Aug 2025 |
| ChatGPT / GPT-4o | 0.42 | 1.10 | 1.79 | Jegham et al. 2025 Table 4 (cross-ref: Altman stated 0.34 Wh avg, Jun 2025) | MEDIUM | Nov 2025 |
| GPT-4o mini | 0.18 | 0.45 | 0.80 | Jegham et al. 2025 (~40-60% less than GPT-4o; hardware matters) | MEDIUM | Nov 2025 |
| Claude Sonnet | 0.35 | 0.90 | 1.50 | ESTIMATED. Jegham ranked Claude 3.7 Sonnet #1 in eco-efficiency (0.886). ~80-85% of GPT-4o energy. No official Anthropic disclosure exists. | LOW | Apr 2026 |
| Microsoft Copilot (M365/Windows) | 0.30 | 0.75 | 1.30 | ESTIMATED. Hybrid model routing: Phi-4 for simple tasks, GPT-4o for complex. 60/40 split assumed. No official Microsoft disclosure exists. | LOW | Apr 2026 |
| GitHub Copilot | 0.12 | 0.30 | 0.60 | ESTIMATED. Code completion: shorter input/output, high frequency, low token count. No published measurement. | LOW | Apr 2026 |
| AI Image Generation (DALL-E, Midjourney) | 3.50 | 5.00 | 8.00 | IEA; MIT Technology Review. Standard image approx. one full smartphone charge. | MEDIUM | May 2025 |
| Other / Don't know | 0.35 | 0.85 | 1.50 | Weighted average of above | ESTIMATED | Apr 2026 |

### Reasoning / thinking models

| Model | Short (Wh) | Medium (Wh) | Long (Wh) | Source | Confidence | Last verified |
|---|---|---|---|---|---|---|
| OpenAI o3 | 5.00 | 17.00 | 33.00 | Jegham et al. 2025 (>70x GPT-4.1 nano for long prompts) | MEDIUM | Nov 2025 |
| OpenAI o4-mini | 1.50 | 5.00 | 12.00 | Jegham et al. 2025 (eco-efficiency score: 0.867) | MEDIUM | Nov 2025 |
| DeepSeek-R1 | 5.00 | 17.00 | 33.00 | Jegham et al. 2025 (comparable to o3; eco-efficiency score: 0.058, worst) | MEDIUM | Nov 2025 |
| Claude extended thinking | 2.00 | 8.00 | 18.00 | ESTIMATED. Based on reasoning model token overhead (~543 additional tokens avg) applied to Claude base. No published data. | ESTIMATED | Apr 2026 |
| Gemini Deep Research | 3.00 | 10.00 | 25.00 | ESTIMATED. Multi-step research = multiple sequential LLM calls. No published data. | ESTIMATED | Apr 2026 |

### Query length tier definitions

| Tier | Description | Typical total tokens | Scaling rationale |
|---|---|---|---|
| Short | Quick questions, simple lookups, code autocomplete | <500 tokens | Jegham "short" category |
| Medium | Standard work — drafting, summarising, coding | 500-2,000 tokens | Interpolated between short and long |
| Long | Deep analysis, long documents, extended conversations | 2,000+ tokens | Jegham "long" category |

**Scaling note:** The ratio between short and long queries varies by model. For GPT-4o, Jegham reports 0.42 Wh (short) to 1.79 Wh (long) — a ratio of ~4.3x. We apply similar scaling ratios to models where only one data point exists, but acknowledge this introduces additional uncertainty.

---

## Usage Intensity Mapping

| Level | Queries per employee per day | % of staff using AI |
|---|---|---|
| Exploring | 5 | 15% |
| Adopting | 15 | 40% |
| Embedded | 35 | 70% |
| AI-native | 80 | 90% |

Working days per year: 230

---

## Grid Carbon Intensity (kgCO2e/kWh)

Location-based. See Hole 4 above for rationale.

| Region | Factor | Source | Year |
|---|---|---|---|
| United Kingdom | 0.128 | DEFRA/DESNZ 2025 | 2025 |
| France | 0.052 | RTE France / EEA | 2024 |
| Germany | 0.350 | Umweltbundesamt (UBA) | 2024 |
| Netherlands | 0.280 | CBS Netherlands / EEA | 2024 |
| EU West (average) | 0.250 | EEA weighted average | 2024 |
| EU North / Nordics | 0.030 | EEA (hydro/nuclear dominant) | 2024 |
| United States (average) | 0.390 | EPA eGRID | 2024 |
| US East (Virginia, Ohio) | 0.380 | EPA eGRID (PJM/RFCE regions) | 2024 |
| US West (Oregon, California) | 0.180 | EPA eGRID (WECC region) | 2024 |
| Asia Pacific (average) | 0.450 | IEA World Energy Outlook | 2024 |
| India | 0.820 | IEA / Central Electricity Authority | 2024 |
| Don't know | 0.300 | Approximate global weighted average | 2024 |

**Important caveat:** These are annual national/regional averages. Actual grid carbon intensity varies hour-by-hour and location-by-location within a country. For higher precision, organisations can use time-resolved grid data from sources like Electricity Maps or the UK National Grid ESO Carbon Intensity API.

---

## Cloud Infrastructure

### Method: Spend-based (Tier 1 — GHG Protocol)

See Hole 7 above for known limitations.

```
Cloud_carbon_kgCO2 = annual_cloud_spend_GBP x 0.233 x region_adjustment
```

**Emission factor:** 0.233 kgCO2e per GBP 1 of cloud spend
Source: DEFRA/DESNZ 2025, supply chain emission factors, SIC code 62.01 / 63.11.
Confidence: LOW — spend-based factors are the least granular method recognised by GHG Protocol.

**Region adjustments** (relative to UK baseline, discounted ~25% for hyperscaler efficiency):

| Region | Adjustment | Derivation |
|---|---|---|
| UK | 1.00 | Baseline (DEFRA factor is UK-derived) |
| EU West | 1.50 | 0.250/0.128 = 1.95, discounted |
| EU North | 0.25 | 0.030/0.128 = 0.23 |
| US East | 2.20 | 0.380/0.128 = 2.97, discounted |
| US West | 1.10 | 0.180/0.128 = 1.41, discounted |
| Asia Pacific | 2.80 | 0.450/0.128 = 3.52, discounted |
| Don't know | 1.20 | Moderate upward adjustment |

**Why we discount grid ratios for hyperscalers:** Major cloud providers (AWS, Azure, GCP) operate more efficiently than the average data centre and have made substantial renewable energy investments. Applying raw grid intensity ratios to a spend-based factor that already assumes UK infrastructure would overstate the impact. We apply a ~25% discount to the raw ratio.

**Better alternative:** We recommend users check their cloud provider's carbon dashboard:
- Google Cloud Carbon Footprint: console.cloud.google.com/carbon
- Microsoft Sustainability Calculator: azure.microsoft.com/en-us/blog/microsoft-sustainability-calculator/
- AWS Customer Carbon Footprint Tool: aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/

---

## Employee Devices

### Operational energy

| Device type | Power draw (W) | Daily hours | Working days/yr | Annual kWh | Source |
|---|---|---|---|---|---|
| Laptop | 50 | 8 | 230 | 92 | IEA; manufacturer sustainability reports |
| Desktop + monitor | 180 | 8 | 230 | 331 | IEA; manufacturer sustainability reports |
| Mix (50/50) | 115 | 8 | 230 | 212 | Blended average |

Convert to kgCO2e: `annual_kWh x regional_grid_intensity`

### Embodied carbon (manufacturing, amortised)

| Device | Total embodied kgCO2e | Source | Confidence |
|---|---|---|---|
| Laptop | 300 | Dell, HP, Lenovo sustainability reports; Cranfield University LCA; PAIA database | MEDIUM |
| Desktop + monitor | 500 | Same sources | MEDIUM |
| Mix | 400 | Blended | MEDIUM |

**Amortisation over refresh cycle:**

| Refresh cycle | Midpoint (years) | Laptop kgCO2e/yr | Desktop kgCO2e/yr |
|---|---|---|---|
| 2-3 years | 2.5 | 120 | 200 |
| 3-4 years | 3.5 | 86 | 143 |
| 4-5 years | 4.5 | 67 | 111 |
| 5+ years | 6.0 | 50 | 83 |

### Work pattern adjustment

| Pattern | Multiplier | Reasoning |
|---|---|---|
| Mostly office | 1.00 | Baseline |
| Hybrid | 0.95 | Marginally less total on-time |
| Mostly remote | 0.90 | Less total on-time; home energy may be less efficient but device usage decreases |

---

## Video Conferencing

| Intensity | Hours/employee/year | kgCO2e/employee/year | Derivation |
|---|---|---|---|
| Rarely | 20 | 4 | 20 x 0.200 |
| A few times/week | 100 | 20 | 100 x 0.200 |
| Daily | 300 | 60 | 300 x 0.200 |
| Multiple hours daily | 600 | 120 | 600 x 0.200 |

Based on approximately 200g CO2e per hour of video conferencing.
Source: Carbon Trust (2021); Greenspector measurements; IEA analysis.

---

## What Is Explicitly Excluded

1. **Model training emissions** — Training is a one-time cost amortised across billions of queries. Per-query training contribution is negligible.
2. **Network transmission energy** — Typically 0.001-0.01 Wh per query, two orders of magnitude below inference energy.
3. **End-user device energy for AI interaction** — Additional power draw while waiting for an AI response is negligible compared to inference-side energy.
4. **SaaS tool carbon** — Insufficient data for credible per-user factors. Companies seeking this should apply DEFRA spend-based factors against their SaaS invoices independently.
5. **Water consumption** — Important environmental metric but separate from carbon calculation. Future versions of PromptCarbon may add a water footprint estimate.
6. **Scope 1 data centre emissions** — Backup generators, refrigerant leaks. Typically <5% of total.
7. **Data centre construction embodied carbon** — No credible way to allocate construction carbon to individual queries.

---

## Calculation Formula (v2.1 pseudocode)

```javascript
// PromptCarbon calculation engine v2.1

// Convert Wh to gCO2e using regional grid intensity
// gCO2e = Wh * gridIntensity (when grid is in kgCO2e/kWh)
// Example: 0.42 Wh * 0.128 kgCO2e/kWh = 0.054 gCO2e

function calculateFootprint(inputs) {

  // ---- AI EMISSIONS ----

  // Step 1: Determine daily queries per employee
  const { queriesPerDay, adoptionRate } = intensityMap[inputs.usageIntensity];
  const activeEmployees = inputs.employeeMidpoint * adoptionRate;
  const totalDailyQueries = activeEmployees * queriesPerDay;

  // Step 2: Split queries across selected tools
  const queriesPerTool = totalDailyQueries / inputs.selectedTools.length;

  // Step 3: Calculate energy per tool using query length tier
  let totalDailyEnergy_Wh = 0;
  for (const tool of inputs.selectedTools) {
    const factor_Wh = MODEL_FACTORS[tool][inputs.queryLengthTier];
    totalDailyEnergy_Wh += queriesPerTool * factor_Wh;
  }

  // Step 4: Add reasoning model overhead if applicable
  if (inputs.usesReasoning === 'occasionally') {
    totalDailyEnergy_Wh *= 1.9;   // 10% of queries at ~10x energy
  } else if (inputs.usesReasoning === 'regularly') {
    totalDailyEnergy_Wh *= 3.7;   // 30% at ~10x energy
  }

  // Step 5: Annualise (230 working days for employee tools)
  let annualAIEnergy_Wh = totalDailyEnergy_Wh * 230;

  // Step 5b: Custom API runs 365 days if applicable
  if (inputs.selectedTools.includes('customAPI') && inputs.customAPIVolume) {
    const customFactor = MODEL_FACTORS.customAPI[inputs.queryLengthTier];
    annualAIEnergy_Wh += inputs.customAPIVolume * customFactor * 365;
  }

  // Step 6: Convert to carbon using regional grid intensity
  const aiCarbon_kgCO2 = (annualAIEnergy_Wh / 1000) * inputs.gridIntensity;


  // ---- CLOUD EMISSIONS ----

  const annualCloudSpend = inputs.monthlyCloudSpend * 12;
  const cloudCarbon_kgCO2 = annualCloudSpend * 0.233 * REGION_ADJUSTMENT[inputs.cloudRegion];


  // ---- DEVICE EMISSIONS ----

  const deviceKwh = DEVICE_ENERGY_KWH[inputs.deviceType];
  const deviceOperational_kgCO2 = deviceKwh * inputs.gridIntensity * inputs.employeeMidpoint;
  const deviceEmbodied_kgCO2 = EMBODIED[inputs.deviceType][inputs.refreshCycle] * inputs.employeeMidpoint;
  const deviceCarbon_kgCO2 = (deviceOperational_kgCO2 + deviceEmbodied_kgCO2) * WORK_PATTERN[inputs.workPattern];


  // ---- VIDEO EMISSIONS ----

  const videoCarbon_kgCO2 = (VIDEO_KG[inputs.videoIntensity] * inputs.employeeMidpoint) / 1000;


  // ---- TOTAL ----

  const total_kgCO2 = aiCarbon_kgCO2 + cloudCarbon_kgCO2 + deviceCarbon_kgCO2 + videoCarbon_kgCO2;
  const total_tonnes = total_kgCO2 / 1000;

  return { total_tonnes, breakdown: { ai, cloud, devices, video } };
}
```

---

## Equivalences

| Equivalence | Factor | Source |
|---|---|---|
| Return flights London-New York (economy, with radiative forcing) | 1 flight = 3,950 kgCO2e | DEFRA/DESNZ 2025 |
| Driving in average petrol car | 1 km = 0.166 kgCO2e | DEFRA/DESNZ 2025 |
| UK household annual electricity | ~1,060 kgCO2e | DEFRA 2025 (avg 8,300 kWh x 0.128) |
| Smartphones fully charged | 1 charge = 0.012 kgCO2e | IEA estimate |
| Google web searches | 1 search = 0.0002 kgCO2e | Google published figure |
| Mature trees absorbing CO2/year | ~22 kgCO2/year per tree | European Environment Agency |

---

## Sources

1. Jegham, N., Abdelatti, M., Elmoubarki, L., & Hendawi, A. (2025). "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference." arXiv:2505.09598. University of Rhode Island / University of Tunis.
2. Google Cloud (2025). "Measuring the environmental impact of AI inference." Vahdat, A. & Dean, J.
3. OpenAI / Sam Altman (2025). Public statement: average ChatGPT query uses approximately 0.34 Wh. June 2025.
4. DEFRA / DESNZ (2025). "UK Government GHG Conversion Factors for Company Reporting." Department for Energy Security and Net Zero.
5. De Vries-Gao, A. (2025). "The carbon and water footprints of data centers and what this could mean for artificial intelligence." Patterns, Cell Press. VU Amsterdam.
6. EPA (2024). eGRID — Emissions & Generation Resource Integrated Database. United States Environmental Protection Agency.
7. EEA (2024). CO2 emission intensity of electricity generation. European Environment Agency.
8. IEA (2025). "Energy and AI" report. International Energy Agency.
9. Ritchie, H. (2025). "What's the carbon footprint of using ChatGPT or Gemini?" Our World in Data / Substack analysis. August 2025.
10. EcoLogits / GenAI Impact (2025). Open-source methodology documentation. Published in Journal of Open Source Software, 10(111), 7471.
11. Carbon Trust (2021). "The carbon impact of video streaming."
12. GHG Protocol (2011). Corporate Value Chain (Scope 3) Accounting and Reporting Standard. World Resources Institute / WBCSD.
13. Uptime Institute (2024). Global Data Center Survey — average PUE data.
14. MIT Technology Review (2025). "In a first, Google has released data on how much energy an AI prompt uses." August 2025.
15. Cranfield University. IT equipment lifecycle assessment data. Referenced via Reuse Tech Group methodology guide.
16. ACL 2025. "Energy Considerations of Large Language Model Inference and Efficiency." Association for Computational Linguistics.
17. arXiv:2604.00053 (2026). "The Energy Footprint of LLM-Based Environmental Analysis: LLMs and Domain Products."
18. Gravity Climate (2025). "Developing an Emissions Accounting Methodology for AI." Published methodology building on Jegham et al. framework.

---

## Update Commitment

PromptCarbon commits to:
- Reviewing all emission factors quarterly
- Updating grid intensity factors annually (when DEFRA/EPA/EEA publish new data)
- Incorporating new provider disclosures within 30 days of publication
- Flagging all factors with "last verified" dates
- Displaying a staleness warning if any factor is >6 months old
- Publishing a changelog of all methodology updates on GitHub

All methodology changes are tracked in Git with full diff history. Anyone can review what changed, when, and why.

---

## Contributing

Found an error? Have better data? [Open an issue](https://github.com/Prompt-Carbon/methodology/issues) or submit a pull request.

## License

MIT with Attribution — see [LICENSE](LICENSE). Any use of these emission factors or methodology must include a visible attribution linking back to [promptcarbon.com](https://promptcarbon.com).

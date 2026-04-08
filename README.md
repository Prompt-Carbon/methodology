# PromptCarbon — AI Carbon Emission Methodology

Open-source emission factors and calculation methodology for estimating the carbon footprint of AI usage.

**Website:** [promptcarbon.com](https://promptcarbon.com)

---

## What This Is

This repository contains the emission factors, data sources, and calculation logic behind [PromptCarbon](https://promptcarbon.com) — a free tool that helps businesses estimate the carbon footprint of their AI and digital infrastructure.

Everything here is open for inspection, challenge, and improvement. If you think a number is wrong, open an issue or submit a PR.

## AI Emission Factors (gCO₂e per query)

| Model / Tool | Factor | Source | Confidence |
|---|---|---|---|
| Google Gemini | 0.03 | Google published data, Aug 2025 | High |
| GitHub Copilot | 0.15 | Estimated — code completion, short outputs | Low |
| Microsoft Copilot M365 | 0.50 | Estimated — hybrid model routing | Medium |
| Claude (Anthropic) | 0.55 | Jegham et al. 2025 benchmarks | Medium |
| ChatGPT / GPT-4o | 0.70 | Arbor.eco analysis, EcoLogits | Medium |
| Custom API (heavy use) | 1.20 | Long context, reasoning models estimate | Low |
| AI Image Generation | 3.50 | IEA, multiple studies | Medium |

## Usage Intensity Mapping

| Level | Queries per employee per day | % of staff using AI |
|---|---|---|
| Exploring | 5 | 15% |
| Adopting | 15 | 40% |
| Embedded | 35 | 70% |
| AI-native | 80 | 90% |

Working days per year: 230

## Grid Carbon Intensity (kgCO₂e/kWh)

| Region | Intensity | Source |
|---|---|---|
| UK | 0.128 | DEFRA/DESNZ 2025 |
| Germany | 0.350 | IEA 2025 |
| France | 0.052 | IEA 2025 |
| Netherlands | 0.328 | IEA 2025 |
| United States | 0.380 | EPA eGRID 2024 |
| EU West (average) | 0.250 | IEA 2025 |
| EU North / Nordics | 0.030 | IEA 2025 |
| Asia Pacific (average) | 0.450 | IEA 2025 |

## Cloud Infrastructure

**Spend-based emission factor:** 0.233 kgCO₂e per £1 of cloud spend (DEFRA/DESNZ SIC code: Computer programming, consultancy and related activities)

**Provider PUE (Power Usage Effectiveness):**

| Provider | PUE | Efficiency Factor |
|---|---|---|
| Google Cloud | 1.10 | 0.85 |
| Microsoft Azure | 1.18 | 0.92 |
| AWS | 1.20 | 0.94 |
| Other / On-premise | 1.60 | 1.25 |

**Region adjustment multipliers** (relative to UK baseline):

| Region | Multiplier |
|---|---|
| UK | 1.00 |
| EU West | 1.95 |
| EU North (Nordics) | 0.23 |
| US East | 2.97 |
| US West | 1.41 |
| Asia Pacific | 3.52 |

## Employee Devices

**Operational energy:**

| Type | Annual kWh | Basis |
|---|---|---|
| Laptop | 92 | ~50W × 8hrs × 230 days |
| Desktop | 276 | ~150W × 8hrs × 230 days |
| Mix | 184 | Average |

**Embodied carbon (amortised, kgCO₂e/year):**

| Type | 2-3 yr refresh | 3-4 yr | 4-5 yr | 5+ yr |
|---|---|---|---|---|
| Laptop (300 kg total) | 120 | 86 | 67 | 55 |
| Desktop (400 kg total) | 160 | 114 | 89 | 73 |
| Mix (350 kg total) | 140 | 100 | 78 | 64 |

## SaaS, Storage & Video

**SaaS per user per year:**
- 1–5 tools: 50 kgCO₂e
- 5–15 tools: 100 kgCO₂e
- 15–30 tools: 150 kgCO₂e
- 30+ tools: 200 kgCO₂e

**Data storage per year:**
- < 100 GB: 5 kgCO₂e
- 100 GB – 1 TB: 25 kgCO₂e
- 1 – 10 TB: 120 kgCO₂e
- 10 TB+: 500 kgCO₂e

**Video conferencing per employee per year:**
- Rarely: 4 kgCO₂e
- Weekly: 20 kgCO₂e
- Daily: 60 kgCO₂e
- Heavy: 120 kgCO₂e

## Calculation Formula

```
Total = AI + Cloud + Devices + SaaS + Storage + Video

AI       = Σ (queries_per_day × 230 × emission_factor / 1000) per tool
Cloud    = monthly_spend × 12 × 0.233 × region_multiplier × provider_efficiency
Devices  = employees × (operational_kWh × grid_intensity + embodied_amortised)
SaaS     = employees × saas_factor
Storage  = storage_factor
Video    = employees × video_factor
```

All values in kgCO₂e. Divide by 1000 for tonnes.

## Equivalences

- 1 return flight London–New York: 3,950 kgCO₂e (DEFRA 2025)
- 1 mile driven (petrol car): 0.27 kgCO₂e (DEFRA 2025)
- 1 UK household annual electricity: 1,100 kgCO₂e (DEFRA 2025)
- 1 smartphone charge: 0.012 kgCO₂e

## Limitations

- Actual hardware used by AI providers is undisclosed
- Real-time grid mix varies hourly and seasonally
- Model architecture details are proprietary
- PUE varies by specific facility, not just provider average
- Spend-based cloud factors are industry averages, not actuals
- Renewable energy purchases (PPAs/RECs) are not accounted for

These estimates should be treated as order-of-magnitude indicators, not precise measurements.

## Sources

1. Google DeepMind — Gemini environmental report (Aug 2025)
2. Jegham et al. — "How Hungry is AI?" (2025)
3. DEFRA/DESNZ — UK Government GHG Conversion Factors 2025
4. IEA — "Energy and AI" report (2025)
5. EcoLogits — open-source library methodology
6. Arbor.eco — AI environmental impact analysis
7. De Vries & Gao — Patterns journal (Dec 2025)
8. EPA — eGRID data for US grid intensity (2024)
9. Cloud Carbon Footprint — open-source methodology

## Contributing

Found an error? Have better data? [Open an issue](https://github.com/Prompt-Carbon/methodology/issues) or submit a pull request.

## License

MIT — see [LICENSE](LICENSE).

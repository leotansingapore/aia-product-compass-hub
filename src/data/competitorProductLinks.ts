// Official Singapore-domain links for every product in the competitor inventory
// at docs/competitor-products-singapore.md. Keyed by `insurerSlug → productName`
// so the same product name across insurers (e.g. "Plan A" appears in both HSBC
// Life Shield and AIA HealthShield Gold Max) does not collide.
//
// Source: 8 parallel research agents that searched the insurers' official
// Singapore domains in January 2026. Links verified via WebSearch / WebFetch
// at gather time but not re-verified continuously — insurers occasionally
// rotate CDN paths. If a link 404s, prefer the website over the brochure /
// summary, and confirm on the insurer's site before sending to a client.

export interface ProductLinks {
  website?: string | null;
  brochure?: string | null;
  summary?: string | null;
}

export const COMPETITOR_PRODUCT_LINKS: Record<string, Record<string, ProductLinks>> = {
  "aia": {
    "AIA Guaranteed Protect Plus (IV)": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/whole-life-insurance/aia-guaranteed-protect-plus-iv",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-guaranteed-protect-plus-iv.pdf",
    },
    "AIA Pro Lifetime Protector (II)": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/whole-life-insurance/aia-pro-lifetime-protector-ii",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-pro-lifetime-protector-ii.pdf",
    },
    "AIA Life Dividends": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/whole-life-insurance/aia-life-dividends",
    },
    "Direct - AIA Whole Life Cover (II)": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/whole-life-insurance/direct-aia-whole-life-cover-ii",
    },
    "AIA Secure Flexi Term": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/term-insurance/aia-secure-flexi-term",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-secure-flexi-term-brochure.pdf",
    },
    "Direct - AIA Term Cover": {
      website: "https://www.aia.com.sg/en/our-products/life-insurance/term-insurance/direct-aia-term-cover",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-direct-term-cover.pdf",
      summary: "https://insure.aia.com.sg/resources/public/files/DPI-ProductSummary.pdf",
    },
    "AIA Absolute Critical Cover": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-absolute-critical-cover",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-absolute-critical-cover-brochure.pdf",
    },
    "AIA Ultimate Critical Cover": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-ultimate-critical-cover",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-ultimate-critical-cover-brochure.pdf",
    },
    "AIA Beyond Critical Care": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-beyond-critical-care",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-beyond-critical-care.pdf",
    },
    "AIA Power Critical Cover": {},
    "AIA Glow of Life": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-glow-of-life",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-glow-of-life.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-glow-of-life.pdf",
    },
    "AIA Multistage Cancer Cover": {
      website: "https://www.aia.com.sg/en/our-products/critical-illness-protection/aia-multistage-cancer-cover.html",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/health/aia-multistage-cancer-cover-flyer.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-aia-multistage-cancer-cover.pdf",
    },
    "AIA Enhanced Cancer Protect": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-enhanced-cancer-protect",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-enhanced-cancer-protect-brochure.pdf",
    },
    "AIA Prime Critical Cover": {
      website: "https://www.aia.com.sg/en/our-products/health/critical-illness/aia-prime-critical-cover",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-prime-critical-cover.pdf",
    },
    "AIA Smart Wealth Builder Series": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/participating-savings/aia-smart-wealth-builder-series",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-smart-wealth-builder-series.pdf",
    },
    "AIA Smart Flexi Growth": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/participating-savings/aia-smart-flexi-growth",
    },
    "AIA Smart Flexi Rewards (II)": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/participating-savings/aia-smart-flexi-rewards-ii",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-smart-flexi-rewards-ii.pdf",
    },
    "AIA Smart Goal 10": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/participating-savings/aia-smart-goal-10",
    },
    "AIA Retirement Saver (IV)": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/participating-savings/aia-retirement-saver-iv",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-retirement-saver-iv.pdf",
    },
    // AIA HealthShield Gold Max has four tiers in the markdown; each maps to the same Shield page.
    "Plan A": {
      website: "https://www.aia.com.sg/en/our-products/health/medical-insurance/aia-healthshield-gold-max",
      brochure: "https://www.aia.com.sg/content/dam/sg/en/docs/product_brochures/medical-protection/aia-health-shield-gold-max-english-brochure.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-for-healthshield-gold-max.pdf",
    },
    "Plan B": {
      website: "https://www.aia.com.sg/en/our-products/health/medical-insurance/aia-healthshield-gold-max",
      brochure: "https://www.aia.com.sg/content/dam/sg/en/docs/product_brochures/medical-protection/aia-health-shield-gold-max-english-brochure.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-for-healthshield-gold-max.pdf",
    },
    "Plan B Lite": {
      website: "https://www.aia.com.sg/en/our-products/health/medical-insurance/aia-healthshield-gold-max",
      brochure: "https://www.aia.com.sg/content/dam/sg/en/docs/product_brochures/medical-protection/aia-health-shield-gold-max-english-brochure.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-for-healthshield-gold-max.pdf",
    },
    "Standard Plan": {
      website: "https://www.aia.com.sg/en/our-products/health/medical-insurance/aia-healthshield-gold-max",
      brochure: "https://www.aia.com.sg/content/dam/sg/en/docs/product_brochures/medical-protection/aia-health-shield-gold-max-english-brochure.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-for-healthshield-gold-max.pdf",
    },
    "AIA Max VitalHealth / AIA Max VitalCare": {
      website: "https://www.aia.com.sg/en/our-products/health/medical-insurance/aia-healthshield-gold-max",
      brochure: "https://www.aia.com.sg/content/dam/sg/en/docs/product_brochures/medical-protection/aia-health-shield-gold-max-english-brochure.pdf",
    },
    "AIA Solitaire PA (II)": {
      website: "https://www.aia.com.sg/en/our-products/accident-protection/aia-solitaire-personal-accident",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/accident-protection/aia-solitaire-personal-accident.PDF",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-solitaire-ii.pdf",
    },
    "AIA Platinum AccidentCare": {
      website: "https://www.aia.com.sg/en/our-products/accident-protection/aia-platinum-accidentcare",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-platinum-accidentcare.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-platinum-accidentcare.pdf",
    },
    "AIA Star Protector Plus": {
      website: "https://www.aia.com.sg/en/our-products/accident-protection/aia-star-protector-plus",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-star-protector-plus.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-star-protector-plus.pdf",
    },
    "AIA Premier Disability Cover": {
      website: "https://www.aia.com.sg/en/our-products/health/disability-income-insurance/aia-premier-disability-cover",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-premier-disability-cover.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/AIA_Premier_Disability_Coverage.pdf",
    },
    "AIA Pay Protector": {
      website: "https://www.aia.com.sg/en/our-products/health/disability-income-insurance/aia-pay-protector",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-pay-protector.pdf",
      summary: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-pay-protector.pdf",
    },
    "AIA Pro Achiever 3.0": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/investment-linked/aia-pro-achiever-iii",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-pro-achiever-3.0.pdf",
    },
    "AIA Platinum Wealth Venture 2.0 (PWV 2.0)": {
      website: "https://www.aia.com.sg/en/our-products/platinum/wealth-accumulation/aia-platinum-wealth-venture-ii",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-platinum-wealth-venture-ii.pdf",
    },
    "AIA Platinum Wealth Elite 2.0": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/investment-linked/aia-platinum-wealth-elite-ii",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-platinum-wealth-elite-2.0-brochure.pdf",
    },
    "AIA Platinum Wealth Legacy": {
      website: "https://www.aia.com.sg/en/our-products/platinum/legacy-planning/aia-platinum-wealth-legacy",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-platinum-wealth-legacy.pdf",
    },
    "AIA Platinum Retirement Elite": {
      website: "https://www.aia.com.sg/en/our-products/platinum/wealth-accumulation/aia-platinum-retirement-elite",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-platinum-retirement-elite.pdf",
    },
    "AIA Elite Secure Income": {
      website: "https://www.aia.com.sg/en/our-products/save-and-invest/investment-linked/aia-elite-secure-income",
      brochure: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-elite-secure-income.pdf",
    },
  },

  "great-eastern": {
    "GREAT Term 2": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/great-term.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/life-insurance-/great-term-2/gels-pdt-pd-gt2-eng-brochure.pdf",
    },
    "GoGreat Term Life": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/gogreat-term-life.html",
    },
    "DIRECT GREAT Life II": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/direct-great-life-2.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/life-insurance/direct-great-life-2/direct-great-life-2-brochure.pdf",
      summary: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/life-insurance/direct-great-life-2/direct-great-life-2-servicing-guide.pdf",
    },
    "GREAT Life Advantage 4": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/great-life-advantage.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/life-insurance-/great-life-advantage/great-life-advantage-4-eng-brochure.pdf",
    },
    "GREAT Life Multiplier": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/great-life-multiplier.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/life-insurance-/great-life-multiplier/gels-pdt-pd-glm-eng-brochure.pdf",
    },
    "GREAT Flexi Protect Series": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/great-flexi-protect-series.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/life-insurance/great-flexi-protect-series/great-flexi-protect-brochure-english.pdf",
    },
    "GREAT Critical Cover: Top 3 CIs": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-critical-cover.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-critical-cover/great-critical-cover-series-web-brochure.pdf",
    },
    "GREAT Critical Cover: Complete": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-critical-cover.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-critical-cover/great-critical-cover-series-web-brochure.pdf",
    },
    "GREAT Cancer Guard": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-cancer-guard.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/cancer-guard/cancer-guard-eng-brochure.pdf",
    },
    "Prestige Legacy Advantage": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/prestige-legacy-advantage.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/life-insurance-/prestige-legacy-advantage/prestige-legacy-advantage-english-brochure.pdf",
    },
    "GREAT Wealth Multiplier 3": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-wealth-multiplier.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/wealth-accumulation/great-wealth-multiplier-3/great-wealth-multiplier-3-brochure.pdf",
    },
    "GREAT Flexi Cashback": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-flexi-cashback.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/wealth-accumulation/great-flexi-cashback/great-flexi-cashback-english-brochure.pdf",
    },
    "GREAT Flexi Saver": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-flexi-saver.html",
    },
    "GREAT Flexi Goal": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-flexi-goal.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/wealth-accumulation/great-flexi-goal/brochure.pdf",
    },
    "GREAT SP": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-sp.html",
      brochure: "https://www.greateasternlife.com/content/dam/great-eastern/sg/homepage/personal-insurance/our-products/wealth-accumulation/great-sp/great-sp-series-5a-brochure.pdf",
    },
    "GREAT Index Income": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-index-income.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/wealth-accumulation/great-index-income/great-index-income-eng-brochure.pdf",
    },
    "Index Income (USD)": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/index-income.html",
    },
    "Child Education Fund": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/child-education-fund.html",
    },
    "GREAT Retire Income": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/retirement-income/great-retire-income.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/homepage/personal-insurance/our-products/retirement-income/great-retire-income-brochure.pdf",
    },
    "GREAT Lifetime Payout 3": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/retirement-income/great-lifetime-payout.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/wealth-accumulation/great-lifetime-payout/documents/gels-pdt-pd-glp3-brochure-ri.pdf",
    },
    "GREAT Prime Rewards 3": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/retirement-income/great-prime-rewards.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/retirement/great-prime-rewards/wealth-accumulation/gels-pd-pdt-great-prime-rewards3-brochure.pdf",
    },
    "Prestige Life Rewards Series": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/prestige-life-rewards-series.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/prestige-/prestige-life-rewards-series/prestige-life-rewards-series-brochure.pdf",
    },
    "Prestige Wealth Legacy": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/prestige-wealth-legacy.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/prestige-/prestige-wealth-legacy/prestige-wealth-legacy-eng-brochure.pdf",
    },
    "Prestige Harvest": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/prestige-harvest-universal-life-insurance-plan.html",
    },
    "Prestige Legacy Index": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/life-insurance/prestige-legacy-index.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/prestige-/prestige-legacy-index/prestige-legacy-index-eng-brochure.pdf",
    },
    "GREAT SupremeHealth P Plus": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-supremehealth-main.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-eng-brochure.pdf",
      summary: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT SupremeHealth A Plus": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-supremehealth-public-hospital.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-eng-brochure.pdf",
      summary: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT SupremeHealth B Plus": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-supremehealth-main.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-eng-brochure.pdf",
      summary: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT SupremeHealth Standard": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-supremehealth-main.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-eng-brochure.pdf",
      summary: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT TotalCare (Elite)": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-totalcare.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT TotalCare (Classic)": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-totalcare.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-supremehealth/april-2026/gels-pdt-pd-gsh-gtc-tob-eng.pdf",
    },
    "GREAT Hospital Cash": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-hospital-cash.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-hospital-cash/great-hospital-cash-english-brochure-01012024.pdf",
    },
    "Pay Assure": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/pay-assure.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/pay-assure/gels-pdt-pd-pay-assure-brochure-english.pdf",
    },
    "GREAT CareShield": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/great-careshield.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/health-insurance-/great-careshield/great-careshield-english-brochure.pdf",
    },
    "ElderShield Comprehensive / ElderShield Value Plus": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/health-insurance/eldershield-comprehensive-and-eldershield-value-plus.html",
      brochure: "https://www.greateasternlife.com/content/dam/great-eastern/sg/homepage/personal-insurance/find-the-right-plan/protect-yourself-and-your-family/health-protection/eldershield-comprehensive-and-eldershield-value-plus/eldershield.pdf",
    },
    "GREAT Protector Active": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/personal-accident-insurance/great-protector-active.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/personal-accident/great-protector-active/gpa-web-brochure.pdf",
    },
    "PA Supreme": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/personal-accident-insurance/pa-supreme.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/personal-accident/pa-supreme/gels-pdt-pd-pa-supreme-eng-brochure.pdf",
    },
    "GREAT Golden Protector": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/personal-accident-insurance/great-golden-protector.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/personal-accident/great-golden-protector/ggp-web-brochure.pdf",
    },
    "My GREAT PA Plan": {},
    "GREAT Dengue Cover": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/rewards-and-promotions/promotions-and-events/2024/great-dengue-cover.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-gogreat/great-dengue-cover/gels-pdt-pd-gdc-coi.pdf",
    },
    "GREAT Wealth Advantage 4": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-wealth-advantage.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/wealth-accumulation/great-wealth-advantage-4/great-wealth-advantage-english-brochure.pdf",
    },
    "GREAT Invest Advantage": {
      website: "https://www.greateasternlife.com/sg/en/personal-insurance/our-products/wealth-accumulation/great-invest-advantage.html",
      brochure: "https://www.greateasternlife.com/content/dam/corp-site/great-eastern/sg/gels-ftrp-imc-cm/wealth-accumulation/great-invest-advantage/great-invest-advantage-brochure.pdf",
    },
  },

  "prudential": {
    "PRUActive Term": {
      website: "https://www.prudential.com.sg/products/life-insurance/term-life-insurance/pruactive-term",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-term/pruactive_term_ebrochure_english.pdf",
    },
    "PRUMortgage": {
      website: "https://www.prudential.com.sg/products/life-insurance/mortgage-insurance/prumortgage",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prumortgage/prumortgage-ebrochure-english.pdf",
    },
    "PRUActive Life V": {
      website: "https://www.prudential.com.sg/products/life-insurance/whole-life-insurance/pruactive-life-v",
    },
    "PRUActive Life III": {
      website: "https://www.prudential.com.sg/products/life-insurance/whole-life-insurance/pruactive-life-iii",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-life-iii/pruactive-life-iii_eng.pdf",
    },
    "PRUActive Life II": {
      website: "https://www.prudential.com.sg/products/life-insurance/whole-life-insurance/pruactive-life-ii",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-life-ii/pruactivelifeii_enbrochure_ad.pdf",
    },
    "PRUActive Protect": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/pruactive-protect",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-protect/pruactive-protect-brochure-en.pdf",
    },
    "PRUEarly Stage Crisis Cover": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/pruearly-stage-crisis-cover",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruearly-stage-crisis/pruearly-stage-crisis-ebrochure-eng-final.pdf",
    },
    "PRUActive Crisis Guard": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/pruactive-crisis-guard",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-crisis-guard/pruactive-crisis-guard-brochure-eng.pdf",
    },
    "PRUCancer 360": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/prucancer-360",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prucancer-360/prucancer360-brochures-en.pdf",
    },
    "PRULady": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/prulady",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prulady/prulady-ebrochure-en.pdf",
    },
    "PRUMan": {
      website: "https://www.prudential.com.sg/products/health-insurance/critical-illness/pruman",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruman/pruman-ebrochure-en.pdf",
    },
    "PRUTriple Protect": {
      brochure: "https://www.prudential.com.sg/~/media/prudential/PDF/ebrochures/prutriple-protect-eBrochure-en.pdf",
    },
    "PRUMum": {
      website: "https://www.prudential.com.sg/products/life-insurance/maternity-insurance/prumum",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prumum/prumum_ebrochure_english.pdf",
    },
    "PRUFirst Promise": {
      website: "https://www.prudential.com.sg/products/life-insurance/maternity-insurance/prufirst-promise",
      brochure: "https://www.prudential.com.sg/-/media/prudential/pdf/ebrochures/par-pi/pfp_enbrochure_ad.ashx",
    },
    "PRUFirst Gift II": {
      website: "https://www.prudential.com.sg/products/life-insurance/maternity-insurance/pfg2",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pfg2/prufirst-gift-ii-brochure-en.pdf",
    },
    "PRUApex Legacy Index": {
      website: "https://www.prudential.com.sg/products/legacy-planning/pruapex-legacy-index",
    },
    "PRUVantage Legacy Index": {
      website: "https://www.prudential.com.sg/products/legacy-planning/pruvantage-legacy-index",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-legacy-index/pruvantage-legacy-index_brochure_en.pdf",
    },
    "PRULife Vantage Achiever Prime Series": {
      website: "https://www.prudential.com.sg/products/legacy-planning/prulife-vantage-achiever-prime-series",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-achiever-prime-series/prulife_vantage_achiever_prime_series_brochure_en.pdf",
    },
    "PRUActive Saver III": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruactive-saver-iii",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-saver-iii/pruactive-saver-iii-sgd_eng.pdf",
    },
    "PRUActive Cash": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruactive-cash",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-cash/pruactive-cash-brochure_ad.pdf",
    },
    "PRUFlexicash": {
      website: "https://www.prudential.com.sg/products/savings/other-savings-goals-regular-payout/pruflexicash",
    },
    "PRUAssure IndexRewards": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruassure-indexrewards",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruassure-indexrewards/pruassure-indexrewards_brochure_en.pdf",
    },
    "PRUIndex Income Boost": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruindex-incomeboost",
    },
    "PRUWealth Plus (SGD)": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruwealth-plus-sgd",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruwealth-plus-sgd/pruwealth-plus-sgd-ebrochure-eng.pdf",
    },
    "PRUWealth Income": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruwealth-income",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruwealth-income/pruwealth-income-ebrochure-eng.pdf",
    },
    "PRUWealth (USD)": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/pruwealth-usd",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruwealth-usd/pruwealth_usd_ebrochure_english.pdf",
    },
    "PRUSave Max Limited Pay (USD)": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/prusave-max-limited-pay-usd",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prusave-max-limited-pay/prusave-max-limited-pay-usd_brochure_en.pdf",
    },
    "PRUActive Retirement II": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/retirement/pruactive-retirement-ii",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-retirement-ii/pruactive-retirement-ii_ebrochure_eng_ad.pdf",
    },
    "PRULifetime Income Plus": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/savings/prulifetime-income-plus",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prulifetime-income-plus/prulifetime-income-plus-english.pdf",
    },
    "PRUShield Premier": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prushield/prushield-ebrochure-english.pdf",
    },
    "PRUShield Plus": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prushield/prushield-ebrochure-english.pdf",
    },
    "PRUShield Standard": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prushield/prushield-ebrochure-english.pdf",
    },
    "PRUExtra Premier Care": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
    },
    "PRUExtra Preferred Care": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruextra-preferred-copay/ebrochure-eng.pdf",
    },
    "PRUExtra Plus Care": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/prushield",
    },
    "PRUHospital Care360": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/pruhospital-care360",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/phc360/pruhospital-care360_brochure-en.pdf",
    },
    "PRUPersonal Accident": {
      website: "https://www.prudential.com.sg/products/health-insurance/accident/prupersonal-accident",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prupersonal-accident/prupersonal-accident-ebrochure-english.pdf",
    },
    "Care Secure": {
      website: "https://www.prudential.com.sg/products/health-insurance/medical/care-secure",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/caresecure/prudential_income_care_secure_-product_brochure-eng.pdf",
    },
    "PRUActive LinkGuard": {
      website: "https://www.prudential.com.sg/products/life-insurance/whole-life-insurance/pruactive-linkguard",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruactive-linkguard/pruactive-linkguard_brochure_en.pdf",
    },
    "PRUVantage Wealth II": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/pruvantage-wealth-ii",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-wealth-ii/pruvantage-wealth-ii-brochure-en.pdf",
    },
    "PRUVantage Wealth": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/pruvantage-wealth-xsell-scb",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-wealth/pruvantage-wealth-product-brochure.pdf",
    },
    "PRUVantage Assure II": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/pruvantage-assure-series",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-assure-series/ebrochure-en.pdf",
    },
    "PRUVantage Assure (SP)": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/pruvantage-assure-series",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-assure-series/ebrochure-en.pdf",
    },
    "PRUVantage Prosper": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/pruvantage-prosper",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/pruvantage-prosper/pruvantage-prosper_brochure_en.pdf",
    },
    "PRULink InvestGrowth": {
      website: "https://www.prudential.com.sg/products/wealth-accumulation/investments/prulink-investgrowth",
      brochure: "https://www.prudential.com.sg/-/media/project/prudential/pdf/ebrochures/prulinkinvestgrowth/prulink-investgrowth_brochure.pdf",
    },
  },

  "singlife": {
    "Singlife Elite Term II": {
      website: "https://singlife.com/en/life-insurance/elite-term-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/life-insurance/singlife-elite-term-ii/brochure.pdf",
    },
    "Singlife Simple Term": {
      website: "https://singlife.com/en/life-insurance/simple-term",
      brochure: "https://singlife.com/content/dam/public/sg/documents/life-insurance/singlife-simple-term/brochure.pdf",
    },
    "DIRECT - Singlife Term Life": {
      website: "https://singlife.com/en/life-insurance/direct-term-life",
      brochure: "https://singlife.com/content/dam/public/sg/documents/life-insurance/direct-purchase-insurance/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/life-insurance/direct-purchase-insurance/dpi-fact-sheet-and-checklist.pdf",
    },
    "Singlife Whole Life Choice": {
      website: "https://singlife.com/en/life-insurance/whole-life-choice",
      brochure: "https://singlife.com/content/dam/public/sg/documents/life-insurance/singlife-whole-life-choice/brochure.pdf",
    },
    "DIRECT - Singlife Whole Life": {
      website: "https://singlife.com/en/life-insurance/direct-whole-life",
      brochure: "https://singlife.com/content/dam/public/sg/documents/life-insurance/direct-purchase-insurance/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/life-insurance/direct-purchase-insurance/dpi-fact-sheet-and-checklist.pdf",
    },
    "Singlife Multipay Critical Illness II": {
      website: "https://singlife.com/en/critical-illness-insurance/multipay-critical-illness-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/critical-illness-insurance/singlife-multipay-critical-illness-ii/brochure.pdf",
    },
    "Singlife Pinnacle": {
      website: "https://singlife.com/en/pinnacle",
    },
    "Singlife Legacy Indexed Universal Life (IUL)": {
      website: "https://singlife.com/en/legacy-indexed-universal-life",
      brochure: "https://singlife.com/content/dam/public/sg/legacy-indexed-universal-life/brochure.pdf",
    },
    "Singlife Legacy Indexed Income": {
      website: "https://singlife.com/en/pinnacle/legacy-indexed-income",
      brochure: "https://singlife.com/content/dam/public/sg/pinnacle/legacy-indexed-income/singlife-legacy-indexed-income-brochure.pdf",
    },
    "Singlife Flexi Life Income II": {
      website: "https://singlife.com/en/savings/flexi-life-income-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/savings/singlife-flexi-life-income-ii/brochure.pdf",
    },
    "Singlife Smart Saver": {
      website: "https://singlife.com/en/savings/smart-saver",
      brochure: "https://singlife.com/content/dam/public/sg/documents/savings/singlife-smart-saver/brochure.pdf",
    },
    "Singlife Steadypay Saver": {
      website: "https://singlife.com/en/savings/steadypay-saver",
      brochure: "https://singlife.com/content/dam/public/sg/documents/savings/singlife-steadypay-saver/brochure.pdf",
    },
    "Singlife Choice Saver": {
      website: "https://singlife.com/en/savings/choice-saver",
    },
    "Singlife Heritage Income": {
      website: "https://singlife.com/en/savings/heritage-income",
    },
    "Singlife Legacy Income": {
      website: "https://singlife.com/en/savings/legacy-income",
      brochure: "https://singlife.com/content/dam/public/sg/documents/savings/singlife-legacy-income/brochure.pdf",
    },
    "Singlife Flexi Retirement II": {
      website: "https://singlife.com/en/flexi-retirement-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/retirement/singlife-flexi-retirement-ii/brochure.pdf",
    },
    "Singlife Account": {
      website: "https://singlife.com/en/singlife-account",
      summary: "https://singlife.com/content/dam/public/sg/documents/singlife-account/singlife-account-product-summary-nov23.pdf",
    },
    // Singlife Shield tiers are listed as "Plan 1", "Plan 2", "Plan 3", "Standard Plan" in the markdown.
    "Plan 1": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Plan 2": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Plan 3": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Standard Plan": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Singlife Shield Starter": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-shield-starter-and-health-plus/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-shield-starter-and-health-plus/singlife-shield-starter-product-summary.pdf",
    },
    "Singlife Health Plus Private": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Singlife Health Plus Public": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-health-plus-and-singlife-shield-brochure.pdf",
    },
    "Singlife Health Plus Starter": {
      website: "https://singlife.com/en/medical-insurance/shield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-shield-starter-and-health-plus/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-shield-starter-and-health-plus/health-plus-product-summary.pdf",
    },
    "Singlife Cancer Cover Plus II": {
      website: "https://singlife.com/en/medical-insurance/singlife-cancer-cover-plus-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/medical-insurance/singlife-cancer-cover-plus-ii/singlife-cancer-cover-plus-ii-product-brochure.pdf",
    },
    "Singlife Accident Care": {
      website: "https://singlife.com/en/accident-insurance/accident-care",
      brochure: "https://singlife.com/content/dam/public/sg/documents/accident-insurance/singlife-accident-care/brochure.pdf",
    },
    "Singlife Family Accident Care": {
      website: "https://singlife.com/en/accident-insurance/accident-care",
      brochure: "https://singlife.com/content/dam/public/sg/documents/accident-insurance/singlife-accident-care/brochure.pdf",
    },
    "Singlife Personal Accident": {
      website: "https://singlife.com/en/accident-insurance/personal-accident",
      summary: "https://singlife.com/content/dam/public/sg/documents/accident-insurance/singlife-personal-accident/summary-of-cover.pdf",
    },
    "Singlife CareShield Standard": {
      website: "https://singlife.com/en/disability-insurance/careshield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/disability-insurance/singlife-careshield-standard-and-singlife-careshield-plus/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/disability-insurance/singlife-careshield-standard-and-plus-and-eldershield-standard-and-plus/product-summary.pdf",
    },
    "Singlife CareShield Plus": {
      website: "https://singlife.com/en/disability-insurance/careshield",
      brochure: "https://singlife.com/content/dam/public/sg/documents/disability-insurance/singlife-careshield-standard-and-singlife-careshield-plus/brochure.pdf",
      summary: "https://singlife.com/content/dam/public/sg/documents/disability-insurance/singlife-careshield-standard-and-plus-and-eldershield-standard-and-plus/product-summary.pdf",
    },
    "Singlife Savvy Invest II": {
      website: "https://singlife.com/en/investment-linked-plan/savvy-invest-ii",
      brochure: "https://singlife.com/content/dam/public/sg/documents/investment-linked-plan/singlife-savvy-invest-ii/brochure.pdf",
    },
    "Singlife Savvy Invest": {
      website: "https://singlife.com/en/investment-linked-plan",
      brochure: "https://singlife.com/content/dam/public/sg/documents/savvy-invest/singlife-savvy-invest-brochure.pdf",
    },
    "Singlife Legacy Invest": {
      website: "https://singlife.com/en/pinnacle/legacy-invest",
      brochure: "https://singlife.com/content/dam/public/sg/documents/legacy-invest/brochure.pdf",
    },
  },

  "income-insurance": {
    "Star Term Protect": {
      website: "https://www.income.com.sg/life-insurance/star-term-protect",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/5880ac15-d464-470f-aa39-aff13c996c22/Star%20Term%20Protect%20Brochure_ENG_Web.pdf",
    },
    "TermLife Solitaire": {
      website: "https://www.income.com.sg/solitaire/termlifesolitaire",
      summary: "https://www.income.com.sg/termlife-solitaire-policy-conditions.pdf",
    },
    "DIRECT Star Term": {
      website: "https://www.income.com.sg/life-insurance/direct-star-term",
      brochure: "https://www.income.com.sg/getContentAsset/863ef3fa-5eb3-4563-b7f5-1100af15b55c/05c6012c-3879-4f1c-b994-00e61e65c363/Term_Direct-Star-Term_Brochure_ENG_Web.pdf?language=en",
    },
    "Mortgage Term": {
      website: "https://www.income.com.sg/life-insurance/mortgage-term",
      brochure: "https://www.income.com.sg/getContentAsset/5fa8ca38-e452-44ef-846b-77c84f070303/05c6012c-3879-4f1c-b994-00e61e65c363/Mortgage-Term-Brochure_ENG_Web.pdf?language=en",
    },
    "Family Protect": {
      website: "https://www.income.com.sg/life-insurance/family-protect",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/b8063807-7c8e-489d-9db3-ba5d38d6a09f/Term_Family%20Protect_Brochure_ENG_Web%20%281%29.pdf",
    },
    "Lady 360": {
      website: "https://www.income.com.sg/life-insurance/lady-360",
      brochure: "https://www.income.com.sg/getContentAsset/80f31876-01bf-4f29-b6c7-a09d8fed40a0/05c6012c-3879-4f1c-b994-00e61e65c363/Term_Lady-360_Brochure_ENG_Web-(1).pdf?language=en",
      summary: "https://www.income.com.sg/lady-360-policy-conditions.pdf",
    },
    "Maternity 360": {
      website: "https://www.income.com.sg/life-insurance/maternity-360",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/369a4726-45c7-4ae7-9110-1cc9de493859/Term_Maternity%20360_Brochure_ENG_Web%20%281%29.pdf",
    },
    "LUV (Living with Universal Value)": {
      website: "https://www.income.com.sg/life-insurance/luv",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/1b381fe6-6ecf-4e93-a775-1d92592abf47/LUV_EN_2024%20web.pdf",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/b4379630-fdd8-4d94-9f67-433d687e089e/Product%20summary%20for%20LUV%20%28policy%20start%20date%20after%2001%20June%202025%29.pdf",
    },
    "SAFRA Essential Term / SAFRA Living Care": {
      website: "https://www.income.com.sg/life-insurance/safra-essential-term-and-safra-living-care",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/af4c958a-1634-4555-b514-2cd377081a23/SAFRA%20Term%20Life%20Insurance%20ENG_2024web.pdf",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/53ddf91a-8420-4170-b186-b154be30973d/SAFRA%20Essential%20Term%20Key%20Features%20and%20Benefits%20of%20Insurance%20Coverage%20%28Sep%202022%29.pdf",
    },
    "HomeTeamNS Insurance Scheme / Living Policy": {
      website: "https://www.income.com.sg/life-insurance/hometeamns-insurance-scheme-and-living-policy",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/288af80e-0d6e-4e0d-9161-2ee6793c5796/HomeTeamNS_EN_2024%20web.pdf",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/1772cff1-29dc-41a7-99c4-2c650ee20540/Product%20summary%20for%20HomeTeamNS%20Living%20Policy%20%28policy%20start%20date%20after%2001%20June%202025%29.pdf",
    },
    "OCBC Protect": {
      website: "https://www.income.com.sg/life-insurance/ocbc-protect",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/a0522c8e-b2b1-468f-ba30-c34d1e1db2f2/OCBC%20Protect_EN_2024%20web.pdf",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/f3ecf5a1-4c23-4f9e-aede-ad187adfe590/Product%20summary%20for%20OCBC%20Protect%20Prime%20%28policy%20start%20date%20after%2001%20June%202025%29.pdf",
    },
    "Star Secure Pro": {
      website: "https://www.income.com.sg/life-insurance/star-secure-pro",
    },
    "Complete Life Secure": {
      website: "https://www.income.com.sg/life-insurance/complete-life-secure",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/f578b1df-bba3-4745-9182-4b249beb434f/Whole%20Life_Complete%20Life%20Secure_Brochure_ENG_Web.pdf",
      summary: "https://www.income.com.sg/complete-life-secure-policy-conditions.pdf",
    },
    "DIRECT Star Protect Pro": {
      website: "https://www.income.com.sg/life-insurance/direct-star-protect-pro",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/98c17b0e-d56f-49f3-83c6-c4b7a58cb5c9/Whole_Life_Direct%20Star%20Protect%20Pro_Brochure_ENG_web.pdf",
    },
    "Provenance Solitaire": {
      website: "https://www.income.com.sg/solitaire/provenance-solitaire",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/73bf7016-e1cb-4943-945e-184a49a73fd6/Solitaire_Provenance%20Solitaire_Brochure_ENG_Web%20%281%29.pdf",
    },
    "Complete Critical Protect": {
      website: "https://www.income.com.sg/life-insurance/complete-critical-protect",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/b3b75292-7e95-4d93-8eb3-cb1db54a1d7b/Term_Complete%20Critical%20Protect_Brochure_ENG_web.pdf",
    },
    "Complete Cancer Care": {
      website: "https://www.income.com.sg/life-insurance/complete-cancer-care",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/2d153ea8-3ac8-4d4d-83e9-24adc6197480/Term_Complete%20Cancer%20Care_Brochure_ENG_Web.pdf",
      summary: "https://www.income.com.sg/complete-cancer-care-policy-conditions.pdf",
    },
    "Star Assure": {
    },
    "Gro Saver Flex Pro": {
      website: "https://www.income.com.sg/savings-and-investments/gro-saver-flex-pro",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/88eec486-422e-4f14-969f-1f2351cec2d5/Savings_Gro%20Saver%20Flex%20Pro_Brochure_ENG_Website.pdf",
    },
    "Gro Cash Plus": {
      website: "https://www.income.com.sg/savings-and-investments/gro-cash-plus",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/b2d037a7-84ae-435c-828a-444d0757225e/Savings_Gro%20Cash%20Plus_Brochure_ENG_Website.pdf",
      summary: "https://www.income.com.sg/gro-cash-plus-policy-conditions.pdf",
    },
    "Gro Cash Sure": {
      website: "https://www.income.com.sg/savings-and-investments/gro-cash-sure",
      brochure: "https://www.income.com.sg/getContentAsset/a16f3213-03e4-4906-ac50-23701f467cd3/05c6012c-3879-4f1c-b994-00e61e65c363/Savings_Gro-Cash-Sure_Brochure_ENG_Web_V2.pdf?language=en",
      summary: "https://www.income.com.sg/gro-cash-sure-policy-conditions.pdf",
    },
    "Gro Cash Flex Pro": {
      website: "https://www.income.com.sg/savings-and-investments/gro-cash-flex-pro",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/1549ae5c-be15-407b-b993-1591facedfc9/Savings_Gro%20Cash%20Flex%20Pro_Brochure_ENG_Website.pdf",
    },
    "Gro Retire Flex Pro II": {
      website: "https://www.income.com.sg/savings-and-investments/gro-retire-flex-pro-ii",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/a35485ee-78c1-4448-aca9-073a19a8d813/Savings_Gro%20Retire%20Flex%20Pro%20II_Brochure_ENG_Web.pdf",
      summary: "https://www.income.com.sg/gro-retire-flex-pro-ii-policy-conditions.pdf",
    },
    "Gro Annuity Pro": {
      website: "https://www.income.com.sg/savings-and-investments/gro-annuity-pro",
      brochure: "https://www.income.com.sg/getContentAsset/e4fe1c3a-ef2e-4af5-a806-14f43f39eab6/05c6012c-3879-4f1c-b994-00e61e65c363/Savings_Gro-Annuity-Pro_Brochure_ENG_Web-(1).pdf?language=en",
    },
    "Gro Capital Ease": {
      website: "https://www.income.com.sg/savings-and-investments/gro-capital-ease",
    },
    "Wealth Plus Solitaire": {
      website: "https://www.income.com.sg/solitaire/wealth-plus-solitaire",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/f01e81db-52dd-4772-840c-a2fe905b5dd4/Solitaire_Wealth%20Plus%20Solitaire%20Brochure%20ENG_Web%20%281%29.pdf",
    },
    "Luxe Plus Solitaire II": {
      website: "https://www.income.com.sg/solitaire/luxe-plus-solitaire-ii",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/babd75cb-d122-493e-b834-9b15d419f17a/Solitaire_Luxe%20Plus%20Solitaire%20II_Brochure_ENG_web.pdf",
    },
    "Legacy Flex Solitaire": {
      website: "https://www.income.com.sg/solitaire/legacy-flex-solitaire",
    },
    "IncomeShield Standard Plan": {
      website: "https://www.income.com.sg/health-insurance/incomeshield-standard-plan",
      brochure: "https://www.income.com.sg/getContentAsset/f2deb457-6aa7-4ccb-96f2-9ea5334c021a/05c6012c-3879-4f1c-b994-00e61e65c363/Health_IncomeShield-Standard-Plan_Brochure_ENG_web.pdf?language=en",
    },
    "Enhanced IncomeShield Basic": {
      website: "https://www.income.com.sg/health-insurance/enhanced-incomeshield",
      brochure: "https://www.income.com.sg/getContentAsset/68644221-6584-49bb-b76f-7af9146f416d/05c6012c-3879-4f1c-b994-00e61e65c363/Health_Enhanced-IncomeShield_Brochure_ENG.pdf?language=en",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/ac259146-8a98-47d1-82cf-4be010701828/POS_Enhanced%20IncomeShield_ProductSummary_V0426_Cover%20Page-editable.pdf",
    },
    "Enhanced IncomeShield Advantage": {
      website: "https://www.income.com.sg/health-insurance/enhanced-incomeshield",
      brochure: "https://www.income.com.sg/getContentAsset/68644221-6584-49bb-b76f-7af9146f416d/05c6012c-3879-4f1c-b994-00e61e65c363/Health_Enhanced-IncomeShield_Brochure_ENG.pdf?language=en",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/ac259146-8a98-47d1-82cf-4be010701828/POS_Enhanced%20IncomeShield_ProductSummary_V0426_Cover%20Page-editable.pdf",
    },
    "Enhanced IncomeShield Preferred": {
      website: "https://www.income.com.sg/health-insurance/enhanced-incomeshield",
      brochure: "https://www.income.com.sg/getContentAsset/68644221-6584-49bb-b76f-7af9146f416d/05c6012c-3879-4f1c-b994-00e61e65c363/Health_Enhanced-IncomeShield_Brochure_ENG.pdf?language=en",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/ac259146-8a98-47d1-82cf-4be010701828/POS_Enhanced%20IncomeShield_ProductSummary_V0426_Cover%20Page-editable.pdf",
    },
    // Closed to new business but still on existing client books — keep visible so FCs recognise the name.
    "IncomeShield (legacy Plan A/B/C)": {},
    "PA Secure": {
      website: "https://www.income.com.sg/personal-accident-insurance/pa-secure",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/0e382dec-9432-4d75-913b-70e53196774a/PA%20Secure%20Brochure%2022032024.pdf",
      summary: "https://www.income.com.sg/getContentAsset/56d2cc39-acfb-497f-bc0a-3674a01c187b/05c6012c-3879-4f1c-b994-00e61e65c363/GPS-PA-Secure-Product-Summary-(D)-20240322A.pdf?language=en",
    },
    "PA Assurance": {
      website: "https://www.income.com.sg/personal-accident-insurance/pa-assurance",
      brochure: "https://www.income.com.sg/forms/brochure/pa-assurance-printed-brochure?ext=.pdf",
      summary: "https://www.income.com.sg/getContentAsset/175d69ed-9110-4a9c-a00d-f92afaa13aad/05c6012c-3879-4f1c-b994-00e61e65c363/GPF-PA-Assurance-Product-Summary-2024-(A)-202406.pdf?language=en",
    },
    "SilverCare": {
      website: "https://www.income.com.sg/personal-accident-insurance/silvercare-insurance",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/a6f7e820-5293-4ff6-bf99-698271a40c0a/SilverCare%20ENG_2026_web.pdf",
      summary: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/ee90b8b8-d070-4854-b2e3-47c72f7f1ad7/GSD%20SilverCare%20Product%20Summary%20202501.pdf",
    },
    "Care Secure": {
      website: "https://www.income.com.sg/health-insurance/care-secure",
      brochure: "https://www.income.com.sg/getContentAsset/cf662c06-efe9-48c5-ade1-3ff9f370e2d6/05c6012c-3879-4f1c-b994-00e61e65c363/Care-Secure-Brochure_Website.pdf?language=en",
      summary: "https://www.income.com.sg/care-secure-policy-conditions.pdf",
    },
    "Care Secure Pro": {
      website: "https://www.income.com.sg/health-insurance/care-secure-pro",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/4abaf1fc-44ed-4a7a-becd-568819354d74/Health_Care%20Secure%20Pro_Brochure_ENG_Web.pdf",
    },
    "AstraLink": {
      website: "https://www.income.com.sg/savings-and-investments/astralink",
      brochure: "https://www.income.com.sg/getContentAsset/41aa685b-2f2e-42af-ae01-aa56bd465ac3/05c6012c-3879-4f1c-b994-00e61e65c363/ILP_AstraLink_Brochure_ENG_web.pdf?language=en",
    },
    "Invest Flex": {
      website: "https://www.income.com.sg/savings-and-investments/invest-flex",
      brochure: "https://www.income.com.sg/getContentAsset/7d4de876-2b2d-4649-bebe-7e717d6ee92c/05c6012c-3879-4f1c-b994-00e61e65c363/ILP_Invest-Flex_Brochure_ENG_Web.pdf?language=en",
    },
    "Invest Flex Vantage": {
      website: "https://www.income.com.sg/savings-and-investments/invest-flex-vantage",
      brochure: "https://www.income.com.sg/getContentAsset/7f0b15cb-35b4-4474-993f-e015173405c8/05c6012c-3879-4f1c-b994-00e61e65c363/ILP_Invest-Flex-Vantage_Brochure_ENG_Web.pdf?language=en",
    },
    "Invest Flex TriVantage": {
      website: "https://www.income.com.sg/savings-and-investments/invest-flex-trivantage",
      brochure: "https://www.income.com.sg/getContentAsset/a9714e07-e7b3-432d-98eb-c41d6dbec50e/05c6012c-3879-4f1c-b994-00e61e65c363/ILP_Invest-Flex-TriVantage_Brochure_ENG_Web.pdf?language=en",
    },
    "WealthLink": {
      website: "https://www.income.com.sg/savings-and-investments/wealthlink",
      brochure: "https://assets-au-01.kc-usercontent.com/8acbd32f-b7e0-0294-6b7d-a2bc72d6b30c/9b66e3ea-a695-4f8e-b16b-9d1fd9acb25a/ILP_WealthLink_Brochure_ENG_Web.pdf",
    },
  },

  "manulife": {
    "ManuProtect Term (II)": {
      website: "https://www.manulife.com.sg/en/solutions/life/term-life-insurance/manuprotect-term.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/life/term-life/manuprotect-term/ManuProtect%20Term%20Brochure%20(English).pdf",
    },
    "ManuProtect Decreasing (II)": {
      website: "https://www.manulife.com.sg/en/solutions/life/term-life-insurance/manuprotect-decreasing.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/life/term-life/manuprotect-decreasing/ManuProtect%20Decreasing%20Brochure%20(English).pdf",
    },
    "DIRECT - ManuAssure Term": {
      website: "https://www.manulife.com.sg/en/solutions/life/term-life-insurance/direct-manuassure-term.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/life/term-life/direct-manuassure-term/Direct%20ManuAssure%20Term%20Brochure%20(English).pdf",
    },
    "LifeReady Plus (II)": {
      website: "https://www.manulife.com.sg/en/solutions/life/whole-life-insurance/life-ready-plus.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/life/whole-life/life-ready-plus/lifereadyplus_brochure_fa.pdf",
    },
    "Manulife CI FlexiCare (Classic / Deluxe)": {
      website: "https://www.manulife.com.sg/en/solutions/health/critical-illness/CI-flexicare.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/health/critical-illness/ci-flexicare/CI_flexicare_ENG.pdf",
    },
    "Signature Indexed Universal Life Select (III) — SIULS III": {
      website: "https://www.manulife.com.sg/en/solutions/signature/signature/Signature-Indexed-Universal-Life-Select.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/signature/signature-indexed-universal-life-select/Signature%20Indexed%20Universal%20Life%20Select_Brochure%20(English).pdf",
    },
    "Signature Legacy Harvest": {
      website: "https://www.manulife.com.sg/en/solutions/signature/signature/signature-legacy-harvest.html",
    },
    "Signature Income Series": {
      website: "https://www.manulife.com.sg/en/solutions/signature/signature/signature-income.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/signature/signature-income/Signature%20Income%20Brochure%20(English).pdf",
    },
    "Manulife Goal 2025 (III)": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/manulife-goal.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/manulife-goal-brochure-ENG.pdf",
    },
    "Manulife Goal 7": {},
    "Manulife SteadyPayout (IV)": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/manulife-steadypayout.html",
    },
    "Manulife IncomeGen (II)": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/Manulife-IncomeGen.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/manulife-income-gen/Income_Gen_EN.pdf",
    },
    "ReadyBuilder (II)": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/ready-builder.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/ready-builder1/ReadyBuilder%20(II)%20Brochure_English.pdf",
    },
    "ReadyPayout Plus": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/ready-payout-plus.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/ready-payout-plus/ReadyPayout%20Plus%20Brochure%20(English).pdf",
    },
    "ManuWealth Secure": {
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/manusecure/ManuWealth%20Secure%20Brochure%20(English).pdf",
    },
    "Manulife Spring": {
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/manulife-spring/Manulife%20Spring%20English%20Brochure.pdf",
    },
    "Manulife Ready Life Income": {
      website: "https://www.manulife.com.sg/en/solutions/save/savings-plans/ready-lifeincome.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/savings-plan/life-income/ReadyLifeIncome%20(III)_Final%20brochure.pdf",
    },
    "Manulife Educate": {
      website: "https://www.manulife.com.sg/manulife_educate",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/save/educate/Manulife%20Educate%20Brochure%20(English).pdf",
    },
    "RetireReady Plus (III)": {
      website: "https://www.manulife.com.sg/en/solutions/save/retirement/retire-ready-plus.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/newsroom/RetireReady_Plus.pdf",
    },
    "Signature Indexed Income": {
      website: "https://www.manulife.com.sg/en/solutions/signature/signature/signature-indexed-income.html",
    },
    "Manulife ReadyProtect": {
      website: "https://www.manulife.com.sg/en/solutions/health/accident/manulife-ready-protect.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/health/accident/manulife_readyprotect_english.pdf",
    },
    "Manulife InvestReady (III)": {
      website: "https://www.manulife.com.sg/en/solutions/invest/investment-linked-plans/investready.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/invest/investment-linked-plans/investready/investready_en.pdf",
      summary: "https://www.comparefirst.sg/wap/prodSummaryPdf/198002116D/WA_MIR03_PdtSum.pdf",
    },
    "Manulife InvestReady Growth": {
      website: "https://www.manulife.com.sg/en/solutions/invest/investment-linked-plans/investready-growth.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/invest/investment-linked-plans/investready/investready-growth_english_brochure.pdf",
    },
    "Manulink Investor (II)": {
      website: "https://www.manulife.com.sg/en/solutions/invest/investment-linked-plans/manulink-investor.html",
      brochure: "https://www.manulife.com.sg/content/dam/insurance/sg/solutions/our-solutions/invest/investment-linked-plans/manulink-investor/Manulink%20Investor%20(II)%20Brochure_English.pdf",
      summary: "https://www.comparefirst.sg/wap/prodSummaryPdf/198002116D/WA_MLI_ILP_PdtSum.pdf",
    },
  },

  "hsbc-life": {
    "HSBC Life Term Protector / Term Protector Prime": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/term-protector/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/term-protector-brochure.pdf",
    },
    "HSBC Life Term Protect Advantage": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/term-protect-advantage/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/protection/term-protect-advantage/product-brochure.pdf",
    },
    "DIRECT - HSBC Life Term Lite": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/direct-term-lite/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/direct-hsbclife-term-lite-brochure-english.pdf",
      summary: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/direct-hsbc-life-term-lite-product-summary.pdf",
    },
    "HSBC Life Life Treasure III": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/life-treasure-iii/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/life-treasure-iii-product-brochure.pdf",
    },
    "HSBC Life ValueLife": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/value-life/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/protection/value-life/product-brochure.pdf",
    },
    "DIRECT - HSBC Life Protector II": {
      website: "https://www.insurance.hsbc.com.sg/protection/products/direct-life-protector/",
    },
    "HSBC Life Super CritiCare": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/super-criticare/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/super-criticare-brochure-english.pdf",
    },
    "HSBC Life CritiCare for Her": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/criticare-for-her/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/hsbc-life-criticare-for-her-brochure.pdf",
    },
    "HSBC Life CritiCare for Him": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/criticare-for-him/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/hsbc-life-criticare-for-him-brochure.pdf",
    },
    "HSBC Life Cancer ReCover": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/cancerrecover/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/hsbclife-cancer-recover-brochure-english.pdf",
    },
    "HSBC Life HappyMummy": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/happy-mummy/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/hsbclife-happymummy-happyfamily-brochure.pdf",
    },
    "HSBC Life HappyFamily": {
      website: "https://www.insurance.hsbc.com.sg/life-and-critical-illness/products/happy-family/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/life/hsbclife-happymummy-happyfamily-brochure.pdf",
    },
    "HSBC Life Jade Legacy Universal Life": {
      website: "https://www.insurance.hsbc.com.sg/legacy/jade/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/legacy/jade/ultra-product-brochure.pdf",
    },
    "HSBC Life Diamond Prestige IUL II": {
      website: "https://www.insurance.hsbc.com.sg/legacy/products/diamond-prestige-iul/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/legacy/hsbc-life-diamond-prestige-iul-product-brochure.pdf",
    },
    "HSBC Life Emerald Legacy Life III": {
      website: "https://www.insurance.hsbc.com.sg/legacy/products/emerald-legacy-life/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/legacy/emerald-life-plan-iii/product-brochure.pdf",
    },
    "HSBC Life Private Wealth VUL": {
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/hsbc-life-private-wealth-vul-brochure.pdf",
    },
    "HSBC Life Wealth Builder": {
      website: "https://www.insurance.hsbc.com.sg/savings/wealth-builder/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings/hsbc-life-wealth-builder-brochure.pdf",
    },
    "HSBC Life Savings Protector II": {
      website: "https://www.insurance.hsbc.com.sg/savings/savings-protector/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings/savings-protector/product-brochure.pdf",
    },
    "HSBC Life Indexed Flexi Income": {
      website: "https://www.insurance.hsbc.com.sg/retirement/products/indexed-flexi-income/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/retirement/life-indexed-flexi-income-product-brochure.pdf",
    },
    "HSBC Life Sapphire Prestige Income II": {
      website: "https://www.insurance.hsbc.com.sg/legacy/sapphire-prestige-income-ii/",
    },
    // HSBC Life Shield tiers in the markdown are "Plan A", "Plan B", "Standard Plan"
    "Plan A": {
      website: "https://www.insurance.hsbc.com.sg/health/products/shield/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/hsbc-life-shield-brochure.pdf",
    },
    "Plan B": {
      website: "https://www.insurance.hsbc.com.sg/health/products/shield/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/hsbc-life-shield-brochure.pdf",
    },
    "Standard Plan": {
      website: "https://www.insurance.hsbc.com.sg/health/products/shield/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/hsbc-life-shield-brochure.pdf",
    },
    "HSBC Life Enhanced Care II": {
      website: "https://www.insurance.hsbc.com.sg/health/products/shield/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/hsbc-life-shield-brochure.pdf",
    },
    "HSBC Life SmartCare Executive": {
      website: "https://www.insurance.hsbc.com.sg/health/products/smartcare-executive/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/smartcare-executive-brochure.pdf",
      summary: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/smartcare-executive-product-summary.pdf",
    },
    "HSBC Life SmartCare Optimum Enhanced": {
      website: "https://www.insurance.hsbc.com.sg/health/products/smartcare-optimum-enhanced/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/smartcare-optimum-enhanced-brochure.pdf",
    },
    "HSBC Life Prime Care": {
      website: "https://www.insurance.hsbc.com.sg/health/products/prime-care/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/health/prime-care-brochure.pdf",
    },
    "HSBC Life Band Aid": {
      website: "https://www.insurance.hsbc.com.sg/personal-accident/products/band-aid/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/hsbc-life-band-aid-brochure.pdf",
    },
    "HSBC Life International Exclusive": {
      website: "https://www.insurance.hsbc.com.sg/health/products/international-exclusive/",
    },
    "HSBC Life Wealth Accelerate": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-accelerate/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings-investments/hsbc-life-wealth-accelerate-brochure-english.pdf",
    },
    "HSBC Life Wealth Voyage": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-voyage/",
    },
    "HSBC Life Wealth Harvest": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-harvest/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings-investments/hsbc-life-wealth-harvest-brochure.pdf",
    },
    "HSBC Life Wealth Abundance": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-abundance/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings-investments/hsbc-life-wealth-abundance-brochure.pdf",
    },
    "HSBC Life Wealth Focus": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-focus/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/investments/products/hsbc-life-wealth-focus-brochure.pdf",
    },
    "HSBC Life Goal Builder II": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/goal-builder/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/investments/products/goal-builder/hsbc-life-goal-builder-ii-product-brochure.pdf",
    },
    "HSBC Life Wealth Invest": {
      website: "https://www.insurance.hsbc.com.sg/investment/products/wealth-invest/",
      brochure: "https://www.insurance.hsbc.com.sg/content/dam/hsbc/insn/documents/savings-investments/hsbc-life-wealth-invest-brochure.pdf",
    },
  },

  "raffles-health-insurance": {
    "Raffles Shield Private": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Shield A": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Shield B": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Shield Standard": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Premier Rider": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Choice Rider": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/04/RHIbrochure_10Apr.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Cancer Guard Rider": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/learn-more/raffles-cancer-guard/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2023/12/Raffles-Cancer-Guard-Rider-Brochure-Dec-2023.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2026/05/Raffles-Shield-and-Riders-Product-Summary-1-Apr-2026.pdf",
    },
    "Raffles Hospital Option": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
    },
    "High Deductible Option": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-shield/",
    },
    "Raffles Critical Illness Plan": {
      website: "https://www.raffleshealthinsurance.com/products/raffles-critical-illness-plan/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2024/05/CCD24010013-Critical-Illness-Brochure_9-May-2024.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2025/12/Product-Summary-Raffles-Critical-Illness-with-Early-CI-Rider-11-Feb-2025.pdf",
    },
    "Raffles Elite Care": {
      website: "https://www.raffleshealthinsurance.com/products/personal/regional-medical-cover/raffles-elite-care/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2025/05/Raffles-Elite-Care-15-May-25-V2.pdf",
      summary: "https://www.raffleshealthinsurance.com/wp-content/uploads/2025/12/Raffles-Elite-Care-Product-Summary-15052025.pdf",
    },
    "Lifeline (Bupa Global, distributed by RHI)": {
      website: "https://www.raffleshealthinsurance.com/products/personal/global-medical-cover/lifeline-3/",
      brochure: "https://www.raffleshealthinsurance.com/wp-content/uploads/2025/12/SGP-LIFE-SALE-EN-XXXX-2510-0060993-LR.pdf",
    },
  },
};

// Helper to fetch links for a product by (insurer slug, product name).
// Returns an empty object when no links are recorded for that product.
export function getProductLinks(insurerSlug: string, productName: string): ProductLinks {
  return COMPETITOR_PRODUCT_LINKS[insurerSlug]?.[productName] ?? {};
}

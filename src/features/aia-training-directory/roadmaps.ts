// Presentation for the six AIA roadmaps: a short picker name, a colour per
// stage (the overview's path colours), whether the stages run in order, and
// which roadmap labels point at a course or section in the catalogue.
import { courseUrl, sectionUrl } from "./links";

export const ROADMAP_META: Record<string, { short: string; lanes: number[]; sequential: boolean }> = {
  "tied-distribution": { short: "Your whole career", lanes: [0, 1, 4], sequential: true },
  "new-consultant": { short: "New consultants", lanes: [0, 0, 0], sequential: true },
  "experienced-consultant": { short: "Experienced consultants", lanes: [1, 2, 3], sequential: false },
  "health-academy": { short: "Health Academy", lanes: [1, 1, 1, 1], sequential: true },
  "affluent-hnw": { short: "Affluent and HNW", lanes: [3, 3], sequential: false },
  leaders: { short: "Leaders", lanes: [4, 4, 4], sequential: true },
};

/**
 * Roadmap labels (items or group headings) that name one catalogue entry.
 * Keys must match the roadmap text exactly; filter.test.ts checks every key
 * and every target, so a renamed course fails the suite instead of a link.
 */
export const ROADMAP_LINKS: Record<string, `course:${string}` | `section:${string}`> = {
  "#CMFASCanPass1": "course:cmfascanpass1-journey",
  "#CMFASCanPass1 (new, mandatory)": "course:cmfascanpass1-journey",
  "Foundation to Success (FTS)": "course:foundation-to-success",
  "Foundation to Success (mandatory, IBF Level 1)": "course:foundation-to-success",
  "Build to Succeed (BTS) 1": "course:bts1-programme",
  "Build to Succeed (BTS) 2": "course:bts2",
  "Time Value of Money": "course:bts1-tvm-retirement",
  "Product knowledge and bundling": "course:bts1-product-bundling",
  "Better Activity": "section:03a",
  "Better Productivity": "section:03b",
  "Better Professionalism": "section:03c",
  "MDRT Aspirants": "section:03f",
  "MDRT Qualifiers Transformation": "section:03f",
  "Affluent and High Net Worth": "section:03g",
  "Business Insurance": "course:business-insurance-planning",
  "Life in Group (LIG)": "section:03h",
  "Leader Appointment Workshop": "course:leadership-appointment-workshop",
  "Leader Appointment Workshop (mandatory)": "course:leadership-appointment-workshop",
  "Build to Lead": "course:build-to-lead",
  "Build to Lead (essential)": "course:build-to-lead",
  "Pacesetter 2.0 (LIMRA)": "course:pacesetter-2",
  "Pacesetter (mandatory)": "course:pacesetter-2",
  "Attract, Engage and Recruit": "course:attract-engage-recruit",
  "Attract, Engage and Recruit (new)": "course:attract-engage-recruit",
  "Vision and Mission": "course:leading-from-within",
  "Leading From Within: Vision and Mission (new)": "course:leading-from-within",
  "Coaching 101": "course:coaching-101",
  "Strategic Thinking": "course:strategic-thinking",
  "Strategic Thinking (new)": "course:strategic-thinking",
  "Influencing without Authority": "course:influencing-without-authority",
  "Influencing without Authority (new)": "course:influencing-without-authority",
  "Peak Performance Coaching (new)": "course:peak-performance-coaching",
  "3. 5 Levels of Leadership (new)": "course:maxwell-5-levels",
  "Masters of Recruiting": "course:gama-masters-of-recruiting",
  "Masters of Selection": "course:gama-masters-of-selection",
  "Masters of Retention": "course:gama-masters-of-retention",
  "Agency Management Training Course": "course:amtc",
  "Agency Enhancement Series": "course:agency-enhancement-series",
  "Managing Agency Profitability Series": "course:maps",
  "INSEAD (new)": "course:insead",
  "Leads Gen Series": "course:appointment-booster",
  "Social Media Series": "course:social-media-competency",
  "Practitioners' Sales Concept Sharing": "course:practitioner-sales-concept-sharing",
  "Doctors' webinar: Health and Wellness Matters!": "course:health-wellness-matters",
  "Get to Know Product series (new)": "course:get-to-know-product",
  "Investment Seminar and Intermediate Investment Education (new)": "course:investment-seminar",
  "Product Licensing and Health Shield training (essential)": "course:product-licensing-emodules",
  "Life Operations": "course:life-operations",
  "IBF Certified Level Up, Level 2 and 3 (essential)": "course:propel-to-professional-planning",
  "Client Centricity (new, essential)": "course:client-centricity-emodule",
  "Company Information Updates and Core Modules (mandatory)": "course:company-information-updates",
  "MDRT Breakthrough Programme": "course:mdrt-breakthrough-camp",
  "MDRT University": "course:mdrt-university",
  "Ascend with MDRT": "course:ascend-with-mdrt",
  "MDRT Seminars: MDRT Day, MDRT Final Sprint": "course:mdrt-seminars",
  "MDRT bite-size learning videos": "course:mdrt-videos",
  "Platinum Series Product Licensing (essential)": "course:product-licensing-emodules",
  "Pre-requisite for NFTF Offshore Sales (essential)": "course:nftf-offshore-prerequisite",
  "Why AIA": "course:why-aia-emodule",
  "Selling to the HNW (TBC, new)": "course:selling-to-hnw",
  "Selling to the HNW (TBC)# (new)": "course:selling-to-hnw",
  "HNW Sales Concepts I and II": "course:hnw-sales-concepts-1",
  "HNW Seminars": "course:hnw-seminars",
  "Offshore HNW Selling Workshop": "course:offshore-hnw-selling",
  "Wealth Mastery Programme# (new)": "course:wealth-mastery-programme",
  "Wealth Accelerator Programme (new)": "course:wealth-accelerator-programme",
  "Wealth Accelerator Programme": "course:wealth-accelerator-programme",
  "Core learning and application": "course:business-insurance-planning",
  "Introduction to Worksite I": "course:lig-1-intro-to-worksite",
  "LIG Activities and Conversion II": "course:lig-2-activities-conversion",
  "Healthcare 101 e-Module*": "course:aia-health-academy",
  "Vitality e-Module*": "course:aia-health-academy",
  "MAIA*": "course:aia-health-academy",
};

/** The in-app address a roadmap label links to, or null when it names nothing in the catalogue. */
export function roadmapTarget(label: string): string | null {
  const t = ROADMAP_LINKS[label];
  if (!t) return null;
  const [kind, id] = t.split(":");
  return kind === "course" ? courseUrl(id) : sectionUrl(id);
}

export type Tag = "new" | "essential" | "mandatory";
const TAGS: Tag[] = ["new", "essential", "mandatory"];

/**
 * Splits AIA's trailing "(new, essential)" style notes off a label so they can
 * render as badges. Anything else in the brackets (TBC, IBF Level 1, LIMRA)
 * stays in the text, because it is part of the name.
 */
export function splitTags(label: string): { text: string; tags: Tag[] } {
  const m = label.match(/^(.*?)\s*\(([^()]*)\)$/);
  if (!m) return { text: label, tags: [] };
  const parts = m[2].split(",").map((s) => s.trim());
  const tags = parts.filter((s): s is Tag => (TAGS as string[]).includes(s));
  if (!tags.length) return { text: label, tags: [] };
  const rest = parts.filter((s) => !(TAGS as string[]).includes(s));
  return { text: rest.length ? `${m[1]} (${rest.join(", ")})` : m[1], tags };
}

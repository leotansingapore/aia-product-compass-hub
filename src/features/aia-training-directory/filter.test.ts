import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { directory } from "../../../supabase/functions/aia-training-directory/directory";
import { EMPTY_FILTERS, filterCourses, nextSession, type Filters } from "./filter";

const OCT_4 = new Date(2026, 9, 4);
const run = (f: Partial<Filters>) => filterCourses(directory, { ...EMPTY_FILTERS, ...f }, OCT_4);

describe("AIA training directory data", () => {
  it("gives every course a known section, a unique id and a summary", () => {
    const sections = new Set(directory.sections.map((s) => s.id));
    const ids = new Set<string>();
    for (const c of directory.courses) {
      expect(sections.has(c.section), c.id).toBe(true);
      expect(ids.has(c.id), `duplicate ${c.id}`).toBe(false);
      ids.add(c.id);
      expect(c.summary.length, c.id).toBeGreaterThan(20);
      for (const s of c.schedule ?? []) {
        expect(s.month >= 1 && s.month <= 12, c.id).toBe(true);
      }
    }
    // Every catalogue section has at least one course.
    for (const s of directory.sections) {
      expect(directory.courses.some((c) => c.section === s.id), s.id).toBe(true);
    }
  });

  it("is plain ASCII, so no curly quotes or dashes slip in from the PDF", () => {
    const nonAscii = JSON.stringify(directory).match(/[^\x20-\x7E]/g);
    expect(nonAscii).toBeNull();
  });
});

describe("filterCourses", () => {
  it("returns everything in catalogue order with no filters", () => {
    expect(run({}).map((c) => c.id)).toEqual(directory.courses.map((c) => c.id));
  });

  it("matches every search word anywhere in the course", () => {
    const ids = run({ query: "telethon appointments" }).map((c) => c.id);
    expect(ids).toEqual(["bts1-telethon"]);
    // A topic line only, not the title.
    expect(run({ query: "GIARR" }).map((c) => c.id)).toEqual(["general-insurance"]);
  });

  it("ORs the requirement toggles and ANDs them with the stage", () => {
    const both = run({ mandatory: true, essential: true });
    expect(both.every((c) => c.requirement)).toBe(true);
    expect(both.some((c) => c.requirement === "mandatory")).toBe(true);
    expect(both.some((c) => c.requirement === "essential")).toBe(true);
    const leadersMandatory = run({ stage: "leaders", mandatory: true }).map((c) => c.id);
    expect(leadersMandatory).toEqual(["leadership-appointment-workshop", "pacesetter-2"]);
  });

  it("keeps only courses with a session still ahead", () => {
    const upcoming = run({ upcoming: true }).map((c) => c.id);
    expect(upcoming).toContain("propel-to-professional-planning");
    // A self-paced window that runs to December counts as still open.
    expect(upcoming).toContain("core-modules-2026");
    // CIU's last window closed in September.
    expect(upcoming).not.toContain("company-information-updates");
    expect(upcoming).not.toContain("leadership-profiling-natureseye");
  });

  it("sorts by CPD hours with unknown hours last", () => {
    const sorted = run({ sort: "cpd" });
    expect(sorted[0].id).toBe("amtc");
    const firstUnknown = sorted.findIndex((c) => c.cpdHours === undefined);
    expect(sorted.slice(firstUnknown).every((c) => c.cpdHours === undefined)).toBe(true);
  });

  it("sorts by next session month", () => {
    const sorted = run({ sort: "next", upcoming: true });
    const months = sorted.map((c) => Math.max(nextSession(c, 2026, OCT_4)!.month, 10));
    expect(months).toEqual([...months].sort((a, b) => a - b));
    // Core Modules opened in May and runs to December, so it is "now", not May.
    const firstNovember = sorted.findIndex((c) => nextSession(c, 2026, OCT_4)!.month === 11);
    expect(sorted.findIndex((c) => c.id === "core-modules-2026")).toBeLessThan(firstNovember);
  });
});

describe("nextSession", () => {
  const ppp = directory.courses.find((c) => c.id === "propel-to-professional-planning")!;
  it("finds this month's run, nothing after the schedule year, the first run before it", () => {
    expect(nextSession(ppp, 2026, OCT_4)?.when).toBe("20 and 21 Oct");
    expect(nextSession(ppp, 2026, new Date(2027, 0, 5))).toBeNull();
    expect(nextSession(ppp, 2026, new Date(2025, 11, 1))?.month).toBe(1);
  });
});

describe("catalogue stays out of the browser bundle", () => {
  it("is only ever imported as a type under src/", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts")) {
          const src = readFileSync(path, "utf8");
          const valueImport = /import\s+(?!type\b)[^;]*aia-training-directory\/directory/;
          if (valueImport.test(src)) offenders.push(path);
        }
      }
    };
    walk(join(__dirname, "../.."));
    expect(offenders).toEqual([]);
  });
});

import { LANES, TRUNK, cpdFloor, monthMatrix, sessionsInMonth } from "./overview";

describe("overview map and heatmap", () => {
  it("puts every catalogue section on exactly one path, and the Foundation stations on the trunk in order", () => {
    const onLines = LANES.flatMap((l) => [...l.sections]);
    expect([...onLines].sort()).toEqual(directory.sections.map((s) => s.id).sort());
    expect(new Set(onLines).size).toBe(onLines.length);
    const trunkStations = TRUNK.flatMap((r) => (r.kind === "station" ? [r.section] : []));
    expect(trunkStations).toEqual([...LANES[0].sections]);
    // The trunk opens on a month marker so the line starts with a label, not a bare station.
    expect(TRUNK[0].kind).toBe("stage");
  });

  it("gives every path a one-line description", () => {
    for (const l of LANES) expect(l.blurb.length, l.id).toBeGreaterThan(10);
  });

  it("counts a self-paced window in every month it is open", () => {
    const rows = monthMatrix(directory);
    const pre = rows.find((r) => r.section.id === "02a")!;
    // The four CMFAS tutorials run monthly; #CMFASCanPass1 is self-paced with no dates.
    expect(pre.months.map((m) => m.length)).toEqual(Array(12).fill(4));
    const prof = rows.find((r) => r.section.id === "03c")!;
    expect(prof.months[11].map((c) => c.id)).toContain("core-modules-2026");
    expect(prof.months[3].map((c) => c.id)).not.toContain("core-modules-2026");
    // Sections with no dates (Health Academy, MDRT) are left out.
    expect(rows.some((r) => ["03d", "03f"].includes(r.section.id))).toBe(false);
    expect(sessionsInMonth(directory, 10).find((s) => s.course.id === "propel-to-professional-planning")?.entry.when).toBe(
      "20 and 21 Oct",
    );
  });

  it("never overstates the CPD total", () => {
    const total = directory.courses.reduce((s, c) => s + (c.cpdHours ?? 0), 0);
    expect(cpdFloor(directory)).toBeLessThanOrEqual(total);
    expect(cpdFloor(directory) % 50).toBe(0);
  });
});

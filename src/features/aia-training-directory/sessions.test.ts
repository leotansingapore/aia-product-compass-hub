import { describe, expect, it } from "vitest";
import { directory } from "../../../supabase/functions/aia-training-directory/directory";
import { buildCalendar, chipTitle, monthWeeks, parseDays, parseEntry } from "./sessions";

const days = (when: string, month: number) => parseEntry({ month, when }).map((s) => `${s.month}/${s.day} ${s.label ?? ""}`.trim());

describe("parseEntry", () => {
  it("reads day and night tutorials with modes and ranges", () => {
    const res5 = days("Day: 5 and 6 (F2F, Alex); 10 and 11 (WV); 20 and 21 (V). Night: 13 to 16 (V); 27 to 30 (V)", 1);
    expect(res5).toHaveLength(14);
    expect(res5.slice(0, 3)).toEqual(["1/5 Day, face to face (Alex)", "1/6 Day, face to face (Alex)", "1/10 Day, weekend virtual"]);
    expect(res5).toContain("1/14 Night, virtual");
    expect(res5).toContain("1/30 Night, virtual");
  });

  it("assigns days to the month written after them, across a month boundary", () => {
    const fts = days("PM only: 3, 4, 5; 10, 11, 12; 17, 18, 19; 24, 25, 26; 31 Mar, 1 and 2 Apr", 3);
    expect(fts).toHaveLength(15);
    expect(fts.slice(-3)).toEqual(["3/31 PM only", "4/1 PM only", "4/2 PM only"]);
    expect(days("PM only: 29 and 30 Sep, 1 Oct", 9)).toEqual(["9/29 PM only", "9/30 PM only", "10/1 PM only"]);
  });

  it("keeps event names written after the days", () => {
    expect(days("Batch 1: 11 to 13 Mar Bootcamp; 17 Mar Mentoring for BTL parent leaders", 3)).toEqual([
      "3/11 Batch 1, Bootcamp",
      "3/12 Batch 1, Bootcamp",
      "3/13 Batch 1, Bootcamp",
      "3/17 Batch 1, Mentoring for BTL parent leaders",
    ]);
    expect(days("2, 16 and 30 Sep Recruitment Huddle", 9)).toEqual([
      "9/2 Recruitment Huddle",
      "9/16 Recruitment Huddle",
      "9/30 Recruitment Huddle",
    ]);
  });

  it("shows BTS1 as its batch start, and skips windows and TBC", () => {
    expect(days("Batch starts 8 Oct. Oct 8, 9, 14, 15; Nov 4, 5", 10)).toEqual(["10/8 Batch starts"]);
    expect(parseEntry({ month: 5, endMonth: 12, when: "May to Dec (eLearning)" })).toEqual([]);
    expect(parseEntry({ month: 7, when: "TBC" })).toEqual([]);
  });

  it("reads plain lists in every separator style", () => {
    expect(days("5, 11 and 12 Nov", 11)).toEqual(["11/5", "11/11", "11/12"]);
    expect(days("19, 20 Jan", 1)).toEqual(["1/19", "1/20"]);
    expect(days("25 Feb (webinar)", 2)).toEqual(["2/25 Webinar"]);
    expect(parseDays("Jan 9, 13; ignored", 2).days).toEqual([
      { month: 1, day: 9 },
      { month: 1, day: 13 },
    ]);
  });
});

describe("buildCalendar over the whole catalogue", () => {
  const { events, windows, tbc } = buildCalendar(directory);

  it("turns every dated line into at least one real date and leaves no digits unread", () => {
    for (const c of directory.courses) {
      for (const s of c.schedule ?? []) {
        if (s.endMonth || s.when === "TBC") continue;
        const parsed = parseEntry(s);
        expect(parsed.length, `${c.id} ${s.when}`).toBeGreaterThan(0);
        for (const p of parsed) {
          expect(p.day, `${c.id} ${s.when}`).toBeGreaterThan(0);
          // a label holding a bare day number means part of the line was not read as a date
          expect(/(^|\s)\d{1,2}(\s|,|$)/.test((p.label ?? "").replace(/Batch \d|\b101\b|batch \d/g, "")), `${c.id}: ${p.label}`).toBe(false);
        }
      }
    }
    expect(events.every((e) => /^2026-\d{2}-\d{2}$/.test(e.date))).toBe(true);
  });

  it("keeps the always-open courses and the TBC one out of the day grid", () => {
    expect(windows.map((w) => w.course.id)).toEqual(
      expect.arrayContaining(["core-modules-2026", "company-information-updates", "shield-updates", "social-media-competency"]),
    );
    expect(tbc.map((t) => t.course.id)).toEqual(["leaders-lunch-and-learn"]);
    expect(events.some((e) => e.course.id === "core-modules-2026")).toBe(false);
  });

  it("puts PPP on 20 and 21 October", () => {
    const ppp = events.filter((e) => e.course.id === "propel-to-professional-planning" && e.date.startsWith("2026-10"));
    expect(ppp.map((e) => e.date)).toEqual(["2026-10-20", "2026-10-21"]);
  });
});

describe("monthWeeks", () => {
  it("starts weeks on Monday and pads outside the month", () => {
    const oct = monthWeeks(2026, 10); // 1 Oct 2026 is a Thursday
    expect(oct[0]).toEqual([null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
    expect(oct.flat().filter(Boolean)).toHaveLength(31);
    expect(oct.every((w) => w.length === 7)).toBe(true);
  });
});

describe("chipTitle", () => {
  it("uses the names consultants say", () => {
    expect(chipTitle("CMFAS Module RES5 Tutorial")).toBe("RES5 tutorial");
    expect(chipTitle("CMFAS Module 9A Tutorial")).toBe("M9A tutorial");
    expect(chipTitle("Foundation To Success (FTS): IBF Accreditation Level 1")).toBe("FTS");
    expect(chipTitle("Propel To Professional Planning (PPP), IBFA-Certified")).toBe("PPP");
    expect(chipTitle("Agency Management Training Course (AMTC, LIMRA)")).toBe("AMTC");
    expect(chipTitle("High Net Worth Sales Concepts (I)")).toBe("High Net Worth Sales Concepts (I)");
    expect(chipTitle("Leads Gen Series: Appointment Booster")).toBe("Leads Gen Series");
  });
});

import { nextDates } from "./sessions";

describe("nextDates", () => {
  it("gives the next real session day, else open now, else TBC", () => {
    const next = nextDates(directory, "2026-10-04");
    expect(next.get("propel-to-professional-planning")).toEqual({ kind: "date", date: "2026-10-20" });
    expect(next.get("core-modules-2026")).toEqual({ kind: "open" });
    expect(next.get("shield-updates")).toEqual({ kind: "open" });
    // Leaders' Lunch and Learn was TBC for July, which is past.
    expect(next.has("leaders-lunch-and-learn")).toBe(false);
    expect(nextDates(directory, "2026-06-01").get("leaders-lunch-and-learn")).toEqual({ kind: "tbc" });
    // Nothing after the schedule year.
    expect(nextDates(directory, "2027-01-05").size).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { getLegalConstants } from "@/config/legal-constants";
import { daysRemainingForDate, deadlineDateForDays, stepSequence } from "@/checker/logic";
import type { CheckerAnswers } from "@/checker/types";

/** ISO date `n` days before today (local). */
function daysAgoISO(n: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("deadline math (21-day window)", () => {
    const LIMIT = 21;

    it("returns the full window when the dismissal took effect today", () => {
        expect(daysRemainingForDate(daysAgoISO(0), LIMIT)).toBe(21);
    });

    it("counts down day by day (day after effect)", () => {
        expect(daysRemainingForDate(daysAgoISO(1), LIMIT)).toBe(20);
    });

    it("is exactly 0 on the 21st-day boundary (still in time)", () => {
        expect(daysRemainingForDate(daysAgoISO(21), LIMIT)).toBe(0);
    });

    it("goes negative once the window has closed", () => {
        expect(daysRemainingForDate(daysAgoISO(22), LIMIT)).toBe(-1);
        expect(daysRemainingForDate(daysAgoISO(30), LIMIT)).toBe(-9);
    });

    it("returns null when there is no date", () => {
        expect(daysRemainingForDate(undefined, LIMIT)).toBeNull();
    });

    it("is unaffected by the time of day the date string is parsed (no TZ drift)", () => {
        // Midnight-anchored parsing means the boundary is stable regardless of now's clock time.
        const iso = daysAgoISO(21);
        const deadline = deadlineDateForDays(iso, LIMIT)!;
        expect(deadline.getHours()).toBe(0);
        expect(daysRemainingForDate(iso, LIMIT)).toBe(0);
    });
});

describe("legal constants resolution by date", () => {
    it("resolves the version in force for a given dismissal date", () => {
        expect(getLegalConstants(new Date("2025-08-01")).highIncomeThreshold).toBe(183_100);
        expect(getLegalConstants(new Date("2024-09-01")).highIncomeThreshold).toBe(175_000);
        expect(getLegalConstants(new Date("2023-12-01")).highIncomeThreshold).toBe(167_500);
    });

    it("falls back to the oldest version for dates before the table", () => {
        expect(getLegalConstants(new Date("2000-01-01")).label).toBe("FY2023-24");
    });

    it("shares the same 21-day window for UD and GP dismissal", () => {
        const c = getLegalConstants(new Date("2025-08-01"));
        expect(c.timeLimits.unfairDismissalDays).toBe(21);
        expect(c.timeLimits.generalProtectionsDismissalDays).toBe(21);
        expect(c.timeLimits.generalProtectionsNonDismissalYears).toBe(6);
    });
});

describe("flow routing", () => {
    it("does not run the dismissal flow for a still-employed (not_yet) user", () => {
        const a: CheckerAnswers = { dismissed: "not_yet" };
        expect(stepSequence(a)).toEqual(["dismissed"]);
    });

    it("ends immediately for a voluntary resignation", () => {
        const a: CheckerAnswers = { dismissed: "resigned" };
        expect(stepSequence(a)).toEqual(["dismissed"]);
    });

    it("appends general protections screening after the unfair dismissal questions", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(3),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: daysAgoISO(1000),
            award_covered: "yes",
            eba_applies: "no",
            salary: 90_000,
            reason: "performance",
            workplace_rights: ["safety_or_discrimination"],
            protected_attributes: ["none"],
        };
        const seq = stepSequence(a);
        expect(seq).toContain("workplace_rights");
        expect(seq).toContain("protected_attributes");
        // Decision-maker knowledge only appears once a protected reason exists.
        expect(seq).toContain("decision_maker_aware");
    });

    it("skips the decision-maker question when no protected reason is selected", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(3),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: daysAgoISO(1000),
            award_covered: "yes",
            eba_applies: "no",
            salary: 90_000,
            reason: "performance",
            workplace_rights: ["none"],
            protected_attributes: ["none"],
        };
        expect(stepSequence(a)).not.toContain("decision_maker_aware");
    });
});

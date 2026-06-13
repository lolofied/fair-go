import { describe, expect, it } from "vitest";
import { assessClaims, computeOutcome, electionRequired, toCapturedData } from "@/checker/claims";
import type { CheckerAnswers, ClaimAssessment, ClaimType } from "@/checker/types";

function daysAgoISO(n: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yearsAgoISO(years: number): string {
    return daysAgoISO(Math.round(years * 365.25));
}

const claim = (claims: ClaimAssessment[], type: ClaimType) => claims.find((c) => c.claimType === type);

describe("§5.6 scenario fixtures", () => {
    it("short-tenure casual fired days after a pay complaint → UD unlikely (min period), GP likely, no election", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(5),
            employee_status: "employee",
            employment_type: "casual",
            employer_size: "large",
            start_date: daysAgoISO(60), // ~2 months, under the 6-month minimum
            award_covered: "yes",
            eba_applies: "no",
            salary: 60_000,
            reason: "conduct",
            workplace_rights: ["complaint_or_inquiry"],
            protected_attributes: ["none"],
            decision_maker_aware: "yes",
        };
        const claims = assessClaims(a);

        expect(claim(claims, "unfair_dismissal")!.status).toBe("unlikely");
        expect(claim(claims, "general_protections_dismissal")!.status).toBe("likely");
        expect(electionRequired(claims)).toBe(false);
    });

    it("3-year permanent fired for performance two weeks after a safety concern, decision-maker aware → both viable, election fires", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(5),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: yearsAgoISO(3),
            award_covered: "yes",
            eba_applies: "no",
            salary: 90_000,
            reason: "performance",
            workplace_rights: ["safety_or_discrimination"],
            protected_attributes: ["none"],
            decision_maker_aware: "yes",
        };
        const claims = assessClaims(a);

        expect(claim(claims, "unfair_dismissal")!.status).toBe("likely");
        expect(claim(claims, "general_protections_dismissal")!.status).toBe("likely");
        expect(electionRequired(claims)).toBe(true);
        expect(toCapturedData(a).flags).toContain("multiple_actions_election_required");
    });

    it("high earner, no award, fired after a parental-leave request → UD unlikely (threshold), GP likely, no election", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(5),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: yearsAgoISO(3),
            award_covered: "no",
            eba_applies: "no",
            salary: 250_000, // over the high income threshold
            reason: "none_given",
            workplace_rights: ["leave"],
            protected_attributes: ["none"],
            decision_maker_aware: "yes",
        };
        const claims = assessClaims(a);

        expect(claim(claims, "unfair_dismissal")!.status).toBe("unlikely");
        expect(claim(claims, "general_protections_dismissal")!.status).toBe("likely");
        expect(electionRequired(claims)).toBe(false);
    });

    it("still employed, demoted after a discrimination complaint → non-dismissal path, 6-year limit, lawyer route, no dismissal flow", () => {
        const a: CheckerAnswers = { dismissed: "not_yet" };
        const captured = toCapturedData(a);

        expect(captured.flags).toContain("gp_non_dismissal_path");
        const claims = captured.candidate_claims;
        expect(claim(claims, "general_protections_non_dismissal")).toBeDefined();
        expect(claim(claims, "unfair_dismissal")).toBeUndefined();
        expect(claim(claims, "general_protections_dismissal")).toBeUndefined();
        // 6-year basis surfaced.
        expect(claim(claims, "general_protections_non_dismissal")!.deadline?.basis).toContain("6-year");
    });

    it("dismissal 30 days ago → both dismissal claims time_barred", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(30),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: yearsAgoISO(3),
            award_covered: "yes",
            eba_applies: "no",
            salary: 90_000,
            reason: "performance",
            workplace_rights: ["complaint_or_inquiry"],
            protected_attributes: ["none"],
            decision_maker_aware: "yes",
        };
        const claims = assessClaims(a);

        expect(claim(claims, "unfair_dismissal")!.status).toBe("time_barred");
        expect(claim(claims, "general_protections_dismissal")!.status).toBe("time_barred");
        expect(electionRequired(claims)).toBe(false);
    });
});

describe("election safety (s.725)", () => {
    it("does not fire when only one dismissal claim is viable", () => {
        const oneViable: ClaimAssessment[] = [
            { claimType: "unfair_dismissal", status: "likely", deadline: null, unmetGates: [], supportingFacts: [], weakeningFacts: [] },
            { claimType: "general_protections_dismissal", status: "unlikely", deadline: null, unmetGates: [], supportingFacts: [], weakeningFacts: [] },
        ];
        expect(electionRequired(oneViable)).toBe(false);
    });

    it("fires when both dismissal claims are viable (likely or possible_complex)", () => {
        const bothViable: ClaimAssessment[] = [
            { claimType: "unfair_dismissal", status: "likely", deadline: null, unmetGates: [], supportingFacts: [], weakeningFacts: [] },
            { claimType: "general_protections_dismissal", status: "possible_complex", deadline: null, unmetGates: [], supportingFacts: [], weakeningFacts: [] },
        ];
        expect(electionRequired(bothViable)).toBe(true);
    });
});

describe("non-advice safety rules", () => {
    it("never emits a dollar amount or a verdict/score in claim facts", () => {
        const a: CheckerAnswers = {
            dismissed: "terminated",
            effective_date: daysAgoISO(5),
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: yearsAgoISO(3),
            award_covered: "yes",
            eba_applies: "no",
            salary: 90_000,
            reason: "performance",
            workplace_rights: ["safety_or_discrimination"],
            protected_attributes: ["Age"],
            decision_maker_aware: "yes",
        };
        const text = assessClaims(a)
            .flatMap((c) => [...c.supportingFacts, ...c.weakeningFacts, ...c.unmetGates])
            .join(" ");
        expect(text).not.toContain("$");
        expect(text.toLowerCase()).not.toContain("guarantee");
        expect(text.toLowerCase()).not.toContain("no claim");
        expect(text.toLowerCase()).not.toContain("worthless");
    });

    it("back-compat outcome bucket: not_yet → prepare-now (2), resigned → other (3)", () => {
        expect(computeOutcome({ dismissed: "not_yet" })).toBe(2);
        expect(computeOutcome({ dismissed: "resigned" })).toBe(3);
    });
});

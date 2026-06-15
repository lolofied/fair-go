import { describe, expect, it } from "vitest";
import { toCapturedData } from "@/checker/claims";
import type { CheckerAnswers } from "@/checker/types";
import { emptyCaseFile, mergeCheckerIntoCase, seedCaseFromChecker } from "@/case/seed";

function daysAgoISO(n: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const fullAnswers: CheckerAnswers = {
    dismissed: "terminated",
    effective_date: daysAgoISO(5),
    employee_status: "employee",
    employment_type: "casual",
    casual_regular: true,
    casual_expectation: false,
    employer_size: "unsure",
    size_estimate: "15_plus",
    has_associated_entities: "yes",
    start_date: daysAgoISO(400),
    award_covered: "yes",
    eba_applies: "no",
    salary: 72_000,
    reason: "conduct",
    workplace_rights: ["complaint_or_inquiry"],
    protected_attributes: ["none"],
    decision_maker_aware: "yes",
    name: "Alex Worker",
    role: "Store manager",
    employer_legal_name: "Retail Co Pty Ltd",
    employer_abn: "12 345 678 901",
};

describe("seedCaseFromChecker", () => {
    it("captures all checker profile fields", () => {
        const file = seedCaseFromChecker(fullAnswers);
        const captured = toCapturedData(fullAnswers);

        expect(file.profile.employee).toEqual(captured.employee);
        expect(file.profile.employer).toEqual(captured.employer);
        expect(file.profile.dismissal).toEqual(captured.dismissal);
        expect(file.profile.candidateClaims).toEqual(captured.candidate_claims);
        expect(file.profile.flags).toEqual(captured.flags);
        expect(file.meta.seededFromChecker).toBe(true);
    });
});

describe("mergeCheckerIntoCase", () => {
    it("fills empty profile fields without overwriting user edits", () => {
        const existing = emptyCaseFile();
        existing.profile.employee.role = "User-edited role";
        existing.profile.employer.legal_name = "User-edited employer";

        const merged = mergeCheckerIntoCase(existing, fullAnswers);

        expect(merged.profile.employee.role).toBe("User-edited role");
        expect(merged.profile.employer.legal_name).toBe("User-edited employer");
        expect(merged.profile.employee.employment_type).toBe("casual");
        expect(merged.profile.employee.employee_status).toBe("employee");
        expect(merged.profile.employee.casual_regular).toBe(true);
        expect(merged.profile.employee.casual_expectation).toBe(false);
        expect(merged.profile.employer.size_estimate).toBe("15_plus");
        expect(merged.profile.employer.has_associated_entities).toBe("yes");
        expect(merged.profile.dismissal.kind).toBe("terminated");
    });

    it("refreshes derived claims and flags from the latest checker answers", () => {
        const stale = seedCaseFromChecker({
            ...fullAnswers,
            employment_type: "permanent",
            casual_regular: undefined,
            casual_expectation: undefined,
        });

        const updated = mergeCheckerIntoCase(stale, fullAnswers);

        expect(updated.profile.employee.employment_type).toBe("permanent");
        expect(updated.profile.candidateClaims).toEqual(toCapturedData(fullAnswers).candidate_claims);
        expect(updated.profile.flags).toEqual(toCapturedData(fullAnswers).flags);
    });

    it("appends seeded GP events without duplicating existing ones", () => {
        const seeded = seedCaseFromChecker(fullAnswers);
        const eventCount = seeded.events.length;
        expect(eventCount).toBeGreaterThan(0);

        const merged = mergeCheckerIntoCase(seeded, fullAnswers);
        expect(merged.events).toHaveLength(eventCount);
    });
});

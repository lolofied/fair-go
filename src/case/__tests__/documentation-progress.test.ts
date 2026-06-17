import { describe, expect, it } from "vitest";
import { seedCaseFromChecker } from "@/case/seed";
import { computeDocumentationProgress } from "@/case/documentation-progress";
import type { CheckerAnswers } from "@/checker/types";

function daysAgoISO(n: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const answers: CheckerAnswers = {
    dismissed: "terminated",
    effective_date: daysAgoISO(5),
    employee_status: "employee",
    employment_type: "permanent",
    employer_size: "large",
    start_date: daysAgoISO(400),
    award_covered: "yes",
    eba_applies: "no",
    salary: 90_000,
    reason: "performance",
    workplace_rights: ["complaint_or_inquiry"],
    protected_attributes: ["none"],
    decision_maker_aware: "yes",
    role: "Team lead",
    employer_legal_name: "Acme Pty Ltd",
};

describe("computeDocumentationProgress", () => {
    it("tracks documentation sections without a save row", () => {
        const file = seedCaseFromChecker(answers);
        const progress = computeDocumentationProgress(file);

        expect(progress.totalCount).toBe(5);
        expect(progress.sections.some((s) => s.id === "save")).toBe(false);
        expect(progress.sections.find((s) => s.id === "profile")?.status).toBe("complete");
        expect(progress.sections.find((s) => s.id === "events")?.status).toBe("in_progress");
        expect(progress.nextSection?.id).toBe("events");
        expect(progress.nextStep?.title).toBe("Keep building your event log");
    });

    it("reflects open checklist items on the export section", () => {
        const file = seedCaseFromChecker(answers);
        const progress = computeDocumentationProgress(file);
        const exportSection = progress.sections.find((s) => s.id === "export");

        expect(exportSection).toBeDefined();
        expect(exportSection!.status).toBe("in_progress");
        expect(exportSection!.detail).toMatch(/findings to review/i);
        expect(progress.sections.some((s) => s.id === "gaps")).toBe(false);
    });

    it("suggests the first incomplete section in list order", () => {
        const file = { ...seedCaseFromChecker(answers), events: [] };
        const progress = computeDocumentationProgress(file);

        expect(progress.sections.find((s) => s.id === "profile")?.status).toBe("complete");
        expect(progress.sections.find((s) => s.id === "events")?.status).toBe("not_started");
        expect(progress.sections.find((s) => s.id === "export")?.status).toBe("in_progress");
        expect(progress.nextSection?.id).toBe("events");
        expect(progress.nextStep).toEqual({
            title: "Record what happened",
            subtitle: "Add your first event to build a structured timeline",
            href: "/case/events",
        });
    });
});

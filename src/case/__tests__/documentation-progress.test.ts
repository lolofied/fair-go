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
    it("marks save as not started on a fresh seeded case", () => {
        const file = seedCaseFromChecker(answers);
        const progress = computeDocumentationProgress(file);

        expect(progress.sections.find((s) => s.id === "save")?.status).toBe("not_started");
        expect(progress.sections.find((s) => s.id === "profile")?.status).toBe("complete");
        expect(progress.sections.find((s) => s.id === "events")?.status).toBe("in_progress");
        expect(progress.nextSection?.id).toBe("save");
    });

    it("marks save complete when synced remotely", () => {
        const file = seedCaseFromChecker(answers);
        const progress = computeDocumentationProgress(file, { savedRemotely: true });

        expect(progress.sections.find((s) => s.id === "save")?.status).toBe("complete");
    });

    it("reflects open checklist items on the export section", () => {
        const file = seedCaseFromChecker(answers);
        const progress = computeDocumentationProgress(file);
        const exportSection = progress.sections.find((s) => s.id === "export");

        expect(exportSection).toBeDefined();
        expect(exportSection!.status).toBe("in_progress");
        expect(exportSection!.detail).toMatch(/brief audit/i);
        expect(progress.sections.some((s) => s.id === "gaps")).toBe(false);
    });
});

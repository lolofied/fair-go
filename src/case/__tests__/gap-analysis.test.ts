import { describe, expect, it } from "vitest";
import type { ClaimAssessment } from "@/checker/types";
import { analyseGaps } from "@/case/gap-analysis";
import { EVENT_TEMPLATES } from "@/case/templates";
import type { CaseEvent, CaseFile } from "@/case/types";

function udClaim(): ClaimAssessment {
    return {
        claimType: "unfair_dismissal",
        status: "likely",
        deadline: null,
        unmetGates: [],
        supportingFacts: [],
        weakeningFacts: [],
    };
}

function makeEvent(type: CaseEvent["type"], partial: Partial<CaseEvent> = {}): CaseEvent {
    return {
        id: `e-${Math.random().toString(36).slice(2)}`,
        type,
        fields: {},
        elementTags: EVENT_TEMPLATES[type].elementTags,
        linkedDocumentIds: [],
        linkedWitnessIds: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...partial,
    };
}

function caseFile(events: CaseEvent[], claims: ClaimAssessment[]): CaseFile {
    return {
        profile: {
            employee: { award_or_eba: "unsure" },
            employer: {},
            dismissal: { redundancy_claimed: false, days_remaining: null },
            candidateClaims: claims,
            flags: [],
        },
        events,
        documents: [],
        witnesses: [],
        meta: { createdAt: "", updatedAt: "", schemaVersion: 1, seededFromChecker: false },
    };
}

describe("analyseGaps", () => {
    it("reports every unfair dismissal element as missing when nothing is recorded", () => {
        const report = analyseGaps(caseFile([], [udClaim()]));
        const ud = report.byClaim.find((c) => c.claimType === "unfair_dismissal")!;
        expect(ud.totalCount).toBe(6);
        expect(ud.coveredCount).toBe(0);
        expect(ud.gaps).toHaveLength(6);
        expect(ud.gaps.every((g) => g.severity === "missing")).toBe(true);
    });

    it("marks an element supported once a linked document backs the event", () => {
        const event = makeEvent("dismissal_meeting", { linkedDocumentIds: ["doc-1"] });
        const report = analyseGaps(caseFile([event], [udClaim()]));
        const ud = report.byClaim.find((c) => c.claimType === "unfair_dismissal")!;

        // dismissal_meeting speaks to 3 of the 6 UD elements.
        expect(ud.coveredCount).toBe(3);
        const coveredElements = ["ud_notified_of_reason", "ud_opportunity_to_respond", "ud_support_person"];
        for (const el of coveredElements) {
            expect(ud.gaps.find((g) => g.element === el)).toBeUndefined();
        }
    });

    it("flags a recorded element that lacks any supporting evidence as needs_detail", () => {
        const event = makeEvent("dismissal_meeting");
        const report = analyseGaps(caseFile([event], [udClaim()]));
        const ud = report.byClaim.find((c) => c.claimType === "unfair_dismissal")!;
        const notified = ud.gaps.find((g) => g.element === "ud_notified_of_reason");
        expect(notified?.severity).toBe("needs_detail");
    });

    it("raises a contextual prompt for a workplace right with no linked document", () => {
        const event = makeEvent("workplace_right", { fields: { description: "Raised an underpayment" } });
        const report = analyseGaps(caseFile([event], [udClaim()]));
        expect(report.contextual.some((p) => p.eventId === event.id)).toBe(true);
    });

    it("ignores claims that are unlikely or time-barred", () => {
        const report = analyseGaps(caseFile([], [{ ...udClaim(), status: "unlikely" }]));
        expect(report.byClaim).toHaveLength(0);
    });
});

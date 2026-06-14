import { describe, expect, it } from "vitest";
import { buildTimeline, orderedEvents } from "@/case/chronology";
import type { CaseEvent, CaseFile, Evidence } from "@/case/types";

function event(id: string, date: string | undefined, order?: number): CaseEvent {
    return {
        id,
        type: "incident",
        date,
        fields: {},
        elementTags: [],
        linkedDocumentIds: [],
        linkedWitnessIds: [],
        order,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
    };
}

function doc(id: string, date?: string): Evidence {
    return {
        id,
        title: id,
        docType: "other",
        date,
        fileRef: `ref-${id}`,
        fileName: `${id}.pdf`,
        mimeType: "application/pdf",
        size: 1,
        linkedEventIds: [],
        createdAt: "2026-01-01T00:00:00.000Z",
    };
}

function file(partial: Pick<CaseFile, "events" | "documents">): CaseFile {
    return {
        profile: {
            employee: { award_or_eba: "unsure" },
            employer: {},
            dismissal: { redundancy_claimed: false, days_remaining: null },
            candidateClaims: [],
            flags: [],
        },
        witnesses: [],
        meta: { createdAt: "", updatedAt: "", schemaVersion: 1, seededFromChecker: false },
        ...partial,
    };
}

describe("buildTimeline", () => {
    it("sorts dated items ascending and sinks undated items to the end", () => {
        const f = file({
            events: [event("e_late", "2026-03-01"), event("e_undated", undefined), event("e_early", "2026-01-15")],
            documents: [doc("d_mid", "2026-02-10")],
        });

        const ids = buildTimeline(f).map((i) => (i.kind === "event" ? i.event.id : i.document.id));
        expect(ids).toEqual(["e_early", "d_mid", "e_late", "e_undated"]);
    });

    it("breaks same-date ties by manual order", () => {
        const f = file({
            events: [event("second", "2026-01-01", 1), event("first", "2026-01-01", 0)],
            documents: [],
        });
        expect(orderedEvents(f).map((e) => e.id)).toEqual(["first", "second"]);
    });
});

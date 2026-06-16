import { describe, expect, it } from "vitest";
import { emptyCaseFile } from "@/case/seed";
import { countUnsavedChanges, formatUnsavedChangesLabel, hasUnsavedChanges } from "@/case/unsaved-changes";
import type { CaseEvent, Evidence, Witness } from "@/case/types";

function withMetaTimestamps<T extends { meta: { createdAt: string; updatedAt: string; lastBackupAt?: string } }>(
    file: T,
    createdAt: string,
    updatedAt: string,
    lastBackupAt?: string,
): T {
    return {
        ...file,
        meta: { ...file.meta, createdAt, updatedAt, ...(lastBackupAt !== undefined ? { lastBackupAt } : {}) },
    };
}

describe("unsaved changes", () => {
    it("reports no changes on a fresh case", () => {
        const file = emptyCaseFile();
        expect(hasUnsavedChanges(file)).toBe(false);
        expect(countUnsavedChanges(file)).toBe(0);
        expect(formatUnsavedChangesLabel(file)).toBe("Not saved");
    });

    it("counts profile-only edits as one change", () => {
        const createdAt = "2026-06-13T08:00:00.000Z";
        const updatedAt = "2026-06-14T10:00:00.000Z";
        const file = withMetaTimestamps(emptyCaseFile(), createdAt, updatedAt);
        expect(hasUnsavedChanges(file)).toBe(true);
        expect(countUnsavedChanges(file)).toBe(1);
        expect(formatUnsavedChangesLabel(file)).toBe("1 unsaved change");
    });

    it("counts edited events, new documents, and new witnesses since backup", () => {
        const baseline = "2026-06-13T12:00:00.000Z";
        const updatedAt = "2026-06-14T10:00:00.000Z";
        const file = withMetaTimestamps(
            {
                ...emptyCaseFile(),
                events: [
                    {
                        id: "e1",
                        type: "incident",
                        fields: {},
                        elementTags: [],
                        linkedDocumentIds: [],
                        linkedWitnessIds: [],
                        createdAt: baseline,
                        updatedAt: "2026-06-14T09:00:00.000Z",
                    } satisfies CaseEvent,
                ],
                documents: [
                    {
                        id: "d1",
                        title: "Letter",
                        docType: "email",
                        fileRef: "ref",
                        fileName: "letter.pdf",
                        mimeType: "application/pdf",
                        size: 1,
                        linkedEventIds: [],
                        createdAt: "2026-06-14T08:00:00.000Z",
                    } satisfies Evidence,
                ],
                witnesses: [
                    {
                        id: "w1",
                        name: "Sam",
                        linkedEventIds: [],
                        createdAt: "2026-06-14T07:00:00.000Z",
                    } satisfies Witness,
                ],
            },
            "2026-06-13T08:00:00.000Z",
            updatedAt,
            baseline,
        );

        expect(countUnsavedChanges(file)).toBe(3);
        expect(formatUnsavedChangesLabel(file)).toBe("3 unsaved changes");
    });

    it("resets the count after a backup baseline", () => {
        const backedUpAt = "2026-06-14T12:00:00.000Z";
        const file = withMetaTimestamps(emptyCaseFile(), "2026-06-13T08:00:00.000Z", backedUpAt, backedUpAt);
        expect(countUnsavedChanges(file)).toBe(0);
    });
});

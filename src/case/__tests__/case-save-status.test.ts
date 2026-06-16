import { describe, expect, it } from "vitest";
import { emptyCaseFile } from "@/case/seed";
import { isCaseSavedExternally } from "@/case/case-save-status";

describe("isCaseSavedExternally", () => {
    it("is true when synced", () => {
        const file = emptyCaseFile();
        expect(isCaseSavedExternally(file, { synced: true })).toBe(true);
    });

    it("is true with a fresh backup", () => {
        const backedUpAt = "2026-06-14T12:00:00.000Z";
        const file = {
            ...emptyCaseFile(),
            meta: {
                ...emptyCaseFile().meta,
                createdAt: "2026-06-13T08:00:00.000Z",
                updatedAt: backedUpAt,
                lastBackupAt: backedUpAt,
            },
        };
        expect(isCaseSavedExternally(file, { synced: false })).toBe(true);
    });

    it("is false without sync or backup", () => {
        const file = emptyCaseFile();
        expect(isCaseSavedExternally(file, { synced: false })).toBe(false);
    });
});

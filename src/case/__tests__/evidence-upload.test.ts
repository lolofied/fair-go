import { describe, expect, it } from "vitest";
import { evidenceFileSizeError, MAX_EVIDENCE_FILE_BYTES } from "@/case/evidence-upload";

describe("evidence upload limits", () => {
    it("accepts files at the 50 MB limit", () => {
        expect(evidenceFileSizeError(MAX_EVIDENCE_FILE_BYTES)).toBeNull();
    });

    it("rejects files over 50 MB", () => {
        expect(evidenceFileSizeError(MAX_EVIDENCE_FILE_BYTES + 1)).toMatch(/50 MB/);
    });
});

import { describe, expect, it } from "vitest";
import { emptyCaseFile } from "@/case/seed";
import { caseExportDocumentTitle } from "@/case/export/print";

describe("caseExportDocumentTitle", () => {
    it("includes the export date", () => {
        const file = emptyCaseFile();
        expect(caseExportDocumentTitle(file, new Date("2026-06-13T12:00:00.000Z"))).toBe("fairgo-case-export-2026-06-13");
    });
});

import type { CaseFile } from "@/case/types";
import { trackCaseExportPrinted } from "@/analytics/product-analytics";

/** Suggested PDF filename (without extension). Browsers use document.title when saving print output. */
export function caseExportDocumentTitle(_file: CaseFile, now = new Date()): string {
    const stamp = now.toISOString().slice(0, 10);
    return `fairgo-case-export-${stamp}`;
}

/** Print the export package with a descriptive default PDF name. */
export function printCaseExport(file: CaseFile): void {
    trackCaseExportPrinted({
        events: file.events.length,
        documents: file.documents.length,
        witnesses: file.witnesses.length,
    });

    const previousTitle = document.title;
    document.title = caseExportDocumentTitle(file);

    const restoreTitle = () => {
        document.title = previousTitle;
        window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();
}

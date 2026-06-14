/**
 * Annexure lettering for the export. Documents are lettered A, B, C... in
 * timeline order so the statement of facts can reference them inline and the
 * annexure index lists them in the same order.
 */

import { buildTimeline } from "@/case/chronology";
import type { CaseFile, Evidence } from "@/case/types";

export interface Annexure {
    letter: string;
    document: Evidence;
}

/** 0 -> A, 25 -> Z, 26 -> AA, ... */
export function indexToLetter(index: number): string {
    let n = index;
    let out = "";
    do {
        out = String.fromCharCode(65 + (n % 26)) + out;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return out;
}

/** Documents in timeline order, each assigned an annexure letter. */
export function assignAnnexures(file: CaseFile): Annexure[] {
    const ordered = buildTimeline({ events: [], documents: file.documents })
        .filter((i): i is Extract<ReturnType<typeof buildTimeline>[number], { kind: "document" }> => i.kind === "document")
        .map((i) => i.document);
    return ordered.map((document, index) => ({ letter: indexToLetter(index), document }));
}

export function annexureLetterMap(annexures: Annexure[]): Map<string, string> {
    return new Map(annexures.map((a) => [a.document.id, a.letter]));
}

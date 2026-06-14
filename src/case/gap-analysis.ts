/**
 * Gap analysis: deterministic, rules-first, no LLM.
 *
 * For each element of each active claim, we know what evidence typically proves
 * it and prompt for what is absent. It doubles as the lawyer-brief checklist.
 * Output is prompts and flags only, never a conclusion about merits.
 */

import type { ClaimType } from "@/checker/types";
import { CLAIM_ELEMENTS, EVENT_TEMPLATES } from "@/case/templates";
import type { CaseEvent, CaseFile, ClaimElement, ClaimElementMeta } from "@/case/types";

const CLAIM_LABELS: Record<ClaimType, string> = {
    unfair_dismissal: "Unfair dismissal",
    general_protections_dismissal: "General protections (dismissal)",
    general_protections_non_dismissal: "General protections (still employed)",
};

export interface GapItem {
    element: ClaimElement;
    label: string;
    /** "missing" = nothing recorded; "needs_detail" = recorded but unsupported. */
    severity: "missing" | "needs_detail";
    prompt: string;
}

export interface ClaimGaps {
    claimType: ClaimType;
    claimLabel: string;
    coveredCount: number;
    totalCount: number;
    gaps: GapItem[];
}

export interface ContextualPrompt {
    eventId: string;
    prompt: string;
}

export interface GapReport {
    byClaim: ClaimGaps[];
    contextual: ContextualPrompt[];
}

function elementsForClaim(claimType: ClaimType): ClaimElementMeta[] {
    const wanted = claimType === "unfair_dismissal" ? "unfair_dismissal" : "general_protections_dismissal";
    return Object.values(CLAIM_ELEMENTS).filter((m) => m.claimType === wanted);
}

function eventsForElement(events: CaseEvent[], element: ClaimElement): CaseEvent[] {
    return events.filter((e) => e.elementTags.includes(element));
}

function eventLabel(event: CaseEvent): string {
    return event.title?.trim() || EVENT_TEMPLATES[event.type].label;
}

/** Active claims worth documenting: anything not ruled out or out of time. */
function activeClaimTypes(file: CaseFile): ClaimType[] {
    const types = file.profile.candidateClaims
        .filter((c) => c.status === "likely" || c.status === "possible_complex")
        .map((c) => c.claimType);
    return [...new Set(types)];
}

export function analyseGaps(file: CaseFile): GapReport {
    const byClaim: ClaimGaps[] = activeClaimTypes(file).map((claimType) => {
        const elements = elementsForClaim(claimType);
        const gaps: GapItem[] = [];
        let coveredCount = 0;

        for (const meta of elements) {
            const matching = eventsForElement(file.events, meta.element);
            if (matching.length === 0) {
                gaps.push({
                    element: meta.element,
                    label: meta.label,
                    severity: "missing",
                    prompt: `Nothing recorded yet for "${meta.label}". ${meta.provedBy}`,
                });
                continue;
            }

            const hasSupport = matching.some((e) => e.linkedDocumentIds.length > 0 || e.linkedWitnessIds.length > 0);
            if (!hasSupport) {
                gaps.push({
                    element: meta.element,
                    label: meta.label,
                    severity: "needs_detail",
                    prompt: `You've recorded "${meta.label}", but nothing backs it up yet. ${meta.provedBy}`,
                });
            } else {
                coveredCount += 1;
            }
        }

        return { claimType, claimLabel: CLAIM_LABELS[claimType], coveredCount, totalCount: elements.length, gaps };
    });

    return { byClaim, contextual: contextualPrompts(file) };
}

/** Specific, deterministic nudges keyed off individual events. */
function contextualPrompts(file: CaseFile): ContextualPrompt[] {
    const prompts: ContextualPrompt[] = [];

    for (const event of file.events) {
        if (event.type === "workplace_right" && event.linkedDocumentIds.length === 0) {
            const what = String(event.fields.description ?? "a workplace right").trim() || "a workplace right";
            prompts.push({
                eventId: event.id,
                prompt: `You logged ${what.toLowerCase()}. Do you have the email or letter where you raised it? Add it before you lose access.`,
            });
        }

        if (event.type === "incident" && event.linkedWitnessIds.length === 0) {
            prompts.push({
                eventId: event.id,
                prompt: `Was anyone present for "${eventLabel(event)}"? Add them to your witness register while you still have their contact details.`,
            });
        }

        if (event.type === "dismissal_meeting" && event.fields.reason_given !== "written") {
            const hasLetter = file.documents.some(
                (d) => d.docType === "dismissal_letter" && d.linkedEventIds.includes(event.id),
            );
            if (!hasLetter) {
                prompts.push({
                    eventId: event.id,
                    prompt: "You weren't given written reasons for dismissal. If you can, request them in writing and add the dismissal letter.",
                });
            }
        }

        if (event.type === "pip_issued" && event.fields.in_writing !== "yes") {
            const hasLetter = file.documents.some(
                (d) => d.docType === "pip_letter" && d.linkedEventIds.includes(event.id),
            );
            if (!hasLetter) {
                prompts.push({
                    eventId: event.id,
                    prompt: "Add the PIP document if you have it. A written plan is central to whether the process was fair.",
                });
            }
        }
    }

    return prompts;
}

/**
 * Anonymised analytics for which branch / claim types a case lands in.
 *
 * This is the D2C demand signal that later tells us which second vertical
 * (harassment, discrimination, underpayment) to build. It records ONLY
 * non-identifying signal (claim types, statuses, and which flags fired), never
 * the user's answers, dates, salary, names, or free text.
 *
 * The transport is intentionally a thin, swappable sink: today it buffers to
 * localStorage and emits a `fairgo:analytics` event; a real endpoint can be
 * dropped in here without touching call sites.
 */

import type { CheckerFlag, ClaimAssessment, ClaimStatus, ClaimType } from "@/checker/types";

export interface ClaimOutcomeEvent {
    type: "claim_outcome";
    /** Epoch ms (coarse timing only, no identity). */
    at: number;
    claims: { claimType: ClaimType; status: ClaimStatus }[];
    /** Flags that fired (taxonomy keys only, which carry no personal data). */
    flags: CheckerFlag[];
    electionRequired: boolean;
}

const STORAGE_KEY = "fairgo.analytics.v1";
const MAX_BUFFERED = 200;

function persist(event: ClaimOutcomeEvent): void {
    if (typeof window === "undefined") return;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const buffer: ClaimOutcomeEvent[] = raw ? JSON.parse(raw) : [];
        buffer.push(event);
        // Keep the buffer bounded so a long-lived browser never grows unbounded.
        const trimmed = buffer.slice(-MAX_BUFFERED);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        window.dispatchEvent(new CustomEvent("fairgo:analytics", { detail: event }));
    } catch {
        /* analytics must never break the app, so fail silently */
    }
}

/** Record the (anonymised) outcome of a completed assessment. */
export function trackClaimOutcome(claims: ClaimAssessment[], flags: CheckerFlag[]): void {
    persist({
        type: "claim_outcome",
        at: Date.now(),
        claims: claims.map((c) => ({ claimType: c.claimType, status: c.status })),
        flags,
        electionRequired: flags.includes("multiple_actions_election_required"),
    });
}

/**
 * Anonymised analytics for which branch / claim types a case lands in.
 *
 * This is the D2C demand signal that later tells us which second vertical
 * (harassment, discrimination, underpayment) to build. It records ONLY
 * non-identifying signal (claim types, statuses, and which flags fired), never
 * the user's answers, dates, salary, names, or free text.
 *
 * The transport is intentionally a thin, swappable sink: today it buffers to
 * localStorage, emits a `fairgo:analytics` event, and forwards allowlisted events
 * to PostHog when configured.
 */

import { trackClaimOutcomePostHog } from "@/analytics/product-analytics";
import { shutdownPostHog } from "@/analytics/posthog-client";
import { toCapturedData } from "@/checker/claims";
import { loadCheckerAnswers, loadCheckerScreen } from "@/checker/store";
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

function outcomeFingerprint(
    claims: { claimType: ClaimType; status: ClaimStatus }[],
    flags: CheckerFlag[],
    electionRequired: boolean,
): string {
    return JSON.stringify({
        claims,
        flags: [...flags].sort(),
        electionRequired,
    });
}

function readBuffer(): ClaimOutcomeEvent[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function alreadyTrackedOutcome(
    claims: { claimType: ClaimType; status: ClaimStatus }[],
    flags: CheckerFlag[],
    electionRequired: boolean,
): boolean {
    const fingerprint = outcomeFingerprint(claims, flags, electionRequired);
    const last = readBuffer().at(-1);
    if (!last) return false;
    return outcomeFingerprint(last.claims, last.flags, last.electionRequired) === fingerprint;
}

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
        trackClaimOutcomePostHog({
            claims: event.claims,
            flags: event.flags,
            electionRequired: event.electionRequired,
        });
    } catch {
        /* analytics must never break the app, so fail silently */
    }
}

/** Remove buffered analytics (used by the case module's right-to-erasure). */
export function clearAnalytics(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        shutdownPostHog();
    } catch {
        /* storage may be unavailable; nothing to clear */
    }
}

/** Record the (anonymised) outcome of a completed assessment. Idempotent for identical outcomes. */
export function trackClaimOutcome(claims: ClaimAssessment[], flags: CheckerFlag[]): void {
    const payload = {
        claims: claims.map((c) => ({ claimType: c.claimType, status: c.status })),
        flags,
        electionRequired: flags.includes("multiple_actions_election_required"),
    };

    if (alreadyTrackedOutcome(payload.claims, payload.flags, payload.electionRequired)) return;

    persist({
        type: "claim_outcome",
        at: Date.now(),
        ...payload,
    });
}

/**
 * Record claim_outcome when the checker finished on "result" but the result screen
 * was skipped (e.g. home redirects straight to /case). Safe to call on every case entry.
 */
export function trackClaimOutcomeIfCompleted(): void {
    if (typeof window === "undefined") return;
    if (loadCheckerScreen() !== "result") return;

    const answers = loadCheckerAnswers();
    if (Object.keys(answers).length === 0) return;

    const captured = toCapturedData(answers);
    trackClaimOutcome(captured.candidate_claims, captured.flags);
}

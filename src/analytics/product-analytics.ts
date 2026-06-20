/**
 * Privacy-safe product analytics forwarded to PostHog when configured.
 * Counts, enums, and funnel steps only — never answers, names, or file content.
 */

import { capturePostHog } from "@/analytics/posthog-client";
import type { ProductEventName } from "@/analytics/product-events";
import type { CheckerFlag, ClaimStatus, ClaimType } from "@/checker/types";
import type { CaseEventType, EvidenceType } from "@/case/types";

export type CaseSyncSavedTrigger = "manual" | "auto" | "login";

function track(event: ProductEventName, properties: Record<string, unknown> = {}): void {
    try {
        capturePostHog(event, properties);
    } catch {
        /* analytics must never break the app */
    }
}

export function trackCheckerStarted(entry: "new" | "resume"): void {
    track("checker_started", { entry });
    try {
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
            (window as any).gtag("event", "conversion", { send_to: "AW-18259212747/udRxCPGclcIcEMvh4YBE" });
        }
    } catch {
        /* analytics must never break the app */
    }
}

export function trackClaimOutcomePostHog(payload: {
    claims: { claimType: ClaimType; status: ClaimStatus }[];
    flags: CheckerFlag[];
    electionRequired: boolean;
}): void {
    track("claim_outcome", {
        claims: payload.claims,
        flags: payload.flags,
        election_required: payload.electionRequired,
    });
}

export function trackDocumentationStarted(): void {
    track("documentation_started");
}

export function trackCaseOnboardingCompleted(): void {
    track("case_onboarding_completed");
}

export function trackCaseEventAdded(eventType: CaseEventType): void {
    track("case_event_added", { event_type: eventType });
}

export function trackCaseWitnessAdded(): void {
    track("case_witness_added");
}

export function trackCaseDocumentAdded(docType: EvidenceType): void {
    track("case_document_added", { doc_type: docType });
}

export function trackCaseExportViewed(findingsCount: number): void {
    track("case_export_viewed", { findings_count: findingsCount });
}

export function trackCaseExportPrinted(counts: { events: number; documents: number; witnesses: number }): void {
    track("case_export_printed", {
        event_count: counts.events,
        document_count: counts.documents,
        witness_count: counts.witnesses,
    });
}

export function trackCaseBackupDownloaded(): void {
    track("case_backup_downloaded");
}

export function trackSyncAccountCreated(): void {
    track("sync_account_created");
}

export function trackSyncAccountSignedIn(): void {
    track("sync_account_signed_in");
}

export function trackCaseSyncSaved(trigger: CaseSyncSavedTrigger): void {
    track("case_sync_saved", { trigger });
}

export function trackCaseErased(): void {
    track("case_erased");
}

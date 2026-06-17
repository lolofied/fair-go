/**
 * Privacy-safe product analytics forwarded to PostHog when configured.
 * Counts, enums, and funnel steps only — never answers, names, or file content.
 */

import { capturePostHog } from "@/analytics/posthog-client";
import type { ProductEventName } from "@/analytics/product-events";
import type { CheckerFlag, ClaimStatus, ClaimType } from "@/checker/types";
import type { EvidenceType } from "@/case/types";

function track(event: ProductEventName, properties: Record<string, unknown> = {}): void {
    try {
        capturePostHog(event, properties);
    } catch {
        /* analytics must never break the app */
    }
}

export function trackCheckerStarted(entry: "new" | "resume"): void {
    track("checker_started", { entry });
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

export function trackCaseErased(): void {
    track("case_erased");
}

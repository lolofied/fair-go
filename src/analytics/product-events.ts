/** Explicit PostHog events — no PII, no free text, no answer payloads. */
export const PRODUCT_EVENT_NAMES = [
    "checker_started",
    "claim_outcome",
    "documentation_started",
    "case_onboarding_completed",
    "case_event_added",
    "case_witness_added",
    "case_document_added",
    "case_export_viewed",
    "case_export_printed",
    "case_backup_downloaded",
    "sync_account_created",
    "sync_account_signed_in",
    "case_sync_saved",
    "case_erased",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export const ALLOWED_PRODUCT_EVENTS = new Set<string>(PRODUCT_EVENT_NAMES);

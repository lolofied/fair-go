/**
 * Domain model for the documentation module (the "case file").
 *
 * This extends the checker's `CapturedData` spine. Everything the checker
 * collected flows in as the editable `profile`; the documentation flow adds
 * structured events, evidence, and witnesses on top. Nothing here leaves the
 * device in the MVP (local-first, see `storage.ts`).
 */

import type { CapturedData, CheckerFlag, ClaimAssessment, ClaimType } from "@/checker/types";

export const CASE_SCHEMA_VERSION = 1;

/* ------------------------------ claim elements ------------------------------ */

/**
 * The legal elements a piece of evidence or an event can speak to. These are the
 * keys the gap analysis and export reason over. They are facts-and-elements only,
 * never conclusions.
 */
export type ClaimElement =
    // Unfair dismissal: procedural fairness lens (s.387).
    | "ud_valid_reason"
    | "ud_notified_of_reason"
    | "ud_opportunity_to_respond"
    | "ud_support_person"
    | "ud_prior_warnings"
    | "ud_process_consistency"
    // General protections (s.340, s.351, s.360, s.361).
    | "gp_workplace_right"
    | "gp_adverse_action"
    | "gp_protected_attribute"
    | "gp_decision_maker_knowledge"
    | "gp_temporal_connection";

export interface ClaimElementMeta {
    element: ClaimElement;
    /** Which candidate claim this element belongs to. */
    claimType: ClaimType;
    /** Short label for UI and the export's issues section. */
    label: string;
    /** Plain-English description of what the element is about (non-advice). */
    description: string;
    /** What evidence typically helps establish it (drives gap prompts). */
    provedBy: string;
}

/* -------------------------------- case events ------------------------------- */

export type CaseEventType =
    | "performance_meeting"
    | "pip_issued"
    | "show_cause"
    | "dismissal_meeting"
    | "incident"
    | "workplace_right"
    | "adverse_action"
    | "protected_attribute";

export interface CaseEvent {
    id: string;
    type: CaseEventType;
    /** Optional user-given title; falls back to the template label. */
    title?: string;
    /** ISO YYYY-MM-DD. Undated events sort to the end of the timeline. */
    date?: string;
    /** Template-specific answers, keyed by field id. */
    fields: Record<string, unknown>;
    /** Claim elements this event speaks to (from the template). */
    elementTags: ClaimElement[];
    linkedDocumentIds: string[];
    linkedWitnessIds: string[];
    /** Manual ordering override for same-date / undated correction. */
    order?: number;
    createdAt: string;
    updatedAt: string;
}

/* --------------------------------- evidence --------------------------------- */

export type EvidenceType =
    | "contract"
    | "position_description"
    | "pip_letter"
    | "show_cause_letter"
    | "dismissal_letter"
    | "email"
    | "payslip"
    | "other";

export interface Evidence {
    id: string;
    title: string;
    docType: EvidenceType;
    date?: string;
    /** Who it came from / where it originated, for the annexure index. */
    source?: string;
    /** Key into the local file blob store (IndexedDB). */
    fileRef: string;
    fileName: string;
    mimeType: string;
    size: number;
    linkedEventIds: string[];
    createdAt: string;
}

/* --------------------------------- witnesses -------------------------------- */

export interface Witness {
    id: string;
    name: string;
    relationship?: string;
    /** Personal (NOT work) contact details. Guardrail enforced in the UI. */
    personalContact?: string;
    whatTheyWitnessed?: string;
    linkedEventIds: string[];
    createdAt: string;
}

/* ------------------------------- case profile ------------------------------- */

/**
 * The editable profile carried from the checker. Mirrors `CapturedData` so there
 * is zero re-entry, plus the one field the export needs that the checker never
 * asks for: the desired outcome.
 */
export interface CaseProfile {
    employee: CapturedData["employee"];
    employer: CapturedData["employer"];
    dismissal: CapturedData["dismissal"];
    candidateClaims: ClaimAssessment[];
    flags: CheckerFlag[];
    desiredOutcome?: string;
}

export interface CaseMeta {
    createdAt: string;
    updatedAt: string;
    lastBackupAt?: string;
    schemaVersion: number;
    /** True once the profile has been seeded from the checker's captured data. */
    seededFromChecker: boolean;
}

export interface CaseFile {
    profile: CaseProfile;
    events: CaseEvent[];
    documents: Evidence[];
    witnesses: Witness[];
    meta: CaseMeta;
}

/* --------------------------------- backups ---------------------------------- */

/** Envelope for an encrypted backup file (see `backup.ts`). */
export interface EncryptedBackup {
    format: "fairgo-case-backup";
    version: number;
    /** AES-GCM + PBKDF2 parameters, base64-encoded. */
    kdf: "PBKDF2";
    iterations: number;
    saltB64: string;
    ivB64: string;
    /** Base64 ciphertext of the gzip-free JSON payload (case file + files). */
    cipherB64: string;
}

/**
 * Supabase row shapes for zero-knowledge sync.
 * Mirrors supabase/migrations/20250614120000_zero_knowledge_sync.sql
 */

import type { KdfParams } from "@/case/crypto/types";

export type { KdfParams };

/** Reminder email preferences (plaintext metadata only). */
export interface ReminderPrefs {
    enabled: boolean;
    timezone?: string;
}

export interface ProfileRow {
    user_id: string;
    kdf_salt: string;
    kdf_params: KdfParams;
    wrapped_dek_passphrase: string;
    wrapped_dek_passphrase_nonce: string;
    wrapped_dek_recovery: string;
    wrapped_dek_recovery_nonce: string;
    effective_date: string | null;
    deadline_date: string | null;
    reminder_prefs: ReminderPrefs;
    created_at: string;
    updated_at: string;
}

export interface CaseBlobRow {
    id: string;
    user_id: string;
    ciphertext: string;
    nonce: string;
    schema_version: number;
    byte_size: number;
    created_at: string;
    updated_at: string;
}

export interface FileRow {
    id: string;
    user_id: string;
    local_ref: string;
    storage_path: string;
    nonce: string;
    byte_size: number;
    created_at: string;
    updated_at: string;
}

/** Storage object path: `{userId}/{localRef}` inside bucket `case-files`. */
export function caseFileStoragePath(userId: string, localRef: string): string {
    return `${userId}/${localRef}`;
}

export const CASE_FILES_BUCKET = "case-files";

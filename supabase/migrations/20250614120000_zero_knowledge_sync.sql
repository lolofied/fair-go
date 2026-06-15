-- Zero-knowledge sync schema for Fair Go case documentation.
-- See docs/zero-knowledge-sync-requirements.md
--
-- Deploy to a Supabase project in Sydney (ap-southeast-2).
-- Server stores ciphertext + minimal plaintext metadata only (deadline dates for reminders).

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

/* -------------------------------------------------------------------------- */
/* profiles — crypto envelope + plaintext deadline exception (§3)             */
/* -------------------------------------------------------------------------- */

CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,

    -- KDF (plaintext on server; required for login/prelogin)
    kdf_salt BYTEA NOT NULL,
    kdf_params JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- DEK wrapped by passphrase-derived encKey and recovery key
    wrapped_dek_passphrase BYTEA NOT NULL,
    wrapped_dek_passphrase_nonce BYTEA NOT NULL,
    wrapped_dek_recovery BYTEA NOT NULL,
    wrapped_dek_recovery_nonce BYTEA NOT NULL,

    -- Deliberate plaintext exception: enables server-side deadline reminder emails
    effective_date DATE,
    deadline_date DATE,

    -- Reminder preferences (no case content)
    reminder_prefs JSONB NOT NULL DEFAULT '{"enabled": true}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profiles_deadline_after_effective CHECK (
        effective_date IS NULL
        OR deadline_date IS NULL
        OR deadline_date >= effective_date
    ),
    CONSTRAINT profiles_kdf_salt_length CHECK (octet_length(kdf_salt) >= 16),
    CONSTRAINT profiles_wrapped_dek_passphrase_nonce_length CHECK (octet_length(wrapped_dek_passphrase_nonce) >= 12),
    CONSTRAINT profiles_wrapped_dek_recovery_nonce_length CHECK (octet_length(wrapped_dek_recovery_nonce) >= 12)
);

COMMENT ON TABLE public.profiles IS 'Per-user crypto envelope and plaintext deadline metadata for reminders. No case content.';
COMMENT ON COLUMN public.profiles.effective_date IS 'Plaintext dismissal effective date (§3 exception).';
COMMENT ON COLUMN public.profiles.deadline_date IS 'Plaintext derived lodging deadline for reminder emails (§3 exception).';
COMMENT ON COLUMN public.profiles.kdf_params IS 'Argon2id params, e.g. {"algorithm":"argon2id","memoryKiB":65536,"iterations":3,"parallelism":1}.';

CREATE INDEX profiles_deadline_reminders_idx
    ON public.profiles (deadline_date)
    WHERE deadline_date IS NOT NULL
      AND COALESCE((reminder_prefs ->> 'enabled')::boolean, true);

CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_delete_own ON public.profiles
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

/* -------------------------------------------------------------------------- */
/* case_blobs — encrypted CaseFile JSON (one active blob per user, LWW)       */
/* -------------------------------------------------------------------------- */

CREATE TABLE public.case_blobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

    ciphertext BYTEA NOT NULL,
    nonce BYTEA NOT NULL,

    schema_version INTEGER NOT NULL DEFAULT 1,
    byte_size BIGINT NOT NULL GENERATED ALWAYS AS (octet_length(ciphertext)) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT case_blobs_user_unique UNIQUE (user_id),
    CONSTRAINT case_blobs_schema_version_positive CHECK (schema_version > 0),
    CONSTRAINT case_blobs_nonce_length CHECK (octet_length(nonce) >= 12),
    CONSTRAINT case_blobs_ciphertext_not_empty CHECK (octet_length(ciphertext) > 0)
);

COMMENT ON TABLE public.case_blobs IS 'AEAD-encrypted serialised CaseFile. Opaque to the server.';

CREATE INDEX case_blobs_user_updated_idx ON public.case_blobs (user_id, updated_at DESC);

CREATE TRIGGER case_blobs_set_updated_at
    BEFORE UPDATE ON public.case_blobs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.case_blobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY case_blobs_select_own ON public.case_blobs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY case_blobs_insert_own ON public.case_blobs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY case_blobs_update_own ON public.case_blobs
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY case_blobs_delete_own ON public.case_blobs
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

/* -------------------------------------------------------------------------- */
/* files — encrypted document metadata (bytes live in Storage)                */
/* -------------------------------------------------------------------------- */

CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

    -- Maps to Evidence.fileRef in the local IndexedDB store
    local_ref TEXT NOT NULL,

    -- Object key inside the case-files bucket: {user_id}/{local_ref}
    storage_path TEXT NOT NULL,

    nonce BYTEA NOT NULL,
    byte_size BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT files_user_local_ref_unique UNIQUE (user_id, local_ref),
    CONSTRAINT files_user_storage_path_unique UNIQUE (user_id, storage_path),
    CONSTRAINT files_byte_size_non_negative CHECK (byte_size >= 0),
    CONSTRAINT files_nonce_length CHECK (octet_length(nonce) >= 12)
);

COMMENT ON TABLE public.files IS 'Encrypted file index. Ciphertext bytes stored in Storage bucket case-files.';

CREATE INDEX files_user_updated_idx ON public.files (user_id, updated_at DESC);

CREATE TRIGGER files_set_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY files_select_own ON public.files
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY files_insert_own ON public.files
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY files_update_own ON public.files
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY files_delete_own ON public.files
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

/* -------------------------------------------------------------------------- */
/* Storage — encrypted file bytes only                                        */
/* -------------------------------------------------------------------------- */

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'case-files',
    'case-files',
    false,
    52428800, -- 50 MiB per file
    NULL
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY case_files_select_own ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'case-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY case_files_insert_own ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'case-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY case_files_update_own ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'case-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'case-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY case_files_delete_own ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'case-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

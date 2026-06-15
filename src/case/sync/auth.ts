import {
    authHashToSupabasePassword,
    createSignupBundle,
    deriveMasterKey,
    deriveSubkeys,
    rewrapForNewPassphrase,
    unlockWithPassphrase,
    unlockWithRecoveryKey,
    type SignupCryptoBundle,
} from "@/case/crypto";
import { base64ToBytes } from "@/case/crypto/bytes";
import type { KdfParams } from "@/case/crypto/types";
import type { CaseFile } from "@/case/types";
import { getSupabaseClient } from "@/case/sync/client";
import { deadlineMetadataFromCase } from "@/case/sync/deadline-metadata";
import { pgByteaToBytes } from "@/case/sync/encoding";
import { fetchPreloginKdf } from "@/case/sync/prelogin";
import { profileInsertFromSignup, profileUpdateFromRewrap } from "@/case/sync/profile";
import { clearSyncSession, getSyncDek, setSyncSession } from "@/case/sync/session";
import { fetchRecoveryWrappedDek, submitRecoveryReset, RecoveryError } from "@/case/sync/recovery";
import { getSupabaseConfig } from "@/config/supabase";
import type { User } from "@supabase/supabase-js";

export class SyncAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SyncAuthError";
    }
}

export interface SignUpResult {
    user: User;
    recoveryKey: string;
    bundle: SignupCryptoBundle;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function assertPassphrase(passphrase: string): void {
    if (passphrase.length < 8) {
        throw new SyncAuthError("Use a passphrase of at least 8 characters.");
    }
}

async function deriveAuthHash(passphrase: string, salt: Uint8Array, kdfParams: KdfParams): Promise<Uint8Array> {
    const masterKey = await deriveMasterKey(passphrase, salt, kdfParams);
    const { authHash } = await deriveSubkeys(masterKey);
    return authHash;
}

async function loadWrappedDek(userId: string): Promise<{
    salt: Uint8Array;
    kdfParams: KdfParams;
    wrapped: { ciphertext: Uint8Array; nonce: Uint8Array };
}> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("kdf_salt, kdf_params, wrapped_dek_passphrase, wrapped_dek_passphrase_nonce")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        throw new SyncAuthError("Could not load your encryption profile.");
    }

    return {
        salt: pgByteaToBytes(data.kdf_salt as string),
        kdfParams: data.kdf_params as KdfParams,
        wrapped: {
            ciphertext: pgByteaToBytes(data.wrapped_dek_passphrase as string),
            nonce: pgByteaToBytes(data.wrapped_dek_passphrase_nonce as string),
        },
    };
}

/** Create account: one passphrase → auth hash for Supabase + wrapped DEK profile row. */
export async function signUpWithPassphrase(email: string, passphrase: string, caseFile: CaseFile): Promise<SignUpResult> {
    assertPassphrase(passphrase);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes("@")) {
        throw new SyncAuthError("Enter a valid email address.");
    }

    const bundle = await createSignupBundle(passphrase);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: authHashToSupabasePassword(bundle.authHash),
    });

    if (error) {
        throw new SyncAuthError(error.message);
    }
    if (!data.user) {
        throw new SyncAuthError("Sign-up did not return a user.");
    }

    const profile = profileInsertFromSignup(data.user.id, bundle, deadlineMetadataFromCase(caseFile));
    const { error: profileError } = await supabase.from("profiles").upsert(profile);

    if (profileError) {
        await supabase.auth.signOut();
        clearSyncSession();
        throw new SyncAuthError(profileError.message);
    }

    setSyncSession(data.user.id, bundle.dek);
    return { user: data.user, recoveryKey: bundle.recoveryKey, bundle };
}

/** Sign in: prelogin → derive auth hash → Supabase auth → unwrap DEK. */
export async function signInWithPassphrase(email: string, passphrase: string): Promise<User> {
    assertPassphrase(passphrase);
    const normalizedEmail = normalizeEmail(email);
    const config = getSupabaseConfig();
    if (!config) {
        throw new SyncAuthError("Encrypted sync is not configured on this deployment.");
    }

    const prelogin = await fetchPreloginKdf(config.url, normalizedEmail, config.anonKey);
    if (!prelogin.exists) {
        throw new SyncAuthError("No sync account found for that email.");
    }

    const salt = base64ToBytes(prelogin.kdfSalt);
    const authHash = await deriveAuthHash(passphrase, salt, prelogin.kdfParams);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: authHashToSupabasePassword(authHash),
    });

    if (error) {
        throw new SyncAuthError(
            error.message === "Invalid login credentials" ? "Incorrect email or passphrase." : error.message,
        );
    }
    if (!data.user) {
        throw new SyncAuthError("Sign-in did not return a user.");
    }

    const wrapped = await loadWrappedDek(data.user.id);
    const session = await unlockWithPassphrase(passphrase, wrapped.salt, wrapped.kdfParams, wrapped.wrapped);
    setSyncSession(data.user.id, session.dek);
    return data.user;
}

export async function signOutSync(): Promise<void> {
    clearSyncSession();
    try {
        await getSupabaseClient().auth.signOut();
    } catch {
        /* offline sign-out still clears local session */
    }
}

export async function getCurrentSyncUser(): Promise<User | null> {
    const { data } = await getSupabaseClient().auth.getUser();
    return data.user ?? null;
}

/** Change sync passphrase: re-wrap DEK only, update profile + Supabase auth password. */
export async function changeSyncPassphrase(
    email: string,
    currentPassphrase: string,
    newPassphrase: string,
): Promise<void> {
    assertPassphrase(currentPassphrase);
    assertPassphrase(newPassphrase);

    const supabase = getSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new SyncAuthError("Sign in to change your passphrase.");
    }
    if (user.email && normalizeEmail(email) !== normalizeEmail(user.email)) {
        throw new SyncAuthError("Email does not match signed-in account.");
    }

    const wrapped = await loadWrappedDek(user.id);
    let dek = getSyncDek();

    try {
        const unlock = await unlockWithPassphrase(currentPassphrase, wrapped.salt, wrapped.kdfParams, wrapped.wrapped);
        dek = unlock.dek;
    } catch {
        throw new SyncAuthError("Current passphrase is incorrect.");
    }

    const rewrap = await rewrapForNewPassphrase(dek, newPassphrase);
    const profileUpdate = profileUpdateFromRewrap(rewrap);

    const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("user_id", user.id);
    if (profileError) {
        throw new SyncAuthError(profileError.message);
    }

    const { error: authError } = await supabase.auth.updateUser({
        password: authHashToSupabasePassword(rewrap.authHash),
    });
    if (authError) {
        throw new SyncAuthError(authError.message);
    }

    setSyncSession(user.id, dek);
}

/** Forgot passphrase: verify recovery key, set new passphrase, sign in. */
export async function recoverSyncPassphrase(email: string, recoveryKey: string, newPassphrase: string): Promise<User> {
    assertPassphrase(newPassphrase);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail.includes("@")) {
        throw new SyncAuthError("Enter a valid email address.");
    }

    const prelogin = await fetchRecoveryWrappedDek(normalizedEmail);
    if (!prelogin.exists) {
        throw new SyncAuthError("No sync account found for that email.");
    }

    let dek: Uint8Array;
    try {
        dek = await unlockWithRecoveryKey(recoveryKey, {
            ciphertext: base64ToBytes(prelogin.wrappedDekRecovery),
            nonce: base64ToBytes(prelogin.wrappedDekRecoveryNonce),
        });
    } catch {
        throw new SyncAuthError("Recovery key is incorrect.");
    }

    const rewrap = await rewrapForNewPassphrase(dek, newPassphrase);

    try {
        await submitRecoveryReset(normalizedEmail, recoveryKey, rewrap);
    } catch (error) {
        if (error instanceof RecoveryError) {
            throw new SyncAuthError(error.message);
        }
        throw error;
    }

    return signInWithPassphrase(normalizedEmail, newPassphrase);
}

export { getSyncDek, RecoveryError };

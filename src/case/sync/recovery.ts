import { authHashToSupabasePassword } from "@/case/crypto";
import type { PassphraseRewrap } from "@/case/crypto/types";
import { profileUpdateFromRewrap } from "@/case/sync/profile";
import { getSupabaseConfig } from "@/config/supabase";

export class RecoveryError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "RecoveryError";
    }
}

export interface RecoveryPreloginSuccess {
    exists: true;
    wrappedDekRecovery: string;
    wrappedDekRecoveryNonce: string;
}

export interface RecoveryPreloginMissing {
    exists: false;
}

export type RecoveryPreloginResponse = RecoveryPreloginSuccess | RecoveryPreloginMissing;

export async function fetchRecoveryWrappedDek(email: string): Promise<RecoveryPreloginResponse> {
    const config = getSupabaseConfig();
    if (!config) {
        throw new RecoveryError("Encrypted sync is not configured on this deployment.", 500);
    }

    const url = `${config.url.replace(/\/$/, "")}/functions/v1/recovery-prelogin`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.anonKey}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const body = (await res.json()) as RecoveryPreloginResponse | { error?: string };
    if (!res.ok) {
        const message = "error" in body && typeof body.error === "string" ? body.error : "Recovery lookup failed";
        throw new RecoveryError(message, res.status);
    }

    if ("exists" in body && body.exists === false) {
        return { exists: false };
    }

    if ("exists" in body && body.exists === true && body.wrappedDekRecovery && body.wrappedDekRecoveryNonce) {
        return body as RecoveryPreloginSuccess;
    }

    throw new RecoveryError("Unexpected recovery response", res.status);
}

export async function submitRecoveryReset(
    email: string,
    recoveryKey: string,
    rewrap: PassphraseRewrap,
): Promise<void> {
    const config = getSupabaseConfig();
    if (!config) {
        throw new RecoveryError("Encrypted sync is not configured on this deployment.", 500);
    }

    const profileUpdate = profileUpdateFromRewrap(rewrap);

    const url = `${config.url.replace(/\/$/, "")}/functions/v1/recovery-reset`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.anonKey}`,
        },
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            recoveryKey: recoveryKey.trim(),
            authHashPassword: authHashToSupabasePassword(rewrap.authHash),
            kdfSalt: profileUpdate.kdf_salt,
            kdfParams: profileUpdate.kdf_params,
            wrappedDekPassphrase: profileUpdate.wrapped_dek_passphrase,
            wrappedDekPassphraseNonce: profileUpdate.wrapped_dek_passphrase_nonce,
        }),
    });

    const body = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) {
        throw new RecoveryError(body.error ?? "Recovery reset failed", res.status);
    }
}

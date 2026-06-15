import type { PassphraseRewrap } from "@/case/crypto/types";
import type { SignupCryptoBundle } from "@/case/crypto/types";
import { bytesToPgBytea } from "@/case/sync/encoding";
import type { DeadlineMetadata } from "@/case/sync/deadline-metadata";

export interface ProfileInsert {
    user_id: string;
    kdf_salt: string;
    kdf_params: SignupCryptoBundle["kdfParams"];
    wrapped_dek_passphrase: string;
    wrapped_dek_passphrase_nonce: string;
    wrapped_dek_recovery: string;
    wrapped_dek_recovery_nonce: string;
    effective_date: string | null;
    deadline_date: string | null;
}

export function profileInsertFromSignup(
    userId: string,
    bundle: SignupCryptoBundle,
    deadlines: DeadlineMetadata,
): ProfileInsert {
    return {
        user_id: userId,
        kdf_salt: bytesToPgBytea(bundle.salt),
        kdf_params: bundle.kdfParams,
        wrapped_dek_passphrase: bytesToPgBytea(bundle.wrappedDekPassphrase.ciphertext),
        wrapped_dek_passphrase_nonce: bytesToPgBytea(bundle.wrappedDekPassphrase.nonce),
        wrapped_dek_recovery: bytesToPgBytea(bundle.wrappedDekRecovery.ciphertext),
        wrapped_dek_recovery_nonce: bytesToPgBytea(bundle.wrappedDekRecovery.nonce),
        effective_date: deadlines.effective_date,
        deadline_date: deadlines.deadline_date,
    };
}

/** Profile crypto fields updated on passphrase change (recovery-wrapped DEK unchanged). */
export function profileUpdateFromRewrap(rewrap: PassphraseRewrap): {
    kdf_salt: string;
    kdf_params: PassphraseRewrap["kdfParams"];
    wrapped_dek_passphrase: string;
    wrapped_dek_passphrase_nonce: string;
} {
    return {
        kdf_salt: bytesToPgBytea(rewrap.salt),
        kdf_params: rewrap.kdfParams,
        wrapped_dek_passphrase: bytesToPgBytea(rewrap.wrappedDekPassphrase.ciphertext),
        wrapped_dek_passphrase_nonce: bytesToPgBytea(rewrap.wrappedDekPassphrase.nonce),
    };
}

import { encryptBytes, decryptBytes } from "@/case/crypto/aead";
import { base64UrlEncode, randomBytes } from "@/case/crypto/bytes";
import {
    authHashToSupabasePassword,
    deriveMasterKey,
    deriveRecoveryEncKey,
    deriveSubkeys,
    generateSalt,
    getDefaultKdfParams,
} from "@/case/crypto/kdf";
import type { AeadCiphertext, PassphraseRewrap, PassphraseUnlock, SignupCryptoBundle } from "@/case/crypto/types";
import type { KdfParams } from "@/case/crypto/types";

export const DEK_LENGTH = 32;
const RECOVERY_KEY_BYTES = 24;

export function generateDek(): Uint8Array {
    return randomBytes(DEK_LENGTH);
}

/** High-entropy recovery secret (base64url) shown once at signup. */
export function generateRecoveryKey(): string {
    return base64UrlEncode(randomBytes(RECOVERY_KEY_BYTES));
}

export async function wrapKey(key: Uint8Array, wrappingKey: Uint8Array): Promise<AeadCiphertext> {
    return encryptBytes(key, wrappingKey);
}

export async function unwrapKey(bundle: AeadCiphertext, wrappingKey: Uint8Array): Promise<Uint8Array> {
    const unwrapped = await decryptBytes(bundle, wrappingKey);
    if (unwrapped.length !== DEK_LENGTH) {
        throw new Error("Unwrapped key has an unexpected length.");
    }
    return unwrapped;
}

/** Full signup crypto: salt, wrapped DEKs, auth hash, recovery key. */
export async function createSignupBundle(passphrase: string): Promise<SignupCryptoBundle> {
    const salt = generateSalt();
    const kdfParams = await getDefaultKdfParams();
    const masterKey = await deriveMasterKey(passphrase, salt, kdfParams);
    const { encKey, authHash } = await deriveSubkeys(masterKey);
    const dek = generateDek();
    const recoveryKey = generateRecoveryKey();
    const recoveryEncKey = await deriveRecoveryEncKey(recoveryKey);

    const [wrappedDekPassphrase, wrappedDekRecovery] = await Promise.all([
        wrapKey(dek, encKey),
        wrapKey(dek, recoveryEncKey),
    ]);

    return {
        salt,
        kdfParams,
        dek,
        encKey,
        authHash,
        wrappedDekPassphrase,
        recoveryKey,
        wrappedDekRecovery,
    };
}

export async function unlockWithPassphrase(
    passphrase: string,
    salt: Uint8Array,
    kdfParams: KdfParams,
    wrappedDekPassphrase: AeadCiphertext,
): Promise<PassphraseUnlock> {
    const masterKey = await deriveMasterKey(passphrase, salt, kdfParams);
    const { encKey, authHash } = await deriveSubkeys(masterKey);
    const dek = await unwrapKey(wrappedDekPassphrase, encKey);
    return { dek, encKey, authHash };
}

export async function unlockWithRecoveryKey(
    recoveryKey: string,
    wrappedDekRecovery: AeadCiphertext,
): Promise<Uint8Array> {
    const recoveryEncKey = await deriveRecoveryEncKey(recoveryKey);
    return unwrapKey(wrappedDekRecovery, recoveryEncKey);
}

/** Passphrase change: new salt, re-wrap DEK only (no payload re-encryption). */
export async function rewrapForNewPassphrase(dek: Uint8Array, newPassphrase: string): Promise<PassphraseRewrap> {
    const salt = generateSalt();
    const kdfParams = await getDefaultKdfParams();
    const masterKey = await deriveMasterKey(newPassphrase, salt, kdfParams);
    const { encKey, authHash } = await deriveSubkeys(masterKey);
    const wrappedDekPassphrase = await wrapKey(dek, encKey);
    return { salt, kdfParams, encKey, authHash, wrappedDekPassphrase };
}

export { authHashToSupabasePassword };

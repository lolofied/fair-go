import { base64UrlEncode, randomBytes, toArrayBuffer } from "@/case/crypto/bytes";
import { getSodium } from "@/case/crypto/sodium";
import type { KdfParams } from "@/case/crypto/types";

export const DEFAULT_KDF_OUTPUT_LENGTH = 32;

const HKDF_ENC_INFO = new TextEncoder().encode("fairgo/enc/v1");
const HKDF_AUTH_INFO = new TextEncoder().encode("fairgo/auth/v1");
export const HKDF_RECOVERY_ENC_INFO = new TextEncoder().encode("fairgo/recovery-enc/v1");

/** Default Argon2id cost profile (moderate ops, 64 MiB memory). */
export async function getDefaultKdfParams(): Promise<KdfParams> {
    const sodium = await getSodium();
    return {
        algorithm: "argon2id",
        opsLimit: sodium.crypto_pwhash_OPSLIMIT_MODERATE,
        memLimit: sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        outputLength: DEFAULT_KDF_OUTPUT_LENGTH,
    };
}

export function generateSalt(): Uint8Array {
    return randomBytes(16);
}

async function hkdfExpand(masterKey: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey("raw", toArrayBuffer(masterKey), "HKDF", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
        { name: "HKDF", hash: "SHA-256", salt: toArrayBuffer(new Uint8Array(0)), info: toArrayBuffer(info) },
        keyMaterial,
        length * 8,
    );
    return new Uint8Array(bits);
}

/** Argon2id(passphrase, salt) → 32-byte master key. */
export async function deriveMasterKey(passphrase: string, salt: Uint8Array, params: KdfParams): Promise<Uint8Array> {
    const sodium = await getSodium();
    if (salt.length < sodium.crypto_pwhash_SALTBYTES) {
        throw new Error("KDF salt is too short.");
    }

    return sodium.crypto_pwhash(
        params.outputLength,
        passphrase,
        salt,
        params.opsLimit,
        params.memLimit,
        sodium.crypto_pwhash_ALG_ARGON2ID13,
    );
}

/** HKDF sub-keys for wrapping the DEK and authenticating to Supabase. */
export async function deriveSubkeys(masterKey: Uint8Array): Promise<{ encKey: Uint8Array; authHash: Uint8Array }> {
    const [encKey, authHash] = await Promise.all([
        hkdfExpand(masterKey, HKDF_ENC_INFO, DEFAULT_KDF_OUTPUT_LENGTH),
        hkdfExpand(masterKey, HKDF_AUTH_INFO, DEFAULT_KDF_OUTPUT_LENGTH),
    ]);
    return { encKey, authHash };
}

/** Supabase Auth password: derived auth hash, never the user's passphrase. */
export function authHashToSupabasePassword(authHash: Uint8Array): string {
    return base64UrlEncode(authHash);
}

/** Recovery sub-key from the high-entropy recovery secret. */
export async function deriveRecoveryEncKey(recoveryKey: string): Promise<Uint8Array> {
    const ikm = new TextEncoder().encode(recoveryKey.trim());
    return hkdfExpand(ikm, HKDF_RECOVERY_ENC_INFO, DEFAULT_KDF_OUTPUT_LENGTH);
}

import { randomBytes } from "@/case/crypto/bytes";
import { getSodium } from "@/case/crypto/sodium";
import type { AeadCiphertext } from "@/case/crypto/types";

const EMPTY_AAD = new Uint8Array(0);

/** XChaCha20-Poly1305 encrypt. Key must be 32 bytes. */
export async function encryptBytes(plaintext: Uint8Array, key: Uint8Array): Promise<AeadCiphertext> {
    const sodium = await getSodium();
    const nonce = randomBytes(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, EMPTY_AAD, null, nonce, key);
    return { ciphertext, nonce };
}

/** XChaCha20-Poly1305 decrypt. Throws on auth failure. */
export async function decryptBytes(bundle: AeadCiphertext, key: Uint8Array): Promise<Uint8Array> {
    const sodium = await getSodium();
    try {
        return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, bundle.ciphertext, EMPTY_AAD, bundle.nonce, key);
    } catch {
        throw new Error("Decryption failed. The key or ciphertext may be wrong.");
    }
}

export async function encryptJson(value: unknown, key: Uint8Array): Promise<AeadCiphertext> {
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    return encryptBytes(plaintext, key);
}

export async function decryptJson<T>(bundle: AeadCiphertext, key: Uint8Array): Promise<T> {
    const plaintext = await decryptBytes(bundle, key);
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

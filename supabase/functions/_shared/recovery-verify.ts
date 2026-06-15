import _sodium from "https://esm.sh/libsodium-wrappers-sumo@0.8.4";

const RECOVERY_ENC_INFO = new TextEncoder().encode("fairgo/recovery-enc/v1");

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
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

function base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

/** Returns true when the recovery key unwraps the stored recovery DEK envelope. */
export async function verifyRecoveryKey(
    recoveryKey: string,
    wrappedB64: string,
    nonceB64: string,
): Promise<boolean> {
    await _sodium.ready;
    const sodium = _sodium;

    try {
        const ikm = new TextEncoder().encode(recoveryKey.trim());
        const encKey = await hkdfExpand(ikm, RECOVERY_ENC_INFO, 32);
        sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null,
            base64ToBytes(wrappedB64),
            new Uint8Array(0),
            base64ToBytes(nonceB64),
            encKey,
        );
        return true;
    } catch {
        return false;
    }
}

import { base64ToBytes, bytesToBase64 } from "@/case/crypto/bytes";

/** Encode bytes for Postgres `bytea` columns via PostgREST. */
export function bytesToPgBytea(bytes: Uint8Array): string {
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `\\x${hex}`;
}

/** Decode `bytea` values returned by Supabase (hex or base64). */
export function pgByteaToBytes(value: string): Uint8Array {
    if (value.startsWith("\\x")) {
        const hex = value.slice(2);
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0; i < out.length; i++) {
            out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return out;
    }
    return base64ToBytes(value);
}

export function pgByteaToBase64(value: string): string {
    return bytesToBase64(pgByteaToBytes(value));
}

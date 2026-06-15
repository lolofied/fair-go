import { describe, expect, it } from "vitest";
import {
    authHashToSupabasePassword,
    createSignupBundle,
    decryptBytes,
    decryptJson,
    encryptBytes,
    encryptJson,
    rewrapForNewPassphrase,
    unlockWithPassphrase,
    unlockWithRecoveryKey,
} from "@/case/crypto";
import { bytesToBase64 } from "@/case/crypto/bytes";

describe("crypto / signup bundle", () => {
    it("derives distinct enc and auth sub-keys", async () => {
        const bundle = await createSignupBundle("correct horse battery staple");
        expect(bundle.encKey).not.toEqual(bundle.authHash);
        expect(bundle.dek).toHaveLength(32);
        expect(bundle.recoveryKey.length).toBeGreaterThan(20);
    });

    it("produces a stable Supabase auth password from the auth hash", async () => {
        const bundle = await createSignupBundle("test-passphrase");
        const password = authHashToSupabasePassword(bundle.authHash);
        expect(password).not.toContain("test-passphrase");
        expect(password).toMatch(/^[A-Za-z0-9_-]+$/);
    });
});

describe("crypto / DEK wrap and unwrap", () => {
    it("unwraps the DEK with the passphrase", async () => {
        const signup = await createSignupBundle("session-passphrase");
        const unlock = await unlockWithPassphrase(
            "session-passphrase",
            signup.salt,
            signup.kdfParams,
            signup.wrappedDekPassphrase,
        );
        expect(unlock.dek).toEqual(signup.dek);
    });

    it("unwraps the DEK with the recovery key", async () => {
        const signup = await createSignupBundle("session-passphrase");
        const dek = await unlockWithRecoveryKey(signup.recoveryKey, signup.wrappedDekRecovery);
        expect(dek).toEqual(signup.dek);
    });

    it("re-wraps the DEK on passphrase change without changing the DEK", async () => {
        const signup = await createSignupBundle("old-passphrase");
        const rewrap = await rewrapForNewPassphrase(signup.dek, "new-passphrase");

        const oldUnlock = await unlockWithPassphrase(
            "old-passphrase",
            signup.salt,
            signup.kdfParams,
            signup.wrappedDekPassphrase,
        );
        const newUnlock = await unlockWithPassphrase(
            "new-passphrase",
            rewrap.salt,
            rewrap.kdfParams,
            rewrap.wrappedDekPassphrase,
        );

        expect(oldUnlock.dek).toEqual(signup.dek);
        expect(newUnlock.dek).toEqual(signup.dek);
        expect(newUnlock.authHash).not.toEqual(oldUnlock.authHash);
    });
});

describe("crypto / AEAD payload", () => {
    it("round-trips JSON through encrypt and decrypt", async () => {
        const signup = await createSignupBundle("payload-passphrase");
        const payload = { events: [{ id: "e1", note: "pip issued" }] };
        const encrypted = await encryptJson(payload, signup.dek);
        const restored = await decryptJson<typeof payload>(encrypted, signup.dek);
        expect(restored).toEqual(payload);
    });

    it("fails decryption with the wrong DEK", async () => {
        const a = await createSignupBundle("one");
        const b = await createSignupBundle("two");
        const encrypted = await encryptBytes(new TextEncoder().encode("secret"), a.dek);
        await expect(decryptBytes(encrypted, b.dek)).rejects.toThrow(/decryption failed/i);
    });

    it("serialises to base64 for Supabase rows", async () => {
        const signup = await createSignupBundle("sync-passphrase");
        const encrypted = await encryptJson({ ok: true }, signup.dek);
        expect(bytesToBase64(encrypted.nonce).length).toBeGreaterThan(0);
        expect(bytesToBase64(encrypted.ciphertext).length).toBeGreaterThan(0);
    });
});

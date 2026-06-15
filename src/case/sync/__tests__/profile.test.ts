import { describe, expect, it } from "vitest";
import { rewrapForNewPassphrase } from "@/case/crypto";
import { createSignupBundle } from "@/case/crypto";
import { pgByteaToBytes } from "@/case/sync/encoding";
import { profileInsertFromSignup, profileUpdateFromRewrap } from "@/case/sync/profile";

describe("profileUpdateFromRewrap", () => {
    it("maps rewrap fields to pg bytea profile columns", async () => {
        const signup = await createSignupBundle("old-passphrase");
        const rewrap = await rewrapForNewPassphrase(signup.dek, "new-passphrase");

        const update = profileUpdateFromRewrap(rewrap);

        expect(update.kdf_salt.startsWith("\\x")).toBe(true);
        expect(update.kdf_params).toEqual(rewrap.kdfParams);
        expect(pgByteaToBytes(update.wrapped_dek_passphrase)).toEqual(rewrap.wrappedDekPassphrase.ciphertext);
        expect(pgByteaToBytes(update.wrapped_dek_passphrase_nonce)).toEqual(rewrap.wrappedDekPassphrase.nonce);
    });

    it("does not include recovery-wrapped DEK fields", async () => {
        const signup = await createSignupBundle("passphrase");
        const rewrap = await rewrapForNewPassphrase(signup.dek, "next-passphrase");
        const insert = profileInsertFromSignup("user-1", signup, { effective_date: null, deadline_date: null });
        const update = profileUpdateFromRewrap(rewrap);

        expect(update).not.toHaveProperty("wrapped_dek_recovery");
        expect(update).not.toHaveProperty("wrapped_dek_recovery_nonce");
        expect(insert.wrapped_dek_recovery).toBeTruthy();
    });
});

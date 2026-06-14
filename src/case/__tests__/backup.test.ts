import { describe, expect, it } from "vitest";
import { decryptPayload, encryptPayload } from "@/case/backup";

describe("encrypted backup round-trip", () => {
    it("decrypts what it encrypts with the right passphrase", async () => {
        const payload = { hello: "world", events: [{ id: "e1", n: 42 }] };
        const envelope = await encryptPayload(payload, "correct horse battery staple");

        expect(envelope.format).toBe("fairgo-case-backup");
        expect(envelope.cipherB64).not.toContain("world");

        const restored = await decryptPayload<typeof payload>(envelope, "correct horse battery staple");
        expect(restored).toEqual(payload);
    });

    it("fails with a clear error on the wrong passphrase", async () => {
        const envelope = await encryptPayload({ secret: true }, "right-passphrase");
        await expect(decryptPayload(envelope, "wrong-passphrase")).rejects.toThrow(/could not decrypt/i);
    });
});

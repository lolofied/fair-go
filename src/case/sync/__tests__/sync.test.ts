import { describe, expect, it } from "vitest";
import { deadlineDateForDays } from "@/checker/logic";
import { getLegalConstants } from "@/config/legal-constants";
import { bytesToPgBytea, pgByteaToBytes } from "@/case/sync/encoding";
import { deadlineMetadataFromCase } from "@/case/sync/deadline-metadata";
import { profileInsertFromSignup } from "@/case/sync/profile";
import { createSignupBundle } from "@/case/crypto";
import type { CaseFile } from "@/case/types";

describe("sync encoding", () => {
    it("round-trips bytes through pg bytea hex", () => {
        const original = new Uint8Array([0, 1, 2, 255]);
        expect(pgByteaToBytes(bytesToPgBytea(original))).toEqual(original);
    });
});

describe("deadline metadata", () => {
    it("derives effective and deadline dates from the case profile", () => {
        const file = {
            profile: {
                dismissal: { effective_date: "2025-06-01" },
            },
        } as CaseFile;

        const meta = deadlineMetadataFromCase(file);
        const expectedDeadline = deadlineDateForDays(
            "2025-06-01",
            getLegalConstants(new Date("2025-06-01")).timeLimits.unfairDismissalDays,
        );
        expect(meta.effective_date).toBe("2025-06-01");
        expect(meta.deadline_date).toBe(
            expectedDeadline
                ? `${expectedDeadline.getFullYear()}-${String(expectedDeadline.getMonth() + 1).padStart(2, "0")}-${String(expectedDeadline.getDate()).padStart(2, "0")}`
                : null,
        );
    });

    it("returns nulls when there is no dismissal date", () => {
        const file = { profile: { dismissal: {} } } as CaseFile;
        expect(deadlineMetadataFromCase(file)).toEqual({
            effective_date: null,
            deadline_date: null,
        });
    });
});

describe("profile insert", () => {
    it("maps signup crypto material to a profiles row shape", async () => {
        const bundle = await createSignupBundle("test-passphrase-123");
        const row = profileInsertFromSignup("user-123", bundle, {
            effective_date: "2025-06-01",
            deadline_date: "2025-06-22",
        });

        expect(row.user_id).toBe("user-123");
        expect(row.kdf_params.algorithm).toBe("argon2id");
        expect(row.kdf_salt.startsWith("\\x")).toBe(true);
        expect(row.wrapped_dek_passphrase.startsWith("\\x")).toBe(true);
    });
});

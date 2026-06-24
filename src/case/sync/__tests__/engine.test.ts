import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveOnLogin } from "@/case/sync/engine";
import type { CaseFile } from "@/case/types";

const mocks = vi.hoisted(() => ({
    decryptJson: vi.fn(),
    encryptJson: vi.fn(),
    selectRemoteCase: vi.fn(),
    selectFiles: vi.fn(),
    updateProfile: vi.fn(),
    upsertCaseBlob: vi.fn(),
}));

vi.mock("@/case/crypto", () => ({
    decryptBytes: vi.fn(),
    decryptJson: mocks.decryptJson,
    encryptBytes: vi.fn(),
    encryptJson: mocks.encryptJson,
}));

vi.mock("@/case/storage", () => ({
    deleteFile: vi.fn(),
    getAllFiles: vi.fn(() => Promise.resolve({})),
    getFile: vi.fn(() => Promise.resolve(null)),
    putFile: vi.fn(),
    saveCaseFile: vi.fn(),
}));

vi.mock("@/case/sync/client", () => ({
    getSupabaseClient: () => ({
        from: (table: string) => {
            if (table === "case_blobs") {
                return {
                    select: () => ({ eq: () => ({ maybeSingle: mocks.selectRemoteCase }) }),
                    upsert: mocks.upsertCaseBlob,
                };
            }

            if (table === "files") {
                return {
                    delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
                    select: () => ({ eq: mocks.selectFiles }),
                    upsert: vi.fn(() => ({ error: null })),
                };
            }

            if (table === "profiles") {
                return {
                    update: () => ({ eq: mocks.updateProfile }),
                };
            }

            throw new Error(`Unexpected table: ${table}`);
        },
        storage: {
            from: () => ({
                download: vi.fn(),
                remove: vi.fn(() => Promise.resolve({ error: null })),
                upload: vi.fn(() => Promise.resolve({ error: null })),
            }),
        },
    }),
}));

function caseFile(updatedAt: string): CaseFile {
    return {
        profile: {
            employee: {},
            employer: {},
            dismissal: {},
            candidateClaims: [],
            flags: [],
        },
        events: [],
        documents: [],
        witnesses: [],
        meta: {
            createdAt: "2025-06-01T00:00:00.000Z",
            updatedAt,
            schemaVersion: 1,
            seededFromChecker: false,
        },
    } as unknown as CaseFile;
}

describe("sync engine", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.selectRemoteCase.mockResolvedValue({
            data: {
                ciphertext: "\\x01",
                nonce: "\\x000102030405060708090a0b",
                updated_at: "2025-06-01T12:00:00.000Z",
            },
            error: null,
        });
        mocks.selectFiles.mockResolvedValue({ data: [], error: null });
        mocks.updateProfile.mockResolvedValue({ error: null });
        mocks.upsertCaseBlob.mockResolvedValue({ error: null });
        mocks.encryptJson.mockResolvedValue({
            ciphertext: new Uint8Array([7]),
            nonce: new Uint8Array(12),
        });
    });

    it("prefers newer local content over an older remote case with a newer server row timestamp", async () => {
        const local = caseFile("2025-06-01T11:00:00.000Z");
        const remote = caseFile("2025-06-01T10:00:00.000Z");
        const dek = new Uint8Array(32);
        mocks.decryptJson.mockResolvedValue(remote);

        const result = await resolveOnLogin(local, dek, "user-123");

        expect(result).toEqual({ caseFile: local, applied: "local" });
        expect(mocks.encryptJson).toHaveBeenCalledWith(local, dek);
        expect(mocks.upsertCaseBlob).toHaveBeenCalledWith(
            expect.objectContaining({
                updated_at: local.meta.updatedAt,
                user_id: "user-123",
            }),
            { onConflict: "user_id" },
        );
    });
});

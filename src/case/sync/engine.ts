import { decryptBytes, decryptJson, encryptBytes, encryptJson } from "@/case/crypto";
import { toArrayBuffer } from "@/case/crypto/bytes";
import { CASE_SCHEMA_VERSION, type CaseFile } from "@/case/types";
import { deleteFile, getAllFiles, getFile, putFile, saveCaseFile } from "@/case/storage";
import { getSupabaseClient } from "@/case/sync/client";
import { CASE_FILES_BUCKET, caseFileStoragePath, type FileRow } from "@/case/sync/database.types";
import { deadlineMetadataFromCase } from "@/case/sync/deadline-metadata";
import { bytesToPgBytea, pgByteaToBytes } from "@/case/sync/encoding";
import { pickSyncWinner, shouldApplyRemote, shouldPushLocal } from "@/case/sync/lww";

export class SyncEngineError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SyncEngineError";
    }
}

export interface RemoteCaseSnapshot {
    caseFile: CaseFile;
    updatedAt: string;
    fileRows: FileRow[];
}

export interface ResolveOnLoginResult {
    caseFile: CaseFile;
    applied: "local" | "remote" | "none";
}

async function updateProfileDeadlines(userId: string, caseFile: CaseFile): Promise<void> {
    const deadlines = deadlineMetadataFromCase(caseFile);
    const { error } = await getSupabaseClient()
        .from("profiles")
        .update({
            effective_date: deadlines.effective_date,
            deadline_date: deadlines.deadline_date,
        })
        .eq("user_id", userId);

    if (error) {
        throw new SyncEngineError(error.message);
    }
}

async function upsertCaseBlob(userId: string, caseFile: CaseFile, dek: Uint8Array): Promise<void> {
    const encrypted = await encryptJson(caseFile, dek);
    const { error } = await getSupabaseClient()
        .from("case_blobs")
        .upsert(
            {
                user_id: userId,
                ciphertext: bytesToPgBytea(encrypted.ciphertext),
                nonce: bytesToPgBytea(encrypted.nonce),
                schema_version: caseFile.meta.schemaVersion ?? CASE_SCHEMA_VERSION,
                updated_at: caseFile.meta.updatedAt,
            },
            { onConflict: "user_id" },
        );

    if (error) {
        throw new SyncEngineError(error.message);
    }
}

async function syncFileRows(userId: string, caseFile: CaseFile, dek: Uint8Array): Promise<void> {
    const supabase = getSupabaseClient();
    const activeRefs = new Set(caseFile.documents.map((doc) => doc.fileRef));

    for (const doc of caseFile.documents) {
        const blob = await getFile(doc.fileRef);
        if (!blob) continue;

        const encrypted = await encryptBytes(new Uint8Array(await blob.arrayBuffer()), dek);
        const storagePath = caseFileStoragePath(userId, doc.fileRef);

        const { error: uploadError } = await supabase.storage
            .from(CASE_FILES_BUCKET)
            .upload(storagePath, encrypted.ciphertext, {
                upsert: true,
                contentType: "application/octet-stream",
            });

        if (uploadError) {
            throw new SyncEngineError(uploadError.message);
        }

        const { error: rowError } = await supabase.from("files").upsert(
            {
                user_id: userId,
                local_ref: doc.fileRef,
                storage_path: storagePath,
                nonce: bytesToPgBytea(encrypted.nonce),
                byte_size: encrypted.ciphertext.byteLength,
                updated_at: caseFile.meta.updatedAt,
            },
            { onConflict: "user_id,local_ref" },
        );

        if (rowError) {
            throw new SyncEngineError(rowError.message);
        }
    }

    const { data: remoteRows, error: listError } = await supabase.from("files").select("local_ref, storage_path").eq("user_id", userId);
    if (listError) {
        throw new SyncEngineError(listError.message);
    }

    for (const row of remoteRows ?? []) {
        if (activeRefs.has(row.local_ref)) continue;
        await supabase.storage.from(CASE_FILES_BUCKET).remove([row.storage_path]);
        await supabase.from("files").delete().eq("user_id", userId).eq("local_ref", row.local_ref);
    }
}

/** Push the local case blob, encrypted files, and plaintext deadline metadata. */
export async function pushLocalCase(caseFile: CaseFile, dek: Uint8Array, userId: string): Promise<void> {
    await upsertCaseBlob(userId, caseFile, dek);
    await syncFileRows(userId, caseFile, dek);
    await updateProfileDeadlines(userId, caseFile);
}

export async function fetchRemoteCase(dek: Uint8Array, userId: string): Promise<RemoteCaseSnapshot | null> {
    const supabase = getSupabaseClient();
    const { data: blobRow, error: blobError } = await supabase.from("case_blobs").select("*").eq("user_id", userId).maybeSingle();

    if (blobError) {
        throw new SyncEngineError(blobError.message);
    }
    if (!blobRow) return null;

    const caseFile = await decryptJson<CaseFile>(
        {
            ciphertext: pgByteaToBytes(blobRow.ciphertext as string),
            nonce: pgByteaToBytes(blobRow.nonce as string),
        },
        dek,
    );

    const { data: fileRows, error: filesError } = await supabase.from("files").select("*").eq("user_id", userId);
    if (filesError) {
        throw new SyncEngineError(filesError.message);
    }

    return {
        caseFile,
        updatedAt: blobRow.updated_at as string,
        fileRows: (fileRows ?? []) as FileRow[],
    };
}

async function downloadRemoteFiles(caseFile: CaseFile, dek: Uint8Array, fileRows: FileRow[]): Promise<void> {
    const supabase = getSupabaseClient();
    const activeRefs = new Set(caseFile.documents.map((doc) => doc.fileRef));
    const rowByRef = new Map(fileRows.map((row) => [row.local_ref, row]));

    for (const doc of caseFile.documents) {
        const row = rowByRef.get(doc.fileRef);
        if (!row) continue;

        const { data, error } = await supabase.storage.from(CASE_FILES_BUCKET).download(row.storage_path);
        if (error || !data) {
            throw new SyncEngineError(error?.message ?? "Could not download an encrypted file.");
        }

        const ciphertext = new Uint8Array(await data.arrayBuffer());
        const plain = await decryptBytes({ ciphertext, nonce: pgByteaToBytes(row.nonce as string) }, dek);
        await putFile(doc.fileRef, new Blob([toArrayBuffer(plain)], { type: doc.mimeType || "application/octet-stream" }));
    }

    const localFiles = await getAllFiles();
    for (const ref of Object.keys(localFiles)) {
        if (!activeRefs.has(ref)) {
            await deleteFile(ref);
        }
    }
}

/** Apply a remote snapshot to IndexedDB (case JSON + decrypted files). */
export async function applyRemoteCase(snapshot: RemoteCaseSnapshot, dek: Uint8Array): Promise<CaseFile> {
    await downloadRemoteFiles(snapshot.caseFile, dek, snapshot.fileRows);
    await saveCaseFile(snapshot.caseFile);
    return snapshot.caseFile;
}

/** LWW merge on login or unlock: push local, pull remote, or no-op. */
export async function resolveOnLogin(local: CaseFile, dek: Uint8Array, userId: string): Promise<ResolveOnLoginResult> {
    const remote = await fetchRemoteCase(dek, userId);

    if (!remote) {
        await pushLocalCase(local, dek, userId);
        return { caseFile: local, applied: "local" };
    }

    const winner = pickSyncWinner(local.meta.updatedAt, remote.updatedAt);

    if (shouldApplyRemote(winner)) {
        const caseFile = await applyRemoteCase(remote, dek);
        return { caseFile, applied: "remote" };
    }

    if (shouldPushLocal(winner)) {
        await pushLocalCase(local, dek, userId);
        return { caseFile: local, applied: winner === "tie" ? "none" : "local" };
    }

    return { caseFile: local, applied: "none" };
}

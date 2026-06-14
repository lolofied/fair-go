/**
 * Encrypted backup: the mandatory durability mitigation for a local-first tool.
 *
 * The case file plus every uploaded file is serialised, encrypted client-side
 * with a key derived from the user's passphrase (PBKDF2 -> AES-GCM), and written
 * out as a single file the user keeps. We never see the passphrase or the
 * plaintext. Lose the passphrase and the backup is unrecoverable, which the UI
 * states plainly.
 *
 * The pure encrypt/decrypt core is storage-independent so it can be tested in
 * isolation; `exportEncryptedBackup` / `restoreBackup` wire it to IndexedDB.
 */

import { getAllFiles, putFile, saveCaseFile } from "@/case/storage";
import type { CaseFile, EncryptedBackup } from "@/case/types";

const PBKDF2_ITERATIONS = 250_000;
const BACKUP_VERSION = 1;

interface BackupFile {
    name: string;
    type: string;
    dataB64: string;
}

export interface BackupPayload {
    caseFile: CaseFile;
    files: Record<string, BackupFile>;
}

/* ------------------------------ base64 helpers ------------------------------ */

function bytesToB64(bytes: Uint8Array): string {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

function b64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

/** A standalone ArrayBuffer view of some bytes, accepted everywhere as BufferSource. */
function ab(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/* -------------------------------- crypto core ------------------------------- */

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey("raw", ab(new TextEncoder().encode(passphrase)), "PBKDF2", false, [
        "deriveKey",
    ]);
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: ab(salt), iterations, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

/** Encrypt any JSON-serialisable payload with a passphrase. */
export async function encryptPayload(payload: unknown, passphrase: string): Promise<EncryptedBackup> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS);
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ab(iv) }, key, ab(plaintext));
    return {
        format: "fairgo-case-backup",
        version: BACKUP_VERSION,
        kdf: "PBKDF2",
        iterations: PBKDF2_ITERATIONS,
        saltB64: bytesToB64(salt),
        ivB64: bytesToB64(iv),
        cipherB64: bytesToB64(new Uint8Array(cipher)),
    };
}

/** Decrypt a backup envelope. Throws a friendly error on a wrong passphrase. */
export async function decryptPayload<T>(backup: EncryptedBackup, passphrase: string): Promise<T> {
    const salt = b64ToBytes(backup.saltB64);
    const iv = b64ToBytes(backup.ivB64);
    const key = await deriveKey(passphrase, salt, backup.iterations);
    try {
        const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ab(iv) }, key, ab(b64ToBytes(backup.cipherB64)));
        return JSON.parse(new TextDecoder().decode(plain)) as T;
    } catch {
        throw new Error("Could not decrypt the backup. Check the passphrase and that the file is intact.");
    }
}

/* ----------------------------- file (de)serialise --------------------------- */

async function blobToBackupFile(blob: Blob): Promise<BackupFile> {
    const buffer = await blob.arrayBuffer();
    return {
        name: (blob as File).name ?? "file",
        type: blob.type,
        dataB64: bytesToB64(new Uint8Array(buffer)),
    };
}

function backupFileToBlob(file: BackupFile): Blob {
    return new Blob([ab(b64ToBytes(file.dataB64))], { type: file.type });
}

/* ------------------------------- public API -------------------------------- */

/** Build the full payload (case file + all stored files) from local storage. */
export async function buildBackupPayload(caseFile: CaseFile): Promise<BackupPayload> {
    const blobs = await getAllFiles();
    const files: Record<string, BackupFile> = {};
    for (const [ref, blob] of Object.entries(blobs)) {
        files[ref] = await blobToBackupFile(blob);
    }
    return { caseFile, files };
}

/** Produce an encrypted backup as a downloadable Blob plus a suggested filename. */
export async function exportEncryptedBackup(
    caseFile: CaseFile,
    passphrase: string,
): Promise<{ blob: Blob; filename: string }> {
    const payload = await buildBackupPayload(caseFile);
    const envelope = await encryptPayload(payload, passphrase);
    const blob = new Blob([JSON.stringify(envelope)], { type: "application/json" });
    const stamp = new Date().toISOString().slice(0, 10);
    return { blob, filename: `fairgo-case-backup-${stamp}.fgbackup` };
}

/** Decrypt a backup file's contents into a payload. */
export async function readEncryptedBackup(fileText: string, passphrase: string): Promise<BackupPayload> {
    let envelope: EncryptedBackup;
    try {
        envelope = JSON.parse(fileText) as EncryptedBackup;
    } catch {
        throw new Error("That file isn't a valid Fair Go backup.");
    }
    if (envelope.format !== "fairgo-case-backup") {
        throw new Error("That file isn't a Fair Go case backup.");
    }
    return decryptPayload<BackupPayload>(envelope, passphrase);
}

/** Restore a decrypted payload into local storage (case file + files). */
export async function restoreBackup(payload: BackupPayload): Promise<CaseFile> {
    for (const [ref, file] of Object.entries(payload.files)) {
        await putFile(ref, backupFileToBlob(file));
    }
    await saveCaseFile(payload.caseFile);
    return payload.caseFile;
}

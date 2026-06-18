/**
 * Encrypted backup: the mandatory durability mitigation for a local-first tool.
 *
 * v2 uses the shared zero-knowledge crypto module (Argon2id, DEK, XChaCha20-Poly1305).
 * v1 (PBKDF2 + AES-GCM) remains importable for older backup files.
 */

import {
    base64ToBytes,
    bytesToBase64,
    createSignupBundle,
    decryptJson,
    encryptJson,
    unlockWithPassphrase,
} from "@/case/crypto";
import { getAllFiles, purgeAll, putFile, saveCaseFile } from "@/case/storage";
import type { CaseFile, EncryptedBackup, EncryptedBackupV1, EncryptedBackupV2 } from "@/case/types";

const PBKDF2_ITERATIONS = 250_000;

interface BackupFile {
    name: string;
    type: string;
    dataB64: string;
}

export interface BackupPayload {
    caseFile: CaseFile;
    files: Record<string, BackupFile>;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/* ------------------------------ v1 (legacy import) ------------------------ */

async function deriveKeyV1(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey("raw", toArrayBuffer(new TextEncoder().encode(passphrase)), "PBKDF2", false, [
        "deriveKey",
    ]);
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: toArrayBuffer(salt), iterations, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

async function decryptPayloadV1<T>(backup: EncryptedBackupV1, passphrase: string): Promise<T> {
    const salt = base64ToBytes(backup.saltB64);
    const iv = base64ToBytes(backup.ivB64);
    const key = await deriveKeyV1(passphrase, salt, backup.iterations);
    try {
        const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: toArrayBuffer(iv) },
            key,
            toArrayBuffer(base64ToBytes(backup.cipherB64)),
        );
        return JSON.parse(new TextDecoder().decode(plain)) as T;
    } catch {
        throw new Error("Could not decrypt the backup. Check the passphrase and that the file is intact.");
    }
}

/* ------------------------------ v2 (current) ------------------------------ */

/** Encrypt any JSON-serialisable payload with a passphrase (v2 crypto). */
export async function encryptPayload(payload: unknown, passphrase: string): Promise<EncryptedBackupV2> {
    const signup = await createSignupBundle(passphrase);
    const encrypted = await encryptJson(payload, signup.dek);

    return {
        format: "fairgo-case-backup",
        version: 2,
        kdf: "argon2id",
        kdfParams: signup.kdfParams,
        saltB64: bytesToBase64(signup.salt),
        wrappedDekPassphraseB64: bytesToBase64(signup.wrappedDekPassphrase.ciphertext),
        wrappedDekPassphraseNonceB64: bytesToBase64(signup.wrappedDekPassphrase.nonce),
        cipherB64: bytesToBase64(encrypted.ciphertext),
        nonceB64: bytesToBase64(encrypted.nonce),
    };
}

async function decryptPayloadV2<T>(backup: EncryptedBackupV2, passphrase: string): Promise<T> {
    try {
        const { dek } = await unlockWithPassphrase(passphrase, base64ToBytes(backup.saltB64), backup.kdfParams, {
            ciphertext: base64ToBytes(backup.wrappedDekPassphraseB64),
            nonce: base64ToBytes(backup.wrappedDekPassphraseNonceB64),
        });
        return decryptJson<T>(
            { ciphertext: base64ToBytes(backup.cipherB64), nonce: base64ToBytes(backup.nonceB64) },
            dek,
        );
    } catch {
        throw new Error("Could not decrypt the backup. Check the passphrase and that the file is intact.");
    }
}

/** Decrypt a backup envelope (v1 or v2). */
export async function decryptPayload<T>(backup: EncryptedBackup, passphrase: string): Promise<T> {
    if (backup.version === 2 && backup.kdf === "argon2id") {
        return decryptPayloadV2<T>(backup, passphrase);
    }
    if (backup.version === 1 && backup.kdf === "PBKDF2") {
        return decryptPayloadV1<T>(backup, passphrase);
    }
    throw new Error("That file isn't a supported Fair Go backup version.");
}

/* ----------------------------- file (de)serialise --------------------------- */

async function blobToBackupFile(blob: Blob): Promise<BackupFile> {
    const buffer = await blob.arrayBuffer();
    return {
        name: (blob as File).name ?? "file",
        type: blob.type,
        dataB64: bytesToBase64(new Uint8Array(buffer)),
    };
}

function backupFileToBlob(file: BackupFile): Blob {
    return new Blob([toArrayBuffer(base64ToBytes(file.dataB64))], { type: file.type });
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
    await purgeAll();
    for (const [ref, file] of Object.entries(payload.files)) {
        await putFile(ref, backupFileToBlob(file));
    }
    await saveCaseFile(payload.caseFile);
    return payload.caseFile;
}

/** @deprecated Legacy v1 encrypt path for tests only. */
export async function encryptPayloadV1Legacy(payload: unknown, passphrase: string): Promise<EncryptedBackupV1> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyV1(passphrase, salt, PBKDF2_ITERATIONS);
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(plaintext));
    return {
        format: "fairgo-case-backup",
        version: 1,
        kdf: "PBKDF2",
        iterations: PBKDF2_ITERATIONS,
        saltB64: bytesToBase64(salt),
        ivB64: bytesToBase64(iv),
        cipherB64: bytesToBase64(new Uint8Array(cipher)),
    };
}

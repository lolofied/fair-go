/**
 * Local-first storage for the case file and its uploaded files.
 *
 * Everything lives in the browser's IndexedDB. The service stores nothing: no
 * server custody, near-zero breach surface, no data-residency problem. The cost
 * is durability, which is why `backup.ts` exists and the UI nags about it.
 *
 * Two object stores:
 *  - `meta`   : a single JSON record holding the whole CaseFile (key "casefile").
 *  - `files`  : uploaded file blobs, keyed by Evidence.fileRef.
 *
 * Vanilla IndexedDB, no dependency, wrapped in promises.
 */

import type { CaseFile } from "@/case/types";

const DB_NAME = "fairgo.case.v1";
const DB_VERSION = 1;
const META_STORE = "meta";
const FILE_STORE = "files";
const CASE_KEY = "casefile";

function isAvailable(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
            if (!db.objectStoreNames.contains(FILE_STORE)) db.createObjectStore(FILE_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return openDB().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const transaction = db.transaction(store, mode);
                const request = run(transaction.objectStore(store));
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                transaction.oncomplete = () => db.close();
            }),
    );
}

/* -------------------------------- case file --------------------------------- */

export async function loadCaseFile(): Promise<CaseFile | null> {
    if (!isAvailable()) return null;
    try {
        const value = await tx<CaseFile | undefined>(META_STORE, "readonly", (s) => s.get(CASE_KEY));
        return value ?? null;
    } catch {
        return null;
    }
}

export async function saveCaseFile(file: CaseFile): Promise<void> {
    if (!isAvailable()) return;
    await tx(META_STORE, "readwrite", (s) => s.put(file, CASE_KEY));
}

/* ----------------------------------- files ---------------------------------- */

export async function putFile(ref: string, blob: Blob): Promise<void> {
    await tx(FILE_STORE, "readwrite", (s) => s.put(blob, ref));
}

export async function getFile(ref: string): Promise<Blob | null> {
    if (!isAvailable()) return null;
    try {
        const value = await tx<Blob | undefined>(FILE_STORE, "readonly", (s) => s.get(ref));
        return value ?? null;
    } catch {
        return null;
    }
}

export async function deleteFile(ref: string): Promise<void> {
    await tx(FILE_STORE, "readwrite", (s) => s.delete(ref));
}

/** All stored files keyed by ref. Used to assemble an encrypted backup. */
export async function getAllFiles(): Promise<Record<string, Blob>> {
    if (!isAvailable()) return {};
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const out: Record<string, Blob> = {};
        const transaction = db.transaction(FILE_STORE, "readonly");
        const store = transaction.objectStore(FILE_STORE);
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
                out[String(cursor.key)] = cursor.value as Blob;
                cursor.continue();
            }
        };
        cursorReq.onerror = () => reject(cursorReq.error);
        transaction.oncomplete = () => {
            db.close();
            resolve(out);
        };
    });
}

/* --------------------------------- erasure ---------------------------------- */

/**
 * Right to erasure: actually purge everything, files included. We delete the
 * whole database so nothing lingers, rather than just clearing records.
 */
export function purgeAll(): Promise<void> {
    if (!isAvailable()) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
    });
}

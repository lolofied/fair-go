/** In-memory sync session. The DEK never touches localStorage. */

let dek: Uint8Array | null = null;
let userId: string | null = null;

export function setSyncSession(nextUserId: string, nextDek: Uint8Array): void {
    userId = nextUserId;
    dek = new Uint8Array(nextDek);
}

export function getSyncDek(): Uint8Array | null {
    return dek ? new Uint8Array(dek) : null;
}

export function getSyncUserId(): string | null {
    return userId;
}

export function clearSyncSession(): void {
    dek = null;
    userId = null;
}

/** Reset all session state (tests). */
export function resetSyncSession(): void {
    clearSyncSession();
}

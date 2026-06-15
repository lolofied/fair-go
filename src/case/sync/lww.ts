/** Last-write-wins using ISO timestamps from case metadata / case_blobs.updated_at. */

export type SyncWinner = "local" | "remote" | "tie";

export function pickSyncWinner(localUpdatedAt: string, remoteUpdatedAt: string): SyncWinner {
    if (localUpdatedAt > remoteUpdatedAt) return "local";
    if (localUpdatedAt < remoteUpdatedAt) return "remote";
    return "tie";
}

/** On tie, keep editing locally (no remote overwrite). */
export function shouldPushLocal(winner: SyncWinner): boolean {
    return winner === "local" || winner === "tie";
}

export function shouldApplyRemote(winner: SyncWinner): boolean {
    return winner === "remote";
}

import type { CaseFile } from "@/case/types";

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

function hasValue(value: unknown): boolean {
    return value !== undefined && value !== null && value !== "";
}

function hasNonDefaultProfileContent(file: CaseFile): boolean {
    const { profile } = file;

    if (hasValue(profile.desiredOutcome)) return true;
    if (profile.candidateClaims.length > 0 || profile.flags.length > 0) return true;

    if (profile.employee.award_or_eba !== "unsure") return true;
    if (Object.entries(profile.employee).some(([key, value]) => key !== "award_or_eba" && hasValue(value))) return true;

    if (Object.values(profile.employer).some(hasValue)) return true;

    if (profile.dismissal.redundancy_claimed) return true;
    if (profile.dismissal.days_remaining !== null) return true;
    if (
        Object.entries(profile.dismissal).some(
            ([key, value]) => key !== "redundancy_claimed" && key !== "days_remaining" && hasValue(value),
        )
    ) {
        return true;
    }

    return false;
}

export function isAutoSeededEmptyLocalCase(file: CaseFile): boolean {
    return (
        file.meta.seededFromChecker &&
        file.events.length === 0 &&
        file.documents.length === 0 &&
        file.witnesses.length === 0 &&
        !hasNonDefaultProfileContent(file)
    );
}

export function pickLoginSyncWinner(local: CaseFile, remoteUpdatedAt: string): SyncWinner {
    if (isAutoSeededEmptyLocalCase(local)) return "remote";
    return pickSyncWinner(local.meta.updatedAt, remoteUpdatedAt);
}

import type { CaseFile } from "@/case/types";

export function needsBackup(lastBackupAt: string | undefined, updatedAt: string): boolean {
    if (!lastBackupAt) return true;
    return new Date(updatedAt).getTime() > new Date(lastBackupAt).getTime();
}

/** True when the case is saved to encrypted sync or has a backup that includes the latest edits. */
export function isCaseSavedExternally(file: CaseFile, options: { synced: boolean }): boolean {
    if (options.synced) return true;
    if (!file.meta.lastBackupAt) return false;
    return !needsBackup(file.meta.lastBackupAt, file.meta.updatedAt);
}

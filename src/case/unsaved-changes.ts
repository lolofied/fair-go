import type { CaseFile } from "@/case/types";

/** Timestamp to compare against when counting changes not yet captured in a backup. */
export function getUnsavedChangesBaseline(file: CaseFile): string {
    return file.meta.lastBackupAt ?? file.meta.createdAt;
}

/** Whether the case file has been edited since it was first created. */
export function hasUnsavedChanges(file: CaseFile): boolean {
    return new Date(file.meta.updatedAt).getTime() > new Date(file.meta.createdAt).getTime();
}

/**
 * Count discrete items changed since the last backup (or since creation if never backed up).
 * Events count once each when edited; new documents and witnesses count when added.
 * Profile-only edits count as one change when no entity timestamps moved.
 */
export function countUnsavedChanges(file: CaseFile): number {
    const baselineMs = new Date(getUnsavedChangesBaseline(file)).getTime();
    let count = 0;

    for (const event of file.events) {
        if (new Date(event.updatedAt).getTime() > baselineMs) count++;
    }

    for (const document of file.documents) {
        if (new Date(document.createdAt).getTime() > baselineMs) count++;
    }

    for (const witness of file.witnesses) {
        if (new Date(witness.createdAt).getTime() > baselineMs) count++;
    }

    if (count === 0 && new Date(file.meta.updatedAt).getTime() > baselineMs) {
        count = 1;
    }

    return count;
}

export function formatUnsavedChangesLabel(file: CaseFile): string {
    if (!hasUnsavedChanges(file)) return "Not saved";

    const count = countUnsavedChanges(file);
    if (count === 1) return "1 unsaved change";
    return `${count} unsaved changes`;
}

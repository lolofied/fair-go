/** Matches encrypted sync storage limit (50 MiB per file). */
export const MAX_EVIDENCE_FILE_BYTES = 50 * 1024 * 1024;

export const MAX_EVIDENCE_FILE_LABEL = "50 MB";

export function isEvidenceFileWithinSizeLimit(size: number): boolean {
    return size <= MAX_EVIDENCE_FILE_BYTES;
}

export function evidenceFileSizeError(size: number): string | null {
    if (isEvidenceFileWithinSizeLimit(size)) return null;
    return `This file is too large. Each document must be ${MAX_EVIDENCE_FILE_LABEL} or smaller.`;
}

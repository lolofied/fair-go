/** How someone entered the case documentation flow — for copy and analytics only. */
export type DocumentationEntry = "prep" | "result";

const STORAGE_KEY = "fairgo.documentation.entry.v1";

export function setDocumentationEntry(entry: DocumentationEntry): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(STORAGE_KEY, entry);
    } catch {
        /* storage may be unavailable */
    }
}

export function getDocumentationEntry(): DocumentationEntry | null {
    if (typeof window === "undefined") return null;
    try {
        const value = window.sessionStorage.getItem(STORAGE_KEY);
        return value === "prep" || value === "result" ? value : null;
    } catch {
        return null;
    }
}

export function isPrepDocumentationEntry(): boolean {
    return getDocumentationEntry() === "prep";
}

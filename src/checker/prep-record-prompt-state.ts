const PROMPT_KEY = "fairgo.prep-record.prompt.v1";

export function hasDismissedPrepRecordPrompt(): boolean {
    if (typeof window === "undefined") return true;
    try {
        return window.localStorage.getItem(PROMPT_KEY) === "1";
    } catch {
        return true;
    }
}

export function markPrepRecordPromptDismissed(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(PROMPT_KEY, "1");
    } catch {
        /* storage may be unavailable */
    }
}

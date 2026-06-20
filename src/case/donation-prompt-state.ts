import type { CaseFile } from "@/case/types";

const PROMPT_KEY = "fairgo.donation.prompt.v1";
const ONBOARDING_KEY = "fairgo.case.onboarding.v1";

function hasCompletedCaseOnboarding(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return window.localStorage.getItem(ONBOARDING_KEY) === "1";
    } catch {
        return false;
    }
}

export function hasRecordedCaseContent(file: CaseFile): boolean {
    return file.events.length + file.documents.length >= 2;
}

export function isDonationPromptEligible(file: CaseFile): boolean {
    return hasCompletedCaseOnboarding() && hasRecordedCaseContent(file);
}

export function hasSeenDonationPrompt(): boolean {
    if (typeof window === "undefined") return true;
    try {
        return window.localStorage.getItem(PROMPT_KEY) === "1";
    } catch {
        return true;
    }
}

export function markDonationPromptSeen(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(PROMPT_KEY, "1");
    } catch {
        /* storage may be unavailable */
    }
}

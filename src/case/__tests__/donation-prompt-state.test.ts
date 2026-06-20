import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CaseFile } from "@/case/types";
import {
    hasRecordedCaseContent,
    hasSeenDonationPrompt,
    isDonationPromptEligible,
    markDonationPromptSeen,
} from "@/case/donation-prompt-state";

function installStorage() {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
        localStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
            clear: () => storage.clear(),
        },
    });
    return storage;
}

const emptyFile = {
    events: [],
    documents: [],
} as unknown as CaseFile;

const fileWithEvent = {
    events: [{ id: "1" }],
    documents: [],
} as unknown as CaseFile;

const fileWithTwoItems = {
    events: [{ id: "1" }, { id: "2" }],
    documents: [],
} as unknown as CaseFile;

const fileWithEventAndEvidence = {
    events: [{ id: "1" }],
    documents: [{ id: "doc-1" }],
} as unknown as CaseFile;

describe("donation prompt state", () => {
    beforeEach(() => {
        installStorage();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("requires onboarding and at least two events or evidence before prompting", () => {
        expect(isDonationPromptEligible(emptyFile)).toBe(false);

        window.localStorage.setItem("fairgo.case.onboarding.v1", "1");
        expect(isDonationPromptEligible(emptyFile)).toBe(false);
        expect(isDonationPromptEligible(fileWithEvent)).toBe(false);
        expect(isDonationPromptEligible(fileWithTwoItems)).toBe(true);
        expect(isDonationPromptEligible(fileWithEventAndEvidence)).toBe(true);
    });

    it("tracks whether the prompt was dismissed", () => {
        expect(hasSeenDonationPrompt()).toBe(false);
        markDonationPromptSeen();
        expect(hasSeenDonationPrompt()).toBe(true);
    });

    it("detects at least two events or evidence items", () => {
        expect(hasRecordedCaseContent(emptyFile)).toBe(false);
        expect(hasRecordedCaseContent(fileWithEvent)).toBe(false);
        expect(hasRecordedCaseContent(fileWithTwoItems)).toBe(true);
        expect(hasRecordedCaseContent(fileWithEventAndEvidence)).toBe(true);
    });
});

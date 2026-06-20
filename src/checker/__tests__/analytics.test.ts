import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClaimAssessment } from "@/checker/types";

const { loadCheckerScreen, loadCheckerAnswers } = vi.hoisted(() => ({
    loadCheckerScreen: vi.fn<() => string>(),
    loadCheckerAnswers: vi.fn<() => Record<string, unknown>>(),
}));

vi.mock("@/checker/store", () => ({
    loadCheckerScreen,
    loadCheckerAnswers,
}));

import { trackClaimOutcome, trackClaimOutcomeIfCompleted } from "@/checker/analytics";

const STORAGE_KEY = "fairgo.analytics.v1";

function installBrowserStorage() {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
        localStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
            clear: () => storage.clear(),
        },
        dispatchEvent: vi.fn(),
    });
    return storage;
}

const sampleClaims: ClaimAssessment[] = [
    {
        claimType: "unfair_dismissal",
        status: "likely",
        deadline: null,
        supportingFacts: [],
        weakeningFacts: [],
        unmetGates: [],
    },
];

const sampleFlags = ["below_minimum_period"] as const;

describe("checker analytics", () => {
    beforeEach(() => {
        installBrowserStorage();
        loadCheckerScreen.mockReset();
        loadCheckerAnswers.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("dedupes identical claim_outcome events", () => {
        trackClaimOutcome(sampleClaims, [...sampleFlags]);
        trackClaimOutcome(sampleClaims, [...sampleFlags]);

        const buffer = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        expect(buffer).toHaveLength(1);
    });

    it("tracks claim_outcome when entering case with a completed checker result", () => {
        loadCheckerScreen.mockReturnValue("result");
        loadCheckerAnswers.mockReturnValue({
            dismissed: "terminated",
            effective_date: "2026-06-14",
            employee_status: "employee",
            employment_type: "permanent",
            employer_size: "large",
            start_date: "2023-01-01",
            award_covered: "yes",
            eba_applies: "no",
            salary: 60_000,
            reason: "performance",
            workplace_rights: ["none"],
            protected_attributes: ["none"],
            decision_maker_aware: "no",
        });

        trackClaimOutcomeIfCompleted();

        const buffer = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        expect(buffer).toHaveLength(1);
        expect(buffer[0].type).toBe("claim_outcome");
    });

    it("does not track when the checker is not on the result screen", () => {
        loadCheckerScreen.mockReturnValue("dismissed");
        loadCheckerAnswers.mockReturnValue({ dismissed: "terminated" });

        trackClaimOutcomeIfCompleted();

        expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});

import { describe, expect, it } from "vitest";
import { pickSyncWinner, shouldApplyRemote, shouldPushLocal } from "@/case/sync/lww";

describe("sync LWW", () => {
    it("prefers the newer local copy", () => {
        expect(pickSyncWinner("2025-06-02T00:00:00.000Z", "2025-06-01T00:00:00.000Z")).toBe("local");
        expect(shouldPushLocal("local")).toBe(true);
        expect(shouldApplyRemote("local")).toBe(false);
    });

    it("prefers the newer remote copy", () => {
        expect(pickSyncWinner("2025-06-01T00:00:00.000Z", "2025-06-02T00:00:00.000Z")).toBe("remote");
        expect(shouldApplyRemote("remote")).toBe(true);
        expect(shouldPushLocal("remote")).toBe(false);
    });

    it("keeps local on a tie", () => {
        const ts = "2025-06-01T12:00:00.000Z";
        expect(pickSyncWinner(ts, ts)).toBe("tie");
        expect(shouldPushLocal("tie")).toBe(true);
        expect(shouldApplyRemote("tie")).toBe(false);
    });
});

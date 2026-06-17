import { describe, expect, it } from "vitest";
import { ALLOWED_PRODUCT_EVENTS, PRODUCT_EVENT_NAMES } from "@/analytics/product-events";

describe("product analytics events", () => {
    it("keeps PostHog allowlist aligned with declared event names", () => {
        for (const name of PRODUCT_EVENT_NAMES) {
            expect(ALLOWED_PRODUCT_EVENTS.has(name)).toBe(true);
        }
        expect(ALLOWED_PRODUCT_EVENTS.size).toBe(PRODUCT_EVENT_NAMES.length);
    });
});

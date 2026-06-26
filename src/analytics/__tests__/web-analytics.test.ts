import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsEvent, sanitizeAnalyticsUrl, sanitizeWebAnalyticsEvent } from "@/analytics/web-analytics";

describe("web analytics sanitization", () => {
    it("strips query strings and hashes from URLs", () => {
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/guides?ref=email")).toBe("https://fair-go.ai/guides");
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/case/settings#backup")).toBe("https://fair-go.ai/case/settings");
    });

    it("sanitizes URL properties on pageview events", () => {
        const sanitized = sanitizeWebAnalyticsEvent({
            event: "$pageview",
            properties: {
                $current_url: "https://fair-go.ai/?utm_source=google",
                $referrer: "https://google.com/search?q=fair+dismissal",
            },
        });

        expect(sanitized.properties?.$current_url).toBe("https://fair-go.ai/");
        expect(sanitized.properties?.$referrer).toBe("https://google.com/search");
    });

    it("sanitizes persisted URL properties on product events", () => {
        const sanitized = sanitizeAnalyticsEvent({
            event: "claim_outcome",
            properties: {
                $current_url: "https://fair-go.ai/?utm_campaign=sensitive",
                $initial_current_url: "https://fair-go.ai/?case=abc123",
                $initial_referrer: "https://google.com/search?q=employer+name",
                claims: [{ claimType: "unfair_dismissal", status: "likely" }],
            },
        });

        expect(sanitized.properties?.$current_url).toBe("https://fair-go.ai/");
        expect(sanitized.properties?.$initial_current_url).toBe("https://fair-go.ai/");
        expect(sanitized.properties?.$initial_referrer).toBe("https://google.com/search");
        expect(sanitized.properties?.claims).toEqual([{ claimType: "unfair_dismissal", status: "likely" }]);
    });
});

import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsUrl, sanitizeWebAnalyticsEvent } from "@/analytics/web-analytics";

describe("web analytics sanitization", () => {
    it("strips query strings and hashes from URLs", () => {
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/guides?ref=email")).toBe("https://fair-go.ai/guides");
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/guides#eligibility")).toBe("https://fair-go.ai/guides");
    });

    it("does not expose private case workspace paths", () => {
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/case")).toBeUndefined();
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/case/settings#backup")).toBeUndefined();
        expect(sanitizeAnalyticsUrl("https://fair-go.ai/casebook")).toBe("https://fair-go.ai/casebook");
    });

    it("sanitizes URL properties on pageview events", () => {
        const sanitized = sanitizeWebAnalyticsEvent({
            event: "$pageview",
            properties: {
                $current_url: "https://fair-go.ai/?utm_source=google",
                $referrer: "https://google.com/search?q=fair+dismissal",
            },
        });

        expect(sanitized).not.toBeNull();
        if (!sanitized) throw new Error("Expected public pageview to be retained");
        expect(sanitized.properties?.$current_url).toBe("https://fair-go.ai/");
        expect(sanitized.properties?.$referrer).toBe("https://google.com/search");
    });

    it("drops web analytics events for private case workspace pages", () => {
        expect(
            sanitizeWebAnalyticsEvent({
                event: "$pageview",
                properties: {
                    $current_url: "https://fair-go.ai/case/events?utm_source=ad",
                },
            }),
        ).toBeNull();
    });

    it("removes private case workspace referrers from public page events", () => {
        const sanitized = sanitizeWebAnalyticsEvent({
            event: "$pageview",
            properties: {
                $current_url: "https://fair-go.ai/guides",
                $referrer: "https://fair-go.ai/case/export#print",
            },
        });

        expect(sanitized).not.toBeNull();
        if (!sanitized) throw new Error("Expected public pageview to be retained");
        expect(sanitized.properties?.$current_url).toBe("https://fair-go.ai/guides");
        expect(sanitized.properties).not.toHaveProperty("$referrer");
    });
});

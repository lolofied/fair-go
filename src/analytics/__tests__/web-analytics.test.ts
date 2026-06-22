import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsUrl, sanitizeWebAnalyticsEvent } from "@/analytics/web-analytics";

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
});

/** PostHog system events allowed for privacy-safe web analytics (pathname-only URLs). */
export const WEB_ANALYTICS_EVENT_NAMES = ["$pageview", "$pageleave"] as const;

export type WebAnalyticsEventName = (typeof WEB_ANALYTICS_EVENT_NAMES)[number];

export const ALLOWED_WEB_ANALYTICS_EVENTS = new Set<string>(WEB_ANALYTICS_EVENT_NAMES);

const URL_PROPERTY_KEYS = ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"] as const;

type AnalyticsEvent = {
    event: string;
    properties?: Record<string, unknown>;
};

/** Strip query strings and hashes from analytics URL properties. */
export function sanitizeAnalyticsUrl(url: unknown): string | undefined {
    if (typeof url !== "string" || url.length === 0) {
        return undefined;
    }

    try {
        const parsed = new URL(url, "https://fair-go.ai");
        return `${parsed.origin}${parsed.pathname}`;
    } catch {
        return undefined;
    }
}

/** Remove query strings from URL fields before analytics events leave the browser. */
export function sanitizeAnalyticsEvent<T extends AnalyticsEvent>(event: T): T {
    const properties = event.properties ? { ...event.properties } : {};

    for (const key of URL_PROPERTY_KEYS) {
        const sanitized = sanitizeAnalyticsUrl(properties[key]);
        if (sanitized !== undefined) {
            properties[key] = sanitized;
        }
    }

    return { ...event, properties };
}

export const sanitizeWebAnalyticsEvent = sanitizeAnalyticsEvent;

export function isAllowedAnalyticsEvent(eventName: string): boolean {
    return ALLOWED_WEB_ANALYTICS_EVENTS.has(eventName);
}

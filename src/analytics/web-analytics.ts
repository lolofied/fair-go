/** PostHog system events allowed for privacy-safe web analytics (pathname-only URLs). */
export const WEB_ANALYTICS_EVENT_NAMES = ["$pageview", "$pageleave"] as const;

export type WebAnalyticsEventName = (typeof WEB_ANALYTICS_EVENT_NAMES)[number];

export const ALLOWED_WEB_ANALYTICS_EVENTS = new Set<string>(WEB_ANALYTICS_EVENT_NAMES);

const CURRENT_URL_PROPERTY_KEY = "$current_url";
const URL_PROPERTY_KEYS = [CURRENT_URL_PROPERTY_KEY, "$referrer"] as const;

type AnalyticsEvent = {
    event: string;
    properties?: Record<string, unknown>;
};

function isPrivatePathname(pathname: string): boolean {
    return pathname === "/case" || pathname.startsWith("/case/");
}

export function isPrivateAnalyticsUrl(url: unknown): boolean {
    if (typeof url !== "string" || url.length === 0) {
        return false;
    }

    try {
        const parsed = new URL(url, "https://fair-go.ai");
        return isPrivatePathname(parsed.pathname);
    } catch {
        return false;
    }
}

/** Strip query strings and hashes from analytics URL properties. */
export function sanitizeAnalyticsUrl(url: unknown): string | undefined {
    if (typeof url !== "string" || url.length === 0) {
        return undefined;
    }

    try {
        const parsed = new URL(url, "https://fair-go.ai");
        if (isPrivatePathname(parsed.pathname)) {
            return undefined;
        }

        return `${parsed.origin}${parsed.pathname}`;
    } catch {
        return undefined;
    }
}

/** Remove private workspace URLs and query strings before web analytics events leave the browser. */
export function sanitizeWebAnalyticsEvent<T extends AnalyticsEvent>(event: T): T | null {
    const properties = event.properties ? { ...event.properties } : {};

    if (isPrivateAnalyticsUrl(properties[CURRENT_URL_PROPERTY_KEY])) {
        return null;
    }

    for (const key of URL_PROPERTY_KEYS) {
        const sanitized = sanitizeAnalyticsUrl(properties[key]);
        if (sanitized !== undefined) {
            properties[key] = sanitized;
        } else if (isPrivateAnalyticsUrl(properties[key])) {
            delete properties[key];
        }
    }

    return { ...event, properties };
}

export function isAllowedAnalyticsEvent(eventName: string): boolean {
    return ALLOWED_WEB_ANALYTICS_EVENTS.has(eventName);
}

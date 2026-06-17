import posthog from "posthog-js";

const ALLOWED_EVENTS = new Set(["claim_outcome"]);

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

let ready = false;

/** Initialise locked-down PostHog: cookieless, explicit events only. No-op without VITE_POSTHOG_KEY. */
export function initPostHog(): void {
    if (ready || !key || typeof window === "undefined") return;

    posthog.init(key, {
        api_host: host,

        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        rageclick: false,
        enable_heatmaps: false,
        disable_surveys: true,

        disable_session_recording: true,

        cookieless_mode: "always",
        persistence: "memory",

        person_profiles: "identified_only",

        before_send: (event) => (event && ALLOWED_EVENTS.has(event.event) ? event : null),

        property_denylist: ["email", "name", "salary", "employer", "passphrase", "abn"],
    });

    ready = true;
}

export function capturePostHog(event: string, properties: Record<string, unknown>): void {
    if (!ready || !ALLOWED_EVENTS.has(event)) return;
    posthog.capture(event, properties);
}

export function shutdownPostHog(): void {
    if (!ready) return;
    posthog.opt_out_capturing();
    posthog.reset();
    ready = false;
}

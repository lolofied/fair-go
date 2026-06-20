import posthog from "posthog-js";
import { ALLOWED_PRODUCT_EVENTS } from "@/analytics/product-events";

const ALLOWED_EVENTS = ALLOWED_PRODUCT_EVENTS;

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

let ready = false;

/** Initialise locked-down PostHog: first-party cookies, explicit events only. No-op without VITE_POSTHOG_KEY. */
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

        persistence: "localStorage+cookie",
        person_profiles: "always",

        before_send: (event) => (event && ALLOWED_EVENTS.has(event.event) ? event : null),

        property_denylist: ["email", "name", "salary", "employer", "passphrase", "abn"],
    });

    ready = true;
}

export function capturePostHog(event: string, properties: Record<string, unknown>): void {
    if (!ready || !ALLOWED_EVENTS.has(event)) return;
    posthog.capture(event, properties, { send_instantly: true });
}

/** Link analytics to a sync account using the Supabase user ID only (never email). */
export function identifyPostHogUser(userId: string): void {
    if (!ready || !userId) return;
    posthog.identify(userId);
}

/** Start a fresh anonymous person after sync sign-out. */
export function resetPostHogIdentity(): void {
    if (!ready) return;
    posthog.reset();
}

export function shutdownPostHog(): void {
    if (!ready) return;
    posthog.opt_out_capturing();
    posthog.reset();
    ready = false;
}

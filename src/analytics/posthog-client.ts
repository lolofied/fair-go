import posthog from "posthog-js";
import { ALLOWED_PRODUCT_EVENTS } from "@/analytics/product-events";
import { ALLOWED_WEB_ANALYTICS_EVENTS, sanitizeWebAnalyticsEvent } from "@/analytics/web-analytics";

const key = import.meta.env.VITE_POSTHOG_KEY;
const defaultHost = import.meta.env.PROD ? "/ingest" : "https://us.i.posthog.com";
const host = import.meta.env.VITE_POSTHOG_HOST ?? defaultHost;
const uiHost = import.meta.env.VITE_POSTHOG_UI_HOST ?? "https://us.posthog.com";

let ready = false;

function shouldSendEvent(eventName: string) {
    return ALLOWED_PRODUCT_EVENTS.has(eventName) || ALLOWED_WEB_ANALYTICS_EVENTS.has(eventName);
}

/** Initialise PostHog with privacy-safe product events and pathname-only web analytics. */
export function initPostHog(): void {
    if (ready || !key || typeof window === "undefined") return;

    posthog.init(key, {
        api_host: host,
        ui_host: uiHost,

        autocapture: false,
        capture_pageview: "history_change",
        capture_pageleave: true,
        capture_dead_clicks: false,
        rageclick: false,
        enable_heatmaps: false,
        disable_surveys: true,

        disable_session_recording: true,

        persistence: "localStorage+cookie",
        person_profiles: "always",

        before_send: (event) => {
            if (!event || !shouldSendEvent(event.event)) {
                return null;
            }

            if (ALLOWED_WEB_ANALYTICS_EVENTS.has(event.event)) {
                return sanitizeWebAnalyticsEvent(event);
            }

            return event;
        },

        property_denylist: ["email", "name", "salary", "employer", "passphrase", "abn"],
    });

    ready = true;
}

export function capturePostHog(event: string, properties: Record<string, unknown>): void {
    if (!ready || !ALLOWED_PRODUCT_EVENTS.has(event)) return;
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

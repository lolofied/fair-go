import {
    buildSupportEmailBody,
    buildSupportEmailSubject,
    validateSupportContactPayload,
    type ValidatedSupportContact,
} from "../src/config/support-contact";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

interface SupportContactEnv {
    RESEND_API_KEY?: string;
    SUPPORT_TO_EMAIL?: string;
    SUPPORT_FROM_EMAIL?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
    });
}

async function isRateLimited(ip: string): Promise<boolean> {
    if (!ip) {
        return false;
    }

    const cache = caches.default;
    const cacheKey = new Request(`https://rate-limit.internal/support/${encodeURIComponent(ip)}`);
    const existing = await cache.match(cacheKey);

    if (existing) {
        const count = Number.parseInt(await existing.text(), 10);

        if (Number.isNaN(count) || count >= RATE_LIMIT_MAX) {
            return true;
        }

        await cache.put(cacheKey, new Response(String(count + 1)), {
            expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
        });

        return false;
    }

    await cache.put(cacheKey, new Response("1"), {
        expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });

    return false;
}

async function sendSupportEmail(data: ValidatedSupportContact, env: SupportContactEnv): Promise<boolean> {
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
        return false;
    }

    const to = env.SUPPORT_TO_EMAIL ?? "support@fair-go.ai";
    const from = env.SUPPORT_FROM_EMAIL ?? "Fair Go <noreply@fair-go.ai>";
    const subject = buildSupportEmailSubject(data.topicLabel);
    const text = buildSupportEmailBody(data);

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            text,
            reply_to: data.email,
        }),
    });

    return response.ok;
}

export async function handleSupportContactRequest(request: Request, env: SupportContactEnv): Promise<Response> {
    if (request.method !== "POST") {
        return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
    }

    const contentType = request.headers.get("Content-Type") ?? "";

    if (!contentType.includes("application/json")) {
        return jsonResponse({ ok: false, error: "invalid_content_type" }, 415);
    }

    let payload: unknown;

    try {
        payload = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: "invalid_payload" }, 400);
    }

    const validated = validateSupportContactPayload(payload);

    if (!validated.ok) {
        if (validated.error === "spam_detected") {
            return jsonResponse({ ok: true });
        }

        return jsonResponse({ ok: false, error: validated.error }, 400);
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "";

    if (await isRateLimited(ip)) {
        return jsonResponse({ ok: false, error: "rate_limited" }, 429);
    }

    const sent = await sendSupportEmail(validated.data, env);

    if (!sent) {
        return jsonResponse({ ok: false, error: "send_failed" }, 503);
    }

    return jsonResponse({ ok: true });
}

import {
    buildSupportEmailBody,
    buildSupportEmailSubject,
    validateSupportContactPayload,
    type ValidatedSupportContact,
} from "../src/config/support-contact";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;
const RATE_LIMIT_STORAGE_KEY = "support-contact";
const RATE_LIMIT_CHECK_URL = "https://rate-limit.internal/support";

interface DurableObjectIdLike {}

interface DurableObjectStubLike {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface DurableObjectNamespaceLike {
    idFromName(name: string): DurableObjectIdLike;
    get(id: DurableObjectIdLike): DurableObjectStubLike;
}

interface DurableObjectStorageLike {
    get<T>(key: string): Promise<T | undefined>;
    put<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    setAlarm?(scheduledTime: number | Date): Promise<void>;
}

interface DurableObjectStateLike {
    storage: DurableObjectStorageLike;
}

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

interface SupportContactEnv {
    RESEND_API_KEY?: string;
    SUPPORT_TO_EMAIL?: string;
    SUPPORT_FROM_EMAIL?: string;
    SUPPORT_RATE_LIMITER?: DurableObjectNamespaceLike;
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

export class SupportRateLimiter {
    private pending = Promise.resolve();

    constructor(private readonly state: DurableObjectStateLike) {}

    async fetch(): Promise<Response> {
        const result = this.pending.then(() => this.checkLimit());
        this.pending = result.then(
            () => undefined,
            () => undefined,
        );

        return result;
    }

    async alarm(): Promise<void> {
        const record = await this.state.storage.get<RateLimitRecord>(RATE_LIMIT_STORAGE_KEY);

        if (record && record.resetAt <= Date.now()) {
            await this.state.storage.delete(RATE_LIMIT_STORAGE_KEY);
        }
    }

    private async checkLimit(): Promise<Response> {
        const now = Date.now();
        const existing = await this.state.storage.get<RateLimitRecord>(RATE_LIMIT_STORAGE_KEY);

        if (!existing || existing.resetAt <= now) {
            const resetAt = now + RATE_LIMIT_WINDOW_MS;

            await this.state.storage.put(RATE_LIMIT_STORAGE_KEY, { count: 1, resetAt });
            await this.state.storage.setAlarm?.(resetAt);

            return new Response(null, { status: 204 });
        }

        if (existing.count >= RATE_LIMIT_MAX) {
            return new Response(null, { status: 429 });
        }

        await this.state.storage.put(RATE_LIMIT_STORAGE_KEY, { ...existing, count: existing.count + 1 });
        await this.state.storage.setAlarm?.(existing.resetAt);

        return new Response(null, { status: 204 });
    }
}

async function isRateLimited(ip: string, env: SupportContactEnv): Promise<boolean> {
    if (!ip) {
        return false;
    }

    const limiter = env.SUPPORT_RATE_LIMITER;

    if (!limiter) {
        return true;
    }

    try {
        const id = limiter.idFromName(ip);
        const response = await limiter.get(id).fetch(RATE_LIMIT_CHECK_URL);

        return response.status === 429 || !response.ok;
    } catch {
        return true;
    }
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

    if (await isRateLimited(ip, env)) {
        return jsonResponse({ ok: false, error: "rate_limited" }, 429);
    }

    const sent = await sendSupportEmail(validated.data, env);

    if (!sent) {
        return jsonResponse({ ok: false, error: "send_failed" }, 503);
    }

    return jsonResponse({ ok: true });
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { handleSupportContactRequest, SupportRateLimiter } from "../support-contact";

class MemoryStorage {
    private readonly values = new Map<string, unknown>();

    async get<T>(key: string): Promise<T | undefined> {
        return this.values.get(key) as T | undefined;
    }

    async put<T>(key: string, value: T): Promise<void> {
        this.values.set(key, value);
    }

    async delete(key: string): Promise<void> {
        this.values.delete(key);
    }

    async setAlarm(): Promise<void> {}
}

function createRateLimiterNamespace() {
    const limiters = new Map<string, SupportRateLimiter>();

    return {
        idFromName(name: string) {
            return name;
        },
        get(id: string) {
            let limiter = limiters.get(id);

            if (!limiter) {
                limiter = new SupportRateLimiter({ storage: new MemoryStorage() });
                limiters.set(id, limiter);
            }

            return {
                fetch() {
                    return limiter.fetch();
                },
            };
        },
    };
}

function supportRequest(ip: string): Request {
    return new Request("https://fair-go.ai/api/support", {
        method: "POST",
        headers: {
            "CF-Connecting-IP": ip,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            topic: "bug",
            email: "user@example.com",
            message: "The export button does nothing.",
            company: "",
        }),
    });
}

describe("handleSupportContactRequest", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("does not send more than five support emails per IP in the rate limit window", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));
        const env = {
            RESEND_API_KEY: "resend-key",
            SUPPORT_RATE_LIMITER: createRateLimiterNamespace(),
        };

        for (let index = 0; index < 5; index += 1) {
            const response = await handleSupportContactRequest(supportRequest("203.0.113.10"), env);

            expect(response.status).toBe(200);
        }

        const limited = await handleSupportContactRequest(supportRequest("203.0.113.10"), env);

        expect(limited.status).toBe(429);
        expect(fetchMock).toHaveBeenCalledTimes(5);
    });

    it("serializes concurrent submissions from the same IP before sending email", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));
        const env = {
            RESEND_API_KEY: "resend-key",
            SUPPORT_RATE_LIMITER: createRateLimiterNamespace(),
        };

        const responses = await Promise.all(
            Array.from({ length: 20 }, () => handleSupportContactRequest(supportRequest("203.0.113.20"), env)),
        );

        expect(responses.filter((response) => response.status === 200)).toHaveLength(5);
        expect(responses.filter((response) => response.status === 429)).toHaveLength(15);
        expect(fetchMock).toHaveBeenCalledTimes(5);
    });
});

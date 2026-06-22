import { SUPPORT_CONTACT_PATH, type SupportContactPayload } from "@/config/support-contact";

export type SupportContactResult =
    | { ok: true }
    | { ok: false; error: "network" | "rate_limited" | "send_failed" | "invalid" | "unknown" };

export async function submitSupportContact(payload: SupportContactPayload): Promise<SupportContactResult> {
    let response: Response;

    try {
        response = await fetch(SUPPORT_CONTACT_PATH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch {
        return { ok: false, error: "network" };
    }

    let body: { ok?: boolean; error?: string } | null = null;

    try {
        body = (await response.json()) as { ok?: boolean; error?: string };
    } catch {
        return { ok: false, error: "unknown" };
    }

    if (response.ok && body?.ok) {
        return { ok: true };
    }

    if (response.status === 429) {
        return { ok: false, error: "rate_limited" };
    }

    if (response.status === 503) {
        return { ok: false, error: "send_failed" };
    }

    if (response.status >= 400 && response.status < 500) {
        return { ok: false, error: "invalid" };
    }

    return { ok: false, error: "unknown" };
}

export function supportContactErrorMessage(error: SupportContactResult["error"]): string {
    switch (error) {
        case "network":
            return "We could not reach the server. Check your connection and try again.";
        case "rate_limited":
            return "Too many messages sent recently. Please wait a while before trying again.";
        case "send_failed":
            return "We could not send your message right now. Email us directly at support@fair-go.ai instead.";
        case "invalid":
            return "Check your message and try again.";
        default:
            return "Something went wrong. Please try again or email support@fair-go.ai directly.";
    }
}

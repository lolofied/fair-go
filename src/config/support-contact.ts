export const SUPPORT_EMAIL = "support@fair-go.ai";

export const SUPPORT_CONTACT_PATH = "/api/support";

export const SUPPORT_MAX_MESSAGE_LENGTH = 5000;

export const SUPPORT_TOPICS = [
    { value: "product", label: "Product question" },
    { value: "bug", label: "Report a problem" },
    { value: "feedback", label: "Leave feedback" },
    { value: "other", label: "Something else" },
] as const;

export type SupportTopicValue = (typeof SUPPORT_TOPICS)[number]["value"];

const SUPPORT_TOPIC_VALUES = new Set<string>(SUPPORT_TOPICS.map((topic) => topic.value));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SupportContactPayload = {
    topic: string;
    email?: string;
    message: string;
    company?: string;
};

export type ValidatedSupportContact = {
    topic: SupportTopicValue;
    topicLabel: string;
    email?: string;
    message: string;
};

export function getSupportTopicLabel(value: string): string {
    return SUPPORT_TOPICS.find((topic) => topic.value === value)?.label ?? "Support request";
}

export function validateSupportContactPayload(
    input: unknown,
): { ok: true; data: ValidatedSupportContact } | { ok: false; error: string } {
    if (!input || typeof input !== "object") {
        return { ok: false, error: "invalid_payload" };
    }

    const payload = input as SupportContactPayload;

    if (typeof payload.company === "string" && payload.company.trim().length > 0) {
        return { ok: false, error: "spam_detected" };
    }

    if (typeof payload.topic !== "string" || !SUPPORT_TOPIC_VALUES.has(payload.topic)) {
        return { ok: false, error: "invalid_topic" };
    }

    if (typeof payload.message !== "string") {
        return { ok: false, error: "invalid_message" };
    }

    const message = payload.message.trim();

    if (!message) {
        return { ok: false, error: "message_required" };
    }

    if (message.length > SUPPORT_MAX_MESSAGE_LENGTH) {
        return { ok: false, error: "message_too_long" };
    }

    let email: string | undefined;

    if (payload.email !== undefined && payload.email !== null && payload.email !== "") {
        if (typeof payload.email !== "string") {
            return { ok: false, error: "invalid_email" };
        }

        const trimmedEmail = payload.email.trim();

        if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
            return { ok: false, error: "invalid_email" };
        }

        email = trimmedEmail || undefined;
    }

    return {
        ok: true,
        data: {
            topic: payload.topic as SupportTopicValue,
            topicLabel: getSupportTopicLabel(payload.topic),
            email,
            message,
        },
    };
}

export function buildSupportEmailSubject(topicLabel: string): string {
    return `[Fair Go] ${topicLabel}`;
}

export function buildSupportEmailBody(data: ValidatedSupportContact): string {
    return [
        data.message,
        "",
        "---",
        `Topic: ${data.topicLabel}`,
        data.email ? `Reply email: ${data.email}` : "Reply email: not provided",
    ].join("\n");
}

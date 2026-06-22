import { describe, expect, it } from "vitest";
import {
    buildSupportEmailBody,
    buildSupportEmailSubject,
    validateSupportContactPayload,
} from "@/config/support-contact";

describe("validateSupportContactPayload", () => {
    it("accepts a valid payload", () => {
        const result = validateSupportContactPayload({
            topic: "bug",
            email: "user@example.com",
            message: "The export button does nothing.",
            company: "",
        });

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.data.topic).toBe("bug");
            expect(result.data.email).toBe("user@example.com");
            expect(result.data.message).toBe("The export button does nothing.");
        }
    });

    it("rejects honeypot submissions", () => {
        const result = validateSupportContactPayload({
            topic: "product",
            message: "Hello",
            company: "Acme Corp",
        });

        expect(result).toEqual({ ok: false, error: "spam_detected" });
    });

    it("rejects unknown topics, empty messages, and missing email", () => {
        expect(
            validateSupportContactPayload({
                topic: "legal-advice",
                message: "Help",
                email: "user@example.com",
            }),
        ).toEqual({ ok: false, error: "invalid_topic" });

        expect(
            validateSupportContactPayload({
                topic: "product",
                message: "   ",
                email: "user@example.com",
            }),
        ).toEqual({ ok: false, error: "message_required" });

        expect(
            validateSupportContactPayload({
                topic: "product",
                message: "Help",
                email: "   ",
            }),
        ).toEqual({ ok: false, error: "email_required" });
    });
});

describe("support email formatting", () => {
    it("builds subject and body", () => {
        expect(buildSupportEmailSubject("Report a problem")).toBe("[Fair Go] Report a problem");
        expect(
            buildSupportEmailBody({
                topic: "bug",
                topicLabel: "Report a problem",
                email: "user@example.com",
                message: "Something broke.",
            }),
        ).toContain("Reply email: user@example.com");
    });
});

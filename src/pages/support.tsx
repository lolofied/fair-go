import { useState } from "react";
import { useLocation } from "react-router";
import { HelpCircle, MessageChatCircle, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SelectField, TextAreaField, TextField } from "@/case/components/fields";
import { StandalonePageContent, StandalonePageShell } from "@/components/layout/standalone-page-shell";

type SupportLocationState = {
    returnTo?: "case";
};

const SUPPORT_EMAIL = "support@fair-go.ai";

const TOPICS: { value: string; label: string }[] = [
    { value: "product", label: "Product question" },
    { value: "bug", label: "Report a problem" },
    { value: "feedback", label: "Leave feedback" },
    { value: "other", label: "Something else" },
];

const INTENT_ITEMS = [
    { icon: HelpCircle, text: "Ask product questions" },
    { icon: MessageChatCircle, text: "Report problems or unexpected behaviour" },
    { icon: Send01, text: "Leave feedback" },
] as const;

function topicLabel(value: string): string {
    return TOPICS.find((topic) => topic.value === value)?.label ?? "Support request";
}

export const SupportPage = () => {
    const location = useLocation();
    const returnToCase = (location.state as SupportLocationState | null)?.returnTo === "case";
    const [topic, setTopic] = useState("product");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = message.trim();
        if (!trimmed) return;

        const subject = `[Fair Go] ${topicLabel(topic)}`;
        const bodyLines = [
            trimmed,
            "",
            "---",
            `Topic: ${topicLabel(topic)}`,
            email.trim() ? `Reply email: ${email.trim()}` : "Reply email: not provided",
        ];

        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    };

    return (
        <StandalonePageShell
            brandHref="/"
            brandLabel="Back to Fair Go home"
            backHref={returnToCase ? "/case" : "/"}
            backLabel={returnToCase ? "Back to case" : "Back to home"}
        >
            <StandalonePageContent>
                <h1 className="text-display-sm font-semibold tracking-tight text-primary">Contact support</h1>

                <ul className="mt-6 flex flex-col gap-3">
                    {INTENT_ITEMS.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-3 text-md text-secondary">
                            <Icon className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                            {text}
                        </li>
                    ))}
                </ul>

                <section className="mt-10 rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                    <h2 className="text-md font-semibold text-primary">Tell us how we can help</h2>
                    <p className="mt-2 text-sm text-tertiary">
                        Share anything we need to understand your question. Do not include your case details, employer name,
                        or other identifying information unless you are comfortable emailing it to us.
                    </p>

                    <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
                        <SelectField label="Topic" value={topic} onChange={setTopic} options={TOPICS} />
                        <TextField
                            label="Your email (optional)"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            help="Include this if you would like a reply."
                        />
                        <TextAreaField
                            label="Message"
                            value={message}
                            onChange={setMessage}
                            placeholder="Describe your question or feedback"
                            help="Screenshots can be attached after your email app opens."
                        />
                        <Button type="submit" color="primary" size="md" iconLeading={Send01} isDisabled={!message.trim()}>
                            Send message
                        </Button>
                    </form>
                </section>

                <p className="mt-6 text-sm text-tertiary">
                    Or email us directly at{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-secondary underline">
                        {SUPPORT_EMAIL}
                    </a>
                    .
                </p>
            </StandalonePageContent>
        </StandalonePageShell>
    );
};

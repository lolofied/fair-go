import { useState } from "react";
import { useLocation } from "react-router";
import { CheckCircle, HelpCircle, MessageChatCircle, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SelectField, TextAreaField, TextField } from "@/case/components/fields";
import { Shell, ShellContent, ShellMain } from "@/components/layout/shell";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { PageMeta } from "@/components/seo/page-meta";
import { StandalonePageContent, StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SUPPORT_EMAIL, SUPPORT_TOPICS } from "@/config/support-contact";
import { submitSupportContact, supportContactErrorMessage } from "@/support/submit-support-contact";

type SupportLocationState = {
    returnTo?: "case";
};

const INTENT_ITEMS = [
    { icon: HelpCircle, text: "Ask product questions" },
    { icon: MessageChatCircle, text: "Report problems or unexpected behaviour" },
    { icon: Send01, text: "Leave feedback" },
] as const;

export const SupportPage = () => {
    const location = useLocation();
    const returnToCase = (location.state as SupportLocationState | null)?.returnTo === "case";
    const [topic, setTopic] = useState<string>(SUPPORT_TOPICS[0].value);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [company, setCompany] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const trimmed = message.trim();

        if (!trimmed || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        const result = await submitSupportContact({
            topic,
            email,
            message: trimmed,
            company,
        });

        setIsSubmitting(false);

        if (result.ok) {
            setSubmitSuccess(true);
            setMessage("");
            setEmail("");
            setCompany("");
            return;
        }

        setSubmitError(supportContactErrorMessage(result.error));
    };

    const content = (
        <>
            <PageMeta
                title="Support | Fair Go"
                description="Get help with Fair Go. Ask a product question, report a problem, or share feedback. Your case stays private on your device."
                path="/support"
            />
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
                    or other identifying information unless you are comfortable sending it to us.
                </p>

                {submitSuccess ? (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-success-secondary bg-success-primary p-4">
                        <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-medium text-primary">Message sent</p>
                            <p className="mt-1 text-sm text-tertiary">
                                Thanks for reaching out. If you included an email address, we will reply as soon as we can.
                            </p>
                            <Button
                                type="button"
                                color="link-color"
                                size="sm"
                                className="mt-3"
                                onClick={() => setSubmitSuccess(false)}
                            >
                                Send another message
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
                        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
                            <label htmlFor="support-company">Company</label>
                            <input
                                id="support-company"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                            />
                        </div>

                        <SelectField
                            label="Topic"
                            value={topic}
                            onChange={setTopic}
                            options={[...SUPPORT_TOPICS]}
                        />
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
                        />
                        {submitError ? (
                            <p className="text-sm text-error-primary" role="alert">
                                {submitError}
                            </p>
                        ) : null}
                        <Button
                            type="submit"
                            color="primary"
                            size="md"
                            iconLeading={Send01}
                            isLoading={isSubmitting}
                            isDisabled={!message.trim() || isSubmitting}
                        >
                            Send message
                        </Button>
                    </form>
                )}
            </section>

            <p className="mt-6 text-sm text-tertiary">
                Or email us directly at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-secondary underline">
                    {SUPPORT_EMAIL}
                </a>
                .
            </p>
        </>
    );

    if (returnToCase) {
        return (
            <StandalonePageShell
                brandHref="/case"
                brandLabel="Back to case overview"
                backHref="/case"
                backLabel="Back to case"
            >
                <StandalonePageContent>{content}</StandalonePageContent>
            </StandalonePageShell>
        );
    }

    return (
        <Shell>
            <LandingHeader brandAsLink />

            <ShellMain align="start">
                <ShellContent>{content}</ShellContent>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

import { useState } from "react";
import { ChevronDown, ChevronRight, Shield01 } from "@untitledui/icons";
import { Link } from "react-router";
import { GuardrailBanner } from "@/case/components/guardrail";

const CopyList = ({ items }: { items: string[] }) => (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-tertiary marker:text-quaternary">
        {items.map((item) => (
            <li key={item}>{item}</li>
        ))}
    </ul>
);

export const PrivacySecurityCard = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="fg-section-card">
            <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                className="flex w-full items-start justify-between gap-3 text-left"
            >
                <div className="min-w-0">
                    <h2 className="fg-section-card-title">Privacy and security</h2>
                    {!expanded && (
                        <p className="mt-1 text-sm text-tertiary">
                            Your case stays on this device by default. Read what encrypted sync protects and its limits.
                        </p>
                    )}
                </div>
                {expanded ? (
                    <ChevronDown className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                ) : (
                    <ChevronRight className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                )}
            </button>

            {expanded && (
                <div className="mt-3 sm:mt-4">
                    <GuardrailBanner tone="info" icon={Shield01} title="Private by design" className="mb-4">
                        Your case documentation stays on this device unless you opt in to encrypted sync or download a backup file.
                        Fair Go cannot read your case contents in plaintext.
                    </GuardrailBanner>

                    <p className="text-sm font-medium text-secondary">Encrypted sync is designed to protect against</p>
                    <CopyList
                        items={[
                            "A server breach or stolen database: attackers get ciphertext and wrapped keys, not your case.",
                            "Insider access or casual staff browsing: we have no server-side decryption path.",
                            "Legal requests for case contents: we can only produce ciphertext we cannot decrypt.",
                            "Your employer accessing Fair Go: encrypted data is not on employer systems.",
                            "Cross-border exposure of case contents: only ciphertext is stored, in Australia (Sydney).",
                        ]}
                    />

                    <p className="mt-5 text-sm font-medium text-secondary">Encrypted sync does not protect against</p>
                    <CopyList
                        items={[
                            "Malware or keyloggers on your device: use a personal device you trust.",
                            "A weak or reused passphrase under targeted guessing: choose a strong, unique passphrase.",
                            "Losing both your passphrase and recovery key: we cannot reset encryption for you.",
                            "A compromised website delivery (browser apps load crypto code from our server): see Privacy Policy.",
                            "Metadata: your email shows you have an account; your deadline date may be stored in plaintext for reminders.",
                        ]}
                    />

                    <p className="mt-5 text-sm text-tertiary">
                        Full details, including the deadline-date exception and how local storage works, are in our{" "}
                        <Link
                            to="/privacy#encrypted-sync"
                            className="font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            )}
        </section>
    );
};

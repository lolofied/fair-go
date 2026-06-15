import type { ReactNode } from "react";
import { Link } from "react-router";
import { Shield01 } from "@untitledui/icons";
import { GuardrailBanner } from "@/case/components/guardrail";

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <div className="mt-4">{children}</div>
    </section>
);

const CopyList = ({ items }: { items: string[] }) => (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-tertiary marker:text-quaternary">
        {items.map((item) => (
            <li key={item}>{item}</li>
        ))}
    </ul>
);

export const PrivacySecurityCard = () => (
    <Card title="Privacy and security">
        <GuardrailBanner tone="info" icon={Shield01} title="Private by design" className="mb-4">
            Your case documentation stays on this device unless you opt in to encrypted sync or download a backup file.
            Fair Go cannot read your case contents in plaintext.
        </GuardrailBanner>

        <p className="text-sm font-medium text-secondary">Encrypted sync is designed to protect against</p>
        <CopyList
            items={[
                "A server breach or stolen database — attackers get ciphertext and wrapped keys, not your case.",
                "Insider access or casual staff browsing — we have no server-side decryption path.",
                "Legal requests for case contents — we can only produce ciphertext we cannot decrypt.",
                "Your employer accessing Fair Go — encrypted data is not on employer systems.",
                "Cross-border exposure of case contents — only ciphertext is stored, in Australia (Sydney).",
            ]}
        />

        <p className="mt-5 text-sm font-medium text-secondary">Encrypted sync does not protect against</p>
        <CopyList
            items={[
                "Malware or keyloggers on your device — use a personal device you trust.",
                "A weak or reused passphrase under targeted guessing — choose a strong, unique passphrase.",
                "Losing both your passphrase and recovery key — we cannot reset encryption for you.",
                "A compromised website delivery (browser apps load crypto code from our server) — see Privacy Policy.",
                "Metadata — your email shows you have an account; your deadline date may be stored in plaintext for reminders.",
            ]}
        />

        <p className="mt-5 text-sm text-tertiary">
            Full details, including the deadline-date exception and how local storage works, are in our{" "}
            <Link to="/privacy#encrypted-sync" className="font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover">
                Privacy Policy
            </Link>
            .
        </p>
    </Card>
);

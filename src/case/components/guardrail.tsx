import { AlertTriangle, Lock01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

type GuardrailTone = "warning" | "info";

const TONES: Record<GuardrailTone, { wrap: string; icon: string }> = {
    warning: { wrap: "border-warning bg-warning-primary", icon: "text-fg-warning-primary" },
    info: { wrap: "border-brand bg-brand-primary", icon: "text-fg-brand-primary" },
};

export const GuardrailBanner = ({
    tone = "warning",
    icon: Icon = AlertTriangle,
    title,
    children,
    className,
}: {
    tone?: GuardrailTone;
    icon?: typeof AlertTriangle;
    title: string;
    children: React.ReactNode;
    className?: string;
}) => {
    const t = TONES[tone];
    return (
        <div className={cx("flex items-start gap-3 rounded-xl border p-4", t.wrap, className)}>
            <Icon className={cx("mt-0.5 size-5 shrink-0", t.icon)} aria-hidden="true" />
            <div>
                <p className="text-sm font-semibold text-primary">{title}</p>
                <div className="mt-1 text-sm text-tertiary">{children}</div>
            </div>
        </div>
    );
};

/** Reused at every upload / capture point (PRD principle #2). */
export const ExfiltrationGuardrail = ({ className }: { className?: string }) => (
    <GuardrailBanner
        tone="warning"
        icon={AlertTriangle}
        title="Upload your documents, not confidential company files"
        className={className}
    >
        Your contract, key letters, emails to you, and payslips are fine. So are your own notes. Do not upload
        confidential company files you were not allowed to take. That can breach your contract.
    </GuardrailBanner>
);

/** Personal-account-first warning, shown prominently in onboarding. */
export const PersonalAccountGuardrail = ({ className }: { className?: string }) => (
    <GuardrailBanner tone="warning" icon={Lock01} title="Use a personal device and personal email only" className={className}>
        Never use your work email, a work laptop or phone, or your employer's network or VPN for any of this. If your
        employer can see it, the value of documenting your case disappears, and it may be used against you. Work on a
        personal device, signed in to a personal account.
    </GuardrailBanner>
);

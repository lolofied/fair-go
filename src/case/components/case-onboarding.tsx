import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, HardDrive, Lock01, ShieldTick } from "@untitledui/icons";
import type { FC } from "react";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

const ONBOARDING_KEY = "fairgo.case.onboarding.v1";

interface OnboardingStep {
    id: string;
    icon: FC<{ className?: string }>;
    color: "warning" | "brand" | "gray" | "error";
    title: string;
    body: string;
}

const STEPS: OnboardingStep[] = [
    {
        id: "personal_device",
        icon: Lock01,
        color: "warning",
        title: "Use a personal device and personal email only",
        body: "Never use your work email, a work laptop or phone, or your employer's network or VPN for any of this. If your employer can see it, the value of documenting your case disappears, and it may be used against you. Work on a personal device, signed in to a personal account.",
    },
    {
        id: "exfiltration",
        icon: ShieldTick,
        color: "error",
        title: "Document your own experience, don't take company files",
        body: "Capture your own notes, what was said, and communications addressed to you. Do not upload confidential company documents you weren't given access to for this purpose. Taking files you shouldn't have can put you in breach of your contract and hand your employer a reason to act against you.",
    },
    {
        id: "local_storage",
        icon: HardDrive,
        color: "brand",
        title: "Your case stays on this device",
        body: "Nothing you record here is sent to our servers by default. That keeps it private, but your browser can lose it. From Settings, download an encrypted backup or create a sync account to retrieve your case on another device, especially before clearing your browser or switching devices.",
    },
];

function hasSeenOnboarding(): boolean {
    if (typeof window === "undefined") return true;
    try {
        return window.localStorage.getItem(ONBOARDING_KEY) === "1";
    } catch {
        return true;
    }
}

function markOnboardingSeen(): void {
    try {
        window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
        /* storage may be unavailable */
    }
}

/** One-time onboarding modals shown the first time someone enters the case module. */
export const CaseOnboarding = () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!hasSeenOnboarding()) setOpen(true);
    }, []);

    const current = STEPS[step];
    const isFirst = step === 0;
    const isLast = step >= STEPS.length - 1;

    const finish = () => {
        markOnboardingSeen();
        setOpen(false);
    };

    const goBack = () => setStep((s) => Math.max(0, s - 1));
    const goForward = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));

    const next = () => {
        if (isLast) finish();
        else goForward();
    };

    if (!open || !current) return null;

    return (
        <ModalOverlay
            isOpen={open}
            onOpenChange={() => {}}
            isDismissable={false}
            className="items-center justify-center sm:items-center"
        >
            <Modal className="max-w-md">
                <Dialog className="w-full items-center justify-center outline-hidden">
                    <div className="w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                        <FeaturedIcon icon={current.icon} color={current.color} theme="light" size="lg" />

                        <p className="mt-5 text-xs font-semibold tracking-wide text-tertiary uppercase">Before you start</p>
                        <h2 className="mt-2 text-display-xs font-semibold text-primary">{current.title}</h2>
                        <p className="mt-3 text-md text-tertiary">{current.body}</p>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                                <ButtonUtility
                                    size="sm"
                                    color="secondary"
                                    icon={ChevronLeft}
                                    aria-label="Previous"
                                    isDisabled={isFirst}
                                    onClick={goBack}
                                />
                                <span className="min-w-10 text-center text-sm font-medium tabular-nums text-secondary" aria-live="polite">
                                    {step + 1}/{STEPS.length}
                                </span>
                                <ButtonUtility
                                    size="sm"
                                    color="secondary"
                                    icon={ChevronRight}
                                    aria-label="Next"
                                    isDisabled={isLast}
                                    onClick={goForward}
                                />
                            </div>
                            <Button color="primary" size="lg" onClick={next}>
                                {isLast ? "Got it, let's go" : "Next"}
                            </Button>
                        </div>

                        {step === 0 && (
                            <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-primary px-3 py-2 text-xs text-tertiary">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                                Fair Go is not a law firm. This tool helps you organise your facts, not give legal advice.
                            </p>
                        )}
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

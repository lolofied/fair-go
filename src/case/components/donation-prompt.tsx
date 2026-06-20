import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { BuyMeACoffeeIcon } from "@/components/foundations/buy-me-a-coffee-icon";
import { DONATION_URL } from "@/config/donation";
import {
    hasSeenDonationPrompt,
    isDonationPromptEligible,
    markDonationPromptSeen,
} from "@/case/donation-prompt-state";
import { useCase } from "@/case/store";

/** One-time bottom-right prompt after the user adds at least two events or evidence files. */
export const DonationPrompt = () => {
    const { file } = useCase();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!file || !isDonationPromptEligible(file) || hasSeenDonationPrompt()) {
            setOpen(false);
            return;
        }

        const timer = window.setTimeout(() => setOpen(true), 800);
        return () => window.clearTimeout(timer);
    }, [file]);

    const dismiss = () => {
        markDonationPromptSeen();
        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open ? (
                <motion.aside
                    role="dialog"
                    aria-labelledby="donation-prompt-title"
                    aria-describedby="donation-prompt-description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed right-4 bottom-4 z-40 w-[min(100%,20rem)] rounded-2xl border border-secondary bg-primary p-4 shadow-xl print:hidden sm:p-5"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center">
                            <BuyMeACoffeeIcon size={28} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h2 id="donation-prompt-title" className="text-sm font-semibold text-primary">
                                    Enjoying Fair Go?
                                </h2>
                                <CloseButton size="sm" theme="light" label="Dismiss" onPress={dismiss} />
                            </div>
                            <p id="donation-prompt-description" className="mt-1 text-sm text-tertiary">
                                Fair Go is free to use. If it is helping you, you can chip in to keep it running.
                            </p>
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Button
                                    size="sm"
                                    color="primary"
                                    href={DONATION_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={dismiss}
                                >
                                    Support Fair Go
                                </Button>
                                <Button size="sm" color="link-gray" onClick={dismiss}>
                                    Not now
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.aside>
            ) : null}
        </AnimatePresence>
    );
};

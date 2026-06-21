import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import {
    hasDismissedPrepRecordPrompt,
    markPrepRecordPromptDismissed,
} from "@/checker/prep-record-prompt-state";

interface PrepRecordPromptProps {
    onStart: () => void;
}

/** Bottom-right prompt for users still employed who want to start documenting early. */
export const PrepRecordPrompt = ({ onStart }: PrepRecordPromptProps) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (hasDismissedPrepRecordPrompt()) {
            setOpen(false);
            return;
        }

        const timer = window.setTimeout(() => setOpen(true), 800);
        return () => window.clearTimeout(timer);
    }, []);

    const dismiss = () => {
        markPrepRecordPromptDismissed();
        setOpen(false);
    };

    const start = () => {
        markPrepRecordPromptDismissed();
        setOpen(false);
        onStart();
    };

    return (
        <AnimatePresence>
            {open ? (
                <motion.aside
                    role="dialog"
                    aria-labelledby="prep-record-prompt-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed right-4 bottom-4 z-40 w-[min(100%,17.5rem)] rounded-2xl border border-secondary bg-brand-primary p-4 shadow-xl print:hidden"
                >
                    <div className="flex items-start justify-between gap-2">
                        <p id="prep-record-prompt-title" className="text-sm text-tertiary">
                            Still employed but worried things might escalate?
                        </p>
                        <CloseButton size="sm" theme="light" label="Dismiss" onPress={dismiss} />
                    </div>
                    <Button color="link-color" size="sm" className="mt-1 !justify-start !px-0" onClick={start}>
                        Start a private record
                    </Button>
                </motion.aside>
            ) : null}
        </AnimatePresence>
    );
};

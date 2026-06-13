import type { PropsWithChildren } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { Countdown } from "@/checker/components/countdown";
import { ProgressBar } from "@/checker/components/progress-bar";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { daysRemaining, progressFor } from "@/checker/logic";
import { useChecker } from "@/checker/store";
import type { StepId } from "@/checker/types";

export const CheckerShell = ({ step, children }: PropsWithChildren<{ step: StepId }>) => {
    const { answers, back } = useChecker();
    const progress = progressFor(step, answers);
    const remaining = daysRemaining(answers.effective_date);

    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            <ProgressBar value={progress} />

            <header className="flex items-center justify-between px-5 py-4 sm:px-8">
                <Button color="tertiary" size="md" iconLeading={ArrowLeft} onClick={back}>
                    Back
                </Button>
                <div className="flex items-center gap-4">
                    {remaining !== null && <Countdown daysRemaining={remaining} />}
                    <FairGoWordmark className="hidden sm:flex" />
                </div>
            </header>

            <main className="flex flex-1 items-start justify-center px-5 py-6 sm:items-center sm:py-10">
                <div className="w-full max-w-xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

import type { PropsWithChildren } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { Shell, ShellContent, ShellHeader, ShellMain } from "@/components/layout/shell";
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
        <Shell>
            <ProgressBar value={progress} />

            <ShellHeader>
                <Button color="tertiary" size="sm" iconLeading={ArrowLeft} onClick={back} aria-label="Back" className="shrink-0">
                    <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    {remaining !== null && <Countdown daysRemaining={remaining} />}
                    <FairGoWordmark className="hidden shrink-0 sm:flex" />
                </div>
            </ShellHeader>

            <ShellMain align="start">
                <ShellContent width="wizard">
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
                </ShellContent>
            </ShellMain>
        </Shell>
    );
};

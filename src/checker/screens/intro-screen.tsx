import { ArrowRight, Scales02 } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { HighlightUnderline } from "@/checker/components/highlight-underline";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { useChecker } from "@/checker/store";

export const IntroScreen = () => {
    const { start, resume, answers } = useChecker();
    const hasProgress = Object.keys(answers).length > 0;

    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            <header className="flex items-center justify-between px-5 py-4 sm:px-8">
                <FairGoWordmark />
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary">
                    <Scales02 className="size-4" /> Australian unfair dismissal
                </span>
            </header>

            <main className="flex flex-1 items-center justify-center px-5 py-10">
                <div className="w-full max-w-[968px] text-center">
                    <h1 className="text-[56px] leading-[64px] font-semibold tracking-tight text-primary">
                        Were you{" "}
                        <span className="relative inline-block whitespace-nowrap">
                            unfairly dismissed
                            <HighlightUnderline />
                        </span>
                        ?
                    </h1>

                    <p className="mx-auto mt-4 max-w-[720px] text-xl text-tertiary">
                        Find out in about 90 seconds whether you likely have an unfair dismissal claim under the Fair Work
                        Act, and exactly how long you have left to act.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        <Button size="xl" color="primary" iconTrailing={ArrowRight} onClick={hasProgress ? resume : start}>
                            {hasProgress ? "Resume my check" : "Start my free check"}
                        </Button>
                        <span className="text-sm text-tertiary">
                            No payment. No commitment. Your answers stay private.
                        </span>
                    </div>
                </div>
            </main>

            <footer className="border-t border-secondary px-5 py-6 sm:px-8">
                <div className="mx-auto flex max-w-[968px] flex-col items-center gap-4">
                    <p className="text-center text-sm text-tertiary">
                        Fair Go is not a law firm and this tool is not legal advice. It helps you document your situation
                        and understand your options. For advice about your specific circumstances, speak to an employment
                        lawyer or contact the{" "}
                        <a className="font-medium text-brand-secondary underline" href="https://www.fwc.gov.au" target="_blank" rel="noreferrer">
                            Fair Work Commission
                        </a>
                        .
                    </p>
                    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-tertiary">
                        <Link to="/privacy" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                            Terms of Use
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
};

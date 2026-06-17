import { ArrowRight, LogIn01 } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import {
    HeroLead,
    HeroTitle,
    mobileBtnClass,
    Shell,
    ShellContent,
    ShellFooter,
    ShellHeader,
    ShellMain,
} from "@/components/layout/shell";
import { HighlightUnderline } from "@/checker/components/highlight-underline";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { useChecker } from "@/checker/store";
import { trackCheckerStarted } from "@/analytics/product-analytics";
import { isSyncConfigured } from "@/config/supabase";

export const IntroScreen = () => {
    const { start, resume, answers } = useChecker();
    const hasProgress = Object.keys(answers).length > 0;
    const showRetrieve = isSyncConfigured();

    const onStart = () => {
        trackCheckerStarted(hasProgress ? "resume" : "new");
        if (hasProgress) resume();
        else start();
    };

    return (
        <Shell>
            <ShellHeader>
                <FairGoWordmark />
                {showRetrieve ? (
                    <Button href="/case/retrieve" size="sm" color="secondary" iconLeading={LogIn01}>
                        <span className="sm:hidden">Retrieve</span>
                        <span className="hidden sm:inline">Retrieve my case</span>
                    </Button>
                ) : null}
            </ShellHeader>

            <ShellMain>
                <ShellContent width="marketing" className="text-center">
                    <HeroTitle>
                        Were you{" "}
                        <span className="relative inline-block sm:whitespace-nowrap">
                            unfairly dismissed
                            <HighlightUnderline />
                        </span>
                        ?
                    </HeroTitle>

                    <HeroLead className="mx-auto mt-3 max-w-[720px] sm:mt-4">
                        Find out in about 90 seconds whether you likely have an unfair dismissal claim under the Fair Work
                        Act, and exactly how long you have left to act.
                    </HeroLead>

                    <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
                        <Button
                            size="xl"
                            color="primary"
                            iconTrailing={ArrowRight}
                            className={mobileBtnClass}
                            onClick={onStart}
                        >
                            {hasProgress ? "Resume my check" : "Start my free check"}
                        </Button>
                        <span className="text-sm text-tertiary">
                            No payment. No commitment. Your answers stay private.
                        </span>
                    </div>
                </ShellContent>
            </ShellMain>

            <ShellFooter>
                <div className="mx-auto flex max-w-[968px] flex-col items-center gap-3 sm:gap-4">
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
            </ShellFooter>
        </Shell>
    );
};

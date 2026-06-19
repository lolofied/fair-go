import { ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { HeroLead, HeroTitle, mobileBtnClass, Shell, ShellContent, ShellMain } from "@/components/layout/shell";
import { HighlightUnderline } from "@/checker/components/highlight-underline";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { PageMeta } from "@/components/seo/page-meta";
import { useChecker } from "@/checker/store";
import { trackCheckerStarted } from "@/analytics/product-analytics";

export const IntroScreen = () => {
    const { start, resume, answers } = useChecker();
    const hasProgress = Object.keys(answers).length > 0;

    const onStart = () => {
        trackCheckerStarted(hasProgress ? "resume" : "new");
        if (hasProgress) resume();
        else start();
    };

    return (
        <Shell>
            <PageMeta
                title="Fair Go | Free unfair dismissal eligibility check"
                description="Free, 90-second check for whether you may have an Australian unfair dismissal claim under the Fair Work Act, and how long you have left to act. Not legal advice."
            />
            <LandingHeader />

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

            <LandingFooter />
        </Shell>
    );
};

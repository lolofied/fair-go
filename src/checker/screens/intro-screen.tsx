import { useRef } from "react";
import { ArrowRight } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { arrowSlideClass, HeroLead, HeroTitle, mobileBtnClass, Shell, ShellContent } from "@/components/layout/shell";
import { cx } from "@/utils/cx";
import { BackToTopButton } from "@/checker/components/back-to-top-button";
import { DocumentationPreview } from "@/checker/components/documentation-preview";
import { HighlightUnderline } from "@/checker/components/highlight-underline";
import { PrepRecordPrompt } from "@/checker/components/prep-record-prompt";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import {
    HowItWorksSection,
    LandingClosingCta,
    LandingFaqSection,
    OutcomesAndFeaturesSection,
} from "@/checker/components/landing-sections";
import { PageMeta } from "@/components/seo/page-meta";
import { useChecker } from "@/checker/store";
import { trackCheckerStarted, trackDocumentationStarted } from "@/analytics/product-analytics";
import { setDocumentationEntry } from "@/case/documentation-entry";

export const IntroScreen = () => {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLElement>(null);
    const { start, resume, answers } = useChecker();
    const hasProgress = Object.keys(answers).length > 0;

    const onStart = () => {
        trackCheckerStarted(hasProgress ? "resume" : "new");
        if (hasProgress) resume();
        else start();
    };

    const onStartPrepRecord = () => {
        setDocumentationEntry("prep");
        trackDocumentationStarted("prep");
        navigate("/case");
    };

    return (
        <Shell>
            <PageMeta
                title="Fair Go | Free unfair dismissal eligibility check"
                description="Free, 90-second check for whether you may have an Australian unfair dismissal claim under the Fair Work Act, and how long you have left to act. Not legal advice."
            />
            <LandingHeader onStartCheck={onStart} />

            <div className="fg-landing-sections">
                <section ref={heroRef} className="w-full">
                    <div className="fg-landing-panel fg-landing-blue-wash min-h-[calc(100svh-64px)] overflow-hidden pb-0 pt-8 sm:pt-12">
                        <div className="fg-landing-section-content">
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
                                    Find out in 90 seconds whether you likely have an unfair dismissal claim under the Fair Work Act,
                                    and how long you have to act.
                                </HeroLead>

                                <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
                                    <Button
                                        size="xl"
                                        color="primary"
                                        iconTrailing={ArrowRight}
                                        className={cx(mobileBtnClass, arrowSlideClass)}
                                        onClick={onStart}
                                    >
                                        {hasProgress ? "Resume my check" : "Start my free check"}
                                    </Button>
                                    <span className="text-sm text-tertiary">
                                        No payment. No commitment. Your answers stay private.
                                    </span>
                                </div>

                                <DocumentationPreview />
                            </ShellContent>
                        </div>
                    </div>
                </section>

                <HowItWorksSection onStart={onStart} hasProgress={hasProgress} />
                <OutcomesAndFeaturesSection />
                <LandingClosingCta onStart={onStart} hasProgress={hasProgress} />
                <LandingFaqSection />
            </div>

            <LandingFooter />
            <BackToTopButton anchorRef={heroRef} />
            <PrepRecordPrompt onStart={onStartPrepRecord} />
        </Shell>
    );
};

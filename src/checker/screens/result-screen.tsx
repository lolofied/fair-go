import type { ReactNode } from "react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    FileShield02,
    HelpCircle,
    RefreshCcw01,
    Scales02,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Countdown } from "@/checker/components/countdown";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { getHighIncomeThreshold } from "@/config/fair-work";
import {
    coverageSatisfied,
    computeFlags,
    computeOutcome,
    daysRemaining,
    minEmploymentMonths,
    parseISODate,
    sizeBucket,
    tenure,
} from "@/checker/logic";
import { useChecker } from "@/checker/store";
import type { CheckerAnswers, CheckerFlag, OutcomeBucket } from "@/checker/types";
import { cx } from "@/utils/cx";

const currency = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

interface OutcomeCopy {
    eyebrow: string;
    title: string;
    summary: string;
    tone: "success" | "brand" | "neutral" | "error";
}

function outcomeCopy(bucket: OutcomeBucket, a: CheckerAnswers): OutcomeCopy {
    if (bucket === 2 && a.dismissed === "not_yet") {
        return {
            eyebrow: "Prepare now",
            title: "You haven't been dismissed yet, so this is the best time to act.",
            summary:
                "Nothing has happened that you can lodge today, but the strongest cases are built before a dismissal. Start documenting everything now so you're ready to move within 21 days if it comes to that.",
            tone: "brand",
        };
    }
    switch (bucket) {
        case 1:
            return {
                eyebrow: "Looks eligible",
                title: "Your situation looks eligible for an unfair dismissal claim.",
                summary:
                    "Based on your answers, the main eligibility checkpoints are met. The next step is to document what happened clearly and quickly, while it's fresh and within time.",
                tone: "success",
            };
        case 2:
            return {
                eyebrow: "Possibly eligible",
                title: "You may have a claim, but your situation has some complexity.",
                summary:
                    "There are one or two things that need a closer look before anyone can be sure. That's normal, and it's exactly the kind of thing a lawyer can resolve quickly once your file is organised.",
                tone: "brand",
            };
        case 3:
            return {
                eyebrow: "Other options",
                title: "Unfair dismissal may not be the right path, but you may have others.",
                summary:
                    "Unfair dismissal protects people whose employment was ended by their employer. Your answers suggest that may not fit, but other claims could, and they're worth asking a lawyer about.",
                tone: "neutral",
            };
        case 4:
            return {
                eyebrow: "Time-sensitive",
                title: "The standard 21-day window has closed, but don't stop here.",
                summary:
                    "The usual deadline to lodge has passed, but the Fair Work Commission can accept late applications in exceptional circumstances. This is genuinely urgent, so speak to a lawyer as soon as possible.",
                tone: "error",
            };
    }
}

const FLAG_NOTES: Record<CheckerFlag, { title: string; body: string }> = {
    constructive_dismissal: {
        title: "Forced resignation (constructive dismissal)",
        body: "You'll need to show you were left with no real choice but to resign. Save every message, email and note about what led to it.",
    },
    fixed_term_complexity: {
        title: "Fixed-term or contract role",
        body: "Whether you're protected depends on the contract terms and whether the end was genuine. It's worth a lawyer's eye.",
    },
    casual_question: {
        title: "Casual employment",
        body: "Casuals can still claim unfair dismissal where the work was regular and systematic with a reasonable expectation it would continue.",
    },
    redundancy_to_review: {
        title: "Redundancy",
        body: "A genuine redundancy isn't unfair dismissal, but if you weren't consulted, or the role still effectively exists, you may still have a claim.",
    },
    high_income_borderline: {
        title: "Earnings near the high income threshold",
        body: "Your pay is close to the cap. Award or agreement coverage, and how earnings are calculated (super is excluded), can be decisive.",
    },
    employer_size_uncertain: {
        title: "Employer size unclear",
        body: "Headcount sets your minimum employment period and whether the Small Business Code applies, including any associated entities.",
    },
    sham_contracting: {
        title: "Engaged as a contractor",
        body: "If you were really an employee in substance, you may still be protected. The label on paper isn't the end of the story (sham contracting).",
    },
    below_minimum_period: {
        title: "Minimum employment period",
        body: "Your time in the role may be under the minimum (6 or 12 months). Ask about exceptions: earlier service, associated entities or a transfer of business can count.",
    },
    coverage_uncertain: {
        title: "Award or agreement coverage",
        body: "We assumed you're covered where you weren't sure. Confirming this matters most if your earnings are near the threshold.",
    },
};

const TONE_RING: Record<OutcomeCopy["tone"], string> = {
    success: "text-fg-success-primary",
    brand: "text-fg-brand-primary",
    neutral: "text-fg-tertiary",
    error: "text-fg-error-primary",
};

const TONE_ICON: Record<OutcomeCopy["tone"], typeof CheckCircle> = {
    success: CheckCircle,
    brand: FileShield02,
    neutral: Scales02,
    error: AlertTriangle,
};

const SummaryRow = ({ label, value, ok }: { label: string; value: ReactNode; ok?: boolean | null }) => (
    <div className="flex items-start justify-between gap-4 border-b border-secondary py-3 last:border-0">
        <span className="text-sm text-tertiary">{label}</span>
        <span
            className={cx(
                "text-right text-sm font-medium",
                ok === true ? "text-fg-success-primary" : ok === false ? "text-fg-error-primary" : "text-primary",
            )}
        >
            {value}
        </span>
    </div>
);

export const ResultScreen = () => {
    const { answers, reset, goToStep } = useChecker();
    const bucket = computeOutcome(answers);
    const copy = outcomeCopy(bucket, answers);
    const flags = computeFlags(answers);
    const remaining = daysRemaining(answers.effective_date);

    const size = sizeBucket(answers);
    const minMonths = minEmploymentMonths(answers);
    const { months, meetsMinimum } = tenure(answers);
    const threshold = getHighIncomeThreshold(parseISODate(answers.effective_date));
    const coverageOk = coverageSatisfied(answers);
    const Icon = TONE_ICON[copy.tone];

    const sizeLabel = size === "small" ? "Small business" : size === "large" ? "15+ employees" : "Unsure";

    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            <header className="flex items-center justify-between px-5 py-4 sm:px-8">
                <FairGoWordmark />
                <Button color="tertiary" size="md" iconLeading={RefreshCcw01} onClick={reset}>
                    Start over
                </Button>
            </header>

            <main className="flex flex-1 justify-center px-5 py-8 sm:py-12">
                <div className="w-full max-w-2xl">
                    <div className="flex items-center gap-2">
                        <Icon className={cx("size-5", TONE_RING[copy.tone])} />
                        <span className={cx("text-sm font-semibold tracking-wide uppercase", TONE_RING[copy.tone])}>
                            {copy.eyebrow}
                        </span>
                    </div>

                    <h1 className="mt-3 text-display-sm font-semibold tracking-tight text-primary">{copy.title}</h1>
                    <p className="mt-4 text-lg text-tertiary">{copy.summary}</p>

                    {remaining !== null && <Countdown variant="block" daysRemaining={remaining} className="mt-8" />}

                    {/* Key facts */}
                    <section className="mt-8 rounded-2xl border border-secondary bg-secondary/40 p-5">
                        <h2 className="text-sm font-semibold text-primary">Your answers at a glance</h2>
                        <div className="mt-2">
                            {answers.start_date && (
                                <SummaryRow
                                    label={`Time in the role (minimum ${minMonths} months${size === "small" ? ", small business" : ""})`}
                                    value={`${Math.floor(months)} months`}
                                    ok={meetsMinimum}
                                />
                            )}
                            <SummaryRow label="Employer size" value={sizeLabel} />
                            <SummaryRow
                                label="Award / agreement coverage"
                                value={coverageOk ? "Covered or under threshold" : "May exceed threshold"}
                                ok={coverageOk}
                            />
                            <SummaryRow
                                label={`High income threshold (${threshold.label})`}
                                value={currency.format(threshold.amount)}
                            />
                            {typeof answers.salary === "number" && (
                                <SummaryRow label="Your stated salary (excl. super)" value={currency.format(answers.salary)} />
                            )}
                        </div>
                    </section>

                    {/* Complexity / things to ask a lawyer */}
                    {flags.length > 0 && (
                        <section className="mt-8">
                            <h2 className="flex items-center gap-2 text-md font-semibold text-primary">
                                <HelpCircle className="size-5 text-fg-brand-primary" />
                                Things to ask a lawyer about
                            </h2>
                            <ul className="mt-3 flex flex-col gap-3">
                                {flags.map((flag) => (
                                    <li key={flag} className="rounded-xl border border-secondary p-4">
                                        <p className="text-md font-medium text-primary">{FLAG_NOTES[flag].title}</p>
                                        <p className="mt-1 text-sm text-tertiary">{FLAG_NOTES[flag].body}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Other options for bucket 3 */}
                    {bucket === 3 && (
                        <section className="mt-8 rounded-2xl border border-secondary p-5">
                            <h2 className="text-md font-semibold text-primary">Other options worth raising</h2>
                            <ul className="mt-2 list-disc pl-5 text-sm text-tertiary">
                                <li>General protections (adverse action), which has its own strict dismissal deadlines.</li>
                                <li>Discrimination claims, if you were treated unfairly for a protected reason.</li>
                                <li>Breach of contract or unpaid entitlements.</li>
                            </ul>
                        </section>
                    )}

                    {/* Primary CTA into the documentation flow */}
                    <section className="mt-10 rounded-2xl border border-brand bg-brand-primary p-6">
                        <h2 className="text-display-xs font-semibold text-primary">
                            Build your lawyer-ready package
                        </h2>
                        <p className="mt-2 text-md text-tertiary">
                            Turn these answers into an organised timeline and document set a lawyer can act on in minutes,
                            without re-entering anything you've told us.
                        </p>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button size="xl" color="primary" iconTrailing={ArrowRight}>
                                Start documenting
                            </Button>
                            <span className="text-sm text-tertiary">
                                One-off export when you're ready · launching soon
                            </span>
                        </div>
                    </section>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button color="secondary" size="md" onClick={() => goToStep("dismissed")}>
                            Review my answers
                        </Button>
                    </div>

                    <p className="mt-10 border-t border-secondary pt-6 text-sm text-tertiary">
                        This is general information, not legal advice, and isn't a guarantee of any outcome. Eligibility for
                        unfair dismissal is ultimately decided by the Fair Work Commission. For advice on your situation,
                        speak to an employment lawyer.
                    </p>
                </div>
            </main>
        </div>
    );
};

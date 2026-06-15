import { useEffect } from "react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Edit01,
    HelpCircle,
    InfoCircle,
    RefreshCcw01,
    Scales02,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { mobileBtnClass, Shell, ShellContent, ShellHeader, ShellMain } from "@/components/layout/shell";
import { Countdown } from "@/checker/components/countdown";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { trackClaimOutcome } from "@/checker/analytics";
import { toCapturedData } from "@/checker/claims";
import { useChecker } from "@/checker/store";
import type { ClaimAssessment, ClaimStatus, ClaimType, CheckerFlag } from "@/checker/types";
import { cx } from "@/utils/cx";

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" });

function formatISO(iso: string): string {
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

const CLAIM_TITLES: Record<ClaimType, string> = {
    unfair_dismissal: "Unfair dismissal",
    general_protections_dismissal: "General protections (dismissal)",
    general_protections_non_dismissal: "General protections (still employed)",
};

const STATUS_META: Record<ClaimStatus, { label: string; cardRing: string; badge: string }> = {
    likely: {
        label: "Looks viable",
        cardRing: "border-success",
        badge: "bg-success-secondary text-fg-success-primary",
    },
    possible_complex: {
        label: "Possible, worth a closer look",
        cardRing: "border-brand",
        badge: "bg-brand-secondary text-fg-brand-primary",
    },
    unlikely: {
        label: "May not apply",
        cardRing: "border-secondary",
        badge: "bg-secondary text-tertiary",
    },
    time_barred: {
        label: "Out of time",
        cardRing: "border-error_subtle",
        badge: "bg-error-secondary text-fg-error-primary",
    },
};

/** Notes for the "things to ask a lawyer about" list. Presence/positive flags and
 * banner-driven flags (election, non-dismissal path) are handled elsewhere. */
const FLAG_NOTES: Partial<Record<CheckerFlag, { title: string; body: string }>> = {
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
        body: "Your time in the role may be under the minimum (6 or 12 months). Unfair dismissal may not fit, but general protections has no minimum period.",
    },
    coverage_uncertain: {
        title: "Award or agreement coverage",
        body: "We assumed you're covered where you weren't sure. Confirming this matters most if your earnings are near the threshold.",
    },
    decision_maker_knowledge_unclear: {
        title: "Decision-maker's knowledge",
        body: "It's unclear whether the person who dismissed you knew about your complaint, entitlement, or attribute. This is the crux of a general protections claim, so try to establish it.",
    },
    temporal_proximity_short: {
        title: "Timing between the protected act and the dismissal",
        body: "How close in time these were can matter. Note the exact dates of what you did and when the action was taken.",
    },
};

const ClaimCard = ({ claim }: { claim: ClaimAssessment }) => {
    const meta = STATUS_META[claim.status];
    return (
        <div className={cx("fg-section-card", meta.cardRing)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-md font-semibold text-primary">{CLAIM_TITLES[claim.claimType]}</h3>
                <span className={cx("rounded-full px-2.5 py-1 text-xs font-semibold", meta.badge)}>{meta.label}</span>
            </div>

            {claim.deadline && (
                <p className="mt-2 text-sm text-tertiary">
                    {claim.deadline.daysRemaining < 0
                        ? `Window closed ${Math.abs(claim.deadline.daysRemaining)} ${Math.abs(claim.deadline.daysRemaining) === 1 ? "day" : "days"} ago`
                        : `${claim.deadline.daysRemaining} ${claim.deadline.daysRemaining === 1 ? "day" : "days"} left`}
                    {" · "}
                    {claim.deadline.basis} · closes {formatISO(claim.deadline.date)}
                </p>
            )}

            {(claim.supportingFacts.length > 0 || claim.weakeningFacts.length > 0 || claim.unmetGates.length > 0) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {claim.supportingFacts.length > 0 && (
                        <div>
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                <CheckCircle className="size-4 text-fg-success-primary" /> What supports it
                            </p>
                            <ul className="mt-2 flex flex-col gap-2">
                                {claim.supportingFacts.map((fact) => (
                                    <li key={fact} className="text-sm text-tertiary">
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {(claim.weakeningFacts.length > 0 || claim.unmetGates.length > 0) && (
                        <div>
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                <InfoCircle className="size-4 text-fg-tertiary" /> What to firm up
                            </p>
                            <ul className="mt-2 flex flex-col gap-2">
                                {claim.unmetGates.map((gate) => (
                                    <li key={gate} className="text-sm text-tertiary">
                                        {gate}
                                    </li>
                                ))}
                                {claim.weakeningFacts.map((fact) => (
                                    <li key={fact} className="text-sm text-tertiary">
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ResultScreen = () => {
    const { answers, reset, goToStep } = useChecker();
    const captured = toCapturedData(answers);
    const claims = captured.candidate_claims;
    const flags = captured.flags;

    const election = flags.includes("multiple_actions_election_required");
    const isNonDismissalPath = flags.includes("gp_non_dismissal_path");
    const remaining = captured.dismissal.days_remaining;
    const lawyerNotes = flags.filter((f): f is CheckerFlag => Boolean(FLAG_NOTES[f]));

    useEffect(() => {
        trackClaimOutcome(claims, flags);
        // Only fire once per landing on the result screen.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Shell>
            <ShellHeader>
                <FairGoWordmark />
                <div className="flex items-center gap-2">
                    {/* Icon-only on mobile, full label from sm up. */}
                    <Button
                        color="secondary"
                        size="md"
                        iconLeading={Edit01}
                        aria-label="Review my answers"
                        onClick={() => goToStep("dismissed")}
                        className="sm:hidden"
                    />
                    <Button
                        color="secondary"
                        size="md"
                        iconLeading={Edit01}
                        onClick={() => goToStep("dismissed")}
                        className="hidden sm:flex"
                    >
                        Review my answers
                    </Button>
                    <Button
                        color="tertiary"
                        size="md"
                        iconLeading={RefreshCcw01}
                        aria-label="Start over"
                        onClick={reset}
                        className="sm:hidden"
                    />
                    <Button color="tertiary" size="md" iconLeading={RefreshCcw01} onClick={reset} className="hidden sm:flex">
                        Start over
                    </Button>
                </div>
            </ShellHeader>

            <ShellMain align="start">
                <ShellContent>
                    <div className="flex items-center gap-2">
                        <Scales02 className="size-5 text-fg-brand-primary" />
                        <span className="text-sm font-semibold tracking-wide text-fg-brand-primary uppercase">
                            What your answers point to
                        </span>
                    </div>
                    <h1 className="mt-3 text-xl font-semibold tracking-tight text-primary sm:text-display-sm">
                        Here are the paths worth taking to a lawyer.
                    </h1>
                    <p className="mt-3 text-md text-tertiary sm:mt-4 sm:text-lg">
                        This organises your own answers into the claims a lawyer would weigh. It isn't legal advice or a
                        prediction. It's a head start, built so you don't re-enter anything.
                    </p>

                    {/* The 21-day deadline always renders above any claim output. */}
                    {!isNonDismissalPath && remaining !== null && (
                        <Countdown variant="block" daysRemaining={remaining} className="mt-8" />
                    )}

                    {/* Primary CTA into the documentation flow */}
                    <section className="fg-section-card mt-6 border-brand bg-brand-primary sm:mt-8">
                        <h2 className="text-lg font-semibold text-primary sm:text-display-xs">Build your lawyer-ready package</h2>
                        <p className="mt-2 text-sm text-tertiary sm:text-md">
                            Turn these answers into an organised timeline and document set a lawyer can act on in minutes,
                            without re-entering anything you've told us.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center">
                            <Button size="xl" color="primary" href="/case" iconTrailing={ArrowRight} className={mobileBtnClass}>
                                Start documenting
                            </Button>
                            <span className="text-sm text-tertiary">Private to your device · nothing leaves your browser</span>
                        </div>
                    </section>

                    {/* s.725 election warning: alternatives, never "lodge both". */}
                    {election && (
                        <div className="fg-section-card mt-6 flex items-start gap-3 border-warning bg-warning-primary sm:mt-8">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" />
                            <div>
                                <p className="text-md font-semibold text-primary">More than one path may be open to you</p>
                                <p className="mt-1 text-sm text-tertiary">
                                    Unfair dismissal and general protections are usually{" "}
                                    <span className="font-medium text-primary">alternative paths</span> for the same
                                    dismissal, and you generally can't pursue both. Which one to choose is a legal decision,
                                    so take both to a lawyer and decide together. Do not lodge both.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Still-employed (non-dismissal) note. */}
                    {isNonDismissalPath && (
                        <div className="fg-section-card mt-6 border-brand bg-brand-primary sm:mt-8">
                            <h2 className="text-md font-semibold text-primary">You haven't been dismissed, so a different path applies</h2>
                            <p className="mt-2 text-sm text-tertiary">
                                If you're being targeted while still employed, that can be a general protections matter
                                <span className="font-medium text-primary"> short of dismissal</span>. It runs on a longer
                                6-year window rather than the 21-day dismissal clock. The strongest move now is to document
                                everything and speak to a lawyer about your options.
                            </p>
                        </div>
                    )}

                    {/* Candidate claims */}
                    {claims.length > 0 && (
                        <section className="mt-8 flex flex-col gap-4">
                            {claims.map((claim) => (
                                <ClaimCard key={claim.claimType} claim={claim} />
                            ))}
                        </section>
                    )}

                    {/* No structured claim (e.g. voluntary resignation): never a dead end. */}
                    {claims.length === 0 && (
                        <section className="mt-8 rounded-2xl border border-secondary p-5">
                            <h2 className="text-md font-semibold text-primary">Other options worth raising</h2>
                            <ul className="mt-2 list-disc pl-5 text-sm text-tertiary">
                                <li>General protections (adverse action), which has its own strict deadlines.</li>
                                <li>Discrimination claims, if you were treated unfairly for a protected reason.</li>
                                <li>Breach of contract or unpaid entitlements.</li>
                            </ul>
                        </section>
                    )}

                    {/* Things to ask a lawyer about */}
                    {lawyerNotes.length > 0 && (
                        <section className="mt-8">
                            <h2 className="flex items-center gap-2 text-md font-semibold text-primary">
                                <HelpCircle className="size-5 text-fg-brand-primary" />
                                Things to ask a lawyer about
                            </h2>
                            <ul className="mt-3 flex flex-col gap-3">
                                {lawyerNotes.map((flag) => {
                                    const note = FLAG_NOTES[flag]!;
                                    return (
                                        <li key={flag} className="fg-section-card">
                                            <p className="text-md font-medium text-primary">{note.title}</p>
                                            <p className="mt-1 text-sm text-tertiary">{note.body}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    <p className="mt-8 border-t border-secondary pt-5 text-sm text-tertiary sm:mt-10 sm:pt-6">
                        This is general information, not legal advice, and isn't a guarantee of any outcome. Eligibility and
                        which path to pursue are ultimately decisions for you and your lawyer (and, where relevant, the Fair
                        Work Commission or a court). For advice on your situation, speak to an employment lawyer.
                    </p>
                </ShellContent>
            </ShellMain>
        </Shell>
    );
};

import type { FC, PropsWithChildren, ReactNode } from "react";
import { ArrowRight, CheckCircle, ChevronDown, Clock, Download01, Plus } from "@untitledui/icons";
import {
    BanknotesIcon,
    CalendarDaysIcon,
    DocumentMagnifyingGlassIcon,
    HandRaisedIcon,
    LockClosedIcon,
    UserGroupIcon,
    UsersIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/base/buttons/button";
import { CompensationRangeVisual } from "@/checker/components/compensation-range-visual";
import { LandingFeatureIcon } from "@/checker/components/landing-nav-icon";
import { LandingReveal, LandingRevealGroup, LandingRevealItem } from "@/checker/components/landing-reveal";
import { arrowSlideClass, mobileBtnClass } from "@/components/layout/shell";
import { getLegalConstants } from "@/config/legal-constants";
import { cx } from "@/utils/cx";

type LandingBand = "primary" | "secondary" | "blue-wash" | "dark" | "brand";

const LANDING_BAND_CLASS: Record<LandingBand, string> = {
    primary: "fg-landing-band-primary",
    secondary: "fg-landing-band-secondary",
    "blue-wash": "fg-landing-blue-wash",
    dark: "fg-landing-band-dark",
    brand: "fg-landing-band-brand",
};

const Section = ({
    band = "primary",
    className,
    children,
}: PropsWithChildren<{ band?: LandingBand; className?: string }>) => (
    <section className="w-full">
        <div
            className={cx(
                "fg-landing-panel w-full overflow-hidden py-16 sm:py-24",
                LANDING_BAND_CLASS[band],
                className,
            )}
        >
            <div className="fg-landing-section-content">{children}</div>
        </div>
    </section>
);

const SectionHeading = ({
    eyebrow,
    title,
    lead,
    inverted = false,
    className,
}: {
    eyebrow: string;
    title: ReactNode;
    lead?: ReactNode;
    inverted?: boolean;
    className?: string;
}) => (
    <div className={cx("mx-auto max-w-2xl text-center", className)}>
        <span className={cx("text-sm font-semibold", inverted ? "text-quaternary" : "text-brand-secondary")}>
            {eyebrow}
        </span>
        <h2
            className={cx(
                "mt-3 text-display-sm font-semibold tracking-tight sm:text-display-md",
                inverted ? "text-primary_on-brand" : "text-primary",
            )}
        >
            {title}
        </h2>
        {lead ? (
            <p className={cx("mt-4 text-lg", inverted ? "text-quaternary" : "text-tertiary")}>{lead}</p>
        ) : null}
    </div>
);

const FEATURES: { icon: FC<{ className?: string }>; hover: string; title: string; body: string }[] = [
    {
        icon: DocumentMagnifyingGlassIcon,
        hover: "group-hover:text-blue-500",
        title: "Free eligibility check",
        body: "Understand your options under the Fair Work Act in about 90 seconds. No payment, no account needed.",
    },
    {
        icon: LockClosedIcon,
        hover: "group-hover:text-rose-500",
        title: "Private by design",
        body: "Your record is encrypted on your own device. We can't read it, sell it, or be made to hand over what we can't see.",
    },
    {
        icon: CalendarDaysIcon,
        hover: "group-hover:text-amber-500",
        title: "Deadline tracking",
        body: "Unfair dismissal claims have a strict 21-day window. Fair Go shows exactly how long you have left.",
    },
    {
        icon: UserGroupIcon,
        hover: "group-hover:text-cyan-500",
        title: "Timeline, evidence & witnesses",
        body: "Keep dates, messages, documents, and people who saw what happened together in one organised place.",
    },
];

/* ------------------------------------------------------------------ */
/* Outcomes + features (combined)                                      */
/* ------------------------------------------------------------------ */

export const OutcomesAndFeaturesSection = () => (
    <Section band="blue-wash">
        <LandingReveal variant="text">
            <SectionHeading eyebrow="If your claim succeeds" title="Reinstatement or compensation" />
        </LandingReveal>

        <LandingRevealGroup className="mt-10 grid gap-4 md:grid-cols-2" stagger={0.18}>
            <LandingRevealItem variant="text">
                <div className="group rounded-2xl border border-secondary bg-primary p-6">
                    <LandingFeatureIcon icon={UsersIcon} size="lg" hover="group-hover:text-violet-500" />
                    <h3 className="mt-4 text-lg font-semibold text-primary">Reinstatement</h3>
                    <p className="mt-2 text-md text-tertiary">
                        The Fair Work Act's first option: getting your job back. The Commission must consider it, but it's
                        granted rarely.
                    </p>
                </div>
            </LandingRevealItem>
            <LandingRevealItem variant="text">
                <div className="group rounded-2xl border border-secondary bg-primary p-6">
                    <LandingFeatureIcon icon={BanknotesIcon} size="lg" hover="group-hover:text-emerald-500" />
                    <h3 className="mt-4 text-lg font-semibold text-primary">Compensation</h3>
                    <p className="mt-2 text-md text-tertiary">
                        Payment for lost income when reinstatement isn't workable. Most outcomes are a handful of weeks' pay,
                        not the headline cap.
                    </p>
                    <CompensationRangeVisual />
                </div>
            </LandingRevealItem>
        </LandingRevealGroup>

        <LandingReveal variant="text">
            <SectionHeading
                className="mt-16 sm:mt-20"
                eyebrow="What you get"
                title="Everything you need, on your side"
                lead="The other side has HR and lawyers. Fair Go gives you the tools to stand on equal footing."
            />
        </LandingReveal>

        <LandingRevealGroup className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.12}>
            {FEATURES.map(({ icon, hover, title, body }) => (
                <LandingRevealItem key={title} variant="text">
                    <div className="group flex flex-col rounded-2xl bg-primary/90 p-7 sm:p-8">
                        <LandingFeatureIcon icon={icon} size="lg" hover={hover} />
                        <h3 className="mt-5 text-lg font-semibold text-primary">{title}</h3>
                        <p className="mt-2 flex-1 text-md text-tertiary">{body}</p>
                    </div>
                </LandingRevealItem>
            ))}
        </LandingRevealGroup>
    </Section>
);

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const MockFrame = ({ children }: PropsWithChildren) => (
    <div className="flex min-h-[168px] flex-col gap-3 rounded-xl border border-secondary bg-secondary p-4">{children}</div>
);

const CheckMock = () => (
    <MockFrame>
        <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-brand-solid" />
            <span className="h-1.5 w-6 rounded-full bg-brand-solid" />
            <span className="h-1.5 w-6 rounded-full bg-quaternary" />
            <span className="h-1.5 w-6 rounded-full bg-quaternary" />
        </div>
        <p className="text-sm font-semibold text-primary">Were you dismissed?</p>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-brand bg-primary px-3 py-2">
                <span className="text-sm font-medium text-primary">Yes</span>
                <CheckCircle className="size-4 stroke-[1.5] text-fg-brand-primary" aria-hidden="true" />
            </div>
            <div className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-tertiary">No</div>
        </div>
    </MockFrame>
);

const TIMELINE_MOCK = [
    { label: "Final warning meeting", date: "12 Mar" },
    { label: "Performance email", date: "3 Apr" },
] as const;

const RecordMock = () => (
    <MockFrame>
        {TIMELINE_MOCK.map((entry, index) => (
            <div key={entry.label} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-brand-solid" />
                    {index < TIMELINE_MOCK.length - 1 ? <span className="w-px flex-1 bg-quaternary" /> : null}
                </div>
                <div>
                    <p className="text-sm font-medium text-primary">{entry.label}</p>
                    <p className="text-xs text-tertiary">{entry.date}</p>
                </div>
            </div>
        ))}
        <div className="mt-auto flex items-center gap-1.5 rounded-lg border border-dashed border-secondary px-3 py-2 text-xs font-medium text-tertiary">
            <Plus className="size-3.5 stroke-[1.5] text-fg-quaternary" aria-hidden="true" />
            Add to timeline
        </div>
    </MockFrame>
);

const ActMock = () => (
    <MockFrame>
        <div className="rounded-lg border border-secondary bg-primary p-3">
            <div className="flex items-center gap-2">
                <Clock className="size-4 stroke-[1.5] text-fg-brand-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-primary">14 days left to lodge</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-quaternary">
                <div className="h-full w-1/3 rounded-full bg-brand-solid" />
            </div>
        </div>
        <div className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-brand-solid px-3 py-2.5 text-sm font-semibold text-white">
            <Download01 className="size-4 stroke-[1.5]" aria-hidden="true" />
            Export summary
        </div>
    </MockFrame>
);

const STEPS: { title: string; body: string; mock: FC }[] = [
    {
        title: "Check where you stand",
        body: "Answer a few plain-English questions and find out in about 90 seconds whether you likely have a claim, and how long you have to act.",
        mock: CheckMock,
    },
    {
        title: "Build your private record",
        body: "Capture a timeline of what happened, with evidence and witnesses, while it's still fresh. Everything stays encrypted on your device.",
        mock: RecordMock,
    },
    {
        title: "Be ready to act",
        body: "Track your deadline and export a clear, organised summary you can take to a lawyer or use to push back yourself.",
        mock: ActMock,
    },
];

export const HowItWorksSection = ({ onStart, hasProgress }: { onStart: () => void; hasProgress: boolean }) => (
    <Section band="dark">
        <LandingReveal variant="text">
            <SectionHeading
                inverted
                eyebrow="How it works"
                title="From confused to prepared, fast"
                lead="Fair Go is there for you from the first sign of trouble"
            />
        </LandingReveal>

        <LandingReveal variant="text">
            <div className="mt-4 flex justify-center sm:mt-6">
                <Button
                    size="xl"
                    color="secondary"
                    iconTrailing={ArrowRight}
                    className={cx(mobileBtnClass, arrowSlideClass)}
                    onClick={onStart}
                >
                    {hasProgress ? "Resume my check" : "Get started"}
                </Button>
            </div>
        </LandingReveal>

        <ol className="mt-10 grid gap-6 lg:grid-cols-3">
            {STEPS.map((step) => {
                const Mock = step.mock;
                return (
                    <li key={step.title} className="list-none">
                        <LandingRevealGroup className="rounded-2xl border border-secondary bg-primary p-6" stagger={0.15}>
                            <LandingRevealItem variant="media">
                                <Mock />
                            </LandingRevealItem>
                            <LandingRevealItem variant="text">
                                <h3 className="mt-5 text-lg font-semibold text-primary">{step.title}</h3>
                                <p className="mt-2 text-md text-tertiary">{step.body}</p>
                            </LandingRevealItem>
                        </LandingRevealGroup>
                    </li>
                );
            })}
        </ol>
    </Section>
);

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

export const LandingClosingCta = ({ onStart, hasProgress }: { onStart: () => void; hasProgress: boolean }) => (
    <Section band="brand" className="py-20 sm:py-28">
        <LandingRevealGroup className="group flex flex-col items-center text-center" stagger={0.15}>
            <LandingRevealItem variant="text">
                <LandingFeatureIcon icon={HandRaisedIcon} size="lg" tone="on-dark" hover="group-hover:text-rose-400" />
            </LandingRevealItem>
            <LandingRevealItem variant="text">
                <h2 className="mt-5 text-display-sm font-semibold tracking-tight text-primary_on-brand sm:text-display-md">
                    Find out where you stand
                </h2>
            </LandingRevealItem>
            <LandingRevealItem variant="text">
                <p className="mt-3 max-w-xl text-lg text-tertiary_on-brand">
                    It takes about 90 seconds, it's free, and your answers stay private. The clock is often already running, so
                    the sooner you check, the more options you have.
                </p>
            </LandingRevealItem>
            <LandingRevealItem variant="text">
                <Button
                    size="xl"
                    color="primary"
                    iconTrailing={ArrowRight}
                    className={cx("mt-8 w-full sm:w-auto", arrowSlideClass)}
                    onClick={onStart}
                >
                    {hasProgress ? "Resume my check" : "Start my free check"}
                </Button>
            </LandingRevealItem>
        </LandingRevealGroup>
    </Section>
);

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = (unfairDismissalDays: number) =>
    [
        {
            question: "Is Fair Go legal advice?",
            answer: "No. Fair Go gives general information about unfair dismissal under the Fair Work Act. It does not replace advice from an employment lawyer about your specific situation.",
        },
        {
            question: "Is the eligibility check free?",
            answer: "Yes. The check takes about 90 seconds, costs nothing, and you do not need an account to get started.",
        },
        {
            question: "Who can see my answers?",
            answer: "Your record is encrypted on your own device. Fair Go cannot read it, sell it, or hand over what it cannot see. Use a personal email, not your work account.",
        },
        {
            question: "What is unfair dismissal?",
            answer: "Broadly, it is when you are dismissed from your job in a way that is harsh, unjust, or unreasonable, and you are covered by the unfair dismissal protections in the Fair Work Act. The free check helps you see whether you may be covered.",
        },
        {
            question: "How long do I have to lodge a claim?",
            answer: `For most unfair dismissal applications, you have ${unfairDismissalDays} days from the date your dismissal took effect to apply to the Fair Work Commission. Fair Go shows how much time you likely have left based on your answers.`,
        },
        {
            question: "Do I need a lawyer?",
            answer: "Not to use Fair Go. Many people start by checking their options and building a record themselves. For advice about your circumstances, or to lodge and run a claim, speak to an employment lawyer or contact the Fair Work Commission.",
        },
    ] as const;

const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
    <details className="group border-b border-secondary py-5 last:border-b-0">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-md font-semibold text-primary marker:content-none [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 stroke-[1.5] text-fg-quaternary transition duration-100 ease-linear group-open:-scale-y-100"
            />
        </summary>
        <p className="mt-3 pr-8 text-md text-tertiary">{answer}</p>
    </details>
);

export const LandingFaqSection = () => {
    const { unfairDismissalDays } = getLegalConstants().timeLimits;

    return (
        <Section band="primary">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12 lg:gap-20">
                <LandingReveal variant="text" className="shrink-0 md:max-w-[10rem] lg:max-w-[12rem]">
                    <h2 className="text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
                        FAQs
                    </h2>
                </LandingReveal>

                <LandingRevealGroup className="min-w-0 flex-1 border-t border-secondary md:border-t-0" stagger={0.09}>
                    {FAQ_ITEMS(unfairDismissalDays).map(({ question, answer }) => (
                        <LandingRevealItem key={question} variant="text">
                            <FaqItem question={question} answer={answer} />
                        </LandingRevealItem>
                    ))}
                </LandingRevealGroup>
            </div>
        </Section>
    );
};

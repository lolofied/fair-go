import { ArrowRight, CheckCircle, Circle, Clock } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { PageHeading } from "@/case/components/case-layout";
import { DeadlinePill } from "@/case/components/deadline-pill";
import { computeDocumentationProgress, type DocProgressStatus, type DocSectionProgress } from "@/case/documentation-progress";
import { isPrepDocumentationEntry } from "@/case/documentation-entry";
import { useCase } from "@/case/store";
import { cx } from "@/utils/cx";

const STATUS_META: Record<
    DocProgressStatus,
    { label: string; icon: typeof CheckCircle; badgeClass: string; iconClass: string }
> = {
    complete: {
        label: "Complete",
        icon: CheckCircle,
        badgeClass: "bg-success-secondary text-fg-success-primary",
        iconClass: "text-fg-success-primary",
    },
    in_progress: {
        label: "In progress",
        icon: Clock,
        badgeClass: "bg-brand-secondary text-fg-brand-primary",
        iconClass: "text-fg-brand-primary",
    },
    not_started: {
        label: "Not started",
        icon: Circle,
        badgeClass: "bg-secondary text-quaternary",
        iconClass: "text-fg-quaternary",
    },
};

function ProgressRing({ value }: { value: number }) {
    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Documentation progress"
            className="relative flex size-10 shrink-0 items-center justify-center"
        >
            <svg className="size-10 -rotate-90" viewBox="0 0 60 60">
                <circle className="stroke-bg-quaternary" cx="30" cy="30" r="24" fill="none" strokeWidth="5" />
                <circle
                    className="stroke-fg-brand-primary"
                    style={{ strokeDashoffset: `calc(100 - ${value})` }}
                    cx="30"
                    cy="30"
                    r="24"
                    fill="none"
                    strokeWidth="5"
                    strokeDasharray="100"
                    pathLength="100"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

function ProgressRow({ section }: { section: DocSectionProgress }) {
    const meta = STATUS_META[section.status];
    const StatusIcon = meta.icon;

    return (
        <Link
            to={section.href}
            className="group flex items-start gap-4 rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover sm:p-5"
        >
            <StatusIcon className={cx("mt-0.5 size-5 shrink-0", meta.iconClass)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary sm:text-md">{section.label}</h3>
                    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", meta.badgeClass)}>
                        <StatusIcon className="size-3" aria-hidden="true" />
                        {meta.label}
                    </span>
                </div>
                <p className="mt-1 text-sm text-tertiary">{section.description}</p>
                <p className="mt-2 text-xs font-medium text-secondary">{section.detail}</p>
            </div>
            <ArrowRight
                className="mt-1 size-4 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary"
                aria-hidden="true"
            />
        </Link>
    );
}

export const CaseOverviewScreen = () => {
    const { file } = useCase();

    if (!file) return null;

    const progress = computeDocumentationProgress(file);
    const isPrepEntry = isPrepDocumentationEntry();

    return (
        <div>
            <PageHeading
                title={isPrepEntry ? "Your private workplace record" : "Documentation overview"}
                description={
                    isPrepEntry
                        ? "Capture dates, conversations, and documents as things happen. If this escalates, you'll have a record ready for a lawyer."
                        : "Track what's done and what still needs your attention."
                }
                action={isPrepEntry ? undefined : <DeadlinePill effectiveDate={file.profile.dismissal.effective_date} />}
            />

            <div className="flex flex-col gap-6">
                <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-md font-semibold text-primary">Your progress</h2>
                            <p className="mt-1 text-sm text-tertiary">
                                {progress.completedCount} of {progress.totalCount} sections complete
                            </p>
                        </div>
                        <ProgressRing value={progress.percentComplete} />
                    </div>

                    {progress.nextStep && (
                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Suggested next step</p>
                                <p className="mt-1 text-sm font-medium text-primary">{progress.nextStep.title}</p>
                                <p className="mt-0.5 text-sm text-tertiary">{progress.nextStep.subtitle}</p>
                            </div>
                            <Button color="primary" size="md" href={progress.nextStep.href} iconTrailing={ArrowRight} className="w-full sm:w-auto">
                                Continue
                            </Button>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="mb-3 text-md font-semibold text-primary sm:mb-4">All sections</h2>
                    <ul className="flex flex-col gap-3">
                        {progress.sections.map((section) => (
                            <li key={section.id}>
                                <ProgressRow section={section} />
                            </li>
                        ))}
                    </ul>
                </section>

                <p className="text-xs text-quaternary">
                    Status reflects what you have recorded so far. It is not legal advice and does not predict any outcome.
                </p>
            </div>
        </div>
    );
};

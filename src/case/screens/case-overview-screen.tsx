import { ArrowRight, CheckCircle, Circle, Clock } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { PageHeading } from "@/case/components/case-layout";
import { SaveCasePromo } from "@/case/components/save-case-promo";
import { computeDocumentationProgress, type DocProgressStatus, type DocSectionProgress } from "@/case/documentation-progress";
import { useCase } from "@/case/store";
import { useSync } from "@/case/sync/sync-provider";
import { cx } from "@/utils/cx";

const STATUS_META: Record<
    DocProgressStatus,
    { label: string; icon: typeof CheckCircle; badgeClass: string; dotClass: string }
> = {
    complete: {
        label: "Complete",
        icon: CheckCircle,
        badgeClass: "bg-success-secondary text-fg-success-primary",
        dotClass: "bg-fg-success-primary",
    },
    in_progress: {
        label: "In progress",
        icon: Clock,
        badgeClass: "bg-brand-secondary text-fg-brand-primary",
        dotClass: "bg-fg-brand-primary",
    },
    not_started: {
        label: "Not started",
        icon: Circle,
        badgeClass: "bg-secondary text-quaternary",
        dotClass: "bg-fg-quaternary",
    },
};

function ProgressRow({ section }: { section: DocSectionProgress }) {
    const meta = STATUS_META[section.status];
    const StatusIcon = meta.icon;

    return (
        <Link
            to={section.href}
            className="group flex items-start gap-4 rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover sm:p-5"
        >
            <span className={cx("mt-1 size-2.5 shrink-0 rounded-full", meta.dotClass)} aria-hidden="true" />
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
    const { configured, user, dekUnlocked } = useSync();

    if (!file) return null;

    const savedRemotely = configured && Boolean(user && dekUnlocked);
    const progress = computeDocumentationProgress(file, { savedRemotely });

    return (
        <div>
            <PageHeading
                title="Documentation overview"
                description="Track what's done and what still needs your attention."
            />

            <div className="flex flex-col gap-6">
                <SaveCasePromo />

                <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-md font-semibold text-primary">Your progress</h2>
                            <p className="mt-1 text-sm text-tertiary">
                                {progress.completedCount} of {progress.totalCount} sections complete
                            </p>
                        </div>
                        <p className="text-2xl font-semibold tabular-nums text-brand-secondary">{progress.percentComplete}%</p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-quaternary">
                        <div
                            className="h-full rounded-full bg-brand-solid transition-all duration-300 ease-linear"
                            style={{ width: `${progress.percentComplete}%` }}
                            role="progressbar"
                            aria-valuenow={progress.percentComplete}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Documentation progress"
                        />
                    </div>

                    {progress.nextSection && (
                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-secondary bg-secondary_subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Suggested next step</p>
                                <p className="mt-1 text-sm font-medium text-primary">{progress.nextSection.label}</p>
                                <p className="mt-0.5 text-sm text-tertiary">{progress.nextSection.detail}</p>
                            </div>
                            <Button color="primary" size="md" href={progress.nextSection.href} iconTrailing={ArrowRight} className="w-full sm:w-auto">
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

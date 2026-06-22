import { Link } from "react-router";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle, Clock, Shield01 } from "@untitledui/icons";
import { HELP_RESOURCE_ROUTES, type ResourceEntry } from "@/config/site-seo";
import { cx } from "@/utils/cx";

/** A neutral skeleton bar used in place of body text to keep previews simple. */
function Bar({ className }: { className?: string }) {
    return <span className={cx("block rounded-full bg-quaternary", className)} />;
}

function PreviewCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
    return (
        <div
            className={cx(
                "w-full rounded-xl border border-secondary/60 bg-primary p-3.5 shadow-xl sm:p-4",
                className,
            )}
        >
            {title ? (
                <p className="text-[11px] font-semibold tracking-tight text-primary sm:text-xs">{title}</p>
            ) : null}
            <div className={title ? "mt-2.5" : undefined}>{children}</div>
        </div>
    );
}

function RunCheckPreview() {
    return (
        <PreviewCard>
            <Bar className="h-2 w-2/3" />
            <Bar className="mt-2 h-1.5 w-1/2" />
            <span className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-solid px-2.5 text-[10px] font-semibold text-white sm:text-xs">
                Start check
                <ArrowRight className="size-3" aria-hidden="true" />
            </span>
        </PreviewCard>
    );
}

function AfterCheckPreview() {
    return (
        <div className="flex w-full flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand bg-brand-primary px-2.5 py-1 text-[10px] font-semibold text-brand-secondary sm:text-xs">
                <Clock className="size-3 shrink-0" aria-hidden="true" />
                16 days left
            </div>
            <div className="rounded-xl border border-success bg-primary p-3 shadow-xl sm:p-3.5">
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 shrink-0 text-fg-success-primary" aria-hidden="true" />
                    <span className="rounded-full bg-success-secondary px-2 py-0.5 text-[10px] font-medium text-fg-success-primary sm:text-xs">
                        Looks viable
                    </span>
                </div>
                <Bar className="mt-2.5 h-2 w-1/2" />
            </div>
        </div>
    );
}

function RetrieveCasePreview() {
    return (
        <PreviewCard title="Retrieve your case" className="min-w-[9.5rem]">
            <span className="flex h-7 w-full items-center rounded-md border border-secondary bg-secondary px-2.5 text-[10px] font-medium tracking-widest text-quaternary sm:text-xs">
                ********
            </span>
        </PreviewCard>
    );
}

function CaseProfilePreview() {
    return (
        <PreviewCard title="Case profile">
            <div className="space-y-2">
                {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center justify-between gap-2">
                        <Bar className="h-1.5 w-1/4" />
                        <Bar className="h-1.5 w-3/5 bg-tertiary" />
                    </div>
                ))}
            </div>
        </PreviewCard>
    );
}

function EventsEvidencePreview() {
    return (
        <PreviewCard title="Event log">
            <ul className="space-y-2.5">
                {[0, 1].map((row) => (
                    <li key={row} className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-solid" />
                        <Bar className="h-1.5 w-1/2" />
                        <Bar className="ml-auto h-1.5 w-1/5" />
                    </li>
                ))}
            </ul>
        </PreviewCard>
    );
}

function ExportCasePreview() {
    return (
        <div className="w-full rounded-lg border border-secondary bg-secondary/80 p-2.5 shadow-xl sm:p-3">
            <div className="flex items-center justify-between gap-2">
                <Bar className="h-1.5 w-14" />
                <span className="shrink-0 rounded bg-error-primary px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-error-primary">
                    PDF
                </span>
            </div>
            <div className="relative mt-2.5 flex flex-col gap-2">
                <span className="absolute top-1 bottom-1 left-[3px] w-px bg-border-secondary" aria-hidden="true" />
                {[0, 1].map((row) => (
                    <div key={row} className="relative flex items-start gap-2">
                        <span className="z-10 mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-solid ring-2 ring-secondary" />
                        <div className="min-w-0 flex-1">
                            <Bar className="h-1.5 w-full" />
                            <Bar className="mt-1 h-1 w-3/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EncryptedSyncPreview() {
    return (
        <div className="flex size-12 items-center justify-center rounded-xl border border-brand/40 bg-brand-primary shadow-xl sm:size-14">
            <Shield01 className="size-5 text-fg-brand-primary sm:size-6" aria-hidden="true" />
        </div>
    );
}

const GUIDE_PREVIEW_VISUALS: Record<string, () => ReactNode> = {
    [HELP_RESOURCE_ROUTES.runCheck]: RunCheckPreview,
    [HELP_RESOURCE_ROUTES.afterCheck]: AfterCheckPreview,
    [HELP_RESOURCE_ROUTES.retrieveCase]: RetrieveCasePreview,
    [HELP_RESOURCE_ROUTES.caseProfile]: CaseProfilePreview,
    [HELP_RESOURCE_ROUTES.eventsEvidence]: EventsEvidencePreview,
    [HELP_RESOURCE_ROUTES.exportCase]: ExportCasePreview,
    [HELP_RESOURCE_ROUTES.encryptedSync]: EncryptedSyncPreview,
};

const GUIDE_PREVIEW_PADDING: Partial<Record<string, string>> = {
    [HELP_RESOURCE_ROUTES.retrieveCase]: "p-[10%] sm:p-[12%]",
};

function GuidePreviewVisual({ resource, className }: { resource: ResourceEntry; className?: string }) {
    const Visual = GUIDE_PREVIEW_VISUALS[resource.path] ?? RunCheckPreview;
    const padding = GUIDE_PREVIEW_PADDING[resource.path] ?? "p-[14%] sm:p-[16%]";

    return (
        <div
            aria-hidden="true"
            className={cx("relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-secondary", className)}
        >
            <div className={cx("absolute inset-0 flex items-center justify-center", padding)}>
                <Visual />
            </div>
        </div>
    );
}

export function GuideListItem({ resource }: { resource: ResourceEntry }) {
    return (
        <li className="border-b border-secondary last:border-b-0">
            <Link to={resource.path} className="group flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8">
                <GuidePreviewVisual resource={resource} className="w-full shrink-0 sm:w-56 lg:w-64" />
                <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight text-primary transition duration-100 ease-linear group-hover:text-brand-secondary sm:text-display-xs">
                        {resource.title}
                    </h3>
                    <p className="mt-3 text-md text-tertiary">{resource.description}</p>
                    <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-tertiary">
                        {resource.lastReviewed}
                    </span>
                </div>
            </Link>
        </li>
    );
}

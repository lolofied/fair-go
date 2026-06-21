import {
    Archive,
    ArrowRight,
    CheckCircle,
    Circle,
    Clock,
    Home02,
    List,
    Users01,
} from "@untitledui/icons";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { LandingNavIcon } from "@/checker/components/landing-nav-icon";
import { cx } from "@/utils/cx";

const NAV = [
    { label: "Overview", icon: Home02, active: true },
    { label: "Events", icon: List, active: false },
    { label: "Evidence", icon: Archive, active: false },
    { label: "Witnesses", icon: Users01, active: false },
] as const;

const SECTIONS = [
    {
        label: "Event log",
        status: "In progress",
        detail: "2 events recorded",
        icon: Clock,
        badgeClass: "bg-brand-secondary text-fg-brand-primary",
        iconTone: "brand" as const,
    },
    {
        label: "Evidence",
        status: "Not started",
        detail: "No documents uploaded",
        icon: Circle,
        badgeClass: "bg-secondary text-quaternary",
        iconTone: "muted" as const,
    },
    {
        label: "Witnesses",
        status: "Complete",
        detail: "1 witness recorded",
        icon: CheckCircle,
        badgeClass: "bg-success-secondary text-fg-success-primary",
        iconTone: "default" as const,
    },
] as const;

const TIMELINE = [
    { title: "Performance review meeting", date: "12 Mar 2026" },
    { title: "Written warning email", date: "3 Apr 2026" },
] as const;

/** Decorative preview of the private documentation workspace for the landing hero. */
export const DocumentationPreview = () => (
    <div className="mx-auto mt-10 w-full max-w-3xl text-left sm:mt-12" aria-hidden="true">
        <div className="h-[480px] overflow-hidden rounded-t-2xl border border-b-0 border-secondary bg-secondary shadow-lg ring-1 ring-secondary/60">
            <div className="flex items-center justify-between gap-3 border-b border-secondary bg-primary px-4 py-2.5 sm:px-5">
                <FairGoWordmark className="scale-90 origin-left" />
                <span className="rounded-full bg-success-secondary px-2 py-0.5 text-xs font-medium text-fg-success-primary">
                    Saved on device
                </span>
            </div>

            <nav className="overflow-x-auto border-b border-secondary bg-primary px-2 sm:px-4">
                <ul className="flex min-w-max items-end gap-1">
                    {NAV.map(({ label, icon: Icon, active }) => (
                        <li key={label}>
                            <span
                                className={cx(
                                    "inline-flex items-center gap-1.5 border-b-2 px-2 py-2.5 text-xs font-medium sm:gap-2 sm:px-3 sm:text-sm",
                                    active
                                        ? "border-fg-primary text-primary"
                                        : "border-transparent text-primary opacity-70",
                                )}
                            >
                                <LandingNavIcon icon={Icon} size="sm" tone={active ? "default" : "muted"} />
                                {label}
                            </span>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="space-y-4 p-4 sm:p-5">
                <div>
                    <h3 className="text-md font-semibold text-primary sm:text-lg">Your private workplace record</h3>
                    <p className="mt-1 text-sm text-tertiary">
                        Capture dates, conversations, and documents as things happen.
                    </p>
                </div>

                <div className="rounded-2xl border border-secondary bg-primary p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-primary">Your progress</p>
                            <p className="mt-0.5 text-xs text-tertiary sm:text-sm">2 of 5 sections complete</p>
                        </div>
                        <div className="relative flex size-10 shrink-0 items-center justify-center">
                            <svg className="size-10 -rotate-90" viewBox="0 0 60 60">
                                <circle className="stroke-bg-quaternary" cx="30" cy="30" r="24" fill="none" strokeWidth="5" />
                                <circle
                                    className="stroke-fg-brand-primary"
                                    style={{ strokeDashoffset: 60 }}
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
                    </div>
                </div>

                <ul className="flex flex-col gap-2.5">
                    {SECTIONS.map(({ label, status, detail, icon: StatusIcon, badgeClass, iconTone }) => (
                        <li
                            key={label}
                            className="flex items-start gap-3 rounded-xl border border-secondary bg-primary p-3 sm:p-4"
                        >
                            <LandingNavIcon icon={StatusIcon} size="sm" tone={iconTone} className="mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-primary">{label}</p>
                                    <span className={cx("rounded-full px-2 py-0.5 text-xs font-medium", badgeClass)}>
                                        {status}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-tertiary">{detail}</p>
                            </div>
                            <ArrowRight className="mt-0.5 size-4 shrink-0 stroke-[1.5] text-fg-quaternary" aria-hidden="true" />
                        </li>
                    ))}
                </ul>

                <div className="rounded-xl border border-secondary bg-primary p-3 sm:p-4">
                    <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Recent timeline</p>
                    <ul className="mt-3 space-y-2.5">
                        {TIMELINE.map((entry, index) => (
                            <li key={entry.title} className="flex gap-2.5">
                                <div className="flex flex-col items-center">
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-solid" />
                                    {index < TIMELINE.length - 1 ? <span className="w-px flex-1 bg-quaternary" /> : null}
                                </div>
                                <div className="pb-1">
                                    <p className="text-sm font-medium text-primary">{entry.title}</p>
                                    <p className="text-xs text-tertiary">{entry.date}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

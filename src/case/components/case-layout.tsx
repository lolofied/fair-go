import { type ReactNode } from "react";
import {
    AlertTriangle,
    Clock,
    Download01,
    File02,
    FileCheck02,
    Home02,
    SearchLg,
    Settings01,
    Users01,
} from "@untitledui/icons";
import { Link, NavLink } from "react-router";
import { daysRemaining } from "@/checker/logic";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { CaseOnboarding } from "@/case/components/case-onboarding";
import { useCase } from "@/case/store";
import { cx } from "@/utils/cx";

const NAV = [
    { to: "/case", label: "Overview", icon: Home02, end: true },
    { to: "/case/timeline", label: "Timeline", icon: Clock, end: false },
    { to: "/case/events", label: "Events", icon: FileCheck02, end: false },
    { to: "/case/evidence", label: "Evidence", icon: File02, end: false },
    { to: "/case/witnesses", label: "Witnesses", icon: Users01, end: false },
    { to: "/case/gaps", label: "What's missing", icon: SearchLg, end: false },
    { to: "/case/export", label: "Export", icon: Download01, end: false },
    { to: "/case/settings", label: "Settings", icon: Settings01, end: false },
];

function needsBackup(lastBackupAt: string | undefined, updatedAt: string): boolean {
    if (!lastBackupAt) return true;
    return new Date(updatedAt).getTime() > new Date(lastBackupAt).getTime();
}

const DeadlinePill = ({ effectiveDate }: { effectiveDate?: string }) => {
    const remaining = daysRemaining(effectiveDate);
    if (remaining === null) return null;
    const overdue = remaining < 0;
    return (
        <span
            className={cx(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                overdue ? "bg-error-secondary text-fg-error-primary" : remaining <= 7 ? "bg-warning-secondary text-fg-warning-primary" : "bg-brand-secondary text-fg-brand-primary",
            )}
        >
            <Clock className="size-3.5" aria-hidden="true" />
            {overdue ? `Window closed ${Math.abs(remaining)}d ago` : `${remaining} days left to lodge`}
        </span>
    );
};

export const CaseLayout = ({ children }: { children: ReactNode }) => {
    const { file } = useCase();
    const showBackupNag = file ? needsBackup(file.meta.lastBackupAt, file.meta.updatedAt) : false;

    return (
        <div className="flex min-h-dvh flex-col bg-secondary">
            <CaseOnboarding />
            <header className="sticky top-0 z-10 border-b border-secondary bg-primary print:hidden">
                <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
                    <Link to="/" aria-label="Fair Go home">
                        <FairGoWordmark />
                    </Link>
                    <DeadlinePill effectiveDate={file?.profile.dismissal.effective_date} />
                </div>
                <nav className="mx-auto w-full max-w-5xl overflow-x-auto px-3 sm:px-6">
                    <ul className="flex min-w-max items-center gap-1 pb-2">
                        {NAV.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        cx(
                                            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-100 ease-linear",
                                            isActive
                                                ? "bg-brand-primary text-brand-secondary"
                                                : "text-tertiary hover:bg-primary_hover hover:text-secondary",
                                        )
                                    }
                                >
                                    <item.icon className="size-4" aria-hidden="true" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-8 sm:py-8 print:max-w-none print:p-0">
                {showBackupNag && (
                    <Link
                        to="/case/settings"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-warning bg-warning-primary p-4 transition duration-100 ease-linear hover:bg-warning-secondary print:hidden"
                    >
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-semibold text-primary">Back up your case</p>
                            <p className="mt-1 text-sm text-tertiary">
                                Your case lives only on this device. Download an encrypted backup so you don't lose it if
                                your browser is cleared. Tap to back up now.
                            </p>
                        </div>
                    </Link>
                )}
                {children}
            </main>
        </div>
    );
};

export const PageHeading = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
            <h1 className="text-display-xs font-semibold tracking-tight text-primary">{title}</h1>
            {description && <p className="mt-1.5 max-w-2xl text-md text-tertiary">{description}</p>}
        </div>
        {action}
    </div>
);

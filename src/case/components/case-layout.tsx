import { type ReactNode } from "react";
import {
    Archive,
    Download01,
    Home02,
    List,
    Settings01,
    User01,
    Users01,
} from "@untitledui/icons";
import { NavLink } from "react-router";
import { CaseOnboarding } from "@/case/components/case-onboarding";
import { HeaderSaveStatus } from "@/case/components/header-save-status";
import { ShellHeaderBrand } from "@/components/layout/shell";
import { cx } from "@/utils/cx";

const NAV = [
    { to: "/case", label: "Overview", icon: Home02, end: true },
    { to: "/case/profile", label: "Profile", icon: User01, end: false },
    { to: "/case/events", label: "Events", icon: List, end: false },
    { to: "/case/evidence", label: "Evidence", icon: Archive, end: false },
    { to: "/case/witnesses", label: "Witnesses", icon: Users01, end: false },
    { to: "/case/export", label: "Export", icon: Download01, end: false },
    { to: "/case/settings", label: "Settings", icon: Settings01, end: false },
];

export const CaseLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex min-h-dvh flex-col bg-secondary">
            <CaseOnboarding />
            <header className="sticky top-0 z-10 border-b border-secondary bg-primary print:hidden">
                <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 fg-shell-x py-2.5 sm:gap-3 sm:py-3">
                    <ShellHeaderBrand />
                    <HeaderSaveStatus />
                </div>
                <nav className="mx-auto w-full max-w-5xl overflow-x-auto fg-shell-x">
                    <ul className="flex min-w-max items-end gap-1 sm:gap-2">
                        {NAV.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        cx(
                                            "inline-flex items-center gap-1.5 border-b-2 px-2 py-2.5 text-xs font-medium transition duration-100 ease-linear sm:gap-2 sm:px-3 sm:py-3 sm:text-sm",
                                            isActive
                                                ? "border-fg-primary text-primary opacity-100"
                                                : "border-transparent text-primary opacity-70 hover:opacity-100",
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

            <main className="mx-auto w-full max-w-5xl flex-1 fg-shell-main print:max-w-none print:p-0">
                {children}
            </main>
        </div>
    );
};

export const PageHeading = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6 sm:gap-4">
        <div>
            <h1 className="text-xl font-semibold tracking-tight text-primary sm:text-display-xs">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-sm text-tertiary sm:mt-1.5 sm:text-md">{description}</p>}
        </div>
        {action}
    </div>
);

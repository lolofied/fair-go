import { forwardRef, type PropsWithChildren } from "react";
import { Link } from "react-router";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { cx } from "@/utils/cx";

type ShellTone = "primary" | "secondary";

export const Shell = ({
    tone = "primary",
    className,
    children,
}: PropsWithChildren<{ tone?: ShellTone; className?: string }>) => (
    <div className={cx("flex min-h-dvh flex-col", tone === "secondary" ? "bg-secondary" : "bg-primary", className)}>
        {children}
    </div>
);

export const ShellHeader = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <header className={cx("fg-shell-header flex items-center justify-between gap-3", className)}>{children}</header>
);

/** Home link with flex alignment matching an unwrapped FairGoWordmark in ShellHeader. */
export const ShellHeaderBrand = ({ className }: { className?: string }) => (
    <Link to="/" aria-label="Fair Go home" className={cx("inline-flex shrink-0 items-center self-center", className)}>
        <FairGoWordmark />
    </Link>
);

export const ShellMain = forwardRef<
    HTMLElement,
    PropsWithChildren<{ className?: string; align?: "center" | "start" }>
>(({ className, align = "center", children }, ref) => (
    <main
        ref={ref}
        className={cx(
            "fg-shell-main flex flex-1 flex-col",
            align === "center" ? "items-center justify-center" : "items-start justify-start sm:items-center sm:justify-center",
            className,
        )}
    >
        {children}
    </main>
));
ShellMain.displayName = "ShellMain";

export const ShellFooter = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <footer className={cx("border-t border-secondary fg-shell-footer", className)}>{children}</footer>
);

export const ShellContent = ({
    width = "content",
    className,
    children,
}: PropsWithChildren<{ width?: "content" | "marketing" | "wizard"; className?: string }>) => (
    <div
        className={cx(
            width === "marketing" ? "fg-marketing" : width === "wizard" ? "fg-wizard" : "fg-content",
            className,
        )}
    >
        {children}
    </div>
);

export const HeroTitle = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <h1 className={cx("fg-hero-title", className)}>{children}</h1>
);

export const HeroLead = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <p className={cx("fg-hero-lead", className)}>{children}</p>
);

export const SectionCard = ({
    title,
    className,
    children,
}: PropsWithChildren<{ title?: string; className?: string }>) => (
    <section className={cx("fg-section-card", className)}>
        {title ? <h2 className="fg-section-card-title">{title}</h2> : null}
        <div className={title ? "mt-3 sm:mt-4" : undefined}>{children}</div>
    </section>
);

export const PageStack = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <div className={cx("fg-page-gap", className)}>{children}</div>
);

export const ActionRow = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <div className={cx("fg-action-row", className)}>{children}</div>
);

/** Full-width primary actions on mobile; auto width from sm up. */
export const mobileBtnClass = "w-full sm:w-auto";

/** Slides a button's trailing icon 6px to the right on hover. */
export const arrowSlideClass = "hover:[&_[data-icon=trailing]]:translate-x-1.5";

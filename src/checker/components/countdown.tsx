import { Clock, AlertTriangle } from "@untitledui/icons";
import { UNFAIR_DISMISSAL_TIME_LIMIT_DAYS } from "@/config/fair-work";
import { cx } from "@/utils/cx";

interface CountdownProps {
    /** Days left out of 21; can be negative once the window has closed. */
    daysRemaining: number;
    className?: string;
    /** Compact pill for the wizard header vs. large block for the result screen. */
    variant?: "pill" | "block";
}

function tone(daysRemaining: number) {
    if (daysRemaining < 0) return "barred" as const;
    if (daysRemaining <= 5) return "urgent" as const;
    if (daysRemaining <= 10) return "warn" as const;
    return "ok" as const;
}

const TONE_STYLES = {
    ok: "border-brand bg-brand-primary text-brand-secondary",
    warn: "border-warning bg-warning-primary text-warning-primary",
    urgent: "border-error_subtle bg-error-primary text-error-primary",
    barred: "border-error_subtle bg-error-primary text-error-primary",
} as const;

export const Countdown = ({ daysRemaining, className, variant = "pill" }: CountdownProps) => {
    const t = tone(daysRemaining);
    const barred = t === "barred";
    const Icon = barred ? AlertTriangle : Clock;

    if (variant === "block") {
        return (
            <div className={cx("flex items-center gap-4 rounded-2xl border px-5 py-4", TONE_STYLES[t], className)}>
                <Icon className="size-6 shrink-0" />
                <div>
                    <p className="text-sm font-medium opacity-80">
                        {barred ? "Standard 21-day window" : "Time left to lodge your claim"}
                    </p>
                    <p className="text-display-xs font-semibold">
                        {barred
                            ? `Closed ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? "day" : "days"} ago`
                            : `${daysRemaining} of ${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days left`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
                TONE_STYLES[t],
                className,
            )}
        >
            <Icon className="size-4" />
            {barred ? (
                <span>Window closed</span>
            ) : (
                <span>
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                </span>
            )}
        </div>
    );
};

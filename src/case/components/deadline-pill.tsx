import { Clock } from "@untitledui/icons";
import { daysRemaining } from "@/checker/logic";
import { cx } from "@/utils/cx";

export const DeadlinePill = ({ effectiveDate }: { effectiveDate?: string }) => {
    const remaining = daysRemaining(effectiveDate);
    if (remaining === null) return null;
    const overdue = remaining < 0;
    return (
        <span
            className={cx(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                overdue
                    ? "bg-error-secondary text-fg-error-primary"
                    : remaining <= 7
                      ? "bg-warning-secondary text-fg-warning-primary"
                      : "bg-brand-secondary text-fg-brand-primary",
            )}
        >
            <Clock className="size-3.5" aria-hidden="true" />
            {overdue ? `Window closed ${Math.abs(remaining)}d ago` : `${remaining} days left to lodge`}
        </span>
    );
};

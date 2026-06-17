import { Clock } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { daysRemaining, deadlineDate } from "@/checker/logic";
import { cx } from "@/utils/cx";

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

function formatDeadlineDate(date: Date): string {
    return dateFmt.format(date);
}

export const DeadlinePill = ({ effectiveDate }: { effectiveDate?: string }) => {
    const remaining = daysRemaining(effectiveDate);
    const deadline = deadlineDate(effectiveDate);
    if (remaining === null || !deadline) return null;

    const overdue = remaining < 0;
    const formatted = formatDeadlineDate(deadline);
    const tooltipTitle = overdue ? `Deadline was ${formatted}` : `Lodge by ${formatted}`;
    const pillClass = cx(
        "inline-flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        overdue
            ? "bg-error-secondary text-fg-error-primary"
            : remaining <= 7
              ? "bg-warning-secondary text-fg-warning-primary"
              : "bg-brand-secondary text-fg-brand-primary",
    );

    return (
        <Tooltip title={tooltipTitle} placement="bottom">
            <TooltipTrigger className={pillClass} aria-label={tooltipTitle}>
                <Clock className="size-3.5" aria-hidden="true" />
                {overdue ? `Window closed ${Math.abs(remaining)}d ago` : `${remaining} days left to lodge`}
            </TooltipTrigger>
        </Tooltip>
    );
};

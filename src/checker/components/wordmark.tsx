import { cx } from "@/utils/cx";

export const FairGoWordmark = ({ className }: { className?: string }) => (
    <span className={cx("inline-flex items-center gap-2 text-md font-semibold text-primary select-none", className)}>
        <span className="flex size-6 items-center justify-center rounded-md bg-brand-solid text-xs font-bold text-white">FG</span>
        Fair Go
    </span>
);

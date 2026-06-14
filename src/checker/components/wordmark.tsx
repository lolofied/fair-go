import { cx } from "@/utils/cx";

const LOGO_SRC = "/app-icon.png";

export const FairGoLogo = ({ className }: { className?: string }) => (
    <img src={LOGO_SRC} alt="" aria-hidden="true" className={cx("size-6 shrink-0 rounded-md object-cover", className)} />
);

export const FairGoWordmark = ({ className }: { className?: string }) => (
    <span className={cx("inline-flex items-center gap-2 text-md font-semibold text-primary select-none", className)}>
        <FairGoLogo />
        Fair Go
    </span>
);

import { cx } from "@/utils/cx";

const LOGO_SRC = "/fair-go-logo.png";

export const FairGoLogo = ({ className }: { className?: string }) => (
    <img src={LOGO_SRC} alt="" aria-hidden="true" className={cx("size-6 shrink-0 rounded-md object-contain", className)} />
);

export const FairGoWordmark = ({ className }: { className?: string }) => (
    <span className={cx("inline-flex items-center gap-2.5 self-center select-none", className)}>
        <FairGoLogo className="size-7" />
        <span className="font-wordmark text-xl font-bold lowercase leading-none tracking-tight text-primary">fair go</span>
    </span>
);

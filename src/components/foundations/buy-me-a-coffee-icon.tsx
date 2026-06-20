import type { ImgHTMLAttributes } from "react";
import { DONATION_ICON_URL } from "@/config/donation";
import { cx } from "@/utils/cx";

interface BuyMeACoffeeIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
    size?: number;
}

/** Official Buy Me a Coffee cup mark from BMC brand assets. */
export const BuyMeACoffeeIcon = ({ size, className, ...props }: BuyMeACoffeeIconProps) => (
    <img
        src={DONATION_ICON_URL}
        alt=""
        aria-hidden="true"
        {...(size ? { width: size, height: Math.round(size * 1.45) } : {})}
        className={cx("shrink-0 object-contain", className)}
        loading="lazy"
        decoding="async"
        {...props}
    />
);

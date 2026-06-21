import type { FC } from "react";
import { cx } from "@/utils/cx";

type LandingNavIconTone = "default" | "brand" | "muted" | "on-dark";

const SIZE_CLASS = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    xl: "size-7",
} as const;

const TONE_CLASS: Record<LandingNavIconTone, string> = {
    default: "text-fg-secondary",
    brand: "text-fg-brand-primary",
    muted: "text-fg-quaternary",
    "on-dark": "text-fg-white",
};

/** Minimal inline line icon (used inside product mocks). */
export const LandingNavIcon = ({
    icon: Icon,
    size = "md",
    tone = "default",
    className,
}: {
    icon: FC<{ className?: string }>;
    size?: keyof typeof SIZE_CLASS;
    tone?: LandingNavIconTone;
    className?: string;
}) => (
    <Icon
        aria-hidden="true"
        className={cx("shrink-0 stroke-[1.5]", SIZE_CLASS[size], TONE_CLASS[tone], className)}
    />
);

type LandingFeatureIconTone = "default" | "on-dark";

const TILE_SIZE = {
    md: "size-11 rounded-[12px]",
    lg: "size-14 rounded-[16px]",
} as const;

const TILE_ICON_SIZE = {
    md: "size-5",
    lg: "size-6",
} as const;

const TILE_TONE: Record<LandingFeatureIconTone, { tile: string; icon: string }> = {
    default: {
        tile: "border border-secondary bg-primary shadow-xs",
        icon: "text-fg-secondary",
    },
    "on-dark": {
        tile: "border border-white/15 bg-white/10",
        icon: "text-fg-white",
    },
};

/**
 * Aave-style icon tile: a rounded-square container with a soft border holding a
 * bold filled (solid) icon.
 */
export const LandingFeatureIcon = ({
    icon: Icon,
    size = "lg",
    tone = "default",
    className,
}: {
    icon: FC<{ className?: string }>;
    size?: keyof typeof TILE_SIZE;
    tone?: LandingFeatureIconTone;
    className?: string;
}) => (
    <span
        aria-hidden="true"
        className={cx("inline-flex shrink-0 items-center justify-center", TILE_SIZE[size], TILE_TONE[tone].tile, className)}
    >
        <Icon className={cx(TILE_ICON_SIZE[size], TILE_TONE[tone].icon)} />
    </span>
);

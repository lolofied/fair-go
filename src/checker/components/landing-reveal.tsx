import type { PropsWithChildren } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cx } from "@/utils/cx";

export type LandingRevealTrigger = "mount" | "view";
export type LandingRevealVariant = "text" | "media";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, amount: 0.18, margin: "0px 0px -6% 0px" } as const;

const OFFSET: Record<LandingRevealVariant, number> = {
    text: 20,
    media: 48,
};

const DURATION: Record<LandingRevealVariant, number> = {
    text: 0.825,
    media: 0.975,
};

const ITEM_VARIANTS: Record<LandingRevealVariant, Variants> = {
    text: {
        hidden: { opacity: 0, y: OFFSET.text },
        visible: { opacity: 1, y: 0, transition: { duration: DURATION.text, ease: EASE } },
    },
    media: {
        hidden: { opacity: 0, y: OFFSET.media },
        visible: { opacity: 1, y: 0, transition: { duration: DURATION.media, ease: EASE } },
    },
};

function useRevealMotion(trigger: LandingRevealTrigger) {
    return trigger === "mount"
        ? ({ initial: "hidden" as const, animate: "visible" as const })
        : ({ initial: "hidden" as const, whileInView: "visible" as const, viewport: VIEWPORT });
}

/** Single block that fades up on mount or when scrolled into view. */
export const LandingReveal = ({
    children,
    className,
    variant = "text",
    trigger = "view",
    delay = 0,
}: PropsWithChildren<{
    className?: string;
    variant?: LandingRevealVariant;
    trigger?: LandingRevealTrigger;
    delay?: number;
}>) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    const visible = ITEM_VARIANTS[variant].visible as { opacity: number; y: number; transition: { duration: number; ease: typeof EASE } };

    return (
        <motion.div
            className={className}
            variants={{
                hidden: ITEM_VARIANTS[variant].hidden,
                visible: {
                    ...visible,
                    transition: { ...visible.transition, delay },
                },
            }}
            {...useRevealMotion(trigger)}
        >
            {children}
        </motion.div>
    );
};

/** Stagger child `LandingRevealItem` blocks together on mount or in view. */
export const LandingRevealGroup = ({
    children,
    className,
    trigger = "view",
    stagger = 0.15,
    delay = 0,
}: PropsWithChildren<{
    className?: string;
    trigger?: LandingRevealTrigger;
    stagger?: number;
    delay?: number;
}>) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
            }}
            {...useRevealMotion(trigger)}
        >
            {children}
        </motion.div>
    );
};

/** Use inside `LandingRevealGroup` for staggered text or media reveals. */
export const LandingRevealItem = ({
    children,
    className,
    variant = "text",
}: PropsWithChildren<{ className?: string; variant?: LandingRevealVariant }>) => {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div className={cx(className)} variants={ITEM_VARIANTS[variant]}>
            {children}
        </motion.div>
    );
};

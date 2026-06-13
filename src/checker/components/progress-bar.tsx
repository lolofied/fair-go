import { motion } from "motion/react";

interface ProgressBarProps {
    /** 0–1. */
    value: number;
}

export const ProgressBar = ({ value }: ProgressBarProps) => {
    return (
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
            <motion.div
                className="h-full bg-brand-solid"
                initial={false}
                animate={{ width: `${Math.round(value * 100)}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
            />
        </div>
    );
};

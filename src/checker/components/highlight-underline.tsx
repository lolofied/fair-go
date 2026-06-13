import { cx } from "@/utils/cx";

interface HighlightUnderlineProps {
    className?: string;
}

export const HighlightUnderline = ({ className }: HighlightUnderlineProps) => (
    <svg
        viewBox="0 0 280 14"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cx("pointer-events-none absolute -inset-x-1 -bottom-1 h-3.5 w-[calc(100%+0.5rem)] text-brand-500", className)}
    >
        <path
            d="M2 7 Q11 2 20 7 Q29 12 38 7 Q47 2 56 7 Q65 12 74 7 Q83 2 92 7 Q101 12 110 7 Q119 2 128 7 Q137 12 146 7 Q155 2 164 7 Q173 12 182 7 Q191 2 200 7 Q209 12 218 7 Q227 2 236 7 Q245 12 254 7 Q263 2 272 7 Q276 9 278 7"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

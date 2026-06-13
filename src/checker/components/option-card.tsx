import { Check } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface OptionCardProps {
    letter: string;
    label: string;
    description?: string;
    selected?: boolean;
    onSelect: () => void;
}

export const OptionCard = ({ letter, label, description, selected, onSelect }: OptionCardProps) => {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cx(
                "group flex w-full items-center gap-4 rounded-xl border bg-primary px-4 py-3.5 text-left transition duration-150 outline-brand",
                "hover:border-brand hover:bg-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2",
                selected ? "border-brand bg-brand-primary ring-1 ring-brand" : "border-secondary",
            )}
        >
            <span
                className={cx(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition",
                    selected
                        ? "border-transparent bg-brand-solid text-white"
                        : "border-secondary bg-primary text-tertiary group-hover:border-brand group-hover:text-brand-secondary",
                )}
            >
                {letter}
            </span>

            <span className="flex-1">
                <span className="block text-md font-medium text-primary">{label}</span>
                {description && <span className="mt-0.5 block text-sm text-tertiary">{description}</span>}
            </span>

            <Check
                className={cx(
                    "size-5 shrink-0 text-fg-brand-primary transition",
                    selected ? "opacity-100" : "opacity-0",
                )}
            />
        </button>
    );
};

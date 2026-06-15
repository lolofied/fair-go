import { useEffect, useRef } from "react";
import { ArrowRight, CornerDownLeft } from "@untitledui/icons";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/base/buttons/button";
import { ActionRow, mobileBtnClass } from "@/components/layout/shell";
import { OptionCard } from "@/checker/components/option-card";
import { isStepAnswered, OPTION_LETTERS, STEPS } from "@/checker/questions";
import { useChecker } from "@/checker/store";
import type { CheckerAnswers, StepId } from "@/checker/types";
import { cx } from "@/utils/cx";

const todayISO = () => new Date().toISOString().slice(0, 10);

const EnterHint = () => (
    <span className="hidden items-center gap-1.5 text-sm text-tertiary sm:inline-flex">
        Press
        <kbd className="inline-flex items-center gap-1 rounded-md border border-secondary bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary">
            Enter <CornerDownLeft className="size-3" />
        </kbd>
    </span>
);

export const StepRenderer = ({ step }: { step: StepId }) => {
    const { answers, set, advance, answerAndAdvance } = useChecker();
    const def = STEPS[step];
    const answered = isStepAnswered(step, answers);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (def.kind === "date" || def.kind === "number") {
            const id = window.setTimeout(() => inputRef.current?.focus(), 60);
            return () => window.clearTimeout(id);
        }
    }, [def.kind, step]);

    const optionValues: string[] =
        def.kind === "choice" || def.kind === "multiselect"
            ? def.options.map((o) => o.value)
            : def.kind === "boolean"
              ? ["__yes", "__no"]
              : [];

    const toggleMulti = (value: string) => {
        if (def.kind !== "multiselect") return;
        const current = (answers[def.field] as string[] | undefined) ?? [];
        let next: string[];
        if (def.exclusiveValue && value === def.exclusiveValue) {
            next = current.includes(value) ? [] : [value];
        } else {
            const without = def.exclusiveValue ? current.filter((v) => v !== def.exclusiveValue) : current;
            next = without.includes(value) ? without.filter((v) => v !== value) : [...without, value];
        }
        set(def.field, next as CheckerAnswers[keyof CheckerAnswers]);
    };

    const selectByIndex = (index: number) => {
        if (def.kind === "choice") {
            const opt = def.options[index];
            if (opt) answerAndAdvance(def.field, opt.value as CheckerAnswers[keyof CheckerAnswers]);
        } else if (def.kind === "boolean") {
            answerAndAdvance(def.field, (index === 0) as CheckerAnswers[keyof CheckerAnswers]);
        } else if (def.kind === "multiselect") {
            const opt = def.options[index];
            if (opt) toggleMulti(opt.value);
        }
    };

    useHotkeys(
        "a,b,c,d,e,f,g,h,i,j",
        (e, handler) => {
            e.preventDefault();
            const key = handler.keys?.[0];
            if (!key) return;
            selectByIndex(OPTION_LETTERS.indexOf(key.toUpperCase()));
        },
        { enabled: optionValues.length > 0 },
        [optionValues.length, step],
    );

    useHotkeys(
        "enter",
        (e) => {
            e.preventDefault();
            if (answered) advance();
        },
        { enableOnFormTags: ["INPUT"] },
        [answered, step],
    );

    return (
        <div className="fg-stack-lg">
            <div className="fg-stack-sm">
                <h1 className="text-xl font-semibold text-primary sm:text-display-sm">{def.title}</h1>
                {def.subtitle && <p className="text-md text-tertiary sm:text-lg">{def.subtitle}</p>}
            </div>

            {def.kind === "choice" && (
                <div className="flex flex-col gap-3">
                    {def.options.map((opt, i) => (
                        <OptionCard
                            key={opt.value}
                            letter={OPTION_LETTERS[i]}
                            label={opt.label}
                            description={opt.description}
                            selected={answers[def.field] === opt.value}
                            onSelect={() => answerAndAdvance(def.field, opt.value as CheckerAnswers[keyof CheckerAnswers])}
                        />
                    ))}
                </div>
            )}

            {def.kind === "boolean" && (
                <div className="flex flex-col gap-3">
                    {[
                        { letter: OPTION_LETTERS[0], label: def.yesLabel ?? "Yes", value: true },
                        { letter: OPTION_LETTERS[1], label: def.noLabel ?? "No", value: false },
                    ].map((opt) => (
                        <OptionCard
                            key={opt.label}
                            letter={opt.letter}
                            label={opt.label}
                            selected={answers[def.field] === opt.value}
                            onSelect={() => answerAndAdvance(def.field, opt.value as CheckerAnswers[keyof CheckerAnswers])}
                        />
                    ))}
                </div>
            )}

            {def.kind === "multiselect" && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        {def.options.map((opt, i) => (
                            <OptionCard
                                key={opt.value}
                                letter={OPTION_LETTERS[i]}
                                label={opt.label}
                                description={opt.description}
                                selected={((answers[def.field] as string[] | undefined) ?? []).includes(opt.value)}
                                onSelect={() => toggleMulti(opt.value)}
                            />
                        ))}
                    </div>
                    <ContinueRow answered={answered} onContinue={advance} />
                </div>
            )}

            {def.kind === "date" && (
                <div className="flex flex-col gap-4">
                    <input
                        ref={inputRef}
                        type="date"
                        max={def.maxToday ? todayISO() : undefined}
                        value={(answers[def.field] as string) ?? ""}
                        onChange={(e) => set(def.field, e.target.value as CheckerAnswers[keyof CheckerAnswers])}
                        className="w-full max-w-sm rounded-xl border border-secondary bg-primary px-4 py-3.5 text-lg text-primary outline-brand transition focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                    <ContinueRow answered={answered} onContinue={advance} />
                </div>
            )}

            {def.kind === "number" && (
                <div className="flex flex-col gap-4">
                    <div
                        className={cx(
                            "flex w-full max-w-sm items-center rounded-xl border border-secondary bg-primary px-4 transition focus-within:border-brand",
                        )}
                    >
                        {def.prefix && <span className="text-lg text-tertiary">{def.prefix}</span>}
                        <input
                            ref={inputRef}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder={def.placeholder}
                            value={typeof answers[def.field] === "number" ? (answers[def.field] as number) : ""}
                            onChange={(e) =>
                                set(
                                    def.field,
                                    (e.target.value === "" ? undefined : Number(e.target.value)) as CheckerAnswers[keyof CheckerAnswers],
                                )
                            }
                            className="w-full bg-transparent px-1.5 py-3.5 text-lg text-primary outline-hidden placeholder:text-placeholder"
                        />
                    </div>
                    <ContinueRow answered={answered} onContinue={advance} />
                </div>
            )}

            {(def.kind === "choice" || def.kind === "boolean") && (
                <p className="hidden text-sm text-tertiary sm:block">
                    Tap an option or press its letter. <EnterHint /> to use a highlighted answer.
                </p>
            )}

            {def.kind === "multiselect" && (
                <p className="hidden text-sm text-tertiary sm:block">
                    Select all that apply (or press each letter), then <EnterHint /> to continue.
                </p>
            )}
        </div>
    );
};

const ContinueRow = ({ answered, onContinue }: { answered: boolean; onContinue: () => void }) => (
    <ActionRow>
        <Button size="xl" color="primary" isDisabled={!answered} iconTrailing={ArrowRight} className={mobileBtnClass} onClick={onContinue}>
            Continue
        </Button>
        {answered && <EnterHint />}
    </ActionRow>
);

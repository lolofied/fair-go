import { ArrowRight, Clock, Lock01, Scales02, ShieldTick } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { useChecker } from "@/checker/store";

const REASSURANCES = [
    { icon: Clock, title: "About 90 seconds", body: "A handful of simple questions, one at a time." },
    { icon: Lock01, title: "Private by default", body: "Your answers stay in your browser. No account, no sign-up." },
    { icon: ShieldTick, title: "Not legal advice", body: "We help you organise the facts so a lawyer can act fast." },
];

export const IntroScreen = () => {
    const { start, answers } = useChecker();
    const hasProgress = Object.keys(answers).length > 0;

    return (
        <div className="flex min-h-dvh flex-col bg-primary">
            <header className="flex items-center justify-between px-5 py-4 sm:px-8">
                <FairGoWordmark />
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary">
                    <Scales02 className="size-4" /> Australian unfair dismissal
                </span>
            </header>

            <main className="flex flex-1 items-center justify-center px-5 py-10">
                <div className="w-full max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary px-3 py-1 text-sm font-medium text-secondary">
                        Free eligibility check
                    </span>

                    <h1 className="mt-5 text-display-md font-semibold tracking-tight text-primary sm:text-display-lg">
                        Were you unfairly dismissed?
                    </h1>

                    <p className="mt-4 max-w-xl text-xl text-tertiary">
                        Find out in about 90 seconds whether you likely have an unfair dismissal claim under the Fair Work
                        Act, and exactly how long you have left to act.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button size="xl" color="primary" iconTrailing={ArrowRight} onClick={start}>
                            {hasProgress ? "Resume my check" : "Start my free check"}
                        </Button>
                        <span className="text-sm text-tertiary">No payment. No commitment.</span>
                    </div>

                    <dl className="mt-12 grid gap-6 sm:grid-cols-3">
                        {REASSURANCES.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="flex flex-col gap-2">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-fg-brand-primary">
                                    <Icon className="size-5" />
                                </span>
                                <dt className="text-md font-semibold text-primary">{title}</dt>
                                <dd className="text-sm text-tertiary">{body}</dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-12 border-t border-secondary pt-6 text-sm text-tertiary">
                        Fair Go is not a law firm and this tool is not legal advice. It helps you document your situation
                        and understand your options. For advice about your specific circumstances, speak to an employment
                        lawyer or contact the{" "}
                        <a className="font-medium text-brand-secondary underline" href="https://www.fwc.gov.au" target="_blank" rel="noreferrer">
                            Fair Work Commission
                        </a>
                        .
                    </p>
                </div>
            </main>
        </div>
    );
};

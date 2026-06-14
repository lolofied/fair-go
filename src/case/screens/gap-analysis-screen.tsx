import { AlertCircle, CheckCircle, HelpCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PageHeading } from "@/case/components/case-layout";
import { analyseGaps } from "@/case/gap-analysis";
import { useCase } from "@/case/store";

export const GapAnalysisScreen = () => {
    const { file } = useCase();
    if (!file) return null;
    const report = analyseGaps(file);
    const hasClaims = report.byClaim.length > 0;

    return (
        <div>
            <PageHeading
                title="What's missing"
                description="A checklist of the evidence that typically supports each part of your claims, and what you haven't captured yet. It points to gaps; it never decides your case."
                action={<Button color="secondary" size="md" href="/case/evidence">Add evidence</Button>}
            />

            {!hasClaims && (
                <div className="rounded-2xl border border-secondary bg-primary p-6">
                    <p className="text-sm text-tertiary">
                        Once your case profile has an active claim, this page lists what each claim usually needs. Review
                        your profile to confirm your candidate claims.
                    </p>
                </div>
            )}

            {report.contextual.length > 0 && (
                <section className="mb-6 rounded-2xl border border-warning bg-warning-primary p-5">
                    <h2 className="flex items-center gap-2 text-md font-semibold text-primary">
                        <AlertCircle className="size-5 text-fg-warning-primary" aria-hidden="true" /> Capture these soon
                    </h2>
                    <ul className="mt-3 flex flex-col gap-2">
                        {report.contextual.map((p, i) => (
                            <li key={i} className="text-sm text-tertiary">
                                {p.prompt}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="flex flex-col gap-6">
                {report.byClaim.map((claim) => (
                    <section key={claim.claimType} className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-md font-semibold text-primary">{claim.claimLabel}</h2>
                            <span className="text-xs font-medium text-tertiary">
                                {claim.coveredCount} of {claim.totalCount} elements supported
                            </span>
                        </div>

                        {claim.gaps.length === 0 ? (
                            <p className="mt-4 flex items-center gap-2 text-sm text-success-primary">
                                <CheckCircle className="size-4 text-fg-success-primary" aria-hidden="true" />
                                Every element has something recorded and supported. A lawyer can take it from here.
                            </p>
                        ) : (
                            <ul className="mt-4 flex flex-col gap-3">
                                {claim.gaps.map((gap) => (
                                    <li key={gap.element} className="flex items-start gap-3 rounded-xl border border-secondary p-4">
                                        <HelpCircle className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-primary">
                                                {gap.label}
                                                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-tertiary">
                                                    {gap.severity === "missing" ? "Nothing recorded" : "Needs support"}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-sm text-tertiary">{gap.prompt}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
};

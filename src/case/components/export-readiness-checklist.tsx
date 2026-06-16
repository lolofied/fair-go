import { useState } from "react";
import { ArrowRight, CheckCircle, ChevronRight, FileSearch02, HelpCircle } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { analyseGaps } from "@/case/gap-analysis";
import { useCase } from "@/case/store";
import { cx } from "@/utils/cx";

export function exportReadinessSummary(file: Parameters<typeof analyseGaps>[0]) {
    const report = analyseGaps(file);
    const openGaps = report.byClaim.reduce((sum, c) => sum + c.gaps.length, 0);
    const contextual = report.contextual.length;
    const totalElements = report.byClaim.reduce((sum, c) => sum + c.totalCount, 0);
    const covered = report.byClaim.reduce((sum, c) => sum + c.coveredCount, 0);
    const hasClaims = report.byClaim.length > 0;
    const isReady = hasClaims && openGaps === 0 && contextual === 0;
    const findingCount = openGaps + contextual;

    return { report, openGaps, contextual, totalElements, covered, hasClaims, isReady, findingCount };
}

function findingCountLabel(count: number): string {
    return count === 1 ? "1 finding" : `${count} findings`;
}

/** One-line summary for the export audit banner. */
function auditBannerCopy(findingCount: number): string {
    return `${findingCountLabel(findingCount)} to review`;
}

function findingSeverityLabel(severity: "missing" | "needs_detail"): string {
    return severity === "missing" ? "Not in your record" : "Needs evidence";
}

function ExportAuditModal({
    open,
    onOpenChange,
    report,
    openGaps,
    totalElements,
    covered,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: ReturnType<typeof exportReadinessSummary>["report"];
    openGaps: number;
    totalElements: number;
    covered: number;
}) {
    return (
        <ModalOverlay isOpen={open} onOpenChange={onOpenChange}>
            <Modal className="max-w-lg">
                <Dialog className="w-full items-center justify-center outline-hidden">
                    <div className="relative flex max-h-[min(85vh,720px)] w-full flex-col rounded-2xl border border-secondary bg-primary shadow-xl">
                        <CloseButton size="xs" className="absolute top-3 right-3 z-10" onPress={() => onOpenChange(false)} />
                        <div className="border-b border-secondary px-5 py-4 pr-12 sm:px-6 sm:pr-14">
                            <h2 className="text-display-xs font-semibold text-primary">Review findings</h2>
                            <p className="mt-2 text-sm text-tertiary">
                                We checked your events, evidence, and claim elements against what lawyers typically look for on
                                these claims. You can still export anytime.
                            </p>
                            {covered > 0 && (
                                <p className="mt-2 text-xs font-medium text-secondary">
                                    {covered} of {totalElements} claim elements already supported in your record
                                </p>
                            )}
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                {openGaps > 0 && (
                                    <Button color="primary" size="md" href="/case/events" iconTrailing={ArrowRight} className="w-full sm:w-auto">
                                        Add events
                                    </Button>
                                )}
                                <Button color="secondary" size="md" href="/case/evidence" className="w-full sm:w-auto">
                                    Add evidence
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                            {report.contextual.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-primary">Priority findings</h3>
                                    <ul className="mt-2 flex flex-col gap-2">
                                        {report.contextual.map((p) => (
                                            <li key={p.eventId} className="rounded-xl border border-secondary bg-secondary_subtle px-3 py-2 text-sm text-tertiary">
                                                {p.prompt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className={cx("flex flex-col gap-4", report.contextual.length > 0 && "mt-5 border-t border-secondary pt-4")}>
                                {report.byClaim.map((claim) =>
                                    claim.gaps.length === 0 ? null : (
                                        <div key={claim.claimType}>
                                            <p className="text-sm font-semibold text-primary">{claim.claimLabel}</p>
                                            <ul className="mt-2 flex flex-col gap-2">
                                                {claim.gaps.map((gap) => (
                                                    <li
                                                        key={gap.element}
                                                        className="flex items-start gap-3 rounded-xl border border-secondary bg-secondary_subtle p-3"
                                                    >
                                                        <HelpCircle className="mt-0.5 size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                                        <div>
                                                            <p className="text-sm font-medium text-primary">
                                                                {gap.label}
                                                                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-tertiary">
                                                                    {findingSeverityLabel(gap.severity)}
                                                                </span>
                                                            </p>
                                                            <p className="mt-1 text-sm text-tertiary">{gap.prompt}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}

/** Export readiness: surfaces findings, not conclusions. */
export const ExportReadinessChecklist = () => {
    const { file } = useCase();
    const [modalOpen, setModalOpen] = useState(false);

    if (!file) return null;

    const { report, openGaps, totalElements, covered, hasClaims, isReady, findingCount } = exportReadinessSummary(file);

    if (!hasClaims) {
        return (
            <section className="mb-6 rounded-2xl border border-secondary bg-primary p-4 sm:p-5 print:hidden">
                <p className="text-sm text-tertiary">
                    A findings review will run here once you have active candidate claims in your{" "}
                    <Link to="/case/profile" className="font-medium text-brand-secondary underline-offset-2 hover:underline">
                        case profile
                    </Link>
                    .
                </p>
            </section>
        );
    }

    if (isReady) {
        return (
            <section className="mb-6 flex items-center gap-3 rounded-2xl border border-success bg-success-primary p-4 sm:p-5 print:hidden">
                <CheckCircle className="size-5 shrink-0 text-fg-success-primary" aria-hidden="true" />
                <p className="text-sm text-primary">
                    No findings. Your record looks complete. Save the PDF below when you are ready.
                </p>
            </section>
        );
    }

    const bannerCopy = auditBannerCopy(findingCount);

    return (
        <>
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                aria-haspopup="dialog"
                aria-label={`${bannerCopy}. Open review findings.`}
                className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-secondary bg-primary p-4 text-left transition duration-100 ease-linear hover:bg-primary_hover sm:p-5 print:hidden"
            >
                <FileSearch02 className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-sm font-medium text-primary">{bannerCopy}</span>
                <ChevronRight className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
            </button>

            <ExportAuditModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                report={report}
                openGaps={openGaps}
                totalElements={totalElements}
                covered={covered}
            />
        </>
    );
};

import { useEffect, useState } from "react";
import { Printer } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { daysRemaining } from "@/checker/logic";
import type { ClaimStatus, ClaimType } from "@/checker/types";
import {
    DISMISSAL_KIND_LABELS,
    EMPLOYEE_STATUS_LABELS,
    EMPLOYMENT_TYPE_LABELS,
    REASON_LABELS,
    SIZE_ESTIMATE_LABELS,
    YES_NO_UNSURE_LABELS,
    formatBoolean,
    formatOptionalLabel,
} from "@/case/profile-labels";
import { PageHeading } from "@/case/components/case-layout";
import { ExportReadinessChecklist } from "@/case/components/export-readiness-checklist";
import { assignAnnexures, annexureLetterMap, type Annexure } from "@/case/export/annexures";
import { buildStatement } from "@/case/export/statement";
import { flagIssues } from "@/case/issues";
import { getFile } from "@/case/storage";
import { useCase } from "@/case/store";

const CLAIM_TITLES: Record<ClaimType, string> = {
    unfair_dismissal: "Unfair dismissal (Fair Work Act Pt 3-2)",
    general_protections_dismissal: "General protections, dismissal (Pt 3-1, s.365)",
    general_protections_non_dismissal: "General protections, non-dismissal (Pt 3-1, s.372)",
};

const STATUS_LABELS: Record<ClaimStatus, string> = {
    likely: "Candidate claim",
    possible_complex: "Candidate claim (complex)",
    unlikely: "Noted, likely out of scope",
    time_barred: "Out of time",
};

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" });

function fmt(iso?: string): string {
    if (!iso) return "Not recorded";
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="break-inside-avoid">
        <dt className="text-xs font-semibold tracking-wide text-tertiary uppercase">{label}</dt>
        <dd className="mt-0.5 text-sm text-primary">{value}</dd>
    </div>
);

const ImageAnnexures = ({ annexures }: { annexures: Annexure[] }) => {
    const [urls, setUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        let active = true;
        const created: string[] = [];
        (async () => {
            const next: Record<string, string> = {};
            for (const a of annexures) {
                if (!a.document.mimeType.startsWith("image/")) continue;
                const blob = await getFile(a.document.fileRef);
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    created.push(url);
                    next[a.document.id] = url;
                }
            }
            if (active) setUrls(next);
        })();
        return () => {
            active = false;
            created.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [annexures]);

    const images = annexures.filter((a) => a.document.mimeType.startsWith("image/"));
    if (images.length === 0) return null;

    return (
        <>
            {images.map((a) => (
                <section key={a.document.id} className="mt-6 break-inside-avoid">
                    <h3 className="text-sm font-semibold text-primary">
                        Annexure {a.letter}: {a.document.title}
                    </h3>
                    {urls[a.document.id] && (
                        <img src={urls[a.document.id]} alt={a.document.title} className="mt-2 max-h-[600px] rounded-lg border border-secondary" />
                    )}
                </section>
            ))}
        </>
    );
};

export const ExportScreen = () => {
    const { file } = useCase();
    if (!file) return null;

    const { profile } = file;
    const annexures = assignAnnexures(file);
    const letters = annexureLetterMap(annexures);
    const statement = buildStatement(file, letters);
    const issues = flagIssues(file);
    const remaining = daysRemaining(profile.dismissal.effective_date);

    return (
        <div>
            <div className="print:hidden">
                <PageHeading
                    title="Export for your lawyer"
                    description="Run the brief audit, then save a PDF package a lawyer can act on quickly."
                    action={<Button color="primary" size="md" iconLeading={Printer} onClick={() => window.print()}>Save as PDF</Button>}
                />
                <ExportReadinessChecklist />
                <p className="mb-6 rounded-xl border border-secondary bg-primary p-4 text-sm text-tertiary">
                    Tip: choose "Save as PDF" as the destination in the print dialog. The package below is what gets
                    exported. Your uploaded image documents are embedded; other files are listed in the annexure index for
                    you to attach.
                </p>
            </div>

            {/* Printable package */}
            <article className="mx-auto max-w-3xl rounded-2xl border border-secondary bg-primary p-6 text-primary sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0">
                <header className="border-b border-secondary pb-4">
                    <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Confidential, prepared for legal advice</p>
                    <h1 className="mt-1 text-2xl font-semibold">Case summary and chronology</h1>
                    <p className="mt-1 text-sm text-tertiary">
                        Prepared by {profile.employee.name?.trim() || "the applicant"} using Fair Go. This is the
                        applicant's own account, organised for a lawyer. It is not legal advice and reaches no conclusion.
                    </p>
                </header>

                {/* Cover sheet */}
                <section className="mt-6">
                    <h2 className="text-lg font-semibold">Cover sheet</h2>
                    {remaining !== null && (
                        <p className="mt-2 rounded-lg bg-warning-primary px-3 py-2 text-sm font-semibold text-primary">
                            {remaining < 0
                                ? `The 21-day lodgement window appears to have closed ${Math.abs(remaining)} day(s) ago. Urgent advice needed about an extension.`
                                : `${remaining} day(s) left on the 21-day lodgement window (from the dismissal date). Time-critical.`}
                        </p>
                    )}
                    <dl className="mt-4 grid grid-cols-2 gap-4">
                        <Field label="Employer legal entity" value={profile.employer.legal_name || "Not recorded"} />
                        <Field label="ABN" value={profile.employer.abn || "Not recorded"} />
                        <Field label="Role" value={profile.employee.role || "Not recorded"} />
                        <Field label="How engaged" value={formatOptionalLabel(profile.employee.employee_status, EMPLOYEE_STATUS_LABELS)} />
                        <Field label="Employment type" value={formatOptionalLabel(profile.employee.employment_type, EMPLOYMENT_TYPE_LABELS)} />
                        {profile.employee.employment_type === "casual" && (
                            <>
                                <Field label="Casual work regular & systematic" value={formatBoolean(profile.employee.casual_regular)} />
                                <Field label="Reasonable expectation of ongoing work" value={formatBoolean(profile.employee.casual_expectation)} />
                            </>
                        )}
                        <Field label="Start date" value={fmt(profile.employee.start_date)} />
                        <Field label="End date" value={fmt(profile.employee.end_date)} />
                        <Field label="What happened with job" value={formatOptionalLabel(profile.dismissal.kind, DISMISSAL_KIND_LABELS)} />
                        <Field label="Dismissal took effect" value={fmt(profile.dismissal.effective_date)} />
                        <Field label="Reason given" value={formatOptionalLabel(profile.dismissal.reason_category, REASON_LABELS)} />
                        <Field label="Annual salary (excl. super)" value={profile.employee.salary != null ? `$${profile.employee.salary.toLocaleString("en-AU")}` : "Not recorded"} />
                        <Field label="Award / agreement" value={profile.employee.award_or_eba} />
                        <Field label="Covered by award" value={formatOptionalLabel(profile.employee.award_covered, YES_NO_UNSURE_LABELS)} />
                        <Field label="Covered by EBA" value={formatOptionalLabel(profile.employee.eba_applies, YES_NO_UNSURE_LABELS)} />
                        <Field label="Employer size" value={profile.employer.size_bucket || "Not recorded"} />
                        {profile.employer.size_bucket === "unsure" && (
                            <Field label="Headcount estimate" value={formatOptionalLabel(profile.employer.size_estimate, SIZE_ESTIMATE_LABELS)} />
                        )}
                        <Field label="Associated entities" value={formatOptionalLabel(profile.employer.has_associated_entities, YES_NO_UNSURE_LABELS)} />
                    </dl>

                    <div className="mt-4 break-inside-avoid">
                        <dt className="text-xs font-semibold tracking-wide text-tertiary uppercase">Candidate claims</dt>
                        <ul className="mt-1 list-disc pl-5 text-sm">
                            {profile.candidateClaims.length === 0 && <li>None identified in the eligibility check.</li>}
                            {profile.candidateClaims.map((c) => (
                                <li key={c.claimType}>
                                    {CLAIM_TITLES[c.claimType]}: {STATUS_LABELS[c.status]}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-4 break-inside-avoid">
                        <dt className="text-xs font-semibold tracking-wide text-tertiary uppercase">Desired outcome</dt>
                        <dd className="mt-0.5 text-sm">{profile.desiredOutcome?.trim() || "Not recorded"}</dd>
                    </div>
                </section>

                {/* Statement of facts */}
                <section className="mt-8 break-before-page">
                    <h2 className="text-lg font-semibold">Statement of facts</h2>
                    {statement.length === 0 ? (
                        <p className="mt-2 text-sm text-tertiary">No events recorded.</p>
                    ) : (
                        <ol className="mt-3 flex list-decimal flex-col gap-3 pl-5">
                            {statement.map((p) => (
                                <li key={p.eventId} className="text-sm leading-relaxed">
                                    {p.text}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                {/* Annexure index */}
                <section className="mt-8 break-inside-avoid">
                    <h2 className="text-lg font-semibold">Index of annexures</h2>
                    {annexures.length === 0 ? (
                        <p className="mt-2 text-sm text-tertiary">No documents uploaded.</p>
                    ) : (
                        <table className="mt-3 w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-secondary text-xs tracking-wide text-tertiary uppercase">
                                    <th className="py-2 pr-3">Annexure</th>
                                    <th className="py-2 pr-3">Title</th>
                                    <th className="py-2 pr-3">Date</th>
                                    <th className="py-2 pr-3">Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {annexures.map((a) => (
                                    <tr key={a.document.id} className="border-b border-secondary align-top">
                                        <td className="py-2 pr-3 font-semibold">{a.letter}</td>
                                        <td className="py-2 pr-3">{a.document.title}</td>
                                        <td className="py-2 pr-3">{fmt(a.document.date)}</td>
                                        <td className="py-2 pr-3">{a.document.source || "Not recorded"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Issues flagged for lawyer review */}
                <section className="mt-8 break-inside-avoid">
                    <h2 className="text-lg font-semibold">Issues flagged for lawyer review</h2>
                    <p className="mt-1 text-sm text-tertiary">
                        Flags drawn from the recorded facts. They are prompts for a lawyer, not conclusions about the
                        merits of any claim.
                    </p>
                    {issues.length === 0 ? (
                        <p className="mt-2 text-sm text-tertiary">No issues flagged from the facts recorded so far.</p>
                    ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                            {issues.map((i) => (
                                <li key={i.id} className="break-inside-avoid">
                                    <p className="text-sm font-semibold">{i.title}</p>
                                    <p className="text-sm text-tertiary">{i.detail}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <ImageAnnexures annexures={annexures} />

                <footer className="mt-10 border-t border-secondary pt-4 text-xs text-tertiary">
                    Generated by Fair Go. This document organises the applicant's own account and is not legal advice, a
                    submission, or a guarantee of any outcome. Deadlines are strict; confirm them with a lawyer or the Fair
                    Work Commission.
                </footer>
            </article>
        </div>
    );
};

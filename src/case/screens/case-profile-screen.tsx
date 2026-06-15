import type { ClaimStatus, ClaimType } from "@/checker/types";
import { PageHeading } from "@/case/components/case-layout";
import { DateField, SelectField, TextAreaField, TextField } from "@/case/components/fields";
import {
    DISMISSAL_KIND_LABELS,
    EMPLOYEE_STATUS_LABELS,
    EMPLOYMENT_TYPE_LABELS,
    REASON_LABELS,
    SIZE_ESTIMATE_LABELS,
    YES_NO_UNSURE_LABELS,
} from "@/case/profile-labels";
import { useCase } from "@/case/store";

const CLAIM_TITLES: Record<ClaimType, string> = {
    unfair_dismissal: "Unfair dismissal",
    general_protections_dismissal: "General protections (dismissal)",
    general_protections_non_dismissal: "General protections (still employed)",
};

const STATUS_LABELS: Record<ClaimStatus, string> = {
    likely: "Looks viable",
    possible_complex: "Possible, worth a closer look",
    unlikely: "May not apply",
    time_barred: "Out of time",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
);

export const CaseProfileScreen = () => {
    const { file, updateProfile } = useCase();
    if (!file) return null;
    const { employee, employer, dismissal, candidateClaims, desiredOutcome } = file.profile;

    const setEmployee = (patch: Partial<typeof employee>) => updateProfile({ employee: { ...employee, ...patch } });
    const setEmployer = (patch: Partial<typeof employer>) => updateProfile({ employer: { ...employer, ...patch } });
    const setDismissal = (patch: Partial<typeof dismissal>) => updateProfile({ dismissal: { ...dismissal, ...patch } });

    return (
        <div>
            <PageHeading
                title="Your case profile"
                description="Carried straight from your eligibility check, so there's nothing to re-enter. Review and fill any gaps; this is the spine of your export."
            />

            <div className="flex flex-col gap-6">
                <Section title="You">
                    <TextField label="Full name" value={employee.name ?? ""} onChange={(v) => setEmployee({ name: v })} placeholder="As it appears on your contract" />
                    <TextField label="Your role" value={employee.role ?? ""} onChange={(v) => setEmployee({ role: v })} />
                    <SelectField
                        label="How you were engaged"
                        value={employee.employee_status ?? ""}
                        onChange={(v) => setEmployee({ employee_status: (v || undefined) as typeof employee.employee_status })}
                        options={Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    <SelectField
                        label="Employment type"
                        value={employee.employment_type ?? ""}
                        onChange={(v) => setEmployee({ employment_type: (v || undefined) as typeof employee.employment_type })}
                        options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    {employee.employment_type === "casual" && (
                        <>
                            <SelectField
                                label="Casual work was regular and systematic"
                                value={employee.casual_regular === undefined ? "" : employee.casual_regular ? "yes" : "no"}
                                onChange={(v) => setEmployee({ casual_regular: v === "" ? undefined : v === "yes" })}
                                options={[
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                ]}
                            />
                            <SelectField
                                label="Reasonable expectation of ongoing work"
                                value={employee.casual_expectation === undefined ? "" : employee.casual_expectation ? "yes" : "no"}
                                onChange={(v) => setEmployee({ casual_expectation: v === "" ? undefined : v === "yes" })}
                                options={[
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                ]}
                            />
                        </>
                    )}
                    <SelectField
                        label="Award or agreement coverage"
                        value={employee.award_or_eba}
                        onChange={(v) => setEmployee({ award_or_eba: v as typeof employee.award_or_eba })}
                        options={[
                            { value: "award", label: "Award" },
                            { value: "eba", label: "Enterprise agreement" },
                            { value: "both", label: "Both" },
                            { value: "none", label: "Neither" },
                            { value: "unsure", label: "Not sure" },
                        ]}
                    />
                    <SelectField
                        label="Covered by an award"
                        value={employee.award_covered ?? ""}
                        onChange={(v) => setEmployee({ award_covered: (v || undefined) as typeof employee.award_covered })}
                        options={Object.entries(YES_NO_UNSURE_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    <SelectField
                        label="Covered by an enterprise agreement"
                        value={employee.eba_applies ?? ""}
                        onChange={(v) => setEmployee({ eba_applies: (v || undefined) as typeof employee.eba_applies })}
                        options={Object.entries(YES_NO_UNSURE_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    <DateField label="Start date" value={employee.start_date ?? ""} onChange={(v) => setEmployee({ start_date: v })} />
                    <DateField label="End date" value={employee.end_date ?? ""} onChange={(v) => setEmployee({ end_date: v })} />
                    <TextField
                        label="Annual salary (excluding super)"
                        value={employee.salary != null ? String(employee.salary) : ""}
                        onChange={(v) => setEmployee({ salary: v ? Number(v.replace(/[^0-9.]/g, "")) : undefined })}
                        placeholder="e.g. 95000"
                    />
                </Section>

                <Section title="Your employer">
                    <TextField label="Legal entity name" value={employer.legal_name ?? ""} onChange={(v) => setEmployer({ legal_name: v })} help="The entity on your payslip or contract, not just the trading name." />
                    <TextField label="ABN" value={employer.abn ?? ""} onChange={(v) => setEmployer({ abn: v })} />
                    <SelectField
                        label="Employer size"
                        value={employer.size_bucket ?? ""}
                        onChange={(v) => setEmployer({ size_bucket: (v || undefined) as typeof employer.size_bucket })}
                        options={[
                            { value: "small", label: "Small business (under 15)" },
                            { value: "large", label: "15 or more" },
                            { value: "unsure", label: "Not sure" },
                        ]}
                    />
                    {employer.size_bucket === "unsure" && (
                        <SelectField
                            label="Best estimate of headcount"
                            value={employer.size_estimate ?? ""}
                            onChange={(v) => setEmployer({ size_estimate: (v || undefined) as typeof employer.size_estimate })}
                            options={Object.entries(SIZE_ESTIMATE_LABELS).map(([value, label]) => ({ value, label }))}
                        />
                    )}
                    <SelectField
                        label="Associated entities (same headcount)"
                        value={employer.has_associated_entities ?? ""}
                        onChange={(v) => setEmployer({ has_associated_entities: (v || undefined) as typeof employer.has_associated_entities })}
                        options={Object.entries(YES_NO_UNSURE_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                </Section>

                <Section title="The dismissal">
                    <SelectField
                        label="What happened with your job"
                        value={dismissal.kind ?? ""}
                        onChange={(v) => setDismissal({ kind: (v || undefined) as typeof dismissal.kind })}
                        options={Object.entries(DISMISSAL_KIND_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                    <DateField label="Date it took effect" value={dismissal.effective_date ?? ""} onChange={(v) => setDismissal({ effective_date: v })} />
                    <SelectField
                        label="Reason given"
                        value={dismissal.reason_category ?? ""}
                        onChange={(v) => setDismissal({ reason_category: (v || undefined) as typeof dismissal.reason_category })}
                        options={Object.entries(REASON_LABELS).map(([value, label]) => ({ value, label }))}
                    />
                </Section>

                <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                    <h2 className="text-md font-semibold text-primary">What you want to achieve</h2>
                    <p className="mt-1 text-sm text-tertiary">
                        This goes on the cover sheet so a lawyer understands your goal quickly. For example: reinstatement,
                        compensation, a written reference, or simply understanding your options.
                    </p>
                    <div className="mt-4">
                        <TextAreaField label="Desired outcome" value={desiredOutcome ?? ""} onChange={(v) => updateProfile({ desiredOutcome: v })} />
                    </div>
                </section>

                {candidateClaims.length > 0 && (
                    <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                        <h2 className="text-md font-semibold text-primary">Candidate claims from your check</h2>
                        <ul className="mt-4 flex flex-col gap-2">
                            {candidateClaims.map((claim) => (
                                <li key={claim.claimType} className="flex items-center justify-between rounded-xl border border-secondary px-4 py-3">
                                    <span className="text-sm font-medium text-primary">{CLAIM_TITLES[claim.claimType]}</span>
                                    <span className="text-xs text-tertiary">{STATUS_LABELS[claim.status]}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-xs text-tertiary">
                            These came from your answers. They are general information, not legal advice, and not a prediction
                            of any outcome.
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
};

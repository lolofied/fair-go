import type {
    DismissalKind,
    EmployeeStatus,
    EmploymentType,
    ReasonCategory,
    SizeEstimate,
    YesNoUnsure,
} from "@/checker/types";

export const DISMISSAL_KIND_LABELS: Record<DismissalKind, string> = {
    terminated: "Sacked or terminated",
    forced_resignation: "Forced to resign",
    redundancy: "Made redundant",
    fixed_term_ended: "Fixed term or contract ended",
    not_yet: "PIP or show-cause (not dismissed yet)",
    resigned: "Resigned voluntarily",
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
    employee: "Employee",
    contractor: "Contractor",
    volunteer: "Volunteer or unpaid",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
    permanent: "Permanent",
    casual: "Casual",
    fixed_term_early: "Fixed term",
    trainee: "Trainee / apprentice",
};

export const REASON_LABELS: Record<ReasonCategory, string> = {
    performance: "Performance",
    conduct: "Conduct",
    redundancy: "Redundancy",
    none_given: "No reason given",
};

export const YES_NO_UNSURE_LABELS: Record<YesNoUnsure, string> = {
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
};

export const SIZE_ESTIMATE_LABELS: Record<SizeEstimate, string> = {
    under_15: "Under 15 employees",
    "15_plus": "15 or more employees",
    still_unsure: "Still not sure",
};

export function formatBoolean(value: boolean | undefined): string {
    if (value === undefined) return "Not recorded";
    return value ? "Yes" : "No";
}

export function formatOptionalLabel<T extends string>(value: T | undefined, labels: Record<T, string>): string {
    if (!value) return "Not recorded";
    return labels[value] ?? value;
}

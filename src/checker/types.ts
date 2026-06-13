/**
 * Domain model for the unfair dismissal eligibility checker.
 *
 * `CheckerAnswers` is the raw, flat state we collect one question at a time.
 * `CapturedData` is the structured shape that the (later) documentation tool
 * consumes — built from the answers so the user never re-enters anything.
 */

export type DismissalKind =
    | "terminated" // employer ended it
    | "forced_resignation" // constructive dismissal
    | "redundancy"
    | "fixed_term_ended"
    | "not_yet" // in a PIP / show-cause, not dismissed yet
    | "resigned"; // resigned voluntarily

export type EmployeeStatus = "employee" | "contractor" | "volunteer";

export type EmploymentType = "permanent" | "casual" | "fixed_term_early" | "trainee";

export type EmployerSize = "small" | "large" | "unsure";

/** Refinement asked only when employer size is "unsure". */
export type SizeEstimate = "under_15" | "15_plus" | "still_unsure";

export type ReasonCategory = "performance" | "conduct" | "redundancy" | "none_given";

/** yes / no / not sure — "not sure" is routed optimistically. */
export type YesNoUnsure = "yes" | "no" | "unsure";

export type CheckerFlag =
    | "constructive_dismissal"
    | "fixed_term_complexity"
    | "casual_question"
    | "redundancy_to_review"
    | "high_income_borderline"
    | "employer_size_uncertain"
    | "sham_contracting"
    | "below_minimum_period"
    | "coverage_uncertain";

/** 1 = looks eligible, 2 = possibly eligible/complex, 3 = other claims, 4 = time-barred. */
export type OutcomeBucket = 1 | 2 | 3 | 4;

export interface CheckerAnswers {
    // Q1
    dismissed?: DismissalKind;
    // Q2
    effective_date?: string; // ISO YYYY-MM-DD
    // Q3
    employee_status?: EmployeeStatus;
    // Q4 (+ follow-ups)
    employment_type?: EmploymentType;
    casual_regular?: boolean; // regular & systematic
    casual_expectation?: boolean; // reasonable expectation of ongoing work
    // Q5 (+ follow-ups)
    employer_size?: EmployerSize;
    size_estimate?: SizeEstimate;
    has_associated_entities?: YesNoUnsure;
    // Q6
    start_date?: string; // ISO YYYY-MM-DD
    // Q7
    award_covered?: YesNoUnsure;
    eba_applies?: YesNoUnsure;
    salary?: number; // annual rate of earnings, excludes super
    // Q8
    reason?: ReasonCategory;

    // Optional identity fields — not asked in the checker MVP, reserved so the
    // documentation flow can populate them without a schema change.
    name?: string;
    role?: string;
    employer_legal_name?: string;
    employer_abn?: string;
}

export interface CapturedData {
    employee: {
        name?: string;
        role?: string;
        employment_type?: EmploymentType;
        start_date?: string;
        end_date?: string;
        salary?: number;
        award_or_eba: "award" | "eba" | "both" | "none" | "unsure";
    };
    employer: {
        legal_name?: string;
        abn?: string;
        size_bucket?: EmployerSize;
        has_associated_entities?: YesNoUnsure;
    };
    dismissal: {
        effective_date?: string;
        reason_category?: ReasonCategory;
        redundancy_claimed: boolean;
        days_remaining: number | null;
    };
    flags: CheckerFlag[];
    outcome_bucket: OutcomeBucket;
}

export type StepId =
    | "dismissed"
    | "dismissal_date"
    | "employee_status"
    | "employment_type"
    | "casual_regular"
    | "casual_expectation"
    | "employer_size"
    | "size_estimate"
    | "size_associated"
    | "start_date"
    | "award"
    | "eba"
    | "salary"
    | "reason";

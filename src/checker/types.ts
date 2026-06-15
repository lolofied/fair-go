/**
 * Domain model for the unfair dismissal eligibility checker.
 *
 * `CheckerAnswers` is the raw, flat state we collect one question at a time.
 * `CapturedData` is the structured shape that the (later) documentation tool
 * consumes, built from the answers so the user never re-enters anything.
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

/** yes / no / not sure ("not sure" is routed optimistically). */
export type YesNoUnsure = "yes" | "no" | "unsure";

/* ----------------------------- general protections -------------------------- */

/**
 * The candidate claims a single case can carry. A case is never one global
 * outcome. It is a list of these, each independently assessed.
 */
export type ClaimType =
    | "unfair_dismissal"
    | "general_protections_dismissal"
    | "general_protections_non_dismissal";

/** Kinds of workplace right / protected activity exercised (s.341, s.340). */
export type WorkplaceRightKind =
    | "complaint_or_inquiry"
    | "entitlement_benefit"
    | "leave"
    | "safety_or_discrimination"
    | "industrial_activity";

/** How a protected act was communicated. */
export type WorkplaceRightForm = "verbal" | "email" | "written" | "formal_complaint" | "other";

/**
 * A workplace right / protected activity event, structured for the case file.
 * The checker captures `kind` and `decisionMakerAware`; the documentation flow
 * later enriches the optional detail (description, date, recipient, form).
 */
export interface WorkplaceRightEvent {
    id: string;
    kind: WorkplaceRightKind;
    description: string;
    date?: string;
    recipient?: string;
    form?: WorkplaceRightForm;
    decisionMakerAware: YesNoUnsure;
}

/** A protected attribute under s.351 the user believes was a factor. */
export interface ProtectedAttribute {
    /** Label from the s.351 list (config-driven). */
    attribute: string;
    decisionMakerKnew: YesNoUnsure;
}

/** Per-claim status. */
export type ClaimStatus = "likely" | "possible_complex" | "unlikely" | "time_barred";

export interface ClaimDeadline {
    /** Plain-language basis, e.g. "21 days from dismissal". */
    basis: string;
    /** ISO date the window closes. */
    date: string;
    daysRemaining: number;
}

/**
 * The assessment of a single candidate claim. Never a verdict, score, or dollar
 * value. Only the user's own documented facts that tend to support or weaken it.
 */
export interface ClaimAssessment {
    claimType: ClaimType;
    status: ClaimStatus;
    deadline: ClaimDeadline | null;
    /** Jurisdictional gates not met (drives "unlikely"). */
    unmetGates: string[];
    supportingFacts: string[];
    weakeningFacts: string[];
}

export type CheckerFlag =
    | "constructive_dismissal"
    | "fixed_term_complexity"
    | "casual_question"
    | "redundancy_to_review"
    | "high_income_borderline"
    | "employer_size_uncertain"
    | "sham_contracting"
    | "below_minimum_period"
    | "coverage_uncertain"
    // General protections
    | "workplace_right_exercised"
    | "complaint_or_inquiry_made"
    | "protected_attribute_present"
    | "temporal_proximity_short"
    | "decision_maker_knew"
    | "decision_maker_knowledge_unclear"
    | "multiple_actions_election_required"
    | "gp_non_dismissal_path"
    | "industrial_activity";

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

    // General protections screening (asked of every dismissal-based case).
    /** Workplace rights / protected activity exercised before the dismissal ("none" = sentinel). */
    workplace_rights?: (WorkplaceRightKind | "none")[];
    /** Protected attributes (s.351) the user believes were a factor. */
    protected_attributes?: string[];
    /** Did the decision-maker know about the protected act/attribute? (reverse onus crux) */
    decision_maker_aware?: YesNoUnsure;

    // Optional identity fields, not asked in the checker MVP, reserved so the
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
        employee_status?: EmployeeStatus;
        employment_type?: EmploymentType;
        /** Casual only: regular and systematic work pattern. */
        casual_regular?: boolean;
        /** Casual only: reasonable expectation of ongoing work. */
        casual_expectation?: boolean;
        start_date?: string;
        end_date?: string;
        salary?: number;
        award_or_eba: "award" | "eba" | "both" | "none" | "unsure";
        award_covered?: YesNoUnsure;
        eba_applies?: YesNoUnsure;
    };
    employer: {
        legal_name?: string;
        abn?: string;
        size_bucket?: EmployerSize;
        size_estimate?: SizeEstimate;
        has_associated_entities?: YesNoUnsure;
    };
    dismissal: {
        /** What happened with the job (checker Q1). */
        kind?: DismissalKind;
        effective_date?: string;
        reason_category?: ReasonCategory;
        redundancy_claimed: boolean;
        days_remaining: number | null;
    };
    /** Structured workplace-right events for the case file (general protections). */
    workplace_rights: WorkplaceRightEvent[];
    /** Structured protected attributes for the case file (general protections). */
    protected_attributes: ProtectedAttribute[];
    /** Per-claim assessments, replacing the single outcome bucket. */
    candidate_claims: ClaimAssessment[];
    flags: CheckerFlag[];
    /** Retained for back-compat; mirrors the unfair dismissal claim status. */
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
    | "reason"
    // General protections screening
    | "workplace_rights"
    | "protected_attributes"
    | "decision_maker_aware";

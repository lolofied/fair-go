import {
    getHighIncomeThreshold,
    MIN_EMPLOYMENT_MONTHS,
    UNFAIR_DISMISSAL_TIME_LIMIT_DAYS,
} from "@/config/fair-work";
import type {
    CapturedData,
    CheckerAnswers,
    CheckerFlag,
    EmployerSize,
    OutcomeBucket,
    StepId,
} from "@/checker/types";

/* ----------------------------------- dates ---------------------------------- */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseISODate(value?: string): Date | null {
    if (!value) return null;
    const d = new Date(value + "T00:00:00");
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Clamp for month-length overflow (e.g. 31 Jan + 1 month).
    if (d.getDate() < day) d.setDate(0);
    return d;
}

function diffInDays(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/**
 * Days left to lodge, out of 21. The application must be made within 21 days
 * after the dismissal took effect (counting starts the day after), so the
 * deadline is `effective_date + 21 days`. Returns a value that can go negative
 * once the window has closed; `null` when there is no dismissal date yet.
 */
export function daysRemaining(effectiveDate?: string): number | null {
    const effective = parseISODate(effectiveDate);
    if (!effective) return null;
    const deadline = addDays(effective, UNFAIR_DISMISSAL_TIME_LIMIT_DAYS);
    return diffInDays(deadline, startOfToday());
}

export function deadlineDate(effectiveDate?: string): Date | null {
    const effective = parseISODate(effectiveDate);
    return effective ? addDays(effective, UNFAIR_DISMISSAL_TIME_LIMIT_DAYS) : null;
}

/* ------------------------------- derivations -------------------------------- */

export function sizeBucket(a: CheckerAnswers): EmployerSize | undefined {
    if (a.employer_size === "small" || a.employer_size === "large") return a.employer_size;
    if (a.employer_size === "unsure") {
        if (a.size_estimate === "under_15") return "small";
        if (a.size_estimate === "15_plus") return "large";
        return "unsure";
    }
    return undefined;
}

export function minEmploymentMonths(a: CheckerAnswers): number {
    return sizeBucket(a) === "small" ? MIN_EMPLOYMENT_MONTHS.smallBusiness : MIN_EMPLOYMENT_MONTHS.standard;
}

/** End date used for tenure: the dismissal date, or today if not yet dismissed. */
function effectiveEndDate(a: CheckerAnswers): Date {
    return parseISODate(a.effective_date) ?? startOfToday();
}

export function tenure(a: CheckerAnswers): { months: number; meetsMinimum: boolean | null } {
    const start = parseISODate(a.start_date);
    if (!start) return { months: 0, meetsMinimum: null };
    const end = effectiveEndDate(a);
    const months = Math.max(0, diffInDays(end, start) / 30.4375);
    const requiredFrom = addMonths(start, minEmploymentMonths(a));
    return { months, meetsMinimum: end >= requiredFrom };
}

export function coverageSatisfied(a: CheckerAnswers): boolean {
    const threshold = getHighIncomeThreshold(parseISODate(a.effective_date));
    const underThreshold = typeof a.salary === "number" ? a.salary < threshold.amount : true;
    // "Not sure" about award / EBA is treated optimistically (counts as covered).
    const awardOk = a.award_covered === "yes" || a.award_covered === "unsure";
    const ebaOk = a.eba_applies === "yes" || a.eba_applies === "unsure";
    return awardOk || ebaOk || underThreshold;
}

export function awardOrEba(a: CheckerAnswers): CapturedData["employee"]["award_or_eba"] {
    const award = a.award_covered === "yes";
    const eba = a.eba_applies === "yes";
    if (award && eba) return "both";
    if (award) return "award";
    if (eba) return "eba";
    if (a.award_covered === "unsure" || a.eba_applies === "unsure") return "unsure";
    if (a.award_covered === "no" && a.eba_applies === "no") return "none";
    return "unsure";
}

/* ---------------------------------- flags ----------------------------------- */

export function computeFlags(a: CheckerAnswers): CheckerFlag[] {
    const flags = new Set<CheckerFlag>();

    if (a.dismissed === "forced_resignation") flags.add("constructive_dismissal");
    if (a.dismissed === "fixed_term_ended" || a.employment_type === "fixed_term_early") {
        flags.add("fixed_term_complexity");
    }
    if (a.dismissed === "redundancy" || a.reason === "redundancy") flags.add("redundancy_to_review");
    if (a.employment_type === "casual") flags.add("casual_question");
    if (a.employee_status === "contractor") flags.add("sham_contracting");
    if (a.employer_size === "unsure" && sizeBucket(a) === "unsure") flags.add("employer_size_uncertain");
    if (a.award_covered === "unsure" || a.eba_applies === "unsure") flags.add("coverage_uncertain");

    const { meetsMinimum } = tenure(a);
    if (meetsMinimum === false) flags.add("below_minimum_period");

    const threshold = getHighIncomeThreshold(parseISODate(a.effective_date));
    if (typeof a.salary === "number") {
        const ratio = a.salary / threshold.amount;
        const noModernCoverage = a.award_covered === "no" && a.eba_applies === "no";
        if (ratio >= 0.9 && (ratio <= 1.1 || noModernCoverage)) flags.add("high_income_borderline");
    }

    return [...flags];
}

/* --------------------------------- outcome ---------------------------------- */

export function computeOutcome(a: CheckerAnswers): OutcomeBucket {
    // Other claims — unfair dismissal does not apply, but something else might.
    if (a.dismissed === "resigned") return 3;
    if (a.employee_status === "volunteer") return 3;

    // Time-barred (standard window). Still routed to a lawyer for the
    // exceptional-circumstances extension — never "no claim".
    const remaining = daysRemaining(a.effective_date);
    if (remaining !== null && remaining < 0) return 4;

    // Not yet dismissed — there is no claim *yet*; treat as "prepare now".
    if (a.dismissed === "not_yet") return 2;

    const flags = computeFlags(a);
    const complexFlags: CheckerFlag[] = [
        "constructive_dismissal",
        "fixed_term_complexity",
        "casual_question",
        "redundancy_to_review",
        "employer_size_uncertain",
        "high_income_borderline",
        "sham_contracting",
        "below_minimum_period",
    ];
    const isComplex = flags.some((f) => complexFlags.includes(f));

    // Coverage / income gate or any complexity → possibly eligible, complex.
    if (!coverageSatisfied(a) || isComplex) return 2;

    return 1;
}

/* ----------------------------- captured data -------------------------------- */

export function toCapturedData(a: CheckerAnswers): CapturedData {
    return {
        employee: {
            name: a.name,
            role: a.role,
            employment_type: a.employment_type,
            start_date: a.start_date,
            end_date: a.dismissed === "not_yet" ? undefined : a.effective_date,
            salary: a.salary,
            award_or_eba: awardOrEba(a),
        },
        employer: {
            legal_name: a.employer_legal_name,
            abn: a.employer_abn,
            size_bucket: sizeBucket(a),
            has_associated_entities: a.has_associated_entities,
        },
        dismissal: {
            effective_date: a.dismissed === "not_yet" ? undefined : a.effective_date,
            reason_category: a.reason,
            redundancy_claimed: a.dismissed === "redundancy" || a.reason === "redundancy",
            days_remaining: daysRemaining(a.effective_date),
        },
        flags: computeFlags(a),
        outcome_bucket: computeOutcome(a),
    };
}

/* ------------------------------ flow sequence ------------------------------- */

/**
 * The ordered list of question steps that currently apply, given the answers so
 * far. Branching (casual follow-ups, "unsure" size refinement, not-yet skips)
 * and short-circuits (voluntary resignation, volunteer) are all expressed here.
 * The sequence grows as answers are filled in; "next" is simply the step after
 * the current one, or the result screen when there is none.
 */
export function stepSequence(a: CheckerAnswers): StepId[] {
    const steps: StepId[] = ["dismissed"];
    if (!a.dismissed) return steps;
    if (a.dismissed === "resigned") return steps; // → result (other claims)

    const hasDismissalDate = a.dismissed !== "not_yet";
    if (hasDismissalDate) steps.push("dismissal_date");

    steps.push("employee_status");
    if (!a.employee_status) return steps;
    if (a.employee_status === "volunteer") return steps; // → result (out)

    steps.push("employment_type");
    if (!a.employment_type) return steps;
    if (a.employment_type === "casual") {
        steps.push("casual_regular");
        if (a.casual_regular !== undefined) steps.push("casual_expectation");
    }

    steps.push("employer_size");
    if (!a.employer_size) return steps;
    if (a.employer_size === "unsure") {
        steps.push("size_estimate");
        if (a.size_estimate !== undefined) steps.push("size_associated");
    }

    steps.push("start_date");
    steps.push("award");
    steps.push("eba");
    steps.push("salary");
    if (hasDismissalDate) steps.push("reason");

    return steps;
}

/** Heuristic denominator so the progress bar stays smooth and forward-moving. */
const TYPICAL_STEP_COUNT = 11;

export function progressFor(currentStep: StepId, a: CheckerAnswers): number {
    const seq = stepSequence(a);
    const index = seq.indexOf(currentStep);
    const denominator = Math.max(seq.length, TYPICAL_STEP_COUNT);
    const value = (index + 1) / (denominator + 1);
    return Math.min(0.95, Math.max(0.05, value));
}

export function nextStep(currentStep: StepId, a: CheckerAnswers): StepId | "result" {
    const seq = stepSequence(a);
    const index = seq.indexOf(currentStep);
    if (index === -1 || index + 1 >= seq.length) return "result";
    return seq[index + 1];
}

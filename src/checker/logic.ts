import { getLegalConstants } from "@/config/legal-constants";
import { getHighIncomeThreshold, MIN_EMPLOYMENT_MONTHS } from "@/config/fair-work";
import type { CapturedData, CheckerAnswers, CheckerFlag, EmployerSize, StepId, WorkplaceRightKind } from "@/checker/types";

/* ----------------------------- shared constants ----------------------------- */

/** Sentinel multiselect values that mean "nothing applies". */
export const NONE_VALUE = "none";
/** Sentinel value on the protected-attributes question. */
export const PREFER_NOT_TO_SAY = "prefer_not_to_say";

/** Dismissal kinds where the employer ended the employment (a "dismissal"). */
export function isDismissalBased(a: CheckerAnswers): boolean {
    return (
        a.dismissed === "terminated" ||
        a.dismissed === "forced_resignation" ||
        a.dismissed === "redundancy" ||
        a.dismissed === "fixed_term_ended"
    );
}

/** Real workplace rights selected (excludes the "none" sentinel). */
export function selectedWorkplaceRights(a: CheckerAnswers): WorkplaceRightKind[] {
    return (a.workplace_rights ?? []).filter((v): v is WorkplaceRightKind => v !== NONE_VALUE);
}

/** Real protected attributes selected (excludes "none" / "prefer not to say"). */
export function selectedProtectedAttributes(a: CheckerAnswers): string[] {
    return (a.protected_attributes ?? []).filter((v) => v !== NONE_VALUE && v !== PREFER_NOT_TO_SAY);
}

/** Whether the case has at least one candidate prohibited reason for general protections. */
export function hasProtectedReason(a: CheckerAnswers): boolean {
    return selectedWorkplaceRights(a).length > 0 || selectedProtectedAttributes(a).length > 0;
}

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
 * Days left to lodge within a `limitDays` window. The application must be made
 * within the window after the dismissal took effect (counting starts the day
 * after), so the deadline is `effective_date + limitDays`. Returns a value that
 * can go negative once the window has closed; `null` when there is no date yet.
 */
export function daysRemainingForDate(effectiveDate: string | undefined, limitDays: number): number | null {
    const effective = parseISODate(effectiveDate);
    if (!effective) return null;
    const deadline = addDays(effective, limitDays);
    return diffInDays(deadline, startOfToday());
}

export function deadlineDateForDays(effectiveDate: string | undefined, limitDays: number): Date | null {
    const effective = parseISODate(effectiveDate);
    return effective ? addDays(effective, limitDays) : null;
}

/** Days left to lodge an unfair dismissal application (21-day window). */
export function daysRemaining(effectiveDate?: string): number | null {
    return daysRemainingForDate(effectiveDate, getLegalConstants(parseISODate(effectiveDate)).timeLimits.unfairDismissalDays);
}

export function deadlineDate(effectiveDate?: string): Date | null {
    return deadlineDateForDays(effectiveDate, getLegalConstants(parseISODate(effectiveDate)).timeLimits.unfairDismissalDays);
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

    /* ---- general protections presence flags (derived straight from answers) ---- */

    // Still-employed but being targeted (PIP / show-cause): a non-dismissal path.
    if (a.dismissed === "not_yet") flags.add("gp_non_dismissal_path");

    const rights = selectedWorkplaceRights(a);
    if (rights.length > 0) flags.add("workplace_right_exercised");
    if (rights.includes("complaint_or_inquiry")) flags.add("complaint_or_inquiry_made");
    if (rights.includes("industrial_activity")) flags.add("industrial_activity");
    if (selectedProtectedAttributes(a).length > 0) flags.add("protected_attribute_present");

    if (hasProtectedReason(a)) {
        if (a.decision_maker_aware === "yes") flags.add("decision_maker_knew");
        if (a.decision_maker_aware === "unsure") flags.add("decision_maker_knowledge_unclear");
    }

    return [...flags];
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

    // Still employed but being targeted (PIP / show-cause). We do NOT run the
    // dismissal flow. We detect a possible general-protections non-dismissal
    // situation (different 6-year limit) and route to a lawyer from the result.
    if (a.dismissed === "not_yet") return steps;

    // From here on the employer ended the employment (a "dismissal").
    steps.push("dismissal_date");

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
    steps.push("reason");

    // General protections screening runs for EVERY dismissal-based case, both
    // when unfair dismissal looks viable (GP may be the stronger/additional
    // claim) and when it doesn't (GP has no minimum period or income gate, so
    // it catches the people UD rejects). This is never a dead end.
    steps.push("workplace_rights");
    if (!a.workplace_rights) return steps;

    steps.push("protected_attributes");
    if (!a.protected_attributes) return steps;

    // The decision-maker's knowledge is the crux of the reverse onus, so we only
    // ask it once there is a candidate prohibited reason to attach it to.
    if (hasProtectedReason(a)) steps.push("decision_maker_aware");

    return steps;
}

/** Heuristic denominator so the progress bar stays smooth and forward-moving. */
const TYPICAL_STEP_COUNT = 14;

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

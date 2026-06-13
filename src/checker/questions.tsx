import { getLegalConstants } from "@/config/legal-constants";
import { NONE_VALUE, PREFER_NOT_TO_SAY } from "@/checker/logic";
import type { CheckerAnswers, StepId } from "@/checker/types";

export interface ChoiceOption {
    value: string;
    label: string;
    description?: string;
}

interface BaseStep {
    /** Field on CheckerAnswers this step writes to. */
    field: keyof CheckerAnswers;
    title: string;
    subtitle?: string;
}

export interface ChoiceStepDef extends BaseStep {
    kind: "choice";
    options: ChoiceOption[];
}

export interface BooleanStepDef extends BaseStep {
    kind: "boolean";
    /** Optional custom labels for the yes/no cards. */
    yesLabel?: string;
    noLabel?: string;
    options?: never;
}

export interface DateStepDef extends BaseStep {
    kind: "date";
    /** Restrict to dates on or before today. */
    maxToday?: boolean;
}

export interface NumberStepDef extends BaseStep {
    kind: "number";
    prefix?: string;
    placeholder?: string;
}

export interface MultiSelectStepDef extends BaseStep {
    kind: "multiselect";
    options: ChoiceOption[];
    /** A value that, when chosen, clears all others (e.g. "none"). */
    exclusiveValue?: string;
}

export type StepDef = ChoiceStepDef | BooleanStepDef | DateStepDef | NumberStepDef | MultiSelectStepDef;

const YES_NO_UNSURE: ChoiceOption[] = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "unsure", label: "I'm not sure" },
];

export const STEPS: Record<StepId, StepDef> = {
    dismissed: {
        kind: "choice",
        field: "dismissed",
        title: "What's happened with your job?",
        subtitle: "Pick the option that fits best. You can add detail later.",
        options: [
            { value: "terminated", label: "I was sacked or terminated", description: "My employer ended my employment." },
            {
                value: "forced_resignation",
                label: "I was forced to resign",
                description: "I felt I had no choice but to quit (constructive dismissal).",
            },
            { value: "redundancy", label: "I was made redundant", description: "My role was said to be no longer needed." },
            { value: "fixed_term_ended", label: "My contract or fixed term ended", description: "A fixed-term or contract role wasn't renewed." },
            {
                value: "not_yet",
                label: "I'm on a PIP or show-cause (not dismissed yet)",
                description: "I'm worried about losing my job but it hasn't happened.",
            },
            { value: "resigned", label: "I resigned voluntarily", description: "I chose to leave." },
        ],
    },
    dismissal_date: {
        kind: "date",
        field: "effective_date",
        maxToday: true,
        title: "When did your dismissal take effect?",
        subtitle: "Usually your last day of employment. This starts the 21-day clock.",
    },
    employee_status: {
        kind: "choice",
        field: "employee_status",
        title: "How were you engaged?",
        options: [
            { value: "employee", label: "As an employee", description: "On a wage or salary, on the books." },
            { value: "contractor", label: "As a contractor", description: "Paid via an ABN or invoices." },
            { value: "volunteer", label: "As a volunteer or unpaid", description: "No pay for the work." },
        ],
    },
    employment_type: {
        kind: "choice",
        field: "employment_type",
        title: "What was your employment type?",
        options: [
            { value: "permanent", label: "Permanent", description: "Full-time or part-time, ongoing." },
            { value: "casual", label: "Casual" },
            { value: "fixed_term_early", label: "Fixed-term, ended early", description: "A set-term contract cut short." },
            { value: "trainee", label: "Apprentice or trainee" },
        ],
    },
    casual_regular: {
        kind: "boolean",
        field: "casual_regular",
        title: "Did you work on a regular and systematic basis?",
        subtitle: "For example, a recurring roster or consistent shifts over a period of time.",
    },
    casual_expectation: {
        kind: "boolean",
        field: "casual_expectation",
        title: "Did you have a reasonable expectation of ongoing work?",
        subtitle: "Were you led to believe the work would keep coming?",
    },
    employer_size: {
        kind: "choice",
        field: "employer_size",
        title: "How big was your employer?",
        options: [
            { value: "small", label: "Small business", description: "Fewer than 15 employees." },
            { value: "large", label: "Larger employer", description: "15 or more employees." },
            { value: "unsure", label: "I'm not sure" },
        ],
    },
    size_estimate: {
        kind: "choice",
        field: "size_estimate",
        title: "Roughly how many people worked there?",
        subtitle: "A best guess is fine. Count casuals who worked regularly.",
        options: [
            { value: "under_15", label: "Fewer than 15" },
            { value: "15_plus", label: "15 or more" },
            { value: "still_unsure", label: "Honestly, I can't say" },
        ],
    },
    size_associated: {
        kind: "choice",
        field: "has_associated_entities",
        title: "Was your employer part of a larger group of companies?",
        subtitle: "Related or parent companies can count towards the headcount.",
        options: YES_NO_UNSURE,
    },
    start_date: {
        kind: "date",
        field: "start_date",
        maxToday: true,
        title: "When did you start working there?",
        subtitle: "We use this to check the minimum employment period.",
    },
    award: {
        kind: "choice",
        field: "award_covered",
        title: "Are you covered by a modern award?",
        subtitle: "Most employees are. If you're not sure, that's completely fine.",
        options: YES_NO_UNSURE,
    },
    eba: {
        kind: "choice",
        field: "eba_applies",
        title: "Does an enterprise agreement apply to you?",
        subtitle: "A workplace agreement negotiated with your employer.",
        options: YES_NO_UNSURE,
    },
    salary: {
        kind: "number",
        field: "salary",
        prefix: "$",
        placeholder: "e.g. 85000",
        title: "What was your annual salary?",
        subtitle: "Your annual rate of earnings before tax. Don't include superannuation.",
    },
    reason: {
        kind: "choice",
        field: "reason",
        title: "What reason did they give for the dismissal?",
        subtitle: "This just tags your file. It never counts against you here.",
        options: [
            { value: "performance", label: "Performance", description: "Said my work wasn't up to standard." },
            { value: "conduct", label: "Conduct", description: "Alleged behaviour or a policy breach." },
            { value: "redundancy", label: "Redundancy", description: "Role no longer required." },
            { value: "none_given", label: "No reason was given" },
        ],
    },
    workplace_rights: {
        kind: "multiselect",
        field: "workplace_rights",
        title: "In the lead-up to your dismissal, did you do any of these?",
        subtitle: "Select all that apply. These can point to a second, often stronger claim (general protections).",
        exclusiveValue: NONE_VALUE,
        options: [
            {
                value: "complaint_or_inquiry",
                label: "Made a complaint or inquiry about your job",
                description: "About pay, hours, safety, or conditions.",
            },
            {
                value: "entitlement_benefit",
                label: "Asked about or asserted an entitlement",
                description: "Wages, leave, super, or allowances.",
            },
            {
                value: "leave",
                label: "Took or proposed to take leave",
                description: "Sick, carer's, or parental leave.",
            },
            {
                value: "safety_or_discrimination",
                label: "Raised a discrimination, bullying, or safety concern",
            },
            {
                value: "industrial_activity",
                label: "Were involved in a union or industrial activity",
            },
            { value: NONE_VALUE, label: "None of these" },
        ],
    },
    protected_attributes: {
        kind: "multiselect",
        field: "protected_attributes",
        title: "Do you believe any of these was a factor in how you were treated?",
        subtitle: "This is optional and never required to continue. Select any that apply.",
        exclusiveValue: NONE_VALUE,
        options: [
            ...getLegalConstants().protectedAttributes.map((attribute) => ({ value: attribute, label: attribute })),
            { value: PREFER_NOT_TO_SAY, label: "Prefer not to say" },
            { value: NONE_VALUE, label: "None of these" },
        ],
    },
    decision_maker_aware: {
        kind: "choice",
        field: "decision_maker_aware",
        title: "Did the person who decided to dismiss you know about this?",
        subtitle: "This is the crux: general protections puts the onus on the employer to prove the reason.",
        options: YES_NO_UNSURE,
    },
};

export const OPTION_LETTERS = "ABCDEFGHIJ".split("");

/** Whether the current step already has a usable answer (controls the Continue affordance). */
export function isStepAnswered(step: StepId, a: CheckerAnswers): boolean {
    const def = STEPS[step];
    const value = a[def.field];
    if (def.kind === "number") return typeof value === "number" && !Number.isNaN(value);
    if (def.kind === "boolean") return typeof value === "boolean";
    if (def.kind === "multiselect") return Array.isArray(value) && value.length > 0;
    return value !== undefined && value !== "";
}

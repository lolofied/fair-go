/**
 * Claim-type-keyed rules engine.
 *
 * A single case can carry multiple candidate claims, each independently
 * assessed. This module turns the flat answers into a list of `ClaimAssessment`s
 * plus the structured `CapturedData` the (later) documentation flow consumes.
 *
 * SAFETY (hard requirements, see PRD §4.5):
 *  - Never advise which path to choose; the s.725 election is legal advice.
 *  - Never instruct the user to lodge both UD and GP.
 *  - Surface the election warning wherever both dismissal paths are viable.
 *  - Never state a case is worthless; negative outcomes still route to a lawyer.
 *  - Outputs are the user's own documented facts, never a verdict, score, or $.
 */

import { getLegalConstants } from "@/config/legal-constants";
import {
    awardOrEba,
    computeFlags,
    coverageSatisfied,
    daysRemainingForDate,
    deadlineDateForDays,
    hasProtectedReason,
    isDismissalBased,
    minEmploymentMonths,
    parseISODate,
    selectedProtectedAttributes,
    selectedWorkplaceRights,
    sizeBucket,
    tenure,
} from "@/checker/logic";
import type {
    CapturedData,
    CheckerAnswers,
    CheckerFlag,
    ClaimAssessment,
    ClaimDeadline,
    ClaimStatus,
    OutcomeBucket,
    ProtectedAttribute,
    WorkplaceRightEvent,
    WorkplaceRightKind,
} from "@/checker/types";

/* --------------------------------- helpers ---------------------------------- */

function toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

function buildDeadline(effectiveDate: string | undefined, limitDays: number, basis: string): ClaimDeadline | null {
    const date = deadlineDateForDays(effectiveDate, limitDays);
    const remaining = daysRemainingForDate(effectiveDate, limitDays);
    if (!date || remaining === null) return null;
    return { basis, date: toISO(date), daysRemaining: remaining };
}

const UD_COMPLEX_FLAGS: CheckerFlag[] = [
    "constructive_dismissal",
    "fixed_term_complexity",
    "casual_question",
    "redundancy_to_review",
    "employer_size_uncertain",
    "high_income_borderline",
    "sham_contracting",
    "coverage_uncertain",
];

const isViable = (status: ClaimStatus) => status === "likely" || status === "possible_complex";

/* ----------------------------- claim assessors ------------------------------ */

/** Unfair dismissal (Fair Work Act Part 3-2). Jurisdictional gates are hard. */
export function assessUnfairDismissal(a: CheckerAnswers): ClaimAssessment | null {
    if (!isDismissalBased(a)) return null;

    const c = getLegalConstants(parseISODate(a.effective_date));
    const deadline = buildDeadline(a.effective_date, c.timeLimits.unfairDismissalDays, "21 days from dismissal");

    const supportingFacts: string[] = [];
    const weakeningFacts: string[] = [];
    const unmetGates: string[] = [];

    if (deadline && deadline.daysRemaining < 0) {
        return { claimType: "unfair_dismissal", status: "time_barred", deadline, unmetGates, supportingFacts, weakeningFacts };
    }

    if (a.employee_status === "volunteer") {
        unmetGates.push("Unfair dismissal protects employees; volunteers are not covered.");
    } else if (a.employee_status === "contractor") {
        weakeningFacts.push(
            "You were engaged as a contractor. Unfair dismissal protects employees, though a sham-contracting arrangement may still qualify.",
        );
    }

    const { months, meetsMinimum } = tenure(a);
    const minMonths = minEmploymentMonths(a);
    if (meetsMinimum === false) {
        unmetGates.push(`Minimum employment period not met. ${minMonths} months are required.`);
        weakeningFacts.push(`You had served about ${Math.floor(months)} months when it ended.`);
    } else if (meetsMinimum === true) {
        supportingFacts.push(`You met the ${minMonths}-month minimum employment period.`);
    }

    const threshold = c.highIncomeThreshold;
    const overThreshold = typeof a.salary === "number" && a.salary >= threshold;
    const noCoverage = a.award_covered === "no" && a.eba_applies === "no";
    if (overThreshold && noCoverage) {
        unmetGates.push("Your earnings exceed the high income threshold and no award or agreement covers you.");
    } else if (coverageSatisfied(a)) {
        supportingFacts.push("You're covered by an award/agreement or under the high income threshold.");
    }

    let status: ClaimStatus;
    if (unmetGates.length > 0) {
        status = "unlikely";
    } else {
        const flags = computeFlags(a);
        const isComplex = flags.some((f) => UD_COMPLEX_FLAGS.includes(f));
        status = isComplex ? "possible_complex" : "likely";
        if (status === "likely") supportingFacts.push("The main eligibility checkpoints are met.");
    }

    return { claimType: "unfair_dismissal", status, deadline, unmetGates, supportingFacts, weakeningFacts };
}

/** General protections, dismissal (Part 3-1, s.365). No min period, no income gate. */
export function assessGeneralProtectionsDismissal(a: CheckerAnswers): ClaimAssessment | null {
    if (!isDismissalBased(a)) return null;

    const c = getLegalConstants(parseISODate(a.effective_date));
    const deadline = buildDeadline(a.effective_date, c.timeLimits.generalProtectionsDismissalDays, "21 days from dismissal");

    const supportingFacts: string[] = [];
    const weakeningFacts: string[] = [];
    const unmetGates: string[] = [];

    if (deadline && deadline.daysRemaining < 0) {
        return {
            claimType: "general_protections_dismissal",
            status: "time_barred",
            deadline,
            unmetGates,
            supportingFacts,
            weakeningFacts,
        };
    }

    if (a.employee_status === "volunteer") {
        unmetGates.push("General protections for employees require an employment relationship.");
    }

    const rights = selectedWorkplaceRights(a);
    const attrs = selectedProtectedAttributes(a);
    const hasReason = hasProtectedReason(a);

    if (rights.length > 0) {
        supportingFacts.push("You exercised a workplace right before the dismissal (e.g. a complaint, an entitlement, or leave).");
    }
    if (attrs.length > 0) {
        supportingFacts.push(`You believe a protected attribute was a factor: ${attrs.join(", ")}.`);
    }

    if (hasReason) {
        if (a.decision_maker_aware === "yes") {
            supportingFacts.push(
                "The person who decided to dismiss you knew about it, which is central to the reverse onus on the employer.",
            );
        } else if (a.decision_maker_aware === "no") {
            weakeningFacts.push("The decision-maker may not have known about it, which makes the connection harder to draw.");
        } else {
            weakeningFacts.push("It's unclear whether the decision-maker knew. Worth pinning down, as the reverse onus turns on it.");
        }
        supportingFacts.push(
            "If adverse action is shown, the employer must prove the protected reason was not why they acted (reverse onus).",
        );
    }

    let status: ClaimStatus;
    if (unmetGates.length > 0) {
        status = "unlikely";
    } else if (!hasReason) {
        status = "unlikely";
        weakeningFacts.push("No workplace right or protected attribute has been identified yet.");
    } else if (a.decision_maker_aware === "yes") {
        status = "likely";
    } else {
        status = "possible_complex";
    }

    return { claimType: "general_protections_dismissal", status, deadline, unmetGates, supportingFacts, weakeningFacts };
}

/**
 * General protections, non-dismissal (still employed, targeted). We only DETECT
 * and FLAG this, note the different 6-year limit, and route to a lawyer; we do
 * not run a dismissal assessment for it.
 */
export function assessGeneralProtectionsNonDismissal(a: CheckerAnswers): ClaimAssessment | null {
    if (a.dismissed !== "not_yet") return null;

    const c = getLegalConstants();
    const years = c.timeLimits.generalProtectionsNonDismissalYears;
    const today = new Date();
    const date = addYears(new Date(today.getFullYear(), today.getMonth(), today.getDate()), years);
    const deadline: ClaimDeadline = {
        basis: `${years}-year general limitation period`,
        date: toISO(date),
        daysRemaining: daysRemainingForDate(toISO(today), years * 365) ?? years * 365,
    };

    return {
        claimType: "general_protections_non_dismissal",
        status: "possible_complex",
        deadline,
        unmetGates: [],
        supportingFacts: [
            "You're still employed but being targeted, and adverse action short of dismissal can be a general-protections contravention.",
            `This path has a longer ${years}-year window, not the 21-day dismissal clock.`,
        ],
        weakeningFacts: [
            "Still-employed claims are fact-specific, so a lawyer should assess the adverse action and the reason behind it.",
        ],
    };
}

/* --------------------------------- engine ----------------------------------- */

/** All candidate claims for a case, in display priority order. */
export function assessClaims(a: CheckerAnswers): ClaimAssessment[] {
    const claims: ClaimAssessment[] = [];
    const ud = assessUnfairDismissal(a);
    const gpd = assessGeneralProtectionsDismissal(a);
    const gpnd = assessGeneralProtectionsNonDismissal(a);
    if (ud) claims.push(ud);
    if (gpd) claims.push(gpd);
    if (gpnd) claims.push(gpnd);
    return claims;
}

/**
 * Whether the s.725 election warning must be shown: two or more *dismissal-based*
 * claims are viable (likely or possible_complex). The user generally cannot
 * pursue both, but choosing is legal advice, so we only warn.
 */
export function electionRequired(claims: ClaimAssessment[]): boolean {
    const viableDismissal = claims.filter(
        (c) =>
            (c.claimType === "unfair_dismissal" || c.claimType === "general_protections_dismissal") && isViable(c.status),
    );
    return viableDismissal.length >= 2;
}

/* ------------------------------- captured data ------------------------------ */

const RIGHT_LABELS: Record<WorkplaceRightKind, string> = {
    complaint_or_inquiry: "Made a complaint or inquiry about the job",
    entitlement_benefit: "Asserted an entitlement or benefit",
    leave: "Took or proposed to take leave",
    safety_or_discrimination: "Raised a discrimination, bullying, or safety concern",
    industrial_activity: "Was involved in union or industrial activity",
};

function workplaceRightEvents(a: CheckerAnswers): WorkplaceRightEvent[] {
    return selectedWorkplaceRights(a).map((kind) => ({
        id: kind,
        kind,
        description: RIGHT_LABELS[kind],
        decisionMakerAware: a.decision_maker_aware ?? "unsure",
    }));
}

function protectedAttributeRecords(a: CheckerAnswers): ProtectedAttribute[] {
    return selectedProtectedAttributes(a).map((attribute) => ({
        attribute,
        decisionMakerKnew: a.decision_maker_aware ?? "unsure",
    }));
}

/** Back-compat: a single UD-centric bucket derived from the claim assessments. */
export function computeOutcome(a: CheckerAnswers): OutcomeBucket {
    if (a.dismissed === "resigned") return 3;
    if (a.dismissed === "not_yet") return 2;
    const ud = assessUnfairDismissal(a);
    if (!ud) return 3;
    switch (ud.status) {
        case "time_barred":
            return 4;
        case "likely":
            return 1;
        case "possible_complex":
            return 2;
        case "unlikely":
            return 3;
    }
}

export function toCapturedData(a: CheckerAnswers): CapturedData {
    const claims = assessClaims(a);
    const flags = computeFlags(a);
    if (electionRequired(claims)) flags.push("multiple_actions_election_required");

    return {
        employee: {
            name: a.name,
            role: a.role,
            employee_status: a.employee_status,
            employment_type: a.employment_type,
            casual_regular: a.employment_type === "casual" ? a.casual_regular : undefined,
            casual_expectation: a.employment_type === "casual" ? a.casual_expectation : undefined,
            start_date: a.start_date,
            end_date: a.dismissed === "not_yet" ? undefined : a.effective_date,
            salary: a.salary,
            award_or_eba: awardOrEba(a),
            award_covered: a.award_covered,
            eba_applies: a.eba_applies,
        },
        employer: {
            legal_name: a.employer_legal_name,
            abn: a.employer_abn,
            size_bucket: sizeBucket(a),
            size_estimate: a.employer_size === "unsure" ? a.size_estimate : undefined,
            has_associated_entities: a.has_associated_entities,
        },
        dismissal: {
            kind: a.dismissed,
            effective_date: a.dismissed === "not_yet" ? undefined : a.effective_date,
            reason_category: a.reason,
            redundancy_claimed: a.dismissed === "redundancy" || a.reason === "redundancy",
            days_remaining: daysRemainingForDate(
                a.effective_date,
                getLegalConstants(parseISODate(a.effective_date)).timeLimits.unfairDismissalDays,
            ),
        },
        workplace_rights: workplaceRightEvents(a),
        protected_attributes: protectedAttributeRecords(a),
        candidate_claims: claims,
        flags,
        outcome_bucket: computeOutcome(a),
    };
}

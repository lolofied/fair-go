/**
 * Single, versioned source of truth for every Fair Work statutory value the
 * checker relies on.
 *
 * Legal constants drift: the high income threshold and the Commonwealth penalty
 * unit are indexed annually (the threshold every 1 July), and reforms change
 * other values over time. To stay accurate both historically and going forward,
 * each version records the values in force from its `effectiveFrom` date. Resolve
 * the set in force for a given date with `getLegalConstants(date)`.
 *
 * HARD RULE: no legal constant may be hard-coded anywhere else in the codebase.
 * Add a new version to the TOP of `LEGAL_CONSTANTS` each 1 July (or on any
 * reform) and everything downstream stays correct.
 *
 * ⚠️ The statutory figures below must be confirmed by counsel before shipping
 * and reviewed at least annually (and on any known reform).
 */

export type ClaimFormRef = "F2" | "F8" | "F8C";

export interface LegalConstants {
    /** ISO date (YYYY-MM-DD) from which these values apply. */
    effectiveFrom: string;
    /** Human label for the financial year, used in copy. */
    label: string;
    /** High income threshold (AUD, indexed 1 July, excludes superannuation). s.333. */
    highIncomeThreshold: number;
    /**
     * Maximum compensation an unfair dismissal order may include, expressed in
     * weeks of the employee's pay. The actual cap is the lesser of this many
     * weeks' pay or half the high income threshold. s.392(5)/(6).
     */
    maxCompensationWeeks: number;
    /** Headcount below which an employer is a "small business". s.23. */
    smallBusinessHeadcount: number;
    /** Minimum employment period before unfair dismissal protection applies. s.382, s.383. */
    minEmploymentMonths: {
        /** All other employers. */
        default: number;
        /** Small business employer. */
        smallBusiness: number;
    };
    timeLimits: {
        /** Days to lodge an unfair dismissal application. s.394(2). */
        unfairDismissalDays: number;
        /** Days to lodge a general protections dismissal application. s.366(1). */
        generalProtectionsDismissalDays: number;
        /** General limitation period for non-dismissal contraventions. s.544. */
        generalProtectionsNonDismissalYears: number;
        /** Days to apply to court after the FWC issues a certificate. s.370(a). */
        courtAfterCertificateDays: number;
    };
    /** Protected attributes under s.351. */
    protectedAttributes: string[];
    /** Commonwealth penalty unit (AUD, indexed). */
    penaltyUnitAud: number;
    /** FWC application forms by claim pathway. */
    formRefs: {
        unfairDismissal: ClaimFormRef;
        gpDismissal: ClaimFormRef;
        gpNonDismissal: ClaimFormRef;
    };
    /** Current FWC application fee (informational only). */
    fwcApplicationFee: number;
}

/** Protected attributes under Fair Work Act s.351. Stable across the versions below. */
const PROTECTED_ATTRIBUTES_S351: string[] = [
    "Race",
    "Colour",
    "Sex",
    "Sexual orientation",
    "Breastfeeding",
    "Gender identity",
    "Intersex status",
    "Age",
    "Physical disability",
    "Mental disability",
    "Marital status",
    "Family or carer's responsibilities",
    "Pregnancy",
    "Religion",
    "Political opinion",
    "National extraction",
    "Social origin",
];

const TIME_LIMITS: LegalConstants["timeLimits"] = {
    unfairDismissalDays: 21,
    generalProtectionsDismissalDays: 21,
    generalProtectionsNonDismissalYears: 6,
    courtAfterCertificateDays: 14,
};

const FORM_REFS: LegalConstants["formRefs"] = {
    unfairDismissal: "F2",
    gpDismissal: "F8",
    gpNonDismissal: "F8C",
};

/**
 * All versions, most recent first. Add the new 1 July values to the top each
 * year (high income threshold, penalty unit, application fee at minimum).
 */
export const LEGAL_CONSTANTS: LegalConstants[] = [
    {
        effectiveFrom: "2025-07-01",
        label: "FY2025-26",
        highIncomeThreshold: 183_100,
        maxCompensationWeeks: 26,
        smallBusinessHeadcount: 15,
        minEmploymentMonths: { default: 6, smallBusiness: 12 },
        timeLimits: TIME_LIMITS,
        protectedAttributes: PROTECTED_ATTRIBUTES_S351,
        penaltyUnitAud: 330,
        formRefs: FORM_REFS,
        fwcApplicationFee: 89.7,
    },
    {
        effectiveFrom: "2024-07-01",
        label: "FY2024-25",
        highIncomeThreshold: 175_000,
        maxCompensationWeeks: 26,
        smallBusinessHeadcount: 15,
        minEmploymentMonths: { default: 6, smallBusiness: 12 },
        timeLimits: TIME_LIMITS,
        protectedAttributes: PROTECTED_ATTRIBUTES_S351,
        penaltyUnitAud: 330,
        formRefs: FORM_REFS,
        fwcApplicationFee: 87.2,
    },
    {
        effectiveFrom: "2023-07-01",
        label: "FY2023-24",
        highIncomeThreshold: 167_500,
        maxCompensationWeeks: 26,
        smallBusinessHeadcount: 15,
        minEmploymentMonths: { default: 6, smallBusiness: 12 },
        timeLimits: TIME_LIMITS,
        protectedAttributes: PROTECTED_ATTRIBUTES_S351,
        penaltyUnitAud: 313,
        formRefs: FORM_REFS,
        fwcApplicationFee: 83.3,
    },
];

/**
 * The constants in force on a given date. The relevant figures are those that
 * applied immediately before the dismissal took effect, so we select by the
 * dismissal date (defaulting to today when none is known yet). Falls back to the
 * oldest known version if the date predates the table.
 */
export function getLegalConstants(at?: Date | null): LegalConstants {
    const date = at ?? new Date();
    const match = LEGAL_CONSTANTS.find((row) => date >= new Date(row.effectiveFrom + "T00:00:00"));
    return match ?? LEGAL_CONSTANTS[LEGAL_CONSTANTS.length - 1];
}

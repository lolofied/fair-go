/**
 * Back-compatible Fair Work helpers.
 *
 * Every value here is DERIVED from the single versioned source of truth in
 * `legal-constants.ts`. Nothing is hard-coded; these are thin accessors kept so
 * existing call sites keep working while the codebase migrates to resolving
 * `getLegalConstants(date)` directly.
 */

import { getLegalConstants } from "@/config/legal-constants";

export interface DatedAmount {
    /** ISO date (YYYY-MM-DD) this amount starts applying to a dismissal. */
    effectiveFrom: string;
    amount: number;
    /** Human label for the financial year, used in copy. */
    label: string;
}

/**
 * The high income threshold that applies to a dismissal. Per s.382/s.333 of the
 * Fair Work Act, the relevant figure is the one in force immediately before the
 * dismissal took effect, so we select by the dismissal date (defaulting to today
 * when no date is known yet, e.g. people not yet dismissed).
 */
export function getHighIncomeThreshold(dismissalDate?: Date | null): DatedAmount {
    const c = getLegalConstants(dismissalDate);
    return { effectiveFrom: c.effectiveFrom, amount: c.highIncomeThreshold, label: c.label };
}

/** The window (in days) to lodge an unfair dismissal application with the FWC. s.394(2). */
export const UNFAIR_DISMISSAL_TIME_LIMIT_DAYS = getLegalConstants().timeLimits.unfairDismissalDays;

/** Minimum employment period (months) before unfair dismissal protection applies. s.382, s.383. */
export const MIN_EMPLOYMENT_MONTHS = {
    /** Small business employer (fewer than 15 employees). */
    smallBusiness: getLegalConstants().minEmploymentMonths.smallBusiness,
    /** All other employers. */
    standard: getLegalConstants().minEmploymentMonths.default,
} as const;

/** An employer is a "small business" for unfair dismissal if it has fewer than this many employees. s.23. */
export const SMALL_BUSINESS_HEADCOUNT = getLegalConstants().smallBusinessHeadcount;

/** Current FWC application fee (informational only), shown on the result screen. */
export const FWC_APPLICATION_FEE = getLegalConstants().fwcApplicationFee;

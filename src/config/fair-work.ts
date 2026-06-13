/**
 * Fair Work statutory values that change over time.
 *
 * These are intentionally NOT hard-coded constants scattered through the logic.
 * The high income threshold is indexed every 1 July, so it is modelled as a
 * dated table: each row is the value that applies to dismissals taking effect
 * on/after `effectiveFrom`. To keep the checker correct after the next indexation,
 * add a new row at the top each 1 July (and, later, this table can be replaced by
 * a value fetched from a remote config endpoint without touching the call sites).
 *
 * Source: Fair Work Commission — High income threshold.
 */

export interface DatedAmount {
    /** ISO date (YYYY-MM-DD) this amount starts applying to a dismissal. */
    effectiveFrom: string;
    amount: number;
    /** Human label for the financial year, used in copy. */
    label: string;
}

/** Most recent first. Add the new 1 July value to the top each year. */
export const HIGH_INCOME_THRESHOLDS: DatedAmount[] = [
    { effectiveFrom: "2025-07-01", amount: 183_100, label: "FY2025–26" },
    { effectiveFrom: "2024-07-01", amount: 175_000, label: "FY2024–25" },
    { effectiveFrom: "2023-07-01", amount: 167_500, label: "FY2023–24" },
];

/**
 * The high income threshold that applies to a dismissal. Per s.382/s.332 of the
 * Fair Work Act, the relevant figure is the one in force immediately before the
 * dismissal took effect, so we select by the dismissal date (defaulting to today
 * when no date is known yet, e.g. people not yet dismissed).
 */
export function getHighIncomeThreshold(dismissalDate?: Date | null): DatedAmount {
    const at = dismissalDate ?? new Date();
    const match = HIGH_INCOME_THRESHOLDS.find((row) => at >= new Date(row.effectiveFrom + "T00:00:00"));
    // Fall back to the oldest known row if the date predates the table.
    return match ?? HIGH_INCOME_THRESHOLDS[HIGH_INCOME_THRESHOLDS.length - 1];
}

/** The window (in days) to lodge an unfair dismissal application with the FWC. s.394(2). */
export const UNFAIR_DISMISSAL_TIME_LIMIT_DAYS = 21;

/** Minimum employment period before unfair dismissal protection applies. s.382, s.383. */
export const MIN_EMPLOYMENT_MONTHS = {
    /** Small business employer (fewer than 15 employees). */
    smallBusiness: 12,
    /** All other employers. */
    standard: 6,
} as const;

/** An employer is a "small business" for unfair dismissal if it has fewer than this many employees. s.23. */
export const SMALL_BUSINESS_HEADCOUNT = 15;

/** Current FWC application fee — informational only, shown on the result screen. */
export const FWC_APPLICATION_FEE = 89.7;

/**
 * Published FWC / research figures for unfair dismissal outcomes.
 * Used on the marketing landing page only. General information, not legal advice.
 * Review when new FWC annual reports or conciliation statistics are published.
 */

/** Median compensation agreed at conciliation (FWC conciliation data, cited in research). */
export const MEDIAN_CONCILIATION_SETTLEMENT = 8_704;

/** Median compensation ordered when a matter proceeds to a formal decision. */
export const MEDIAN_DECISION_AWARD = 7_797;

/** Typical weeks-of-pay range cited for median decision awards. */
export const TYPICAL_AWARD_WEEKS = { low: 5, high: 7 } as const;

/** Illustrative low end of reported decision awards (decision examples). */
export const ILLUSTRATIVE_AWARD_LOW = 5_770;

/** Illustrative high end of commonly cited decision awards (decision examples). */
export const ILLUSTRATIVE_AWARD_HIGH = 20_000;

/** Share of applicants who receive the statutory maximum compensation (research estimate). */
export const MAX_CAP_RECIPIENT_RATE = 0.004;

/** Share of matters that settle at conciliation (range cited across sources). */
export const CONCILIATION_SETTLEMENT_RATE = { low: 0.75, high: 0.81 } as const;

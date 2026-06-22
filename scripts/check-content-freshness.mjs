/**
 * Content freshness check for YMYL articles and legal constants.
 *
 * Run before release and at least:
 * - every 1 July (high income threshold / fee updates), and
 * - every 12 months for employment blog articles.
 *
 * Usage: npm run check-content-freshness
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE_SEO = readFileSync(join(ROOT, "src/config/site-seo.ts"), "utf8");
const LEGAL_CONSTANTS = readFileSync(join(ROOT, "src/config/legal-constants.ts"), "utf8");

const MAX_REVIEW_AGE_DAYS = 365;
const now = new Date();

function parseIsoDates(source, field) {
    const pattern = new RegExp(`${field}:\\s*"(\\d{4}-\\d{2}-\\d{2})"`, "g");
    return [...source.matchAll(pattern)].map((match) => match[1]);
}

function daysSince(isoDate) {
    const then = new Date(`${isoDate}T00:00:00Z`);
    return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function checkReviewDates() {
    const reviewDates = parseIsoDates(SITE_SEO, "lastReviewedIso");
    const stale = reviewDates.filter((iso) => daysSince(iso) > MAX_REVIEW_AGE_DAYS);

    if (reviewDates.length === 0) {
        console.error("No lastReviewedIso entries found in site-seo.ts.");
        process.exitCode = 1;
        return;
    }

    if (stale.length > 0) {
        console.error(
            `Stale content reviews (> ${MAX_REVIEW_AGE_DAYS} days): ${stale.join(", ")}. Update lastReviewed in src/config/site-seo.ts.`,
        );
        process.exitCode = 1;
    } else {
        console.log(`All ${reviewDates.length} article review dates are within ${MAX_REVIEW_AGE_DAYS} days.`);
    }
}

function checkLegalConstantsReminder() {
    const month = now.getUTCMonth() + 1;
    const latestEffective = [...LEGAL_CONSTANTS.matchAll(/effectiveFrom:\s*"(\d{4}-\d{2}-\d{2})"/g)]
        .map((match) => match[1])
        .sort()
        .at(-1);

    if (month === 7) {
        console.warn(
            "July review: confirm high income threshold, FWC filing fee, and employment blog figures in src/config/legal-constants.ts.",
        );
    }

    if (latestEffective) {
        console.log(`Latest legal constants effective from ${latestEffective}.`);
    }
}

checkReviewDates();
checkLegalConstantsReminder();

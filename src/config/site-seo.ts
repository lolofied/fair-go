export const SITE_URL = "https://fair-go.ai";
export const SITE_NAME = "Fair Go";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg?v=2`;
export const OG_LOCALE = "en_AU";

export const OG_IMAGE_ALT =
    "Fair Go: a free 90-second unfair dismissal eligibility check under Australia's Fair Work Act.";

export interface FaqItem {
    question: string;
    answer: string;
}

/** Home page FAQ content, shared by the landing section and FAQ structured data. */
export function getLandingFaqItems(unfairDismissalDays: number): FaqItem[] {
    return [
        {
            question: "Is Fair Go legal advice?",
            answer: "No. Fair Go gives general information about unfair dismissal under the Fair Work Act. It does not replace advice from an employment lawyer about your specific situation.",
        },
        {
            question: "Is the eligibility check free?",
            answer: "Yes. The check takes about 90 seconds, costs nothing, and you do not need an account to get started.",
        },
        {
            question: "Who can see my answers?",
            answer: "Your record is encrypted on your own device. Fair Go cannot read it, sell it, or hand over what it cannot see. Use a personal email, not your work account.",
        },
        {
            question: "What is unfair dismissal?",
            answer: "Broadly, it is when you are dismissed from your job in a way that is harsh, unjust, or unreasonable, and you are covered by the unfair dismissal protections in the Fair Work Act. The free check helps you see whether you may be covered.",
        },
        {
            question: "How long do I have to lodge a claim?",
            answer: `For most unfair dismissal applications, you have ${unfairDismissalDays} days from the date your dismissal took effect to apply to the Fair Work Commission. Fair Go shows how much time you likely have left based on your answers.`,
        },
        {
            question: "Do I need a lawyer?",
            answer: "Not to use Fair Go. Many people start by checking their options and building a record themselves. For advice about your circumstances, or to lodge and run a claim, speak to an employment lawyer or contact the Fair Work Commission.",
        },
    ];
}

export const GUIDES_INDEX = "/guides";

export const GUIDE_ROUTES = {
    timeLimit: "/guides/unfair-dismissal-time-limit",
    eligibility: "/guides/unfair-dismissal-eligibility",
    lodgeClaim: "/guides/how-to-lodge-unfair-dismissal",
    compensation: "/guides/unfair-dismissal-compensation",
} as const;

export type GuideCategory = "Deadlines" | "Eligibility" | "Claims" | "Outcomes";

export const GUIDE_CATEGORIES = ["All", "Deadlines", "Eligibility", "Claims", "Outcomes"] as const;
export type GuideCategoryFilter = (typeof GUIDE_CATEGORIES)[number];

export interface GuideEntry {
    path: string;
    title: string;
    description: string;
    category: GuideCategory;
    /** Human-readable last updated date, e.g. "21 June 2026". */
    lastUpdated: string;
    /** Highlight on the guides index as the large featured card. */
    featured?: boolean;
    /** Optional second line in the featured title, rendered in wordmark serif italic. */
    featuredTitleAccent?: string;
}

/** Canonical list of published guides for the index, nav, and landing section. */
export const GUIDE_ENTRIES: GuideEntry[] = [
    {
        path: GUIDE_ROUTES.timeLimit,
        title: "Unfair dismissal time limit",
        description: "How long you have to lodge with the Fair Work Commission and when the clock starts.",
        category: "Deadlines",
        lastUpdated: "21 June 2026",
        featured: true,
        featuredTitleAccent: "time limit",
    },
    {
        path: GUIDE_ROUTES.eligibility,
        title: "Unfair dismissal eligibility",
        description: "Who may be covered under the Fair Work Act, including minimum employment periods.",
        category: "Eligibility",
        lastUpdated: "21 June 2026",
    },
    {
        path: GUIDE_ROUTES.lodgeClaim,
        title: "How to lodge an unfair dismissal claim",
        description: "Step-by-step overview of applying to the Fair Work Commission, what to prepare, and what happens next.",
        category: "Claims",
        lastUpdated: "21 June 2026",
    },
    {
        path: GUIDE_ROUTES.compensation,
        title: "Unfair dismissal compensation",
        description: "Reinstatement, compensation caps, and typical outcomes if your unfair dismissal claim succeeds.",
        category: "Outcomes",
        lastUpdated: "21 June 2026",
    },
];

export const FEATURED_GUIDE = GUIDE_ENTRIES.find((guide) => guide.featured) ?? GUIDE_ENTRIES[0];

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

export const BLOG_INDEX = "/blog";
export const PRODUCT_GUIDES_INDEX = "/guides";

/** @deprecated Use BLOG_INDEX. Kept for legacy redirects. */
export const RESOURCES_INDEX = "/resources";

export const EMPLOYMENT_RESOURCE_ROUTES = {
    timeLimit: "/blog/unfair-dismissal-time-limit",
    eligibility: "/blog/unfair-dismissal-eligibility",
    lodgeClaim: "/blog/how-to-lodge-unfair-dismissal",
    compensation: "/blog/unfair-dismissal-compensation",
} as const;

export const HELP_RESOURCE_ROUTES = {
    runCheck: "/guides/run-the-eligibility-check",
    afterCheck: "/guides/after-your-eligibility-check",
    retrieveCase: "/guides/retrieve-a-saved-case",
    caseProfile: "/guides/build-your-case-profile",
    eventsEvidence: "/guides/add-events-and-evidence",
    exportCase: "/guides/export-your-case-for-a-lawyer",
    encryptedSync: "/guides/how-encrypted-sync-works",
} as const;

export type ResourceSection = "employment" | "help";

export type EmploymentResourceCategory = "Deadlines" | "Eligibility" | "Claims" | "Outcomes";

export type HelpResourceCategory = "Getting started" | "Case file" | "Sync";

export const HELP_RESOURCE_CATEGORIES: HelpResourceCategory[] = ["Getting started", "Case file", "Sync"];

export interface ResourceEntry {
    path: string;
    title: string;
    description: string;
    section: ResourceSection;
    category: EmploymentResourceCategory | HelpResourceCategory;
    /** Public path to preview/hero image, e.g. /images/guides/run-the-eligibility-check.png */
    image: string;
    /** Human-readable last updated date, e.g. "21 June 2026". */
    lastUpdated: string;
    /** Highlight on the resources index as the large featured card. */
    featured?: boolean;
}

export const EMPLOYMENT_RESOURCE_ENTRIES: ResourceEntry[] = [
    {
        path: EMPLOYMENT_RESOURCE_ROUTES.timeLimit,
        title: "Unfair dismissal time limit",
        description: "How long you have to lodge with the Fair Work Commission and when the clock starts.",
        section: "employment",
        category: "Deadlines",
        image: "/images/blog/unfair-dismissal-time-limit.png",
        lastUpdated: "21 June 2026",
        featured: true,
    },
    {
        path: EMPLOYMENT_RESOURCE_ROUTES.eligibility,
        title: "Unfair dismissal eligibility",
        description: "Who may be covered under the Fair Work Act, including minimum employment periods.",
        section: "employment",
        category: "Eligibility",
        image: "/images/blog/unfair-dismissal-eligibility.png",
        lastUpdated: "21 June 2026",
    },
    {
        path: EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim,
        title: "How to lodge an unfair dismissal claim",
        description: "Step-by-step overview of applying to the Fair Work Commission, what to prepare, and what happens next.",
        section: "employment",
        category: "Claims",
        image: "/images/blog/how-to-lodge-unfair-dismissal.png",
        lastUpdated: "21 June 2026",
    },
    {
        path: EMPLOYMENT_RESOURCE_ROUTES.compensation,
        title: "Unfair dismissal compensation",
        description: "Reinstatement, compensation caps, and typical outcomes if your unfair dismissal claim succeeds.",
        section: "employment",
        category: "Outcomes",
        image: "/images/blog/unfair-dismissal-compensation.png",
        lastUpdated: "21 June 2026",
    },
];

/** Product how-to articles for Fair Go itself. */
export const HELP_RESOURCE_ENTRIES: ResourceEntry[] = [
    {
        path: HELP_RESOURCE_ROUTES.runCheck,
        title: "Run the free eligibility check",
        description: "What the 90-second check covers, how to answer the questions, and what you get at the end.",
        section: "help",
        category: "Getting started",
        image: "/images/guides/run-the-eligibility-check.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.afterCheck,
        title: "After your eligibility check",
        description: "How to read your result, what to do next, and when to start building a case file.",
        section: "help",
        category: "Getting started",
        image: "/images/guides/after-your-eligibility-check.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.retrieveCase,
        title: "Retrieve a saved case",
        description: "Open an existing case on a new device using your recovery details.",
        section: "help",
        category: "Getting started",
        image: "/images/guides/retrieve-a-saved-case.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.caseProfile,
        title: "Build your case profile",
        description: "Record employment details, key dates, and what you want to achieve from your claim.",
        section: "help",
        category: "Case file",
        image: "/images/guides/build-your-case-profile.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.eventsEvidence,
        title: "Add events and evidence",
        description: "Log what happened on a timeline and attach documents linked to each event.",
        section: "help",
        category: "Case file",
        image: "/images/guides/add-events-and-evidence.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.exportCase,
        title: "Export your case for a lawyer",
        description: "Review findings, then save a PDF package a lawyer can act on quickly.",
        section: "help",
        category: "Case file",
        image: "/images/guides/export-your-case-for-a-lawyer.png",
        lastUpdated: "22 June 2026",
    },
    {
        path: HELP_RESOURCE_ROUTES.encryptedSync,
        title: "How encrypted sync works",
        description: "Optional sync across devices with encryption that Fair Go cannot read.",
        section: "help",
        category: "Sync",
        image: "/images/guides/how-encrypted-sync-works.png",
        lastUpdated: "22 June 2026",
    },
];

export const RESOURCE_ENTRIES: ResourceEntry[] = [...EMPLOYMENT_RESOURCE_ENTRIES, ...HELP_RESOURCE_ENTRIES];

export const FEATURED_EMPLOYMENT_RESOURCE =
    EMPLOYMENT_RESOURCE_ENTRIES.find((resource) => resource.featured) ?? EMPLOYMENT_RESOURCE_ENTRIES[0];

export function resourceSectionIndex(section: ResourceSection): string {
    return section === "employment" ? BLOG_INDEX : PRODUCT_GUIDES_INDEX;
}

export const RESOURCE_SECTION_LABELS: Record<ResourceSection, string> = {
    employment: "Blog",
    help: "Guides",
};

/** Permanent redirects from legacy URLs. */
export const LEGACY_GUIDE_REDIRECTS: Record<string, string> = {
    "/guides/unfair-dismissal-time-limit": EMPLOYMENT_RESOURCE_ROUTES.timeLimit,
    "/guides/unfair-dismissal-eligibility": EMPLOYMENT_RESOURCE_ROUTES.eligibility,
    "/guides/how-to-lodge-unfair-dismissal": EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim,
    "/guides/unfair-dismissal-compensation": EMPLOYMENT_RESOURCE_ROUTES.compensation,
    "/resources": BLOG_INDEX,
    "/resources/employment/unfair-dismissal-time-limit": EMPLOYMENT_RESOURCE_ROUTES.timeLimit,
    "/resources/employment/unfair-dismissal-eligibility": EMPLOYMENT_RESOURCE_ROUTES.eligibility,
    "/resources/employment/how-to-lodge-unfair-dismissal": EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim,
    "/resources/employment/unfair-dismissal-compensation": EMPLOYMENT_RESOURCE_ROUTES.compensation,
};

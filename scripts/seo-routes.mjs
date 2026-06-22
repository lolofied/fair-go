/** Shared public route metadata for prerender and sitemap generation. */

export const SITE_URL = "https://fair-go.ai";

export const PUBLIC_ROUTES = [
    {
        path: "/",
        priority: "1.0",
        changefreq: "weekly",
        prerender: {
            url: "/?prerender=1",
            out: "index.html",
            titleIncludes: "Fair Go | Free unfair dismissal eligibility check",
        },
    },
    {
        path: "/blog",
        priority: "0.85",
        changefreq: "monthly",
        prerender: {
            url: "/blog",
            out: "blog/index.html",
            titleIncludes: "Blog | Fair Go",
        },
    },
    {
        path: "/guides",
        priority: "0.75",
        changefreq: "monthly",
        prerender: {
            url: "/guides",
            out: "guides/index.html",
            titleIncludes: "Product Guides | Fair Go",
        },
    },
    {
        path: "/guides/run-the-eligibility-check",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/run-the-eligibility-check",
            out: "guides/run-the-eligibility-check/index.html",
            titleIncludes: "Run the Free Eligibility Check",
        },
    },
    {
        path: "/guides/after-your-eligibility-check",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/after-your-eligibility-check",
            out: "guides/after-your-eligibility-check/index.html",
            titleIncludes: "After Your Eligibility Check",
        },
    },
    {
        path: "/guides/retrieve-a-saved-case",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/retrieve-a-saved-case",
            out: "guides/retrieve-a-saved-case/index.html",
            titleIncludes: "Retrieve a Saved Case",
        },
    },
    {
        path: "/guides/build-your-case-profile",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/build-your-case-profile",
            out: "guides/build-your-case-profile/index.html",
            titleIncludes: "Build Your Case Profile",
        },
    },
    {
        path: "/guides/add-events-and-evidence",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/add-events-and-evidence",
            out: "guides/add-events-and-evidence/index.html",
            titleIncludes: "Add Events and Evidence",
        },
    },
    {
        path: "/guides/export-your-case-for-a-lawyer",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/export-your-case-for-a-lawyer",
            out: "guides/export-your-case-for-a-lawyer/index.html",
            titleIncludes: "Export Your Case for a Lawyer",
        },
    },
    {
        path: "/guides/how-encrypted-sync-works",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/guides/how-encrypted-sync-works",
            out: "guides/how-encrypted-sync-works/index.html",
            titleIncludes: "How Encrypted Sync Works",
        },
    },
    {
        path: "/blog/unfair-dismissal-time-limit",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/blog/unfair-dismissal-time-limit",
            out: "blog/unfair-dismissal-time-limit/index.html",
            titleIncludes: "Unfair Dismissal Time Limit",
        },
    },
    {
        path: "/blog/unfair-dismissal-eligibility",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/blog/unfair-dismissal-eligibility",
            out: "blog/unfair-dismissal-eligibility/index.html",
            titleIncludes: "Unfair Dismissal Eligibility",
        },
    },
    {
        path: "/blog/how-to-lodge-unfair-dismissal",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/blog/how-to-lodge-unfair-dismissal",
            out: "blog/how-to-lodge-unfair-dismissal/index.html",
            titleIncludes: "How to Lodge an Unfair Dismissal Claim",
        },
    },
    {
        path: "/blog/unfair-dismissal-compensation",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/blog/unfair-dismissal-compensation",
            out: "blog/unfair-dismissal-compensation/index.html",
            titleIncludes: "Unfair Dismissal Compensation",
        },
    },
    {
        path: "/about",
        priority: "0.7",
        changefreq: "monthly",
        prerender: {
            url: "/about",
            out: "about/index.html",
            titleIncludes: "About Fair Go | Why I built it",
        },
    },
    {
        path: "/support",
        priority: "0.6",
        changefreq: "monthly",
        prerender: {
            url: "/support",
            out: "support/index.html",
            titleIncludes: "Support | Fair Go",
        },
    },
    {
        path: "/privacy",
        priority: "0.4",
        changefreq: "yearly",
        prerender: {
            url: "/privacy",
            out: "privacy/index.html",
            titleIncludes: "Privacy Policy | Fair Go",
        },
    },
    {
        path: "/terms",
        priority: "0.4",
        changefreq: "yearly",
        prerender: {
            url: "/terms",
            out: "terms/index.html",
            titleIncludes: "Terms of Use | Fair Go",
        },
    },
];

/** Routes with prerender config. Sub-pages must run before `/` (see prerender.mjs). */
export const PRERENDER_ROUTES = [
    ...PUBLIC_ROUTES.filter((route) => route.path !== "/" && route.prerender).map((route) => route.prerender),
    PUBLIC_ROUTES.find((route) => route.path === "/")?.prerender,
].filter(Boolean);

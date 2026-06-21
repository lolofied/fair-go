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
        path: "/guides",
        priority: "0.85",
        changefreq: "monthly",
        prerender: {
            url: "/guides",
            out: "guides/index.html",
            titleIncludes: "Guides | Unfair Dismissal Resources",
        },
    },
    {
        path: "/guides/unfair-dismissal-time-limit",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/guides/unfair-dismissal-time-limit",
            out: "guides/unfair-dismissal-time-limit/index.html",
            titleIncludes: "Unfair Dismissal Time Limit",
        },
    },
    {
        path: "/guides/unfair-dismissal-eligibility",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/guides/unfair-dismissal-eligibility",
            out: "guides/unfair-dismissal-eligibility/index.html",
            titleIncludes: "Unfair Dismissal Eligibility",
        },
    },
    {
        path: "/guides/how-to-lodge-unfair-dismissal",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/guides/how-to-lodge-unfair-dismissal",
            out: "guides/how-to-lodge-unfair-dismissal/index.html",
            titleIncludes: "How to Lodge an Unfair Dismissal Claim",
        },
    },
    {
        path: "/guides/unfair-dismissal-compensation",
        priority: "0.9",
        changefreq: "monthly",
        prerender: {
            url: "/guides/unfair-dismissal-compensation",
            out: "guides/unfair-dismissal-compensation/index.html",
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

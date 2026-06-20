import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MemoryRouter } from "react-router";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

/**
 * Public marketing routes baked into static HTML at build time for crawlers.
 *
 * Sub-pages must be written before `/` because home overwrites dist/index.html.
 */
const ROUTES = [
    {
        url: "/about",
        out: "about/index.html",
        titleIncludes: "About Fair Go | Why I built it",
        module: "/src/pages/about.tsx",
        exportName: "AboutPage",
    },
    {
        url: "/support",
        out: "support/index.html",
        titleIncludes: "Support | Fair Go",
        module: "/src/pages/support.tsx",
        exportName: "SupportPage",
    },
    {
        url: "/privacy",
        out: "privacy/index.html",
        titleIncludes: "Privacy Policy | Fair Go",
        module: "/src/pages/legal/privacy-policy.tsx",
        exportName: "PrivacyPolicy",
    },
    {
        url: "/terms",
        out: "terms/index.html",
        titleIncludes: "Terms of Use | Fair Go",
        module: "/src/pages/legal/terms-of-service.tsx",
        exportName: "TermsOfService",
    },
    {
        url: "/?prerender=1",
        out: "index.html",
        titleIncludes: "Fair Go | Free unfair dismissal eligibility check",
        module: "/src/routing/home-route.tsx",
        exportName: "HomeRoute",
    },
];

function splitHeadTags(markup) {
    const tags = [];
    const body = markup.replace(/<(title|meta|link)\b[^>]*(?:>.*?<\/title>|\/?>)/gis, (tag) => {
        tags.push(tag);
        return "";
    });

    return { head: tags.join("\n"), body };
}

function documentHtml(template, markup) {
    const { head, body } = splitHeadTags(markup);
    return template.replace("</head>", `${head}\n    </head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

async function prerenderRoute(vite, template, providers, route) {
    const module = await vite.ssrLoadModule(route.module);
    const Component = module[route.exportName];
    if (!Component) {
        throw new Error(`Could not find ${route.exportName} in ${route.module}`);
    }

    const { RouteProvider, ThemeProvider } = providers;
    const markup = renderToString(
        React.createElement(
            ThemeProvider,
            null,
            React.createElement(
                MemoryRouter,
                { initialEntries: [route.url] },
                React.createElement(RouteProvider, null, React.createElement(Component)),
            ),
        ),
    );
    const html = documentHtml(template, markup);

    if (!html.includes(route.titleIncludes)) {
        throw new Error(`Prerender for ${route.url} did not include expected title: ${route.titleIncludes}`);
    }

    const titleCount = (html.match(/<title>/g) ?? []).length;
    if (titleCount !== 1) {
        throw new Error(`Prerender for ${route.url} produced ${titleCount} <title> tags (expected 1)`);
    }

    const outPath = join(DIST, route.out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf8");
    console.log(`  ✓ ${route.url} → dist/${route.out}`);
}

async function main() {
    const template = readFileSync(join(DIST, "index.html"), "utf8");
    const vite = await createServer({
        configFile: join(ROOT, "vite.config.ts"),
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "error",
    });

    try {
        const [{ RouteProvider }, { ThemeProvider }] = await Promise.all([
            vite.ssrLoadModule("/src/providers/router-provider.tsx"),
            vite.ssrLoadModule("/src/providers/theme-provider.tsx"),
        ]);
        const providers = { RouteProvider, ThemeProvider };

        console.log("Prerendering public routes…");

        for (const route of ROUTES) {
            await prerenderRoute(vite, template, providers, route);
        }

        console.log("Prerender complete.");
    } finally {
        await vite.close();
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});

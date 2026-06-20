import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PREVIEW_PORT = 4173;
const PREVIEW_ORIGIN = `http://localhost:${PREVIEW_PORT}`;

const CHROME =
    process.env.CHROME_PATH ??
    (process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : "google-chrome");

/**
 * Public marketing routes baked into static HTML at build time for crawlers.
 *
 * Sub-pages must be prerendered before `/`: vite preview serves `dist/index.html`
 * as the SPA shell for routes that do not yet have their own HTML file (e.g.
 * about/index.html). If home is baked first, that shell carries home title/meta and
 * client routing appends page-specific tags on top (duplicate SEO head).
 */
const ROUTES = [
    {
        url: "/about",
        out: "about/index.html",
        titleIncludes: "About Fair Go | Why I built it",
    },
    {
        url: "/support",
        out: "support/index.html",
        titleIncludes: "Support | Fair Go",
    },
    {
        url: "/privacy",
        out: "privacy/index.html",
        titleIncludes: "Privacy Policy | Fair Go",
    },
    {
        url: "/terms",
        out: "terms/index.html",
        titleIncludes: "Terms of Use | Fair Go",
    },
    {
        url: "/?prerender=1",
        out: "index.html",
        titleIncludes: "Fair Go | Free unfair dismissal eligibility check",
    },
];

function shouldSkipPrerender() {
    return process.env.SKIP_PRERENDER === "1" || process.env.CI === "true" || process.env.CI === "1";
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPreview() {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            const response = await fetch(`${PREVIEW_ORIGIN}/`);
            if (response.ok) return;
        } catch {
            /* server still starting */
        }
        await wait(250);
    }

    throw new Error(`Timed out waiting for preview server at ${PREVIEW_ORIGIN}`);
}

function dumpDom(url) {
    return new Promise((resolve, reject) => {
        const child = spawn(
            CHROME,
            [
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--virtual-time-budget=12000",
                "--run-all-compositor-stages-before-draw",
                "--dump-dom",
                url,
            ],
            { stdio: ["ignore", "pipe", "pipe"] },
        );

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk) => {
            stdout += chunk;
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk;
        });

        child.on("error", reject);
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Chrome exited with code ${code}\n${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
}

function isMissingBrowserError(error) {
    return error instanceof Error && (error.message.includes("ENOENT") || ("code" in error && error.code === "ENOENT"));
}

async function prerenderRoute(route) {
    const url = `${PREVIEW_ORIGIN}${route.url}`;
    const html = await dumpDom(url);

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
    if (shouldSkipPrerender()) {
        console.warn("Skipping prerender in CI (headless Chrome is unavailable in this environment).");
        return;
    }

    console.log("Starting preview server…");
    const preview = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
        cwd: ROOT,
        stdio: "ignore",
        env: process.env,
    });

    const cleanup = () => {
        if (!preview.killed) preview.kill("SIGTERM");
    };
    process.on("exit", cleanup);
    process.on("SIGINT", () => {
        cleanup();
        process.exit(1);
    });
    process.on("SIGTERM", () => {
        cleanup();
        process.exit(1);
    });

    try {
        await waitForPreview();
        console.log("Prerendering public routes…");

        for (const route of ROUTES) {
            await prerenderRoute(route);
        }

        console.log("Prerender complete.");
    } catch (error) {
        if (isMissingBrowserError(error)) {
            console.warn("Skipping prerender: no headless browser available in this environment.");
            return;
        }

        throw error;
    } finally {
        cleanup();
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});

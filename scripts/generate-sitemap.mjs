import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_ROUTES, SITE_URL } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const lastmod = new Date().toISOString().slice(0, 10);

function routeUrl(path) {
    return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map(
    (route) => `    <url>
        <loc>${routeUrl(route.path)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`,
).join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "public/sitemap.xml"), xml, "utf8");

const distPath = join(ROOT, "dist/sitemap.xml");
if (existsSync(join(ROOT, "dist"))) {
    writeFileSync(distPath, xml, "utf8");
}

console.log(`Sitemap generated for ${PUBLIC_ROUTES.length} routes (lastmod ${lastmod}).`);

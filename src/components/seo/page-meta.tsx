/**
 * Per-page document metadata, rendered via React 19's native head hoisting.
 * Render <PageMeta /> anywhere inside a page; React moves these tags into <head>.
 */

const SITE_URL = "https://fair-go.ai";
const SITE_NAME = "Fair Go";
const OG_IMAGE = `${SITE_URL}/og-image.jpg?v=2`;
const OG_IMAGE_ALT = "Fair Go — a free 90-second unfair dismissal eligibility check under Australia's Fair Work Act.";

interface PageMetaProps {
    /** Full document title, e.g. "About Fair Go". */
    title: string;
    /** Meta description (~150–160 chars). */
    description: string;
    /** Route path for canonical + og:url, e.g. "/about". Omit for the home page. */
    path?: string;
    /** Keep this page out of search results (e.g. the private case app). */
    noindex?: boolean;
}

export const PageMeta = ({ title, description, path, noindex }: PageMetaProps) => {
    const url = path ? `${SITE_URL}${path}` : `${SITE_URL}/`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {noindex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={url} />}

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={OG_IMAGE} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={OG_IMAGE_ALT} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={OG_IMAGE} />
            <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
        </>
    );
};

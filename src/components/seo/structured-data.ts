import type { FaqItem } from "@/config/site-seo";
import { ARTICLE_AUTHOR, OG_IMAGE, SITE_NAME, SITE_URL } from "@/config/site-seo";
import { SUPPORT_EMAIL } from "@/config/support-contact";

type JsonLdObject = Record<string, unknown>;

function absoluteUrl(path: string) {
    return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export function buildItemListSchema(items: { name: string; path: string }[]): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${item.path}`,
        })),
    };
}

export function buildOrganizationSchema(): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/fair-go-logo.png`,
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: SUPPORT_EMAIL,
            url: absoluteUrl("/support"),
            availableLanguage: ["English"],
        },
    };
}

export function buildWebSiteSchema(): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "en-AU",
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}

export function buildWebApplicationSchema(): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web browser",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "AUD",
        },
        description:
            "Free unfair dismissal eligibility check for Australian employees under the Fair Work Act, with deadline tracking and private case documentation.",
        inLanguage: "en-AU",
        image: OG_IMAGE,
        author: {
            "@type": "Person",
            name: ARTICLE_AUTHOR.name,
            jobTitle: ARTICLE_AUTHOR.role,
            url: ARTICLE_AUTHOR.url,
        },
    };
}

export function buildFaqPageSchema(faqItems: FaqItem[]): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {
                "@type": "Answer",
                text: answer,
            },
        })),
    };
}

export function buildArticleSchema({
    title,
    description,
    path,
    datePublished,
    dateModified,
}: {
    title: string;
    description: string;
    path: string;
    datePublished: string;
    dateModified: string;
}): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: absoluteUrl(path),
        datePublished,
        dateModified,
        inLanguage: "en-AU",
        author: {
            "@type": "Person",
            name: ARTICLE_AUTHOR.name,
            jobTitle: ARTICLE_AUTHOR.role,
            url: ARTICLE_AUTHOR.url,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/fair-go-logo.png`,
            },
        },
        mainEntityOfPage: absoluteUrl(path),
    };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    };
}

export function buildHomeStructuredData(faqItems: FaqItem[]): JsonLdObject[] {
    return [
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebApplicationSchema(),
        buildFaqPageSchema(faqItems),
    ];
}

export function buildGuideStructuredData({
    title,
    description,
    path,
    datePublished,
    dateModified,
    faqItems,
    breadcrumbs,
}: {
    title: string;
    description: string;
    path: string;
    datePublished: string;
    dateModified: string;
    faqItems?: FaqItem[];
    breadcrumbs: { name: string; path: string }[];
}): JsonLdObject[] {
    const data: JsonLdObject[] = [
        buildArticleSchema({ title, description, path, datePublished, dateModified }),
        buildBreadcrumbSchema(breadcrumbs),
    ];

    if (faqItems?.length) {
        data.push(buildFaqPageSchema(faqItems));
    }

    return data;
}

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { JsonLd } from "@/components/seo/json-ld";
import { PageMeta } from "@/components/seo/page-meta";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/components/seo/structured-data";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { Shell, ShellMain } from "@/components/layout/shell";
import {
    HELP_RESOURCE_CATEGORIES,
    HELP_RESOURCE_ENTRIES,
    PRODUCT_GUIDES_INDEX,
    type HelpResourceCategory,
    type ResourceEntry,
} from "@/config/site-seo";
import { GuidesSearch } from "@/pages/guides/guides-search";
import { GuideListItem } from "@/pages/guides/guide-preview-visual";

function matchesQuery(resource: ResourceEntry, query: string): boolean {
    const haystack = `${resource.title} ${resource.description} ${resource.category}`.toLowerCase();

    return haystack.includes(query);
}

export const GuidesIndexPage = () => {
    const [query, setQuery] = useState("");
    const normalizedQuery = query.trim().toLowerCase();

    const filteredGuides = useMemo(() => {
        if (!normalizedQuery) {
            return HELP_RESOURCE_ENTRIES;
        }

        return HELP_RESOURCE_ENTRIES.filter((resource) => matchesQuery(resource, normalizedQuery));
    }, [normalizedQuery]);

    const sections = useMemo(
        () =>
            HELP_RESOURCE_CATEGORIES.map((category) => ({
                category,
                guides: filteredGuides.filter((resource) => resource.category === category),
            })).filter((section) => section.guides.length > 0),
        [filteredGuides],
    );

    return (
        <Shell>
            <PageMeta
                title="Product Guides | Fair Go"
                description="Step-by-step product guides for using Fair Go."
                path={PRODUCT_GUIDES_INDEX}
            />
            <JsonLd
                data={[
                    buildBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Product Guides", path: PRODUCT_GUIDES_INDEX },
                    ]),
                    buildItemListSchema(
                        HELP_RESOURCE_ENTRIES.map((resource) => ({
                            name: resource.title,
                            path: resource.path,
                        })),
                    ),
                ]}
            />
            <LandingHeader brandAsLink />

            <ShellMain align="start" className="pb-16 sm:pb-24">
                <div className="fg-guides-index">
                    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
                        <h1 className="shrink-0 text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
                            Product Guides
                        </h1>
                        <p className="text-lg font-medium text-tertiary md:max-w-md md:text-right lg:max-w-lg">
                            Step-by-step product guides
                        </p>
                    </header>

                    <div className="mt-8 sm:mt-10">
                        <GuidesSearch value={query} onChange={setQuery} />
                    </div>

                    {sections.length > 0 ? (
                        <div className="mt-10 flex flex-col gap-14 sm:mt-12 sm:gap-16">
                            {sections.map(({ category, guides }) => (
                                <GuideSection key={category} category={category} guides={guides} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-10 rounded-2xl border border-secondary bg-secondary_subtle px-5 py-4 text-md text-tertiary">
                            No product guides match your search. Try different keywords or{" "}
                            <Link to="/support" className="font-medium text-brand-secondary underline">
                                contact support
                            </Link>
                            .
                        </p>
                    )}
                </div>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

function GuideSection({ category, guides }: { category: HelpResourceCategory; guides: ResourceEntry[] }) {
    return (
        <section>
            <h2 className="text-lg font-semibold text-primary">{category}</h2>
            <ul className="mt-2">
                {guides.map((resource) => (
                    <GuideListItem key={resource.path} resource={resource} />
                ))}
            </ul>
        </section>
    );
}

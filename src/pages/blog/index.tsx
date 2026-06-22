import { JsonLd } from "@/components/seo/json-ld";
import { PageMeta } from "@/components/seo/page-meta";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/components/seo/structured-data";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { Shell, ShellMain } from "@/components/layout/shell";
import {
    BLOG_INDEX,
    EMPLOYMENT_RESOURCE_ENTRIES,
    FEATURED_EMPLOYMENT_RESOURCE,
} from "@/config/site-seo";
import { FeaturedResourceCard, ResourceListItem } from "@/pages/resources/resource-list";

export const BlogIndexPage = () => {
    const listResources = EMPLOYMENT_RESOURCE_ENTRIES.filter(
        (resource) => resource.path !== FEATURED_EMPLOYMENT_RESOURCE.path,
    );

    return (
        <Shell>
            <PageMeta
                title="Blog | Fair Go"
                description="Plain-English guides on unfair dismissal in Australia: eligibility, the 21-day deadline, and what to do next. General information only, not legal advice."
                path={BLOG_INDEX}
            />
            <JsonLd
                data={[
                    buildBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Blog", path: BLOG_INDEX },
                    ]),
                    buildItemListSchema(
                        EMPLOYMENT_RESOURCE_ENTRIES.map((resource) => ({
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
                            Blog
                        </h1>
                        <p className="text-lg font-medium text-tertiary md:max-w-md md:text-right lg:max-w-lg">
                            The latest guides and articles from Fair Go
                        </p>
                    </header>

                    <div className="mt-8 sm:mt-10">
                        <FeaturedResourceCard resource={FEATURED_EMPLOYMENT_RESOURCE} />
                    </div>

                    <div className="mt-14 border-t border-secondary pt-14 sm:mt-16 sm:pt-16">
                        <h2 className="text-lg font-semibold text-primary">More articles</h2>
                        <ul className="mt-2">
                            {listResources.map((resource) => (
                                <ResourceListItem key={resource.path} resource={resource} />
                            ))}
                        </ul>
                    </div>
                </div>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

import { Link } from "react-router";
import { JsonLd } from "@/components/seo/json-ld";
import { PageMeta } from "@/components/seo/page-meta";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/components/seo/structured-data";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { Shell, ShellMain } from "@/components/layout/shell";
import { FEATURED_GUIDE, GUIDE_ENTRIES, GUIDES_INDEX, type GuideEntry } from "@/config/site-seo";
import { cx } from "@/utils/cx";

const THUMB_CLASS: Record<GuideEntry["category"], string> = {
    Deadlines: "fg-guides-thumb-deadlines",
    Eligibility: "fg-guides-thumb-eligibility",
    Claims: "fg-guides-thumb-claims",
    Outcomes: "fg-guides-thumb-outcomes",
};

function FeaturedGuideCard({ guide }: { guide: GuideEntry }) {
    return (
        <Link to={guide.path} className="group block">
            <div
                aria-hidden="true"
                className={cx(
                    "aspect-[16/9] w-full overflow-hidden rounded-[1.75rem]",
                    THUMB_CLASS[guide.category],
                )}
            />
            <div className="py-8 text-left sm:py-10">
                <h2 className="max-w-2xl text-display-sm font-semibold tracking-tight text-primary transition duration-100 ease-linear group-hover:text-brand-secondary sm:text-display-md">
                    {guide.title}
                </h2>
                <p className="mt-4 max-w-2xl text-md text-tertiary">{guide.description}</p>
            </div>
        </Link>
    );
}

function GuideListItem({ guide }: { guide: GuideEntry }) {
    return (
        <li className="border-b border-secondary last:border-b-0">
            <Link to={guide.path} className="group flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8">
                <div
                    aria-hidden="true"
                    className={cx(
                        "aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl sm:w-56 lg:w-64",
                        THUMB_CLASS[guide.category],
                    )}
                />
                <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight text-primary transition duration-100 ease-linear group-hover:text-brand-secondary sm:text-display-xs">
                        {guide.title}
                    </h3>
                    <p className="mt-3 text-md text-tertiary">{guide.description}</p>
                    <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-tertiary">
                        {guide.lastUpdated}
                    </span>
                </div>
            </Link>
        </li>
    );
}

export const GuidesIndexPage = () => {
    const listGuides = GUIDE_ENTRIES.filter((guide) => guide.path !== FEATURED_GUIDE.path);

    return (
        <Shell>
            <PageMeta
                title="Guides | Unfair Dismissal Resources | Fair Go"
                description="Plain-English guides on unfair dismissal in Australia: eligibility, the 21-day deadline, and what to do next. General information only, not legal advice."
                path={GUIDES_INDEX}
            />
            <JsonLd
                data={[
                    buildBreadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "Guides", path: GUIDES_INDEX },
                    ]),
                    buildItemListSchema(
                        GUIDE_ENTRIES.map((guide) => ({
                            name: guide.title,
                            path: guide.path,
                        })),
                    ),
                ]}
            />
            <LandingHeader brandAsLink />

            <ShellMain align="start" className="pb-16 sm:pb-24">
                <div className="fg-guides-index">
                    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
                        <h1 className="shrink-0 text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
                            Guides
                        </h1>
                        <p className="text-lg font-medium text-tertiary md:max-w-md md:text-right lg:max-w-lg">
                            The latest guides and articles from Fair Go
                        </p>
                    </header>

                    <div className="mt-10 sm:mt-12">
                        <FeaturedGuideCard guide={FEATURED_GUIDE} />
                    </div>

                    <section className="mt-14 border-t border-secondary pt-14 sm:mt-16 sm:pt-16">
                        <h2 className="text-lg font-semibold text-primary">Recent guides</h2>

                        <ul className="mt-2">
                            {listGuides.map((guide) => (
                                <GuideListItem key={guide.path} guide={guide} />
                            ))}
                        </ul>
                    </section>
                </div>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

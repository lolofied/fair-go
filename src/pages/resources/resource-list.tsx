import { Link } from "react-router";
import type { EmploymentResourceCategory, HelpResourceCategory, ResourceEntry } from "@/config/site-seo";
import { cx } from "@/utils/cx";

const EMPLOYMENT_THUMB_CLASS: Record<EmploymentResourceCategory, string> = {
    Deadlines: "fg-guides-thumb-deadlines",
    Eligibility: "fg-guides-thumb-eligibility",
    Claims: "fg-guides-thumb-claims",
    Outcomes: "fg-guides-thumb-outcomes",
};

const HELP_THUMB_CLASS: Record<HelpResourceCategory, string> = {
    "Getting started": "fg-guides-thumb-getting-started",
    "Case file": "fg-guides-thumb-case-file",
    Sync: "fg-guides-thumb-sync",
};

export function getResourceThumbClass(resource: ResourceEntry): string {
    if (resource.section === "employment") {
        return EMPLOYMENT_THUMB_CLASS[resource.category as EmploymentResourceCategory];
    }

    return HELP_THUMB_CLASS[resource.category as HelpResourceCategory];
}

function ResourcePreview({ resource, className }: { resource: ResourceEntry; className?: string }) {
    if (resource.section === "help") {
        return (
            <img
                src={resource.image}
                alt=""
                loading="lazy"
                decoding="async"
                className={cx("object-cover object-top", className)}
            />
        );
    }

    return <div aria-hidden="true" className={cx(getResourceThumbClass(resource), className)} />;
}

export function FeaturedResourceCard({ resource }: { resource: ResourceEntry }) {
    return (
        <Link to={resource.path} className="group block">
            <ResourcePreview resource={resource} className="aspect-[16/9] w-full overflow-hidden rounded-[1.75rem]" />
            <div className="py-8 text-left sm:py-10">
                <h3 className="max-w-2xl text-display-sm font-semibold tracking-tight text-primary transition duration-100 ease-linear group-hover:text-brand-secondary sm:text-display-md">
                    {resource.title}
                </h3>
                <p className="mt-4 max-w-2xl text-md text-tertiary">{resource.description}</p>
            </div>
        </Link>
    );
}

export function ResourceListItem({ resource }: { resource: ResourceEntry }) {
    return (
        <li className="border-b border-secondary last:border-b-0">
            <Link to={resource.path} className="group flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8">
                <ResourcePreview
                    resource={resource}
                    className="aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl sm:w-56 lg:w-64"
                />
                <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight text-primary transition duration-100 ease-linear group-hover:text-brand-secondary sm:text-display-xs">
                        {resource.title}
                    </h3>
                    <p className="mt-3 text-md text-tertiary">{resource.description}</p>
                    <span className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-tertiary">
                        {resource.lastUpdated}
                    </span>
                </div>
            </Link>
        </li>
    );
}

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    type MouseEvent,
    type PropsWithChildren,
    type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { JsonLd } from "@/components/seo/json-ld";
import { PageMeta } from "@/components/seo/page-meta";
import { buildGuideStructuredData } from "@/components/seo/structured-data";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { Shell, ShellMain } from "@/components/layout/shell";
import {
    RESOURCE_ENTRIES,
    RESOURCE_SECTION_LABELS,
    PRODUCT_GUIDES_INDEX,
    resourceSectionIndex,
    type FaqItem,
    type ResourceSection,
} from "@/config/site-seo";
import { cx } from "@/utils/cx";
import { getResourceThumbClass } from "@/pages/resources/resource-list";

type TocEntry = {
    id: string;
    heading: string;
    level: 2 | 3;
};

type GuideTocContextValue = {
    entries: TocEntry[];
    register: (entry: TocEntry) => () => void;
};

const GuideTocContext = createContext<GuideTocContextValue | null>(null);

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function scrollToGuideSection(id: string) {
    const target = document.getElementById(id);
    if (!target) {
        return;
    }

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    target.scrollIntoView({ behavior, block: "start" });
    window.history.replaceState(null, "", `#${id}`);
}

function handleGuideTocClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    scrollToGuideSection(id);
}

function GuideTocProvider({ children }: PropsWithChildren) {
    const [entries, setEntries] = useState<TocEntry[]>([]);

    const register = useCallback((entry: TocEntry) => {
        setEntries((current) => {
            if (current.some((item) => item.id === entry.id)) {
                return current;
            }

            return [...current, entry];
        });

        return () => {
            setEntries((current) => current.filter((item) => item.id !== entry.id));
        };
    }, []);

    const value = useMemo(() => ({ entries, register }), [entries, register]);

    return <GuideTocContext.Provider value={value}>{children}</GuideTocContext.Provider>;
}

function useGuideToc() {
    const context = useContext(GuideTocContext);

    if (!context) {
        throw new Error("Guide TOC components must be used within GuideTocProvider");
    }

    return context;
}

function GuideTocNav() {
    const { entries } = useGuideToc();

    if (entries.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Article sections" className="fg-guide-toc hidden lg:block">
            <ul className="flex flex-col gap-3">
                {entries.map(({ id, heading, level }) => (
                    <li key={id} className={level === 3 ? "pl-4" : undefined}>
                        <a
                            href={`#${id}`}
                            onClick={(event) => handleGuideTocClick(event, id)}
                            className="text-sm text-tertiary transition duration-100 ease-linear hover:text-secondary"
                        >
                            {heading}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export const GuideSection = ({ heading, id, children }: PropsWithChildren<{ heading: string; id?: string }>) => {
    const sectionId = id ?? slugify(heading);
    const { register } = useGuideToc();

    useLayoutEffect(() => register({ id: sectionId, heading, level: 2 }), [sectionId, heading, register]);

    return (
        <section id={sectionId} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-primary sm:text-display-xs">{heading}</h2>
            <div className="mt-4 flex flex-col gap-4 text-md text-tertiary">{children}</div>
        </section>
    );
};

export const GuideParagraph = ({ children }: PropsWithChildren) => <p>{children}</p>;

export const GuideList = ({ children }: PropsWithChildren) => (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-quaternary">{children}</ul>
);

/** Inline screenshot for guide articles. */
export const GuideScreenshot = ({ src, alt }: { src: string; alt: string }) => (
    <figure className="overflow-hidden rounded-2xl border border-secondary bg-secondary">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover object-top" />
    </figure>
);

type GuideArticleCtaVariant = "check" | "guides" | "both";

const GUIDE_ARTICLE_CTA_DEFAULTS: Record<
    GuideArticleCtaVariant,
    { title: string; description: string; guideLabel: string }
> = {
    check: {
        title: "Check where you stand",
        description:
            "Fair Go's free check takes about 90 seconds and shows whether you may have an unfair dismissal claim and how long you likely have to act. Not legal advice.",
        guideLabel: "Browse product guides",
    },
    guides: {
        title: "Need help using Fair Go?",
        description:
            "Step-by-step guides show how to run the eligibility check, build your case file, and export a package for your lawyer.",
        guideLabel: "Browse product guides",
    },
    both: {
        title: "Take the next step",
        description:
            "Run the free check to see if you may have a claim, or follow our product guides to start documenting your case.",
        guideLabel: "Browse product guides",
    },
};

/** Inline call-to-action for blog articles: free check, product guides, or both. */
export const GuideArticleCta = ({
    variant = "check",
    title,
    description,
    guideHref = PRODUCT_GUIDES_INDEX,
    guideLabel,
}: {
    variant?: GuideArticleCtaVariant;
    title?: string;
    description?: string;
    guideHref?: string;
    guideLabel?: string;
}) => {
    const defaults = GUIDE_ARTICLE_CTA_DEFAULTS[variant];
    const showCheck = variant === "check" || variant === "both";
    const showGuides = variant === "guides" || variant === "both";

    return (
        <aside className="rounded-2xl border border-brand bg-brand-primary p-5 sm:p-6">
            <h3 className="text-md font-semibold text-primary sm:text-lg">{title ?? defaults.title}</h3>
            <p className="mt-2 text-sm text-tertiary sm:text-md">{description ?? defaults.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
                {showCheck ? (
                    <Button size="md" color="primary" href="/" iconTrailing={ArrowRight}>
                        Start free check
                    </Button>
                ) : null}
                {showGuides ? (
                    <Button size="md" color="secondary" href={guideHref}>
                        {guideLabel ?? defaults.guideLabel}
                    </Button>
                ) : null}
            </div>
        </aside>
    );
};

const GuideFaq = ({ items }: { items: FaqItem[] }) => (
    <section className="border-t border-secondary pt-10">
        <h2 className="text-xl font-semibold text-primary sm:text-display-xs">Common questions</h2>
        <dl className="mt-6 flex flex-col gap-6">
            {items.map(({ question, answer }) => (
                <div key={question}>
                    <dt className="text-md font-semibold text-primary">{question}</dt>
                    <dd className="mt-2 text-md text-tertiary">{answer}</dd>
                </div>
            ))}
        </dl>
    </section>
);

export const GuidePage = ({
    title,
    metaTitle,
    description,
    path,
    dateModified,
    breadcrumbLabel,
    faqItems,
    relatedResources,
    children,
}: PropsWithChildren<{
    title: string;
    metaTitle: string;
    description: string;
    path: string;
    dateModified: string;
    breadcrumbLabel: string;
    faqItems?: FaqItem[];
    relatedResources?: { label: string; path: string }[];
    children: ReactNode;
}>) => {
    const resourceEntry = RESOURCE_ENTRIES.find((resource) => resource.path === path);
    const section: ResourceSection = resourceEntry?.section ?? "employment";
    const sectionLabel = RESOURCE_SECTION_LABELS[section];
    const sectionIndex = resourceSectionIndex(section);
    const showHeroVisual = section !== "help";
    const heroThumbClass = resourceEntry ? getResourceThumbClass(resourceEntry) : "fg-guides-thumb-eligibility";

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (!hash) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            scrollToGuideSection(hash);
        });

        return () => window.cancelAnimationFrame(frame);
    }, [path]);

    return (
        <Shell>
            <PageMeta title={metaTitle} description={description} path={path} />
            <JsonLd
                data={buildGuideStructuredData({
                    title,
                    description,
                    path,
                    dateModified,
                    faqItems,
                    breadcrumbs: [
                        { name: "Home", path: "/" },
                        { name: sectionLabel, path: sectionIndex },
                        { name: breadcrumbLabel, path },
                    ],
                })}
            />
            <LandingHeader brandAsLink />

            <ShellMain align="start" className="pb-16 sm:pb-24">
                <GuideTocProvider>
                    <div className="fg-guide-article">
                        <header>
                            <Link
                                to={sectionIndex}
                                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-tertiary transition duration-100 ease-linear hover:bg-secondary_hover hover:text-secondary"
                            >
                                <ArrowLeft aria-hidden="true" className="size-4 stroke-[1.5]" data-icon />
                                Back to {sectionLabel}
                            </Link>

                            <h1 className="mt-6 max-w-4xl text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
                                {title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-secondary pb-8">
                                <div className="flex items-center gap-2.5">
                                    <FairGoWordmark className="scale-90 origin-left" />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm text-quaternary">Updated {dateModified}</span>
                                </div>
                            </div>
                        </header>

                        <div className="fg-guide-layout">
                            <GuideTocNav />

                            <div className="min-w-0">
                                <article>
                                    {showHeroVisual ? (
                                        <div
                                            aria-hidden="true"
                                            className={cx(
                                                "fg-guide-hero aspect-[16/9] w-full overflow-hidden rounded-[1.75rem]",
                                                heroThumbClass,
                                            )}
                                        />
                                    ) : null}
                                    <p className={cx("max-w-3xl text-lg text-tertiary", showHeroVisual ? "mt-8" : "mt-0")}>
                                        {description}
                                    </p>

                                    <div className="fg-guide-body mt-10 flex flex-col gap-10 sm:mt-12 sm:gap-12">
                                        {children}
                                    </div>
                                </article>

                                {faqItems?.length ? (
                                    <div className="mt-12 sm:mt-16">
                                        <GuideFaq items={faqItems} />
                                    </div>
                                ) : null}

                                {relatedResources?.length ? (
                                    <section className="mt-12 border-t border-secondary pt-10 sm:mt-16">
                                        <h2 className="text-md font-semibold text-primary">Related articles</h2>
                                        <ul className="mt-4 flex flex-col gap-2">
                                            {relatedResources.map(({ label, path: resourcePath }) => (
                                                <li key={resourcePath}>
                                                    <Link
                                                        to={resourcePath}
                                                        className="text-md font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
                                                    >
                                                        {label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ) : null}

                                {section === "employment" ? (
                                    <div className="mt-12 border-t border-secondary pt-10 sm:mt-16">
                                        <GuideArticleCta variant="both" />
                                    </div>
                                ) : null}

                                {section === "employment" ? (
                                    <p className="mt-10 text-sm text-quaternary">
                                        This article is general information only, not legal advice. For advice about your
                                        situation, speak to an employment lawyer or contact the{" "}
                                        <a
                                            className="font-medium text-brand-secondary underline"
                                            href="https://www.fwc.gov.au"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Fair Work Commission
                                        </a>
                                        .
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </GuideTocProvider>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

import type { PropsWithChildren, ReactNode } from "react";
import { LEGAL_CITATIONS } from "@/config/site-seo";

const linkClass = "font-medium text-brand-secondary underline transition duration-100 ease-linear hover:text-brand-secondary_hover";

export function LegalCitationLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
            {children}
        </a>
    );
}

export function FwcLink({ children }: { children: ReactNode }) {
    return <LegalCitationLink href={LEGAL_CITATIONS.fwc}>{children}</LegalCitationLink>;
}

export function FwoLink({ children }: { children: ReactNode }) {
    return <LegalCitationLink href={LEGAL_CITATIONS.fwoUnfairDismissal}>{children}</LegalCitationLink>;
}

export function FairWorkActLink({ section, children }: { section?: string; children: ReactNode }) {
    const href = section ? LEGAL_CITATIONS.fairWorkActSection(section) : LEGAL_CITATIONS.fairWorkAct;

    return <LegalCitationLink href={href}>{children}</LegalCitationLink>;
}

/** Primary sources cited in employment blog articles. */
export function GuideSources({ children }: PropsWithChildren) {
    return (
        <section className="scroll-mt-24 border-t border-secondary pt-10">
            <h2 className="text-xl font-semibold text-primary sm:text-display-xs">Sources</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-md text-tertiary marker:text-quaternary">
                {children}
            </ul>
        </section>
    );
}

export function GuideSourceItem({ href, children }: { href: string; children: ReactNode }) {
    return (
        <li>
            <LegalCitationLink href={href}>{children}</LegalCitationLink>
        </li>
    );
}

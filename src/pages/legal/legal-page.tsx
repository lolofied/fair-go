import type { PropsWithChildren, ReactNode } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { Link } from "react-router";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { Button } from "@/components/base/buttons/button";
import { BuyMeACoffeeIcon } from "@/components/foundations/buy-me-a-coffee-icon";
import { DONATION_URL } from "@/config/donation";

interface LegalPageProps {
    title: string;
    lastUpdated: string;
    intro?: ReactNode;
}

export const LegalPage = ({ title, lastUpdated, intro, children }: PropsWithChildren<LegalPageProps>) => (
    <div className="flex min-h-dvh flex-col bg-primary">
        <header className="flex items-center justify-between border-b border-secondary px-5 py-4 sm:px-8">
            <Link to="/" aria-label="Back to Fair Go home">
                <FairGoWordmark />
            </Link>
            <Button size="sm" color="link-gray" iconLeading={ArrowLeft} href="/">
                Back to home
            </Button>
        </header>

        <main className="flex flex-1 justify-center px-5 py-12 sm:px-8">
            <article className="w-full max-w-[720px]">
                <h1 className="text-display-sm font-semibold tracking-tight text-primary">{title}</h1>
                <p className="mt-2 text-sm text-tertiary">Last updated: {lastUpdated}</p>

                {intro && <div className="mt-6 text-lg text-tertiary">{intro}</div>}

                <div className="mt-8 flex flex-col gap-8">{children}</div>
            </article>
        </main>

        <footer className="border-t border-secondary px-5 py-6 sm:px-8">
            <nav className="mx-auto flex max-w-[720px] flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tertiary">
                <Link to="/" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                    Home
                </Link>
                <Link to="/about" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                    About
                </Link>
                <Link to="/privacy" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                    Privacy Policy
                </Link>
                <Link to="/terms" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                    Terms of Use
                </Link>
                <Link to="/support" className="font-medium transition duration-100 ease-linear hover:text-secondary">
                    Support
                </Link>
                <a
                    href={DONATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium transition duration-100 ease-linear hover:text-secondary"
                >
                    <BuyMeACoffeeIcon className="size-3.5" />
                    Support Fair Go
                </a>
            </nav>
        </footer>
    </div>
);

export const LegalSection = ({ heading, id, children }: PropsWithChildren<{ heading: string; id?: string }>) => (
    <section id={id} className="flex flex-col gap-3 scroll-mt-24">
        <h2 className="text-xl font-semibold text-primary">{heading}</h2>
        {children}
    </section>
);

export const LegalParagraph = ({ children }: PropsWithChildren) => <p className="text-md text-tertiary">{children}</p>;

export const LegalList = ({ children }: PropsWithChildren) => (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-md text-tertiary marker:text-quaternary">{children}</ul>
);

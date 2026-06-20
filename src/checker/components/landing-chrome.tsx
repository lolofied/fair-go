import { useEffect, useState } from "react";
import { LogIn01 } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { ShellFooter, ShellHeader, ShellHeaderBrand } from "@/components/layout/shell";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { LandingHeaderMenu } from "@/checker/components/landing-header-menu";
import { isSyncConfigured } from "@/config/supabase";
import { DONATION_URL } from "@/config/donation";
import { BuyMeACoffeeIcon } from "@/components/foundations/buy-me-a-coffee-icon";
import { cx } from "@/utils/cx";

/**
 * Shared landing navigation used across the public marketing surface (home, About, Support).
 * Keeping these pages on the same chrome means the nav never changes between them; only the
 * page content swaps. On the home screen the wordmark is static; elsewhere it links home.
 *
 * The header is sticky; a light divider fades in along its bottom edge once the page scrolls.
 */
export const LandingHeader = ({ brandAsLink = false }: { brandAsLink?: boolean }) => {
    const showRetrieve = isSyncConfigured();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <ShellHeader
            className={cx(
                "sticky top-0 z-30 border-b bg-primary transition-colors duration-200 ease-linear",
                isScrolled ? "border-secondary" : "border-transparent",
            )}
        >
            {brandAsLink ? <ShellHeaderBrand /> : <FairGoWordmark />}
            <div className="flex items-center gap-4">
                <div className="hidden items-center gap-3 sm:flex">
                    <Button href="/about" size="sm" color="link-gray">
                        About
                    </Button>
                    <Button href="/support" size="sm" color="link-gray">
                        Support
                    </Button>
                </div>
                {showRetrieve ? (
                    <Button href="/case/retrieve" size="sm" color="secondary" iconLeading={LogIn01} className="hidden sm:flex">
                        Retrieve my case
                    </Button>
                ) : null}
                <div className="sm:hidden">
                    <LandingHeaderMenu />
                </div>
            </div>
        </ShellHeader>
    );
};

export const LandingFooter = () => (
    <ShellFooter>
        <div className="mx-auto flex max-w-[968px] flex-col items-center gap-3 sm:gap-4">
            <p className="text-center text-sm text-tertiary">
                Fair Go is not a law firm and this tool is not legal advice. It helps you document your situation and
                understand your options. For advice about your specific circumstances, speak to an employment lawyer or
                contact the{" "}
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
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-tertiary">
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
        </div>
    </ShellFooter>
);

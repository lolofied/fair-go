import type { PropsWithChildren, ReactNode } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { FairGoWordmark } from "@/checker/components/wordmark";

interface StandalonePageShellProps extends PropsWithChildren {
    brandHref: string;
    brandLabel: string;
    backHref: string;
    backLabel: string;
    footer?: ReactNode;
}

const DefaultFooter = () => (
    <nav className="mx-auto flex max-w-[640px] flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tertiary">
        <Link to="/" className="font-medium transition duration-100 ease-linear hover:text-secondary">
            Home
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
    </nav>
);

export const StandalonePageShell = ({
    brandHref,
    brandLabel,
    backHref,
    backLabel,
    footer,
    children,
}: StandalonePageShellProps) => (
    <div className="flex min-h-dvh flex-col bg-primary">
        <header className="flex items-center justify-between border-b border-secondary px-5 py-4 sm:px-8">
            <Link to={brandHref} aria-label={brandLabel}>
                <FairGoWordmark />
            </Link>
            <Button size="sm" color="link-gray" iconLeading={ArrowLeft} href={backHref}>
                {backLabel}
            </Button>
        </header>

        <main className="flex flex-1 justify-center px-5 py-12 sm:px-8">{children}</main>

        <footer className="border-t border-secondary px-5 py-6 sm:px-8">{footer ?? <DefaultFooter />}</footer>
    </div>
);

export const StandalonePageContent = ({ children }: PropsWithChildren) => (
    <div className="w-full max-w-[640px]">{children}</div>
);

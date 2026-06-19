import type { PropsWithChildren } from "react";
import { ArrowLeft } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { FairGoWordmark } from "@/checker/components/wordmark";

interface StandalonePageShellProps extends PropsWithChildren {
    brandHref: string;
    brandLabel: string;
    backHref: string;
    backLabel: string;
}

export const StandalonePageShell = ({
    brandHref,
    brandLabel,
    backHref,
    backLabel,
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
    </div>
);

export const StandalonePageContent = ({ children }: PropsWithChildren) => (
    <div className="w-full max-w-[640px]">{children}</div>
);

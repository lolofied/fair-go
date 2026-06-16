import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { CheckerFlow } from "@/checker/checker-flow";
import { shouldEnterCaseOverview } from "@/routing/should-enter-case";

export const HomeRoute = () => {
    const [target, setTarget] = useState<"loading" | "checker" | "case">("loading");

    useEffect(() => {
        let cancelled = false;

        shouldEnterCaseOverview().then((enterCase) => {
            if (cancelled) return;
            setTarget(enterCase ? "case" : "checker");
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (target === "loading") {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-primary">
                <p className="text-sm text-tertiary">Loading…</p>
            </div>
        );
    }

    if (target === "case") {
        return <Navigate to="/case" replace />;
    }

    return <CheckerFlow />;
};

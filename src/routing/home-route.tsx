import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { CheckerFlow } from "@/checker/checker-flow";
import { shouldEnterCaseOverview } from "@/routing/should-enter-case";

export const HomeRoute = () => {
    const location = useLocation();
    const forceChecker = Boolean((location.state as { forceChecker?: boolean } | null)?.forceChecker);
    const [target, setTarget] = useState<"loading" | "checker" | "case">(forceChecker ? "checker" : "loading");

    useEffect(() => {
        if (forceChecker) return;

        let cancelled = false;

        shouldEnterCaseOverview().then((enterCase) => {
            if (cancelled) return;
            setTarget(enterCase ? "case" : "checker");
        });

        return () => {
            cancelled = true;
        };
    }, [forceChecker]);

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

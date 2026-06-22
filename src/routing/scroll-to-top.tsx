import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

/** Reset window scroll when the route pathname changes. */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}

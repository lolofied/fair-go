import { lazy, type ComponentType } from "react";

function lazyNamed<T extends Record<string, unknown>, K extends keyof T>(factory: () => Promise<T>, name: K) {
    return lazy(() => factory().then((module) => ({ default: module[name] as ComponentType<unknown> })));
}

export const LazyCaseModule = lazyNamed(() => import("@/case/case-module"), "CaseModule");
export const LazyPrivacyPolicy = lazyNamed(() => import("@/pages/legal/privacy-policy"), "PrivacyPolicy");
export const LazyTermsOfService = lazyNamed(() => import("@/pages/legal/terms-of-service"), "TermsOfService");
export const LazySupportPage = lazyNamed(() => import("@/pages/support"), "SupportPage");
export const LazyAboutPage = lazyNamed(() => import("@/pages/about"), "AboutPage");
export const LazyGuidesIndexPage = lazyNamed(() => import("@/pages/guides/index"), "GuidesIndexPage");
export const LazyUnfairDismissalTimeLimitGuide = lazyNamed(
    () => import("@/pages/guides/unfair-dismissal-time-limit"),
    "UnfairDismissalTimeLimitGuide",
);
export const LazyUnfairDismissalEligibilityGuide = lazyNamed(
    () => import("@/pages/guides/unfair-dismissal-eligibility"),
    "UnfairDismissalEligibilityGuide",
);
export const LazyHowToLodgeUnfairDismissalGuide = lazyNamed(
    () => import("@/pages/guides/how-to-lodge-unfair-dismissal"),
    "HowToLodgeUnfairDismissalGuide",
);
export const LazyUnfairDismissalCompensationGuide = lazyNamed(
    () => import("@/pages/guides/unfair-dismissal-compensation"),
    "UnfairDismissalCompensationGuide",
);
export const LazyNotFound = lazyNamed(() => import("@/pages/not-found"), "NotFound");

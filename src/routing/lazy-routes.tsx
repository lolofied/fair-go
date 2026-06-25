import { lazy, type ComponentType } from "react";

function lazyNamed<T extends Record<string, unknown>, K extends keyof T>(factory: () => Promise<T>, name: K) {
    return lazy(() => factory().then((module) => ({ default: module[name] as ComponentType<unknown> })));
}

export const LazyCaseModule = lazyNamed(() => import("@/case/case-module"), "CaseModule");
export const LazyRetrieveCaseModule = lazyNamed(() => import("@/case/case-module"), "RetrieveCaseModule");
export const LazyPrivacyPolicy = lazyNamed(() => import("@/pages/legal/privacy-policy"), "PrivacyPolicy");
export const LazyTermsOfService = lazyNamed(() => import("@/pages/legal/terms-of-service"), "TermsOfService");
export const LazySupportPage = lazyNamed(() => import("@/pages/support"), "SupportPage");
export const LazyAboutPage = lazyNamed(() => import("@/pages/about"), "AboutPage");
export const LazyBlogIndexPage = lazyNamed(() => import("@/pages/blog/index"), "BlogIndexPage");
export const LazyGuidesIndexPage = lazyNamed(() => import("@/pages/guides/index"), "GuidesIndexPage");
export const LazyRunTheEligibilityCheckGuide = lazyNamed(
    () => import("@/pages/guides/run-the-eligibility-check"),
    "RunTheEligibilityCheckGuide",
);
export const LazyAfterYourEligibilityCheckGuide = lazyNamed(
    () => import("@/pages/guides/after-your-eligibility-check"),
    "AfterYourEligibilityCheckGuide",
);
export const LazyRetrieveASavedCaseGuide = lazyNamed(
    () => import("@/pages/guides/retrieve-a-saved-case"),
    "RetrieveASavedCaseGuide",
);
export const LazyBuildYourCaseProfileGuide = lazyNamed(
    () => import("@/pages/guides/build-your-case-profile"),
    "BuildYourCaseProfileGuide",
);
export const LazyAddEventsAndEvidenceGuide = lazyNamed(
    () => import("@/pages/guides/add-events-and-evidence"),
    "AddEventsAndEvidenceGuide",
);
export const LazyExportYourCaseForALawyerGuide = lazyNamed(
    () => import("@/pages/guides/export-your-case-for-a-lawyer"),
    "ExportYourCaseForALawyerGuide",
);
export const LazyHowEncryptedSyncWorksGuide = lazyNamed(
    () => import("@/pages/guides/how-encrypted-sync-works"),
    "HowEncryptedSyncWorksGuide",
);
export const LazyUnfairDismissalTimeLimitGuide = lazyNamed(
    () => import("@/pages/resources/employment/unfair-dismissal-time-limit"),
    "UnfairDismissalTimeLimitGuide",
);
export const LazyUnfairDismissalEligibilityGuide = lazyNamed(
    () => import("@/pages/resources/employment/unfair-dismissal-eligibility"),
    "UnfairDismissalEligibilityGuide",
);
export const LazyHowToLodgeUnfairDismissalGuide = lazyNamed(
    () => import("@/pages/resources/employment/how-to-lodge-unfair-dismissal"),
    "HowToLodgeUnfairDismissalGuide",
);
export const LazyUnfairDismissalCompensationGuide = lazyNamed(
    () => import("@/pages/resources/employment/unfair-dismissal-compensation"),
    "UnfairDismissalCompensationGuide",
);
export const LazyNotFound = lazyNamed(() => import("@/pages/not-found"), "NotFound");

import { lazy, type ComponentType } from "react";

function lazyNamed<T extends Record<string, unknown>, K extends keyof T>(factory: () => Promise<T>, name: K) {
    return lazy(() => factory().then((module) => ({ default: module[name] as ComponentType<unknown> })));
}

export const LazyCaseModule = lazyNamed(() => import("@/case/case-module"), "CaseModule");
export const LazyPrivacyPolicy = lazyNamed(() => import("@/pages/legal/privacy-policy"), "PrivacyPolicy");
export const LazyTermsOfService = lazyNamed(() => import("@/pages/legal/terms-of-service"), "TermsOfService");
export const LazySupportPage = lazyNamed(() => import("@/pages/support"), "SupportPage");
export const LazyAboutPage = lazyNamed(() => import("@/pages/about"), "AboutPage");
export const LazyNotFound = lazyNamed(() => import("@/pages/not-found"), "NotFound");

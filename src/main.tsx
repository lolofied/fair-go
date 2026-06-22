import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { initPostHog } from "@/analytics/posthog-client";
import { LEGACY_GUIDE_REDIRECTS } from "@/config/site-seo";
import { RouteLoadingFallback } from "@/components/layout/route-loading-fallback";
import { HomeRoute } from "@/routing/home-route";
import { ScrollToTop } from "@/routing/scroll-to-top";
import {
    LazyAboutPage,
    LazyAddEventsAndEvidenceGuide,
    LazyAfterYourEligibilityCheckGuide,
    LazyBlogIndexPage,
    LazyBuildYourCaseProfileGuide,
    LazyCaseModule,
    LazyExportYourCaseForALawyerGuide,
    LazyGuidesIndexPage,
    LazyHowEncryptedSyncWorksGuide,
    LazyNotFound,
    LazyPrivacyPolicy,
    LazyRetrieveASavedCaseGuide,
    LazyRunTheEligibilityCheckGuide,
    LazySupportPage,
    LazyTermsOfService,
    LazyUnfairDismissalEligibilityGuide,
    LazyUnfairDismissalTimeLimitGuide,
    LazyHowToLodgeUnfairDismissalGuide,
    LazyUnfairDismissalCompensationGuide,
} from "@/routing/lazy-routes";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

initPostHog();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <ScrollToTop />
                <RouteProvider>
                    <Suspense fallback={<RouteLoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<HomeRoute />} />
                            <Route path="/case/*" element={<LazyCaseModule />} />
                            <Route path="/privacy" element={<LazyPrivacyPolicy />} />
                            <Route path="/terms" element={<LazyTermsOfService />} />
                            <Route path="/support" element={<LazySupportPage />} />
                            <Route path="/about" element={<LazyAboutPage />} />
                            <Route path="/blog" element={<LazyBlogIndexPage />} />
                            <Route path="/guides" element={<LazyGuidesIndexPage />} />
                            <Route
                                path="/blog/unfair-dismissal-time-limit"
                                element={<LazyUnfairDismissalTimeLimitGuide />}
                            />
                            <Route
                                path="/blog/unfair-dismissal-eligibility"
                                element={<LazyUnfairDismissalEligibilityGuide />}
                            />
                            <Route
                                path="/blog/how-to-lodge-unfair-dismissal"
                                element={<LazyHowToLodgeUnfairDismissalGuide />}
                            />
                            <Route
                                path="/blog/unfair-dismissal-compensation"
                                element={<LazyUnfairDismissalCompensationGuide />}
                            />
                            <Route path="/guides/run-the-eligibility-check" element={<LazyRunTheEligibilityCheckGuide />} />
                            <Route path="/guides/after-your-eligibility-check" element={<LazyAfterYourEligibilityCheckGuide />} />
                            <Route path="/guides/retrieve-a-saved-case" element={<LazyRetrieveASavedCaseGuide />} />
                            <Route path="/guides/build-your-case-profile" element={<LazyBuildYourCaseProfileGuide />} />
                            <Route path="/guides/add-events-and-evidence" element={<LazyAddEventsAndEvidenceGuide />} />
                            <Route path="/guides/export-your-case-for-a-lawyer" element={<LazyExportYourCaseForALawyerGuide />} />
                            <Route path="/guides/how-encrypted-sync-works" element={<LazyHowEncryptedSyncWorksGuide />} />
                            {Object.entries(LEGACY_GUIDE_REDIRECTS).map(([from, to]) => (
                                <Route key={from} path={from} element={<Navigate to={to} replace />} />
                            ))}
                            <Route path="*" element={<LazyNotFound />} />
                        </Routes>
                    </Suspense>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);

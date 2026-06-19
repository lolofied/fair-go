import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { initPostHog } from "@/analytics/posthog-client";
import { RouteLoadingFallback } from "@/components/layout/route-loading-fallback";
import { HomeRoute } from "@/routing/home-route";
import {
    LazyAboutPage,
    LazyCaseModule,
    LazyNotFound,
    LazyPrivacyPolicy,
    LazySupportPage,
    LazyTermsOfService,
} from "@/routing/lazy-routes";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

initPostHog();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <RouteProvider>
                    <Suspense fallback={<RouteLoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<HomeRoute />} />
                            <Route path="/case/*" element={<LazyCaseModule />} />
                            <Route path="/privacy" element={<LazyPrivacyPolicy />} />
                            <Route path="/terms" element={<LazyTermsOfService />} />
                            <Route path="/support" element={<LazySupportPage />} />
                            <Route path="/about" element={<LazyAboutPage />} />
                            <Route path="*" element={<LazyNotFound />} />
                        </Routes>
                    </Suspense>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);

import { Navigate, Route, Routes } from "react-router";
import { CaseLayout } from "@/case/components/case-layout";
import { CaseOverviewScreen } from "@/case/screens/case-overview-screen";
import { CaseProfileScreen } from "@/case/screens/case-profile-screen";
import { EventLogScreen } from "@/case/screens/event-log-screen";
import { EvidenceScreen } from "@/case/screens/evidence-screen";
import { ExportScreen } from "@/case/screens/export-screen";
import { SettingsScreen } from "@/case/screens/settings-screen";
import { RetrieveCaseScreen } from "@/case/screens/retrieve-case-screen";
import { WitnessScreen } from "@/case/screens/witness-screen";
import { CaseProvider, useCase } from "@/case/store";
import { SyncEngineBridge } from "@/case/sync/sync-engine-bridge";
import { SyncProvider } from "@/case/sync/sync-provider";

const CaseRoutes = () => {
    const { loading } = useCase();

    if (loading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-secondary">
                <p className="text-sm text-tertiary">Loading your case...</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="retrieve" element={<RetrieveCaseScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route
                path="*"
                element={
                    <CaseLayout>
                        <Routes>
                            <Route index element={<CaseOverviewScreen />} />
                            <Route path="profile" element={<CaseProfileScreen />} />
                            <Route path="timeline" element={<Navigate to="/case/events" replace />} />
                            <Route path="events" element={<EventLogScreen />} />
                            <Route path="evidence" element={<EvidenceScreen />} />
                            <Route path="witnesses" element={<WitnessScreen />} />
                            <Route path="export" element={<ExportScreen />} />
                        </Routes>
                    </CaseLayout>
                }
            />
        </Routes>
    );
};

export const CaseModule = () => (
    <SyncProvider>
        <CaseProvider>
            <SyncEngineBridge />
            <CaseRoutes />
        </CaseProvider>
    </SyncProvider>
);

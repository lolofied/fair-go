import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useCase } from "@/case/store";
import { resolveOnLogin, pushLocalCase, SyncEngineError } from "@/case/sync/engine";
import { getSyncDek } from "@/case/sync/session";
import { useSync } from "@/case/sync/sync-provider";

const AUTO_SYNC_DEBOUNCE_MS = 2000;

/** Wires debounced push + one-shot hydrate-on-unlock between CaseProvider and SyncProvider. */
export const SyncEngineBridge = () => {
    const location = useLocation();
    const { file, replaceFile } = useCase();
    const { user, dekUnlocked, configured, setSyncState, markSynced, lastPushedUpdatedAtRef } = useSync();

    const hydratedForUserRef = useRef<string | null>(null);
    const hydrationInFlightForUserRef = useRef<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retrieveRoute = location.pathname.startsWith("/case/retrieve");

    useEffect(() => {
        if (!user) {
            hydratedForUserRef.current = null;
            hydrationInFlightForUserRef.current = null;
        }
    }, [user]);

    useEffect(() => {
        if (retrieveRoute) return;
        if (!configured || !user || !dekUnlocked || !file) return;
        if (hydratedForUserRef.current === user.id) return;
        if (hydrationInFlightForUserRef.current === user.id) return;

        let cancelled = false;
        hydrationInFlightForUserRef.current = user.id;

        (async () => {
            try {
                const dek = getSyncDek();
                if (!dek) return;

                setSyncState({ status: "syncing", error: null });
                const result = await resolveOnLogin(file, dek, user.id);
                if (cancelled) return;

                if (result.applied === "remote") {
                    replaceFile(result.caseFile);
                }

                hydratedForUserRef.current = user.id;
                markSynced(result.caseFile.meta.updatedAt);
                setSyncState({ status: "synced", error: null });
            } catch (error) {
                if (cancelled) return;
                hydratedForUserRef.current = null;
                setSyncState({
                    status: "error",
                    error: error instanceof SyncEngineError ? error.message : "Sync failed.",
                });
            } finally {
                if (hydrationInFlightForUserRef.current === user.id) {
                    hydrationInFlightForUserRef.current = null;
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [configured, user, dekUnlocked, file, replaceFile, setSyncState, markSynced, retrieveRoute]);

    useEffect(() => {
        if (retrieveRoute) return;
        if (!configured || !user || !dekUnlocked || !file) return;
        if (hydratedForUserRef.current !== user.id) return;
        if (file.meta.updatedAt === lastPushedUpdatedAtRef.current) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const dek = getSyncDek();
            const current = file;
            if (!dek || !current) return;
            if (hydratedForUserRef.current !== user.id) return;

            setSyncState({ status: "syncing", error: null });
            try {
                await pushLocalCase(current, dek, user.id);
                markSynced(current.meta.updatedAt);
                setSyncState({ status: "synced", error: null });
            } catch (error) {
                setSyncState({
                    status: "error",
                    error: error instanceof SyncEngineError ? error.message : "Sync failed.",
                });
            }
        }, AUTO_SYNC_DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [configured, user, dekUnlocked, file, setSyncState, markSynced, lastPushedUpdatedAtRef, retrieveRoute]);

    return null;
};

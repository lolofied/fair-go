import { useEffect, useRef } from "react";
import { useCase } from "@/case/store";
import { trackCaseSyncSaved } from "@/analytics/product-analytics";
import { resolveOnLogin, pushLocalCase, SyncEngineError } from "@/case/sync/engine";
import { getSyncDek } from "@/case/sync/session";
import { useSync } from "@/case/sync/sync-provider";

const AUTO_SYNC_DEBOUNCE_MS = 2000;

/** Wires debounced push + one-shot hydrate-on-unlock between CaseProvider and SyncProvider. */
export const SyncEngineBridge = () => {
    const { file, replaceFile } = useCase();
    const { user, dekUnlocked, configured, setSyncState, markSynced, lastPushedUpdatedAtRef } = useSync();

    const hydratedForUserRef = useRef<string | null>(null);
    const hydratingForUserRef = useRef<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user) {
            hydratedForUserRef.current = null;
            hydratingForUserRef.current = null;
        }
    }, [user]);

    useEffect(() => {
        if (!configured || !user || !dekUnlocked || !file) return;
        if (hydratedForUserRef.current === user.id) return;
        if (hydratingForUserRef.current === user.id) return;

        let cancelled = false;
        hydratingForUserRef.current = user.id;

        (async () => {
            const dek = getSyncDek();
            if (!dek) {
                hydratingForUserRef.current = null;
                return;
            }

            setSyncState({ status: "syncing", error: null });
            try {
                const result = await resolveOnLogin(file, dek, user.id);
                if (cancelled) return;

                hydratingForUserRef.current = null;
                hydratedForUserRef.current = user.id;

                if (result.applied === "remote") {
                    replaceFile(result.caseFile);
                } else if (result.applied === "local") {
                    trackCaseSyncSaved("login");
                }

                markSynced(result.caseFile.meta.updatedAt);
                setSyncState({ status: "synced", error: null });
            } catch (error) {
                if (cancelled) return;
                hydratingForUserRef.current = null;
                hydratedForUserRef.current = null;
                setSyncState({
                    status: "error",
                    error: error instanceof SyncEngineError ? error.message : "Sync failed.",
                });
            }
        })();

        return () => {
            cancelled = true;
            if (hydratingForUserRef.current === user.id) {
                hydratingForUserRef.current = null;
            }
        };
    }, [configured, user, dekUnlocked, file, replaceFile, setSyncState, markSynced]);

    useEffect(() => {
        if (!configured || !user || !dekUnlocked || !file) return;
        if (hydratedForUserRef.current !== user.id) return;
        if (file.meta.updatedAt === lastPushedUpdatedAtRef.current) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const dek = getSyncDek();
            const current = file;
            if (!dek || !current) return;

            setSyncState({ status: "syncing", error: null });
            try {
                await pushLocalCase(current, dek, user.id);
                markSynced(current.meta.updatedAt);
                trackCaseSyncSaved("auto");
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
    }, [configured, user, dekUnlocked, file, setSyncState, markSynced, lastPushedUpdatedAtRef]);

    return null;
};

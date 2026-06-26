import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
    type MutableRefObject,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
    changeSyncPassphrase,
    getCurrentSyncUser,
    getSyncDek,
    recoverSyncPassphrase,
    signInWithPassphrase,
    signOutSync,
    signUpWithPassphrase,
    SyncAuthError,
} from "@/case/sync/auth";
import { getSupabaseClient } from "@/case/sync/client";
import { pushLocalCase, SyncEngineError } from "@/case/sync/engine";
import { clearSyncSession } from "@/case/sync/session";
import type { CaseFile } from "@/case/types";
import { trackCaseSyncSaved, trackSyncAccountCreated, trackSyncAccountSignedIn } from "@/analytics/product-analytics";
import { identifyPostHogUser, resetPostHogIdentity } from "@/analytics/posthog-client";
import { isSyncConfigured } from "@/config/supabase";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface SyncStatePatch {
    status?: SyncStatus;
    error?: string | null;
}

interface SyncContextValue {
    configured: boolean;
    loading: boolean;
    user: User | null;
    dekUnlocked: boolean;
    syncStatus: SyncStatus;
    syncError: string | null;
    lastSyncedAt: string | null;
    lastPushedUpdatedAtRef: MutableRefObject<string | null>;
    signUp: (email: string, passphrase: string, caseFile: CaseFile) => Promise<{ recoveryKey: string }>;
    signIn: (email: string, passphrase: string) => Promise<User>;
    signOut: () => Promise<void>;
    syncNow: (caseFile: CaseFile) => Promise<void>;
    changePassphrase: (email: string, currentPassphrase: string, newPassphrase: string) => Promise<void>;
    recoverPassphrase: (email: string, recoveryKey: string, newPassphrase: string) => Promise<void>;
    setSyncState: (patch: SyncStatePatch) => void;
    markSynced: (updatedAt: string) => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export const SyncProvider = ({ children }: PropsWithChildren) => {
    const configured = isSyncConfigured();
    const [loading, setLoading] = useState(configured);
    const [user, setUser] = useState<User | null>(null);
    const [dekUnlocked, setDekUnlocked] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
    const [syncError, setSyncError] = useState<string | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
    const lastPushedUpdatedAtRef = useRef<string | null>(null);
    const identifiedPostHogUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!configured) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        getCurrentSyncUser()
            .then((next) => {
                if (cancelled) return;
                setUser(next);
                setDekUnlocked(getSyncDek() !== null);
                if (next?.id) {
                    identifyPostHogUser(next.id);
                    identifiedPostHogUserIdRef.current = next.id;
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        const supabase = getSupabaseClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const userId = session?.user?.id ?? null;
            setUser(session?.user ?? null);

            if (userId) {
                identifyPostHogUser(userId);
                identifiedPostHogUserIdRef.current = userId;
            } else if (identifiedPostHogUserIdRef.current) {
                resetPostHogIdentity();
                identifiedPostHogUserIdRef.current = null;
            }

            if (!session?.user) {
                clearSyncSession();
                setDekUnlocked(false);
                lastPushedUpdatedAtRef.current = null;
                setSyncStatus("idle");
                setSyncError(null);
                setLastSyncedAt(null);
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [configured]);

    const setSyncState = useCallback((patch: SyncStatePatch) => {
        if (patch.status !== undefined) setSyncStatus(patch.status);
        if (patch.error !== undefined) setSyncError(patch.error);
    }, []);

    const markSynced = useCallback((updatedAt: string) => {
        lastPushedUpdatedAtRef.current = updatedAt;
        setLastSyncedAt(new Date().toISOString());
    }, []);

    const syncNow = useCallback(
        async (caseFile: CaseFile) => {
            if (!user || !dekUnlocked) {
                throw new SyncEngineError("Sign in and unlock encryption to sync.");
            }
            const dek = getSyncDek();
            if (!dek) {
                throw new SyncEngineError("Unlock encryption with your passphrase first.");
            }

            setSyncState({ status: "syncing", error: null });
            try {
                await pushLocalCase(caseFile, dek, user.id);
                markSynced(caseFile.meta.updatedAt);
                trackCaseSyncSaved("manual");
                setSyncState({ status: "synced", error: null });
            } catch (error) {
                const message = error instanceof SyncEngineError ? error.message : "Sync failed.";
                setSyncState({ status: "error", error: message });
                throw error;
            }
        },
        [user, dekUnlocked, setSyncState, markSynced],
    );

    const changePassphrase = useCallback(async (email: string, currentPassphrase: string, newPassphrase: string) => {
        await changeSyncPassphrase(email, currentPassphrase, newPassphrase);
        setDekUnlocked(true);
    }, []);

    const recoverPassphrase = useCallback(async (email: string, recoveryKey: string, newPassphrase: string) => {
        const next = await recoverSyncPassphrase(email, recoveryKey, newPassphrase);
        setUser(next);
        setDekUnlocked(true);
        lastPushedUpdatedAtRef.current = null;
    }, []);

    const signUp = useCallback(async (email: string, passphrase: string, caseFile: CaseFile) => {
        const result = await signUpWithPassphrase(email, passphrase, caseFile);
        setUser(result.user);
        setDekUnlocked(true);
        trackSyncAccountCreated();
        return { recoveryKey: result.recoveryKey };
    }, []);

    const signIn = useCallback(async (email: string, passphrase: string) => {
        const next = await signInWithPassphrase(email, passphrase);
        setUser(next);
        setDekUnlocked(true);
        trackSyncAccountSignedIn();
        return next;
    }, []);

    const signOut = useCallback(async () => {
        await signOutSync();
        setUser(null);
        setDekUnlocked(false);
        lastPushedUpdatedAtRef.current = null;
        setSyncStatus("idle");
        setSyncError(null);
        setLastSyncedAt(null);
    }, []);

    const value = useMemo<SyncContextValue>(
        () => ({
            configured,
            loading,
            user,
            dekUnlocked,
            syncStatus,
            syncError,
            lastSyncedAt,
            lastPushedUpdatedAtRef,
            signUp,
            signIn,
            signOut,
            syncNow,
            changePassphrase,
            recoverPassphrase,
            setSyncState,
            markSynced,
        }),
        [
            configured,
            loading,
            user,
            dekUnlocked,
            syncStatus,
            syncError,
            lastSyncedAt,
            signUp,
            signIn,
            signOut,
            syncNow,
            changePassphrase,
            recoverPassphrase,
            setSyncState,
            markSynced,
        ],
    );

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export function useSync(): SyncContextValue {
    const ctx = useContext(SyncContext);
    if (!ctx) throw new Error("useSync must be used within a SyncProvider");
    return ctx;
}

export { SyncAuthError, SyncEngineError };

import { useState } from "react";
import { LogOut01, UploadCloud02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { useCase } from "@/case/store";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

export const SyncSettingsCard = () => {
    const { file } = useCase();
    const { configured, loading, user, dekUnlocked, syncStatus, syncError, lastSyncedAt, signUp, signIn, signOut, syncNow } = useSync();

    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const [savedRecovery, setSavedRecovery] = useState(false);
    const [syncBusy, setSyncBusy] = useState(false);

    if (!configured || loading || !file) return null;

    const syncStatusLabel =
        syncStatus === "syncing"
            ? "Syncing encrypted copy…"
            : syncStatus === "error"
              ? syncError ?? "Sync failed"
              : lastSyncedAt
                ? `Last synced ${new Date(lastSyncedAt).toLocaleString("en-AU")}`
                : dekUnlocked
                  ? "Waiting to sync"
                  : null;

    const onSyncNow = async () => {
        setSyncBusy(true);
        try {
            await syncNow(file);
        } catch {
            /* error surfaced via syncStatus */
        } finally {
            setSyncBusy(false);
        }
    };

    const resetForm = () => {
        setPassphrase("");
        setConfirm("");
        setError(null);
    };

    const onSubmit = async () => {
        setError(null);
        if (passphrase.length < 8) {
            setError("Use a passphrase of at least 8 characters.");
            return;
        }
        if (mode === "signup" && passphrase !== confirm) {
            setError("The passphrases don't match.");
            return;
        }

        setBusy(true);
        try {
            if (user && !dekUnlocked) {
                await signIn(user.email ?? email, passphrase);
                resetForm();
                return;
            }
            if (mode === "signup") {
                const { recoveryKey: key } = await signUp(email, passphrase, file);
                setRecoveryKey(key);
                resetForm();
            } else {
                await signIn(email, passphrase);
                resetForm();
            }
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    if (recoveryKey && !savedRecovery) {
        return (
            <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                <h2 className="text-md font-semibold text-primary">Save your recovery key</h2>
                <GuardrailBanner tone="warning" title="This is the only way to recover your account" className="my-4">
                    If you forget your passphrase, this recovery key is the only way back in. We cannot reset it for you.
                    Store it somewhere safe, separate from your passphrase.
                </GuardrailBanner>
                <p className="break-all rounded-lg border border-secondary bg-secondary px-3 py-2 font-mono text-sm text-primary">
                    {recoveryKey}
                </p>
                <label className="mt-4 flex items-center gap-2 text-sm text-secondary">
                    <input
                        type="checkbox"
                        checked={savedRecovery}
                        onChange={(e) => setSavedRecovery(e.target.checked)}
                        className="size-4 rounded border-primary"
                    />
                    I have saved my recovery key somewhere safe.
                </label>
                <Button color="primary" size="md" className="mt-4" isDisabled={!savedRecovery} onClick={() => setRecoveryKey(null)}>
                    Continue
                </Button>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
            <h2 className="text-md font-semibold text-primary">Encrypted sync</h2>

            {user ? (
                <div className="mt-4">
                    <p className="text-sm text-tertiary">
                        Signed in as <span className="font-medium text-secondary">{user.email}</span>
                        {dekUnlocked ? " · encryption unlocked" : " · enter your passphrase to unlock encryption on this device"}
                    </p>
                    {dekUnlocked && syncStatusLabel && (
                        <p className={`mt-2 text-sm ${syncStatus === "error" ? "text-error-primary" : "text-tertiary"}`}>
                            {syncStatusLabel}
                        </p>
                    )}
                    {!dekUnlocked && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} />
                        </div>
                    )}
                    {!dekUnlocked && (
                        <Button color="primary" size="md" iconLeading={UploadCloud02} className="mt-4" isLoading={busy} onClick={onSubmit}>
                            Unlock encryption
                        </Button>
                    )}
                    {dekUnlocked && (
                        <Button
                            color="secondary"
                            size="md"
                            iconLeading={UploadCloud02}
                            className="mt-4"
                            isLoading={syncBusy || syncStatus === "syncing"}
                            onClick={onSyncNow}
                        >
                            Sync now
                        </Button>
                    )}
                    <Button color="secondary" size="md" iconLeading={LogOut01} className="mt-4 ml-0 sm:ml-3" onClick={() => signOut()}>
                        Sign out
                    </Button>
                </div>
            ) : (
                <div className="mt-4">
                    <GuardrailBanner tone="info" title="Optional encrypted sync" className="mb-4">
                        Your case stays on this device until you sync. Sign in to store an encrypted copy you can retrieve
                        from anywhere. We only store ciphertext we cannot read. Your deadline date may be stored in plaintext
                        for reminder emails — see{" "}
                        <a href="/privacy#encrypted-sync" className="font-medium text-brand-secondary underline-offset-2 hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </GuardrailBanner>
                    <div className="mb-4 flex gap-2">
                        <Button size="sm" color={mode === "signin" ? "primary" : "secondary"} onClick={() => setMode("signin")}>
                            Sign in
                        </Button>
                        <Button size="sm" color={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")}>
                            Create account
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                        <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} placeholder="At least 8 characters" />
                        {mode === "signup" && (
                            <PasswordField label="Confirm passphrase" value={confirm} onChange={setConfirm} />
                        )}
                    </div>
                    {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
                    <Button
                        color="primary"
                        size="md"
                        iconLeading={UploadCloud02}
                        className="mt-4"
                        isLoading={busy}
                        onClick={onSubmit}
                    >
                        {mode === "signup" ? "Create sync account" : "Sign in"}
                    </Button>
                </div>
            )}
        </section>
    );
};

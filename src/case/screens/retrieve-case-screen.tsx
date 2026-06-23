import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, LogIn01, UploadCloud02 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { readEncryptedBackup, restoreBackup } from "@/case/backup";
import {
    mobileBtnClass,
    SectionCard,
    Shell,
    ShellContent,
    ShellFooter,
    ShellHeader,
    ShellHeaderBrand,
    ShellMain,
} from "@/components/layout/shell";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { RecoverPassphrasePanel } from "@/case/components/recover-passphrase-panel";
import { useCase } from "@/case/store";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

export const RetrieveCaseScreen = () => {
    const navigate = useNavigate();
    const { replaceFile } = useCase();
    const { configured, loading, user, dekUnlocked, syncStatus, syncError, signIn } = useSync();

    const [email, setEmail] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const restoreRef = useRef<HTMLInputElement>(null);
    const [restorePass, setRestorePass] = useState("");
    const [restoreBusy, setRestoreBusy] = useState(false);
    const [restoreErr, setRestoreErr] = useState<string | null>(null);

    const syncing = user && dekUnlocked && syncStatus === "syncing";

    useEffect(() => {
        if (loading) return;
        if (!configured) return;
        if (user && dekUnlocked && syncStatus === "synced") {
            navigate("/case", { replace: true });
        }
    }, [loading, configured, user, dekUnlocked, syncStatus, navigate]);

    const onSubmit = async () => {
        setError(null);
        if (passphrase.length < 8) {
            setError("Use a passphrase of at least 8 characters.");
            return;
        }
        setBusy(true);
        try {
            await signIn(email, passphrase);
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Sign-in failed.");
        } finally {
            setBusy(false);
        }
    };

    const onRestoreFile = async (f: File) => {
        setRestoreErr(null);
        if (!restorePass) {
            setRestoreErr("Enter the passphrase you used for this backup.");
            return;
        }
        setRestoreBusy(true);
        try {
            const text = await f.text();
            const payload = await readEncryptedBackup(text, restorePass);
            const restored = await restoreBackup(payload);
            replaceFile(restored);
            navigate("/case", { replace: true });
        } catch (e) {
            setRestoreErr(e instanceof Error ? e.message : "Could not restore that backup.");
        } finally {
            setRestoreBusy(false);
            if (restoreRef.current) restoreRef.current.value = "";
        }
    };

    if (!configured) {
        return (
            <Shell>
                <RetrieveHeader />
                <ShellMain>
                    <ShellContent className="text-center">
                        <p className="text-md text-tertiary">Encrypted sync is not available on this deployment yet.</p>
                        <RestoreFromBackupSection
                            restorePass={restorePass}
                            setRestorePass={setRestorePass}
                            restoreRef={restoreRef}
                            restoreBusy={restoreBusy}
                            restoreErr={restoreErr}
                            onRestoreFile={onRestoreFile}
                            className="mt-8 text-left"
                        />
                        <Button href="/" color="secondary" size="md" className={`mt-6 ${mobileBtnClass}`} iconLeading={ArrowLeft}>
                            Back to home
                        </Button>
                    </ShellContent>
                </ShellMain>
            </Shell>
        );
    }

    return (
        <Shell>
            <RetrieveHeader />

            <ShellMain align="start">
                <ShellContent>
                    <h1 className="text-xl font-semibold tracking-tight text-primary sm:text-display-xs">Retrieve your case</h1>
                    <p className="mt-2 text-sm text-tertiary sm:text-md">
                        Sign in with the email and passphrase you used for encrypted sync, or upload an encrypted backup file
                        from this device.
                    </p>

                    {syncing ? (
                        <div className="fg-section-card mt-6 text-center sm:mt-8">
                            <UploadCloud02 className="mx-auto size-8 text-brand-secondary" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium text-primary">Retrieving your encrypted case…</p>
                            <p className="mt-1 text-sm text-tertiary">This may take a moment on slower connections.</p>
                        </div>
                    ) : (
                        <>
                            <GuardrailBanner tone="info" title="Use a personal device" className="mt-5 sm:mt-6">
                                Sign in on a device and browser you trust. Your passphrase unlocks your encryption key on this
                                device only.
                            </GuardrailBanner>

                            <div className="fg-stack-md mt-5 sm:mt-6">
                                <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} />
                            </div>

                            {(error || syncError) && (
                                <p className="mt-3 text-sm text-error-primary">{error ?? syncError}</p>
                            )}

                            <Button
                                color="primary"
                                size="lg"
                                className={`mt-5 sm:mt-6 ${mobileBtnClass}`}
                                iconLeading={LogIn01}
                                isLoading={busy}
                                onClick={onSubmit}
                            >
                                Sign in and retrieve
                            </Button>

                            <p className="mt-4 text-center text-sm text-tertiary">
                                Forgot your passphrase?{" "}
                                <a href="#recover" className="font-medium text-brand-secondary hover:text-brand-secondary_hover">
                                    Use your recovery key
                                </a>
                            </p>

                            <RestoreFromBackupSection
                                restorePass={restorePass}
                                setRestorePass={setRestorePass}
                                restoreRef={restoreRef}
                                restoreBusy={restoreBusy}
                                restoreErr={restoreErr}
                                onRestoreFile={onRestoreFile}
                                className="mt-8 border-t border-secondary pt-8 sm:mt-10 sm:pt-10"
                            />

                            <RecoverPassphrasePanel className="mt-8 border-t border-secondary pt-8 sm:mt-10 sm:pt-10" />
                        </>
                    )}
                </ShellContent>
            </ShellMain>

            <ShellFooter>
                <div className="flex justify-center">
                    <Button href="/" color="link-gray" size="sm" iconLeading={ArrowLeft}>
                        Back to home
                    </Button>
                </div>
            </ShellFooter>
        </Shell>
    );
};

function RetrieveHeader() {
    return (
        <ShellHeader>
            <ShellHeaderBrand />
            <Button href="/" size="sm" color="secondary" iconLeading={ArrowLeft}>
                <span className="sm:hidden">Back</span>
                <span className="hidden sm:inline">Back to home</span>
            </Button>
        </ShellHeader>
    );
}

function RestoreFromBackupSection({
    restorePass,
    setRestorePass,
    restoreRef,
    restoreBusy,
    restoreErr,
    onRestoreFile,
    className,
}: {
    restorePass: string;
    setRestorePass: (value: string) => void;
    restoreRef: RefObject<HTMLInputElement | null>;
    restoreBusy: boolean;
    restoreErr: string | null;
    onRestoreFile: (file: File) => void;
    className?: string;
}) {
    return (
        <SectionCard title="Restore from a backup file" className={className}>
            <p className="text-sm text-tertiary">
                Choose the encrypted backup you downloaded from Settings. Enter its passphrase, then upload the file. This
                replaces any case already on this device.
            </p>
            <div className="mt-4 max-w-sm">
                <PasswordField label="Backup passphrase" value={restorePass} onChange={setRestorePass} />
            </div>
            <input
                ref={restoreRef}
                type="file"
                accept=".fgbackup,.json,application/json"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onRestoreFile(f);
                }}
            />
            <Button
                color="secondary"
                size="md"
                iconLeading={UploadCloud02}
                className={`mt-4 ${mobileBtnClass}`}
                isLoading={restoreBusy}
                onClick={() => restoreRef.current?.click()}
            >
                Choose backup file
            </Button>
            {restoreErr && <p className="mt-3 text-sm text-error-primary">{restoreErr}</p>}
        </SectionCard>
    );
}

import { useState, type ReactNode } from "react";
import { CheckCircle, ChevronDown, Download01, LogIn01, UploadCloud02 } from "@untitledui/icons";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { needsBackup } from "@/case/case-save-status";
import { useCase } from "@/case/store";
import { formatUnsavedChangesLabel } from "@/case/unsaved-changes";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";
import { cx } from "@/utils/cx";

function formatHeaderTimestamp(iso: string): string {
    return new Date(iso).toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
}

/** Compact save / sync / backup status for the case header (visible on every tab). */
export const HeaderSaveStatus = () => {
    const { file } = useCase();
    const navigate = useNavigate();
    const { configured, loading, user, dekUnlocked, syncStatus, lastSyncedAt, signUp, syncNow } = useSync();

    const [createOpen, setCreateOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const [savedRecovery, setSavedRecovery] = useState(false);

    if (!file || loading) return null;

    const hasBackup = Boolean(file.meta.lastBackupAt);
    const backupStale = needsBackup(file.meta.lastBackupAt, file.meta.updatedAt);
    const isSaved = configured && Boolean(user && dekUnlocked);
    const unsavedLabel = formatUnsavedChangesLabel(file);

    const onSaveMenuAction = (key: React.Key) => {
        if (key === "create-account") setCreateOpen(true);
        if (key === "sign-in") navigate("/case/settings#sync");
        if (key === "backup") navigate("/case/settings");
    };

    const resetCreateForm = () => {
        setEmail("");
        setPassphrase("");
        setConfirm("");
        setError(null);
    };

    const closeCreateModal = () => {
        setCreateOpen(false);
        setRecoveryKey(null);
        setSavedRecovery(false);
        resetCreateForm();
    };

    const onCreateAccount = async () => {
        setError(null);
        if (passphrase.length < 8) {
            setError("Use a passphrase of at least 8 characters.");
            return;
        }
        if (passphrase !== confirm) {
            setError("The passphrases don't match.");
            return;
        }

        setBusy(true);
        try {
            const { recoveryKey: key } = await signUp(email, passphrase, file);
            setRecoveryKey(key);
            resetCreateForm();
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    const onRetrySync = async () => {
        try {
            await syncNow(file);
        } catch {
            /* surfaced via syncStatus */
        }
    };

    const statusPill = (className: string, children: ReactNode, onClick?: () => void) => {
        const shared = cx(
            "inline-flex max-w-[min(100vw-8rem,20rem)] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition duration-100 ease-linear",
            className,
        );
        if (onClick) {
            return (
                <button type="button" className={cx(shared, "cursor-pointer hover:opacity-90")} onClick={onClick}>
                    {children}
                </button>
            );
        }
        return (
            <Link to="/case/settings" className={cx(shared, "hover:opacity-90")}>
                {children}
            </Link>
        );
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                {isSaved ? (
                    syncStatus === "error" ? (
                        statusPill("bg-error-secondary text-fg-error-primary", <>Sync failed. Tap to retry</>, onRetrySync)
                    ) : (
                        statusPill(
                            "bg-success-secondary text-fg-success-primary",
                            <>
                                <CheckCircle className="size-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">
                                    {syncStatus === "syncing"
                                        ? "Syncing…"
                                        : lastSyncedAt
                                          ? `Synced ${formatHeaderTimestamp(lastSyncedAt)}`
                                          : "Saved"}
                                </span>
                            </>,
                        )
                    )
                ) : hasBackup && !backupStale ? (
                    <Link
                        to="/case/settings"
                        className="inline-flex max-w-[min(100vw-8rem,20rem)] items-center gap-1.5 rounded-full bg-success-secondary px-2.5 py-1 text-xs font-semibold text-fg-success-primary transition duration-100 ease-linear hover:opacity-90"
                    >
                        <CheckCircle className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">Backed up {formatHeaderTimestamp(file.meta.lastBackupAt!)}</span>
                    </Link>
                ) : (
                    <>
                        <span className="truncate text-xs font-medium text-fg-warning-primary">{unsavedLabel}</span>
                        <Dropdown.Root>
                            <Button
                                size="xs"
                                color="primary"
                                iconTrailing={ChevronDown}
                                className="group *:data-icon:size-3.5 *:data-icon:stroke-[2.25px]!"
                            >
                                Save
                            </Button>
                            <Dropdown.Popover className="w-52">
                                <Dropdown.Menu onAction={onSaveMenuAction}>
                                    {configured && !user && (
                                        <Dropdown.Item id="create-account" icon={UploadCloud02}>
                                            Create account
                                        </Dropdown.Item>
                                    )}
                                    {user && !dekUnlocked && (
                                        <Dropdown.Item id="sign-in" icon={LogIn01}>
                                            Unlock sync
                                        </Dropdown.Item>
                                    )}
                                    {(configured && !user) || (user && !dekUnlocked) ? <Dropdown.Separator /> : null}
                                    <Dropdown.Item id="backup" icon={Download01}>
                                        Download backup
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </>
                )}
            </div>

            <ModalOverlay isOpen={createOpen} onOpenChange={(open) => !open && closeCreateModal()} isDismissable={!recoveryKey}>
                <Modal className="max-w-md">
                    <Dialog className="w-full items-center justify-center outline-hidden">
                        <div className="w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                            {recoveryKey ? (
                                <>
                                    <h2 className="text-display-xs font-semibold text-primary">Save your recovery key</h2>
                                    <GuardrailBanner tone="warning" title="This is the only way to recover your account" className="my-4">
                                        If you forget your passphrase, this recovery key is the only way back in. We cannot reset it
                                        for you. Store it somewhere safe, separate from your passphrase.
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
                                    <Button color="primary" size="lg" className="mt-4 w-full" isDisabled={!savedRecovery} onClick={closeCreateModal}>
                                        Done
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-display-xs font-semibold text-primary">Create a sync account</h2>
                                    <p className="mt-2 text-sm text-tertiary">
                                        Use a personal email only. Your case is encrypted before it leaves this device. We only store
                                        ciphertext we cannot read.
                                    </p>
                                    <div className="mt-5 grid gap-4">
                                        <TextField label="Personal email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                        <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} placeholder="At least 8 characters" />
                                        <PasswordField label="Confirm passphrase" value={confirm} onChange={setConfirm} />
                                    </div>
                                    {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
                                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                        <Button color="secondary" size="md" className="w-full sm:w-auto" onClick={closeCreateModal}>
                                            Cancel
                                        </Button>
                                        <Button
                                            color="primary"
                                            size="md"
                                            iconLeading={UploadCloud02}
                                            className="w-full sm:w-auto"
                                            isLoading={busy}
                                            onClick={onCreateAccount}
                                        >
                                            Create account and save
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
};

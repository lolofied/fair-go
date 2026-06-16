import { useState } from "react";
import { Key01, RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PasswordField } from "@/case/components/fields";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

type Panel = "change" | null;

export const SyncAccountSecurity = () => {
    const { user, dekUnlocked, changePassphrase } = useSync();

    const [panel, setPanel] = useState<Panel>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [currentPassphrase, setCurrentPassphrase] = useState("");
    const [newPassphrase, setNewPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");

    if (!user || !dekUnlocked) return null;

    return (
        <div className="mt-6 border-t border-secondary pt-6">
            <h3 className="text-sm font-semibold text-primary">Passphrase and recovery</h3>
            <p className="mt-2 text-sm text-tertiary">
                Change your sync passphrase without re-encrypting your case. Your recovery key still works afterward.
            </p>

            {success && <p className="mt-3 text-sm text-success-primary">{success}</p>}
            {error && panel === null && <p className="mt-3 text-sm text-error-primary">{error}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    size="sm"
                    color={panel === "change" ? "primary" : "secondary"}
                    iconLeading={RefreshCw01}
                    onClick={() => {
                        setPanel(panel === "change" ? null : "change");
                        setError(null);
                        setSuccess(null);
                    }}
                >
                    Change passphrase
                </Button>
            </div>

            {panel === "change" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <PasswordField label="Current passphrase" value={currentPassphrase} onChange={setCurrentPassphrase} />
                    <PasswordField label="New passphrase" value={newPassphrase} onChange={setNewPassphrase} />
                    <PasswordField label="Confirm new passphrase" value={confirmPassphrase} onChange={setConfirmPassphrase} />
                    {error && <p className="sm:col-span-2 text-sm text-error-primary">{error}</p>}
                    <div className="sm:col-span-2">
                        <Button
                            size="md"
                            color="primary"
                            iconLeading={Key01}
                            isLoading={busy}
                            onClick={async () => {
                                setError(null);
                                setSuccess(null);
                                if (newPassphrase.length < 8) {
                                    setError("Use a passphrase of at least 8 characters.");
                                    return;
                                }
                                if (newPassphrase !== confirmPassphrase) {
                                    setError("The new passphrases don't match.");
                                    return;
                                }
                                setBusy(true);
                                try {
                                    await changePassphrase(user.email ?? "", currentPassphrase, newPassphrase);
                                    setSuccess("Passphrase updated. Use your new passphrase next time you unlock encryption.");
                                    setPanel(null);
                                    setCurrentPassphrase("");
                                    setNewPassphrase("");
                                    setConfirmPassphrase("");
                                } catch (e) {
                                    setError(
                                        e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Could not change passphrase.",
                                    );
                                } finally {
                                    setBusy(false);
                                }
                            }}
                        >
                            Update passphrase
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

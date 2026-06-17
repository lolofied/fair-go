import { useState } from "react";
import { Download01, Trash01 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { exportEncryptedBackup } from "@/case/backup";
import { SectionCard } from "@/components/layout/shell";
import { StandalonePageContent, StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { PrivacySecurityCard } from "@/case/components/privacy-security-card";
import { RecordingConsentWarning } from "@/case/components/recording-consent-warning";
import { ReplaceCaseOptionsCard } from "@/case/components/replace-case-options-card";
import { SyncSettingsCard } from "@/case/components/sync-settings-card";
import { useCase } from "@/case/store";
import { trackCaseBackupDownloaded, trackCaseErased } from "@/analytics/product-analytics";

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <SectionCard title={title}>{children}</SectionCard>
);

export const SettingsScreen = () => {
    const { file, markBackedUp, eraseEverything } = useCase();
    const navigate = useNavigate();

    const [pass, setPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [backupBusy, setBackupBusy] = useState(false);
    const [backupMsg, setBackupMsg] = useState<string | null>(null);

    const [confirmErase, setConfirmErase] = useState(false);

    if (!file) return null;

    const doBackup = async () => {
        setBackupMsg(null);
        if (pass.length < 8) {
            setBackupMsg("Use a passphrase of at least 8 characters.");
            return;
        }
        if (pass !== confirm) {
            setBackupMsg("The passphrases don't match.");
            return;
        }
        setBackupBusy(true);
        try {
            const { blob, filename } = await exportEncryptedBackup(file, pass);
            downloadBlob(blob, filename);
            markBackedUp();
            trackCaseBackupDownloaded();
            setPass("");
            setConfirm("");
            setBackupMsg("Backup downloaded. Keep it somewhere safe, along with your passphrase.");
        } finally {
            setBackupBusy(false);
        }
    };

    const doErase = async () => {
        trackCaseErased();
        await eraseEverything();
        navigate("/", { replace: true, state: { forceChecker: true } });
    };

    const lastBackup = file.meta.lastBackupAt ? new Date(file.meta.lastBackupAt).toLocaleString("en-AU") : "Never";

    return (
        <StandalonePageShell
            brandHref="/case"
            brandLabel="Back to case overview"
            backHref="/case"
            backLabel="Back to case"
        >
            <StandalonePageContent>
                <h1 className="text-display-sm font-semibold tracking-tight text-primary">Settings, backup and privacy</h1>
                <p className="mt-2 text-sm text-tertiary">
                    Save your case with a backup or encrypted sync account. Review privacy details, or erase everything on this
                    device.
                </p>

                <div className="mt-10 flex flex-col gap-6">
                    <SyncSettingsCard />

                    <Card title="Back up your case">
                        <p className="mb-4 text-sm text-tertiary">
                            The backup is encrypted on this device before it's saved. We never see it or your passphrase. If
                            you lose the passphrase, the backup cannot be recovered, so store it somewhere safe.
                        </p>
                        <p className="mb-4 text-sm text-tertiary">Last backup: {lastBackup}</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField label="Passphrase" value={pass} onChange={setPass} placeholder="At least 8 characters" />
                            <TextField label="Confirm passphrase" value={confirm} onChange={setConfirm} />
                        </div>
                        {backupMsg && <p className="mt-3 text-sm text-tertiary">{backupMsg}</p>}
                        <Button color="primary" size="md" iconLeading={Download01} className="mt-4" isLoading={backupBusy} onClick={doBackup}>
                            Download encrypted backup
                        </Button>
                    </Card>

                    <PrivacySecurityCard />

                    <RecordingConsentWarning />

                    <Card title="Erase everything">
                        <GuardrailBanner tone="warning" title="This permanently deletes your case from this device">
                            Your case profile, events, documents, and witnesses will be purged from this browser, files
                            included. This cannot be undone. Export a backup first if you might want it later.
                        </GuardrailBanner>
                        <label className="mt-4 flex items-center gap-2 text-sm text-secondary">
                            <input type="checkbox" checked={confirmErase} onChange={(e) => setConfirmErase(e.target.checked)} className="size-4 rounded border-primary" />
                            I understand this permanently deletes my case data.
                        </label>
                        <Button color="primary-destructive" size="md" iconLeading={Trash01} className="mt-4" isDisabled={!confirmErase} onClick={doErase}>
                            Erase all case data
                        </Button>
                    </Card>

                    <ReplaceCaseOptionsCard />
                </div>
            </StandalonePageContent>
        </StandalonePageShell>
    );
};

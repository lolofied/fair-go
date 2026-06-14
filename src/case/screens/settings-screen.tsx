import { useRef, useState } from "react";
import { Download01, Trash01, UploadCloud02 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { exportEncryptedBackup, readEncryptedBackup, restoreBackup } from "@/case/backup";
import { PageHeading } from "@/case/components/case-layout";
import { TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { RecordingConsentWarning } from "@/case/components/recording-consent-warning";
import { useCase } from "@/case/store";

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
    <section className="rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <div className="mt-4">{children}</div>
    </section>
);

export const SettingsScreen = () => {
    const { file, markBackedUp, replaceFile, eraseEverything } = useCase();
    const navigate = useNavigate();
    const restoreRef = useRef<HTMLInputElement>(null);

    const [pass, setPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [backupBusy, setBackupBusy] = useState(false);
    const [backupMsg, setBackupMsg] = useState<string | null>(null);

    const [restorePass, setRestorePass] = useState("");
    const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
    const [restoreErr, setRestoreErr] = useState<string | null>(null);

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
            setPass("");
            setConfirm("");
            setBackupMsg("Backup downloaded. Keep it somewhere safe, along with your passphrase.");
        } finally {
            setBackupBusy(false);
        }
    };

    const onRestoreFile = async (f: File) => {
        setRestoreMsg(null);
        setRestoreErr(null);
        if (!restorePass) {
            setRestoreErr("Enter the passphrase you used for this backup.");
            return;
        }
        try {
            const text = await f.text();
            const payload = await readEncryptedBackup(text, restorePass);
            const restored = await restoreBackup(payload);
            replaceFile(restored);
            setRestoreMsg("Backup restored. Your case has been loaded onto this device.");
            setRestorePass("");
        } catch (e) {
            setRestoreErr(e instanceof Error ? e.message : "Could not restore that backup.");
        } finally {
            if (restoreRef.current) restoreRef.current.value = "";
        }
    };

    const doErase = async () => {
        await eraseEverything();
        navigate("/");
    };

    const lastBackup = file.meta.lastBackupAt ? new Date(file.meta.lastBackupAt).toLocaleString("en-AU") : "Never";

    return (
        <div>
            <PageHeading title="Settings, backup and privacy" description="Your case is stored only on this device. Manage your encrypted backup, restore from one, check recording rules, or erase everything." />

            <div className="flex flex-col gap-6">
                <Card title="Back up your case">
                    <GuardrailBanner tone="info" title="Your backup is encrypted with your passphrase" className="mb-4">
                        The backup is encrypted on this device before it's saved. We never see it or your passphrase. If
                        you lose the passphrase, the backup cannot be recovered, so store it somewhere safe.
                    </GuardrailBanner>
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

                <Card title="Restore from a backup">
                    <p className="mb-4 text-sm text-tertiary">
                        Loading a backup replaces the case on this device. Enter the passphrase first, then choose your
                        backup file.
                    </p>
                    <div className="max-w-sm">
                        <TextField label="Passphrase" value={restorePass} onChange={setRestorePass} />
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
                    <Button color="secondary" size="md" iconLeading={UploadCloud02} className="mt-4" onClick={() => restoreRef.current?.click()}>
                        Choose backup file
                    </Button>
                    {restoreMsg && <p className="mt-3 text-sm text-success-primary">{restoreMsg}</p>}
                    {restoreErr && <p className="mt-3 text-sm text-error-primary">{restoreErr}</p>}
                </Card>

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
            </div>
        </div>
    );
};

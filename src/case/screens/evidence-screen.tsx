import { useRef, useState } from "react";
import { Eye, Plus, Trash01, UploadCloud02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PageHeading } from "@/case/components/case-layout";
import { DateField, SelectField, TextField } from "@/case/components/fields";
import { ExfiltrationGuardrail } from "@/case/components/guardrail";
import { getFile } from "@/case/storage";
import { useCase } from "@/case/store";
import { EVENT_TEMPLATES } from "@/case/templates";
import type { Evidence, EvidenceType } from "@/case/types";
import { cx } from "@/utils/cx";

const DOC_TYPES: { value: EvidenceType; label: string }[] = [
    { value: "contract", label: "Employment contract" },
    { value: "position_description", label: "Position description" },
    { value: "pip_letter", label: "PIP letter" },
    { value: "show_cause_letter", label: "Show-cause letter" },
    { value: "dismissal_letter", label: "Dismissal letter" },
    { value: "email", label: "Email" },
    { value: "payslip", label: "Payslip" },
    { value: "other", label: "Other" },
];

const DOC_LABELS = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d.label])) as Record<EvidenceType, string>;

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function viewFile(ref: string) {
    const blob = await getFile(ref);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

const DocRow = ({ doc }: { doc: Evidence }) => {
    const { file, updateDocument, deleteDocument } = useCase();
    const toggleEvent = (eventId: string) => {
        const next = doc.linkedEventIds.includes(eventId)
            ? doc.linkedEventIds.filter((x) => x !== eventId)
            : [...doc.linkedEventIds, eventId];
        updateDocument(doc.id, { linkedEventIds: next });
    };

    return (
        <div className="rounded-2xl border border-secondary bg-primary p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-primary">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-tertiary">
                        {DOC_LABELS[doc.docType]} · {doc.fileName} · {formatSize(doc.size)}
                        {doc.date ? ` · ${doc.date}` : ""}
                        {doc.source ? ` · from ${doc.source}` : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button color="secondary" size="sm" iconLeading={Eye} onClick={() => viewFile(doc.fileRef)}>
                        View
                    </Button>
                    <Button color="tertiary-destructive" size="sm" iconLeading={Trash01} aria-label="Delete document" onClick={() => deleteDocument(doc.id)} />
                </div>
            </div>

            {(file?.events.length ?? 0) > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-medium text-secondary">Link to events</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {file!.events.map((e) => {
                            const isOn = doc.linkedEventIds.includes(e.id);
                            return (
                                <button
                                    key={e.id}
                                    type="button"
                                    onClick={() => toggleEvent(e.id)}
                                    className={cx(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition duration-100 ease-linear",
                                        isOn ? "border-brand bg-brand-primary text-brand-secondary" : "border-secondary text-tertiary hover:bg-primary_hover",
                                    )}
                                >
                                    {e.title?.trim() || EVENT_TEMPLATES[e.type].label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const EvidenceScreen = () => {
    const { file, addDocument } = useCase();
    const inputRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [docType, setDocType] = useState<EvidenceType>("other");
    const [date, setDate] = useState("");
    const [source, setSource] = useState("");
    const [busy, setBusy] = useState(false);

    if (!file) return null;

    const reset = () => {
        setPending(null);
        setTitle("");
        setDocType("other");
        setDate("");
        setSource("");
        if (inputRef.current) inputRef.current.value = "";
    };

    const onSave = async () => {
        if (!pending) return;
        setBusy(true);
        try {
            await addDocument({ title: title || pending.name, docType, date: date || undefined, source: source || undefined }, pending);
            reset();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <PageHeading
                title="Evidence"
                description="Upload and tag the documents that matter: your contract, key letters, emails addressed to you, and payslips. Capture them now, while you still have access."
            />

            <ExfiltrationGuardrail className="mb-6" />

            <div className="mb-6 rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                <h2 className="text-md font-semibold text-primary">Add a document</h2>

                <div className="mt-4">
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.txt,.heic"
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setPending(f);
                            if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
                        }}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-secondary p-6 text-center transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
                    >
                        <UploadCloud02 className="size-6 text-fg-quaternary" aria-hidden="true" />
                        <span className="text-sm font-medium text-primary">{pending ? pending.name : "Choose a file"}</span>
                        <span className="text-xs text-tertiary">PDF, images, or documents. Stored only on this device.</span>
                    </button>
                </div>

                {pending && (
                    <>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <TextField label="Title" value={title} onChange={setTitle} />
                            <SelectField label="Type" value={docType} onChange={(v) => setDocType(v as EvidenceType)} options={DOC_TYPES} />
                            <DateField label="Date on the document" value={date} onChange={setDate} />
                            <TextField label="Source / who it came from" value={source} onChange={setSource} placeholder="e.g. HR, my manager" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button color="primary" size="md" iconLeading={Plus} isLoading={busy} onClick={onSave}>
                                Add document
                            </Button>
                            <Button color="tertiary" size="md" onClick={reset}>
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {file.documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-secondary p-10 text-center">
                    <p className="text-md font-medium text-primary">No documents yet</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-tertiary">
                        The things people most regret not saving: their contract, the dismissal or show-cause letter, and
                        key emails. Grab them while you can still access them.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {file.documents.map((doc) => (
                        <DocRow key={doc.id} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
};

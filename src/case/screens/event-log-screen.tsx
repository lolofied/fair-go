import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, File02, FileCheck02, Plus, Trash01 } from "@untitledui/icons";
import { Link } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { buildTimeline } from "@/case/chronology";
import { PageHeading } from "@/case/components/case-layout";
import { DateField, TemplateFieldInput, TextField } from "@/case/components/fields";
import { ExfiltrationGuardrail } from "@/case/components/guardrail";
import { useCase } from "@/case/store";
import { EVENT_TEMPLATES, EVENT_TEMPLATE_ORDER } from "@/case/templates";
import type { CaseEvent, Evidence } from "@/case/types";
import { cx } from "@/utils/cx";

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

function formatDate(iso?: string): string {
    if (!iso) return "No date";
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

const LinkChips = ({
    title,
    options,
    selected,
    onToggle,
    empty,
}: {
    title: string;
    options: { id: string; label: string }[];
    selected: string[];
    onToggle: (id: string) => void;
    empty: string;
}) => (
    <div>
        <p className="text-sm font-medium text-secondary">{title}</p>
        {options.length === 0 ? (
            <p className="mt-1.5 text-xs text-tertiary">{empty}</p>
        ) : (
            <div className="mt-2 flex flex-wrap gap-2">
                {options.map((o) => {
                    const isOn = selected.includes(o.id);
                    return (
                        <button
                            key={o.id}
                            type="button"
                            onClick={() => onToggle(o.id)}
                            className={cx(
                                "rounded-full border px-3 py-1 text-xs font-medium transition duration-100 ease-linear",
                                isOn ? "border-brand bg-brand-primary text-brand-secondary" : "border-secondary text-tertiary hover:bg-primary_hover",
                            )}
                        >
                            {o.label}
                        </button>
                    );
                })}
            </div>
        )}
    </div>
);

const DocumentTimelineRow = ({ document }: { document: Evidence }) => (
    <Link
        to="/case/evidence"
        className="group flex items-center gap-2 rounded-xl border border-secondary bg-secondary_subtle p-4 transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
    >
        <div className="flex-1">
            <p className="text-xs font-medium text-tertiary">{formatDate(document.date)}</p>
            <p className="text-sm font-semibold text-primary">{document.title}</p>
            <p className="text-xs text-tertiary">Document · view in Evidence</p>
        </div>
        <File02 className="size-4 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary" aria-hidden="true" />
    </Link>
);

const EventCard = ({ event, expanded, onToggle }: { event: CaseEvent; expanded: boolean; onToggle: () => void }) => {
    const { file, updateEvent, deleteEvent, moveEvent } = useCase();
    const template = EVENT_TEMPLATES[event.type];

    const setField = (fieldId: string, value: string) =>
        updateEvent(event.id, { fields: { ...event.fields, [fieldId]: value } });

    const toggleLink = (key: "linkedDocumentIds" | "linkedWitnessIds", id: string) => {
        const current = event[key];
        const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
        updateEvent(event.id, { [key]: next });
    };

    return (
        <div className="rounded-2xl border border-secondary bg-primary">
            <div className="flex items-center gap-2 p-4">
                <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
                    {expanded ? <ChevronDown className="size-5 text-fg-quaternary" /> : <ChevronRight className="size-5 text-fg-quaternary" />}
                    <span>
                        <span className="block text-sm font-semibold text-primary">{event.title?.trim() || template.label}</span>
                        <span className="block text-xs text-tertiary">{event.date ? formatDate(event.date) : "No date yet"}</span>
                    </span>
                </button>
                <Button color="tertiary" size="sm" iconLeading={ArrowUp} aria-label="Move earlier" onClick={() => moveEvent(event.id, "up")} />
                <Button color="tertiary" size="sm" iconLeading={ArrowDown} aria-label="Move later" onClick={() => moveEvent(event.id, "down")} />
                <Button color="tertiary-destructive" size="sm" iconLeading={Trash01} aria-label="Delete event" onClick={() => deleteEvent(event.id)} />
            </div>

            {expanded && (
                <div className="border-t border-secondary p-4 sm:p-5">
                    <p className="mb-4 text-sm text-tertiary">{template.summary}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Title (optional)" value={event.title ?? ""} onChange={(v) => updateEvent(event.id, { title: v })} placeholder={template.label} />
                        <DateField label="Date" value={event.date ?? ""} onChange={(v) => updateEvent(event.id, { date: v })} />
                        {template.fields.map((f) => (
                            <div key={f.id} className={f.kind === "textarea" ? "sm:col-span-2" : undefined}>
                                <TemplateFieldInput field={f} value={String(event.fields[f.id] ?? "")} onChange={(v) => setField(f.id, v)} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <LinkChips
                            title="Linked evidence"
                            options={(file?.documents ?? []).map((d) => ({ id: d.id, label: d.title }))}
                            selected={event.linkedDocumentIds}
                            onToggle={(id) => toggleLink("linkedDocumentIds", id)}
                            empty="Upload documents on the Evidence tab to link them here."
                        />
                        <LinkChips
                            title="Linked witnesses"
                            options={(file?.witnesses ?? []).map((w) => ({ id: w.id, label: w.name }))}
                            selected={event.linkedWitnessIds}
                            onToggle={(id) => toggleLink("linkedWitnessIds", id)}
                            empty="Add witnesses on the Witnesses tab to link them here."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export const EventLogScreen = () => {
    const { file, addEvent } = useCase();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [picking, setPicking] = useState(false);

    if (!file) return null;

    const items = buildTimeline(file);

    const add = (type: Parameters<typeof addEvent>[0]) => {
        const id = addEvent(type);
        setExpanded((prev) => new Set(prev).add(id));
        setPicking(false);
    };

    const toggle = (id: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <div>
            <PageHeading
                title="Event log"
                description="Record events and dated documents in chronological order. Reorder events to fix the sequence; undated items sit at the end."
                action={<Button color="primary" size="md" iconLeading={Plus} onClick={() => setPicking((p) => !p)}>Add event</Button>}
            />

            {picking && (
                <div className="mb-6 rounded-2xl border border-secondary bg-primary p-4 sm:p-5">
                    <p className="mb-3 text-sm font-medium text-secondary">What kind of event?</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {EVENT_TEMPLATE_ORDER.map((type) => {
                            const t = EVENT_TEMPLATES[type];
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => add(type)}
                                    className="rounded-xl border border-secondary p-4 text-left transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
                                >
                                    <span className="block text-sm font-semibold text-primary">{t.label}</span>
                                    <span className="mt-1 block text-xs text-tertiary">{t.summary}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <ExfiltrationGuardrail className="mb-6" />

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-secondary p-10 text-center">
                    <p className="text-md font-medium text-primary">Nothing in your chronology yet</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-tertiary">
                        Start with whatever is freshest in your memory, like a recent meeting or the dismissal itself. Uploaded
                        documents with dates will appear here too.
                    </p>
                    <Button color="primary" size="md" iconLeading={Plus} className="mt-4" onClick={() => setPicking(true)}>
                        Add your first event
                    </Button>
                </div>
            ) : (
                <ol className="relative flex flex-col gap-3 border-l border-secondary pl-6">
                    {items.map((item) => {
                        const isEvent = item.kind === "event";
                        const Icon = isEvent ? FileCheck02 : File02;
                        const key = isEvent ? item.event.id : item.document.id;

                        return (
                            <li key={key} className="relative">
                                <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full bg-brand-solid">
                                    <Icon className="size-3 text-white" aria-hidden="true" />
                                </span>
                                {isEvent ? (
                                    <EventCard event={item.event} expanded={expanded.has(item.event.id)} onToggle={() => toggle(item.event.id)} />
                                ) : (
                                    <DocumentTimelineRow document={item.document} />
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
};

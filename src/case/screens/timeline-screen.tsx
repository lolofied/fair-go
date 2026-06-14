import { ArrowDown, ArrowUp, File02, FileCheck02, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { buildTimeline } from "@/case/chronology";
import { PageHeading } from "@/case/components/case-layout";
import { useCase } from "@/case/store";
import { EVENT_TEMPLATES } from "@/case/templates";

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

function formatDate(iso?: string): string {
    if (!iso) return "No date";
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

export const TimelineScreen = () => {
    const { file, moveEvent } = useCase();
    if (!file) return null;
    const items = buildTimeline(file);

    return (
        <div>
            <PageHeading
                title="Timeline"
                description="Your events and documents in one chronological view. This is the backbone of your statement of facts. Reorder events to correct the sequence; undated items sit at the end."
                action={<Button color="secondary" size="md" href="/case/events" iconLeading={Plus}>Add event</Button>}
            />

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-secondary p-10 text-center">
                    <p className="text-md font-medium text-primary">Nothing on the timeline yet</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-tertiary">
                        Add events and upload documents, and they'll appear here in order.
                    </p>
                </div>
            ) : (
                <ol className="relative flex flex-col gap-3 border-l border-secondary pl-6">
                    {items.map((item) => {
                        const isEvent = item.kind === "event";
                        const Icon = isEvent ? FileCheck02 : File02;
                        const label = isEvent
                            ? item.event.title?.trim() || EVENT_TEMPLATES[item.event.type].label
                            : item.document.title;
                        return (
                            <li key={isEvent ? item.event.id : item.document.id} className="relative">
                                <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full bg-brand-solid">
                                    <Icon className="size-3 text-white" aria-hidden="true" />
                                </span>
                                <div className="flex items-center gap-2 rounded-xl border border-secondary bg-primary p-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-tertiary">{formatDate(item.date)}</p>
                                        <p className="text-sm font-semibold text-primary">{label}</p>
                                        <p className="text-xs text-tertiary">{isEvent ? "Event" : "Document"}</p>
                                    </div>
                                    {isEvent && (
                                        <div className="flex items-center gap-1">
                                            <Button color="tertiary" size="sm" iconLeading={ArrowUp} aria-label="Move earlier" onClick={() => moveEvent(item.event.id, "up")} />
                                            <Button color="tertiary" size="sm" iconLeading={ArrowDown} aria-label="Move later" onClick={() => moveEvent(item.event.id, "down")} />
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
};

/**
 * Merged chronology of events and documents. This is the backbone of the
 * event log, the export's statement of facts, and the GP temporal-connection
 * analysis, so it lives on its own and is unit-tested.
 *
 * Sort order: dated items ascending by date; ties broken by manual `order` then
 * creation time; undated items sink to the end (they still need a date, which the
 * gap analysis nags about).
 */

import type { CaseEvent, CaseFile, Evidence } from "@/case/types";

export type TimelineItem =
    | { kind: "event"; date?: string; sortKey: number; order: number; createdAt: string; event: CaseEvent }
    | { kind: "document"; date?: string; sortKey: number; order: number; createdAt: string; document: Evidence };

const UNDATED = Number.POSITIVE_INFINITY;

function dateToSortKey(date?: string): number {
    if (!date) return UNDATED;
    const t = new Date(date + "T00:00:00").getTime();
    return Number.isNaN(t) ? UNDATED : t;
}

export function buildTimeline(file: Pick<CaseFile, "events" | "documents">): TimelineItem[] {
    const items: TimelineItem[] = [
        ...file.events.map(
            (event): TimelineItem => ({
                kind: "event",
                date: event.date,
                sortKey: dateToSortKey(event.date),
                order: event.order ?? 0,
                createdAt: event.createdAt,
                event,
            }),
        ),
        ...file.documents.map(
            (document): TimelineItem => ({
                kind: "document",
                date: document.date,
                sortKey: dateToSortKey(document.date),
                order: 0,
                createdAt: document.createdAt,
                document,
            }),
        ),
    ];

    return items.sort((a, b) => {
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        if (a.order !== b.order) return a.order - b.order;
        return a.createdAt.localeCompare(b.createdAt);
    });
}

/** Events only, in chronological order (for the statement of facts). */
export function orderedEvents(file: Pick<CaseFile, "events">): CaseEvent[] {
    return buildTimeline({ events: file.events, documents: [] })
        .filter((i): i is Extract<TimelineItem, { kind: "event" }> => i.kind === "event")
        .map((i) => i.event);
}

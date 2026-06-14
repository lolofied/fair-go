/**
 * Plain-English, third-person statement of facts for the export.
 *
 * Each recorded event becomes a neutral paragraph in chronological order, with
 * inline exhibit references to linked annexures. This is a factual narrative of
 * the user's own account, never an argument about merits.
 */

import { orderedEvents } from "@/case/chronology";
import type { CaseEvent, CaseFile } from "@/case/types";

export interface StatementParagraph {
    eventId: string;
    text: string;
}

const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" });

function formatDate(iso?: string): string | null {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

function str(v: unknown): string {
    return typeof v === "string" ? v.trim() : "";
}

function yn(v: unknown): "yes" | "no" | "unsure" | null {
    return v === "yes" || v === "no" || v === "unsure" ? v : null;
}

function subjectFor(file: CaseFile): string {
    const name = file.profile.employee.name?.trim();
    return name && name.length > 0 ? name : "The applicant";
}

function refsFor(event: CaseEvent, letters: Map<string, string>): string {
    const tags = event.linkedDocumentIds.map((id) => letters.get(id)).filter((l): l is string => Boolean(l));
    if (tags.length === 0) return "";
    const list = tags.length === 1 ? `Annexure ${tags[0]}` : `Annexures ${tags.join(", ")}`;
    return ` (see ${list})`;
}

function sentenceFor(file: CaseFile, event: CaseEvent): string {
    const subject = subjectFor(file);
    const when = formatDate(event.date);
    const lead = when ? `On ${when}, ` : "";
    const f = event.fields;

    switch (event.type) {
        case "performance_meeting": {
            const who = str(f.attendees);
            const concerns = str(f.concerns);
            let s = `${lead}${subject} attended a performance discussion${who ? ` with ${who}` : ""}.`;
            if (concerns) s += ` The concerns raised were: ${concerns}.`;
            if (yn(f.able_to_respond) === "no") s += ` ${subject} was not given a chance to respond.`;
            return s;
        }
        case "pip_issued": {
            const by = str(f.issued_by);
            let s = `${lead}${subject} was placed on a performance improvement plan${by ? ` issued by ${by}` : ""}.`;
            if (yn(f.in_writing) === "no") s += " The plan was not provided in writing.";
            if (yn(f.targets_measurable) === "no") s += " The targets were not specific or measurable.";
            if (str(f.timeframe)) s += ` The timeframe was ${str(f.timeframe)}.`;
            return s;
        }
        case "show_cause": {
            let s = `${lead}${subject} attended a show-cause or disciplinary meeting.`;
            if (yn(f.advance_notice) === "no") s += " Limited advance notice was given.";
            if (yn(f.genuine_chance) === "no") s += ` ${subject} was not given a genuine chance to respond before the decision.`;
            if (yn(f.support_person_allowed) === "no") s += " A support person was not allowed.";
            if (str(f.outcome)) s += ` The outcome was: ${str(f.outcome)}.`;
            return s;
        }
        case "dismissal_meeting": {
            const who = str(f.attendees);
            let s = `${lead}${subject} was dismissed${who ? ` in a meeting with ${who}` : ""}.`;
            if (f.reason_given === "none") s += " No reason was given.";
            else if (str(f.reason_detail)) s += ` The reason given was: ${str(f.reason_detail)}.`;
            if (yn(f.able_to_respond) === "no") s += ` ${subject} was not given an opportunity to respond.`;
            if (yn(f.support_person_allowed) === "no") s += " A support person was not allowed.";
            return s;
        }
        case "incident": {
            const what = str(f.what_happened);
            const who = str(f.who_involved);
            let s = `${lead}an incident occurred${who ? ` involving ${who}` : ""}.`;
            if (what) s += ` ${what}.`;
            if (str(f.verbatim)) s += ` It was said: "${str(f.verbatim)}".`;
            if (str(f.reported_to)) s += ` ${subject} reported it to ${str(f.reported_to)}.`;
            return s;
        }
        case "workplace_right": {
            const what = str(f.description);
            const to = str(f.recipient);
            let s = `${lead}${subject} exercised a workplace right${to ? ` by raising it with ${to}` : ""}.`;
            if (what) s += ` ${subject} states: ${what}.`;
            if (yn(f.decision_maker_aware) === "yes") s += " The decision-maker was aware of it.";
            return s;
        }
        case "adverse_action": {
            const action = str(f.action);
            const by = str(f.decision_maker);
            let s = `${lead}adverse action was taken against ${subject}${by ? ` by ${by}` : ""}.`;
            if (action) s += ` ${action}.`;
            if (str(f.stated_reason)) s += ` The stated reason was: ${str(f.stated_reason)}.`;
            return s;
        }
        case "protected_attribute": {
            const attr = str(f.attribute);
            let s = `${lead}${subject} believes ${attr || "a protected attribute"} was a factor in their treatment.`;
            if (str(f.what_was_said)) s += ` ${str(f.what_was_said)}.`;
            return s;
        }
        default:
            return `${lead}an event was recorded.`;
    }
}

export function buildStatement(file: CaseFile, annexureLetters: Map<string, string>): StatementParagraph[] {
    return orderedEvents(file).map((event) => ({
        eventId: event.id,
        text: sentenceFor(file, event) + refsFor(event, annexureLetters),
    }));
}

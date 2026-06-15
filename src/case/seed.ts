/**
 * Zero re-entry: build a fresh case file from what the checker already collected.
 *
 * The checker's `CapturedData` becomes the editable profile, and the structured
 * workplace-right / protected-attribute facts it captured are seeded as events so
 * they appear in the timeline and feed the gap analysis straight away.
 */

import { toCapturedData } from "@/checker/claims";
import type { CheckerAnswers } from "@/checker/types";
import { EVENT_TEMPLATES } from "@/case/templates";
import { CASE_SCHEMA_VERSION, type CaseEvent, type CaseFile } from "@/case/types";

export function newId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
    return new Date().toISOString();
}

function isBlank(value: unknown): boolean {
    return value === undefined || value === null || value === "";
}

/** Fill empty profile fields from checker data without overwriting user edits. */
function mergeProfileSection<T extends Record<string, unknown>>(existing: T, fresh: T): T {
    const out = { ...existing };
    for (const key of Object.keys(fresh) as (keyof T)[]) {
        const next = fresh[key];
        if (next === undefined) continue;
        if (isBlank(existing[key])) {
            out[key] = next;
        }
    }
    return out;
}

function eventKey(event: CaseEvent): string {
    return `${event.type}:${JSON.stringify(event.fields)}`;
}

function mergeSeedEvents(existing: CaseEvent[], seeded: CaseEvent[]): CaseEvent[] {
    const seen = new Set(existing.map(eventKey));
    const added = seeded.filter((event) => {
        const key = eventKey(event);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return added.length > 0 ? [...existing, ...added] : existing;
}

export function emptyCaseFile(): CaseFile {
    const ts = now();
    return {
        profile: {
            employee: { award_or_eba: "unsure" },
            employer: {},
            dismissal: { redundancy_claimed: false, days_remaining: null },
            candidateClaims: [],
            flags: [],
        },
        events: [],
        documents: [],
        witnesses: [],
        meta: { createdAt: ts, updatedAt: ts, schemaVersion: CASE_SCHEMA_VERSION, seededFromChecker: false },
    };
}

/** Seed events from the checker's structured GP facts. */
function seedEventsFromChecker(answers: CheckerAnswers): CaseEvent[] {
    const captured = toCapturedData(answers);
    const ts = now();
    const events: CaseEvent[] = [];

    for (const right of captured.workplace_rights) {
        events.push({
            id: newId(),
            type: "workplace_right",
            date: right.date,
            fields: {
                kind: right.kind,
                description: right.description,
                recipient: right.recipient ?? "",
                form: right.form ?? "",
                decision_maker_aware: right.decisionMakerAware,
            },
            elementTags: EVENT_TEMPLATES.workplace_right.elementTags,
            linkedDocumentIds: [],
            linkedWitnessIds: [],
            createdAt: ts,
            updatedAt: ts,
        });
    }

    for (const attr of captured.protected_attributes) {
        events.push({
            id: newId(),
            type: "protected_attribute",
            fields: {
                attribute: attr.attribute,
                decision_maker_knew: attr.decisionMakerKnew,
            },
            elementTags: EVENT_TEMPLATES.protected_attribute.elementTags,
            linkedDocumentIds: [],
            linkedWitnessIds: [],
            createdAt: ts,
            updatedAt: ts,
        });
    }

    return events;
}

export function seedCaseFromChecker(answers: CheckerAnswers): CaseFile {
    const captured = toCapturedData(answers);
    const ts = now();
    return {
        profile: {
            employee: captured.employee,
            employer: captured.employer,
            dismissal: captured.dismissal,
            candidateClaims: captured.candidate_claims,
            flags: captured.flags,
        },
        events: seedEventsFromChecker(answers),
        documents: [],
        witnesses: [],
        meta: { createdAt: ts, updatedAt: ts, schemaVersion: CASE_SCHEMA_VERSION, seededFromChecker: true },
    };
}

/**
 * Sync checker answers into an existing case file: fill gaps in the profile,
 * refresh derived claims/flags, and append any missing seeded GP events.
 */
export function mergeCheckerIntoCase(existing: CaseFile, answers: CheckerAnswers): CaseFile {
    const fresh = seedCaseFromChecker(answers);
    return {
        ...existing,
        profile: {
            desiredOutcome: existing.profile.desiredOutcome,
            employee: mergeProfileSection(existing.profile.employee, fresh.profile.employee),
            employer: mergeProfileSection(existing.profile.employer, fresh.profile.employer),
            dismissal: {
                ...mergeProfileSection(existing.profile.dismissal, fresh.profile.dismissal),
                days_remaining: fresh.profile.dismissal.days_remaining,
                redundancy_claimed: fresh.profile.dismissal.redundancy_claimed,
            },
            candidateClaims: fresh.profile.candidateClaims,
            flags: fresh.profile.flags,
        },
        events: mergeSeedEvents(existing.events, fresh.events),
        meta: { ...existing.meta, seededFromChecker: true },
    };
}

/**
 * Deterministic progress for each documentation area. Used on the overview
 * dashboard: prompts and counts only, never a merits assessment.
 */

import { analyseGaps } from "@/case/gap-analysis";
import type { CaseFile } from "@/case/types";

export type DocProgressStatus = "not_started" | "in_progress" | "complete";

export interface DocSectionProgress {
    id: string;
    label: string;
    description: string;
    href: string;
    status: DocProgressStatus;
    detail: string;
}

export interface DocumentationProgress {
    sections: DocSectionProgress[];
    completedCount: number;
    totalCount: number;
    percentComplete: number;
    nextSection: DocSectionProgress | null;
}

function isFilled(value: unknown): boolean {
    return value !== undefined && value !== null && value !== "";
}

const PROFILE_FIELDS: Array<(file: CaseFile) => unknown> = [
    (f) => f.profile.employee.name,
    (f) => f.profile.employee.role,
    (f) => f.profile.employee.employee_status,
    (f) => f.profile.employee.employment_type,
    (f) => f.profile.employee.start_date,
    (f) => f.profile.employee.end_date,
    (f) => f.profile.employer.legal_name,
    (f) => f.profile.employer.abn,
    (f) => f.profile.employer.size_bucket,
    (f) => f.profile.dismissal.kind,
    (f) => f.profile.dismissal.effective_date,
    (f) => f.profile.dismissal.reason_category,
    (f) => f.profile.desiredOutcome,
];

function profileProgress(file: CaseFile): Pick<DocSectionProgress, "status" | "detail"> {
    const filled = PROFILE_FIELDS.filter((get) => isFilled(get(file))).length;
    const total = PROFILE_FIELDS.length;

    if (filled === 0) {
        return { status: "not_started", detail: "Review the facts carried over from your check" };
    }
    if (filled >= Math.ceil(total * 0.75)) {
        return { status: "complete", detail: `${filled} of ${total} profile fields filled` };
    }
    return { status: "in_progress", detail: `${filled} of ${total} profile fields filled` };
}

function eventsProgress(file: CaseFile): Pick<DocSectionProgress, "status" | "detail"> {
    const count = file.events.length;
    if (count === 0) return { status: "not_started", detail: "No events recorded yet" };
    if (count >= 3) return { status: "complete", detail: `${count} events on your record` };
    return { status: "in_progress", detail: `${count} event${count === 1 ? "" : "s"} recorded` };
}

function evidenceProgress(file: CaseFile): Pick<DocSectionProgress, "status" | "detail"> {
    const count = file.documents.length;
    if (count === 0) return { status: "not_started", detail: "No documents uploaded" };
    const linked = file.documents.filter((d) => d.linkedEventIds.length > 0).length;
    if (count >= 2 && linked >= 1) {
        return { status: "complete", detail: `${count} documents, ${linked} linked to events` };
    }
    return { status: "in_progress", detail: `${count} document${count === 1 ? "" : "s"} uploaded` };
}

function witnessesProgress(file: CaseFile): Pick<DocSectionProgress, "status" | "detail"> {
    const count = file.witnesses.length;
    if (count === 0) return { status: "not_started", detail: "No witnesses added yet" };
    const detailed = file.witnesses.filter((w) => w.name.trim() && (w.whatTheyWitnessed?.trim() || w.personalContact?.trim())).length;
    if (detailed >= 1) {
        return { status: "complete", detail: `${count} witness${count === 1 ? "" : "es"} with details` };
    }
    return { status: "in_progress", detail: `${count} witness${count === 1 ? "" : "es"} added` };
}

function exportProgress(file: CaseFile): Pick<DocSectionProgress, "status" | "detail"> {
    const report = analyseGaps(file);
    const openGaps = report.byClaim.reduce((sum, c) => sum + c.gaps.length, 0);
    const contextual = report.contextual.length;
    const itemsToCheck = openGaps + contextual;
    const hasContent =
        file.events.length > 0 ||
        file.documents.length > 0 ||
        PROFILE_FIELDS.filter((get) => isFilled(get(file))).length >= 4;

    if (!hasContent) {
        return { status: "not_started", detail: "Build your record first, then export for a lawyer" };
    }

    if (report.byClaim.length > 0 && itemsToCheck === 0) {
        return { status: "complete", detail: "No findings. Ready to save as PDF" };
    }

    if (itemsToCheck > 0) {
        const label = itemsToCheck === 1 ? "1 finding" : `${itemsToCheck} findings`;
        return { status: "in_progress", detail: `${label} to review` };
    }

    return { status: "in_progress", detail: "Review your export and save a PDF" };
}

export function computeDocumentationProgress(file: CaseFile): DocumentationProgress {
    const sections: DocSectionProgress[] = [
        {
            id: "profile",
            label: "Case profile",
            description: "Your employment facts, employer details, and what you want to achieve",
            href: "/case/profile",
            ...profileProgress(file),
        },
        {
            id: "events",
            label: "Event log",
            description: "Structured record of what happened and when",
            href: "/case/events",
            ...eventsProgress(file),
        },
        {
            id: "evidence",
            label: "Evidence",
            description: "Documents tagged and linked to your events",
            href: "/case/evidence",
            ...evidenceProgress(file),
        },
        {
            id: "witnesses",
            label: "Witnesses",
            description: "People who saw key moments",
            href: "/case/witnesses",
            ...witnessesProgress(file),
        },
        {
            id: "export",
            label: "Export for a lawyer",
            description: "Review findings, then save your PDF package",
            href: "/case/export",
            ...exportProgress(file),
        },
    ];

    const completedCount = sections.filter((s) => s.status === "complete").length;
    const totalCount = sections.length;
    const percentComplete = Math.round((completedCount / totalCount) * 100);

    const nextSection =
        sections.find((s) => s.status === "in_progress") ??
        sections.find((s) => s.status === "not_started") ??
        null;

    return { sections, completedCount, totalCount, percentComplete, nextSection };
}

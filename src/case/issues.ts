/**
 * Issues flagged for lawyer review.
 *
 * Deterministic reasoning over the recorded events and the candidate claims to
 * surface things a lawyer would want to look at: procedural defects, possible
 * workplace rights, possible protected attributes, and the s.725 election note.
 *
 * SAFETY: these are FLAGS, never conclusions. We never say a claim is strong,
 * weak, or worth a dollar figure. We point; the lawyer decides.
 */

import { electionRequired } from "@/checker/claims";
import { EVENT_TEMPLATES } from "@/case/templates";
import type { CaseEvent, CaseFile } from "@/case/types";

export interface LawyerIssue {
    id: string;
    title: string;
    detail: string;
}

function ynNo(v: unknown): boolean {
    return v === "no";
}

function eventLabel(event: CaseEvent): string {
    return event.title?.trim() || EVENT_TEMPLATES[event.type].label;
}

export function flagIssues(file: CaseFile): LawyerIssue[] {
    const issues = new Map<string, LawyerIssue>();
    const add = (id: string, title: string, detail: string) => {
        if (!issues.has(id)) issues.set(id, { id, title, detail });
    };

    for (const e of file.events) {
        const where = `Recorded under "${eventLabel(e)}"${e.date ? ` (${e.date})` : ""}.`;

        if (e.type === "dismissal_meeting") {
            if (e.fields.reason_given === "none") add("ud_no_reason", "No reason given for dismissal", where);
            if (ynNo(e.fields.able_to_respond))
                add("ud_no_response_dismissal", "No opportunity to respond at the dismissal meeting", where);
            if (ynNo(e.fields.support_person_allowed))
                add("ud_no_support_dismissal", "Support person not allowed at the dismissal meeting", where);
        }

        if (e.type === "show_cause") {
            if (ynNo(e.fields.advance_notice)) add("ud_no_notice", "Limited advance notice before the disciplinary meeting", where);
            if (ynNo(e.fields.genuine_chance))
                add("ud_no_genuine_chance", "Possible lack of a genuine chance to respond before the decision", where);
            if (e.fields.decision_premade === "yes")
                add("ud_premade", "Indication the decision may have been pre-made", where);
            if (ynNo(e.fields.support_person_allowed))
                add("ud_no_support_showcause", "Support person not allowed at the disciplinary meeting", where);
        }

        if (e.type === "pip_issued") {
            if (ynNo(e.fields.targets_measurable))
                add("ud_pip_vague", "PIP targets may not have been specific or measurable", where);
            if (ynNo(e.fields.realistic)) add("ud_pip_unrealistic", "PIP targets may not have been realistic", where);
            if (ynNo(e.fields.in_writing)) add("ud_pip_unwritten", "PIP may not have been put in writing", where);
        }

        if (e.type === "performance_meeting" && ynNo(e.fields.able_to_respond)) {
            add("ud_no_response_perf", "Possible lack of opportunity to respond to performance concerns", where);
        }

        if (e.type === "workplace_right") {
            const what = String(e.fields.description ?? "a workplace right").trim() || "a workplace right";
            add("gp_right", "Possible workplace right exercised", `${what}. ${where}`);
            if (e.fields.decision_maker_aware !== "yes")
                add(
                    "gp_knowledge",
                    "Decision-maker's knowledge needs to be established",
                    "The reverse onus turns on whether the decision-maker knew about the protected act or attribute.",
                );
        }

        if (e.type === "protected_attribute") {
            const attr = String(e.fields.attribute ?? "a protected attribute").trim() || "a protected attribute";
            add("gp_attribute", "Possible protected attribute said to be a factor", `${attr}. ${where}`);
            if (e.fields.decision_maker_knew !== "yes")
                add(
                    "gp_knowledge",
                    "Decision-maker's knowledge needs to be established",
                    "The reverse onus turns on whether the decision-maker knew about the protected act or attribute.",
                );
        }
    }

    // Temporal connection: a protected act and an adverse action both recorded.
    const hasProtectedAct = file.events.some((e) => e.type === "workplace_right" || e.type === "protected_attribute");
    const hasAdverseAction = file.events.some(
        (e) => e.type === "adverse_action" || e.type === "dismissal_meeting",
    );
    if (hasProtectedAct && hasAdverseAction) {
        add(
            "gp_temporal",
            "Consider the timing between the protected act and the action",
            "Both a protected act and an adverse action are recorded. The closeness in time can matter; confirm the exact dates.",
        );
    }

    // s.725 election: two or more dismissal-based claims viable.
    if (electionRequired(file.profile.candidateClaims)) {
        add(
            "election_s725",
            "More than one dismissal claim may be available (s.725 election)",
            "Unfair dismissal and general protections are usually alternative paths for the same dismissal, and generally cannot both be pursued. Which to choose is a legal decision for the client and their lawyer. Do not lodge both.",
        );
    }

    return [...issues.values()];
}

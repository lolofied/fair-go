/**
 * Event templates and the claim-element taxonomy.
 *
 * Templates are the differentiator over a notes app: each event type asks the
 * questions that map to specific claim elements. Field answers are stored on
 * `CaseEvent.fields` keyed by field id; `elementTags` records which elements the
 * event speaks to so gap analysis and the export can reason over them.
 *
 * Non-advice rule: fields gather facts and flag gaps. They never conclude.
 */

import type { CaseEventType, ClaimElement, ClaimElementMeta } from "@/case/types";

/* --------------------------- claim element metadata ------------------------- */

export const CLAIM_ELEMENTS: Record<ClaimElement, ClaimElementMeta> = {
    ud_valid_reason: {
        element: "ud_valid_reason",
        claimType: "unfair_dismissal",
        label: "A valid reason",
        description: "Whether there was a sound, defensible reason for the dismissal related to capacity or conduct.",
        provedBy: "Performance records, the dismissal letter, and your account of the reason given.",
    },
    ud_notified_of_reason: {
        element: "ud_notified_of_reason",
        claimType: "unfair_dismissal",
        label: "Notified of the reason",
        description: "Whether you were told the reason for dismissal before the decision was made.",
        provedBy: "Show-cause letters, meeting notes, and emails setting out the allegations.",
    },
    ud_opportunity_to_respond: {
        element: "ud_opportunity_to_respond",
        claimType: "unfair_dismissal",
        label: "A chance to respond",
        description: "Whether you had a genuine opportunity to respond to the reason before the decision.",
        provedBy: "Meeting invitations, your written response, and notes showing you were heard.",
    },
    ud_support_person: {
        element: "ud_support_person",
        claimType: "unfair_dismissal",
        label: "Support person allowed",
        description: "Whether you were allowed a support person in discussions about the dismissal.",
        provedBy: "Meeting invitations and notes recording who was present.",
    },
    ud_prior_warnings: {
        element: "ud_prior_warnings",
        claimType: "unfair_dismissal",
        label: "Prior warnings (performance)",
        description: "For performance dismissals, whether you were warned and given a chance to improve.",
        provedBy: "Warning letters, PIP documents, and performance review records.",
    },
    ud_process_consistency: {
        element: "ud_process_consistency",
        claimType: "unfair_dismissal",
        label: "A fair, consistent process",
        description: "Whether the process was procedurally fair and consistent with how others were treated.",
        provedBy: "Policies followed or skipped, timelines, and comparisons to how peers were treated.",
    },
    gp_workplace_right: {
        element: "gp_workplace_right",
        claimType: "general_protections_dismissal",
        label: "A workplace right exercised",
        description: "A complaint, inquiry, entitlement, or leave that is a workplace right under the Act.",
        provedBy: "The email or letter where you raised it, and who you raised it with.",
    },
    gp_adverse_action: {
        element: "gp_adverse_action",
        claimType: "general_protections_dismissal",
        label: "Adverse action taken",
        description: "Action taken against you, such as dismissal, demotion, or other detriment.",
        provedBy: "The decision letter, change to your role or pay, and timing of the action.",
    },
    gp_protected_attribute: {
        element: "gp_protected_attribute",
        claimType: "general_protections_dismissal",
        label: "A protected attribute",
        description: "An attribute under s.351 (such as age, sex, disability, or carer's responsibilities) you believe was a factor.",
        provedBy: "What was said or written that connects the attribute to the treatment.",
    },
    gp_decision_maker_knowledge: {
        element: "gp_decision_maker_knowledge",
        claimType: "general_protections_dismissal",
        label: "Decision-maker's knowledge",
        description: "Whether the person who made the decision knew about the right or attribute. The reverse onus turns on this.",
        provedBy: "Who you told, who decided, and any evidence the two are connected.",
    },
    gp_temporal_connection: {
        element: "gp_temporal_connection",
        claimType: "general_protections_dismissal",
        label: "Timing (temporal connection)",
        description: "How close in time the protected act and the adverse action were.",
        provedBy: "Exact dates of what you did and when the action was taken.",
    },
};

/* ------------------------------ template fields ----------------------------- */

export type FieldKind = "text" | "textarea" | "date" | "yesno" | "select";

export interface TemplateField {
    id: string;
    label: string;
    kind: FieldKind;
    /** Optional helper text shown under the field. */
    help?: string;
    /** Options for `select` fields. */
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface EventTemplate {
    type: CaseEventType;
    label: string;
    /** One-line description shown when picking an event type. */
    summary: string;
    /** Claim elements every event of this type speaks to. */
    elementTags: ClaimElement[];
    fields: TemplateField[];
}

const yesNoUnsure: TemplateField["options"] = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "unsure", label: "Not sure" },
];

export const EVENT_TEMPLATES: Record<CaseEventType, EventTemplate> = {
    performance_meeting: {
        type: "performance_meeting",
        label: "Performance meeting / 1:1",
        summary: "A meeting or one-on-one where performance, targets, or concerns were raised.",
        elementTags: ["ud_valid_reason", "ud_prior_warnings", "ud_opportunity_to_respond", "ud_process_consistency"],
        fields: [
            { id: "attendees", label: "Who was present?", kind: "text", placeholder: "e.g. you, your manager, HR" },
            { id: "concerns", label: "What concerns or targets were raised?", kind: "textarea" },
            { id: "specific", label: "Were the concerns specific and clear?", kind: "yesno", options: yesNoUnsure },
            { id: "compared_to_peers", label: "Were you compared to peers or held to a different standard?", kind: "textarea" },
            { id: "support_offered", label: "Was any support or training offered?", kind: "textarea" },
            { id: "tone", label: "What was the tone of the meeting?", kind: "text" },
            { id: "documented", label: "Was the meeting documented (minutes, email follow-up)?", kind: "yesno", options: yesNoUnsure },
            { id: "able_to_respond", label: "Did you get to respond?", kind: "yesno", options: yesNoUnsure },
        ],
    },
    pip_issued: {
        type: "pip_issued",
        label: "PIP issued",
        summary: "A performance improvement plan was put in place.",
        elementTags: ["ud_prior_warnings", "ud_valid_reason", "ud_opportunity_to_respond", "ud_process_consistency"],
        fields: [
            { id: "issued_by", label: "Who issued it?", kind: "text" },
            { id: "in_writing", label: "Was it in writing?", kind: "yesno", options: yesNoUnsure },
            { id: "targets_measurable", label: "Were the targets specific and measurable?", kind: "yesno", options: yesNoUnsure },
            { id: "realistic", label: "Were the targets realistic for the role and timeframe?", kind: "yesno", options: yesNoUnsure },
            { id: "timeframe", label: "What was the timeframe?", kind: "text", placeholder: "e.g. 4 weeks" },
            { id: "support_provided", label: "What resources or support were provided?", kind: "textarea" },
            { id: "consistent_prior", label: "Was it consistent with prior feedback?", kind: "yesno", options: yesNoUnsure },
            { id: "able_to_comment", label: "Did you get to comment on the plan?", kind: "yesno", options: yesNoUnsure },
        ],
    },
    show_cause: {
        type: "show_cause",
        label: "Show-cause / disciplinary meeting",
        summary: "You were asked to show cause or attend a disciplinary meeting.",
        elementTags: [
            "ud_notified_of_reason",
            "ud_opportunity_to_respond",
            "ud_support_person",
            "ud_process_consistency",
        ],
        fields: [
            { id: "advance_notice", label: "Were you given advance notice?", kind: "yesno", options: yesNoUnsure },
            { id: "allegations_specific", label: "Were the allegations specific and in writing?", kind: "yesno", options: yesNoUnsure },
            { id: "support_person_allowed", label: "Were you allowed a support person?", kind: "yesno", options: yesNoUnsure },
            { id: "genuine_chance", label: "Did you have a genuine chance to respond before the decision?", kind: "yesno", options: yesNoUnsure },
            { id: "decision_premade", label: "Did the decision feel pre-made?", kind: "yesno", options: yesNoUnsure },
            { id: "attendees", label: "Who was present?", kind: "text" },
            { id: "outcome", label: "What was the outcome?", kind: "textarea" },
        ],
    },
    dismissal_meeting: {
        type: "dismissal_meeting",
        label: "Dismissal meeting",
        summary: "The meeting or moment where you were dismissed.",
        elementTags: ["ud_notified_of_reason", "ud_opportunity_to_respond", "ud_support_person", "gp_adverse_action"],
        fields: [
            { id: "attendees", label: "Who was present?", kind: "text" },
            {
                id: "reason_given",
                label: "How was the reason given?",
                kind: "select",
                options: [
                    { value: "written", label: "In writing" },
                    { value: "verbal", label: "Verbally" },
                    { value: "none", label: "No reason given" },
                ],
            },
            { id: "reason_detail", label: "What reason were you given?", kind: "textarea" },
            { id: "meeting_length", label: "How long did it last?", kind: "text", placeholder: "e.g. 10 minutes" },
            { id: "able_to_respond", label: "Were you given an opportunity to respond?", kind: "yesno", options: yesNoUnsure },
            { id: "support_person_allowed", label: "Were you allowed a support person?", kind: "yesno", options: yesNoUnsure },
            {
                id: "notice_type",
                label: "Notice or payment in lieu?",
                kind: "select",
                options: [
                    { value: "notice", label: "Worked out notice" },
                    { value: "pay_in_lieu", label: "Payment in lieu of notice" },
                    { value: "summary", label: "Summary dismissal (no notice)" },
                    { value: "unsure", label: "Not sure" },
                ],
            },
            { id: "final_pay", label: "Was final pay discussed?", kind: "textarea" },
        ],
    },
    incident: {
        type: "incident",
        label: "Key incident / hostile event",
        summary: "A significant incident, such as something said or done to you.",
        elementTags: ["gp_adverse_action", "gp_protected_attribute", "ud_process_consistency"],
        fields: [
            { id: "what_happened", label: "What happened?", kind: "textarea" },
            { id: "who_involved", label: "Who was involved?", kind: "text" },
            { id: "verbatim", label: "What was said (word-for-word where you can)?", kind: "textarea", help: "Quoting exactly is more powerful than paraphrasing." },
            { id: "impact", label: "What was the impact on you?", kind: "textarea" },
            { id: "reported_to", label: "Did you report it, and to whom?", kind: "text" },
            { id: "response", label: "What was the response?", kind: "textarea" },
        ],
    },
    workplace_right: {
        type: "workplace_right",
        label: "Workplace right exercised",
        summary: "A complaint, inquiry, entitlement, or leave you raised or took.",
        elementTags: ["gp_workplace_right", "gp_decision_maker_knowledge", "gp_temporal_connection"],
        fields: [
            {
                id: "kind",
                label: "What kind of workplace right?",
                kind: "select",
                options: [
                    { value: "complaint_or_inquiry", label: "Complaint or inquiry about the job" },
                    { value: "entitlement_benefit", label: "Asserted an entitlement or benefit" },
                    { value: "leave", label: "Took or proposed to take leave" },
                    { value: "safety_or_discrimination", label: "Raised discrimination, bullying, or safety" },
                    { value: "industrial_activity", label: "Union or industrial activity" },
                ],
            },
            { id: "description", label: "What did you raise or do?", kind: "textarea" },
            { id: "recipient", label: "Who did you raise it with?", kind: "text" },
            {
                id: "form",
                label: "How was it communicated?",
                kind: "select",
                options: [
                    { value: "verbal", label: "Verbally" },
                    { value: "email", label: "Email" },
                    { value: "written", label: "Written / letter" },
                    { value: "formal_complaint", label: "Formal complaint" },
                    { value: "other", label: "Other" },
                ],
            },
            { id: "decision_maker_aware", label: "Did the decision-maker know about it?", kind: "yesno", options: yesNoUnsure },
        ],
    },
    adverse_action: {
        type: "adverse_action",
        label: "Adverse action",
        summary: "Action taken against you: dismissal, demotion, or other detriment.",
        elementTags: ["gp_adverse_action", "gp_temporal_connection", "gp_decision_maker_knowledge"],
        fields: [
            { id: "action", label: "What action was taken?", kind: "textarea" },
            { id: "decision_maker", label: "Who took or decided the action?", kind: "text" },
            { id: "stated_reason", label: "What reason did they give?", kind: "textarea" },
            { id: "linked_right", label: "What workplace right or attribute do you think it relates to?", kind: "textarea" },
        ],
    },
    protected_attribute: {
        type: "protected_attribute",
        label: "Protected attribute",
        summary: "An attribute under s.351 you believe was a factor in your treatment.",
        elementTags: ["gp_protected_attribute", "gp_decision_maker_knowledge", "gp_temporal_connection"],
        fields: [
            { id: "attribute", label: "Which attribute?", kind: "text", placeholder: "e.g. age, pregnancy, disability" },
            { id: "how_it_arose", label: "How did it come up at work?", kind: "textarea" },
            { id: "what_was_said", label: "What was said or done that connects it to your treatment?", kind: "textarea" },
            { id: "decision_maker_knew", label: "Did the decision-maker know about it?", kind: "yesno", options: yesNoUnsure },
        ],
    },
};

/** Templates in display order for the "add event" picker. */
export const EVENT_TEMPLATE_ORDER: CaseEventType[] = [
    "performance_meeting",
    "pip_issued",
    "show_cause",
    "dismissal_meeting",
    "incident",
    "workplace_right",
    "adverse_action",
    "protected_attribute",
];

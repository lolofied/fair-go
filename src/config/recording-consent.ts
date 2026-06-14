/**
 * Recording-consent warning config, per Australian state / territory.
 *
 * Surveillance and listening-device laws differ across jurisdictions: whether you
 * may record a private conversation you are a party to (often called one-party vs
 * all-party consent), and, separately, whether you may then use or share that
 * recording. Even where recording is permitted, use and publication are usually
 * restricted.
 *
 * HARD RULE (PRD §3.8): the exact rules are lawyer-verified config, never
 * hard-coded prose in a component. This module is that config. The tool WARNS and
 * points to the rules; it never advises that recording is safe.
 *
 * ⚠️ Every entry below is a placeholder pending confirmation by counsel. Set
 * `verified: true` only once a lawyer has signed off on the wording.
 */

export type ConsentModel = "one_party" | "all_party" | "complex";

export interface RecordingConsentRule {
    code: string;
    jurisdiction: string;
    consentModel: ConsentModel;
    /** Plain-language summary of recording a conversation you are party to. */
    recordingSummary: string;
    /** Plain-language summary of using or sharing such a recording. */
    useAndSharingSummary: string;
    /** Primary legislation, for the "points to the rules" link-out. */
    legislation: string;
    verified: boolean;
}

const NOT_ADVICE =
    "This is a general warning, not legal advice. The rules are technical and the penalties are serious. Confirm your position with a lawyer before recording, using, or sharing any conversation.";

export const RECORDING_CONSENT_DISCLAIMER = NOT_ADVICE;

export const RECORDING_CONSENT_RULES: RecordingConsentRule[] = [
    {
        code: "NSW",
        jurisdiction: "New South Wales",
        consentModel: "all_party",
        recordingSummary:
            "Recording a private conversation you are part of is generally prohibited without the consent of all principal parties, subject to limited exceptions.",
        useAndSharingSummary:
            "Even if a recording exists, sharing or publishing it is separately restricted and can be an offence.",
        legislation: "Surveillance Devices Act 2007 (NSW)",
        verified: false,
    },
    {
        code: "VIC",
        jurisdiction: "Victoria",
        consentModel: "one_party",
        recordingSummary:
            "Recording a private conversation you are a party to is generally permitted, but important exceptions and conditions apply.",
        useAndSharingSummary:
            "Communicating or publishing a private conversation is separately restricted, even where the recording itself was lawful.",
        legislation: "Surveillance Devices Act 1999 (Vic)",
        verified: false,
    },
    {
        code: "QLD",
        jurisdiction: "Queensland",
        consentModel: "one_party",
        recordingSummary:
            "Recording a private conversation you are a party to is generally permitted, but exceptions and conditions apply.",
        useAndSharingSummary:
            "Using or publishing the recording is separately restricted and can be an offence.",
        legislation: "Invasion of Privacy Act 1971 (Qld)",
        verified: false,
    },
    {
        code: "SA",
        jurisdiction: "South Australia",
        consentModel: "complex",
        recordingSummary:
            "Recording a private conversation is generally prohibited without consent, with narrow exceptions that turn on a legitimate interest.",
        useAndSharingSummary: "Use and publication of any recording is separately and tightly restricted.",
        legislation: "Surveillance Devices Act 2016 (SA)",
        verified: false,
    },
    {
        code: "WA",
        jurisdiction: "Western Australia",
        consentModel: "all_party",
        recordingSummary:
            "Recording a private conversation is generally prohibited without the consent of all principal parties, subject to exceptions.",
        useAndSharingSummary: "Publishing or communicating a recording is separately restricted.",
        legislation: "Surveillance Devices Act 1998 (WA)",
        verified: false,
    },
    {
        code: "TAS",
        jurisdiction: "Tasmania",
        consentModel: "all_party",
        recordingSummary:
            "Recording a private conversation is generally prohibited without the consent of all parties, subject to exceptions.",
        useAndSharingSummary: "Use and publication of a recording is separately restricted.",
        legislation: "Listening Devices Act 1991 (Tas)",
        verified: false,
    },
    {
        code: "ACT",
        jurisdiction: "Australian Capital Territory",
        consentModel: "one_party",
        recordingSummary:
            "Recording a private conversation you are a party to is generally permitted, but exceptions and conditions apply.",
        useAndSharingSummary: "Communicating or publishing a private conversation is separately restricted.",
        legislation: "Listening Devices Act 1992 (ACT)",
        verified: false,
    },
    {
        code: "NT",
        jurisdiction: "Northern Territory",
        consentModel: "one_party",
        recordingSummary:
            "Recording a private conversation you are a party to is generally permitted, but exceptions and conditions apply.",
        useAndSharingSummary: "Use and publication of a recording is separately restricted.",
        legislation: "Surveillance Devices Act 2007 (NT)",
        verified: false,
    },
];

export function getRecordingConsentRule(code: string): RecordingConsentRule | undefined {
    return RECORDING_CONSENT_RULES.find((r) => r.code === code);
}

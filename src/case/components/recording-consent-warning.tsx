import { useState } from "react";
import { AlertTriangle } from "@untitledui/icons";
import {
    RECORDING_CONSENT_DISCLAIMER,
    RECORDING_CONSENT_RULES,
    getRecordingConsentRule,
} from "@/config/recording-consent";

const CONSENT_LABEL: Record<string, string> = {
    one_party: "Often described as one-party consent",
    all_party: "Often described as all-party consent",
    complex: "Mixed rules apply",
};

const controlClass =
    "w-full rounded-lg border border-primary bg-primary px-3 py-2 text-md text-primary shadow-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export const RecordingConsentWarning = () => {
    const [code, setCode] = useState<string>("");
    const rule = getRecordingConsentRule(code);

    return (
        <div className="rounded-2xl border border-warning bg-warning-primary p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                <div className="w-full">
                    <h3 className="text-md font-semibold text-primary">Thinking about recording a conversation?</h3>
                    <p className="mt-1 text-sm text-tertiary">
                        Recording laws differ by state and territory, and using or sharing a recording is restricted
                        separately from making it. Choose where you are for the relevant rules to check.
                    </p>

                    <div className="mt-4 max-w-xs">
                        <label htmlFor="recording-jurisdiction" className="text-sm font-medium text-secondary">
                            Your state or territory
                        </label>
                        <select
                            id="recording-jurisdiction"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={`mt-1.5 ${controlClass}`}
                        >
                            <option value="">Select...</option>
                            {RECORDING_CONSENT_RULES.map((r) => (
                                <option key={r.code} value={r.code}>
                                    {r.jurisdiction}
                                </option>
                            ))}
                        </select>
                    </div>

                    {rule && (
                        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4">
                            <p className="text-sm font-semibold text-primary">
                                {rule.jurisdiction} · {CONSENT_LABEL[rule.consentModel]}
                            </p>
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Recording</p>
                                <p className="mt-1 text-sm text-tertiary">{rule.recordingSummary}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">Using or sharing</p>
                                <p className="mt-1 text-sm text-tertiary">{rule.useAndSharingSummary}</p>
                            </div>
                            <p className="text-xs text-tertiary">Relevant legislation: {rule.legislation}</p>
                        </div>
                    )}

                    <p className="mt-4 text-xs text-tertiary">{RECORDING_CONSENT_DISCLAIMER}</p>
                </div>
            </div>
        </div>
    );
};

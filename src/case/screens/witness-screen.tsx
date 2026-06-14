import { useState } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PageHeading } from "@/case/components/case-layout";
import { TextAreaField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { useCase } from "@/case/store";
import { EVENT_TEMPLATES } from "@/case/templates";
import type { Witness } from "@/case/types";
import { cx } from "@/utils/cx";

const WitnessRow = ({ witness }: { witness: Witness }) => {
    const { file, updateWitness, deleteWitness } = useCase();
    const toggleEvent = (eventId: string) => {
        const next = witness.linkedEventIds.includes(eventId)
            ? witness.linkedEventIds.filter((x) => x !== eventId)
            : [...witness.linkedEventIds, eventId];
        updateWitness(witness.id, { linkedEventIds: next });
    };

    return (
        <div className="rounded-2xl border border-secondary bg-primary p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-primary">{witness.name}</p>
                    <p className="mt-0.5 text-xs text-tertiary">
                        {witness.relationship || "Relationship not set"}
                        {witness.personalContact ? ` · ${witness.personalContact}` : ""}
                    </p>
                    {witness.whatTheyWitnessed && <p className="mt-2 text-sm text-tertiary">{witness.whatTheyWitnessed}</p>}
                </div>
                <Button color="tertiary-destructive" size="sm" iconLeading={Trash01} aria-label="Delete witness" onClick={() => deleteWitness(witness.id)} />
            </div>

            {(file?.events.length ?? 0) > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-medium text-secondary">What they witnessed</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {file!.events.map((e) => {
                            const isOn = witness.linkedEventIds.includes(e.id);
                            return (
                                <button
                                    key={e.id}
                                    type="button"
                                    onClick={() => toggleEvent(e.id)}
                                    className={cx(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition duration-100 ease-linear",
                                        isOn ? "border-brand bg-brand-primary text-brand-secondary" : "border-secondary text-tertiary hover:bg-primary_hover",
                                    )}
                                >
                                    {e.title?.trim() || EVENT_TEMPLATES[e.type].label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const WitnessScreen = () => {
    const { file, addWitness } = useCase();
    const [name, setName] = useState("");
    const [relationship, setRelationship] = useState("");
    const [personalContact, setPersonalContact] = useState("");
    const [whatTheyWitnessed, setWhatTheyWitnessed] = useState("");

    if (!file) return null;

    const save = () => {
        if (!name.trim()) return;
        addWitness({ name: name.trim(), relationship: relationship || undefined, personalContact: personalContact || undefined, whatTheyWitnessed: whatTheyWitnessed || undefined });
        setName("");
        setRelationship("");
        setPersonalContact("");
        setWhatTheyWitnessed("");
    };

    return (
        <div>
            <PageHeading
                title="Witnesses"
                description="The single most-regretted omission. Capture who saw or heard what happened, and their personal contact details, while you still can."
            />

            <GuardrailBanner tone="info" title="Use personal contact details, not work ones" className="mb-6">
                Record a personal email or phone number, not a work address you may lose access to. A colleague who leaves
                or is let go can become very hard to reach later.
            </GuardrailBanner>

            <div className="mb-6 rounded-2xl border border-secondary bg-primary p-5 sm:p-6">
                <h2 className="text-md font-semibold text-primary">Add a witness</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <TextField label="Name" value={name} onChange={setName} />
                    <TextField label="Role or relationship" value={relationship} onChange={setRelationship} placeholder="e.g. teammate, former manager" />
                    <TextField label="Personal contact (not work)" value={personalContact} onChange={setPersonalContact} placeholder="Personal email or phone" />
                    <div className="sm:col-span-2">
                        <TextAreaField label="What did they witness?" value={whatTheyWitnessed} onChange={setWhatTheyWitnessed} />
                    </div>
                </div>
                <div className="mt-4">
                    <Button color="primary" size="md" iconLeading={Plus} isDisabled={!name.trim()} onClick={save}>
                        Add witness
                    </Button>
                </div>
            </div>

            {file.witnesses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-secondary p-10 text-center">
                    <p className="text-md font-medium text-primary">No witnesses yet</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-tertiary">
                        Think about who was in the room, on the call, or copied on the emails. Even one person who can
                        confirm what happened is worth recording now.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {file.witnesses.map((w) => (
                        <WitnessRow key={w.id} witness={w} />
                    ))}
                </div>
            )}
        </div>
    );
};

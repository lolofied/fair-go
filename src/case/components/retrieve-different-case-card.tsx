import { useState } from "react";
import { ArrowRight } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { isCaseSavedExternally } from "@/case/case-save-status";
import { GuardrailBanner } from "@/case/components/guardrail";
import { useCase } from "@/case/store";
import { formatUnsavedChangesLabel } from "@/case/unsaved-changes";
import { useSync } from "@/case/sync/sync-provider";

export const RetrieveDifferentCaseCard = () => {
    const navigate = useNavigate();
    const { file } = useCase();
    const { configured, user, dekUnlocked } = useSync();
    const [warnOpen, setWarnOpen] = useState(false);

    if (!file) return null;

    const synced = configured && Boolean(user && dekUnlocked);
    const saved = isCaseSavedExternally(file, { synced });

    const goToRetrieve = () => {
        setWarnOpen(false);
        navigate("/case/retrieve");
    };

    const onRetrieve = () => {
        if (saved) {
            goToRetrieve();
            return;
        }
        setWarnOpen(true);
    };

    return (
        <>
            <section className="fg-section-card">
                <h2 className="text-md font-semibold text-primary">Retrieve a different case</h2>
                <p className="mt-2 text-sm text-tertiary">
                    Sign in to encrypted sync or upload a backup file to replace the case on this device.
                </p>
                <Button color="secondary" size="md" iconTrailing={ArrowRight} className="mt-4" onClick={onRetrieve}>
                    Retrieve a different case
                </Button>
            </section>

            <ModalOverlay isOpen={warnOpen} onOpenChange={setWarnOpen}>
                <Modal className="max-w-md">
                    <Dialog className="w-full items-center justify-center outline-hidden">
                        <div className="relative w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                            <CloseButton size="xs" className="absolute top-3 right-3" onPress={() => setWarnOpen(false)} />
                            <h2 className="pr-10 text-display-xs font-semibold text-primary">Save your case first?</h2>
                            <GuardrailBanner tone="warning" title="This case has not been saved" className="my-4">
                                {formatUnsavedChangesLabel(file)}. Retrieving a different case will replace what you have on
                                this device. Create a sync account or download a backup before you continue if you might need
                                this case again.
                            </GuardrailBanner>
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button color="secondary" size="md" className="w-full sm:w-auto" onClick={() => setWarnOpen(false)}>
                                    Keep working on this case
                                </Button>
                                <Button color="primary" size="md" className="w-full sm:w-auto" onClick={goToRetrieve}>
                                    Retrieve a different case
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
};

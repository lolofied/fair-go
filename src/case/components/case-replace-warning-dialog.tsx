import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { GuardrailBanner } from "@/case/components/guardrail";
import type { CaseFile } from "@/case/types";
import { formatUnsavedChangesLabel } from "@/case/unsaved-changes";

export type CaseReplaceAction = "retrieve" | "start_new";

const COPY: Record<
    CaseReplaceAction,
    { bannerVerb: string; confirmLabel: string }
> = {
    retrieve: {
        bannerVerb: "Retrieving a different case will replace what you have on this device.",
        confirmLabel: "Retrieve a different case",
    },
    start_new: {
        bannerVerb: "Starting a new case will replace what you have on this device.",
        confirmLabel: "Start a new case",
    },
};

export const CaseReplaceWarningDialog = ({
    open,
    onOpenChange,
    file,
    action,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: CaseFile;
    action: CaseReplaceAction | null;
    onConfirm: () => void;
}) => {
    if (!action) return null;

    const copy = COPY[action];

    return (
        <ModalOverlay isOpen={open} onOpenChange={onOpenChange}>
            <Modal className="max-w-lg">
                <Dialog className="w-full items-center justify-center outline-hidden">
                    <div className="relative w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                        <CloseButton size="xs" className="absolute top-3 right-3" onPress={() => onOpenChange(false)} />
                        <h2 className="pr-10 text-display-xs font-semibold text-primary">Save your case first?</h2>
                        <GuardrailBanner tone="warning" title="This case has not been saved" className="my-4">
                            {formatUnsavedChangesLabel(file)}. {copy.bannerVerb} Create a sync account or download a backup
                            before you continue if you might need this case again.
                        </GuardrailBanner>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                            <Button color="secondary" size="md" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                                Keep working on this case
                            </Button>
                            <Button color="primary" size="md" className="w-full sm:w-auto sm:shrink-0" onClick={onConfirm}>
                                {copy.confirmLabel}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

import { useState } from "react";
import { ArrowRight, Plus } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { isCaseSavedExternally } from "@/case/case-save-status";
import {
    CaseReplaceWarningDialog,
    type CaseReplaceAction,
} from "@/case/components/case-replace-warning-dialog";
import { useCase } from "@/case/store";
import { useSync } from "@/case/sync/sync-provider";

export const ReplaceCaseOptionsCard = () => {
    const navigate = useNavigate();
    const { file, startNewCase } = useCase();
    const { configured, user, dekUnlocked, signOut } = useSync();
    const [warnOpen, setWarnOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<CaseReplaceAction | null>(null);

    if (!file) return null;

    const synced = configured && Boolean(user && dekUnlocked);
    const saved = isCaseSavedExternally(file, { synced });

    const runAction = (action: CaseReplaceAction) => {
        setWarnOpen(false);
        setPendingAction(null);

        if (action === "retrieve") {
            navigate("/case/retrieve");
            return;
        }

        void (async () => {
            if (synced) {
                await signOut();
            }
            await startNewCase();
            navigate("/", { replace: true, state: { forceChecker: true } });
        })();
    };

    const requestAction = (action: CaseReplaceAction) => {
        if (saved) {
            runAction(action);
            return;
        }
        setPendingAction(action);
        setWarnOpen(true);
    };

    return (
        <>
            <section className="fg-section-card">
                <h2 className="text-md font-semibold text-primary">Start or switch case</h2>
                <p className="mt-2 text-sm text-tertiary">
                    Clear this case on the device and run the checker again, or sign in to encrypted sync and upload a backup
                    to load a different one.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button color="secondary" size="md" iconLeading={Plus} className="w-full sm:w-auto" onClick={() => requestAction("start_new")}>
                        Start a new case
                    </Button>
                    <Button
                        color="secondary"
                        size="md"
                        iconTrailing={ArrowRight}
                        className="w-full sm:w-auto"
                        onClick={() => requestAction("retrieve")}
                    >
                        Retrieve a different case
                    </Button>
                </div>
            </section>

            <CaseReplaceWarningDialog
                open={warnOpen}
                onOpenChange={(open) => {
                    setWarnOpen(open);
                    if (!open) setPendingAction(null);
                }}
                file={file}
                action={pendingAction}
                onConfirm={() => pendingAction && runAction(pendingAction)}
            />
        </>
    );
};

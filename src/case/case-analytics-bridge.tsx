import { useEffect } from "react";
import { trackClaimOutcomeIfCompleted } from "@/checker/analytics";

/** Ensures claim_outcome fires when users enter /case without visiting the result screen. */
export const CaseAnalyticsBridge = () => {
    useEffect(() => {
        trackClaimOutcomeIfCompleted();
    }, []);

    return null;
};

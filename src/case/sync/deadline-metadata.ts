import { deadlineDateForDays, parseISODate } from "@/checker/logic";
import { getLegalConstants } from "@/config/legal-constants";
import type { CaseFile } from "@/case/types";

export interface DeadlineMetadata {
    effective_date: string | null;
    deadline_date: string | null;
}

function formatLocalISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** Plaintext deadline fields for the §3 server-side reminder exception. */
export function deadlineMetadataFromCase(caseFile: CaseFile): DeadlineMetadata {
    const effective = caseFile.profile.dismissal.effective_date;
    if (!effective) {
        return { effective_date: null, deadline_date: null };
    }

    const constants = getLegalConstants(parseISODate(effective));
    const deadline = deadlineDateForDays(effective, constants.timeLimits.unfairDismissalDays);
    if (!deadline) {
        return { effective_date: effective, deadline_date: null };
    }

    return {
        effective_date: effective,
        deadline_date: formatLocalISODate(deadline),
    };
}

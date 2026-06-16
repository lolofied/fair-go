import { loadCheckerScreen } from "@/checker/store";
import { loadCaseFile } from "@/case/storage";
import { getCurrentSyncUser } from "@/case/sync/auth";
import { isSyncConfigured } from "@/config/supabase";

/** True when the user should land in the case app instead of the checker intro. */
export async function shouldEnterCaseOverview(): Promise<boolean> {
    const existingCase = await loadCaseFile();
    if (existingCase) return true;

    if (loadCheckerScreen() === "result") return true;

    if (isSyncConfigured()) {
        try {
            const user = await getCurrentSyncUser();
            if (user) return true;
        } catch {
            /* sync client unavailable */
        }
    }

    return false;
}

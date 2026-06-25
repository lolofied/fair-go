import { loadCheckerScreen } from "@/checker/store";
import { loadCaseFile } from "@/case/storage";

/** True when the user should land in the case app instead of the checker intro. */
export async function shouldEnterCaseOverview(): Promise<boolean> {
    const existingCase = await loadCaseFile();
    if (existingCase) return true;

    if (loadCheckerScreen() === "result") return true;

    return false;
}

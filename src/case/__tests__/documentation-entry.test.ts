import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getDocumentationEntry,
    isPrepDocumentationEntry,
    setDocumentationEntry,
} from "@/case/documentation-entry";

function installSessionStorage() {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
        sessionStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
            clear: () => storage.clear(),
        },
    });
    return storage;
}

describe("documentation entry", () => {
    beforeEach(() => {
        installSessionStorage();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("stores and reads prep entry", () => {
        setDocumentationEntry("prep");
        expect(getDocumentationEntry()).toBe("prep");
        expect(isPrepDocumentationEntry()).toBe(true);
    });

    it("stores and reads result entry", () => {
        setDocumentationEntry("result");
        expect(getDocumentationEntry()).toBe("result");
        expect(isPrepDocumentationEntry()).toBe(false);
    });

    it("returns null when unset", () => {
        expect(getDocumentationEntry()).toBeNull();
        expect(isPrepDocumentationEntry()).toBe(false);
    });
});

import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { clearAnalytics } from "@/checker/analytics";
import { clearCheckerStorage, loadCheckerAnswers } from "@/checker/store";
import { mergeCheckerIntoCase, newId, seedCaseFromChecker } from "@/case/seed";
import { evidenceFileSizeError } from "@/case/evidence-upload";
import { trackCaseDocumentAdded } from "@/analytics/product-analytics";
import { deleteFile, loadCaseFile, purgeAll, putFile, saveCaseFile } from "@/case/storage";
import { EVENT_TEMPLATES } from "@/case/templates";
import type { CaseEvent, CaseEventType, CaseFile, CaseProfile, Evidence, EvidenceType, Witness } from "@/case/types";

interface NewEvidenceInput {
    title: string;
    docType: EvidenceType;
    date?: string;
    source?: string;
    linkedEventIds?: string[];
}

interface CaseContextValue {
    file: CaseFile | null;
    loading: boolean;

    updateProfile: (patch: Partial<CaseProfile>) => void;

    addEvent: (type: CaseEventType) => string;
    updateEvent: (id: string, patch: Partial<CaseEvent>) => void;
    deleteEvent: (id: string) => void;
    moveEvent: (id: string, direction: "up" | "down") => void;

    addDocument: (input: NewEvidenceInput, file: File) => Promise<string>;
    updateDocument: (id: string, patch: Partial<Evidence>) => void;
    deleteDocument: (id: string) => Promise<void>;

    addWitness: (witness: Omit<Witness, "id" | "createdAt" | "linkedEventIds"> & { linkedEventIds?: string[] }) => string;
    updateWitness: (id: string, patch: Partial<Witness>) => void;
    deleteWitness: (id: string) => void;

    markBackedUp: () => void;
    replaceFile: (file: CaseFile) => void;
    reseedFromChecker: () => void;
    startNewCase: () => Promise<void>;
    eraseEverything: () => Promise<void>;
}

const CaseContext = createContext<CaseContextValue | null>(null);

function nowISO(): string {
    return new Date().toISOString();
}

export const CaseProvider = ({ children }: PropsWithChildren) => {
    const [file, setFile] = useState<CaseFile | null>(null);
    const [loading, setLoading] = useState(true);
    // Skip the very first persist (the load itself shouldn't trigger a write).
    const hydrated = useRef(false);

    useEffect(() => {
        let cancelled = false;
        loadCaseFile().then((existing) => {
            if (cancelled) return;
            const answers = loadCheckerAnswers();
            const hasCheckerAnswers = Object.keys(answers).length > 0;
            if (existing && hasCheckerAnswers) {
                setFile(mergeCheckerIntoCase(existing, answers));
            } else if (existing) {
                setFile(existing);
            } else {
                setFile(seedCaseFromChecker(answers));
            }
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (loading || !file) return;
        if (!hydrated.current) {
            hydrated.current = true;
            // Persist the seeded file once so a refresh keeps it.
        }
        saveCaseFile(file).catch(() => {
            /* storage may be unavailable; the in-memory file still works */
        });
    }, [file, loading]);

    const mutate = useCallback((fn: (f: CaseFile) => CaseFile) => {
        setFile((prev) => {
            if (!prev) return prev;
            const next = fn(prev);
            return { ...next, meta: { ...next.meta, updatedAt: nowISO() } };
        });
    }, []);

    const updateProfile = useCallback(
        (patch: Partial<CaseProfile>) => mutate((f) => ({ ...f, profile: { ...f.profile, ...patch } })),
        [mutate],
    );

    const addEvent = useCallback(
        (type: CaseEventType) => {
            const id = newId();
            const ts = nowISO();
            const event: CaseEvent = {
                id,
                type,
                fields: {},
                elementTags: EVENT_TEMPLATES[type].elementTags,
                linkedDocumentIds: [],
                linkedWitnessIds: [],
                createdAt: ts,
                updatedAt: ts,
            };
            mutate((f) => ({ ...f, events: [...f.events, event] }));
            return id;
        },
        [mutate],
    );

    const updateEvent = useCallback(
        (id: string, patch: Partial<CaseEvent>) =>
            mutate((f) => ({
                ...f,
                events: f.events.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: nowISO() } : e)),
            })),
        [mutate],
    );

    const deleteEvent = useCallback(
        (id: string) =>
            mutate((f) => ({
                ...f,
                events: f.events.filter((e) => e.id !== id),
                documents: f.documents.map((d) => ({
                    ...d,
                    linkedEventIds: d.linkedEventIds.filter((eid) => eid !== id),
                })),
                witnesses: f.witnesses.map((w) => ({
                    ...w,
                    linkedEventIds: w.linkedEventIds.filter((eid) => eid !== id),
                })),
            })),
        [mutate],
    );

    // Reorder by adjusting explicit `order` among the chronologically-sorted list.
    const moveEvent = useCallback(
        (id: string, direction: "up" | "down") =>
            mutate((f) => {
                const sorted = [...f.events].sort((a, b) => {
                    const ad = a.date ?? "9999";
                    const bd = b.date ?? "9999";
                    if (ad !== bd) return ad.localeCompare(bd);
                    return (a.order ?? 0) - (b.order ?? 0);
                });
                const index = sorted.findIndex((e) => e.id === id);
                const swapWith = direction === "up" ? index - 1 : index + 1;
                if (index === -1 || swapWith < 0 || swapWith >= sorted.length) return f;
                [sorted[index], sorted[swapWith]] = [sorted[swapWith], sorted[index]];
                const reordered = sorted.map((e, i) => ({ ...e, order: i }));
                return { ...f, events: reordered };
            }),
        [mutate],
    );

    const addDocument = useCallback(
        async (input: NewEvidenceInput, uploaded: File) => {
            const sizeError = evidenceFileSizeError(uploaded.size);
            if (sizeError) throw new Error(sizeError);

            const id = newId();
            const fileRef = newId();
            await putFile(fileRef, uploaded);
            const evidence: Evidence = {
                id,
                title: input.title || uploaded.name,
                docType: input.docType,
                date: input.date,
                source: input.source,
                fileRef,
                fileName: uploaded.name,
                mimeType: uploaded.type,
                size: uploaded.size,
                linkedEventIds: input.linkedEventIds ?? [],
                createdAt: nowISO(),
            };
            mutate((f) => ({ ...f, documents: [...f.documents, evidence] }));
            trackCaseDocumentAdded(input.docType);
            return id;
        },
        [mutate],
    );

    const updateDocument = useCallback(
        (id: string, patch: Partial<Evidence>) =>
            mutate((f) => ({ ...f, documents: f.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
        [mutate],
    );

    const deleteDocument = useCallback(
        async (id: string) => {
            const target = file?.documents.find((d) => d.id === id);
            if (target) await deleteFile(target.fileRef);
            mutate((f) => ({
                ...f,
                documents: f.documents.filter((d) => d.id !== id),
                events: f.events.map((e) => ({
                    ...e,
                    linkedDocumentIds: e.linkedDocumentIds.filter((did) => did !== id),
                })),
            }));
        },
        [file, mutate],
    );

    const addWitness = useCallback<CaseContextValue["addWitness"]>(
        (witness) => {
            const id = newId();
            const record: Witness = {
                id,
                name: witness.name,
                relationship: witness.relationship,
                personalContact: witness.personalContact,
                whatTheyWitnessed: witness.whatTheyWitnessed,
                linkedEventIds: witness.linkedEventIds ?? [],
                createdAt: nowISO(),
            };
            mutate((f) => ({ ...f, witnesses: [...f.witnesses, record] }));
            return id;
        },
        [mutate],
    );

    const updateWitness = useCallback(
        (id: string, patch: Partial<Witness>) =>
            mutate((f) => ({ ...f, witnesses: f.witnesses.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
        [mutate],
    );

    const deleteWitness = useCallback(
        (id: string) => mutate((f) => ({ ...f, witnesses: f.witnesses.filter((w) => w.id !== id) })),
        [mutate],
    );

    const markBackedUp = useCallback(
        () => mutate((f) => ({ ...f, meta: { ...f.meta, lastBackupAt: nowISO() } })),
        [mutate],
    );

    const replaceFile = useCallback((next: CaseFile) => setFile(next), []);

    const reseedFromChecker = useCallback(() => {
        const answers = loadCheckerAnswers();
        setFile((prev) => (prev ? mergeCheckerIntoCase(prev, answers) : seedCaseFromChecker(answers)));
    }, []);

    const startNewCase = useCallback(async () => {
        await purgeAll();
        clearCheckerStorage();
        clearAnalytics();
    }, []);

    const eraseEverything = useCallback(async () => {
        await purgeAll();
        clearCheckerStorage();
        clearAnalytics();
        // Null avoids re-persisting an empty case before we leave the case module.
        setFile(null);
    }, []);

    const value: CaseContextValue = {
        file,
        loading,
        updateProfile,
        addEvent,
        updateEvent,
        deleteEvent,
        moveEvent,
        addDocument,
        updateDocument,
        deleteDocument,
        addWitness,
        updateWitness,
        deleteWitness,
        markBackedUp,
        replaceFile,
        reseedFromChecker,
        startNewCase,
        eraseEverything,
    };

    return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};

export function useCase(): CaseContextValue {
    const ctx = useContext(CaseContext);
    if (!ctx) throw new Error("useCase must be used within a CaseProvider");
    return ctx;
}

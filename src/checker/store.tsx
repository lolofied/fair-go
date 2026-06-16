import { createContext, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { nextStep, resumeHistory, resumeScreen, stepSequence } from "@/checker/logic";
import type { CheckerAnswers, StepId } from "@/checker/types";

export type Screen = "intro" | "result" | StepId;

interface CheckerState {
    answers: CheckerAnswers;
    screen: Screen;
    /** Visited question steps, for Back navigation. */
    history: StepId[];
}

type Action =
    | { type: "start" }
    | { type: "resume" }
    | { type: "set"; field: keyof CheckerAnswers; value: CheckerAnswers[keyof CheckerAnswers] }
    | { type: "advance" }
    | { type: "back" }
    | { type: "goToStep"; step: StepId }
    | { type: "reset" };

const STORAGE_KEY = "fairgo.checker.v1";

const initialState: CheckerState = { answers: {}, screen: "intro", history: [] };

function reducer(state: CheckerState, action: Action): CheckerState {
    switch (action.type) {
        case "start":
            return { ...state, screen: "dismissed", history: [] };

        case "resume": {
            const screen = resumeScreen(state.answers);
            if (screen === "result") {
                return { ...state, screen: "result", history: stepSequence(state.answers) };
            }
            return { ...state, screen, history: resumeHistory(state.answers, screen) };
        }

        case "set":
            return { ...state, answers: { ...state.answers, [action.field]: action.value } };

        case "advance": {
            if (state.screen === "intro" || state.screen === "result") return state;
            const next = nextStep(state.screen, state.answers);
            return {
                ...state,
                history: [...state.history, state.screen],
                screen: next,
            };
        }

        case "back": {
            if (state.screen === "result") {
                // Return to the last question that was visited.
                const last = state.history[state.history.length - 1];
                if (last) return { ...state, screen: last, history: state.history.slice(0, -1) };
                return { ...state, screen: "intro" };
            }
            if (state.history.length === 0) return { ...state, screen: "intro" };
            const previous = state.history[state.history.length - 1];
            return { ...state, screen: previous, history: state.history.slice(0, -1) };
        }

        case "goToStep":
            return { ...state, screen: action.step };

        case "reset":
            return initialState;

        default:
            return state;
    }
}

function loadPersisted(): CheckerState {
    if (typeof window === "undefined") return initialState;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return initialState;
        const parsed = JSON.parse(raw) as Partial<CheckerState>;
        return {
            answers: parsed.answers ?? {},
            screen: parsed.screen ?? "intro",
            history: parsed.history ?? [],
        };
    } catch {
        return initialState;
    }
}

/** The persisted checker answers, for the documentation module's zero re-entry seeding. */
export function loadCheckerAnswers(): CheckerAnswers {
    return loadPersisted().answers;
}

/** The persisted checker screen (intro, result, or an in-progress step). */
export function loadCheckerScreen(): Screen {
    return loadPersisted().screen;
}

/** Remove the persisted checker state (used by the case module's right-to-erasure). */
export function clearCheckerStorage(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* storage may be unavailable; nothing to clear */
    }
}

interface CheckerContextValue {
    state: CheckerState;
    answers: CheckerAnswers;
    screen: Screen;
    canGoBack: boolean;
    start: () => void;
    resume: () => void;
    set: (field: keyof CheckerAnswers, value: CheckerAnswers[keyof CheckerAnswers]) => void;
    advance: () => void;
    answerAndAdvance: (field: keyof CheckerAnswers, value: CheckerAnswers[keyof CheckerAnswers]) => void;
    back: () => void;
    goToStep: (step: StepId) => void;
    reset: () => void;
}

const CheckerContext = createContext<CheckerContextValue | null>(null);

export const CheckerProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(reducer, undefined, loadPersisted);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            /* storage may be unavailable (private mode), so fail silently */
        }
    }, [state]);

    const value = useMemo<CheckerContextValue>(
        () => ({
            state,
            answers: state.answers,
            screen: state.screen,
            canGoBack: state.screen !== "intro",
            start: () => dispatch({ type: "start" }),
            resume: () => dispatch({ type: "resume" }),
            set: (field, val) => dispatch({ type: "set", field, value: val }),
            advance: () => dispatch({ type: "advance" }),
            answerAndAdvance: (field, val) => {
                dispatch({ type: "set", field, value: val });
                dispatch({ type: "advance" });
            },
            back: () => dispatch({ type: "back" }),
            goToStep: (step) => dispatch({ type: "goToStep", step }),
            reset: () => dispatch({ type: "reset" }),
        }),
        [state],
    );

    return <CheckerContext.Provider value={value}>{children}</CheckerContext.Provider>;
};

export function useChecker(): CheckerContextValue {
    const ctx = useContext(CheckerContext);
    if (!ctx) throw new Error("useChecker must be used within a CheckerProvider");
    return ctx;
}

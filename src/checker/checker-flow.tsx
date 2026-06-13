import { CheckerShell } from "@/checker/components/checker-shell";
import { StepRenderer } from "@/checker/components/step-renderer";
import { IntroScreen } from "@/checker/screens/intro-screen";
import { ResultScreen } from "@/checker/screens/result-screen";
import { CheckerProvider, useChecker } from "@/checker/store";

const FlowSwitch = () => {
    const { screen } = useChecker();

    if (screen === "intro") return <IntroScreen />;
    if (screen === "result") return <ResultScreen />;

    return (
        <CheckerShell step={screen}>
            <StepRenderer step={screen} />
        </CheckerShell>
    );
};

export const CheckerFlow = () => (
    <CheckerProvider>
        <FlowSwitch />
    </CheckerProvider>
);

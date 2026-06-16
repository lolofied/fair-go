import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
    /**
     * The class to remove from the root element on load (legacy dark-mode hook).
     * @default "dark-mode"
     */
    darkModeClass?: string;
    /**
     * @default "ui-theme"
     */
    storageKey?: string;
}

/** Fair Go is light-mode only; system and stored dark preferences are ignored. */
export const ThemeProvider = ({ children, storageKey = "ui-theme", darkModeClass = "dark-mode" }: ThemeProviderProps) => {
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(darkModeClass);
        localStorage.setItem(storageKey, "light");
    }, [darkModeClass, storageKey]);

    return (
        <ThemeContext.Provider value={{ theme: "light", setTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
};

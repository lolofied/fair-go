import { useEffect, useRef } from "react";
import { SearchLg } from "@untitledui/icons";

export function GuidesSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <div className="fg-guides-search-banner">
            <p className="fg-guides-search-lead">Find the answers you need.</p>

            <label className="fg-guides-search-field">
                <SearchLg aria-hidden="true" className="fg-guides-search-icon" data-icon />
                <input
                    ref={inputRef}
                    type="search"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Search"
                    aria-label="Search guides"
                    className="fg-guides-search-input"
                />
                <kbd className="fg-guides-search-shortcut" aria-hidden="true">
                    ⌘K
                </kbd>
            </label>
        </div>
    );
}

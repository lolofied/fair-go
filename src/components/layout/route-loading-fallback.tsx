/** Minimal shell shown while lazy route chunks load. */
export const RouteLoadingFallback = () => (
    <div className="flex min-h-dvh items-center justify-center bg-primary">
        <p className="text-sm text-tertiary">Loading…</p>
    </div>
);

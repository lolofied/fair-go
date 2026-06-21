import {
    ILLUSTRATIVE_AWARD_HIGH,
    ILLUSTRATIVE_AWARD_LOW,
    MEDIAN_CONCILIATION_SETTLEMENT,
} from "@/config/unfair-dismissal-outcomes";

const audWhole = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
});

/** Track runs to this amount so the illustrative band fills most of the bar, not the statutory cap. */
const TRACK_MAX = 25_000;

const pctOfTrack = (amount: number) => Math.min(100, Math.max(0, (amount / TRACK_MAX) * 100));

/** Airtasker-style spread bar for typical unfair dismissal compensation outcomes. */
export const CompensationRangeVisual = () => {
    const bandLeft = pctOfTrack(ILLUSTRATIVE_AWARD_LOW);
    const bandWidth = pctOfTrack(ILLUSTRATIVE_AWARD_HIGH) - bandLeft;
    const medianLeft = pctOfTrack(MEDIAN_CONCILIATION_SETTLEMENT);

    return (
        <div
            className="mt-4 rounded-xl border border-secondary bg-secondary p-4"
            role="img"
            aria-label={`Typical unfair dismissal compensation ranges from ${audWhole.format(ILLUSTRATIVE_AWARD_LOW)} to ${audWhole.format(ILLUSTRATIVE_AWARD_HIGH)}, with a median around ${audWhole.format(MEDIAN_CONCILIATION_SETTLEMENT)}`}
        >
            <p className="text-display-xs font-semibold tracking-tight text-primary">
                {audWhole.format(ILLUSTRATIVE_AWARD_LOW)} - {audWhole.format(ILLUSTRATIVE_AWARD_HIGH)}
            </p>

            <div className="relative mt-4 h-2 rounded-full bg-quaternary">
                <div
                    className="absolute inset-y-0 rounded-full bg-brand-solid"
                    style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
                />
                <span
                    className="absolute -top-1 bottom-0 w-0.5 -translate-x-1/2 rounded-full bg-brand-secondary"
                    style={{ left: `${bandLeft}%` }}
                    aria-hidden="true"
                />
                <span
                    className="absolute -top-1 bottom-0 w-0.5 -translate-x-1/2 rounded-full bg-brand-secondary"
                    style={{ left: `${bandLeft + bandWidth}%` }}
                    aria-hidden="true"
                />
                <span
                    className="absolute -top-1.5 bottom-0.5 w-1 -translate-x-1/2 rounded-full bg-brand-solid ring-2 ring-secondary"
                    style={{ left: `${medianLeft}%` }}
                    aria-hidden="true"
                />
            </div>

            <div className="relative mt-3 h-10 text-xs">
                <div className="absolute -translate-x-1/2 text-center" style={{ left: `${medianLeft}%` }}>
                    <p className="font-medium text-secondary">median</p>
                    <p className="mt-0.5 font-semibold text-primary">{audWhole.format(MEDIAN_CONCILIATION_SETTLEMENT)}</p>
                </div>
            </div>
        </div>
    );
};

import { UNFAIR_DISMISSAL_TIME_LIMIT_DAYS } from "@/config/fair-work";
import { EMPLOYMENT_RESOURCE_ENTRIES, EMPLOYMENT_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideArticleCta, GuideList, GuidePage, GuideParagraph, GuideSection } from "@/pages/resources/resource-page";

const PATH = EMPLOYMENT_RESOURCE_ROUTES.timeLimit;
const LAST_UPDATED = EMPLOYMENT_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;

const FAQ_ITEMS = [
    {
        question: "When does the 21-day clock start?",
        answer: "For most employees, the period starts on the day your dismissal took effect, which is usually your last day of employment. If you are unsure of the date, check your termination letter or payslip and consider getting advice.",
    },
    {
        question: "Can the Fair Work Commission extend the deadline?",
        answer: "In limited circumstances, the Commission may accept a late application if you can show exceptional reasons. You should not rely on an extension: lodge within the time limit if you can.",
    },
    {
        question: "Is the time limit the same for general protections?",
        answer: "No. General protections dismissal applications have a different time limit under the Fair Work Act. Fair Go checks both pathways where relevant.",
    },
];

export const UnfairDismissalTimeLimitGuide = () => (
    <GuidePage
        title={`Unfair dismissal time limit (${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days)`}
        metaTitle={`Unfair Dismissal Time Limit (${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} Days) | Fair Go`}
        description={`How long you have to lodge an unfair dismissal application with the Fair Work Commission in Australia, when the ${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS}-day clock starts, and what to do if time is running out.`}
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="Unfair dismissal time limit"
        faqItems={FAQ_ITEMS}
        relatedResources={[
            {
                label: "Unfair dismissal eligibility in Australia",
                path: EMPLOYMENT_RESOURCE_ROUTES.eligibility,
            },
            {
                label: "How to lodge an unfair dismissal claim",
                path: EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim,
            },
        ]}
    >
        <GuideSection heading="The short answer">
            <GuideParagraph>
                For most unfair dismissal applications in Australia, you must apply to the Fair Work Commission within{" "}
                <strong className="text-secondary">{UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days</strong> after your dismissal took
                effect. Missing that window can mean you lose the chance to pursue an unfair dismissal remedy, even if you had
                a strong case.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="When the clock starts">
            <GuideParagraph>
                The time limit usually runs from the day your dismissal took effect. That is typically your last day of work,
                but the exact date can matter if your employer gave notice, paid you in lieu, or disputed when employment
                ended.
            </GuideParagraph>
            <GuideParagraph>
                If you received a termination letter, read it carefully for the effective date. If anything is unclear, note
                the dates now while they are fresh and consider speaking to the Fair Work Commission or an employment lawyer.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Why the deadline matters so much">
            <GuideParagraph>
                Unfair dismissal is one of the few workplace claims where a short, fixed window applies. Many people only
                realise they may have a claim after the shock wears off, by which point days or weeks have already passed.
            </GuideParagraph>
            <GuideParagraph>
                Fair Go shows how much time you likely have left based on your answers, so you can decide whether to act,
                document what happened, or seek advice before the window closes.
            </GuideParagraph>
            <GuideArticleCta
                variant="check"
                title="Check how much time you have left"
                description="The free eligibility check includes a countdown based on your dismissal date, so you can see whether the 21-day window is still open."
            />
        </GuideSection>

        <GuideSection heading="Practical steps before time runs out">
            <GuideList>
                <li>Confirm the date your dismissal took effect</li>
                <li>Run the free eligibility check to see whether you may be covered</li>
                <li>Start a timeline of key events, messages, and witnesses while details are clear</li>
                <li>Contact the Fair Work Commission or a lawyer if you need advice about lodging</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="Late applications">
            <GuideParagraph>
                The Commission may accept a late application in exceptional circumstances, but this is not guaranteed. Treat
                the {UNFAIR_DISMISSAL_TIME_LIMIT_DAYS}-day limit as firm and act as early as you can.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

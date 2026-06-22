import {
    MIN_EMPLOYMENT_MONTHS,
    SMALL_BUSINESS_HEADCOUNT,
    UNFAIR_DISMISSAL_TIME_LIMIT_DAYS,
    getHighIncomeThreshold,
} from "@/config/fair-work";
import { EMPLOYMENT_RESOURCE_ENTRIES, EMPLOYMENT_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideArticleCta, GuideList, GuidePage, GuideParagraph, GuideSection } from "@/pages/resources/resource-page";

const PATH = EMPLOYMENT_RESOURCE_ROUTES.eligibility;
const LAST_UPDATED = EMPLOYMENT_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;

const FAQ_ITEMS = [
    {
        question: "Do casual employees have unfair dismissal protection?",
        answer: "Sometimes. Casual employees may be covered if they were employed on a regular and systematic basis and had a reasonable expectation of ongoing work. The free Fair Go check asks about your employment pattern.",
    },
    {
        question: "What if I was over the high income threshold?",
        answer: `If your annual rate of earnings exceeded the high income threshold (currently $${getHighIncomeThreshold().amount.toLocaleString("en-AU")} excluding super for ${getHighIncomeThreshold().label}), you may not be protected unless a modern award or enterprise agreement covers you.`,
    },
    {
        question: "Does a small business employer change the rules?",
        answer: `Yes. Small businesses (fewer than ${SMALL_BUSINESS_HEADCOUNT} employees) generally require ${MIN_EMPLOYMENT_MONTHS.smallBusiness} months of service before unfair dismissal protection applies, instead of ${MIN_EMPLOYMENT_MONTHS.standard} months.`,
    },
];

export const UnfairDismissalEligibilityGuide = () => (
    <GuidePage
        title="Unfair dismissal eligibility in Australia"
        metaTitle="Unfair Dismissal Eligibility in Australia | Fair Go"
        description="Overview of who may be eligible for an unfair dismissal claim under the Fair Work Act, including minimum employment periods and common exclusions."
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="Unfair dismissal eligibility"
        faqItems={FAQ_ITEMS}
        relatedResources={[
            {
                label: `Unfair dismissal time limit (${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days)`,
                path: EMPLOYMENT_RESOURCE_ROUTES.timeLimit,
            },
            {
                label: "Unfair dismissal compensation and remedies",
                path: EMPLOYMENT_RESOURCE_ROUTES.compensation,
            },
        ]}
    >
        <GuideSection heading="What unfair dismissal means">
            <GuideParagraph>
                Under the Fair Work Act, unfair dismissal is broadly when you are dismissed from your job in a way that is
                harsh, unjust, or unreasonable, and you are covered by the unfair dismissal protections. Whether a dismissal
                meets that test depends on the facts, and only the Fair Work Commission (or a court) can decide a particular
                case.
            </GuideParagraph>
            <GuideParagraph>
                Fair Go helps you understand whether you may be covered and whether it is worth documenting your situation
                before the deadline passes. It is not legal advice.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Minimum employment period">
            <GuideParagraph>
                You usually need to have completed a minimum period of employment before you can apply for unfair dismissal:
            </GuideParagraph>
            <GuideList>
                <li>
                    <strong className="text-secondary">{MIN_EMPLOYMENT_MONTHS.standard} months</strong> for most employers
                </li>
                <li>
                    <strong className="text-secondary">{MIN_EMPLOYMENT_MONTHS.smallBusiness} months</strong> if your employer
                    is a small business (fewer than {SMALL_BUSINESS_HEADCOUNT} employees)
                </li>
            </GuideList>
            <GuideParagraph>
                If you were dismissed before reaching the minimum period, you may still have other options (such as general
                protections), but unfair dismissal may not be available.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Common reasons you may not be covered">
            <GuideList>
                <li>
                    Your annual rate of earnings exceeds the high income threshold and no award or enterprise agreement covers
                    you
                </li>
                <li>You were employed for less than the minimum employment period</li>
                <li>Your employment was genuinely fixed-term and ended at the end of the term</li>
                <li>You were a contractor rather than an employee (this can be disputed)</li>
                <li>Your dismissal was a genuine redundancy that followed proper consultation and redeployment steps</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="What to do next">
            <GuideParagraph>
                If you think you may be eligible, two things matter immediately: understanding whether you have a claim, and
                knowing how long you have to lodge with the Fair Work Commission ({UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days for
                most unfair dismissal applications).
            </GuideParagraph>
            <GuideParagraph>
                Fair Go&apos;s free check walks through coverage, timing, and next steps in plain English, then helps you build a
                private record if you want to prepare.
            </GuideParagraph>
            <GuideArticleCta
                variant="check"
                title="See if you may be covered"
                description="Answer a few questions about your employment and dismissal. The free check estimates whether unfair dismissal may apply and how much time you likely have left."
            />
        </GuideSection>
    </GuidePage>
);

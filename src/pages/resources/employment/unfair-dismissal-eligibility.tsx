import {
    MIN_EMPLOYMENT_MONTHS,
    SMALL_BUSINESS_HEADCOUNT,
    UNFAIR_DISMISSAL_TIME_LIMIT_DAYS,
    getHighIncomeThreshold,
} from "@/config/fair-work";
import { EMPLOYMENT_RESOURCE_ROUTES, LEGAL_CITATIONS } from "@/config/site-seo";
import { GuideArticleCta, GuideList, GuidePage, GuideParagraph, GuideSection } from "@/pages/resources/resource-page";
import {
    FairWorkActLink,
    FwcLink,
    FwoLink,
    GuideSourceItem,
    GuideSources,
} from "@/pages/resources/legal-citations";

const PATH = EMPLOYMENT_RESOURCE_ROUTES.eligibility;
const threshold = getHighIncomeThreshold();

const FAQ_ITEMS = [
    {
        question: "Do casual employees have unfair dismissal protection?",
        answer: "Sometimes. Casual employees may be covered if they were employed on a regular and systematic basis and had a reasonable expectation of ongoing work. The free Fair Go check asks about your employment pattern.",
    },
    {
        question: "What if I was over the high income threshold?",
        answer: `If your annual rate of earnings exceeded the high income threshold (currently $${threshold.amount.toLocaleString("en-AU")} excluding super for ${threshold.label}), you may not be protected unless a modern award or enterprise agreement covers you.`,
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
                Under the <FairWorkActLink>Fair Work Act 2009</FairWorkActLink>, a dismissal can be unfair when it is{" "}
                <strong className="text-secondary">harsh, unjust, or unreasonable</strong> and you are covered by the unfair
                dismissal protections. The Commission looks at what happened, whether there was a valid reason, and whether
                the process was fair — see{" "}
                <FairWorkActLink section="s387">section 387</FairWorkActLink> for the factors it must consider.
            </GuideParagraph>
            <GuideParagraph>
                A common mistake is assuming that any dismissal you disagree with qualifies. Being let go after a restructure,
                for example, may still be fair if consultation was genuine and redeployment was considered. Conversely, being
                dismissed by text message after a single informal warning may look procedurally weak even where performance was
                an issue.
            </GuideParagraph>
            <GuideParagraph>
                Only the <FwcLink>Fair Work Commission</FwcLink> (or a court on appeal) can decide a particular case. Fair Go
                helps you see whether you may be covered and whether it is worth documenting your situation before the deadline
                passes. It is general information, not legal advice.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Minimum employment period">
            <GuideParagraph>
                Before you can apply for unfair dismissal, you usually need to have completed a minimum period of employment
                set out in <FairWorkActLink section="s382">sections 382–383</FairWorkActLink> of the Act:
            </GuideParagraph>
            <GuideList>
                <li>
                    <strong className="text-secondary">{MIN_EMPLOYMENT_MONTHS.standard} months</strong> for most employers
                </li>
                <li>
                    <strong className="text-secondary">{MIN_EMPLOYMENT_MONTHS.smallBusiness} months</strong> if your employer
                    is a small business (fewer than {SMALL_BUSINESS_HEADCOUNT} employees at the time of dismissal)
                </li>
            </GuideList>
            <GuideParagraph>
                Count from when you started, including any probation that formed part of an ongoing role. If you were dismissed
                on day 89 of a {MIN_EMPLOYMENT_MONTHS.standard}-month qualifying period, unfair dismissal may not be available
                even if the reason looks weak — though other pathways (such as general protections) may still apply.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Common reasons you may not be covered">
            <GuideParagraph>
                The <FwoLink>Fair Work Ombudsman</FwoLink> publishes plain-English guidance on who can apply. In practice,
                these are the exclusions I see people stumble on most often:
            </GuideParagraph>
            <GuideList>
                <li>
                    Your annual rate of earnings exceeds the high income threshold (${threshold.amount.toLocaleString("en-AU")}{" "}
                    excluding super for {threshold.label}) and no modern award or enterprise agreement covers you
                </li>
                <li>You were employed for less than the minimum employment period</li>
                <li>Your employment was genuinely fixed-term and ended at the end of the term</li>
                <li>You were a contractor rather than an employee — this is often disputed and depends on how you actually worked</li>
                <li>
                    Your dismissal was a genuine redundancy that followed proper consultation and redeployment steps under the Act
                </li>
            </GuideList>
            <GuideParagraph>
                If one of these applies, do not assume you have no options at all. General protections, unlawful termination, or
                state laws may still be relevant. The point is that the unfair dismissal pathway specifically may be closed.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What to do next">
            <GuideParagraph>
                If you think you may be eligible, two things matter immediately: understanding whether you have a claim, and
                knowing how long you have to lodge with the Commission ({UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days for most unfair
                dismissal applications).
            </GuideParagraph>
            <GuideParagraph>
                Write down the dismissal date from your termination letter now. Note who told you, what reason was given, and
                whether you were invited to respond. Fair Go&apos;s free check walks through coverage and timing in plain
                English, then helps you build a private record if you want to prepare.
            </GuideParagraph>
            <GuideArticleCta
                variant="check"
                title="See if you may be covered"
                description="Answer a few questions about your employment and dismissal. The free check estimates whether unfair dismissal may apply and how much time you likely have left."
            />
        </GuideSection>

        <GuideSources>
            <GuideSourceItem href={LEGAL_CITATIONS.fairWorkAct}>
                Fair Work Act 2009 (Cth) — AustLII
            </GuideSourceItem>
            <GuideSourceItem href={LEGAL_CITATIONS.fairWorkActSection("s387")}>
                Section 387 — criteria for harsh, unjust or unreasonable dismissal
            </GuideSourceItem>
            <GuideSourceItem href={LEGAL_CITATIONS.fwoUnfairDismissal}>
                Fair Work Ombudsman — Unfair dismissal
            </GuideSourceItem>
            <GuideSourceItem href={LEGAL_CITATIONS.fwc}>
                Fair Work Commission
            </GuideSourceItem>
        </GuideSources>
    </GuidePage>
);

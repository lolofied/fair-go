import { getMaxCompensationCap } from "@/config/fair-work";
import {
    ILLUSTRATIVE_AWARD_HIGH,
    ILLUSTRATIVE_AWARD_LOW,
    MEDIAN_CONCILIATION_SETTLEMENT,
    MEDIAN_DECISION_AWARD,
    TYPICAL_AWARD_WEEKS,
} from "@/config/unfair-dismissal-outcomes";
import { EMPLOYMENT_RESOURCE_ROUTES, HELP_RESOURCE_ROUTES, LEGAL_CITATIONS } from "@/config/site-seo";
import { GuideArticleCta, GuideList, GuidePage, GuideParagraph, GuideSection } from "@/pages/resources/resource-page";
import {
    FairWorkActLink,
    FwcLink,
    GuideSourceItem,
    GuideSources,
} from "@/pages/resources/legal-citations";

const PATH = EMPLOYMENT_RESOURCE_ROUTES.compensation;
const compensationCap = getMaxCompensationCap();

const FAQ_ITEMS = [
    {
        question: "Can I get my job back?",
        answer: "Reinstatement is the primary remedy under the Fair Work Act. The Commission must consider it, but it is not ordered in every case. Many outcomes involve compensation instead.",
    },
    {
        question: "Is there a maximum compensation amount?",
        answer: `Yes. Compensation is capped at the lesser of ${compensationCap.weeks} weeks' pay or $${compensationCap.amount.toLocaleString("en-AU")} (half the high income threshold for ${compensationCap.label}). Your actual pay determines the amount within that cap.`,
    },
    {
        question: "Do most people receive the maximum?",
        answer: "No. Published research suggests very few applicants receive the statutory maximum. Median outcomes at conciliation and at hearing are typically much lower than the cap.",
    },
];

export const UnfairDismissalCompensationGuide = () => (
    <GuidePage
        title="Unfair dismissal compensation and remedies"
        metaTitle="Unfair Dismissal Compensation and Remedies | Fair Go"
        description="What reinstatement and compensation orders involve, how caps work under the Fair Work Act, and typical unfair dismissal outcomes in Australia."
        path={PATH}
        breadcrumbLabel="Unfair dismissal compensation"
        faqItems={FAQ_ITEMS}
        relatedResources={[
            {
                label: "How to lodge an unfair dismissal claim",
                path: EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim,
            },
            {
                label: "Unfair dismissal eligibility in Australia",
                path: EMPLOYMENT_RESOURCE_ROUTES.eligibility,
            },
        ]}
    >
        <GuideSection heading="The short answer">
            <GuideParagraph>
                If the <FwcLink>Fair Work Commission</FwcLink> finds that your dismissal was unfair, it can order{" "}
                <strong className="text-secondary">reinstatement</strong> (your job back),{" "}
                <strong className="text-secondary">compensation</strong> (payment for lost income), or both under{" "}
                <FairWorkActLink section="s390">sections 390–392</FairWorkActLink>. Reinstatement is the remedy the Act
                expects the Commission to consider first. In practice, many resolved matters end in compensation rather than
                returning to the same workplace.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Reinstatement">
            <GuideParagraph>
                Reinstatement means returning you to the job you lost, with continuity of employment where appropriate. The
                Commission must consider reinstatement before compensation, but it is not common in every workplace or
                relationship.
            </GuideParagraph>
            <GuideParagraph>
                Factors such as trust breakdown, the size of the employer, and whether working together is practical can all
                affect whether reinstatement is realistic. Even when reinstatement is not ordered, compensation may still be
                available if the dismissal is found to be unfair.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="How compensation is calculated">
            <GuideParagraph>
                Compensation is intended to compensate for lost income caused by the dismissal — not to punish the employer.
                The Commission looks at what you would have earned if you had not been dismissed, then may reduce the amount
                for reasons such as your efforts to find other work or your conduct — see{" "}
                <FairWorkActLink section="s392">section 392</FairWorkActLink>.
            </GuideParagraph>
            <GuideParagraph>
                There is a statutory cap: the lesser of{" "}
                <strong className="text-secondary">{compensationCap.weeks} weeks&apos; pay</strong> or{" "}
                <strong className="text-secondary">${compensationCap.amount.toLocaleString("en-AU")}</strong> (half the high
                income threshold for {compensationCap.label}). Very few applicants receive the maximum cap in practice.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Typical outcomes">
            <GuideParagraph>
                Published <FwcLink>Fair Work Commission</FwcLink> and research figures suggest most unfair dismissal matters
                settle at conciliation. Median compensation agreed at conciliation is often cited around{" "}
                <strong className="text-secondary">${MEDIAN_CONCILIATION_SETTLEMENT.toLocaleString("en-AU")}</strong>, with
                median amounts ordered after a formal decision often lower still (around $
                {MEDIAN_DECISION_AWARD.toLocaleString("en-AU")}).
            </GuideParagraph>
            <GuideParagraph>
                Decision examples commonly fall in a range of about ${ILLUSTRATIVE_AWARD_LOW.toLocaleString("en-AU")} to $
                {ILLUSTRATIVE_AWARD_HIGH.toLocaleString("en-AU")}, often equivalent to roughly {TYPICAL_AWARD_WEEKS.low}–
                {TYPICAL_AWARD_WEEKS.high} weeks&apos; pay. Your situation may differ. These figures are general information
                only, not a prediction of your outcome.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What affects the amount">
            <GuideList>
                <li>Your pay level and how long you were likely to remain employed</li>
                <li>Whether you mitigated your loss by looking for other work</li>
                <li>Your conduct before dismissal and during the process</li>
                <li>Whether reinstatement is feasible</li>
                <li>Strength of evidence about why the dismissal happened</li>
                <li>What each side offers or accepts at conciliation</li>
            </GuideList>
            <GuideArticleCta
                variant="both"
                title="Prepare before conciliation"
                description="If you may have a claim, run the free check first, then use Fair Go to build a private record you can export and share with a lawyer."
                guideHref={HELP_RESOURCE_ROUTES.exportCase}
                guideLabel="Export for your lawyer"
            />
        </GuideSection>

        <GuideSection heading="Other outcomes at conciliation">
            <GuideParagraph>
                Settlements are not limited to a dollar figure. Parties sometimes agree on a payment, a written reference, a
                statement of service, confidentiality terms, or other conditions. Anything you agree to at conciliation should
                be understood before you accept it. Consider getting advice if you are unsure.
            </GuideParagraph>
        </GuideSection>

        <GuideSources>
            <GuideSourceItem href={LEGAL_CITATIONS.fairWorkActSection("s390")}>
                Fair Work Act ss390–392 — remedies for unfair dismissal
            </GuideSourceItem>
            <GuideSourceItem href={LEGAL_CITATIONS.fwc}>
                Fair Work Commission — unfair dismissal outcomes and conciliation
            </GuideSourceItem>
        </GuideSources>
    </GuidePage>
);

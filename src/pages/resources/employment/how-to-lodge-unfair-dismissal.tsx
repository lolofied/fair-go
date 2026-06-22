import { FWC_APPLICATION_FEE, UNFAIR_DISMISSAL_TIME_LIMIT_DAYS } from "@/config/fair-work";
import { getLegalConstants } from "@/config/legal-constants";
import { EMPLOYMENT_RESOURCE_ENTRIES, EMPLOYMENT_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideSection } from "@/pages/resources/resource-page";

const PATH = EMPLOYMENT_RESOURCE_ROUTES.lodgeClaim;
const LAST_UPDATED = EMPLOYMENT_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;
const UNFAIR_DISMISSAL_FORM = getLegalConstants().formRefs.unfairDismissal;
const FWC_LODGEMENT_URL = "https://www.fwc.gov.au/apply-or-lodge/lodge-application";

const FAQ_ITEMS = [
    {
        question: "Can I lodge an unfair dismissal application myself?",
        answer: "Yes. Many people lodge their own application online with the Fair Work Commission. You can also use a lawyer, union, or other representative if you prefer.",
    },
    {
        question: "How much does it cost to lodge?",
        answer: `The Fair Work Commission charges a filing fee (currently $${FWC_APPLICATION_FEE.toFixed(2)}). Fee waivers may be available in some circumstances. Check the FWC website for current amounts.`,
    },
    {
        question: "What if I miss the 21-day deadline?",
        answer: "The Commission may accept a late application in limited circumstances, but you should not rely on an extension. Lodge within the time limit if you can.",
    },
];

export const HowToLodgeUnfairDismissalGuide = () => (
    <GuidePage
        title="How to lodge an unfair dismissal claim"
        metaTitle="How to Lodge an Unfair Dismissal Claim | Fair Go"
        description="Step-by-step overview of applying to the Fair Work Commission, what to prepare, and what happens after you lodge."
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="How to lodge an unfair dismissal claim"
        faqItems={FAQ_ITEMS}
        relatedResources={[
            {
                label: `Unfair dismissal time limit (${UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days)`,
                path: EMPLOYMENT_RESOURCE_ROUTES.timeLimit,
            },
            {
                label: "Unfair dismissal eligibility in Australia",
                path: EMPLOYMENT_RESOURCE_ROUTES.eligibility,
            },
        ]}
    >
        <GuideSection heading="The short answer">
            <GuideParagraph>
                If you may be covered by unfair dismissal laws, you lodge an application with the{" "}
                <a
                    className="font-medium text-brand-secondary underline"
                    href="https://www.fwc.gov.au"
                    target="_blank"
                    rel="noreferrer"
                >
                    Fair Work Commission
                </a>{" "}
                using Form {UNFAIR_DISMISSAL_FORM}. For most applications, you must lodge within{" "}
                <strong className="text-secondary">{UNFAIR_DISMISSAL_TIME_LIMIT_DAYS} days</strong> of your dismissal taking
                effect. Lodging starts a formal process that usually includes a conciliation conference before any hearing.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Before you lodge">
            <GuideParagraph>
                Lodging is a significant step. Before you apply, it helps to be clear on three things: whether you may be
                covered, when your dismissal took effect, and what outcome you are seeking (such as reinstatement or
                compensation).
            </GuideParagraph>
            <GuideParagraph>
                Fair Go&apos;s free check can help you understand coverage and how much time you likely have left. It is general
                information only, not legal advice. If you are unsure, speak to an employment lawyer or contact the Fair Work
                Commission.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What to have ready">
            <GuideList>
                <li>The date your dismissal took effect and your last day of work</li>
                <li>Your employer&apos;s legal name and contact details</li>
                <li>A brief summary of what happened and why you believe the dismissal was unfair</li>
                <li>Key documents such as your termination letter, employment contract, and relevant emails or messages</li>
                <li>Details of any warnings, performance management, or meetings leading up to the dismissal</li>
                <li>Witness names and contact details, if anyone saw relevant events</li>
            </GuideList>
            <GuideParagraph>
                You do not need a perfect bundle on day one, but having dates and documents organised makes the application
                stronger and saves time if the matter proceeds to conciliation or a hearing.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Lodging with the Fair Work Commission">
            <GuideParagraph>
                Unfair dismissal applications are lodged with the Fair Work Commission online. You will complete Form{" "}
                {UNFAIR_DISMISSAL_FORM}, which asks for your details, your employer&apos;s details, the dismissal date, and the
                remedy you are seeking.
            </GuideParagraph>
            <GuideParagraph>
                There is a filing fee (currently ${FWC_APPLICATION_FEE.toFixed(2)}). The Commission publishes current fees and
                information about fee waivers on its website. Start at the{" "}
                <a
                    className="font-medium text-brand-secondary underline"
                    href={FWC_LODGEMENT_URL}
                    target="_blank"
                    rel="noreferrer"
                >
                    FWC lodgement page
                </a>{" "}
                for up-to-date instructions.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What happens after you lodge">
            <GuideParagraph>
                After your application is accepted, the Commission serves it on your employer. The matter is usually listed for
                a conciliation conference: a confidential discussion where a Commission member helps both sides try to resolve
                the dispute.
            </GuideParagraph>
            <GuideParagraph>
                Many unfair dismissal matters settle at conciliation. If conciliation does not resolve the matter, it may
                proceed to a formal hearing where the Commission decides whether the dismissal was unfair and what remedy, if
                any, should be ordered.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Practical tips">
            <GuideList>
                <li>Lodge as early as you can within the {UNFAIR_DISMISSAL_TIME_LIMIT_DAYS}-day window</li>
                <li>Keep copies of everything you submit and receive</li>
                <li>Stick to facts and dates rather than emotional language in your application</li>
                <li>Continue documenting events, evidence, and witnesses while the matter is active</li>
                <li>Get advice before agreeing to or rejecting a settlement offer at conciliation</li>
            </GuideList>
        </GuideSection>
    </GuidePage>
);

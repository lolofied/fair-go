import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.afterCheck;
const LAST_UPDATED = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const AfterYourEligibilityCheckGuide = () => (
    <GuidePage
        title="After your eligibility check"
        metaTitle="After Your Eligibility Check | Fair Go Guides"
        description="How to read your Fair Go result, decide what to do next, and start building your case file."
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="After your eligibility check"
        relatedResources={[
            { label: "Run the free eligibility check", path: HELP_RESOURCE_ROUTES.runCheck },
            { label: "Build your case profile", path: HELP_RESOURCE_ROUTES.caseProfile },
        ]}
    >
        <GuideSection heading="Understanding your result">
            <GuideParagraph>
                Your result summarises what Fair Go inferred from your answers: whether you may be covered, which claim
                pathways could apply, and how much time you likely have left to lodge with the Fair Work Commission.
            </GuideParagraph>
            <GuideParagraph>
                Treat this as a starting point for your own research and preparation, not a final answer. If the result
                suggests you may have a claim, consider speaking to the Fair Work Commission or an employment lawyer.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Suggested next steps">
            <GuideList>
                <li>Confirm key dates from your termination letter or payslip</li>
                <li>Start a case file to record events while details are fresh</li>
                <li>Read the relevant blog articles on deadlines and lodging a claim</li>
                <li>Seek advice if you are close to a deadline or unsure about your options</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="Starting your case file">
            <GuideScreenshot src={IMAGE} alt="Fair Go case overview with documentation progress" />
            <GuideParagraph>
                From your result screen, open your case file to capture employment details, a timeline of events, and
                supporting documents. Fair Go encrypts your record on your device — we cannot read or sell your answers.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

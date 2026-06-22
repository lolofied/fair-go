import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.caseProfile;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const BuildYourCaseProfileGuide = () => (
    <GuidePage
        title="Build your case profile"
        metaTitle="Build Your Case Profile | Fair Go Product Guides"
        description="How to record employment details, key dates, and your goals in your Fair Go case file."
        path={PATH}
        breadcrumbLabel="Build your case profile"
        relatedResources={[
            { label: "Add events and evidence", path: HELP_RESOURCE_ROUTES.eventsEvidence },
            { label: "After your eligibility check", path: HELP_RESOURCE_ROUTES.afterCheck },
        ]}
    >
        <GuideSection heading="What the profile covers">
            <GuideParagraph>
                Your case profile captures the core facts about your employment: who you worked for, your role, key dates,
                and what you want to achieve from a claim. This becomes the foundation for your timeline and export.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Where to find it">
            <GuideScreenshot src={IMAGE} alt="Fair Go case profile form" />
            <GuideParagraph>
                Open your case file and go to <strong className="text-secondary">Case profile</strong> in the sidebar. Fill
                in each section as completely as you can. You can return and update details at any time.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Tips for a strong profile">
            <GuideList>
                <li>Match employer names to your termination letter or payslips</li>
                <li>Record the date your dismissal took effect carefully — it drives deadline calculations</li>
                <li>Note what outcome you are seeking, such as reinstatement or compensation</li>
                <li>Save progress as you go; Fair Go tracks which sections are complete</li>
            </GuideList>
        </GuideSection>
    </GuidePage>
);

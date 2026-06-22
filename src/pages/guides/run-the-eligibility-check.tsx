import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.runCheck;
const LAST_UPDATED = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const RunTheEligibilityCheckGuide = () => (
    <GuidePage
        title="Run the free eligibility check"
        metaTitle="Run the Free Eligibility Check | Fair Go Guides"
        description="How Fair Go's 90-second check works, what questions it asks, and what you see in your result."
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="Run the free eligibility check"
        relatedResources={[
            { label: "After your eligibility check", path: HELP_RESOURCE_ROUTES.afterCheck },
            { label: "Build your case profile", path: HELP_RESOURCE_ROUTES.caseProfile },
        ]}
    >
        <GuideSection heading="What the check does">
            <GuideParagraph>
                Fair Go&apos;s eligibility check takes about 90 seconds. It asks structured questions about your employment,
                dismissal, and timing, then shows whether you may be covered under the Fair Work Act and how much time you
                likely have left to act.
            </GuideParagraph>
            <GuideParagraph>
                The check is free and you do not need an account to get started. It is general information only, not legal
                advice about your specific situation.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Before you start">
            <GuideList>
                <li>Have your termination date or last day of work nearby</li>
                <li>Use a personal email address, not your work account</li>
                <li>Answer as accurately as you can — you can update details later in your case file</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="Running the check">
            <GuideScreenshot src={IMAGE} alt="Fair Go home page with the Start free check button" />
            <GuideParagraph>
                From the home page, select <strong className="text-secondary">Start free check</strong>. Work through each
                screen at your own pace. Fair Go saves progress locally on your device as you go.
            </GuideParagraph>
            <GuideParagraph>
                When you finish, you see a result summary with your likely pathways, key deadlines, and suggested next steps.
                From there you can start a case file to document what happened in more detail.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.retrieveCase;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const RetrieveASavedCaseGuide = () => (
    <GuidePage
        title="Retrieve a saved case"
        metaTitle="Retrieve a Saved Case | Fair Go Product Guides"
        description="How to open an existing Fair Go case on a new browser or device using your recovery details."
        path={PATH}
        breadcrumbLabel="Retrieve a saved case"
        relatedResources={[
            { label: "How encrypted sync works", path: HELP_RESOURCE_ROUTES.encryptedSync },
            { label: "After your eligibility check", path: HELP_RESOURCE_ROUTES.afterCheck },
        ]}
    >
        <GuideSection heading="When to retrieve a case">
            <GuideParagraph>
                Use retrieve when you started a case on one device and want to continue on another, or if you cleared your
                browser data and need to recover your encrypted record.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What you need">
            <GuideList>
                <li>The personal email address you used when saving the case</li>
                <li>Your case recovery code or sync credentials, depending on how you set up the case</li>
                <li>The same browser is not required — retrieval works on a new device</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="How to retrieve">
            <GuideScreenshot src={IMAGE} alt="Fair Go retrieve case screen" />
            <GuideParagraph>
                Open <strong className="text-secondary">Retrieve case</strong> from the site header or go to{" "}
                <strong className="text-secondary">/case/retrieve</strong>. Enter your recovery details and Fair Go will
                decrypt your case file locally on the new device.
            </GuideParagraph>
            <GuideParagraph>
                If you enabled encrypted sync, sign in with the same account you used originally. Fair Go still cannot read
                your case contents — only your devices hold the keys.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

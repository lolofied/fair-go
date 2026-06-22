import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.encryptedSync;
const LAST_UPDATED = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.lastUpdated;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const HowEncryptedSyncWorksGuide = () => (
    <GuidePage
        title="How encrypted sync works"
        metaTitle="How Encrypted Sync Works | Fair Go Guides"
        description="How Fair Go syncs your case across devices without being able to read your data."
        path={PATH}
        dateModified={LAST_UPDATED}
        breadcrumbLabel="How encrypted sync works"
        relatedResources={[
            { label: "Retrieve a saved case", path: HELP_RESOURCE_ROUTES.retrieveCase },
            { label: "Build your case profile", path: HELP_RESOURCE_ROUTES.caseProfile },
        ]}
    >
        <GuideSection heading="Why sync is optional">
            <GuideParagraph>
                Fair Go works entirely on your device by default. Encrypted sync is optional — use it when you want the same
                case available on a phone, tablet, or another computer without manual recovery codes each time.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Zero-knowledge encryption">
            <GuideParagraph>
                Your case file is encrypted on your device before anything is uploaded. Fair Go does not hold the keys and
                cannot decrypt your answers, documents, or timeline. We cannot sell or hand over data we cannot read.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Setting up sync">
            <GuideScreenshot src={IMAGE} alt="Fair Go settings with privacy and sync options" />
            <GuideList>
                <li>Complete the eligibility check or open your case file</li>
                <li>Choose to enable sync when prompted, using a personal email address</li>
                <li>Sign in on other devices with the same account to pull your encrypted record</li>
                <li>Keep your recovery details safe in case you lose access to every signed-in device</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="What sync does not do">
            <GuideParagraph>
                Sync does not give Fair Go access to your case contents, does not replace legal advice, and does not lodge
                claims with the Fair Work Commission. It only keeps your encrypted record consistent across your devices.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

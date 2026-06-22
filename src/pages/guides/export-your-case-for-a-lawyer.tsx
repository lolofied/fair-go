import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.exportCase;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const ExportYourCaseForALawyerGuide = () => (
    <GuidePage
        title="Export your case for a lawyer"
        metaTitle="Export Your Case for a Lawyer | Fair Go Product Guides"
        description="How to review findings and save a PDF package from your Fair Go case file."
        path={PATH}
        breadcrumbLabel="Export your case for a lawyer"
        relatedResources={[
            { label: "Add events and evidence", path: HELP_RESOURCE_ROUTES.eventsEvidence },
            { label: "Build your case profile", path: HELP_RESOURCE_ROUTES.caseProfile },
        ]}
    >
        <GuideSection heading="Before you export">
            <GuideParagraph>
                The export screen reviews your case file against common claim elements and flags gaps or items worth
                double-checking. Resolve or acknowledge findings before saving your PDF.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="What the PDF includes">
            <GuideList>
                <li>Your case profile and key employment facts</li>
                <li>A chronological statement built from your event log</li>
                <li>Annexures for uploaded evidence</li>
                <li>Deadline reminders and flagged issues to discuss with a lawyer</li>
            </GuideList>
        </GuideSection>

        <GuideSection heading="Saving the export">
            <GuideScreenshot src={IMAGE} alt="Fair Go export for your lawyer screen" />
            <GuideParagraph>
                Open <strong className="text-secondary">Export for your lawyer</strong> from the case sidebar. Review the
                readiness checklist, then select <strong className="text-secondary">Save as PDF</strong> to print or download
                the package.
            </GuideParagraph>
            <GuideParagraph>
                Share the PDF with an employment lawyer or adviser. Fair Go does not lodge claims on your behalf — the export
                is designed to help a professional understand your situation quickly.
            </GuideParagraph>
        </GuideSection>
    </GuidePage>
);

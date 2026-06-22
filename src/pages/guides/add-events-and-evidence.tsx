import { HELP_RESOURCE_ENTRIES, HELP_RESOURCE_ROUTES } from "@/config/site-seo";
import { GuideList, GuidePage, GuideParagraph, GuideScreenshot, GuideSection } from "@/pages/resources/resource-page";

const PATH = HELP_RESOURCE_ROUTES.eventsEvidence;
const IMAGE = HELP_RESOURCE_ENTRIES.find((guide) => guide.path === PATH)!.image;

export const AddEventsAndEvidenceGuide = () => (
    <GuidePage
        title="Add events and evidence"
        metaTitle="Add Events and Evidence | Fair Go Product Guides"
        description="How to build a timeline of what happened and attach documents in your Fair Go case file."
        path={PATH}
        breadcrumbLabel="Add events and evidence"
        relatedResources={[
            { label: "Build your case profile", path: HELP_RESOURCE_ROUTES.caseProfile },
            { label: "Export your case for a lawyer", path: HELP_RESOURCE_ROUTES.exportCase },
        ]}
    >
        <GuideSection heading="Event log">
            <GuideScreenshot src={IMAGE} alt="Fair Go event log timeline" />
            <GuideParagraph>
                The event log is a structured timeline of what happened and when: meetings, warnings, the dismissal itself,
                and any follow-up. Add entries in chronological order while details are still clear.
            </GuideParagraph>
            <GuideParagraph>
                Open <strong className="text-secondary">Event log</strong> from your case sidebar. Each entry can include a
                date, description, and links to related evidence.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Evidence">
            <GuideParagraph>
                Upload documents in <strong className="text-secondary">Evidence</strong>: termination letters, emails,
                messages, performance reviews, or medical certificates. Tag each file and link it to the events it supports.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Witnesses">
            <GuideParagraph>
                Record people who saw key moments in <strong className="text-secondary">Witnesses</strong>. You do not need
                every detail upfront — note names and what they observed, then expand later.
            </GuideParagraph>
        </GuideSection>

        <GuideSection heading="Good practices">
            <GuideList>
                <li>Stick to facts you can evidence rather than opinions alone</li>
                <li>Upload files from personal devices, not work systems you no longer access</li>
                <li>Link each document to at least one event where possible</li>
                <li>Review the documentation progress indicator to see what is still missing</li>
            </GuideList>
        </GuideSection>
    </GuidePage>
);

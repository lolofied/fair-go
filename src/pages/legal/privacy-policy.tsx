import { LegalList, LegalPage, LegalParagraph, LegalSection } from "@/pages/legal/legal-page";

export const PrivacyPolicy = () => (
    <LegalPage
        title="Privacy Policy"
        lastUpdated="13 June 2026"
        intro={
            <>
                Fair Go is a free tool that helps you understand whether you may have a workplace claim under the Fair Work
                Act and how long you have to act. We built it to be private by design. This policy explains what
                information is involved and how it is handled.
            </>
        }
    >
        <LegalSection heading="The short version">
            <LegalList>
                <li>The answers you give in the checker stay in your own browser. They are not sent to a Fair Go server.</li>
                <li>We do not ask for your name, contact details, or any account sign up to use the checker.</li>
                <li>We keep only anonymous, non-identifying signals about which kinds of results people reach, so we know which tools to build next.</li>
                <li>You can erase everything at any time by using "Start over" or by clearing your browser storage.</li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Who we are">
            <LegalParagraph>
                In this policy, "Fair Go", "we", "us", and "our" refer to the operator of this website and tool. Fair Go
                is not a law firm. If you have questions about this policy, you can reach us at the contact address in the
                "Contact us" section below.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Information involved when you use Fair Go">
            <LegalParagraph>There are three kinds of information to be aware of.</LegalParagraph>
            <LegalList>
                <li>
                    <span className="font-medium text-secondary">Your checker answers.</span> The dates, employment details,
                    and selections you enter are saved locally in your browser using its built in storage. This lets you
                    pause and resume your check. This information stays on your device and is not transmitted to us.
                </li>
                <li>
                    <span className="font-medium text-secondary">Anonymous usage signals.</span> When you reach a result,
                    the tool records non-identifying signals such as the type of claim, the outcome category, and which
                    eligibility rules were triggered. These signals do not include your answers, dates, salary, names, or
                    any free text, and they cannot be used to identify you.
                </li>
                <li>
                    <span className="font-medium text-secondary">Technical data from our host.</span> Like most websites,
                    our hosting provider may automatically log standard technical data such as your IP address, browser
                    type, and the pages requested. This is used to deliver the site securely and to prevent abuse.
                </li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="How we use information">
            <LegalList>
                <li>To run the checker and let you pause and resume where you left off.</li>
                <li>To understand, in aggregate and anonymously, which kinds of workplace issues people are checking, so we can decide which tools to build next.</li>
                <li>To keep the service secure, reliable, and free from abuse.</li>
            </LegalList>
            <LegalParagraph>
                We do not sell your information, and we do not use your checker answers for advertising.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Cookies and local storage">
            <LegalParagraph>
                Fair Go uses your browser's local storage to save your progress and the anonymous usage signals described
                above. This is essential to how the tool works. We do not use third party advertising or tracking
                cookies. You can clear this data at any time through your browser settings or by using "Start over" in the
                checker.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="How your information is shared">
            <LegalParagraph>
                Because your checker answers stay in your browser, there is nothing for us to share. For the technical
                data described above, we rely on a hosting provider that processes that data on our behalf to deliver the
                site. We may also disclose information if required by law, or to protect the rights, safety, and security
                of our users and the service.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="How long information is kept">
            <LegalParagraph>
                Your checker answers remain in your browser until you remove them, for example by selecting "Start over",
                clearing your browser storage, or using private browsing and closing the window. Anonymous usage signals
                are limited in volume and carry no identifying information.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Your choices">
            <LegalList>
                <li>You can use the checker without creating an account or giving us your name or contact details.</li>
                <li>You can erase your saved answers at any time using "Start over" or your browser settings.</li>
                <li>You can decline to provide information, although some questions are needed to produce a result.</li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Your privacy rights">
            <LegalParagraph>
                We handle personal information in line with the Australian Privacy Principles under the Privacy Act 1988
                (Cth). Because we do not collect identifying information through the checker, we usually hold no personal
                information that we could link back to you. If you believe we hold personal information about you, you can
                contact us to ask about access or correction.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Links to other sites">
            <LegalParagraph>
                Fair Go links to external resources such as the Fair Work Commission. We are not responsible for the
                content or privacy practices of those sites, and we encourage you to read their privacy policies.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Children">
            <LegalParagraph>
                Fair Go is intended for adults dealing with their own work situation. It is not directed at children, and
                we do not knowingly collect information from children.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Changes to this policy">
            <LegalParagraph>
                We may update this policy from time to time. When we do, we will change the "Last updated" date at the top
                of this page. Significant changes will be made clear on the site.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Contact us">
            <LegalParagraph>
                If you have any questions about this policy or how your information is handled, contact us at
                privacy@fairgo.au.
            </LegalParagraph>
        </LegalSection>
    </LegalPage>
);

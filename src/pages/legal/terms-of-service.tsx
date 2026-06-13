import { LegalList, LegalPage, LegalParagraph, LegalSection } from "@/pages/legal/legal-page";

export const TermsOfService = () => (
    <LegalPage
        title="Terms of Use"
        lastUpdated="13 June 2026"
        intro={
            <>
                These terms apply to your use of the Fair Go website and tool. Please read them carefully. By using Fair
                Go, you agree to these terms. If you do not agree, please do not use the tool.
            </>
        }
    >
        <LegalSection heading="What Fair Go is">
            <LegalParagraph>
                Fair Go is a free, self-help tool that asks you questions and gives you general information about whether
                you may have a workplace claim under the Fair Work Act 2009 (Cth), such as an unfair dismissal or general
                protections claim, and about the time limits that may apply. It is designed to help you understand your
                situation and your options, and to help you prepare to talk to the right people.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Fair Go is not legal advice">
            <LegalParagraph>
                This is the most important point. Fair Go is not a law firm and does not provide legal advice. Using Fair
                Go does not create a lawyer and client relationship. The information you receive is general in nature, is
                based on the answers you provide, and may not reflect every detail of your circumstances.
            </LegalParagraph>
            <LegalParagraph>
                Workplace claims have strict deadlines, and the rules can be complex. You should not rely on Fair Go as a
                substitute for advice from a qualified employment lawyer or from the Fair Work Commission. Before you act
                or decide not to act, get advice about your specific situation.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Time limits and deadlines">
            <LegalParagraph>
                Any deadline, countdown, or time estimate shown by Fair Go is an indication only and is calculated from
                the information you enter. The actual deadline that applies to you may be different. You are responsible
                for confirming the correct deadline and for lodging any application on time. The Fair Work Commission and
                a lawyer can confirm the deadline that applies to you.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Who can use Fair Go">
            <LegalParagraph>
                Fair Go is intended for adults aged 18 or over who are looking into their own work situation in Australia.
                The tool is built around Australian workplace law and may not be relevant in other countries.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Your responsibilities">
            <LegalList>
                <li>Provide accurate and complete information so the results are meaningful.</li>
                <li>Use the tool for your own genuine, lawful purposes.</li>
                <li>Confirm any important dates, deadlines, and outcomes with a lawyer or the Fair Work Commission before acting.</li>
                <li>Keep in mind that results are general information, not a guarantee of any particular outcome.</li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Accuracy and changes">
            <LegalParagraph>
                We work to keep Fair Go accurate and up to date, including the legal thresholds and time limits it uses.
                However, the law changes, errors can occur, and the tool may be updated, paused, or withdrawn at any time
                without notice. We do not guarantee that the tool will always be available or free of errors.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Acceptable use">
            <LegalParagraph>You agree not to:</LegalParagraph>
            <LegalList>
                <li>Use the tool in any way that breaks the law or infringes the rights of others.</li>
                <li>Attempt to disrupt, overload, or gain unauthorised access to the service or its systems.</li>
                <li>Copy, scrape, resell, or commercially exploit the tool or its content without our permission.</li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Intellectual property">
            <LegalParagraph>
                The Fair Go name, the tool, its design, and its content are owned by us or our licensors and are protected
                by intellectual property laws. You may use the tool for your own personal, non-commercial purposes. All
                other rights are reserved.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Third party links and resources">
            <LegalParagraph>
                Fair Go links to external organisations such as the Fair Work Commission. We provide these links for
                convenience and do not control or take responsibility for their content, accuracy, or availability.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="No warranties">
            <LegalParagraph>
                Fair Go is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we
                make no warranties or representations about the accuracy, completeness, reliability, or suitability of the
                tool for any purpose. Nothing in these terms excludes or limits any rights you have under the Australian
                Consumer Law that cannot be excluded.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Limitation of liability">
            <LegalParagraph>
                To the maximum extent permitted by law, we are not liable for any loss or damage arising from your use of,
                or reliance on, Fair Go, including any missed deadline, decision made or not made, or outcome of any
                claim. Where liability cannot be excluded by law, our liability is limited to the extent permitted by that
                law.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Governing law">
            <LegalParagraph>
                These terms are governed by the laws of Australia and the State of New South Wales. You agree to the
                non-exclusive jurisdiction of the courts of that state.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Changes to these terms">
            <LegalParagraph>
                We may update these terms from time to time. When we do, we will change the "Last updated" date at the top
                of this page. By continuing to use Fair Go after changes take effect, you accept the updated terms.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Contact us">
            <LegalParagraph>If you have any questions about these terms, contact us at hello@fairgo.au.</LegalParagraph>
        </LegalSection>
    </LegalPage>
);

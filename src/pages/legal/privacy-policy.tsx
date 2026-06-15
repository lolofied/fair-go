import { LegalList, LegalPage, LegalParagraph, LegalSection } from "@/pages/legal/legal-page";

export const PrivacyPolicy = () => (
    <LegalPage
        title="Privacy Policy"
        lastUpdated="13 June 2026"
        intro={
            <>
                Fair Go is a free tool that helps you understand whether you may have a workplace claim under the Fair Work
                Act and how long you have to act. We built it to be private by design. This policy explains what
                information is involved, how encrypted sync works, and what we can and cannot protect.
            </>
        }
    >
        <LegalSection heading="The short version">
            <LegalList>
                <li>The checker and case documentation work without an account. Your answers and case file stay on your device by default.</li>
                <li>We do not ask for your name to use the checker. Optional encrypted sync uses an email and passphrase you choose.</li>
                <li>If you turn on encrypted sync, we store only ciphertext we cannot read. Your passphrase and recovery key never leave your device in plaintext.</li>
                <li>We store your deadline date in plaintext if you use sync, so we can send reminder emails — the one deliberate exception to pure zero-knowledge.</li>
                <li>We keep anonymous, non-identifying signals about which kinds of results people reach, so we know which tools to build next.</li>
                <li>You can erase local data at any time, export an encrypted backup, or stop using sync.</li>
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
            <LegalParagraph>There are several kinds of information to be aware of.</LegalParagraph>
            <LegalList>
                <li>
                    <span className="font-medium text-secondary">Your checker answers.</span> The dates, employment details,
                    and selections you enter are saved locally in your browser. This lets you pause and resume your check.
                    This information stays on your device and is not transmitted to us unless you choose to document a case
                    and sync it.
                </li>
                <li>
                    <span className="font-medium text-secondary">Your case file (documentation module).</span> If you use
                    "Start documenting", your case profile, events, witnesses, evidence metadata, and uploaded documents are
                    stored locally in your browser (IndexedDB). This working copy stays on your device. No account is
                    required.
                </li>
                <li>
                    <span className="font-medium text-secondary">Optional encrypted sync account.</span> If you create a sync
                    account, we store your email, cryptographic parameters (such as a key-derivation salt), wrapped encryption
                    keys, encrypted copies of your case and files, and — for reminder emails — your deadline date in
                    plaintext. We never receive your passphrase, recovery key, or decrypted case contents. See{" "}
                    <a href="#encrypted-sync" className="font-medium text-brand-secondary">
                        Encrypted sync
                    </a>{" "}
                    below.
                </li>
                <li>
                    <span className="font-medium text-secondary">Encrypted backup files.</span> If you download a backup, the
                    file is encrypted on your device before it is saved. We never see the file or your passphrase.
                </li>
                <li>
                    <span className="font-medium text-secondary">Anonymous usage signals.</span> When you reach a result,
                    the tool may record non-identifying signals such as the type of claim, the outcome category, and which
                    eligibility rules were triggered. These signals do not include your answers, dates, salary, names, or
                    any free text, and they cannot be used to identify you.
                </li>
                <li>
                    <span className="font-medium text-secondary">Technical data from our host.</span> Like most websites,
                    our hosting and sync providers may automatically log standard technical data such as your IP address,
                    browser type, and the pages or API requests made. This is used to deliver the service securely and to
                    prevent abuse.
                </li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Case documentation (local-first)">
            <LegalParagraph>
                The case module is designed to work fully on your device. You can add events, upload evidence, and export a
                lawyer-ready pack without creating an account. Data is stored in your browser until you erase it, restore
                from a backup, or replace it through encrypted sync.
            </LegalParagraph>
            <LegalParagraph>
                Because the case file can include sensitive workplace information, we show guardrails encouraging you to use
                a personal device and personal email, and not to upload documents you are not entitled to copy.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Encrypted sync (optional)" id="encrypted-sync">
            <LegalParagraph>
                Encrypted sync is optional. It lets you retrieve an encrypted copy of your case from another device. Sync is
                off by default; your case remains local-only until you sign up.
            </LegalParagraph>
            <LegalParagraph>
                <span className="font-medium text-secondary">How it works.</span> When you create a sync account, your
                browser generates encryption keys from your passphrase. Your case and uploaded files are encrypted on your
                device before anything is sent. Only ciphertext is uploaded to our sync backend in Sydney, Australia
                (ap-southeast-2). We cannot decrypt your case — we do not hold your passphrase or the data encryption key
                in usable form.
            </LegalParagraph>
            <LegalParagraph>
                <span className="font-medium text-secondary">What we store for sync accounts.</span>
            </LegalParagraph>
            <LegalList>
                <li>Your email address (for sign-in and account recovery flows).</li>
                <li>Key-derivation salt and parameters, and encryption keys wrapped so only your passphrase or recovery key can unlock them.</li>
                <li>Encrypted blobs containing your case JSON and uploaded file bytes.</li>
                <li>Non-content metadata needed for sync (such as row identifiers, schema version, blob sizes, and timestamps).</li>
                <li>
                    <span className="font-medium text-secondary">Your deadline date (plaintext).</span> This is the one
                    intentional exception to zero-knowledge storage. A bare date reveals little about your case facts, but
                    it lets us send "your window is closing" reminder emails — the product's most safety-critical nudge. We
                    do not store employer names, dismissal facts, event text, witness details, or document contents in
                    plaintext.
                </li>
            </LegalList>
            <LegalParagraph>
                <span className="font-medium text-secondary">Passphrase and recovery key.</span> Your passphrase unlocks
                encryption and signs you in (via a derived authentication secret — we never store the passphrase itself).
                At signup you receive a one-time recovery key. If you forget your passphrase, the recovery key is the only
                way to set a new one. We cannot reset your encryption through email password reset — that would not recover
                your keys. If you lose both your passphrase and recovery key, your encrypted sync data cannot be recovered.
            </LegalParagraph>
            <LegalParagraph>
                <span className="font-medium text-secondary">Changing your passphrase.</span> If you change your sync
                passphrase, only the wrapped encryption keys are updated. Your case and files are not re-encrypted — this is
                by design and does not weaken the encryption of your data.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="What encrypted sync is designed to protect against" id="sync-protections">
            <LegalList>
                <li>
                    <span className="font-medium text-secondary">Server breach or stolen database.</span> An attacker would
                    obtain ciphertext and wrapped keys. Without your passphrase, breaking the encryption is designed to be
                    computationally expensive (Argon2id key derivation).
                </li>
                <li>
                    <span className="font-medium text-secondary">Insider or casual access.</span> Our staff and infrastructure
                    providers cannot read your case contents — there is no server-side decryption path.
                </li>
                <li>
                    <span className="font-medium text-secondary">Subpoena or discovery for case contents.</span> We can only
                    produce ciphertext and account metadata we cannot decrypt into readable case facts.
                </li>
                <li>
                    <span className="font-medium text-secondary">Employer access.</span> Your encrypted sync data is not stored
                    on employer systems and is not shared with your employer.
                </li>
                <li>
                    <span className="font-medium text-secondary">Cross-border exposure of case contents.</span> Only ciphertext
                    leaves your device for sync, and it is stored in Australia regardless of where you browse from.
                </li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Limitations and risks (what we cannot promise)" id="sync-limitations">
            <LegalParagraph>
                No design can protect against every threat. We think it is important to be honest about the limits of
                encrypted sync, especially for a browser-based tool.
            </LegalParagraph>
            <LegalList>
                <li>
                    <span className="font-medium text-secondary">Compromised device or browser.</span> Malware, keyloggers, or
                    someone with physical access to your unlocked device can capture your passphrase or decrypted data. Use a
                    personal device you trust, and lock your screen.
                </li>
                <li>
                    <span className="font-medium text-secondary">Weak passphrase.</span> A short or reused passphrase can be
                    guessed under targeted attack. Argon2id raises the cost of guessing, but you should choose a strong,
                    unique passphrase.
                </li>
                <li>
                    <span className="font-medium text-secondary">Lost recovery key and lost passphrase.</span> This is the
                    inherent trade-off of zero-knowledge encryption. We cannot help you recover encrypted data without one of
                    those secrets.
                </li>
                <li>
                    <span className="font-medium text-secondary">Browser-delivered encryption.</span> Because Fair Go runs in
                    your browser, the encryption code is delivered from our website when you load the app. In principle, a
                    compromised deployment could serve tampered code that captures keys. Native apps with code you install
                    once avoid this class of risk. We mitigate browser risk with strict content security policy, subresource
                    integrity where applicable, minimal dependencies, and published build verification — but we cannot
                    eliminate it entirely in a web app.
                </li>
                <li>
                    <span className="font-medium text-secondary">Metadata.</span> Your email address linked to a sync account
                    reveals that you use Fair Go, not what your case says. The plaintext deadline date reveals roughly when
                    your dispute window matters, not the underlying facts. Neither reveals case contents.
                </li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="How we use information">
            <LegalList>
                <li>To run the checker and let you pause and resume where you left off.</li>
                <li>To store and sync encrypted copies of your case when you opt in.</li>
                <li>To send deadline reminder emails if you use sync and have opted in to reminders (using the plaintext deadline date only).</li>
                <li>To understand, in aggregate and anonymously, which kinds of workplace issues people are checking, so we can decide which tools to build next.</li>
                <li>To keep the service secure, reliable, and free from abuse.</li>
            </LegalList>
            <LegalParagraph>
                We do not sell your information, and we do not use your checker answers or case contents for advertising.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Cookies and local storage">
            <LegalParagraph>
                Fair Go uses your browser's local storage and IndexedDB to save your progress, case file, and anonymous usage
                signals. This is essential to how the tool works. We do not use third party advertising or tracking cookies.
                You can clear local data at any time through your browser settings, by erasing your case in Settings, or by
                using "Start over" in the checker.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="How your information is shared">
            <LegalParagraph>
                Your checker answers and local case file are not transmitted to us unless you use encrypted sync or contact
                us directly. For encrypted sync, ciphertext and the account metadata described above are processed by our
                sync provider (Supabase, hosted in Sydney) on our behalf. They act as a subprocesser under our instructions
                and cannot decrypt your case.
            </LegalParagraph>
            <LegalParagraph>
                We rely on hosting providers that process technical logs to deliver the site. We may also disclose information
                if required by law. For sync accounts, we can comply with legal requests for account metadata and ciphertext,
                but not for readable case contents we do not possess.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="How long information is kept">
            <LegalParagraph>
                Your checker answers and case file remain in your browser until you remove them — for example by erasing your
                case, selecting "Start over", or clearing browser storage. Encrypted sync data remains on our servers while
                your account exists until you delete it or ask us to delete it. Anonymous usage signals are limited in
                volume and carry no identifying information.
            </LegalParagraph>
        </LegalSection>

        <LegalSection heading="Your choices">
            <LegalList>
                <li>Use the checker and case module without creating an account.</li>
                <li>Opt in to encrypted sync only if you want cross-device retrieval.</li>
                <li>Download an encrypted backup file as an offline escape hatch.</li>
                <li>Change your sync passphrase or recover access with your recovery key.</li>
                <li>Sign out of sync on a shared device after use.</li>
                <li>Erase your local case data at any time in Settings.</li>
                <li>Contact us to request deletion of your sync account and server-side ciphertext.</li>
            </LegalList>
        </LegalSection>

        <LegalSection heading="Your privacy rights">
            <LegalParagraph>
                We handle personal information in line with the Australian Privacy Principles under the Privacy Act 1988
                (Cth). If you use encrypted sync, we hold your email address and related account metadata — you can contact us
                to ask about access, correction, or deletion. Because case contents are encrypted in a way we cannot decrypt,
                we cannot read or correct the substance of your case on your behalf; you retain control through your device
                and passphrase.
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
                If you have any questions about this policy, encrypted sync, or how your information is handled, contact us at
                privacy@fairgo.au.
            </LegalParagraph>
        </LegalSection>
    </LegalPage>
);

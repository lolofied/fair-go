import { useEffect, useState } from "react";
import { ArrowLeft, LogIn01, UploadCloud02 } from "@untitledui/icons";
import { Link, useNavigate } from "react-router";
import { FairGoWordmark } from "@/checker/components/wordmark";
import { Button } from "@/components/base/buttons/button";
import {
    mobileBtnClass,
    Shell,
    ShellContent,
    ShellFooter,
    ShellHeader,
    ShellMain,
} from "@/components/layout/shell";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

export const RetrieveCaseScreen = () => {
    const navigate = useNavigate();
    const { configured, loading, user, dekUnlocked, syncStatus, syncError, signIn } = useSync();

    const [email, setEmail] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const syncing = user && dekUnlocked && syncStatus === "syncing";

    useEffect(() => {
        if (loading) return;
        if (!configured) return;
        if (user && dekUnlocked && syncStatus === "synced") {
            navigate("/case", { replace: true });
        }
    }, [loading, configured, user, dekUnlocked, syncStatus, navigate]);

    const onSubmit = async () => {
        setError(null);
        if (passphrase.length < 8) {
            setError("Use a passphrase of at least 8 characters.");
            return;
        }
        setBusy(true);
        try {
            await signIn(email, passphrase);
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Sign-in failed.");
        } finally {
            setBusy(false);
        }
    };

    if (!configured) {
        return (
            <Shell>
                <RetrieveHeader />
                <ShellMain>
                    <ShellContent className="text-center">
                        <p className="text-md text-tertiary">Encrypted sync is not available on this deployment yet.</p>
                        <Button href="/" color="secondary" size="md" className={`mt-6 ${mobileBtnClass}`} iconLeading={ArrowLeft}>
                            Back to home
                        </Button>
                    </ShellContent>
                </ShellMain>
            </Shell>
        );
    }

    return (
        <Shell>
            <RetrieveHeader />

            <ShellMain align="start">
                <ShellContent>
                    <h1 className="text-xl font-semibold tracking-tight text-primary sm:text-display-xs">Retrieve your case</h1>
                    <p className="mt-2 text-sm text-tertiary sm:text-md">
                        Sign in with the email and passphrase you used for encrypted sync. Your case will download to this
                        device — we cannot read it in plaintext.
                    </p>

                    {syncing ? (
                        <div className="fg-section-card mt-6 text-center sm:mt-8">
                            <UploadCloud02 className="mx-auto size-8 text-brand-secondary" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium text-primary">Retrieving your encrypted case…</p>
                            <p className="mt-1 text-sm text-tertiary">This may take a moment on slower connections.</p>
                        </div>
                    ) : (
                        <>
                            <GuardrailBanner tone="info" title="Use a personal device" className="mt-5 sm:mt-6">
                                Sign in on a device and browser you trust. Your passphrase unlocks your encryption key on this
                                device only.
                            </GuardrailBanner>

                            <div className="fg-stack-md mt-5 sm:mt-6">
                                <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} />
                            </div>

                            {(error || syncError) && (
                                <p className="mt-3 text-sm text-error-primary">{error ?? syncError}</p>
                            )}

                            <Button
                                color="primary"
                                size="lg"
                                className={`mt-5 sm:mt-6 ${mobileBtnClass}`}
                                iconLeading={LogIn01}
                                isLoading={busy}
                                onClick={onSubmit}
                            >
                                Sign in and retrieve
                            </Button>

                            <p className="mt-4 text-center text-sm text-tertiary">
                                Forgot your passphrase?{" "}
                                <Link to="/case/settings" className="font-medium text-brand-secondary hover:text-brand-secondary_hover">
                                    Use your recovery key
                                </Link>
                            </p>
                        </>
                    )}
                </ShellContent>
            </ShellMain>

            <ShellFooter>
                <div className="flex justify-center">
                    <Button href="/" color="link-gray" size="sm" iconLeading={ArrowLeft}>
                        Back to home
                    </Button>
                </div>
            </ShellFooter>
        </Shell>
    );
};

function RetrieveHeader() {
    return (
        <ShellHeader>
            <Link to="/" aria-label="Fair Go home">
                <FairGoWordmark />
            </Link>
        </ShellHeader>
    );
}

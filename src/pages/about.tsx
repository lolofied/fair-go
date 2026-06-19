import { ArrowRight, EyeOff, Lock01, MessageChatCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Shell, ShellContent, ShellMain } from "@/components/layout/shell";
import { LandingFooter, LandingHeader } from "@/checker/components/landing-chrome";
import { PageMeta } from "@/components/seo/page-meta";

const PRINCIPLES = [
    {
        icon: Lock01,
        title: "Your story stays yours",
        body: "Your information is encrypted on your own device. I can't read it, I can't sell it, and I can't be made to hand over what I can't see.",
    },
    {
        icon: EyeOff,
        title: "Your employer never sees this",
        body: "Use a personal email, never your work account, and there's no window into any of it.",
    },
    {
        icon: MessageChatCircle,
        title: "Plain English",
        body: "No jargon, no judgement. However messy it feels, there's a place to put it.",
    },
] as const;

export const AboutPage = () => {
    return (
        <Shell>
            <PageMeta
                title="About Fair Go | Why I built it"
                description="Why I built Fair Go: a private, plain-English tool that helps you document an unfair dismissal and stand up to unfair treatment at work. Your story stays yours."
                path="/about"
            />
            <LandingHeader brandAsLink />

            <ShellMain align="start">
                <ShellContent>
                <h1 className="text-display-sm font-semibold tracking-tight text-primary">Why I built this</h1>

                <div className="mt-6 flex flex-col gap-4 text-md text-secondary">
                    <p>
                        I'm from Sydney, and I worked in tech until the day I got let go. It happened fast, with almost no
                        warning, and suddenly I was on the outside trying to work out what had just happened. After it
                        did, I started noticing how often it happens to other people too.
                    </p>
                    <p>
                        At the time I didn't really know anything about Australian Fair Work. I wasn't sure what my
                        rights were, whether I even had a claim, or how I was meant to proceed. Everything felt urgent
                        and confusing at the same time, and the clock was already running.
                    </p>
                    <p>
                        When work goes wrong, it goes wrong fast. Decisions get made about you in rooms you're not in.
                        Suddenly you're expected to respond, to remember everything, to prove what happened, and you're
                        trying to do all of it at once. Most of us don't have the time, the money, or a lawyer on speed
                        dial to push back when something isn't fair.
                    </p>
                    <p>
                        The other side has HR, lawyers, and a process they know well. You've usually got a messy inbox
                        and a sinking feeling. That gap is the whole problem, and it's the thing I wanted to fix.
                    </p>
                    <p className="text-lg font-medium text-primary">
                        So I built this to be on one side only. Yours. Only yours. And I built it in a way that proves
                        it.
                    </p>
                </div>

                <ul className="mt-10 flex flex-col gap-6">
                    {PRINCIPLES.map(({ icon, title, body }) => (
                        <li key={title} className="flex items-start gap-4">
                            <FeaturedIcon icon={icon} color="brand" theme="light" size="lg" className="shrink-0" />
                            <div>
                                <h2 className="text-md font-semibold text-primary">{title}</h2>
                                <p className="mt-1 text-md text-tertiary">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="mt-10 flex flex-col gap-3 border-t border-secondary pt-8 sm:flex-row sm:items-center">
                    <Button size="lg" color="primary" href="/" iconTrailing={ArrowRight}>
                        Check your situation
                    </Button>
                    <span className="text-sm text-tertiary">Free, private, and about 90 seconds.</span>
                </div>
                </ShellContent>
            </ShellMain>

            <LandingFooter />
        </Shell>
    );
};

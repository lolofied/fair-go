import { useState } from "react";
import { ArrowRight, BookOpen01, HelpCircle, LogIn01, Menu02, Route, User01 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { arrowSlideClass } from "@/components/layout/shell";
import { isSyncConfigured } from "@/config/supabase";
import { BLOG_INDEX, PRODUCT_GUIDES_INDEX } from "@/config/site-seo";
import { cx } from "@/utils/cx";

export const LandingHeaderMenu = ({ onStartCheck }: { onStartCheck?: () => void }) => {
    const navigate = useNavigate();
    const showRetrieve = isSyncConfigured();
    const [isOpen, setIsOpen] = useState(false);

    const handleStartCheck = () => {
        setIsOpen(false);
        if (onStartCheck) onStartCheck();
        else navigate("/");
    };

    return (
        <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ButtonUtility size="sm" color="secondary" icon={Menu02} aria-label="Open menu" />
            <Dropdown.Popover className="flex w-52 flex-col overflow-hidden p-0" placement="bottom end">
                <Dropdown.Menu
                    onAction={(key) => {
                        if (key === "about") navigate("/about");
                        if (key === "blog") navigate(BLOG_INDEX);
                        if (key === "guides") navigate(PRODUCT_GUIDES_INDEX);
                        if (key === "support") navigate("/support");
                        if (key === "retrieve") navigate("/case/retrieve");
                    }}
                >
                    <Dropdown.Item id="about" icon={User01}>
                        About
                    </Dropdown.Item>
                    <Dropdown.Item id="blog" icon={BookOpen01}>
                        Blog
                    </Dropdown.Item>
                    <Dropdown.Item id="guides" icon={Route}>
                        Guides
                    </Dropdown.Item>
                    <Dropdown.Item id="support" icon={HelpCircle}>
                        Support
                    </Dropdown.Item>
                    {showRetrieve ? (
                        <Dropdown.Item id="retrieve" icon={LogIn01}>
                            Retrieve case
                        </Dropdown.Item>
                    ) : null}
                </Dropdown.Menu>
                <div className="border-t border-secondary p-2">
                    {onStartCheck ? (
                        <Button
                            size="sm"
                            color="primary"
                            iconTrailing={ArrowRight}
                            className={cx("w-full", arrowSlideClass)}
                            onClick={handleStartCheck}
                        >
                            Start free check
                        </Button>
                    ) : (
                        <Button
                            href="/"
                            size="sm"
                            color="primary"
                            iconTrailing={ArrowRight}
                            className={cx("w-full", arrowSlideClass)}
                            onClick={() => setIsOpen(false)}
                        >
                            Start free check
                        </Button>
                    )}
                </div>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

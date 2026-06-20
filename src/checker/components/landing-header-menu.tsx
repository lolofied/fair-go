import { HelpCircle, LogIn01, Menu02, User01 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { isSyncConfigured } from "@/config/supabase";

export const LandingHeaderMenu = () => {
    const navigate = useNavigate();
    const showRetrieve = isSyncConfigured();

    return (
        <Dropdown.Root>
            <ButtonUtility size="sm" color="secondary" icon={Menu02} aria-label="Open menu" />
            <Dropdown.Popover className="w-52" placement="bottom end">
                <Dropdown.Menu
                    onAction={(key) => {
                        if (key === "about") navigate("/about");
                        if (key === "support") navigate("/support");
                        if (key === "retrieve") navigate("/case/retrieve");
                    }}
                >
                    <Dropdown.Item id="about" icon={User01}>
                        About
                    </Dropdown.Item>
                    <Dropdown.Item id="support" icon={HelpCircle}>
                        Support
                    </Dropdown.Item>
                    {showRetrieve ? (
                        <Dropdown.Item id="retrieve" icon={LogIn01}>
                            Retrieve my case
                        </Dropdown.Item>
                    ) : null}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

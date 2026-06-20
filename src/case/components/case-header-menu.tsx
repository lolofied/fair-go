import { HelpCircle, Menu02, Settings01 } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { BuyMeACoffeeIcon } from "@/components/foundations/buy-me-a-coffee-icon";
import { DONATION_URL } from "@/config/donation";

export const CaseHeaderMenu = () => {
    const navigate = useNavigate();

    return (
        <Dropdown.Root>
            <ButtonUtility size="sm" color="secondary" icon={Menu02} aria-label="Open menu" />
            <Dropdown.Popover className="w-52" placement="bottom end">
                <Dropdown.Menu
                    onAction={(key) => {
                        if (key === "settings") navigate("/case/settings");
                        if (key === "support") navigate("/support", { state: { returnTo: "case" } });
                        if (key === "donate") window.open(DONATION_URL, "_blank", "noopener,noreferrer");
                    }}
                >
                    <Dropdown.Item id="settings" icon={Settings01}>
                        Settings
                    </Dropdown.Item>
                    <Dropdown.Item id="support" icon={HelpCircle}>
                        Support
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item id="donate" icon={BuyMeACoffeeIcon}>
                        Buy me a coffee
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

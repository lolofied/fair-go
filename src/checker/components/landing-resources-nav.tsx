import { ChevronDown } from "@untitledui/icons";
import { useNavigate } from "react-router";
import { Button as AriaButton } from "react-aria-components";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { BLOG_INDEX, PRODUCT_GUIDES_INDEX } from "@/config/site-seo";
import { cx } from "@/utils/cx";

const RESOURCE_NAV_ITEMS = [
    { id: "blog", label: "Blog", href: BLOG_INDEX },
    { id: "guides", label: "Product Guides", href: PRODUCT_GUIDES_INDEX },
] as const;

/** Desktop header dropdown: Resources → Blog | Product Guides */
export const LandingResourcesNav = () => {
    const navigate = useNavigate();

    return (
        <Dropdown.Root>
            <AriaButton
                className={({ isPressed, isFocusVisible, isHovered }) =>
                    cx(
                        "flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-sm font-semibold text-tertiary outline-0 outline-offset-2 outline-focus-ring transition duration-100 ease-linear",
                        (isHovered || isPressed) && "text-secondary",
                        isFocusVisible && "outline-2",
                    )
                }
            >
                Resources
                <ChevronDown className="size-4 shrink-0 stroke-[2px] text-fg-quaternary" aria-hidden="true" />
            </AriaButton>

            <Dropdown.Popover className="w-44">
                <Dropdown.Menu
                    onAction={(key) => {
                        const item = RESOURCE_NAV_ITEMS.find((entry) => entry.id === key);

                        if (item) {
                            navigate(item.href);
                        }
                    }}
                >
                    {RESOURCE_NAV_ITEMS.map((item) => (
                        <Dropdown.Item key={item.id} id={item.id} label={item.label} />
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

import { useEffect, useState, type RefObject } from "react";
import { ArrowUp } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { ButtonUtility } from "@/components/base/buttons/button-utility";

interface BackToTopButtonProps {
    /** The initial landing block; the button appears once this scrolls out of view. */
    anchorRef: RefObject<HTMLElement | null>;
}

export const BackToTopButton = ({ anchorRef }: BackToTopButtonProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;

        const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
            threshold: 0,
        });
        observer.observe(anchor);

        return () => observer.disconnect();
    }, [anchorRef]);

    return (
        <AnimatePresence>
            {visible ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-4 left-4 z-40 print:hidden"
                >
                    <ButtonUtility
                        size="sm"
                        color="tertiary"
                        icon={ArrowUp}
                        tooltip="Back to top"
                        aria-label="Back to top"
                        className="size-10 shrink-0 rounded-full bg-brand-solid p-0 text-white shadow-md hover:bg-brand-solid_hover hover:text-white *:data-icon:size-5 *:data-icon:text-white"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    />
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

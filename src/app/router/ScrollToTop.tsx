import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";

function scrollWindowToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
    });
}

export function ScrollToTop() {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            const previousScrollRestoration = window.history.scrollRestoration;
            window.history.scrollRestoration = "manual";

            return () => {
                window.history.scrollRestoration = previousScrollRestoration;
            };
        }

        return undefined;
    }, []);

    useLayoutEffect(() => {
        const scrollFrame = requestAnimationFrame(() => {
            if (hash) {
                const target = document.getElementById(
                    decodeURIComponent(hash.slice(1)),
                );

                if (target) {
                    target.scrollIntoView({
                        block: "start",
                        behavior: "auto",
                    });
                    return;
                }
            }

            scrollWindowToTop();

            window.setTimeout(() => {
                scrollWindowToTop();
            }, 0);
        });

        return () => {
            cancelAnimationFrame(scrollFrame);
        };
    }, [pathname, search, hash]);

    return null;
}

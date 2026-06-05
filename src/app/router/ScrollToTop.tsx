import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
    const { pathname, search, hash } = useLocation();

    useLayoutEffect(() => {
        if (hash) {
            requestAnimationFrame(() => {
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

                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto",
                });
            });

            return;
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });
    }, [pathname, search, hash]);

    return null;
}

import { useEffect } from "react";

import { selectCurrentUser } from "../../features/account/accountSelectors";
import {
    selectAuthStatus,
    selectAuthUser,
} from "../../features/auth/authSelectors";
import { i18n } from "../../shared/i18n/i18n";
import { useAppSelector } from "../store/hooks";
import {
    mapPreferredLocaleToLanguage,
    resolveAnonymousLanguage,
} from "./appLocale";

export function AppLocaleBootstrap() {
    const authStatus = useAppSelector(selectAuthStatus);
    const authUser = useAppSelector(selectAuthUser);
    const currentUser = useAppSelector(selectCurrentUser);

    const preferredLocale =
        currentUser?.preferredLocale ?? authUser?.preferredLocale;

    const isAuthenticated = authStatus === "authenticated";

    const language = isAuthenticated
        ? preferredLocale
            ? mapPreferredLocaleToLanguage(preferredLocale)
            : null
        : resolveAnonymousLanguage();

    useEffect(() => {
        if (!language) {
            return;
        }

        if (i18n.language !== language) {
            void i18n.changeLanguage(language);
        }
    }, [language]);

    return null;
}

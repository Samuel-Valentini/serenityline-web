import { useEffect } from "react";

import { selectCurrentUser } from "../../features/account/accountSelectors";
import { selectAuthUser } from "../../features/auth/authSelectors";
import { i18n } from "../../shared/i18n/i18n";
import { useAppSelector } from "../store/hooks";
import { mapPreferredLocaleToLanguage } from "./appLocale";

export function AppLocaleBootstrap() {
    const authUser = useAppSelector(selectAuthUser);
    const currentUser = useAppSelector(selectCurrentUser);

    const preferredLocale =
        currentUser?.preferredLocale ?? authUser?.preferredLocale;

    const language = mapPreferredLocaleToLanguage(preferredLocale);

    useEffect(() => {
        if (i18n.language !== language) {
            void i18n.changeLanguage(language);
        }
    }, [language]);

    return null;
}

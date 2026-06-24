import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function HtmlLanguageSync() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
        const htmlLanguage = resolvedLanguage?.startsWith("en") ? "en" : "it";

        document.documentElement.lang = htmlLanguage;
    }, [i18n.language, i18n.resolvedLanguage]);

    return null;
}

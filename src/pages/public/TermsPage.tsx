import { useTranslation } from "react-i18next";

import type { SupportedLanguage } from "../../shared/i18n/resources";
import { LegalMarkdownPage } from "./LegalMarkdownPage";
import { termsOfServiceContent } from "./termsOfServiceContent";

export function TermsPage() {
    const { i18n } = useTranslation();
    const currentLanguage: SupportedLanguage =
        i18n.resolvedLanguage === "en" ? "en" : "it";

    return (
        <LegalMarkdownPage
            markdown={termsOfServiceContent[currentLanguage]}
            ariaLabel="Termini di Servizio"
        />
    );
}

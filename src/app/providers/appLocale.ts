import {
    defaultLanguage,
    type SupportedLanguage,
} from "../../shared/i18n/resources";

export function mapPreferredLocaleToLanguage(
    preferredLocale: string | null | undefined,
): SupportedLanguage {
    if (preferredLocale === "en-US") {
        return "en";
    }

    if (preferredLocale === "it-IT") {
        return "it";
    }

    return defaultLanguage;
}

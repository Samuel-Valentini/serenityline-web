import {
    defaultLanguage,
    type SupportedLanguage,
} from "../../shared/i18n/resources";

const ANONYMOUS_LANGUAGE_STORAGE_KEY = "serenityline.anonymousLanguage";

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
    return value === "it" || value === "en";
}

export function getStoredAnonymousLanguage(): SupportedLanguage | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedLanguage = window.localStorage.getItem(
        ANONYMOUS_LANGUAGE_STORAGE_KEY,
    );

    return isSupportedLanguage(storedLanguage) ? storedLanguage : null;
}

export function setStoredAnonymousLanguage(language: SupportedLanguage) {
    window.localStorage.setItem(ANONYMOUS_LANGUAGE_STORAGE_KEY, language);
}

export function resolveAnonymousLanguage(): SupportedLanguage {
    return getStoredAnonymousLanguage() ?? defaultLanguage;
}

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

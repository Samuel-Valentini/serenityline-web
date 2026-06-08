import type { SupportedLanguage } from "../../shared/i18n/resources";

import termsOfServiceEn from "./termsOfService.en.md?raw";
import termsOfServiceIt from "./termsOfService.it.md?raw";

export const termsOfServiceContent: Record<SupportedLanguage, string> = {
    it: termsOfServiceIt,
    en: termsOfServiceEn,
};

import type { SupportedLanguage } from "../../shared/i18n/resources";

import privacyPolicyEn from "./privacyPolicy.en.md?raw";
import privacyPolicyIt from "./privacyPolicy.it.md?raw";

export const privacyPolicyContent: Record<SupportedLanguage, string> = {
    it: privacyPolicyIt,
    en: privacyPolicyEn,
};

export type LegalConsentState = {
    termsAccepted: boolean;
    privacyRead: boolean;
    specificClausesAccepted: boolean;
};

const legalConsentKeys: Array<keyof LegalConsentState> = [
    "termsAccepted",
    "privacyRead",
    "specificClausesAccepted",
];

export function hasAcceptedAllLegalConsents(consents: LegalConsentState) {
    return legalConsentKeys.every((key) => consents[key]);
}

export function createEmptyLegalConsentState(): LegalConsentState {
    return {
        termsAccepted: false,
        privacyRead: false,
        specificClausesAccepted: false,
    };
}

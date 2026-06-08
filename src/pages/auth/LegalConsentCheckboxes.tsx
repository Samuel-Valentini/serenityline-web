import { useTranslation } from "react-i18next";

import { ROUTES } from "../../shared/constants/routes";

import type { LegalConsentState } from "./legalConsentUtils";

type LegalConsentKey = keyof LegalConsentState;

type LegalConsentCheckboxesProps = {
    consents: LegalConsentState;
    disabled?: boolean;
    idPrefix: string;
    onChange: (nextConsents: LegalConsentState) => void;
    translationNamespace: "authRegister" | "authAcceptInvitation";
};

export function LegalConsentCheckboxes({
    consents,
    disabled = false,
    idPrefix,
    onChange,
    translationNamespace,
}: LegalConsentCheckboxesProps) {
    const { t } = useTranslation(translationNamespace);

    function updateConsent(key: LegalConsentKey, checked: boolean) {
        onChange({
            ...consents,
            [key]: checked,
        });
    }

    return (
        <fieldset className="sl-legal-consent-group">
            <legend className="sl-legal-consent-title">
                {t("legalConsent.title")}
            </legend>

            <p className="sl-legal-consent-helper">
                {t("legalConsent.subtitle")}
            </p>

            <div className="form-check sl-legal-consent-item">
                <input
                    checked={consents.termsAccepted}
                    className="form-check-input"
                    disabled={disabled}
                    id={`${idPrefix}-termsAccepted`}
                    onChange={(event) =>
                        updateConsent("termsAccepted", event.target.checked)
                    }
                    required
                    type="checkbox"
                />
                <label
                    className="form-check-label"
                    htmlFor={`${idPrefix}-termsAccepted`}>
                    {t("legalConsent.termsPrefix")}
                    <a
                        href={ROUTES.public.terms}
                        rel="noreferrer"
                        target="_blank">
                        {t("legalConsent.termsLink")}
                    </a>
                    {t("legalConsent.termsSuffix")}
                </label>
            </div>

            <div className="form-check sl-legal-consent-item">
                <input
                    checked={consents.privacyRead}
                    className="form-check-input"
                    disabled={disabled}
                    id={`${idPrefix}-privacyRead`}
                    onChange={(event) =>
                        updateConsent("privacyRead", event.target.checked)
                    }
                    required
                    type="checkbox"
                />
                <label
                    className="form-check-label"
                    htmlFor={`${idPrefix}-privacyRead`}>
                    {t("legalConsent.privacyPrefix")}
                    <a
                        href={ROUTES.public.privacy}
                        rel="noreferrer"
                        target="_blank">
                        {t("legalConsent.privacyLink")}
                    </a>
                    {t("legalConsent.privacySuffix")}
                </label>
            </div>

            <div className="form-check sl-legal-consent-item">
                <input
                    checked={consents.specificClausesAccepted}
                    className="form-check-input"
                    disabled={disabled}
                    id={`${idPrefix}-specificClausesAccepted`}
                    onChange={(event) =>
                        updateConsent(
                            "specificClausesAccepted",
                            event.target.checked,
                        )
                    }
                    required
                    type="checkbox"
                />
                <label
                    className="form-check-label"
                    htmlFor={`${idPrefix}-specificClausesAccepted`}>
                    {t("legalConsent.specificClausesPrefix")}
                    <a
                        href={`${ROUTES.public.terms}#articolo-32`}
                        rel="noreferrer"
                        target="_blank">
                        {t("legalConsent.specificClausesLink")}
                    </a>
                    {t("legalConsent.specificClausesSuffix")}
                </label>
            </div>
        </fieldset>
    );
}

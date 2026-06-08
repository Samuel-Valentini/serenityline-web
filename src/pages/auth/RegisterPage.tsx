import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";
import { register } from "../../features/auth/authApi";
import type {
    RegisterRequestDto,
    RegisterResponseDto,
} from "../../features/auth/authApiTypes";
import { LegalConsentCheckboxes } from "./LegalConsentCheckboxes";
import {
    createEmptyLegalConsentState,
    hasAcceptedAllLegalConsents,
} from "./legalConsentUtils";

type RegisterFormError = {
    code: string;
    message: string;
};

function getApiErrorMessage(error: unknown): RegisterFormError {
    if (error instanceof ApiError) {
        const body = error.body;

        if (
            typeof body === "object" &&
            body !== null &&
            "code" in body &&
            typeof body.code === "string"
        ) {
            return {
                code: body.code,
                message:
                    "message" in body && typeof body.message === "string"
                        ? body.message
                        : body.code,
            };
        }

        return {
            code: `http.${error.status}`,
            message: error.message,
        };
    }

    if (error instanceof Error) {
        return {
            code: "error.unexpected",
            message: error.message,
        };
    }

    return {
        code: "error.unexpected",
        message: "Errore imprevisto.",
    };
}

export function RegisterPage() {
    const { t, i18n } = useTranslation("authRegister");

    const defaultPreferredLocale = useMemo<
        RegisterRequestDto["preferredLocale"]
    >(
        () => (i18n.language.startsWith("en") ? "en-US" : "it-IT"),
        [i18n.language],
    );

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [preferredLocale, setPreferredLocale] = useState<
        RegisterRequestDto["preferredLocale"]
    >(defaultPreferredLocale);
    const [paymentEmailRemindersEnabled, setPaymentEmailRemindersEnabled] =
        useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<RegisterFormError | null>(null);
    const [registeredUser, setRegisteredUser] =
        useState<RegisterResponseDto | null>(null);
    const [legalConsents, setLegalConsents] = useState(
        createEmptyLegalConsentState,
    );

    const hasRequiredLegalConsents = hasAcceptedAllLegalConsents(legalConsents);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFormError(null);

        if (!hasRequiredLegalConsents) {
            setFormError({
                code: "auth.legalConsentRequired",
                message: t("legalConsent.requiredError"),
            });
            return;
        }

        if (password.length < 10) {
            setFormError({
                code: "auth.passwordTooShort",
                message: t("passwordTooShort"),
            });
            return;
        }

        if (password !== confirmPassword) {
            setFormError({
                code: "auth.passwordMismatch",
                message: t("passwordMismatch"),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                userName: userName.trim(),
                email: email.trim(),
                password,
                preferredLocale,
                paymentEmailRemindersEnabled,
            });

            setRegisteredUser(response);
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            setFormError(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (registeredUser) {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="register-success-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="register-success-title">{t("successTitle")}</h1>

                    <p className="text-muted mb-4">{t("successText")}</p>

                    <div className="sl-auth-summary mb-4">
                        <span>{t("successEmailLabel")}</span>
                        <strong>{registeredUser.email}</strong>
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                        <Link
                            className="btn btn-primary"
                            to={ROUTES.auth.login}>
                            {t("goToLogin")}
                        </Link>

                        <Link
                            className="btn btn-outline-primary"
                            to={ROUTES.public.home}>
                            {t("backHome")}
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="sl-auth-page">
            <section
                className="sl-auth-card sl-auth-card--wide"
                aria-labelledby="register-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="register-title">{t("title")}</h1>

                <p className="text-muted mb-4">{t("subtitle")}</p>

                {formError ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("errorTitle")}</strong>
                        <br />
                        {formError.message}
                    </div>
                ) : null}

                <form className="d-grid gap-3" onSubmit={handleSubmit}>
                    <div>
                        <label className="form-label" htmlFor="userName">
                            {t("userNameLabel")}
                        </label>
                        <input
                            autoComplete="name"
                            className="form-control"
                            disabled={isSubmitting}
                            id="userName"
                            name="userName"
                            onChange={(event) =>
                                setUserName(event.target.value)
                            }
                            placeholder={t("userNamePlaceholder")}
                            required
                            value={userName}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="registerEmail">
                            {t("emailLabel")}
                        </label>
                        <input
                            autoComplete="email"
                            className="form-control"
                            disabled={isSubmitting}
                            id="registerEmail"
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t("emailPlaceholder")}
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    <div>
                        <label
                            className="form-label"
                            htmlFor="registerPassword">
                            {t("passwordLabel")}
                        </label>
                        <input
                            autoComplete="new-password"
                            className="form-control"
                            disabled={isSubmitting}
                            id="registerPassword"
                            minLength={10}
                            name="password"
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder={t("passwordPlaceholder")}
                            required
                            type="password"
                            value={password}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="confirmPassword">
                            {t("confirmPasswordLabel")}
                        </label>
                        <input
                            autoComplete="new-password"
                            className="form-control"
                            disabled={isSubmitting}
                            id="confirmPassword"
                            minLength={10}
                            name="confirmPassword"
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder={t("confirmPasswordPlaceholder")}
                            required
                            type="password"
                            value={confirmPassword}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="preferredLocale">
                            {t("preferredLocaleLabel")}
                        </label>
                        <select
                            className="form-select"
                            disabled={isSubmitting}
                            id="preferredLocale"
                            name="preferredLocale"
                            onChange={(event) =>
                                setPreferredLocale(
                                    event.target
                                        .value as RegisterRequestDto["preferredLocale"],
                                )
                            }
                            value={preferredLocale}>
                            <option value="it-IT">
                                {t("preferredLocaleIt")}
                            </option>
                            <option value="en-US">
                                {t("preferredLocaleEn")}
                            </option>
                        </select>
                    </div>

                    <div className="form-check">
                        <input
                            checked={paymentEmailRemindersEnabled}
                            className="form-check-input"
                            disabled={isSubmitting}
                            id="paymentEmailRemindersEnabled"
                            onChange={(event) =>
                                setPaymentEmailRemindersEnabled(
                                    event.target.checked,
                                )
                            }
                            type="checkbox"
                        />
                        <label
                            className="form-check-label"
                            htmlFor="paymentEmailRemindersEnabled">
                            {t("paymentRemindersLabel")}
                        </label>
                    </div>

                    <LegalConsentCheckboxes
                        consents={legalConsents}
                        disabled={isSubmitting}
                        idPrefix="register"
                        onChange={setLegalConsents}
                        translationNamespace="authRegister"
                    />

                    <button
                        className="btn btn-primary btn-lg"
                        disabled={isSubmitting || !hasRequiredLegalConsents}
                        type="submit">
                        {isSubmitting ? t("submitting") : t("submit")}
                    </button>
                </form>

                <div className="d-flex flex-wrap gap-3 mt-4">
                    <Link to={ROUTES.auth.login}>{t("goToLogin")}</Link>
                    <Link to={ROUTES.public.home}>{t("backHome")}</Link>
                </div>
            </section>
        </main>
    );
}

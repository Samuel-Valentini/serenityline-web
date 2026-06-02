import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { forgotPassword } from "../../features/auth/authApi";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type ForgotPasswordError = {
    code: string;
    message: string;
};

function getForgotPasswordError(
    error: unknown,
    fallbackMessage: string,
): ForgotPasswordError {
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
                        : fallbackMessage,
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
        message: fallbackMessage,
    };
}

export function ForgotPasswordPage() {
    const { t } = useTranslation("authForgotPassword");

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<ForgotPasswordError | null>(null);

    async function submitForgotPassword() {
        setIsSubmitting(true);
        setError(null);

        try {
            await forgotPassword({
                email: email.trim(),
            });

            setHasSubmitted(true);
        } catch (requestError) {
            setError(getForgotPasswordError(requestError, t("errorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    }
    if (hasSubmitted) {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="forgot-password-success-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="forgot-password-success-title">
                        {t("successTitle")}
                    </h1>
                    <p className="text-muted mb-4">{t("successText")}</p>

                    <div className="d-flex flex-wrap gap-3">
                        <Link
                            className="btn btn-primary"
                            to={ROUTES.auth.login}>
                            {t("backToLogin")}
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
                className="sl-auth-card"
                aria-labelledby="forgot-password-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="forgot-password-title">{t("title")}</h1>
                <p className="text-muted mb-4">{t("subtitle")}</p>

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("errorTitle")}</strong>
                        <br />
                        {error.message}
                    </div>
                ) : null}

                <form
                    className="d-grid gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submitForgotPassword();
                    }}>
                    <div>
                        <label
                            className="form-label"
                            htmlFor="forgotPasswordEmail">
                            {t("emailLabel")}
                        </label>
                        <input
                            autoComplete="email"
                            className="form-control"
                            disabled={isSubmitting}
                            id="forgotPasswordEmail"
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t("emailPlaceholder")}
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    <button
                        className="btn btn-primary btn-lg"
                        disabled={isSubmitting}
                        type="submit">
                        {isSubmitting ? t("submitting") : t("submit")}
                    </button>
                </form>

                <div className="d-flex flex-wrap gap-3 mt-4">
                    <Link to={ROUTES.auth.login}>{t("backToLogin")}</Link>
                    <Link to={ROUTES.public.home}>{t("backHome")}</Link>
                </div>
            </section>
        </main>
    );
}

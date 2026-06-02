import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { getTokenFromHash } from "../../shared/routing/hashToken";

import { resetPassword } from "../../features/auth/authApi";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type ResetPasswordError = {
    code: string;
    message: string;
};

function getResetPasswordError(
    error: unknown,
    fallbackMessage: string,
): ResetPasswordError {
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

export function ResetPasswordPage() {
    const { t } = useTranslation("authResetPassword");
    const location = useLocation();

    const tokenFromHash = useMemo(
        () => getTokenFromHash(location.hash),
        [location.hash],
    );

    const [token, setToken] = useState(tokenFromHash);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasResetPassword, setHasResetPassword] = useState(false);
    const [error, setError] = useState<ResetPasswordError | null>(null);

    async function submitResetPassword() {
        setError(null);

        if (password.length < 10) {
            setError({
                code: "auth.passwordTooShort",
                message: t("passwordTooShort"),
            });
            return;
        }

        if (password !== confirmPassword) {
            setError({
                code: "auth.passwordMismatch",
                message: t("passwordMismatch"),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await resetPassword({
                resetToken: token.trim(),
                newPassword: password,
            });

            setPassword("");
            setConfirmPassword("");
            setHasResetPassword(true);
        } catch (resetError) {
            setError(getResetPasswordError(resetError, t("errorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (hasResetPassword) {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="reset-password-success-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="reset-password-success-title">
                        {t("successTitle")}
                    </h1>
                    <p className="text-muted mb-4">{t("successText")}</p>

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
                className="sl-auth-card"
                aria-labelledby="reset-password-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="reset-password-title">{t("title")}</h1>
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
                        void submitResetPassword();
                    }}>
                    <div>
                        <label
                            className="form-label"
                            htmlFor="resetPasswordToken">
                            {t("tokenLabel")}
                        </label>
                        <input
                            className="form-control"
                            disabled={isSubmitting}
                            id="resetPasswordToken"
                            name="token"
                            onChange={(event) => setToken(event.target.value)}
                            placeholder={t("tokenPlaceholder")}
                            required
                            value={token}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="newPassword">
                            {t("passwordLabel")}
                        </label>
                        <input
                            autoComplete="new-password"
                            className="form-control"
                            disabled={isSubmitting}
                            id="newPassword"
                            minLength={10}
                            name="newPassword"
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
                        <label
                            className="form-label"
                            htmlFor="confirmNewPassword">
                            {t("confirmPasswordLabel")}
                        </label>
                        <input
                            autoComplete="new-password"
                            className="form-control"
                            disabled={isSubmitting}
                            id="confirmNewPassword"
                            minLength={10}
                            name="confirmNewPassword"
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder={t("confirmPasswordPlaceholder")}
                            required
                            type="password"
                            value={confirmPassword}
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
                    <Link to={ROUTES.auth.login}>{t("goToLogin")}</Link>
                    <Link to={ROUTES.public.home}>{t("backHome")}</Link>
                </div>
            </section>
        </main>
    );
}

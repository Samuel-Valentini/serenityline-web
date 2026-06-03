import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    resendEmailVerification,
    restoreAccount,
} from "../../features/auth/authApi";
import type { EmailVerificationRequiredResponseDto } from "../../features/auth/authApiTypes";
import {
    selectAuthError,
    selectIsAuthenticated,
    selectIsCheckingAuth,
    selectIsTwoFactorRequired,
} from "../../features/auth/authSelectors";
import { loginUser } from "../../features/auth/authThunks";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type RouteLocationState = {
    from?: {
        pathname?: string;
    };
};

function getLoginApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (error instanceof ApiError) {
        const body = error.body;

        if (
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
        ) {
            return body.message;
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
}

export function LoginPage() {
    const { t } = useTranslation("auth");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isTwoFactorRequired = useAppSelector(selectIsTwoFactorRequired);
    const authError = useAppSelector(selectAuthError);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [
        emailVerificationRequiredOverride,
        setEmailVerificationRequiredOverride,
    ] = useState<EmailVerificationRequiredResponseDto | null>(null);
    const [isResendingVerificationEmail, setIsResendingVerificationEmail] =
        useState(false);
    const [resendSuccessMessage, setResendSuccessMessage] = useState<
        string | null
    >(null);
    const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(
        null,
    );
    const [isRestoringAccount, setIsRestoringAccount] = useState(false);
    const [restoreSuccessMessage, setRestoreSuccessMessage] = useState<
        string | null
    >(null);
    const [restoreErrorMessage, setRestoreErrorMessage] = useState<
        string | null
    >(null);
    const [hasRestoredAccount, setHasRestoredAccount] = useState(false);

    const emailVerificationRequired =
        emailVerificationRequiredOverride ??
        authError?.emailVerificationRequired ??
        null;

    const restoreAccountChallenge = hasRestoredAccount
        ? null
        : (authError?.restoreAccountChallenge ?? null);

    const locationState = location.state as RouteLocationState | null;
    const redirectTo = locationState?.from?.pathname ?? ROUTES.app.dashboard;

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTo]);

    useEffect(() => {
        if (isTwoFactorRequired) {
            navigate(ROUTES.auth.login2fa, {
                replace: true,
                state: location.state,
            });
        }
    }, [isTwoFactorRequired, location.state, navigate]);

    function submitLogin() {
        setEmailVerificationRequiredOverride(null);
        setResendSuccessMessage(null);
        setResendErrorMessage(null);
        setRestoreSuccessMessage(null);
        setRestoreErrorMessage(null);
        setHasRestoredAccount(false);

        void dispatch(
            loginUser({
                email: email.trim(),
                password,
            }),
        );
    }

    async function submitResendVerificationEmail() {
        if (!emailVerificationRequired) {
            return;
        }

        setIsResendingVerificationEmail(true);
        setResendSuccessMessage(null);
        setResendErrorMessage(null);

        try {
            const response = await resendEmailVerification({
                emailVerificationResendToken:
                    emailVerificationRequired.emailVerificationResendToken,
            });

            setEmailVerificationRequiredOverride(response);
            setResendSuccessMessage(t("emailVerificationResendSuccess"));
        } catch (error) {
            setResendErrorMessage(
                getLoginApiErrorMessage(
                    error,
                    t("emailVerificationResendErrorFallback"),
                ),
            );
        } finally {
            setIsResendingVerificationEmail(false);
        }
    }

    async function submitRestoreAccount() {
        if (!restoreAccountChallenge) {
            return;
        }

        setIsRestoringAccount(true);
        setRestoreSuccessMessage(null);
        setRestoreErrorMessage(null);

        try {
            const result = await restoreAccount({
                restoreToken: restoreAccountChallenge.restoreToken,
            });

            setHasRestoredAccount(true);

            if (result.type === "emailVerificationRequired") {
                setEmailVerificationRequiredOverride(
                    result.emailVerificationRequired,
                );
                setRestoreSuccessMessage(
                    t("restoreAccountEmailVerificationRequiredSuccess"),
                );
                return;
            }

            setRestoreSuccessMessage(t("restoreAccountSuccess"));
        } catch (error) {
            setRestoreErrorMessage(
                getLoginApiErrorMessage(
                    error,
                    t("restoreAccountErrorFallback"),
                ),
            );
        } finally {
            setIsRestoringAccount(false);
        }
    }

    const shouldShowGenericAuthError =
        authError !== null &&
        !authError.emailVerificationRequired &&
        !authError.restoreAccountChallenge;

    return (
        <main className="sl-auth-page">
            <section className="sl-auth-card" aria-labelledby="login-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="login-title">{t("loginTitle")}</h1>

                <p className="text-muted mb-4">{t("loginSubtitle")}</p>

                {emailVerificationRequired ? (
                    <div className="alert alert-warning" role="alert">
                        <strong>{t("emailVerificationRequiredTitle")}</strong>
                        <p className="mb-3 mt-2">
                            {t("emailVerificationRequiredText")}
                        </p>

                        <div className="sl-auth-summary mb-3">
                            <span>{t("emailVerificationEmailLabel")}</span>
                            <strong>{emailVerificationRequired.email}</strong>
                        </div>

                        {resendSuccessMessage ? (
                            <div
                                className="alert alert-success mb-3"
                                role="status">
                                {resendSuccessMessage}
                            </div>
                        ) : null}

                        {resendErrorMessage ? (
                            <div
                                className="alert alert-danger mb-3"
                                role="alert">
                                <strong>
                                    {t("emailVerificationResendErrorTitle")}
                                </strong>
                                <br />
                                {resendErrorMessage}
                            </div>
                        ) : null}

                        <button
                            className="btn btn-outline-primary"
                            disabled={isResendingVerificationEmail}
                            onClick={() => {
                                void submitResendVerificationEmail();
                            }}
                            type="button">
                            {isResendingVerificationEmail
                                ? t("emailVerificationResendSubmitting")
                                : t("emailVerificationResendSubmit")}
                        </button>
                    </div>
                ) : null}

                {restoreAccountChallenge ? (
                    <div className="alert alert-warning" role="alert">
                        <strong>{t("restoreAccountRequiredTitle")}</strong>
                        <p className="mb-3 mt-2">
                            {t("restoreAccountRequiredText")}
                        </p>

                        {restoreErrorMessage ? (
                            <div
                                className="alert alert-danger mb-3"
                                role="alert">
                                <strong>{t("restoreAccountErrorTitle")}</strong>
                                <br />
                                {restoreErrorMessage}
                            </div>
                        ) : null}

                        <button
                            className="btn btn-outline-primary"
                            disabled={isRestoringAccount}
                            onClick={() => {
                                void submitRestoreAccount();
                            }}
                            type="button">
                            {isRestoringAccount
                                ? t("restoreAccountSubmitting")
                                : t("restoreAccountSubmit")}
                        </button>
                    </div>
                ) : null}

                {restoreSuccessMessage ? (
                    <div className="alert alert-success" role="status">
                        {restoreSuccessMessage}
                    </div>
                ) : null}

                {shouldShowGenericAuthError ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("loginErrorTitle")}</strong>
                        <br />
                        {authError.message ?? authError.code}
                    </div>
                ) : null}

                <form
                    className="d-grid gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitLogin();
                    }}>
                    <div>
                        <label className="form-label" htmlFor="email">
                            {t("emailLabel")}
                        </label>
                        <input
                            autoComplete="email"
                            className="form-control"
                            disabled={isCheckingAuth}
                            id="email"
                            name="email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t("emailPlaceholder")}
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="password">
                            {t("passwordLabel")}
                        </label>
                        <input
                            autoComplete="current-password"
                            className="form-control"
                            disabled={isCheckingAuth}
                            id="password"
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

                    <button
                        className="btn btn-primary btn-lg"
                        disabled={isCheckingAuth}
                        type="submit">
                        {isCheckingAuth
                            ? t("loginSubmitting")
                            : t("loginSubmit")}
                    </button>
                </form>

                <div className="d-flex flex-wrap gap-3 mt-4">
                    <Link to={ROUTES.auth.forgotPassword}>
                        {t("forgotPasswordLink")}
                    </Link>

                    <Link to={ROUTES.auth.register}>{t("registerLink")}</Link>

                    <Link to={ROUTES.public.home}>{t("backHome")}</Link>
                </div>
            </section>
        </main>
    );
}

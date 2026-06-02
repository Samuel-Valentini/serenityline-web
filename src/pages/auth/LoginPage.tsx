import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectAuthError,
    selectIsAuthenticated,
    selectIsCheckingAuth,
    selectIsTwoFactorRequired,
} from "../../features/auth/authSelectors";
import { loginUser } from "../../features/auth/authThunks";
import { ROUTES } from "../../shared/constants/routes";

type RouteLocationState = {
    from?: {
        pathname?: string;
    };
};

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

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        void dispatch(
            loginUser({
                email: email.trim(),
                password,
            }),
        );
    }

    return (
        <main className="sl-auth-page">
            <section className="sl-auth-card" aria-labelledby="login-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="login-title">{t("loginTitle")}</h1>

                <p className="text-muted mb-4">{t("loginSubtitle")}</p>

                {authError ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("loginErrorTitle")}</strong>
                        <br />
                        {authError.message ?? authError.code}
                    </div>
                ) : null}

                <form className="d-grid gap-3" onSubmit={handleSubmit}>
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

import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectAuthError,
    selectAuthTwoFactorChallenge,
    selectIsAuthenticated,
    selectIsCheckingAuth,
} from "../../features/auth/authSelectors";
import { verifyLogin2faCode } from "../../features/auth/authThunks";
import { ROUTES } from "../../shared/constants/routes";

type RouteLocationState = {
    from?: {
        pathname?: string;
    };
};

export function Login2faPage() {
    const { t } = useTranslation("auth");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const challenge = useAppSelector(selectAuthTwoFactorChallenge);
    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const authError = useAppSelector(selectAuthError);

    const [code, setCode] = useState("");

    const locationState = location.state as RouteLocationState | null;
    const redirectTo = locationState?.from?.pathname ?? ROUTES.app.dashboard;

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTo]);

    useEffect(() => {
        if (!challenge && !isCheckingAuth && !isAuthenticated) {
            navigate(ROUTES.auth.login, { replace: true });
        }
    }, [challenge, isAuthenticated, isCheckingAuth, navigate]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!challenge) {
            return;
        }

        void dispatch(
            verifyLogin2faCode({
                challengeId: challenge.challengeId,
                code: code.trim(),
            }),
        );
    }

    return (
        <main className="sl-auth-page">
            <section
                className="sl-auth-card"
                aria-labelledby="two-factor-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="two-factor-title">{t("twoFactorTitle")}</h1>

                <p className="text-muted mb-4">{t("twoFactorSubtitle")}</p>

                {authError ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("loginErrorTitle")}</strong>
                        <br />
                        {authError.message ?? authError.code}
                    </div>
                ) : null}

                <form className="d-grid gap-3" onSubmit={handleSubmit}>
                    <div>
                        <label className="form-label" htmlFor="twoFactorCode">
                            {t("twoFactorCodeLabel")}
                        </label>
                        <input
                            autoComplete="one-time-code"
                            className="form-control"
                            disabled={isCheckingAuth}
                            id="twoFactorCode"
                            inputMode="numeric"
                            maxLength={8}
                            name="twoFactorCode"
                            onChange={(event) => setCode(event.target.value)}
                            placeholder={t("twoFactorCodePlaceholder")}
                            required
                            value={code}
                        />
                    </div>

                    <button
                        className="btn btn-primary btn-lg"
                        disabled={isCheckingAuth || !challenge}
                        type="submit">
                        {isCheckingAuth
                            ? t("twoFactorSubmitting")
                            : t("twoFactorSubmit")}
                    </button>
                </form>

                <div className="mt-4">
                    <Link to={ROUTES.auth.login}>{t("backToLogin")}</Link>
                </div>
            </section>
        </main>
    );
}

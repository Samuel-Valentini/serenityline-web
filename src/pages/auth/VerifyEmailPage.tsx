import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { getTokenFromHash } from "../../shared/routing/hashToken";

import { verifyEmail } from "../../features/auth/authApi";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type VerificationStatus = "manual" | "verifying" | "success" | "error";

type VerificationError = {
    code: string;
    message: string;
};

function getVerificationError(
    error: unknown,
    fallbackMessage: string,
): VerificationError {
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

export function VerifyEmailPage() {
    const { t } = useTranslation("authVerifyEmail");
    const location = useLocation();

    const hashToken = getTokenFromHash(location.hash);
    const lastSubmittedTokenRef = useRef<string | null>(null);

    const [manualToken, setManualToken] = useState("");
    const [status, setStatus] = useState<VerificationStatus>(
        hashToken ? "verifying" : "manual",
    );
    const [error, setError] = useState<VerificationError | null>(null);

    const submitVerification = useCallback(
        async (tokenToVerify: string) => {
            const token = tokenToVerify.trim();

            if (!token) {
                setStatus("manual");
                return;
            }

            lastSubmittedTokenRef.current = token;
            setStatus("verifying");
            setError(null);

            try {
                const response = await verifyEmail({ token });

                setStatus(response.emailVerified ? "success" : "error");

                if (!response.emailVerified) {
                    setError({
                        code: "auth.emailNotVerified",
                        message: t("errorFallback"),
                    });
                }
            } catch (verificationError) {
                setStatus("error");
                setError(
                    getVerificationError(verificationError, t("errorFallback")),
                );
            }
        },
        [t],
    );

    useEffect(() => {
        if (!hashToken || lastSubmittedTokenRef.current === hashToken) {
            return;
        }

        void submitVerification(hashToken);
    }, [hashToken, submitVerification]);

    function submitManualVerification() {
        void submitVerification(manualToken);
    }

    if (status === "success") {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="verify-email-success-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="verify-email-success-title">{t("successTitle")}</h1>
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

    if (status === "verifying") {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="verify-email-loading-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="verify-email-loading-title">
                        {t("verifyingTitle")}
                    </h1>
                    <p className="text-muted mb-0">{t("verifyingText")}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="sl-auth-page">
            <section
                className="sl-auth-card"
                aria-labelledby="verify-email-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="verify-email-title">
                    {status === "error" ? t("errorTitle") : t("manualTitle")}
                </h1>

                <p className="text-muted mb-4">
                    {status === "error"
                        ? (error?.message ?? t("errorFallback"))
                        : t("manualText")}
                </p>

                {status === "error" ? (
                    <div className="alert alert-danger" role="alert">
                        {error?.message ?? t("errorFallback")}
                    </div>
                ) : null}

                <form
                    className="d-grid gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitManualVerification();
                    }}>
                    <div>
                        <label
                            className="form-label"
                            htmlFor="verificationToken">
                            {t("tokenLabel")}
                        </label>
                        <input
                            className="form-control"
                            id="verificationToken"
                            name="verificationToken"
                            onChange={(event) =>
                                setManualToken(event.target.value)
                            }
                            placeholder={t("tokenPlaceholder")}
                            required
                            value={manualToken}
                        />
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit">
                        {t("submit")}
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

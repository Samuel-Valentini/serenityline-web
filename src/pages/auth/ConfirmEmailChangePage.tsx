import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { useAppDispatch } from "../../app/store/hooks";
import { accountCleared } from "../../features/account/accountSlice";
import { confirmEmailChange } from "../../features/auth/authApi";
import { authLoggedOut } from "../../features/auth/authSlice";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";
import { getTokenFromHash } from "../../shared/routing/hashToken";

type ConfirmEmailChangeStatus = "manual" | "confirming" | "success" | "error";

type ConfirmEmailChangeError = {
    code: string;
    message: string;
};

function getConfirmEmailChangeError(
    error: unknown,
    fallbackMessage: string,
): ConfirmEmailChangeError {
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

export function ConfirmEmailChangePage() {
    const { t } = useTranslation("authConfirmEmailChange");
    const location = useLocation();
    const dispatch = useAppDispatch();

    const hashToken = getTokenFromHash(location.hash);
    const lastSubmittedTokenRef = useRef<string | null>(null);

    const [manualToken, setManualToken] = useState("");
    const [status, setStatus] = useState<ConfirmEmailChangeStatus>(
        hashToken ? "confirming" : "manual",
    );
    const [error, setError] = useState<ConfirmEmailChangeError | null>(null);

    const submitConfirmation = useCallback(
        async (tokenToConfirm: string) => {
            const token = tokenToConfirm.trim();

            if (!token) {
                setStatus("manual");
                return;
            }

            lastSubmittedTokenRef.current = token;
            setStatus("confirming");
            setError(null);

            try {
                await confirmEmailChange({ token });

                dispatch(authLoggedOut());
                dispatch(accountCleared());
                setStatus("success");
            } catch (confirmationError) {
                setStatus("error");
                setError(
                    getConfirmEmailChangeError(
                        confirmationError,
                        t("errorFallback"),
                    ),
                );
            }
        },
        [dispatch, t],
    );

    useEffect(() => {
        if (!hashToken || lastSubmittedTokenRef.current === hashToken) {
            return;
        }

        void submitConfirmation(hashToken);
    }, [hashToken, submitConfirmation]);

    function submitManualConfirmation() {
        void submitConfirmation(manualToken);
    }

    if (status === "success") {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="confirm-email-change-success-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="confirm-email-change-success-title">
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

    if (status === "confirming") {
        return (
            <main className="sl-auth-page">
                <section
                    className="sl-auth-card"
                    aria-labelledby="confirm-email-change-loading-title">
                    <p className="sl-eyebrow">SerenityLine</p>

                    <h1 id="confirm-email-change-loading-title">
                        {t("confirmingTitle")}
                    </h1>
                    <p className="text-muted mb-0">{t("confirmingText")}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="sl-auth-page">
            <section
                className="sl-auth-card"
                aria-labelledby="confirm-email-change-title">
                <p className="sl-eyebrow">SerenityLine</p>

                <h1 id="confirm-email-change-title">
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
                        submitManualConfirmation();
                    }}>
                    <div>
                        <label
                            className="form-label"
                            htmlFor="emailChangeToken">
                            {t("tokenLabel")}
                        </label>
                        <input
                            className="form-control"
                            id="emailChangeToken"
                            name="emailChangeToken"
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

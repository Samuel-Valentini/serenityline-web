import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";

import { useAppSelector } from "../../app/store/hooks";
import {
    selectCurrentUser,
    selectIsCurrentUserLoading,
} from "../../features/account/accountSelectors";
import type {
    PreferredLocale,
    UserRole,
} from "../../features/account/api/accountApiTypes";
import { inviteUser } from "../../features/auth/authApi";
import type { UserInvitationResponseDto } from "../../features/auth/authApiTypes";
import {
    selectAccounts,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type InvitableUserRole = Exclude<UserRole, "OWNER">;

const INVITABLE_ROLES: InvitableUserRole[] = [
    "SUPER_COLLABORATOR",
    "VIEWER_COLLABORATOR",
    "COLLABORATOR",
];

const PREFERRED_LOCALES: PreferredLocale[] = ["it-IT", "en-US"];

type AdministrationError = {
    code: string;
    message: string;
};

function getAdministrationError(
    error: unknown,
    fallbackMessage: string,
): AdministrationError {
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

export function AdministrationPage() {
    const { t } = useTranslation("administration");

    const currentUser = useAppSelector(selectCurrentUser);
    const isCurrentUserLoading = useAppSelector(selectIsCurrentUserLoading);
    const accounts = useAppSelector(selectAccounts);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [userRole, setUserRole] = useState<InvitableUserRole>(
        "VIEWER_COLLABORATOR",
    );
    const [preferredLocale, setPreferredLocale] =
        useState<PreferredLocale>("it-IT");
    const [paymentEmailRemindersEnabled, setPaymentEmailRemindersEnabled] =
        useState(true);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<AdministrationError | null>(null);
    const [createdInvitation, setCreatedInvitation] =
        useState<UserInvitationResponseDto | null>(null);

    const sortedAccounts = useMemo(
        () =>
            [...accounts].sort((first, second) =>
                first.accountName.localeCompare(second.accountName),
            ),
        [accounts],
    );

    const shouldShowAccountSelection =
        userRole === "COLLABORATOR" || userRole === "VIEWER_COLLABORATOR";

    if (isCurrentUserLoading || !currentUser) {
        return (
            <section className="sl-page">
                <div className="alert alert-info" role="status">
                    {t("loading")}
                </div>
            </section>
        );
    }

    if (currentUser.userRole !== "OWNER") {
        return <Navigate to={ROUTES.app.dashboard} replace />;
    }

    function handleRoleChange(nextRole: InvitableUserRole) {
        setUserRole(nextRole);
        setError(null);

        if (nextRole === "SUPER_COLLABORATOR") {
            setSelectedAccountIds([]);
        }
    }

    function handleToggleAccount(accountId: string) {
        setSelectedAccountIds((currentAccountIds) =>
            currentAccountIds.includes(accountId)
                ? currentAccountIds.filter(
                      (currentAccountId) => currentAccountId !== accountId,
                  )
                : [...currentAccountIds, accountId],
        );
    }

    async function handleSubmitInvitation() {
        setError(null);
        setCreatedInvitation(null);

        const trimmedUserName = userName.trim();
        const trimmedEmail = email.trim();

        if (!trimmedUserName) {
            setError({
                code: "validation.userNameRequired",
                message: t("validation.userNameRequired"),
            });
            return;
        }

        if (!trimmedEmail) {
            setError({
                code: "validation.emailRequired",
                message: t("validation.emailRequired"),
            });
            return;
        }

        if (userRole === "COLLABORATOR" && selectedAccountIds.length === 0) {
            setError({
                code: "validation.accountRequired",
                message: t("validation.accountRequired"),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await inviteUser({
                userName: trimmedUserName,
                email: trimmedEmail,
                userRole,
                preferredLocale,
                paymentEmailRemindersEnabled,
                accountIds:
                    userRole === "SUPER_COLLABORATOR" ? [] : selectedAccountIds,
            });

            setCreatedInvitation(response);
            setUserName("");
            setEmail("");
            setUserRole("VIEWER_COLLABORATOR");
            setPreferredLocale("it-IT");
            setPaymentEmailRemindersEnabled(true);
            setSelectedAccountIds([]);
        } catch (inviteError) {
            setError(
                getAdministrationError(inviteError, t("inviteErrorFallback")),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="sl-page sl-administration-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            <article className="sl-panel">
                <div className="sl-section-heading">
                    <div>
                        <p className="sl-eyebrow">{t("invite.eyebrow")}</p>
                        <h2>{t("invite.title")}</h2>
                        <p>{t("invite.subtitle")}</p>
                    </div>
                </div>

                {financeDataStatus === "loading" ? (
                    <div className="alert alert-info" role="status">
                        {t("accountsLoading")}
                    </div>
                ) : null}

                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <strong>{t("inviteErrorTitle")}</strong>
                        <br />
                        {error.message}
                    </div>
                ) : null}

                {createdInvitation ? (
                    <div className="alert alert-success" role="status">
                        {t("inviteSuccess", {
                            email: createdInvitation.email,
                        })}
                    </div>
                ) : null}

                <form
                    className="sl-administration-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmitInvitation();
                    }}>
                    <div>
                        <label className="form-label" htmlFor="inviteUserName">
                            {t("fields.userName")}
                        </label>
                        <input
                            className="form-control"
                            disabled={isSubmitting}
                            id="inviteUserName"
                            maxLength={100}
                            onChange={(event) =>
                                setUserName(event.target.value)
                            }
                            required
                            value={userName}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="inviteEmail">
                            {t("fields.email")}
                        </label>
                        <input
                            className="form-control"
                            disabled={isSubmitting}
                            id="inviteEmail"
                            maxLength={320}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="inviteRole">
                            {t("fields.role")}
                        </label>
                        <select
                            className="form-select"
                            disabled={isSubmitting}
                            id="inviteRole"
                            onChange={(event) =>
                                handleRoleChange(
                                    event.target.value as InvitableUserRole,
                                )
                            }
                            value={userRole}>
                            {INVITABLE_ROLES.map((role) => (
                                <option key={role} value={role}>
                                    {t(`roles.${role}`)}
                                </option>
                            ))}
                        </select>
                        <p className="form-text mb-0">
                            {t(`roleHints.${userRole}`)}
                        </p>
                    </div>

                    <div>
                        <label className="form-label" htmlFor="inviteLocale">
                            {t("fields.locale")}
                        </label>
                        <select
                            className="form-select"
                            disabled={isSubmitting}
                            id="inviteLocale"
                            onChange={(event) =>
                                setPreferredLocale(
                                    event.target.value as PreferredLocale,
                                )
                            }
                            value={preferredLocale}>
                            {PREFERRED_LOCALES.map((locale) => (
                                <option key={locale} value={locale}>
                                    {t(`locales.${locale}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-check">
                        <input
                            checked={paymentEmailRemindersEnabled}
                            className="form-check-input"
                            disabled={isSubmitting}
                            id="invitePaymentReminders"
                            onChange={(event) =>
                                setPaymentEmailRemindersEnabled(
                                    event.target.checked,
                                )
                            }
                            type="checkbox"
                        />
                        <label
                            className="form-check-label"
                            htmlFor="invitePaymentReminders">
                            {t("fields.paymentEmailReminders")}
                        </label>
                    </div>

                    {shouldShowAccountSelection ? (
                        <fieldset className="sl-administration-account-fieldset">
                            <legend>{t("accounts.title")}</legend>
                            <p>{t("accounts.description")}</p>

                            {sortedAccounts.length === 0 ? (
                                <p className="text-muted mb-0">
                                    {t("accounts.empty")}
                                </p>
                            ) : (
                                <div className="sl-administration-account-list">
                                    {sortedAccounts.map((account) => (
                                        <label
                                            className="sl-administration-account-option"
                                            key={account.accountId}>
                                            <input
                                                checked={selectedAccountIds.includes(
                                                    account.accountId,
                                                )}
                                                disabled={isSubmitting}
                                                onChange={() =>
                                                    handleToggleAccount(
                                                        account.accountId,
                                                    )
                                                }
                                                type="checkbox"
                                            />
                                            <span>
                                                <strong>
                                                    {account.accountName}
                                                </strong>
                                                <small>
                                                    {account.currency}
                                                    {account.issuingInstitution
                                                        ? ` · ${account.issuingInstitution}`
                                                        : ""}
                                                </small>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </fieldset>
                    ) : null}

                    <button
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        type="submit">
                        {isSubmitting ? t("submitting") : t("submit")}
                    </button>
                </form>
            </article>
        </section>
    );
}

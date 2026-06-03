import { useTranslation } from "react-i18next";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectAccountError,
    selectAccountStatus,
    selectCurrentUser,
} from "../../features/account/accountSelectors";
import { loadCurrentUser } from "../../features/account/accountThunks";
import {
    changePassword,
    exportCurrentUserData,
    requestEmailChange,
    updatePaymentEmailReminders,
    confirmDisableEmail2fa,
    confirmEnableEmail2fa,
    requestDisableEmail2fa,
    requestEnableEmail2fa,
} from "../../features/account/api/accountApi";
import { paymentEmailRemindersUpdated } from "../../features/account/accountSlice";
import { logoutUser } from "../../features/auth/authThunks";
import { emailTwoFactorUpdated } from "../../features/account/accountSlice";

type SettingsDetailRowProps = {
    label: string;
    value: string;
};

type ExportStatus = "idle" | "loading" | "success" | "failed";
type PreferenceUpdateStatus = "idle" | "loading" | "success" | "failed";
type PasswordChangeStatus = "idle" | "loading" | "success" | "failed";
type EmailChangeStatus = "idle" | "loading" | "success" | "failed";
type Email2faFlowStatus =
    | "idle"
    | "requesting"
    | "challengeReady"
    | "confirming"
    | "success"
    | "failed";

function valueOrFallback(value: string | null | undefined): string {
    return value?.trim() ? value : "—";
}

function SettingsDetailRow({ label, value }: SettingsDetailRowProps) {
    return (
        <>
            <dt className="col-sm-4">{label}</dt>
            <dd className="col-sm-8">{value}</dd>
        </>
    );
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

export function SettingsPage() {
    const { t } = useTranslation("settings");
    const dispatch = useAppDispatch();

    const accountStatus = useAppSelector(selectAccountStatus);
    const accountError = useAppSelector(selectAccountError);
    const currentUser = useAppSelector(selectCurrentUser);
    const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
    const [reminderUpdateStatus, setReminderUpdateStatus] =
        useState<PreferenceUpdateStatus>("idle");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordChangeStatus, setPasswordChangeStatus] =
        useState<PasswordChangeStatus>("idle");
    const [emailChangeNewEmail, setEmailChangeNewEmail] = useState("");
    const [emailChangeCurrentPassword, setEmailChangeCurrentPassword] =
        useState("");
    const [emailChangeStatus, setEmailChangeStatus] =
        useState<EmailChangeStatus>("idle");
    const [email2faPassword, setEmail2faPassword] = useState("");
    const [email2faCode, setEmail2faCode] = useState("");
    const [email2faChallengeId, setEmail2faChallengeId] = useState<
        string | null
    >(null);
    const [email2faStatus, setEmail2faStatus] =
        useState<Email2faFlowStatus>("idle");

    const isInitialLoading = accountStatus === "loading" && !currentUser;
    const hasError = accountStatus === "failed" && accountError !== null;
    const hasEmptyState = !currentUser && !isInitialLoading && !hasError;

    const showPlatformRole =
        currentUser?.userPlatformRole === "ADMIN" ||
        currentUser?.userPlatformRole === "SUPERADMIN";

    const localeLabel = currentUser
        ? t(`locales.${currentUser.preferredLocale}`)
        : "";

    const themeLabel = currentUser
        ? t(`themes.${currentUser.preferredTheme}`)
        : "";

    const userRoleLabel = currentUser
        ? t(`userRoles.${currentUser.userRole}`)
        : "";

    const platformRoleLabel = currentUser
        ? t(`platformRoles.${currentUser.userPlatformRole}`)
        : "";

    function handleReloadCurrentUser() {
        void dispatch(loadCurrentUser());
    }

    async function exportAccountData() {
        setExportStatus("loading");

        try {
            const file = await exportCurrentUserData();

            downloadBlob(file.blob, file.filename);
            setExportStatus("success");
        } catch {
            setExportStatus("failed");
        }
    }

    function handleExportAccountData() {
        void exportAccountData();
    }

    async function updateReminderPreference(enabled: boolean) {
        setReminderUpdateStatus("loading");

        try {
            const response = await updatePaymentEmailReminders({ enabled });

            dispatch(
                paymentEmailRemindersUpdated(
                    response.paymentEmailRemindersEnabled,
                ),
            );
            setReminderUpdateStatus("success");
        } catch {
            setReminderUpdateStatus("failed");
        }
    }

    function handleTogglePaymentReminders() {
        if (!currentUser || reminderUpdateStatus === "loading") {
            return;
        }

        void updateReminderPreference(
            !currentUser.paymentEmailRemindersEnabled,
        );
    }

    async function submitPasswordChange() {
        setPasswordChangeStatus("loading");

        try {
            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setPasswordChangeStatus("success");

            void dispatch(logoutUser());
        } catch {
            setPasswordChangeStatus("failed");
        }
    }

    async function submitEmailChangeRequest() {
        setEmailChangeStatus("loading");

        try {
            await requestEmailChange({
                newEmail: emailChangeNewEmail,
                currentPassword: emailChangeCurrentPassword,
            });

            setEmailChangeNewEmail("");
            setEmailChangeCurrentPassword("");
            setEmailChangeStatus("success");
        } catch {
            setEmailChangeStatus("failed");
        }
    }

    async function requestEmail2faChallenge() {
        if (!currentUser) {
            return;
        }

        setEmail2faStatus("requesting");

        try {
            const response = currentUser.emailTwoFactorEnabled
                ? await requestDisableEmail2fa({
                      currentPassword: email2faPassword,
                  })
                : await requestEnableEmail2fa({
                      currentPassword: email2faPassword,
                  });

            setEmail2faChallengeId(response.challengeId);
            setEmail2faStatus("challengeReady");
        } catch {
            setEmail2faStatus("failed");
        }
    }

    async function confirmEmail2faChallenge() {
        if (!currentUser || !email2faChallengeId) {
            return;
        }

        setEmail2faStatus("confirming");

        try {
            if (currentUser.emailTwoFactorEnabled) {
                await confirmDisableEmail2fa({
                    challengeId: email2faChallengeId,
                    code: email2faCode,
                });

                dispatch(emailTwoFactorUpdated(false));
            } else {
                await confirmEnableEmail2fa({
                    challengeId: email2faChallengeId,
                    code: email2faCode,
                });

                dispatch(emailTwoFactorUpdated(true));
            }

            setEmail2faPassword("");
            setEmail2faCode("");
            setEmail2faChallengeId(null);
            setEmail2faStatus("success");
        } catch {
            setEmail2faStatus("failed");
        }
    }

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            {hasError ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("loadErrorTitle")}</h2>
                    <p className="mb-3">
                        {accountError.message ?? t("loadErrorFallback")}
                    </p>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleReloadCurrentUser}
                        type="button">
                        {t("reload")}
                    </button>
                </div>
            ) : null}

            {isInitialLoading ? (
                <article className="sl-panel">
                    <p>{t("loading")}</p>
                </article>
            ) : null}

            {hasEmptyState ? (
                <article className="sl-panel">
                    <p>{t("emptyState")}</p>
                    <button
                        className="btn btn-primary btn-sm mt-3"
                        onClick={handleReloadCurrentUser}
                        type="button">
                        {t("reload")}
                    </button>
                </article>
            ) : null}

            {currentUser ? (
                <div className="row g-3">
                    <div className="col-12 col-xl-4">
                        <article className="sl-panel">
                            <h2>{t("sections.profile")}</h2>
                            <dl className="row mb-0">
                                <SettingsDetailRow
                                    label={t("fields.userName")}
                                    value={valueOrFallback(
                                        currentUser.userName,
                                    )}
                                />
                                <SettingsDetailRow
                                    label={t("fields.email")}
                                    value={valueOrFallback(currentUser.email)}
                                />
                                <SettingsDetailRow
                                    label={t("fields.groupName")}
                                    value={valueOrFallback(
                                        currentUser.userGroupName,
                                    )}
                                />
                            </dl>
                            <hr />

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    if (emailChangeStatus === "loading") {
                                        return;
                                    }

                                    void submitEmailChangeRequest();
                                }}>
                                <h3 className="h6">{t("emailChange.title")}</h3>

                                <div className="mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="email-change-new-email">
                                        {t("emailChange.newEmail")}
                                    </label>
                                    <input
                                        autoComplete="email"
                                        className="form-control"
                                        id="email-change-new-email"
                                        onChange={(event) => {
                                            setEmailChangeNewEmail(
                                                event.target.value,
                                            );
                                        }}
                                        required
                                        type="email"
                                        value={emailChangeNewEmail}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="email-change-current-password">
                                        {t("emailChange.currentPassword")}
                                    </label>
                                    <input
                                        autoComplete="current-password"
                                        className="form-control"
                                        id="email-change-current-password"
                                        minLength={8}
                                        onChange={(event) => {
                                            setEmailChangeCurrentPassword(
                                                event.target.value,
                                            );
                                        }}
                                        required
                                        type="password"
                                        value={emailChangeCurrentPassword}
                                    />
                                </div>

                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={emailChangeStatus === "loading"}
                                    type="submit">
                                    {emailChangeStatus === "loading"
                                        ? t("emailChange.loading")
                                        : t("emailChange.submit")}
                                </button>

                                {emailChangeStatus === "success" ? (
                                    <p className="text-success mt-3 mb-0">
                                        {t("emailChange.success")}
                                    </p>
                                ) : null}

                                {emailChangeStatus === "failed" ? (
                                    <p className="text-danger mt-3 mb-0">
                                        {t("emailChange.error")}
                                    </p>
                                ) : null}
                            </form>
                        </article>
                    </div>

                    <div className="col-12 col-xl-4">
                        <article className="sl-panel">
                            <h2>{t("sections.preferences")}</h2>
                            <dl className="row mb-0">
                                <SettingsDetailRow
                                    label={t("fields.locale")}
                                    value={localeLabel}
                                />
                                <SettingsDetailRow
                                    label={t("fields.theme")}
                                    value={themeLabel}
                                />
                                <SettingsDetailRow
                                    label={t("fields.paymentReminders")}
                                    value={
                                        currentUser.paymentEmailRemindersEnabled
                                            ? t("status.enabledPlural")
                                            : t("status.disabledPlural")
                                    }
                                />
                            </dl>
                            <button
                                className="btn btn-outline-primary btn-sm mt-3"
                                disabled={reminderUpdateStatus === "loading"}
                                onClick={handleTogglePaymentReminders}
                                type="button">
                                {reminderUpdateStatus === "loading"
                                    ? t("paymentReminders.updating")
                                    : currentUser.paymentEmailRemindersEnabled
                                      ? t("paymentReminders.disable")
                                      : t("paymentReminders.enable")}
                            </button>

                            {reminderUpdateStatus === "success" ? (
                                <p className="text-success mt-3 mb-0">
                                    {t("paymentReminders.success")}
                                </p>
                            ) : null}

                            {reminderUpdateStatus === "failed" ? (
                                <p className="text-danger mt-3 mb-0">
                                    {t("paymentReminders.error")}
                                </p>
                            ) : null}
                        </article>
                    </div>

                    <div className="col-12 col-xl-4">
                        <article className="sl-panel">
                            <h2>{t("sections.security")}</h2>
                            <dl className="row mb-0">
                                <SettingsDetailRow
                                    label={t("fields.email2fa")}
                                    value={
                                        currentUser.emailTwoFactorEnabled
                                            ? t("status.enabledFeminine")
                                            : t("status.disabledFeminine")
                                    }
                                />
                                <SettingsDetailRow
                                    label={t("fields.userRole")}
                                    value={userRoleLabel}
                                />
                                {showPlatformRole ? (
                                    <SettingsDetailRow
                                        label={t("fields.platformRole")}
                                        value={platformRoleLabel}
                                    />
                                ) : null}
                            </dl>
                            <hr />

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    if (passwordChangeStatus === "loading") {
                                        return;
                                    }

                                    void submitPasswordChange();
                                }}>
                                <h3 className="h6">
                                    {t("passwordChange.title")}
                                </h3>

                                <div className="mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="current-password">
                                        {t("passwordChange.currentPassword")}
                                    </label>
                                    <input
                                        autoComplete="current-password"
                                        className="form-control"
                                        id="current-password"
                                        minLength={8}
                                        onChange={(event) => {
                                            setCurrentPassword(
                                                event.target.value,
                                            );
                                        }}
                                        required
                                        type="password"
                                        value={currentPassword}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        className="form-label"
                                        htmlFor="new-password">
                                        {t("passwordChange.newPassword")}
                                    </label>
                                    <input
                                        autoComplete="new-password"
                                        className="form-control"
                                        id="new-password"
                                        minLength={8}
                                        onChange={(event) => {
                                            setNewPassword(event.target.value);
                                        }}
                                        required
                                        type="password"
                                        value={newPassword}
                                    />
                                </div>

                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={
                                        passwordChangeStatus === "loading"
                                    }
                                    type="submit">
                                    {passwordChangeStatus === "loading"
                                        ? t("passwordChange.loading")
                                        : t("passwordChange.submit")}
                                </button>

                                {passwordChangeStatus === "success" ? (
                                    <p className="text-success mt-3 mb-0">
                                        {t("passwordChange.success")}
                                    </p>
                                ) : null}

                                {passwordChangeStatus === "failed" ? (
                                    <p className="text-danger mt-3 mb-0">
                                        {t("passwordChange.error")}
                                    </p>
                                ) : null}
                            </form>
                            <hr />

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    if (
                                        email2faStatus === "requesting" ||
                                        email2faStatus === "confirming"
                                    ) {
                                        return;
                                    }

                                    if (email2faStatus === "challengeReady") {
                                        void confirmEmail2faChallenge();
                                        return;
                                    }

                                    void requestEmail2faChallenge();
                                }}>
                                <h3 className="h6">{t("email2fa.title")}</h3>
                                {email2faStatus === "challengeReady" ? (
                                    <p className="text-muted mt-3 mb-0">
                                        {t("email2fa.challengeSent")}
                                    </p>
                                ) : null}

                                {email2faStatus === "success" ? (
                                    <p className="text-success mt-3 mb-0">
                                        {t("email2fa.success")}
                                    </p>
                                ) : null}

                                {email2faStatus === "failed" ? (
                                    <p className="text-danger mt-3 mb-0">
                                        {t("email2fa.error")}
                                    </p>
                                ) : null}

                                <p className="text-muted">
                                    {currentUser.emailTwoFactorEnabled
                                        ? t("email2fa.disableDescription")
                                        : t("email2fa.enableDescription")}
                                </p>

                                {email2faStatus !== "challengeReady" ? (
                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="email-2fa-password">
                                            {t("email2fa.currentPassword")}
                                        </label>
                                        <input
                                            autoComplete="current-password"
                                            className="form-control"
                                            id="email-2fa-password"
                                            minLength={8}
                                            onChange={(event) => {
                                                setEmail2faPassword(
                                                    event.target.value,
                                                );
                                            }}
                                            required
                                            type="password"
                                            value={email2faPassword}
                                        />
                                    </div>
                                ) : null}

                                {email2faStatus === "challengeReady" ? (
                                    <div className="mb-3">
                                        <label
                                            className="form-label"
                                            htmlFor="email-2fa-code">
                                            {t("email2fa.code")}
                                        </label>
                                        <input
                                            autoComplete="one-time-code"
                                            className="form-control"
                                            id="email-2fa-code"
                                            inputMode="numeric"
                                            onChange={(event) => {
                                                setEmail2faCode(
                                                    event.target.value,
                                                );
                                            }}
                                            required
                                            value={email2faCode}
                                        />
                                    </div>
                                ) : null}

                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={
                                        email2faStatus === "requesting" ||
                                        email2faStatus === "confirming"
                                    }
                                    type="submit">
                                    {email2faStatus === "requesting"
                                        ? t("email2fa.sending")
                                        : email2faStatus === "confirming"
                                          ? t("email2fa.confirming")
                                          : email2faStatus === "challengeReady"
                                            ? t("email2fa.confirm")
                                            : currentUser.emailTwoFactorEnabled
                                              ? t("email2fa.disable")
                                              : t("email2fa.enable")}
                                </button>
                            </form>
                        </article>
                    </div>

                    <div className="row g-3 mt-1 text-center">
                        <div className="col-12">
                            <article className="sl-panel">
                                <h2>{t("sections.accountData")}</h2>
                                <p>{t("accountExport.description")}</p>

                                <button
                                    className="btn btn-outline-primary"
                                    disabled={exportStatus === "loading"}
                                    onClick={handleExportAccountData}
                                    type="button">
                                    {exportStatus === "loading"
                                        ? t("accountExport.loading")
                                        : t("accountExport.button")}
                                </button>

                                {exportStatus === "success" ? (
                                    <p className="text-success mt-3 mb-0">
                                        {t("accountExport.success")}
                                    </p>
                                ) : null}

                                {exportStatus === "failed" ? (
                                    <p className="text-danger mt-3 mb-0">
                                        {t("accountExport.error")}
                                    </p>
                                ) : null}
                            </article>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

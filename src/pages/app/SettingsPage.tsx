import { useTranslation } from "react-i18next";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectAccountError,
    selectAccountStatus,
    selectCurrentUser,
} from "../../features/account/accountSelectors";
import { loadCurrentUser } from "../../features/account/accountThunks";
import { exportCurrentUserData } from "../../features/account/api/accountApi";

type SettingsDetailRowProps = {
    label: string;
    value: string;
};

type ExportStatus = "idle" | "loading" | "success" | "failed";

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

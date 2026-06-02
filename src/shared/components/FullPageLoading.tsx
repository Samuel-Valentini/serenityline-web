import { useTranslation } from "react-i18next";

export function FullPageLoading() {
    const { t } = useTranslation("common");

    return (
        <div className="sl-full-page-loading" role="status" aria-live="polite">
            <span>{t("loading")}</span>
        </div>
    );
}

import { useTranslation } from "react-i18next";

export function DashboardPage() {
    const { t } = useTranslation("dashboard");

    return (
        <main className="container py-5">
            <h1>{t("title")}</h1>
            <p className="lead">{t("subtitle")}</p>
        </main>
    );
}

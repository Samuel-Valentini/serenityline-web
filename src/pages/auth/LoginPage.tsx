import { useTranslation } from "react-i18next";

export function LoginPage() {
    const { t } = useTranslation("auth");

    return (
        <main className="container py-5">
            <h1>{t("loginTitle")}</h1>
            <p>{t("loginPlaceholder")}</p>
        </main>
    );
}

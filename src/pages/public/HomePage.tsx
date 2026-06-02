import { useTranslation } from "react-i18next";

export function HomePage() {
    const { t } = useTranslation("common");

    return (
        <main className="container py-5">
            <p className="sl-eyebrow">{t("eyebrow")}</p>
            <h1>{t("claim")}</h1>
            <p className="lead">{t("homeIntro")}</p>
        </main>
    );
}

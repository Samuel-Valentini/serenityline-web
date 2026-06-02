import { useTranslation } from "react-i18next";

export function DashboardPage() {
    const { t } = useTranslation("dashboard");

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">SerenityLine</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            <div className="row g-3">
                <div className="col-12 col-xl-4">
                    <article className="sl-panel">
                        <h2>{t("cards.serenitylineTitle")}</h2>
                        <p>{t("cards.serenitylineText")}</p>
                    </article>
                </div>

                <div className="col-12 col-xl-4">
                    <article className="sl-panel">
                        <h2>{t("cards.calendarTitle")}</h2>
                        <p>{t("cards.calendarText")}</p>
                    </article>
                </div>

                <div className="col-12 col-xl-4">
                    <article className="sl-panel">
                        <h2>{t("cards.simulationsTitle")}</h2>
                        <p>{t("cards.simulationsText")}</p>
                    </article>
                </div>
            </div>
        </section>
    );
}

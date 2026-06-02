import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "../../shared/constants/routes";

export function HomePage() {
    const { t } = useTranslation("home");

    return (
        <main className="sl-home">
            <section className="sl-home-hero">
                <div className="sl-home-hero-copy">
                    <p className="sl-eyebrow">{t("heroEyebrow")}</p>
                    <h1>{t("heroTitle")}</h1>
                    <p className="lead">{t("heroSubtitle")}</p>

                    <div className="sl-home-actions">
                        <Link
                            className="btn btn-primary btn-lg"
                            to={ROUTES.auth.register}>
                            {t("primaryCta")}
                        </Link>

                        <Link
                            className="btn btn-outline-primary btn-lg"
                            to={ROUTES.public.howItWorks}>
                            {t("secondaryCta")}
                        </Link>
                    </div>
                </div>

                <aside
                    className="sl-home-preview"
                    aria-label={t("previewLabel")}>
                    <p className="sl-eyebrow">{t("previewLabel")}</p>
                    <h2>{t("previewTitle")}</h2>
                    <p>{t("previewText")}</p>

                    <div className="sl-home-chart-card">
                        <div className="sl-home-chart-line" />
                        <div className="sl-home-chart-point sl-home-chart-point-a" />
                        <div className="sl-home-chart-point sl-home-chart-point-b" />
                        <div className="sl-home-chart-point sl-home-chart-point-c" />
                    </div>
                </aside>
            </section>

            <section className="sl-home-features" aria-label="SerenityLine">
                <article className="sl-panel">
                    <h2>{t("featureOneTitle")}</h2>
                    <p>{t("featureOneText")}</p>
                </article>

                <article className="sl-panel">
                    <h2>{t("featureTwoTitle")}</h2>
                    <p>{t("featureTwoText")}</p>
                </article>

                <article className="sl-panel">
                    <h2>{t("featureThreeTitle")}</h2>
                    <p>{t("featureThreeText")}</p>
                </article>
            </section>
        </main>
    );
}

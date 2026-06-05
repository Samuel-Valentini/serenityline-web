import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../shared/constants/routes";

type SecurityDetail = {
    title: string;
    text: string;
};

type SecurityTechnicalCard = {
    title: string;
    paragraphs: string[];
};

export function SecurityPage() {
    const { t } = useTranslation("securityPage");

    const trustBadges = t("trustBadges", {
        returnObjects: true,
    }) as string[];

    const assuranceItems = t("assurance.items", {
        returnObjects: true,
    }) as string[];

    const details = t("details.items", {
        returnObjects: true,
    }) as SecurityDetail[];

    const technicalCards = t("technical.cards", {
        returnObjects: true,
    }) as SecurityTechnicalCard[];

    return (
        <main className="sl-security-page">
            <section className="sl-security-hero">
                <div className="sl-security-hero-copy">
                    <p className="sl-eyebrow">{t("hero.eyebrow")}</p>
                    <h1>{t("hero.title")}</h1>

                    <div className="sl-security-hero-text">
                        <p>{t("hero.paragraphs.0")}</p>
                        <p>{t("hero.paragraphs.1")}</p>
                        <p>{t("hero.paragraphs.2")}</p>
                    </div>

                    <div className="sl-security-actions">
                        <Link
                            className="btn btn-primary btn-lg"
                            to={ROUTES.auth.register}>
                            {t("actions.register")}
                        </Link>

                        <Link
                            className="btn btn-outline-primary btn-lg"
                            to={ROUTES.auth.login}>
                            {t("actions.login")}
                        </Link>
                    </div>
                </div>

                <aside className="sl-security-assurance-card">
                    <p className="sl-eyebrow">{t("assurance.eyebrow")}</p>
                    <h2>{t("assurance.title")}</h2>
                    <p>{t("assurance.text")}</p>

                    <div className="sl-security-assurance-list">
                        {assuranceItems.map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                    </div>
                </aside>
            </section>

            <section
                className="sl-security-trust-strip"
                aria-label={t("trustBadgesLabel")}>
                {trustBadges.map((badge) => (
                    <span key={badge}>{badge}</span>
                ))}
            </section>

            <section className="sl-security-intro-card">
                <div>
                    <p className="sl-eyebrow">{t("intro.eyebrow")}</p>
                    <h2>{t("intro.title")}</h2>
                </div>

                <p>{t("intro.paragraphs.0")}</p>
                <p>{t("intro.paragraphs.1")}</p>

                <strong>{t("intro.closing")}</strong>
            </section>

            <section className="sl-security-details">
                <div className="sl-section-heading">
                    <p className="sl-eyebrow">{t("details.eyebrow")}</p>
                    <h2>{t("details.title")}</h2>
                </div>

                <div className="sl-security-detail-grid">
                    {details.map((detail) => (
                        <article className="sl-panel" key={detail.title}>
                            <h3>{detail.title}</h3>
                            <p>{detail.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-security-technical">
                <div className="sl-security-technical-heading">
                    <p className="sl-eyebrow">{t("technical.eyebrow")}</p>
                    <h2>{t("technical.title")}</h2>
                    <p>{t("technical.subtitle")}</p>
                </div>

                <div className="sl-security-technical-grid">
                    {technicalCards.map((card) => (
                        <article
                            className="sl-security-technical-card"
                            key={card.title}>
                            <h3>{card.title}</h3>
                            {card.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-security-final-card">
                <p className="sl-eyebrow">{t("final.eyebrow")}</p>
                <h2>{t("final.title")}</h2>
                <p>{t("final.text")}</p>

                <Link
                    className="btn btn-primary btn-lg"
                    to={ROUTES.auth.register}>
                    {t("final.cta")}
                </Link>
            </section>
        </main>
    );
}

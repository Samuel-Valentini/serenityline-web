import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "../../shared/constants/routes";

type HomeTextItem = {
    title: string;
    text: string;
};

type HomeMethodStep = {
    title: string;
    text: string;
};

type HomeFaqItem = {
    question: string;
    answer: string;
};

export function HomePage() {
    const { t } = useTranslation("home");

    const trustBadges = t("hero.trustBadges", {
        returnObjects: true,
    }) as string[];

    const features = t("features.items", {
        returnObjects: true,
    }) as HomeTextItem[];

    const valueCards = t("value.cards", {
        returnObjects: true,
    }) as HomeTextItem[];

    const methodSteps = t("method.steps", {
        returnObjects: true,
    }) as HomeMethodStep[];

    const securityItems = t("security.items", {
        returnObjects: true,
    }) as HomeTextItem[];

    const onboardingChecklist = t("onboarding.checklist", {
        returnObjects: true,
    }) as string[];

    const faqs = t("faq.items", {
        returnObjects: true,
    }) as HomeFaqItem[];

    const finalTrustBadges = t("final.trustBadges", {
        returnObjects: true,
    }) as string[];

    return (
        <main className="sl-home">
            <section className="sl-home-hero">
                <div className="sl-home-hero-copy">
                    <p className="sl-eyebrow">{t("hero.eyebrow")}</p>
                    <h1>{t("hero.title")}</h1>
                    <p className="lead">{t("hero.subtitle")}</p>

                    <div className="sl-home-actions">
                        <Link
                            className="btn btn-primary btn-lg"
                            to={ROUTES.auth.register}>
                            {t("hero.primaryCta")}
                        </Link>

                        <Link
                            className="btn btn-outline-primary btn-lg sl-hero-video-cta"
                            to={`${ROUTES.public.howItWorks}#tutorial-serenityline`}>
                            <span
                                className="sl-hero-video-cta-icon"
                                aria-hidden="true">
                                <svg
                                    viewBox="0 0 24 24"
                                    focusable="false"
                                    role="img">
                                    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                                </svg>
                            </span>
                            <span>{t("hero.secondaryCta")}</span>
                        </Link>
                    </div>

                    <div
                        className="sl-home-trust-row"
                        aria-label={t("hero.trustBadgesLabel")}>
                        {trustBadges.map((badge) => (
                            <span key={badge}>{badge}</span>
                        ))}
                    </div>
                </div>

                <aside
                    className="sl-home-preview"
                    aria-label={t("preview.label")}>
                    <div className="sl-home-preview-header">
                        <p className="sl-eyebrow">{t("preview.label")}</p>
                        <h2>{t("preview.title")}</h2>
                    </div>

                    <div
                        className="sl-home-chart-card"
                        aria-label={t("preview.chartLabel")}
                        role="img">
                        <div className="sl-home-chart-grid" />
                        <div className="sl-home-chart-line" />
                        <div className="sl-home-chart-line sl-home-chart-line-simulated" />
                        <div className="sl-home-chart-point sl-home-chart-point-a" />
                        <div className="sl-home-chart-point sl-home-chart-point-b" />
                        <div className="sl-home-chart-point sl-home-chart-point-c" />
                        <span className="sl-home-chart-today">
                            {t("preview.today")}
                        </span>
                        <span className="sl-home-chart-event">
                            {t("preview.event")}
                        </span>
                    </div>

                    <dl className="sl-home-preview-metrics">
                        <div>
                            <dt>{t("preview.metrics.today.label")}</dt>
                            <dd>{t("preview.metrics.today.value")}</dd>
                        </div>
                        <div>
                            <dt>{t("preview.metrics.minimum.label")}</dt>
                            <dd>{t("preview.metrics.minimum.value")}</dd>
                        </div>
                        <div>
                            <dt>{t("preview.metrics.scenario.label")}</dt>
                            <dd>{t("preview.metrics.scenario.value")}</dd>
                        </div>
                    </dl>

                    <p className="sl-home-preview-copy">{t("preview.text")}</p>
                </aside>
            </section>

            <section className="sl-home-problem">
                <div>
                    <p className="sl-eyebrow">{t("problem.eyebrow")}</p>
                    <h2>{t("problem.title")}</h2>
                </div>

                <div className="sl-home-problem-copy">
                    <p>{t("problem.paragraphs.0")}</p>
                    <p>{t("problem.paragraphs.1")}</p>
                    <blockquote>{t("problem.question")}</blockquote>
                    <p className="sl-home-problem-cta">{t("problem.cta")}</p>
                </div>
            </section>

            <section
                className="sl-home-features"
                aria-labelledby="home-features-title">
                <div className="sl-home-section-heading">
                    <p className="sl-eyebrow">{t("features.eyebrow")}</p>
                    <h2 id="home-features-title">{t("features.title")}</h2>
                </div>

                <div className="sl-home-feature-grid">
                    {features.map((feature) => (
                        <article className="sl-panel" key={feature.title}>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-home-value">
                <div className="sl-home-value-copy">
                    <p className="sl-eyebrow">{t("value.eyebrow")}</p>
                    <h2>{t("value.title")}</h2>
                    <p>{t("value.text")}</p>
                </div>

                <div className="sl-home-value-grid">
                    {valueCards.map((card) => (
                        <article key={card.title}>
                            <h3>{card.title}</h3>
                            <p>{card.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-home-method">
                <div className="sl-home-section-heading">
                    <p className="sl-eyebrow">{t("method.eyebrow")}</p>
                    <h2>{t("method.title")}</h2>
                </div>

                <div className="sl-home-method-grid">
                    {methodSteps.map((step, index) => (
                        <article
                            className="sl-home-method-step"
                            key={step.title}>
                            <span>{index + 1}</span>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </article>
                    ))}
                </div>

                <Link
                    className="btn btn-primary btn-lg"
                    to={ROUTES.auth.register}>
                    {t("method.cta")}
                </Link>
            </section>

            <section className="sl-home-difference">
                <div className="sl-home-difference-copy">
                    <p className="sl-eyebrow">{t("difference.eyebrow")}</p>
                    <h2>{t("difference.title")}</h2>
                    <p>{t("difference.text")}</p>
                </div>

                <div className="sl-home-comparison">
                    <article>
                        <span>{t("difference.without.label")}</span>
                        <p>{t("difference.without.text")}</p>
                    </article>

                    <article>
                        <span>{t("difference.with.label")}</span>
                        <p>{t("difference.with.text")}</p>
                    </article>
                </div>
            </section>

            <section className="sl-home-security">
                <div className="sl-home-security-copy">
                    <p className="sl-eyebrow">{t("security.eyebrow")}</p>
                    <h2>{t("security.title")}</h2>
                    <p>{t("security.text")}</p>
                    <Link to={ROUTES.public.security}>{t("security.cta")}</Link>
                </div>

                <div className="sl-home-security-grid">
                    {securityItems.map((item) => (
                        <article key={item.title}>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-home-onboarding">
                <div>
                    <p className="sl-eyebrow">{t("onboarding.eyebrow")}</p>
                    <h2>{t("onboarding.title")}</h2>
                    <p>{t("onboarding.paragraphs.0")}</p>
                    <p>{t("onboarding.paragraphs.1")}</p>
                </div>

                <ul className="sl-home-checklist">
                    {onboardingChecklist.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <section className="sl-home-faq" aria-labelledby="home-faq-title">
                <div className="sl-home-section-heading">
                    <p className="sl-eyebrow">{t("faq.eyebrow")}</p>
                    <h2 id="home-faq-title">{t("faq.title")}</h2>
                </div>

                <div className="sl-home-faq-list">
                    {faqs.map((faq) => (
                        <article key={faq.question}>
                            <h3>{faq.question}</h3>
                            <p>{faq.answer}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-home-final">
                <p className="sl-eyebrow">{t("final.eyebrow")}</p>
                <h2>{t("final.title")}</h2>
                <p>{t("final.text")}</p>

                <div className="sl-home-actions">
                    <Link
                        className="btn btn-primary btn-lg"
                        to={ROUTES.auth.register}>
                        {t("final.primaryCta")}
                    </Link>

                    <Link
                        className="btn btn-outline-primary btn-lg"
                        to={ROUTES.public.howItWorks}>
                        {t("final.secondaryCta")}
                    </Link>
                </div>

                <div
                    className="sl-home-trust-row sl-home-final-trust"
                    aria-label={t("final.trustBadgesLabel")}>
                    {finalTrustBadges.map((badge) => (
                        <span key={badge}>{badge}</span>
                    ))}
                </div>
            </section>
        </main>
    );
}

import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../shared/constants/routes";

type HowItWorksItem = {
    title: string;
    text: string;
};

type HowItWorksStep = {
    title: string;
    paragraphs: string[];
};

export function HowItWorksPage() {
    const { t } = useTranslation("howItWorksPage");

    const trustBadges = t("hero.trustBadges", {
        returnObjects: true,
    }) as string[];

    const usefulItems = t("serenityLine.usefulItems", {
        returnObjects: true,
    }) as HowItWorksItem[];

    const actionItems = t("actions.items", {
        returnObjects: true,
    }) as HowItWorksItem[];

    const steps = t("gettingStarted.steps", {
        returnObjects: true,
    }) as HowItWorksStep[];

    return (
        <main className="sl-how-page">
            <section className="sl-how-hero">
                <div className="sl-how-hero-copy">
                    <p className="sl-eyebrow">{t("hero.eyebrow")}</p>
                    <h1>{t("hero.title")}</h1>
                    <p className="lead">{t("hero.subtitle")}</p>

                    <div className="sl-how-actions">
                        <Link
                            className="btn btn-primary btn-lg"
                            to={ROUTES.auth.register}>
                            {t("hero.primaryCta")}
                        </Link>

                        <a
                            className="btn btn-outline-primary btn-lg"
                            href="#guida-rapida">
                            {t("hero.secondaryCta")}
                        </a>
                    </div>
                </div>

                <aside
                    className="sl-how-preview"
                    aria-label={t("preview.label")}>
                    <p className="sl-eyebrow">{t("preview.eyebrow")}</p>
                    <h2>{t("preview.title")}</h2>

                    <div className="sl-how-preview-chart" aria-hidden="true">
                        <span className="sl-how-preview-line" />
                        <span className="sl-how-preview-dot sl-how-preview-dot-a" />
                        <span className="sl-how-preview-dot sl-how-preview-dot-b" />
                        <span className="sl-how-preview-dot sl-how-preview-dot-c" />
                    </div>

                    <dl>
                        <div>
                            <dt>{t("preview.todayLabel")}</dt>
                            <dd>{t("preview.todayValue")}</dd>
                        </div>
                        <div>
                            <dt>{t("preview.minimumLabel")}</dt>
                            <dd>{t("preview.minimumValue")}</dd>
                        </div>
                        <div>
                            <dt>{t("preview.decisionLabel")}</dt>
                            <dd>{t("preview.decisionValue")}</dd>
                        </div>
                    </dl>
                </aside>
            </section>

            <section
                className="sl-how-trust-strip"
                aria-label={t("hero.trustBadgesLabel")}>
                {trustBadges.map((badge) => (
                    <span key={badge}>{badge}</span>
                ))}
            </section>

            <section className="sl-how-story-card">
                <div>
                    <p className="sl-eyebrow">{t("why.eyebrow")}</p>
                    <h2>{t("why.title")}</h2>
                </div>

                <div className="sl-how-story-copy">
                    <p>{t("why.paragraphs.0")}</p>
                    <p>{t("why.paragraphs.1")}</p>
                    <p>{t("why.paragraphs.2")}</p>
                    <blockquote>{t("why.quote")}</blockquote>
                </div>
            </section>

            <section className="sl-how-tutorial" id="tutorial-serenityline">
                <div className="sl-section-heading">
                    <p className="sl-eyebrow">{t("tutorial.eyebrow")}</p>
                    <h2>{t("tutorial.title")}</h2>
                    <p>{t("tutorial.subtitle")}</p>
                </div>

                <div className="sl-how-video-card">
                    <video
                        className="sl-how-video"
                        controls
                        playsInline
                        preload="metadata"
                        aria-label={t("tutorial.videoLabel")}>
                        <source
                            src="/media/tutorial-serenityline.mp4"
                            type="video/mp4"
                        />
                        {t("tutorial.unsupported")}
                    </video>
                </div>
            </section>

            <section className="sl-how-serenityline">
                <div className="sl-section-heading">
                    <p className="sl-eyebrow">{t("serenityLine.eyebrow")}</p>
                    <h2>{t("serenityLine.title")}</h2>
                    <p>{t("serenityLine.subtitle")}</p>
                </div>

                <div className="sl-how-serenityline-grid">
                    <article className="sl-how-line-card">
                        <p>{t("serenityLine.paragraphs.0")}</p>
                        <p>{t("serenityLine.paragraphs.1")}</p>
                    </article>

                    <article className="sl-how-useful-card">
                        <h3>{t("serenityLine.usefulTitle")}</h3>
                        <div className="sl-how-useful-list">
                            {usefulItems.map((item) => (
                                <div key={item.title}>
                                    <strong>{item.title}</strong>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </section>

            <section className="sl-how-actions-section">
                <div className="sl-section-heading">
                    <p className="sl-eyebrow">{t("actions.eyebrow")}</p>
                    <h2>{t("actions.title")}</h2>
                </div>

                <div className="sl-how-action-grid">
                    {actionItems.map((item) => (
                        <article className="sl-panel" key={item.title}>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-how-getting-started" id="guida-rapida">
                <div className="sl-section-heading">
                    <p className="sl-eyebrow">{t("gettingStarted.eyebrow")}</p>
                    <h2>{t("gettingStarted.title")}</h2>
                    <p>{t("gettingStarted.subtitle")}</p>
                </div>

                <div className="sl-how-step-list">
                    {steps.map((step, index) => (
                        <article className="sl-how-step" key={step.title}>
                            <span>{index + 1}</span>
                            <div>
                                <h3>{step.title}</h3>
                                {step.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="sl-how-comparison-grid">
                <article className="sl-how-comparison-card">
                    <p className="sl-eyebrow">{t("difference.eyebrow")}</p>
                    <h2>{t("difference.title")}</h2>
                    <p>{t("difference.paragraphs.0")}</p>
                    <p>{t("difference.paragraphs.1")}</p>
                    <p>{t("difference.paragraphs.2")}</p>
                    <strong>{t("difference.closing")}</strong>
                </article>

                <article className="sl-how-security-card">
                    <p className="sl-eyebrow">{t("trust.eyebrow")}</p>
                    <h2>{t("trust.title")}</h2>
                    <p>{t("trust.text")}</p>
                    <Link to={ROUTES.public.security}>{t("trust.link")}</Link>
                </article>
            </section>

            <section className="sl-how-final-card">
                <p className="sl-eyebrow">{t("final.eyebrow")}</p>
                <h2>{t("final.title")}</h2>
                <p>{t("final.text")}</p>

                <div className="sl-how-actions">
                    <Link
                        className="btn btn-primary btn-lg"
                        to={ROUTES.auth.register}>
                        {t("final.primaryCta")}
                    </Link>

                    <Link
                        className="btn btn-outline-primary btn-lg"
                        to={ROUTES.public.security}>
                        {t("final.secondaryCta")}
                    </Link>
                </div>
            </section>
        </main>
    );
}

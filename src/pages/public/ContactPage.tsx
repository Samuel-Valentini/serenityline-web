import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../app/store/hooks";
import { submitSupportContact } from "../../features/support/api/supportApi";
import type { SupportContactTopic } from "../../features/support/api/supportApiTypes";
import {
    selectAuthUser,
    selectIsAuthenticated,
} from "../../features/auth/authSelectors";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

type ContactError = {
    code: string;
    message: string;
};

type TopicOption = {
    value: SupportContactTopic;
    label: string;
};

function getContactError(
    error: unknown,
    fallbackMessage: string,
): ContactError {
    if (error instanceof ApiError) {
        const body = error.body;

        if (
            typeof body === "object" &&
            body !== null &&
            "code" in body &&
            typeof body.code === "string"
        ) {
            return {
                code: body.code,
                message:
                    "message" in body && typeof body.message === "string"
                        ? body.message
                        : fallbackMessage,
            };
        }

        return {
            code: `http.${error.status}`,
            message: error.message,
        };
    }

    if (error instanceof Error) {
        return {
            code: "error.unexpected",
            message: error.message,
        };
    }

    return {
        code: "error.unexpected",
        message: fallbackMessage,
    };
}

export function ContactPage() {
    const { t } = useTranslation("contactPage");

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const authUser = useAppSelector(selectAuthUser);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState<SupportContactTopic>("ACCOUNT");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [website, setWebsite] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<ContactError | null>(null);

    const topicOptions = t("form.topicOptions", {
        returnObjects: true,
    }) as TopicOption[];

    async function submitContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSubmitting(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const response = await submitSupportContact({
                name: isAuthenticated ? undefined : name.trim(),
                email: isAuthenticated ? undefined : email.trim(),
                topic,
                subject: subject.trim(),
                message: message.trim(),
                privacyAccepted,
                website,
            });

            setSuccessMessage(response.message || t("form.successFallback"));
            setName("");
            setEmail("");
            setTopic("ACCOUNT");
            setSubject("");
            setMessage("");
            setPrivacyAccepted(false);
            setWebsite("");
        } catch (requestError) {
            setError(getContactError(requestError, t("form.errorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="sl-contact-page">
            <section className="sl-contact-hero">
                <div className="sl-contact-copy">
                    <p className="sl-eyebrow">{t("hero.eyebrow")}</p>
                    <h1>{t("hero.title")}</h1>
                    <p className="lead">{t("hero.subtitle")}</p>

                    <div className="sl-contact-actions">
                        <a
                            className="btn btn-primary btn-lg sl-contact-primary-cta"
                            href="#support-contact-form">
                            <span>{t("hero.primaryCta")}</span>

                            <svg
                                aria-hidden="true"
                                className="sl-contact-primary-cta-icon"
                                fill="none"
                                focusable="false"
                                viewBox="0 0 24 24">
                                <path
                                    d="M3 5.5 21 12 3 18.5 6.8 12 3 5.5Z"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.3"
                                />
                                <path
                                    d="M6.8 12H21"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.3"
                                />
                            </svg>
                        </a>

                        {!isAuthenticated ? (
                            <Link
                                className="btn btn-outline-primary btn-lg"
                                to={`${ROUTES.auth.login}?returnTo=${encodeURIComponent(
                                    ROUTES.public.contact,
                                )}`}>
                                {t("hero.secondaryCta")}
                            </Link>
                        ) : null}
                    </div>
                </div>

                <aside className="sl-contact-panel">
                    <p className="sl-eyebrow">{t("panel.eyebrow")}</p>
                    <h2>{t("panel.title")}</h2>
                    <p>{t("panel.text")}</p>
                </aside>
            </section>

            <section
                className="sl-contact-form-section"
                id="support-contact-form">
                <div className="sl-contact-form-card">
                    <div className="sl-contact-form-heading">
                        <p className="sl-eyebrow">{t("form.eyebrow")}</p>
                        <h2>{t("form.title")}</h2>
                        <p>{t("form.subtitle")}</p>
                    </div>

                    {isAuthenticated ? (
                        <div className="alert alert-info" role="status">
                            <strong>
                                {t("form.authenticatedNoticeTitle")}
                            </strong>
                            <br />
                            {t("form.authenticatedNoticeText", {
                                email:
                                    authUser?.email ??
                                    t("form.authenticatedFallbackEmail"),
                            })}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="alert alert-success" role="status">
                            <strong>{t("form.successTitle")}</strong>
                            <br />
                            {successMessage}
                        </div>
                    ) : null}

                    {error ? (
                        <div className="alert alert-danger" role="alert">
                            <strong>{t("form.errorTitle")}</strong>
                            <br />
                            {error.message}
                        </div>
                    ) : null}

                    <form className="sl-contact-form" onSubmit={submitContact}>
                        <div className="sl-honeypot" aria-hidden="true">
                            <label htmlFor="supportContactWebsite">
                                {t("form.websiteLabel")}
                            </label>
                            <input
                                autoComplete="off"
                                id="supportContactWebsite"
                                name="website"
                                onChange={(event) =>
                                    setWebsite(event.target.value)
                                }
                                tabIndex={-1}
                                type="text"
                                value={website}
                            />
                        </div>

                        {!isAuthenticated ? (
                            <div className="sl-contact-form-grid">
                                <div>
                                    <label
                                        className="form-label"
                                        htmlFor="supportContactName">
                                        {t("form.nameLabel")}
                                    </label>
                                    <input
                                        autoComplete="name"
                                        className="form-control"
                                        disabled={isSubmitting}
                                        id="supportContactName"
                                        maxLength={120}
                                        name="name"
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        placeholder={t("form.namePlaceholder")}
                                        type="text"
                                        value={name}
                                    />
                                </div>

                                <div>
                                    <label
                                        className="form-label"
                                        htmlFor="supportContactEmail">
                                        {t("form.emailLabel")}
                                    </label>
                                    <input
                                        autoComplete="email"
                                        className="form-control"
                                        disabled={isSubmitting}
                                        id="supportContactEmail"
                                        maxLength={320}
                                        name="email"
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder={t("form.emailPlaceholder")}
                                        required
                                        type="email"
                                        value={email}
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div>
                            <label
                                className="form-label"
                                htmlFor="supportContactTopic">
                                {t("form.topicLabel")}
                            </label>
                            <select
                                className="form-select"
                                disabled={isSubmitting}
                                id="supportContactTopic"
                                name="topic"
                                onChange={(event) =>
                                    setTopic(
                                        event.target
                                            .value as SupportContactTopic,
                                    )
                                }
                                required
                                value={topic}>
                                {topicOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                className="form-label"
                                htmlFor="supportContactSubject">
                                {t("form.subjectLabel")}
                            </label>
                            <input
                                className="form-control"
                                disabled={isSubmitting}
                                id="supportContactSubject"
                                maxLength={160}
                                name="subject"
                                onChange={(event) =>
                                    setSubject(event.target.value)
                                }
                                placeholder={t("form.subjectPlaceholder")}
                                required
                                type="text"
                                value={subject}
                            />
                        </div>

                        <div>
                            <label
                                className="form-label"
                                htmlFor="supportContactMessage">
                                {t("form.messageLabel")}
                            </label>
                            <textarea
                                className="form-control"
                                disabled={isSubmitting}
                                id="supportContactMessage"
                                maxLength={8000}
                                name="message"
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder={t("form.messagePlaceholder")}
                                required
                                rows={7}
                                value={message}
                            />
                            <p className="form-text">
                                {t("form.securityHint")}
                            </p>
                        </div>

                        <div className="form-check">
                            <input
                                checked={privacyAccepted}
                                className="form-check-input"
                                disabled={isSubmitting}
                                id="supportContactPrivacy"
                                name="privacyAccepted"
                                onChange={(event) =>
                                    setPrivacyAccepted(event.target.checked)
                                }
                                required
                                type="checkbox"
                            />
                            <label
                                className="form-check-label"
                                htmlFor="supportContactPrivacy">
                                {t("form.privacyLabel")}
                            </label>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            disabled={isSubmitting}
                            type="submit">
                            {isSubmitting
                                ? t("form.submitting")
                                : t("form.submit")}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}

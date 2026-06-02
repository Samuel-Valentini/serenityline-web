import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "../../shared/constants/routes";

type AuthPlaceholderPageKey =
    | "register"
    | "verifyEmail"
    | "forgotPassword"
    | "resetPassword"
    | "acceptInvitation";

type AuthPlaceholderPageProps = {
    pageKey: AuthPlaceholderPageKey;
};

export function AuthPlaceholderPage({ pageKey }: AuthPlaceholderPageProps) {
    const { t } = useTranslation("authFlows");

    return (
        <main className="sl-auth-page">
            <section className="sl-auth-card">
                <p className="sl-eyebrow">SerenityLine</p>
                <h1>{t(`${pageKey}.title`)}</h1>
                <p className="text-muted mb-4">{t(`${pageKey}.subtitle`)}</p>

                <Link to={ROUTES.auth.login}>{t("backToLogin")}</Link>
            </section>
        </main>
    );
}

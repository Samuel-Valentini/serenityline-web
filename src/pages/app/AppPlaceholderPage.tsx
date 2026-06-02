import { useTranslation } from "react-i18next";

type AppPageKey =
    | "serenityline"
    | "calendar"
    | "transactions"
    | "recurringTransactions"
    | "simulations"
    | "portfolios"
    | "accounts"
    | "balances"
    | "categories"
    | "settings"
    | "administration";

type AppPlaceholderPageProps = {
    pageKey: AppPageKey;
};

export function AppPlaceholderPage({ pageKey }: AppPlaceholderPageProps) {
    const { t } = useTranslation("appPages");

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("placeholderBadge")}</p>
                <h1>{t(`${pageKey}.title`)}</h1>
                <p className="lead">{t(`${pageKey}.subtitle`)}</p>
            </header>

            <article className="sl-panel">
                <p>
                    Questa sezione è già collegata al routing dell'app. I
                    contenuti funzionali verranno implementati nei prossimi
                    blocchi.
                </p>
            </article>
        </section>
    );
}

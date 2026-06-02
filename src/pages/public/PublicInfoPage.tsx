import { useTranslation } from "react-i18next";

type PublicPageKey = "howItWorks" | "security" | "privacy" | "terms";

type PublicInfoPageProps = {
    pageKey: PublicPageKey;
};

export function PublicInfoPage({ pageKey }: PublicInfoPageProps) {
    const { t } = useTranslation("publicPages");

    return (
        <main className="container py-5">
            <p className="sl-eyebrow">SerenityLine</p>
            <h1>{t(`${pageKey}.title`)}</h1>
            <p className="lead">{t(`${pageKey}.subtitle`)}</p>

            <article className="sl-public-panel mt-4">
                <p>{t(`${pageKey}.body`)}</p>
            </article>
        </main>
    );
}

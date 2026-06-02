import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "../shared/constants/routes";

export function NotFoundPage() {
    const { t } = useTranslation("notFound");

    return (
        <main className="container py-5">
            <p className="sl-eyebrow">SerenityLine</p>
            <h1>{t("title")}</h1>
            <p className="lead">{t("subtitle")}</p>
            <Link className="btn btn-primary mt-3" to={ROUTES.public.home}>
                {t("backHome")}
            </Link>
        </main>
    );
}

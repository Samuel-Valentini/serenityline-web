import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../app/store/hooks";
import {
    selectAccounts,
    selectActiveCategories,
    selectBuckets,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectFinancialPriorities,
    selectSimulationGroups,
} from "../../features/finance/financeDataSelectors";

type DashboardMetricCardProps = {
    label: string;
    value: number;
    description: string;
};

function DashboardMetricCard({
    label,
    value,
    description,
}: DashboardMetricCardProps) {
    return (
        <article className="sl-panel">
            <p className="sl-eyebrow">{label}</p>
            <h2>{value}</h2>
            <p>{description}</p>
        </article>
    );
}

export function DashboardPage() {
    const { t } = useTranslation("dashboard");

    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);
    const accounts = useAppSelector(selectAccounts);
    const activeCategories = useAppSelector(selectActiveCategories);
    const buckets = useAppSelector(selectBuckets);
    const simulationGroups = useAppSelector(selectSimulationGroups);
    const financialPriorities = useAppSelector(selectFinancialPriorities);

    const hasNoFinanceData =
        financeDataStatus === "loaded" &&
        accounts.length === 0 &&
        buckets.length === 0 &&
        simulationGroups.length === 0;

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">SerenityLine</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            {financeDataStatus === "loading" ? (
                <div className="alert alert-info" role="status">
                    {t("loading")}
                </div>
            ) : null}

            {financeDataStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("loadErrorTitle")}</h2>
                    <p className="mb-0">
                        {financeDataError?.message ?? t("loadErrorFallback")}
                    </p>
                </div>
            ) : null}

            {hasNoFinanceData ? (
                <article className="sl-panel">
                    <h2>{t("emptyState.title")}</h2>
                    <p>{t("emptyState.text")}</p>
                </article>
            ) : null}

            <div className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.accounts")}
                        value={accounts.length}
                        description={t("metrics.accountsDescription")}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.buckets")}
                        value={buckets.length}
                        description={t("metrics.bucketsDescription")}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.simulations")}
                        value={simulationGroups.length}
                        description={t("metrics.simulationsDescription")}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.categories")}
                        value={activeCategories.length}
                        description={t("metrics.categoriesDescription")}
                    />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-6">
                    <article className="sl-panel">
                        <h2>{t("sections.nextSteps")}</h2>
                        <p>{t("sections.nextStepsText")}</p>
                    </article>
                </div>

                <div className="col-12 col-xl-6">
                    <article className="sl-panel">
                        <h2>{t("sections.priorities")}</h2>
                        <p>
                            {t("sections.prioritiesText", {
                                count: financialPriorities.length,
                            })}
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    createRecurringTransaction,
    getFinanceReportSummary,
    listRecurringTransactions,
} from "../../features/finance/api/financeApi";
import type {
    RecurrenceUnit,
    RecurringTransactionCreateRequestDto,
    RecurringTransactionResponseDto,
    FinanceReportPointDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectActiveCategories,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectFinanceReportSummary,
    selectFinancialPriorities,
} from "../../features/finance/financeDataSelectors";
import { financeReportSummaryLoaded } from "../../features/finance/financeDataSlice";
import { RecurringTransactionForm } from "../../features/finance/transactionForms/RecurringTransactionForm";
import { formatMoneyAmountForDisplay } from "../../features/finance/transactionForms/moneyInput";
import { ApiError } from "../../shared/api";

type PageStatus = "idle" | "loading" | "loaded" | "failed";

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        if (
            typeof error.body === "object" &&
            error.body !== null &&
            "message" in error.body &&
            typeof error.body.message === "string"
        ) {
            return error.body.message;
        }

        return error.message || fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

export function RecurringTransactionsPage() {
    const { i18n, t } = useTranslation("recurringTransactions");
    const dispatch = useAppDispatch();

    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectActiveCategories);
    const financialPriorities = useAppSelector(selectFinancialPriorities);
    const financeReportSummary = useAppSelector(selectFinanceReportSummary);

    const [pageStatus, setPageStatus] = useState<PageStatus>("idle");
    const [pageError, setPageError] = useState<string | null>(null);
    const [recurringTransactions, setRecurringTransactions] = useState<
        RecurringTransactionResponseDto[]
    >([]);

    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";

    const sortedFinancialPriorities = useMemo(
        () =>
            [...financialPriorities].sort(
                (first, second) =>
                    second.financialPriorityRanking -
                    first.financialPriorityRanking,
            ),
        [financialPriorities],
    );

    const sortedRecurringTransactions = useMemo(
        () =>
            [...recurringTransactions].sort((first, second) =>
                first.recurringTransactionFirstPaymentDate.localeCompare(
                    second.recurringTransactionFirstPaymentDate,
                ),
            ),
        [recurringTransactions],
    );

    useEffect(() => {
        let isMounted = true;

        async function loadPageData() {
            setPageStatus("loading");
            setPageError(null);

            try {
                const [reportSummary, recurringTransactionsResponse] =
                    await Promise.all([
                        getFinanceReportSummary(),
                        listRecurringTransactions(),
                    ]);

                if (!isMounted) {
                    return;
                }

                dispatch(financeReportSummaryLoaded(reportSummary));
                setRecurringTransactions(recurringTransactionsResponse);
                setPageStatus("loaded");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setPageError(getErrorMessage(error, t("loadErrorFallback")));
                setPageStatus("failed");
            }
        }

        void loadPageData();

        return () => {
            isMounted = false;
        };
    }, [dispatch, t]);

    function getAccountName(accountId: string) {
        return (
            accounts.find((account) => account.accountId === accountId)
                ?.accountName ?? t("unknown.account")
        );
    }

    function getAccountCurrency(accountId: string) {
        return (
            accounts.find((account) => account.accountId === accountId)
                ?.currency ?? "EUR"
        );
    }

    function getCategoryName(categoryId: string) {
        return (
            categories.find((category) => category.categoryId === categoryId)
                ?.categoryName ?? t("unknown.category")
        );
    }

    function getFinancialPriorityName(financialPriorityId: string) {
        return (
            financialPriorities.find(
                (priority) =>
                    priority.financialPriorityId === financialPriorityId,
            )?.financialPriorityDisplayName ?? t("unknown.financialPriority")
        );
    }

    function formatMoneyAmount(amount: number, currency: string) {
        return formatMoneyAmountForDisplay(amount, displayLanguage, currency);
    }

    function formatIsoDateForDisplay(date: string) {
        return new Intl.DateTimeFormat(displayLanguage).format(new Date(date));
    }

    function formatRecurringMoneyAmount(
        recurringTransaction: RecurringTransactionResponseDto,
    ) {
        return formatMoneyAmount(
            recurringTransaction.paymentAmount,
            getAccountCurrency(recurringTransaction.linkedAccountId),
        );
    }

    function formatRecurrenceFrequency(
        interval: number,
        recurrenceUnit: RecurrenceUnit,
    ) {
        if (interval === 1) {
            return t(`recurrenceUnits.${recurrenceUnit}.singular`);
        }

        return t("recurrenceEvery", {
            interval,
            unit: t(`recurrenceUnits.${recurrenceUnit}.plural`),
        });
    }

    function renderReportPoint(
        label: string,
        point: FinanceReportPointDto,
        currency: string,
    ) {
        return (
            <div className="border-top pt-2 mt-2">
                <div className="d-flex justify-content-between gap-3">
                    <div>
                        <strong>{label}</strong>
                        <div className="small text-muted">
                            {formatIsoDateForDisplay(point.date)} ·{" "}
                            {t(
                                `report.temporalPositions.${point.temporalPosition}`,
                            )}
                        </div>
                        <div className="small text-muted">
                            {t(
                                `report.extremeClassifications.${point.classification}`,
                            )}
                        </div>
                    </div>

                    <div className="text-end">
                        <strong>
                            {formatMoneyAmount(point.value, currency)}
                        </strong>
                        <div className="small text-muted">
                            {point.trend
                                ? t(
                                      `report.trendDirections.${point.trend.direction}`,
                                  )
                                : t("report.trendUnavailable")}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    async function refreshFinanceReportSummary() {
        try {
            const reportSummary = await getFinanceReportSummary();
            dispatch(financeReportSummaryLoaded(reportSummary));
        } catch {
            // La ricorrenza è già stata salvata: evitiamo di mostrare errore
            // solo perché il refresh del report non è riuscito.
        }
    }

    async function handleCreateRecurringTransactions(
        requests: RecurringTransactionCreateRequestDto[],
    ) {
        setIsCreateSubmitting(true);
        setCreateError(null);
        setSuccessMessage(null);

        try {
            const createdRecurringTransactions: RecurringTransactionResponseDto[] =
                [];

            for (const request of requests) {
                const createdRecurringTransaction =
                    await createRecurringTransaction(request);

                createdRecurringTransactions.push(createdRecurringTransaction);
            }

            setRecurringTransactions((currentRecurringTransactions) => [
                ...createdRecurringTransactions,
                ...currentRecurringTransactions,
            ]);

            setIsCreateFormVisible(false);
            setSuccessMessage(t("createSuccess"));

            void refreshFinanceReportSummary();
        } catch (error) {
            setCreateError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsCreateSubmitting(false);
        }
    }

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            {financeDataStatus === "loading" ? (
                <div className="alert alert-info" role="status">
                    {t("referenceDataLoading")}
                </div>
            ) : null}

            {financeDataStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("referenceDataLoadErrorTitle")}</h2>
                    <p className="mb-0">
                        {financeDataError?.message ??
                            t("referenceDataLoadErrorFallback")}
                    </p>
                </div>
            ) : null}

            {pageStatus === "loading" ? (
                <div className="alert alert-info" role="status">
                    {t("loading")}
                </div>
            ) : null}

            {pageStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    {pageError ?? t("loadErrorFallback")}
                </div>
            ) : null}

            {successMessage ? (
                <div className="alert alert-success" role="status">
                    {successMessage}
                </div>
            ) : null}

            <div className="row g-3">
                <div className="col-12 col-xl-8">
                    <article className="sl-panel h-100">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                            <div>
                                <p className="sl-eyebrow">
                                    {t("report.eyebrow")}
                                </p>
                                <h2>{t("report.title")}</h2>
                                <p className="mb-0">
                                    {financeReportSummary
                                        ? t("report.subtitle", {
                                              date: formatIsoDateForDisplay(
                                                  financeReportSummary.asOfDate,
                                              ),
                                          })
                                        : t("report.empty")}
                                </p>
                            </div>
                        </div>
                        {financeReportSummary ? (
                            <div className="d-grid gap-4 mt-4">
                                <section>
                                    <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
                                        <div>
                                            <h3 className="h5 mb-1">
                                                {t("report.recurringTitle")}
                                            </h3>
                                            <p className="text-muted mb-0">
                                                {t("report.recurringSubtitle")}
                                            </p>
                                        </div>
                                    </div>

                                    {financeReportSummary.recurringByCurrency
                                        .length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {t("report.emptySection")}
                                        </p>
                                    ) : (
                                        <div className="row g-3">
                                            {financeReportSummary.recurringByCurrency.map(
                                                (currencySummary) => (
                                                    <div
                                                        className="col-12 col-md-6"
                                                        key={
                                                            currencySummary.currency
                                                        }>
                                                        <div className="border rounded p-3 h-100">
                                                            <p className="sl-eyebrow">
                                                                {
                                                                    currencySummary.currency
                                                                }
                                                            </p>

                                                            <h4 className="h5">
                                                                {formatMoneyAmount(
                                                                    currencySummary.averageMonthlyNetBalance,
                                                                    currencySummary.currency,
                                                                )}
                                                            </h4>

                                                            <p className="text-muted mb-3">
                                                                {t(
                                                                    "report.averageMonthlyNetBalance",
                                                                )}
                                                            </p>

                                                            <dl className="row mb-0 small">
                                                                <dt className="col-7">
                                                                    {t(
                                                                        "report.averageMonthlyIncome",
                                                                    )}
                                                                </dt>
                                                                <dd className="col-5 text-end">
                                                                    {formatMoneyAmount(
                                                                        currencySummary.averageMonthlyIncome,
                                                                        currencySummary.currency,
                                                                    )}
                                                                </dd>

                                                                <dt className="col-7">
                                                                    {t(
                                                                        "report.averageMonthlyExpenses",
                                                                    )}
                                                                </dt>
                                                                <dd className="col-5 text-end">
                                                                    {formatMoneyAmount(
                                                                        currencySummary.averageMonthlyExpenses,
                                                                        currencySummary.currency,
                                                                    )}
                                                                </dd>

                                                                <dt className="col-7">
                                                                    {t(
                                                                        "report.annualIncome",
                                                                    )}
                                                                </dt>
                                                                <dd className="col-5 text-end">
                                                                    {formatMoneyAmount(
                                                                        currencySummary.annualIncome,
                                                                        currencySummary.currency,
                                                                    )}
                                                                </dd>

                                                                <dt className="col-7">
                                                                    {t(
                                                                        "report.annualExpenses",
                                                                    )}
                                                                </dt>
                                                                <dd className="col-5 text-end">
                                                                    {formatMoneyAmount(
                                                                        currencySummary.annualExpenses,
                                                                        currencySummary.currency,
                                                                    )}
                                                                </dd>

                                                                <dt className="col-7">
                                                                    {t(
                                                                        "report.annualNetBalance",
                                                                    )}
                                                                </dt>
                                                                <dd className="col-5 text-end mb-0">
                                                                    {formatMoneyAmount(
                                                                        currencySummary.annualNetBalance,
                                                                        currencySummary.currency,
                                                                    )}
                                                                </dd>
                                                            </dl>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 className="h5 mb-1">
                                        {t("report.extremesTitle")}
                                    </h3>
                                    <p className="text-muted">
                                        {t("report.extremesSubtitle", {
                                            from: formatIsoDateForDisplay(
                                                financeReportSummary
                                                    .extremesRange.from,
                                            ),
                                            to: formatIsoDateForDisplay(
                                                financeReportSummary
                                                    .extremesRange.to,
                                            ),
                                        })}
                                    </p>

                                    {financeReportSummary.extremesByCurrency
                                        .length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {t("report.emptySection")}
                                        </p>
                                    ) : (
                                        <div className="row g-3">
                                            {financeReportSummary.extremesByCurrency.map(
                                                (currencyExtremes) => (
                                                    <div
                                                        className="col-12 col-lg-6"
                                                        key={
                                                            currencyExtremes.currency
                                                        }>
                                                        <div className="border rounded p-3 h-100">
                                                            <p className="sl-eyebrow">
                                                                {
                                                                    currencyExtremes.currency
                                                                }
                                                            </p>

                                                            <h4 className="h6">
                                                                {t(
                                                                    "report.serenityline",
                                                                )}
                                                            </h4>

                                                            {renderReportPoint(
                                                                t(
                                                                    "report.minimum",
                                                                ),
                                                                currencyExtremes.minSerenityline,
                                                                currencyExtremes.currency,
                                                            )}

                                                            {renderReportPoint(
                                                                t(
                                                                    "report.maximum",
                                                                ),
                                                                currencyExtremes.maxSerenityline,
                                                                currencyExtremes.currency,
                                                            )}

                                                            <h4 className="h6 mt-4">
                                                                {t(
                                                                    "report.accountBalance",
                                                                )}
                                                            </h4>

                                                            {renderReportPoint(
                                                                t(
                                                                    "report.minimum",
                                                                ),
                                                                currencyExtremes.minAccountBalance,
                                                                currencyExtremes.currency,
                                                            )}

                                                            {renderReportPoint(
                                                                t(
                                                                    "report.maximum",
                                                                ),
                                                                currencyExtremes.maxAccountBalance,
                                                                currencyExtremes.currency,
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3 className="h5 mb-1">
                                        {t("report.yearEndForecastTitle")}
                                    </h3>
                                    <p className="text-muted">
                                        {t("report.yearEndForecastSubtitle", {
                                            years: financeReportSummary.yearEndForecastYears,
                                        })}
                                    </p>

                                    {financeReportSummary.yearEndForecasts
                                        .length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {t("report.emptySection")}
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            {t(
                                                                "report.forecastYear",
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "report.forecastDate",
                                                            )}
                                                        </th>
                                                        <th>
                                                            {t(
                                                                "report.currency",
                                                            )}
                                                        </th>
                                                        <th className="text-end">
                                                            {t(
                                                                "report.endOfYearAccountBalance",
                                                            )}
                                                        </th>
                                                        <th className="text-end">
                                                            {t(
                                                                "report.endOfYearSerenityline",
                                                            )}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {financeReportSummary.yearEndForecasts.flatMap(
                                                        (forecast) =>
                                                            forecast.balancesByCurrency.map(
                                                                (balance) => (
                                                                    <tr
                                                                        key={`${forecast.year}-${balance.currency}`}>
                                                                        <td>
                                                                            {
                                                                                forecast.year
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {formatIsoDateForDisplay(
                                                                                forecast.date,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                balance.currency
                                                                            }
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {formatMoneyAmount(
                                                                                balance.endOfYearAccountBalance,
                                                                                balance.currency,
                                                                            )}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {formatMoneyAmount(
                                                                                balance.endOfYearSerenityline,
                                                                                balance.currency,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : null}
                    </article>
                </div>

                <div className="col-12 col-xl-4">
                    <article className="sl-panel h-100">
                        <p className="sl-eyebrow">{t("priorities.eyebrow")}</p>
                        <h2>{t("priorities.title")}</h2>
                        <p>{t("priorities.subtitle")}</p>

                        <div className="d-grid gap-2">
                            {sortedFinancialPriorities.map((priority) => (
                                <div
                                    className="border rounded p-3"
                                    key={priority.financialPriorityId}>
                                    <div className="d-flex justify-content-between gap-3">
                                        <strong>
                                            {
                                                priority.financialPriorityDisplayName
                                            }
                                        </strong>
                                        <span className="badge text-bg-light">
                                            {priority.financialPriorityRanking}
                                        </span>
                                    </div>
                                    <p className="small text-muted mb-0 mt-1">
                                        {priority.financialPriorityDescription}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-5">
                    <article className="sl-panel">
                        <div className="d-flex justify-content-between gap-3 align-items-start">
                            <div>
                                <p className="sl-eyebrow">
                                    {t("form.eyebrow")}
                                </p>
                                <h2>{t("form.title")}</h2>
                                <p>{t("form.subtitle")}</p>
                            </div>

                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                    setIsCreateFormVisible(
                                        (currentValue) => !currentValue,
                                    )
                                }
                                type="button">
                                {isCreateFormVisible
                                    ? t("actions.hideForm")
                                    : t("actions.showForm")}
                            </button>
                        </div>

                        {isCreateFormVisible ? (
                            <div className="mt-3">
                                {createError ? (
                                    <div
                                        className="alert alert-danger"
                                        role="alert">
                                        {createError}
                                    </div>
                                ) : null}

                                <RecurringTransactionForm
                                    context={{ type: "standard" }}
                                    isSubmitting={isCreateSubmitting}
                                    onCancel={() =>
                                        setIsCreateFormVisible(false)
                                    }
                                    onSubmit={handleCreateRecurringTransactions}
                                    submitLabel={t("form.submit")}
                                    submittingLabel={t("form.submitting")}
                                />
                            </div>
                        ) : null}
                    </article>
                </div>

                <div className="col-12 col-xl-7">
                    <article className="sl-panel">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                            <div>
                                <p className="sl-eyebrow">
                                    {t("list.eyebrow")}
                                </p>
                                <h2>{t("list.title")}</h2>
                            </div>
                            <span className="text-muted">
                                {t("list.count", {
                                    count: sortedRecurringTransactions.length,
                                })}
                            </span>
                        </div>

                        {sortedRecurringTransactions.length === 0 ? (
                            <p className="text-muted mb-0 mt-3">
                                {t("list.empty")}
                            </p>
                        ) : (
                            <div className="table-responsive mt-3">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>{t("table.description")}</th>
                                            <th>{t("table.amount")}</th>
                                            <th>{t("table.frequency")}</th>
                                            <th>{t("table.firstPayment")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRecurringTransactions.map(
                                            (recurringTransaction) => (
                                                <tr
                                                    key={
                                                        recurringTransaction.recurringTransactionId
                                                    }>
                                                    <td>
                                                        <strong>
                                                            {
                                                                recurringTransaction.recurringTransactionDescription
                                                            }
                                                        </strong>
                                                        <div className="text-muted small">
                                                            {getCategoryName(
                                                                recurringTransaction.categoryId,
                                                            )}{" "}
                                                            ·{" "}
                                                            {getFinancialPriorityName(
                                                                recurringTransaction.financialPriorityId,
                                                            )}{" "}
                                                            ·{" "}
                                                            {getAccountName(
                                                                recurringTransaction.linkedAccountId,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {formatRecurringMoneyAmount(
                                                            recurringTransaction,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatRecurrenceFrequency(
                                                            recurringTransaction.recurrenceInterval,
                                                            recurringTransaction.recurrenceUnit,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatIsoDateForDisplay(
                                                            recurringTransaction.recurringTransactionFirstPaymentDate,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import type { FinanceCalendarDailyBalanceResponseDto } from "../../features/finance/api/financeApiTypes";
import {
    selectDailyBalancesForScenario,
    selectDailyBalancesScenarioEntry,
} from "../../features/finance/dailyBalances/financeDailyBalancesSelectors";
import { loadDailyBalancesRange } from "../../features/finance/dailyBalances/financeDailyBalancesThunks";
import {
    BASE_DAILY_BALANCES_SCENARIO_KEY,
    getInitialSerenityLineRange,
    getTodayIsoDate,
} from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    selectAccounts,
    selectActiveCategories,
    selectBuckets,
    selectCreditCards,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectFinancialPriorities,
    selectSimulationGroups,
} from "../../features/finance/financeDataSelectors";
import { ROUTES } from "../../shared/constants/routes";

type DashboardSignalTone = "good" | "warning" | "danger" | "neutral";

type DashboardSignal = {
    tone: DashboardSignalTone;
    title: string;
    text: string;
    cta: string;
    to: string;
};

type DashboardPoint = {
    date: string;
    value: number;
};

type DashboardMetricCardProps = {
    label: string;
    value: string;
    description: string;
    tone?: DashboardSignalTone;
};

function formatIsoDateForDisplay(date: string, language: string) {
    return new Intl.DateTimeFormat(language).format(
        new Date(`${date}T00:00:00`),
    );
}

function getAvailableCurrencies(
    balances: FinanceCalendarDailyBalanceResponseDto[],
    accountCurrencies: string[],
) {
    const currencies = new Set<string>();

    balances.forEach((balance) => {
        balance.totalsByCurrency.forEach((total) => {
            currencies.add(total.currency);
        });
    });

    accountCurrencies.forEach((currency) => {
        currencies.add(currency);
    });

    return [...currencies].sort();
}

function getCurrencyTotal(
    balance: FinanceCalendarDailyBalanceResponseDto | null | undefined,
    currency: string,
) {
    return (
        balance?.totalsByCurrency.find(
            (total) => total.currency === currency,
        ) ?? null
    );
}

function getSerenityLineValue(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
) {
    const total = getCurrencyTotal(balance, currency);

    return total ? Number(total.endOfDaySerenityline) : null;
}

function getAccountBalanceValue(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
) {
    const total = getCurrencyTotal(balance, currency);

    return total ? Number(total.endOfDayAccountsBalance) : null;
}

function findBalanceOnOrAfter(
    balances: FinanceCalendarDailyBalanceResponseDto[],
    date: string,
) {
    return (
        balances.find((balance) => balance.date >= date) ??
        balances[balances.length - 1] ??
        null
    );
}

function findMinimumSerenityLinePoint(
    balances: FinanceCalendarDailyBalanceResponseDto[],
    currency: string,
    fromDate: string,
): DashboardPoint | null {
    return balances
        .filter((balance) => balance.date >= fromDate)
        .reduce<DashboardPoint | null>((minimumPoint, balance) => {
            const value = getSerenityLineValue(balance, currency);

            if (value == null) {
                return minimumPoint;
            }

            if (!minimumPoint || value < minimumPoint.value) {
                return {
                    date: balance.date,
                    value,
                };
            }

            return minimumPoint;
        }, null);
}

function findFirstNegativeSerenityLinePoint(
    balances: FinanceCalendarDailyBalanceResponseDto[],
    currency: string,
    fromDate: string,
): DashboardPoint | null {
    const negativeBalance = balances.find((balance) => {
        const value = getSerenityLineValue(balance, currency);

        return balance.date >= fromDate && value != null && value < 0;
    });

    if (!negativeBalance) {
        return null;
    }

    const value = getSerenityLineValue(negativeBalance, currency);

    return value == null
        ? null
        : {
              date: negativeBalance.date,
              value,
          };
}

function getEndOfYearIsoDate(todayIsoDate: string) {
    return `${todayIsoDate.slice(0, 4)}-12-31`;
}

function getDaysBetween(from: string, to: string) {
    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T00:00:00Z`);

    return Math.round(
        (toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000),
    );
}

function formatMoneyOrDash(
    value: number | null | undefined,
    amountFormatter: Intl.NumberFormat,
) {
    if (typeof value !== "number") {
        return "—";
    }

    return amountFormatter.format(value);
}

function DashboardMetricCard({
    label,
    value,
    description,
    tone = "neutral",
}: DashboardMetricCardProps) {
    return (
        <article className={`sl-panel sl-dashboard-metric is-${tone}`}>
            <p className="sl-eyebrow">{label}</p>
            <strong>{value}</strong>
            <p>{description}</p>
        </article>
    );
}

export function DashboardPage() {
    const { i18n, t } = useTranslation("dashboard");
    const dispatch = useAppDispatch();

    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";
    const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
    const initialRange = useMemo(
        () => getInitialSerenityLineRange(todayIsoDate),
        [todayIsoDate],
    );

    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);
    const accounts = useAppSelector(selectAccounts);
    const creditCards = useAppSelector(selectCreditCards);
    const activeCategories = useAppSelector(selectActiveCategories);
    const buckets = useAppSelector(selectBuckets);
    const simulationGroups = useAppSelector(selectSimulationGroups);
    const financialPriorities = useAppSelector(selectFinancialPriorities);

    const balances = useAppSelector((state) =>
        selectDailyBalancesForScenario(state, BASE_DAILY_BALANCES_SCENARIO_KEY),
    );

    const cacheEntry = useAppSelector((state) =>
        selectDailyBalancesScenarioEntry(
            state,
            BASE_DAILY_BALANCES_SCENARIO_KEY,
        ),
    );

    const [preferredCurrency, setPreferredCurrency] = useState<string | null>(
        null,
    );

    const accountCurrencies = useMemo(
        () => [...new Set(accounts.map((account) => account.currency))].sort(),
        [accounts],
    );

    const availableCurrencies = useMemo(
        () => getAvailableCurrencies(balances, accountCurrencies),
        [accountCurrencies, balances],
    );

    const selectedCurrency =
        preferredCurrency && availableCurrencies.includes(preferredCurrency)
            ? preferredCurrency
            : (availableCurrencies[0] ?? "EUR");

    const amountFormatter = useMemo(
        () =>
            new Intl.NumberFormat(displayLanguage, {
                currency: selectedCurrency,
                maximumFractionDigits: 0,
                style: "currency",
            }),
        [displayLanguage, selectedCurrency],
    );

    useEffect(() => {
    if (
        financeDataStatus !== "loaded" ||
        accounts.length === 0 ||
        cacheEntry.status === "failed" ||
        cacheEntry.loadedFrom ||
        cacheEntry.pendingRangeKeys.length > 0
    ) {
        return;
    }

    void dispatch(
        loadDailyBalancesRange({
            range: initialRange,
        }),
    );
}, [
    accounts.length,
    cacheEntry.loadedFrom,
    cacheEntry.pendingRangeKeys.length,
    cacheEntry.status,
    dispatch,
    financeDataStatus,
    initialRange,
]);

    const todayBalance = useMemo(
        () => findBalanceOnOrAfter(balances, todayIsoDate),
        [balances, todayIsoDate],
    );

    const yearEndDate = useMemo(
        () => getEndOfYearIsoDate(todayIsoDate),
        [todayIsoDate],
    );

    const yearEndBalance = useMemo(
        () => findBalanceOnOrAfter(balances, yearEndDate),
        [balances, yearEndDate],
    );

    const serenityLineToday =
        todayBalance == null
            ? null
            : getSerenityLineValue(todayBalance, selectedCurrency);

    const accountBalanceToday =
        todayBalance == null
            ? null
            : getAccountBalanceValue(todayBalance, selectedCurrency);

    const serenityLineVsAccountBalance =
        serenityLineToday != null && accountBalanceToday != null
            ? serenityLineToday - accountBalanceToday
            : null;

    const minimumFuturePoint = useMemo(
        () =>
            findMinimumSerenityLinePoint(
                balances,
                selectedCurrency,
                todayIsoDate,
            ),
        [balances, selectedCurrency, todayIsoDate],
    );

    const firstNegativePoint = useMemo(
        () =>
            findFirstNegativeSerenityLinePoint(
                balances,
                selectedCurrency,
                todayIsoDate,
            ),
        [balances, selectedCurrency, todayIsoDate],
    );

    const yearEndSerenityLine =
        yearEndBalance == null
            ? null
            : getSerenityLineValue(yearEndBalance, selectedCurrency);

    const loadedDays =
        cacheEntry.loadedFrom && cacheEntry.loadedTo
            ? getDaysBetween(cacheEntry.loadedFrom, cacheEntry.loadedTo) + 1
            : 0;

    const dashboardSignal: DashboardSignal = useMemo(() => {
        if (accounts.length === 0) {
            return {
                tone: "warning",
                title: t("status.noAccounts.title"),
                text: t("status.noAccounts.text"),
                cta: t("status.noAccounts.cta"),
                to: ROUTES.app.accounts,
            };
        }

        if (cacheEntry.status === "loading" && balances.length === 0) {
            return {
                tone: "neutral",
                title: t("status.loading.title"),
                text: t("status.loading.text"),
                cta: t("status.loading.cta"),
                to: ROUTES.app.serenityline,
            };
        }

        if (firstNegativePoint) {
            return {
                tone: "danger",
                title: t("status.risk.title"),
                text: t("status.risk.text", {
                    date: formatIsoDateForDisplay(
                        firstNegativePoint.date,
                        displayLanguage,
                    ),
                    amount: amountFormatter.format(firstNegativePoint.value),
                }),
                cta: t("status.risk.cta"),
                to: ROUTES.app.calendar,
            };
        }

        if (
            minimumFuturePoint &&
            serenityLineToday != null &&
            minimumFuturePoint.value <
                Math.max(500, Math.abs(serenityLineToday) * 0.1)
        ) {
            return {
                tone: "warning",
                title: t("status.lowMargin.title"),
                text: t("status.lowMargin.text", {
                    date: formatIsoDateForDisplay(
                        minimumFuturePoint.date,
                        displayLanguage,
                    ),
                    amount: amountFormatter.format(minimumFuturePoint.value),
                }),
                cta: t("status.lowMargin.cta"),
                to: ROUTES.app.serenityline,
            };
        }

        if (balances.length === 0) {
            return {
                tone: "neutral",
                title: t("status.notEnoughData.title"),
                text: t("status.notEnoughData.text"),
                cta: t("status.notEnoughData.cta"),
                to: ROUTES.app.transactions,
            };
        }

        return {
            tone: "good",
            title: t("status.positive.title"),
            text: t("status.positive.text"),
            cta: t("status.positive.cta"),
            to: ROUTES.app.serenityline,
        };
    }, [
        accounts.length,
        amountFormatter,
        balances.length,
        cacheEntry.status,
        displayLanguage,
        firstNegativePoint,
        minimumFuturePoint,
        serenityLineToday,
        t,
    ]);

    const setupSteps = [
        {
            key: "accounts",
            done: accounts.length > 0,
            to: ROUTES.app.accounts,
        },
        {
            key: "categories",
            done: activeCategories.length > 0,
            to: ROUTES.app.categories,
        },
        {
            key: "transactions",
            done: false,
            to: ROUTES.app.transactions,
        },
        {
            key: "recurring",
            done: false,
            to: ROUTES.app.recurringTransactions,
        },
        {
            key: "buckets",
            done: buckets.length > 0,
            to: ROUTES.app.buckets,
        },
        {
            key: "simulations",
            done: simulationGroups.length > 0,
            to: ROUTES.app.simulations,
        },
    ];

    return (
        <section className="sl-page sl-dashboard-page">
            <header className={`sl-dashboard-hero is-${dashboardSignal.tone}`}>
                <div>
                    <p className="sl-eyebrow">{t("hero.eyebrow")}</p>
                    <h1>{t("title")}</h1>
                    <p className="lead">{t("subtitle")}</p>
                </div>

                <div className="sl-dashboard-hero-actions">
                    <Link className="btn btn-primary" to={dashboardSignal.to}>
                        {dashboardSignal.cta}
                    </Link>
                    <Link
                        className="btn btn-outline-primary"
                        to={ROUTES.app.transactions}>
                        {t("hero.quickTransaction")}
                    </Link>
                </div>
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

            {cacheEntry.status === "failed" ? (
                <div className="alert alert-warning" role="alert">
                    {t("dailyBalancesErrorFallback")}
                </div>
            ) : null}

            <article
                className={`sl-panel sl-dashboard-signal is-${dashboardSignal.tone}`}>
                <div>
                    <p className="sl-eyebrow">{t("status.eyebrow")}</p>
                    <h2>{dashboardSignal.title}</h2>
                    <p>{dashboardSignal.text}</p>
                </div>

                {availableCurrencies.length > 1 ? (
                    <div className="sl-dashboard-currency">
                        <label
                            className="form-label"
                            htmlFor="dashboardCurrency">
                            {t("currency.label")}
                        </label>
                        <select
                            className="form-select"
                            id="dashboardCurrency"
                            onChange={(event) =>
                                setPreferredCurrency(event.target.value)
                            }
                            value={selectedCurrency}>
                            {availableCurrencies.map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="sl-dashboard-currency-pill">
                        {selectedCurrency}
                    </div>
                )}
            </article>

            <div className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.serenityLineToday")}
                        value={formatMoneyOrDash(
                            serenityLineToday,
                            amountFormatter,
                        )}
                        description={
                            serenityLineVsAccountBalance == null
                                ? t("metrics.accountBalanceUnavailable")
                                : serenityLineVsAccountBalance === 0
                                  ? t("metrics.accountBalanceAligned")
                                  : t("metrics.accountBalanceDifference", {
                                        amount: amountFormatter.format(
                                            serenityLineVsAccountBalance,
                                        ),
                                    })
                        }
                        tone={dashboardSignal.tone}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.totalBalance")}
                        value={formatMoneyOrDash(
                            accountBalanceToday,
                            amountFormatter,
                        )}
                        description={t("metrics.totalBalanceDescription")}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.futureMinimum")}
                        value={formatMoneyOrDash(
                            minimumFuturePoint?.value,
                            amountFormatter,
                        )}
                        description={
                            minimumFuturePoint
                                ? t("metrics.minimumOn", {
                                      date: formatIsoDateForDisplay(
                                          minimumFuturePoint.date,
                                          displayLanguage,
                                      ),
                                  })
                                : t("metrics.noProjection")
                        }
                        tone={
                            minimumFuturePoint && minimumFuturePoint.value < 0
                                ? "danger"
                                : "neutral"
                        }
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <DashboardMetricCard
                        label={t("metrics.yearEnd")}
                        value={formatMoneyOrDash(
                            yearEndSerenityLine,
                            amountFormatter,
                        )}
                        description={t("metrics.yearEndOn", {
                            date: formatIsoDateForDisplay(
                                yearEndBalance?.date ?? yearEndDate,
                                displayLanguage,
                            ),
                        })}
                    />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-7">
                    <article className="sl-panel sl-dashboard-getting-started">
                        <div className="sl-section-heading">
                            <div>
                                <p className="sl-eyebrow">
                                    {t("gettingStarted.eyebrow")}
                                </p>
                                <h2>{t("gettingStarted.title")}</h2>
                                <p>{t("gettingStarted.subtitle")}</p>
                            </div>
                        </div>

                        <div className="sl-dashboard-step-list">
                            {setupSteps.map((step) => (
                                <Link
                                    className={
                                        step.done
                                            ? "sl-dashboard-step is-done"
                                            : "sl-dashboard-step"
                                    }
                                    key={step.key}
                                    to={step.to}>
                                    <span aria-hidden="true">
                                        {step.done ? "✓" : "→"}
                                    </span>
                                    <strong>
                                        {t(
                                            `gettingStarted.steps.${step.key}.title`,
                                        )}
                                    </strong>
                                    <small>
                                        {t(
                                            `gettingStarted.steps.${step.key}.text`,
                                        )}
                                    </small>
                                    <em>
                                        {step.done
                                            ? t("gettingStarted.done")
                                            : t("gettingStarted.open")}
                                    </em>
                                </Link>
                            ))}
                        </div>
                    </article>
                </div>

                <div className="col-12 col-xl-5">
                    <article className="sl-panel sl-dashboard-value-card">
                        <p className="sl-eyebrow">{t("value.eyebrow")}</p>
                        <h2>{t("value.title")}</h2>
                        <p>{t("value.text")}</p>

                        <dl>
                            <div>
                                <dt>{t("value.accounts")}</dt>
                                <dd>{accounts.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.creditCards")}</dt>
                                <dd>{creditCards.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.buckets")}</dt>
                                <dd>{buckets.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.simulations")}</dt>
                                <dd>{simulationGroups.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.priorities")}</dt>
                                <dd>{financialPriorities.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.loadedDays")}</dt>
                                <dd>{loadedDays > 0 ? loadedDays : "—"}</dd>
                            </div>
                        </dl>
                    </article>
                </div>
            </div>

            <article className="sl-panel sl-dashboard-actions">
                <div>
                    <p className="sl-eyebrow">{t("quickActions.eyebrow")}</p>
                    <h2>{t("quickActions.title")}</h2>
                    <p>{t("quickActions.subtitle")}</p>
                </div>

                <div className="sl-dashboard-action-grid">
                    <Link to={ROUTES.app.serenityline}>
                        {t("quickActions.serenityline")}
                    </Link>
                    <Link to={ROUTES.app.calendar}>
                        {t("quickActions.calendar")}
                    </Link>
                    <Link to={ROUTES.app.transactions}>
                        {t("quickActions.transactions")}
                    </Link>
                    <Link to={ROUTES.app.recurringTransactions}>
                        {t("quickActions.recurring")}
                    </Link>
                    <Link to={ROUTES.app.balances}>
                        {t("quickActions.balances")}
                    </Link>
                    <Link to={ROUTES.app.simulations}>
                        {t("quickActions.simulations")}
                    </Link>
                </div>
            </article>
        </section>
    );
}

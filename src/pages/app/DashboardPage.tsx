import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import { listCalendarMovements } from "../../features/finance/api/financeApi";
import type {
    AccountResponseDto,
    BucketResponseDto,
    CategoryResponseDto,
    FinanceCalendarDailyBalanceResponseDto,
    FinanceCalendarMovementResponseDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectDailyBalancesForScenario,
    selectDailyBalancesScenarioEntry,
} from "../../features/finance/dailyBalances/financeDailyBalancesSelectors";
import { loadDailyBalancesRange } from "../../features/finance/dailyBalances/financeDailyBalancesThunks";
import {
    BASE_DAILY_BALANCES_SCENARIO_KEY,
    getDailyBalancesRangeKey,
    getInitialSerenityLineRange,
    getTodayIsoDate,
} from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    selectAccounts,
    selectActiveCategories,
    selectBuckets,
    selectCategories,
    selectCreditCards,
    selectFinanceDataError,
    selectFinanceDataStatus,
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

type DashboardExpenseStatus = "idle" | "loading" | "loaded" | "failed";

type DashboardCategoryExpense = {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
};

type DashboardBucketCoverageWarning = {
    key: string;
    bucketName: string;
    negativeAccountName: string;
    negativeAmount: number;
    positiveAccountName: string | null;
    positiveAmount: number | null;
    positiveTotal: number;
    positiveAccountCount: number;
};

const DASHBOARD_EXPENSE_CHART_COLORS = [
    "#2f8064",
    "#c79a4b",
    "#4f6f8f",
    "#b06f4f",
    "#7a8f79",
    "#8f6f9f",
    "#3f9f7c",
    "#d9b66f",
    "#5d7280",
    "#a96d7a",
    "#6f8f4f",
    "#c8845d",
];

function getDashboardExpenseChartColor(index: number) {
    return DASHBOARD_EXPENSE_CHART_COLORS[
        index % DASHBOARD_EXPENSE_CHART_COLORS.length
    ];
}

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

function getYearRange(year: number) {
    return {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
    };
}

function getDashboardExpenseYearOptions(todayIsoDate: string) {
    const currentYear = Number(todayIsoDate.slice(0, 4));

    return Array.from({ length: 9 }, (_, index) => currentYear - 4 + index);
}

function getCategoryExpenseBreakdown(
    movements: FinanceCalendarMovementResponseDto[],
    categories: CategoryResponseDto[],
    accounts: { accountId: string; currency: string }[],
    selectedCurrency: string,
    fallbackCategoryName: string,
): DashboardCategoryExpense[] {
    const categoriesById = new Map(
        categories.map((category) => [category.categoryId, category]),
    );

    const accountsById = new Map(
        accounts.map((account) => [account.accountId, account]),
    );

    const totalsByCategoryId = new Map<
        string,
        {
            categoryName: string;
            total: number;
        }
    >();

    movements.forEach((movement) => {
        if (
            movement.amount >= 0 ||
            movement.affectsSerenityline !== true ||
            movement.simulated === true
        ) {
            return;
        }

        const account = accountsById.get(movement.accountId);

        if (account?.currency !== selectedCurrency) {
            return;
        }

        const category = categoriesById.get(movement.categoryId);
        const currentTotal = totalsByCategoryId.get(movement.categoryId);

        totalsByCategoryId.set(movement.categoryId, {
            categoryName: category?.categoryName ?? fallbackCategoryName,
            total: (currentTotal?.total ?? 0) + Math.abs(movement.amount),
        });
    });

    const totalExpenses = [...totalsByCategoryId.values()].reduce(
        (sum, categoryTotal) => sum + categoryTotal.total,
        0,
    );

    if (totalExpenses <= 0) {
        return [];
    }

    return [...totalsByCategoryId.entries()]
        .map(([categoryId, categoryTotal]) => ({
            categoryId,
            categoryName: categoryTotal.categoryName,
            total: categoryTotal.total,
            percentage: (categoryTotal.total / totalExpenses) * 100,
        }))
        .sort((first, second) => second.total - first.total);
}

function getDashboardBucketCoverageWarnings(
    balance: FinanceCalendarDailyBalanceResponseDto | null | undefined,
    accounts: AccountResponseDto[],
    buckets: BucketResponseDto[],
    currency: string,
    unknownAccountName: string,
    unknownBucketName: string,
): DashboardBucketCoverageWarning[] {
    if (!balance) {
        return [];
    }

    const accountsById = new Map(
        accounts.map((account) => [account.accountId, account]),
    );

    const bucketsById = new Map(
        buckets.map((bucket) => [bucket.bucketId, bucket]),
    );

    const balancesByBucketId = new Map<
        string,
        {
            accountId: string;
            accountName: string;
            bucketId: string;
            bucketName: string;
            balance: number;
        }[]
    >();

    balance.accounts
        .filter((accountBalance) => accountBalance.currency === currency)
        .forEach((accountBalance) => {
            const account = accountsById.get(accountBalance.accountId);

            accountBalance.buckets.forEach((bucketBalance) => {
                const value = Number(bucketBalance.endOfDayBucketBalance);

                if (!Number.isFinite(value) || value === 0) {
                    return;
                }

                const bucket = bucketsById.get(bucketBalance.bucketId);
                const currentBalances =
                    balancesByBucketId.get(bucketBalance.bucketId) ?? [];

                currentBalances.push({
                    accountId: accountBalance.accountId,
                    accountName: account?.accountName ?? unknownAccountName,
                    bucketId: bucketBalance.bucketId,
                    bucketName: bucket?.bucketName ?? unknownBucketName,
                    balance: value,
                });

                balancesByBucketId.set(bucketBalance.bucketId, currentBalances);
            });
        });

    return [...balancesByBucketId.values()]
        .flatMap((bucketAccountBalances) =>
            bucketAccountBalances
                .filter(
                    (bucketAccountBalance) => bucketAccountBalance.balance < 0,
                )
                .map((negativeBalance) => {
                    const positiveBalances = bucketAccountBalances
                        .filter(
                            (bucketAccountBalance) =>
                                bucketAccountBalance.accountId !==
                                    negativeBalance.accountId &&
                                bucketAccountBalance.balance > 0,
                        )
                        .sort(
                            (first, second) => second.balance - first.balance,
                        );

                    const positiveTotal = positiveBalances.reduce(
                        (sum, positiveBalance) => sum + positiveBalance.balance,
                        0,
                    );

                    return {
                        key: `${negativeBalance.bucketId}:${negativeBalance.accountId}`,
                        bucketName: negativeBalance.bucketName,
                        negativeAccountName: negativeBalance.accountName,
                        negativeAmount: Math.abs(negativeBalance.balance),
                        positiveAccountName:
                            positiveBalances.length === 1
                                ? positiveBalances[0].accountName
                                : null,
                        positiveAmount:
                            positiveBalances.length === 1
                                ? positiveBalances[0].balance
                                : null,
                        positiveTotal,
                        positiveAccountCount: positiveBalances.length,
                    };
                }),
        )
        .sort((first, second) =>
            `${first.bucketName}:${first.negativeAccountName}`.localeCompare(
                `${second.bucketName}:${second.negativeAccountName}`,
            ),
        );
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
    const categories = useAppSelector(selectCategories);
    const buckets = useAppSelector(selectBuckets);
    const simulationGroups = useAppSelector(selectSimulationGroups);

    const balances = useAppSelector((state) =>
        selectDailyBalancesForScenario(state, BASE_DAILY_BALANCES_SCENARIO_KEY),
    );

    const cacheEntry = useAppSelector((state) =>
        selectDailyBalancesScenarioEntry(
            state,
            BASE_DAILY_BALANCES_SCENARIO_KEY,
        ),
    );

    const initialRangeKey = useMemo(
        () => getDailyBalancesRangeKey(initialRange),
        [initialRange],
    );

    const hasRequestedInitialRange =
        cacheEntry.loadedRangeKeys.includes(initialRangeKey) ||
        cacheEntry.pendingRangeKeys.includes(initialRangeKey);

    const [preferredCurrency, setPreferredCurrency] = useState<string | null>(
        null,
    );

    const [selectedExpenseYear, setSelectedExpenseYear] = useState<
        number | null
    >(null);
    const [expenseState, setExpenseState] = useState<{
        rangeKey: string | null;
        status: Exclude<DashboardExpenseStatus, "loading">;
        movements: FinanceCalendarMovementResponseDto[];
        error: string | null;
    }>({
        rangeKey: null,
        status: "idle",
        movements: [],
        error: null,
    });

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

    const detailedAmountFormatter = useMemo(
        () =>
            new Intl.NumberFormat(displayLanguage, {
                currency: selectedCurrency,
                maximumFractionDigits: 2,
                style: "currency",
            }),
        [displayLanguage, selectedCurrency],
    );

    const percentageFormatter = useMemo(
        () =>
            new Intl.NumberFormat(displayLanguage, {
                maximumFractionDigits: 1,
                minimumFractionDigits: 0,
                style: "percent",
            }),
        [displayLanguage],
    );

    const expenseYearOptions = useMemo(
        () => getDashboardExpenseYearOptions(todayIsoDate),
        [todayIsoDate],
    );

    const expenseRange = useMemo(() => {
        if (selectedExpenseYear !== null) {
            return getYearRange(selectedExpenseYear);
        }

        return initialRange;
    }, [initialRange, selectedExpenseYear]);

    const expenseRangeKey = useMemo(
        () => `${expenseRange.from}:${expenseRange.to}`,
        [expenseRange.from, expenseRange.to],
    );

    const canLoadExpenseMovements =
        financeDataStatus === "loaded" && accounts.length > 0;

    const expenseStateMatchesCurrentRange =
        expenseState.rangeKey === expenseRangeKey;

    const expenseStatus: DashboardExpenseStatus = !canLoadExpenseMovements
        ? "idle"
        : expenseStateMatchesCurrentRange
          ? expenseState.status
          : "loading";

    const expenseMovements = useMemo(
        () =>
            canLoadExpenseMovements && expenseStateMatchesCurrentRange
                ? expenseState.movements
                : [],
        [
            canLoadExpenseMovements,
            expenseState.movements,
            expenseStateMatchesCurrentRange,
        ],
    );

    const expenseError =
        canLoadExpenseMovements && expenseStateMatchesCurrentRange
            ? expenseState.error
            : null;

    useEffect(() => {
        if (
            financeDataStatus !== "loaded" ||
            accounts.length === 0 ||
            cacheEntry.status === "failed" ||
            hasRequestedInitialRange
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
        cacheEntry.status,
        dispatch,
        financeDataStatus,
        hasRequestedInitialRange,
        initialRange,
    ]);

    useEffect(() => {
        if (!canLoadExpenseMovements) {
            return;
        }

        let cancelled = false;

        void listCalendarMovements({
            from: expenseRange.from,
            to: expenseRange.to,
        })
            .then((movements) => {
                if (cancelled) {
                    return;
                }

                setExpenseState({
                    rangeKey: expenseRangeKey,
                    status: "loaded",
                    movements,
                    error: null,
                });
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }

                setExpenseState({
                    rangeKey: expenseRangeKey,
                    status: "failed",
                    movements: [],
                    error: error instanceof Error ? error.message : null,
                });
            });

        return () => {
            cancelled = true;
        };
    }, [
        canLoadExpenseMovements,
        expenseRange.from,
        expenseRange.to,
        expenseRangeKey,
    ]);

    const todayBalance = useMemo(
        () => findBalanceOnOrAfter(balances, todayIsoDate),
        [balances, todayIsoDate],
    );

    const bucketCoverageWarnings = useMemo(
        () =>
            getDashboardBucketCoverageWarnings(
                todayBalance,
                accounts,
                buckets,
                selectedCurrency,
                t("bucketWarnings.unknownAccount"),
                t("bucketWarnings.unknownBucket"),
            ),
        [accounts, buckets, selectedCurrency, t, todayBalance],
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

    const categoryExpenseBreakdown = useMemo(
        () =>
            getCategoryExpenseBreakdown(
                expenseMovements,
                categories,
                accounts,
                selectedCurrency,
                t("expenseCategories.unknownCategory"),
            ),
        [accounts, categories, expenseMovements, selectedCurrency, t],
    );

    const totalCategoryExpenses = categoryExpenseBreakdown.reduce(
        (sum, categoryExpense) => sum + categoryExpense.total,
        0,
    );

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

            {bucketCoverageWarnings.length > 0 ? (
                <section
                    aria-labelledby="dashboardBucketWarningsTitle"
                    aria-live="polite"
                    className="sl-panel sl-dashboard-bucket-warnings">
                    <div className="sl-section-heading">
                        <div>
                            <p className="sl-eyebrow">
                                {t("bucketWarnings.eyebrow")}
                            </p>
                            <h2 id="dashboardBucketWarningsTitle">
                                {t("bucketWarnings.title")}
                            </h2>
                            <p>{t("bucketWarnings.subtitle")}</p>
                        </div>

                        <div className="text-center">
                            <Link
                                className="btn btn-outline-primary btn-sm"
                                to={ROUTES.app.buckets}>
                                {t("bucketWarnings.cta")}
                            </Link>
                        </div>
                    </div>

                    <div className="sl-dashboard-bucket-warning-list">
                        {bucketCoverageWarnings.map((warning) => (
                            <article
                                className="sl-dashboard-bucket-warning"
                                key={warning.key}>
                                <span aria-hidden="true">!</span>
                                <p>
                                    {warning.positiveAccountCount === 1 &&
                                    warning.positiveAccountName &&
                                    warning.positiveAmount != null
                                        ? t(
                                              "bucketWarnings.withSinglePositive",
                                              {
                                                  bucketName:
                                                      warning.bucketName,
                                                  negativeAccountName:
                                                      warning.negativeAccountName,
                                                  negativeAmount:
                                                      detailedAmountFormatter.format(
                                                          warning.negativeAmount,
                                                      ),
                                                  positiveAccountName:
                                                      warning.positiveAccountName,
                                                  positiveAmount:
                                                      detailedAmountFormatter.format(
                                                          warning.positiveAmount,
                                                      ),
                                              },
                                          )
                                        : warning.positiveAccountCount > 1
                                          ? t(
                                                "bucketWarnings.withMultiplePositive",
                                                {
                                                    bucketName:
                                                        warning.bucketName,
                                                    negativeAccountName:
                                                        warning.negativeAccountName,
                                                    negativeAmount:
                                                        detailedAmountFormatter.format(
                                                            warning.negativeAmount,
                                                        ),
                                                    positiveTotal:
                                                        detailedAmountFormatter.format(
                                                            warning.positiveTotal,
                                                        ),
                                                },
                                            )
                                          : t("bucketWarnings.negativeOnly", {
                                                bucketName: warning.bucketName,
                                                negativeAccountName:
                                                    warning.negativeAccountName,
                                                negativeAmount:
                                                    detailedAmountFormatter.format(
                                                        warning.negativeAmount,
                                                    ),
                                            })}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

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
                                <dt>{t("value.categories")}</dt>
                                <dd>{activeCategories.length}</dd>
                            </div>
                            <div>
                                <dt>{t("value.loadedDays")}</dt>
                                <dd>{loadedDays > 0 ? loadedDays : "—"}</dd>
                            </div>
                        </dl>
                    </article>
                </div>
            </div>

            <article className="sl-panel sl-dashboard-category-expenses">
                <div className="sl-section-heading">
                    <div>
                        <p className="sl-eyebrow">
                            {t("expenseCategories.eyebrow")}
                        </p>
                        <h2>{t("expenseCategories.title")}</h2>
                        <p>
                            {selectedExpenseYear === null
                                ? t("expenseCategories.subtitleLoadedPeriod")
                                : t("expenseCategories.subtitleYear", {
                                      year: selectedExpenseYear,
                                  })}
                        </p>
                    </div>

                    <div className="sl-dashboard-expense-period">
                        <label
                            className="form-label"
                            htmlFor="dashboardExpensePeriod">
                            {t("expenseCategories.periodLabel")}
                        </label>
                        <select
                            className="form-select"
                            id="dashboardExpensePeriod"
                            onChange={(event) => {
                                const value = event.target.value;

                                setSelectedExpenseYear(
                                    value === "loaded" ? null : Number(value),
                                );
                            }}
                            value={selectedExpenseYear ?? "loaded"}>
                            <option value="loaded">
                                {t("expenseCategories.loadedPeriod")}
                            </option>
                            {expenseYearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {expenseStatus === "loading" ? (
                    <div className="alert alert-info mb-0" role="status">
                        {t("expenseCategories.loading")}
                    </div>
                ) : null}

                {expenseStatus === "failed" ? (
                    <div className="alert alert-warning mb-0" role="alert">
                        {expenseError ?? t("expenseCategories.error")}
                    </div>
                ) : null}

                {financeDataStatus === "loaded" &&
                expenseStatus !== "loading" &&
                expenseStatus !== "failed" &&
                categoryExpenseBreakdown.length === 0 ? (
                    <p className="text-muted mb-0">
                        {t("expenseCategories.empty")}
                    </p>
                ) : null}

                {categoryExpenseBreakdown.length > 0 ? (
                    <div className="sl-dashboard-expense-grid">
                        <div
                            className="sl-dashboard-expense-chart"
                            aria-label={t("expenseCategories.chartLabel")}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={categoryExpenseBreakdown}
                                        dataKey="total"
                                        innerRadius={62}
                                        nameKey="categoryName"
                                        outerRadius={105}
                                        paddingAngle={2}>
                                        {categoryExpenseBreakdown.map(
                                            (categoryExpense, index) => (
                                                <Cell
                                                    fill={getDashboardExpenseChartColor(
                                                        index,
                                                    )}
                                                    key={
                                                        categoryExpense.categoryId
                                                    }
                                                    stroke="rgba(255, 255, 255, 0.92)"
                                                    strokeWidth={2}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) =>
                                            detailedAmountFormatter.format(
                                                Number(value),
                                            )
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="sl-dashboard-expense-side">
                            <div className="sl-dashboard-expense-total">
                                <span>{t("expenseCategories.total")}</span>
                                <strong>
                                    {detailedAmountFormatter.format(
                                        totalCategoryExpenses,
                                    )}
                                </strong>
                            </div>

                            <div className="sl-dashboard-expense-table-card">
                                <table className="sl-dashboard-expense-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t(
                                                    "expenseCategories.table.category",
                                                )}
                                            </th>
                                            <th
                                                className="text-end"
                                                scope="col">
                                                {t(
                                                    "expenseCategories.table.amount",
                                                )}
                                            </th>
                                            <th
                                                className="text-end"
                                                scope="col">
                                                {t(
                                                    "expenseCategories.table.percentage",
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryExpenseBreakdown.map(
                                            (categoryExpense, index) => (
                                                <tr
                                                    key={
                                                        categoryExpense.categoryId
                                                    }>
                                                    <td>
                                                        <div className="sl-dashboard-expense-category">
                                                            <span
                                                                aria-hidden="true"
                                                                className="sl-dashboard-expense-color-dot"
                                                                style={{
                                                                    backgroundColor:
                                                                        getDashboardExpenseChartColor(
                                                                            index,
                                                                        ),
                                                                }}
                                                            />
                                                            <span className="sl-dashboard-expense-category-name">
                                                                {
                                                                    categoryExpense.categoryName
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="text-end sl-dashboard-expense-amount">
                                                        {detailedAmountFormatter.format(
                                                            categoryExpense.total,
                                                        )}
                                                    </td>
                                                    <td className="text-end sl-dashboard-expense-percentage">
                                                        {percentageFormatter.format(
                                                            categoryExpense.percentage /
                                                                100,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}
            </article>

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

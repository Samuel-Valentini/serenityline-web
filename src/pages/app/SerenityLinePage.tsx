import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import type {
    FinanceCalendarDailyBalanceResponseDto,
    MoneyAmount,
} from "../../features/finance/api/financeApiTypes";
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
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";

type SerenityLineChartPoint = {
    date: string;
    serenityline: MoneyAmount | null;
};

type TooltipPayloadItem = {
    value?: number;
    payload?: SerenityLineChartPoint;
};

function getCurrencySerenityLineValue(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
) {
    return (
        balance.totalsByCurrency.find((total) => total.currency === currency)
            ?.endOfDaySerenityline ?? null
    );
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

function SerenityLineTooltip({
    active,
    label,
    payload,
    amountFormatter,
    dateFormatter,
    labelText,
}: {
    active?: boolean;
    label?: string;
    payload?: readonly TooltipPayloadItem[];
    amountFormatter: Intl.NumberFormat;
    dateFormatter: (date: string) => string;
    labelText: string;
}) {
    if (!active || !payload || payload.length === 0 || !label) {
        return null;
    }

    const value = payload[0]?.value;

    if (typeof value !== "number") {
        return null;
    }

    return (
        <div className="sl-serenityline-tooltip">
            <strong>{dateFormatter(label)}</strong>
            <span>
                {labelText}: {amountFormatter.format(value)}
            </span>
        </div>
    );
}

export function SerenityLinePage() {
    const { i18n, t } = useTranslation("serenityline");
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

    const hasRequestedInitialRangeRef = useRef(false);

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

    const chartData = useMemo<SerenityLineChartPoint[]>(
        () =>
            balances
                .map((balance) => ({
                    date: balance.date,
                    serenityline: getCurrencySerenityLineValue(
                        balance,
                        selectedCurrency,
                    ),
                }))
                .filter((point) => point.serenityline !== null),
        [balances, selectedCurrency],
    );

    useEffect(() => {
        if (hasRequestedInitialRangeRef.current) {
            return;
        }

        hasRequestedInitialRangeRef.current = true;
        void dispatch(
            loadDailyBalancesRange({
                range: initialRange,
            }),
        );
    }, [dispatch, initialRange]);

    const isLoading = cacheEntry.status === "loading";
    const errorMessage = cacheEntry.error?.message ?? t("loadErrorFallback");

    return (
        <section className="sl-page sl-serenityline-page">
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

            <div className="sl-serenityline-layout">
                <article className="sl-panel sl-serenityline-chart-card">
                    {cacheEntry.status === "failed" ? (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    ) : null}

                    {isLoading && chartData.length === 0 ? (
                        <div className="alert alert-info" role="status">
                            {t("loading")}
                        </div>
                    ) : null}

                    {!isLoading && chartData.length === 0 ? (
                        <p className="text-muted mb-0">{t("empty")}</p>
                    ) : null}

                    {chartData.length > 0 ? (
                        <div
                            aria-label={t("chart.accessibleLabel")}
                            className="sl-serenityline-chart-window">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 28,
                                        right: 40,
                                        bottom: 24,
                                        left: 16,
                                    }}>
                                    <CartesianGrid
                                        stroke="var(--sl-chart-grid)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        minTickGap={42}
                                        tickFormatter={(date) =>
                                            formatIsoDateForDisplay(
                                                String(date),
                                                displayLanguage,
                                            )
                                        }
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            amountFormatter.format(
                                                Number(value),
                                            )
                                        }
                                        width={88}
                                    />
                                    <Tooltip
                                        content={({
                                            active,
                                            label,
                                            payload,
                                        }) => (
                                            <SerenityLineTooltip
                                                active={active}
                                                amountFormatter={
                                                    amountFormatter
                                                }
                                                dateFormatter={(date) =>
                                                    formatIsoDateForDisplay(
                                                        date,
                                                        displayLanguage,
                                                    )
                                                }
                                                label={String(label)}
                                                labelText={t(
                                                    "chart.serenityLine",
                                                )}
                                                payload={
                                                    payload as unknown as readonly TooltipPayloadItem[]
                                                }
                                            />
                                        )}
                                    />
                                    <ReferenceLine
                                        ifOverflow="extendDomain"
                                        label={t("chart.today")}
                                        stroke="var(--sl-chart-today)"
                                        strokeDasharray="4 4"
                                        x={todayIsoDate}
                                    />
                                    <Line
                                        activeDot={{ r: 5 }}
                                        dataKey="serenityline"
                                        dot={false}
                                        isAnimationActive={false}
                                        name={t("chart.serenityLine")}
                                        stroke="var(--sl-chart-serenityline)"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={6}
                                        type="natural"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : null}
                </article>

                <article className="sl-panel sl-serenityline-controls">
                    <div>
                        <p className="sl-eyebrow">{t("controls.eyebrow")}</p>
                        <h2>{t("controls.title")}</h2>
                        <p>{t("controls.subtitle")}</p>
                    </div>

                    <div className="sl-serenityline-controls-grid">
                        <div className="sl-serenityline-currency-control">
                            <label
                                className="form-label"
                                htmlFor="serenitylineCurrency">
                                {t("currency.label")}
                            </label>

                            {availableCurrencies.length > 1 ? (
                                <select
                                    className="form-select"
                                    id="serenitylineCurrency"
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
                            ) : (
                                <div
                                    className="sl-serenityline-currency-pill"
                                    id="serenitylineCurrency">
                                    {selectedCurrency}
                                </div>
                            )}
                        </div>

                        <div className="sl-serenityline-control-note">
                            {t("controls.nextSteps")}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}

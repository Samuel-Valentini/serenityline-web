import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
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
    getTodayIsoDate,
} from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    selectAccounts,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";

const PREVIOUS_RANGE_DAYS = 90;
const NEXT_RANGE_DAYS = 180;
const SCROLL_LOAD_THRESHOLD_PX = 900;

function addDaysToIsoDate(date: string, days: number) {
    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);

    return nextDate.toISOString().slice(0, 10);
}

function getInitialBalancesRange(todayIsoDate: string) {
    return {
        from: addDaysToIsoDate(todayIsoDate, -PREVIOUS_RANGE_DAYS),
        to: addDaysToIsoDate(todayIsoDate, NEXT_RANGE_DAYS),
    };
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

function getCurrencyTotals(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
) {
    return (
        balance.totalsByCurrency.find((total) => total.currency === currency) ??
        null
    );
}

function getAccountEndOfDayBalance(
    balance: FinanceCalendarDailyBalanceResponseDto,
    accountId: string,
    currency: string,
) {
    return (
        balance.accounts.find(
            (accountBalance) =>
                accountBalance.accountId === accountId &&
                accountBalance.currency === currency,
        )?.endOfDayAccountBalance ?? null
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

export function BalancesPage() {
    const { i18n, t } = useTranslation("balances");
    const dispatch = useAppDispatch();

    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";
    const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
    const initialRange = useMemo(
        () => getInitialBalancesRange(todayIsoDate),
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
    const [isLoadingPreviousRange, setIsLoadingPreviousRange] = useState(false);
    const [isLoadingNextRange, setIsLoadingNextRange] = useState(false);

    const balancesWindowRef = useRef<HTMLDivElement | null>(null);
    const todayBalanceRef = useRef<HTMLTableRowElement | null>(null);
    const hasRequestedInitialRangeRef = useRef(false);
    const hasScrolledToTodayRef = useRef(false);
    const isLoadingPreviousRangeRef = useRef(false);
    const isLoadingNextRangeRef = useRef(false);
    const previousRangeArmedRef = useRef(true);
    const nextRangeArmedRef = useRef(true);

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

    const currencyAccounts = useMemo(
        () =>
            accounts.filter((account) => account.currency === selectedCurrency),
        [accounts, selectedCurrency],
    );

    const amountFormatter = useMemo(
        () =>
            new Intl.NumberFormat(displayLanguage, {
                currency: selectedCurrency,
                maximumFractionDigits: 2,
                style: "currency",
            }),
        [displayLanguage, selectedCurrency],
    );

    const isLoading = cacheEntry.status === "loading";
    const errorMessage = cacheEntry.error?.message ?? t("loadErrorFallback");

    const todayTargetDate = useMemo(() => {
        if (balances.length === 0) {
            return null;
        }

        return (
            balances.find((balance) => balance.date >= todayIsoDate)?.date ??
            balances[balances.length - 1]?.date ??
            null
        );
    }, [balances, todayIsoDate]);

    useEffect(() => {
        if (hasRequestedInitialRangeRef.current || balances.length > 0) {
            return;
        }

        hasRequestedInitialRangeRef.current = true;

        void dispatch(
            loadDailyBalancesRange({
                range: initialRange,
            }),
        );
    }, [balances.length, dispatch, initialRange]);

    useEffect(() => {
        if (hasScrolledToTodayRef.current || balances.length === 0) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            if (typeof todayBalanceRef.current?.scrollIntoView === "function") {
                todayBalanceRef.current.scrollIntoView({
                    block: "center",
                });
            }

            hasScrolledToTodayRef.current = true;
        });

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [balances.length, selectedCurrency]);

    useEffect(() => {
        hasScrolledToTodayRef.current = false;
        previousRangeArmedRef.current = true;
        nextRangeArmedRef.current = true;
    }, [selectedCurrency]);

    function getPreviousRange() {
        if (!cacheEntry.loadedFrom) {
            return null;
        }

        return {
            from: addDaysToIsoDate(cacheEntry.loadedFrom, -PREVIOUS_RANGE_DAYS),
            to: addDaysToIsoDate(cacheEntry.loadedFrom, -1),
        };
    }

    function getNextRange() {
        if (!cacheEntry.loadedTo) {
            return null;
        }

        return {
            from: addDaysToIsoDate(cacheEntry.loadedTo, 1),
            to: addDaysToIsoDate(cacheEntry.loadedTo, NEXT_RANGE_DAYS),
        };
    }

    async function loadPreviousBalancesRange() {
        if (isLoadingPreviousRangeRef.current) {
            return;
        }

        const previousRange = getPreviousRange();

        if (!previousRange) {
            return;
        }

        const balancesWindow = balancesWindowRef.current;
        const previousScrollHeight = balancesWindow?.scrollHeight ?? 0;

        isLoadingPreviousRangeRef.current = true;
        setIsLoadingPreviousRange(true);

        try {
            await dispatch(
                loadDailyBalancesRange({
                    range: previousRange,
                }),
            );

            window.requestAnimationFrame(() => {
                if (!balancesWindow) {
                    return;
                }

                const newScrollHeight = balancesWindow.scrollHeight;
                balancesWindow.scrollTop +=
                    newScrollHeight - previousScrollHeight;
            });
        } finally {
            isLoadingPreviousRangeRef.current = false;
            setIsLoadingPreviousRange(false);
        }
    }

    async function loadNextBalancesRange() {
        if (isLoadingNextRangeRef.current) {
            return;
        }

        const nextRange = getNextRange();

        if (!nextRange) {
            return;
        }

        isLoadingNextRangeRef.current = true;
        setIsLoadingNextRange(true);

        try {
            await dispatch(
                loadDailyBalancesRange({
                    range: nextRange,
                }),
            );
        } finally {
            isLoadingNextRangeRef.current = false;
            setIsLoadingNextRange(false);
        }
    }

    function handleBalancesWindowScroll(event: UIEvent<HTMLDivElement>) {
        const balancesWindow = event.currentTarget;
        const thresholdPx = Math.max(
            SCROLL_LOAD_THRESHOLD_PX,
            balancesWindow.clientHeight * 1.5,
        );

        const distanceFromBottom =
            balancesWindow.scrollHeight -
            balancesWindow.scrollTop -
            balancesWindow.clientHeight;

        const isNearTop = balancesWindow.scrollTop < thresholdPx;
        const isNearBottom = distanceFromBottom < thresholdPx;

        if (!isNearTop) {
            previousRangeArmedRef.current = true;
        }

        if (!isNearBottom) {
            nextRangeArmedRef.current = true;
        }

        if (isNearTop && previousRangeArmedRef.current) {
            previousRangeArmedRef.current = false;
            void loadPreviousBalancesRange();
        }

        if (isNearBottom && nextRangeArmedRef.current) {
            nextRangeArmedRef.current = false;
            void loadNextBalancesRange();
        }
    }

    return (
        <section className="sl-page sl-balances-page">
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

            <article className="sl-panel">
                <div className="sl-balances-toolbar">
                    <div>
                        <p className="sl-eyebrow">{t("timeline.eyebrow")}</p>
                        <h2>{t("timeline.title")}</h2>
                        <p className="mb-0">
                            {cacheEntry.loadedFrom && cacheEntry.loadedTo
                                ? t("timeline.loadedRange", {
                                      from: formatIsoDateForDisplay(
                                          cacheEntry.loadedFrom,
                                          displayLanguage,
                                      ),
                                      to: formatIsoDateForDisplay(
                                          cacheEntry.loadedTo,
                                          displayLanguage,
                                      ),
                                  })
                                : t("timeline.initialRange", {
                                      from: formatIsoDateForDisplay(
                                          initialRange.from,
                                          displayLanguage,
                                      ),
                                      to: formatIsoDateForDisplay(
                                          initialRange.to,
                                          displayLanguage,
                                      ),
                                  })}
                        </p>
                    </div>

                    <div className="sl-balances-currency-control">
                        <label
                            className="form-label"
                            htmlFor="balancesCurrency">
                            {t("currency.label")}
                        </label>

                        {availableCurrencies.length > 1 ? (
                            <select
                                className="form-select"
                                id="balancesCurrency"
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
                                className="sl-balances-currency-pill"
                                id="balancesCurrency">
                                {selectedCurrency}
                            </div>
                        )}
                    </div>
                </div>

                {cacheEntry.status === "failed" ? (
                    <div className="alert alert-danger mt-3" role="alert">
                        {errorMessage}
                    </div>
                ) : null}

                {isLoading && balances.length === 0 ? (
                    <div className="alert alert-info mt-3" role="status">
                        {t("loading")}
                    </div>
                ) : null}

                {!isLoading && balances.length === 0 ? (
                    <p className="text-muted mt-3 mb-0">{t("empty")}</p>
                ) : null}

                {balances.length > 0 ? (
                    <div
                        aria-label={t("timeline.windowLabel")}
                        className="sl-balances-window mt-3"
                        onScroll={handleBalancesWindowScroll}
                        ref={balancesWindowRef}
                        tabIndex={0}>
                        {isLoadingPreviousRange ? (
                            <div
                                className="sl-balances-edge-loader"
                                role="status">
                                {t("timeline.loadingPrevious")}
                            </div>
                        ) : null}

                        <table className="table align-middle sl-balances-table">
                            <thead>
                                <tr>
                                    <th
                                        className="sl-balances-sticky-date"
                                        scope="col">
                                        {t("table.date")}
                                    </th>
                                    <th
                                        className="sl-balances-amount"
                                        scope="col">
                                        {t("table.serenityline")}
                                    </th>
                                    <th
                                        className="sl-balances-amount"
                                        scope="col">
                                        {t("table.totalBalance")}
                                    </th>
                                    {currencyAccounts.map((account) => (
                                        <th
                                            className="sl-balances-amount"
                                            key={account.accountId}
                                            scope="col">
                                            {account.accountName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {balances.map((balance) => {
                                    const currencyTotals = getCurrencyTotals(
                                        balance,
                                        selectedCurrency,
                                    );
                                    const isTodayTarget =
                                        balance.date === todayTargetDate;

                                    return (
                                        <tr
                                            className={
                                                balance.date === todayIsoDate
                                                    ? "sl-balances-today-row"
                                                    : undefined
                                            }
                                            key={balance.date}
                                            ref={
                                                isTodayTarget
                                                    ? todayBalanceRef
                                                    : undefined
                                            }>
                                            <th
                                                className="sl-balances-sticky-date"
                                                scope="row">
                                                {formatIsoDateForDisplay(
                                                    balance.date,
                                                    displayLanguage,
                                                )}
                                            </th>
                                            <td className="sl-balances-amount">
                                                {formatMoneyOrDash(
                                                    currencyTotals?.endOfDaySerenityline,
                                                    amountFormatter,
                                                )}
                                            </td>
                                            <td className="sl-balances-amount">
                                                {formatMoneyOrDash(
                                                    currencyTotals?.endOfDayAccountsBalance,
                                                    amountFormatter,
                                                )}
                                            </td>
                                            {currencyAccounts.map((account) => (
                                                <td
                                                    className="sl-balances-amount"
                                                    key={account.accountId}>
                                                    {formatMoneyOrDash(
                                                        getAccountEndOfDayBalance(
                                                            balance,
                                                            account.accountId,
                                                            selectedCurrency,
                                                        ),
                                                        amountFormatter,
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {isLoadingNextRange ? (
                            <div
                                className="sl-balances-edge-loader"
                                role="status">
                                {t("timeline.loadingNext")}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </article>
        </section>
    );
}

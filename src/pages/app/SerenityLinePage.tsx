import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, UIEvent } from "react";
import { useTranslation } from "react-i18next";
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceDot,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import type { FinanceCalendarDailyBalanceResponseDto } from "../../features/finance/api/financeApiTypes";
import {
    selectDailyBalancesForScenario,
    selectDailyBalancesScenarioEntry,
} from "../../features/finance/dailyBalances/financeDailyBalancesSelectors";
import { loadDailyBalancesRange } from "../../features/finance/dailyBalances/financeDailyBalancesThunks";
import {
    addMonthsToIsoDate,
    BASE_DAILY_BALANCES_SCENARIO_KEY,
    getDailyBalancesScenarioKey,
    getInitialSerenityLineRange,
    getTodayIsoDate,
} from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    selectAccounts,
    selectBuckets,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectSimulationGroups,
} from "../../features/finance/financeDataSelectors";

type SerenityLineChartPoint = {
    date: string;
    serenityline: number | null;
    serenitylineMaximum: number | null;
    serenitylineMinimum: number | null;
    serenitylineMaximumLabel?: string;
    serenitylineMinimumLabel?: string;
    movingAverage50: number | null;
    totalLinearTrend: number | null;
    pastLinearTrend: number | null;
    futureLinearTrend: number | null;
    [key: string]: string | number | [number, number] | null | undefined;
};

type SerenityLineMaximumMarker = SerenityLineChartPoint & {
    serenitylineMaximum: number;
    serenitylineMaximumLabel: string;
};

type SerenityLineMinimumMarker = SerenityLineChartPoint & {
    serenitylineMinimum: number;
    serenitylineMinimumLabel: string;
};

function isSerenityLineMaximumMarker(
    point: SerenityLineChartPoint,
): point is SerenityLineMaximumMarker {
    return (
        point.serenitylineMaximum != null &&
        typeof point.serenitylineMaximumLabel === "string"
    );
}

function isSerenityLineMinimumMarker(
    point: SerenityLineChartPoint,
): point is SerenityLineMinimumMarker {
    return (
        point.serenitylineMinimum != null &&
        typeof point.serenitylineMinimumLabel === "string"
    );
}

type SerenityLineExtremumType = "maximum" | "minimum";

type SerenityLineExtremumCandidate = {
    index: number;
    type: SerenityLineExtremumType;
    value: number;
    prominence: number;
};

type SerenityLineValueRun = {
    startIndex: number;
    endIndex: number;
    markerIndex: number;
    value: number;
};

type TooltipPayloadItem = {
    color?: string;
    dataKey?: string | number;
    name?: string | number;
    value?: number | [number, number];
    payload?: SerenityLineChartPoint;
};

type SerenityLineAnalyticalIndicatorKey =
    | "movingAverage50"
    | "totalLinearTrend"
    | "pastLinearTrend"
    | "futureLinearTrend";

type SerenityLineAnalyticalIndicatorsState = Record<
    SerenityLineAnalyticalIndicatorKey,
    boolean
>;

type RegressionInputPoint = {
    index: number;
    value: number;
};

const SERENITYLINE_PREVIOUS_RANGE_MONTHS = 6;
const SERENITYLINE_NEXT_RANGE_MONTHS = 6;
const SERENITYLINE_SCROLL_LOAD_THRESHOLD_PX = 900;
const SERENITYLINE_CHART_DAY_WIDTH_PX = 2;
const SERENITYLINE_CHART_MIN_WIDTH_PX = 1200;
const SERENITYLINE_MAX_EXTREMA_MARKERS = 12;
const SERENITYLINE_EXTREMA_MIN_ABSOLUTE_PROMINENCE = 50;
const SERENITYLINE_EXTREMA_RELATIVE_PROMINENCE = 0.01;
const SERENITYLINE_MAX_ACTIVE_SIMULATIONS = 5;
const SERENITYLINE_SIMULATION_COLORS = [
    "#8fb8a8",
    "#c6a6b8",
    "#9eb2d6",
    "#d2b88f",
    "#b8bd8f",
];
const SERENITYLINE_BUCKET_COLORS = [
    "#b9d8c6",
    "#ead4a7",
    "#c9c7e8",
    "#f0c0b5",
    "#bfd8e8",
    "#d7d0ad",
];
const SERENITYLINE_MOVING_AVERAGE_PERIOD = 50;

const SERENITYLINE_ANALYTICS_COLORS = {
    movingAverage50: "#7da892",
    totalLinearTrend: "#a5a0c9",
    pastLinearTrend: "#c5a56f",
    futureLinearTrend: "#8aa9c7",
};

function getSelectedAccountsSerenityLineValue(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
    selectedAccountIds: string[],
) {
    if (selectedAccountIds.length === 0) {
        return null;
    }

    const selectedAccountIdsSet = new Set(selectedAccountIds);

    const selectedAccounts = balance.accounts.filter(
        (account) =>
            account.currency === currency &&
            selectedAccountIdsSet.has(account.accountId),
    );

    if (selectedAccounts.length === 0) {
        return null;
    }

    return selectedAccounts.reduce(
        (total, account) => total + Number(account.endOfDaySerenityline),
        0,
    );
}

function getSerenityLineValueRuns(
    points: SerenityLineChartPoint[],
): SerenityLineValueRun[] {
    const runs: SerenityLineValueRun[] = [];

    points.forEach((point, index) => {
        if (point.serenityline == null) {
            return;
        }

        const lastRun = runs[runs.length - 1];

        if (lastRun && lastRun.value === point.serenityline) {
            lastRun.endIndex = index;
            lastRun.markerIndex = Math.floor(
                (lastRun.startIndex + lastRun.endIndex) / 2,
            );
            return;
        }

        runs.push({
            startIndex: index,
            endIndex: index,
            markerIndex: index,
            value: point.serenityline,
        });
    });

    return runs;
}

function getSerenityLineExtremumCandidates(
    points: SerenityLineChartPoint[],
): SerenityLineExtremumCandidate[] {
    const runs = getSerenityLineValueRuns(points);

    return runs
        .map((run, runIndex): SerenityLineExtremumCandidate | null => {
            const previousRun = runs[runIndex - 1];
            const nextRun = runs[runIndex + 1];

            if (previousRun && nextRun) {
                if (
                    run.value > previousRun.value &&
                    run.value > nextRun.value
                ) {
                    return {
                        index: run.markerIndex,
                        type: "maximum",
                        value: run.value,
                        prominence: Math.min(
                            run.value - previousRun.value,
                            run.value - nextRun.value,
                        ),
                    };
                }

                if (
                    run.value < previousRun.value &&
                    run.value < nextRun.value
                ) {
                    return {
                        index: run.markerIndex,
                        type: "minimum",
                        value: run.value,
                        prominence: Math.min(
                            previousRun.value - run.value,
                            nextRun.value - run.value,
                        ),
                    };
                }

                return null;
            }

            if (!previousRun && nextRun && run.value !== nextRun.value) {
                return {
                    index: run.markerIndex,
                    type: run.value > nextRun.value ? "maximum" : "minimum",
                    value: run.value,
                    prominence: Math.abs(run.value - nextRun.value),
                };
            }

            if (previousRun && !nextRun && run.value !== previousRun.value) {
                return {
                    index: run.markerIndex,
                    type: run.value > previousRun.value ? "maximum" : "minimum",
                    value: run.value,
                    prominence: Math.abs(run.value - previousRun.value),
                };
            }

            return null;
        })
        .filter(
            (candidate): candidate is SerenityLineExtremumCandidate =>
                candidate != null,
        );
}
function addSerenityLineExtremaMarkers(
    points: SerenityLineChartPoint[],
    amountFormatter: Intl.NumberFormat,
): SerenityLineChartPoint[] {
    const numericValues = points
        .map((point) => point.serenityline)
        .filter((value): value is number => value != null);

    if (numericValues.length < 3) {
        return points;
    }

    const minValue = Math.min(...numericValues);
    const maxValue = Math.max(...numericValues);
    const verticalRange = maxValue - minValue;

    const minimumProminence = Math.max(
        SERENITYLINE_EXTREMA_MIN_ABSOLUTE_PROMINENCE,
        verticalRange * SERENITYLINE_EXTREMA_RELATIVE_PROMINENCE,
    );

    const candidates = getSerenityLineExtremumCandidates(points)
        .filter((candidate) => candidate.prominence >= minimumProminence)
        .sort((first, second) => second.prominence - first.prominence)
        .slice(0, SERENITYLINE_MAX_EXTREMA_MARKERS);

    const selectedCandidatesByIndex = new Map(
        candidates.map((candidate) => [candidate.index, candidate]),
    );

    return points.map((point, index) => {
        const candidate = selectedCandidatesByIndex.get(index);

        if (!candidate) {
            return point;
        }

        if (candidate.type === "maximum") {
            return {
                ...point,
                serenitylineMaximum: candidate.value,
                serenitylineMaximumLabel: amountFormatter.format(
                    candidate.value,
                ),
            };
        }

        return {
            ...point,
            serenitylineMinimum: candidate.value,
            serenitylineMinimumLabel: amountFormatter.format(candidate.value),
        };
    });
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

function getFirstAccountOpeningDateForCurrency(
    accounts: { currency: string; openingBalanceDate: string }[],
    currency: string,
) {
    return (
        accounts
            .filter((account) => account.currency === currency)
            .map((account) => account.openingBalanceDate)
            .sort()[0] ?? null
    );
}

function getSimulationLineDataKey(simulationGroupId: string) {
    return `simulation_${simulationGroupId}`;
}

function getSortedDailyBalances(
    balancesByDate:
        | Record<string, FinanceCalendarDailyBalanceResponseDto>
        | undefined,
) {
    return Object.values(balancesByDate ?? {}).sort((first, second) =>
        first.date.localeCompare(second.date),
    );
}

function getSimulationColor(index: number) {
    return SERENITYLINE_SIMULATION_COLORS[
        index % SERENITYLINE_SIMULATION_COLORS.length
    ];
}

function getBucketBandDataKey(bucketId: string) {
    return `bucketBand_${bucketId}`;
}

function getBucketValueDataKey(bucketId: string) {
    return `bucketValue_${bucketId}`;
}

function getBucketColor(index: number) {
    return SERENITYLINE_BUCKET_COLORS[
        index % SERENITYLINE_BUCKET_COLORS.length
    ];
}

function getBucketDisplayName(bucket: { bucketName: string | null }) {
    return bucket.bucketName?.trim() || "Portafoglio";
}

function getSelectedAccountsBucketBalanceValue(
    balance: FinanceCalendarDailyBalanceResponseDto,
    currency: string,
    selectedAccountIds: string[],
    bucketId: string,
) {
    if (selectedAccountIds.length === 0) {
        return 0;
    }

    const selectedAccountIdsSet = new Set(selectedAccountIds);

    return balance.accounts
        .filter(
            (account) =>
                account.currency === currency &&
                selectedAccountIdsSet.has(account.accountId),
        )
        .reduce((total, account) => {
            const bucketBalance =
                account.buckets.find((bucket) => bucket.bucketId === bucketId)
                    ?.endOfDayBucketBalance ?? 0;

            return total + Number(bucketBalance);
        }, 0);
}

function SerenityLineTooltip({
    active,
    label,
    payload,
    amountFormatter,
    dateFormatter,
}: {
    active?: boolean;
    label?: string;
    payload?: readonly TooltipPayloadItem[];
    amountFormatter: Intl.NumberFormat;
    dateFormatter: (date: string) => string;
}) {
    if (!active || !payload || payload.length === 0 || !label) {
        return null;
    }

    const visiblePayload = payload.filter(
        (item) =>
            typeof item.value === "number" &&
            item.dataKey !== "serenitylineMaximum" &&
            item.dataKey !== "serenitylineMinimum",
    );

    if (visiblePayload.length === 0) {
        return null;
    }

    return (
        <div className="sl-serenityline-tooltip">
            <strong>{dateFormatter(label)}</strong>

            {visiblePayload.map((item) => {
                const value = Array.isArray(item.value)
                    ? item.value[1] - item.value[0]
                    : item.value;

                if (typeof value !== "number") {
                    return null;
                }

                return (
                    <span key={String(item.dataKey)}>
                        <i
                            aria-hidden="true"
                            className="sl-serenityline-tooltip-dot"
                            style={{ backgroundColor: item.color }}
                        />
                        {item.name}: {amountFormatter.format(value)}
                    </span>
                );
            })}
        </div>
    );
}

function calculateMovingAverage(
    points: SerenityLineChartPoint[],
    period: number,
) {
    return points.map((point, index) => {
        if (point.serenityline == null) {
            return null;
        }

        const windowPoints = points
            .slice(Math.max(0, index - period + 1), index + 1)
            .map((windowPoint) => windowPoint.serenityline)
            .filter((value): value is number => value != null);

        if (windowPoints.length === 0) {
            return null;
        }

        const total = windowPoints.reduce(
            (sum, currentValue) => sum + currentValue,
            0,
        );

        return total / windowPoints.length;
    });
}

function calculateLinearRegression(points: RegressionInputPoint[]) {
    if (points.length < 2) {
        return null;
    }

    const count = points.length;
    const sumX = points.reduce((total, point) => total + point.index, 0);
    const sumY = points.reduce((total, point) => total + point.value, 0);
    const sumXY = points.reduce(
        (total, point) => total + point.index * point.value,
        0,
    );
    const sumXX = points.reduce(
        (total, point) => total + point.index * point.index,
        0,
    );

    const denominator = count * sumXX - sumX * sumX;

    if (denominator === 0) {
        return null;
    }

    const slope = (count * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / count;

    return {
        intercept,
        slope,
    };
}

function getRegressionValue(
    regression: { intercept: number; slope: number } | null,
    index: number,
) {
    if (!regression) {
        return null;
    }

    return regression.intercept + regression.slope * index;
}

function addSerenityLineAnalyticalIndicators(
    points: SerenityLineChartPoint[],
    todayIsoDate: string,
): SerenityLineChartPoint[] {
    const movingAverageValues = calculateMovingAverage(
        points,
        SERENITYLINE_MOVING_AVERAGE_PERIOD,
    );

    const regressionInput = points
        .map((point, index) =>
            point.serenityline == null
                ? null
                : {
                      index,
                      value: point.serenityline,
                  },
        )
        .filter((point): point is RegressionInputPoint => point != null);

    const pastRegressionInput = regressionInput.filter(
        (point) => points[point.index]?.date <= todayIsoDate,
    );

    const futureRegressionInput = regressionInput.filter(
        (point) => points[point.index]?.date >= todayIsoDate,
    );

    const totalRegression = calculateLinearRegression(regressionInput);
    const pastRegression = calculateLinearRegression(pastRegressionInput);
    const futureRegression = calculateLinearRegression(futureRegressionInput);

    return points.map((point, index) => ({
        ...point,
        movingAverage50: movingAverageValues[index],
        totalLinearTrend: getRegressionValue(totalRegression, index),
        pastLinearTrend:
            point.date <= todayIsoDate
                ? getRegressionValue(pastRegression, index)
                : null,
        futureLinearTrend:
            point.date >= todayIsoDate
                ? getRegressionValue(futureRegression, index)
                : null,
    }));
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

    const simulationGroups = useAppSelector(selectSimulationGroups);
    const buckets = useAppSelector(selectBuckets);
    const dailyBalanceScenarios = useAppSelector(
        (state) => state.financeDailyBalances.scenarios,
    );

    const [preferredCurrency, setPreferredCurrency] = useState<string | null>(
        null,
    );

    const [selectedAccountIdsByCurrency, setSelectedAccountIdsByCurrency] =
        useState<Record<string, string[]>>({});

    const hasRequestedInitialRangeRef = useRef(false);

    const chartWindowRef = useRef<HTMLDivElement | null>(null);
    const hasScrolledToTodayRef = useRef(false);
    const isLoadingPreviousRangeRef = useRef(false);
    const isLoadingNextRangeRef = useRef(false);
    const previousRangeArmedRef = useRef(true);
    const nextRangeArmedRef = useRef(true);

    const [isLoadingPreviousRange, setIsLoadingPreviousRange] = useState(false);
    const [isLoadingNextRange, setIsLoadingNextRange] = useState(false);
    const [selectedSimulationGroupIds, setSelectedSimulationGroupIds] =
        useState<string[]>([]);
    const [simulationSelectionError, setSimulationSelectionError] = useState<
        string | null
    >(null);
    const [selectedBucketIdsByCurrency, setSelectedBucketIdsByCurrency] =
        useState<Record<string, string[]>>({});
    const [analyticalIndicators, setAnalyticalIndicators] =
        useState<SerenityLineAnalyticalIndicatorsState>({
            movingAverage50: false,
            totalLinearTrend: false,
            pastLinearTrend: false,
            futureLinearTrend: false,
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

    const currencyAccounts = useMemo(
        () =>
            accounts.filter((account) => account.currency === selectedCurrency),
        [accounts, selectedCurrency],
    );

    const activeSimulationGroups = useMemo(
        () =>
            simulationGroups.filter(
                (simulationGroup) =>
                    simulationGroup.simulationGroupArchivedAt == null,
            ),
        [simulationGroups],
    );

    const selectedSimulationGroups = useMemo(
        () =>
            selectedSimulationGroupIds
                .map((simulationGroupId) =>
                    activeSimulationGroups.find(
                        (simulationGroup) =>
                            simulationGroup.simulationGroupId ===
                            simulationGroupId,
                    ),
                )
                .filter(
                    (
                        simulationGroup,
                    ): simulationGroup is (typeof activeSimulationGroups)[number] =>
                        simulationGroup != null,
                ),
        [activeSimulationGroups, selectedSimulationGroupIds],
    );

    const currencyAccountIds = useMemo(
        () => currencyAccounts.map((account) => account.accountId),
        [currencyAccounts],
    );

    const currencyBuckets = useMemo(
        () =>
            buckets.filter(
                (bucket) =>
                    bucket.bucketClosedAt == null &&
                    bucket.accountIds.some((accountId) =>
                        currencyAccountIds.includes(accountId),
                    ),
            ),
        [buckets, currencyAccountIds],
    );

    const currencyBucketIds = useMemo(
        () => currencyBuckets.map((bucket) => bucket.bucketId),
        [currencyBuckets],
    );

    const selectedBucketIds = useMemo(() => {
        const selectedIds = selectedBucketIdsByCurrency[selectedCurrency] ?? [];
        const validBucketIds = new Set(currencyBucketIds);

        return selectedIds.filter((bucketId) => validBucketIds.has(bucketId));
    }, [currencyBucketIds, selectedBucketIdsByCurrency, selectedCurrency]);

    const selectedBuckets = useMemo(
        () =>
            selectedBucketIds
                .map((bucketId) =>
                    currencyBuckets.find(
                        (bucket) => bucket.bucketId === bucketId,
                    ),
                )
                .filter(
                    (bucket): bucket is (typeof currencyBuckets)[number] =>
                        bucket != null,
                ),
        [currencyBuckets, selectedBucketIds],
    );

    const selectedAccountIds = useMemo(() => {
        const selectedIds =
            selectedAccountIdsByCurrency[selectedCurrency] ??
            currencyAccountIds;
        const validAccountIds = new Set(currencyAccountIds);

        return selectedIds.filter((accountId) =>
            validAccountIds.has(accountId),
        );
    }, [currencyAccountIds, selectedAccountIdsByCurrency, selectedCurrency]);

    const amountFormatter = useMemo(
        () =>
            new Intl.NumberFormat(displayLanguage, {
                currency: selectedCurrency,
                maximumFractionDigits: 0,
                style: "currency",
            }),
        [displayLanguage, selectedCurrency],
    );

    const baseChartData = useMemo<SerenityLineChartPoint[]>(
        () =>
            balances
                .map((balance) => ({
                    date: balance.date,
                    serenityline: getSelectedAccountsSerenityLineValue(
                        balance,
                        selectedCurrency,
                        selectedAccountIds,
                    ),
                    serenitylineMaximum: null,
                    serenitylineMinimum: null,
                    movingAverage50: null,
                    totalLinearTrend: null,
                    pastLinearTrend: null,
                    futureLinearTrend: null,
                }))
                .filter((point) => point.serenityline !== null),
        [balances, selectedAccountIds, selectedCurrency],
    );

    const chartData = useMemo(
        () => addSerenityLineExtremaMarkers(baseChartData, amountFormatter),
        [amountFormatter, baseChartData],
    );

    const chartDataWithAnalytics = useMemo(
        () => addSerenityLineAnalyticalIndicators(chartData, todayIsoDate),
        [chartData, todayIsoDate],
    );

    const simulationLines = useMemo(
        () =>
            selectedSimulationGroups.map((simulationGroup, index) => {
                const scenarioKey = getDailyBalancesScenarioKey([
                    simulationGroup.simulationGroupId,
                ]);
                const scenarioEntry = dailyBalanceScenarios[scenarioKey];
                const simulationBalances = getSortedDailyBalances(
                    scenarioEntry?.balancesByDate,
                );

                const valuesByDate = new Map(
                    simulationBalances.map((balance) => [
                        balance.date,
                        getSelectedAccountsSerenityLineValue(
                            balance,
                            selectedCurrency,
                            selectedAccountIds,
                        ),
                    ]),
                );

                return {
                    color: getSimulationColor(index),
                    dataKey: getSimulationLineDataKey(
                        simulationGroup.simulationGroupId,
                    ),
                    name: simulationGroup.simulationGroupName,
                    simulationGroup,
                    valuesByDate,
                };
            }),
        [
            dailyBalanceScenarios,
            selectedAccountIds,
            selectedCurrency,
            selectedSimulationGroups,
        ],
    );

    const chartDataWithSimulations = useMemo(
        () =>
            chartDataWithAnalytics.map((point) => {
                const pointWithSimulations: SerenityLineChartPoint = {
                    ...point,
                };

                simulationLines.forEach((simulationLine) => {
                    pointWithSimulations[simulationLine.dataKey] =
                        simulationLine.valuesByDate.get(point.date) ?? null;
                });

                return pointWithSimulations;
            }),
        [chartDataWithAnalytics, simulationLines],
    );

    const balancesByDate = useMemo(
        () => new Map(balances.map((balance) => [balance.date, balance])),
        [balances],
    );

    const bucketBands = useMemo(
        () =>
            selectedBuckets.map((bucket, index) => ({
                bucket,
                color: getBucketColor(index),
                dataKey: getBucketBandDataKey(bucket.bucketId),
                name: getBucketDisplayName(bucket),
                valueDataKey: getBucketValueDataKey(bucket.bucketId),
            })),
        [selectedBuckets],
    );

    const chartDataWithLayers = useMemo(
        () =>
            chartDataWithSimulations.map((point) => {
                const layeredPoint: SerenityLineChartPoint = {
                    ...point,
                };

                const dailyBalance = balancesByDate.get(point.date);

                if (!dailyBalance || typeof point.serenityline !== "number") {
                    bucketBands.forEach((bucketBand) => {
                        layeredPoint[bucketBand.dataKey] = null;
                        layeredPoint[bucketBand.valueDataKey] = null;
                    });

                    return layeredPoint;
                }

                let cumulativeTop = point.serenityline;

                bucketBands.forEach((bucketBand) => {
                    const bucketBalance = Math.max(
                        0,
                        getSelectedAccountsBucketBalanceValue(
                            dailyBalance,
                            selectedCurrency,
                            selectedAccountIds,
                            bucketBand.bucket.bucketId,
                        ),
                    );

                    if (bucketBalance <= 0) {
                        layeredPoint[bucketBand.dataKey] = null;
                        layeredPoint[bucketBand.valueDataKey] = 0;
                        return;
                    }

                    const lowerBound = cumulativeTop;
                    const upperBound = cumulativeTop + bucketBalance;

                    layeredPoint[bucketBand.dataKey] = [lowerBound, upperBound];
                    layeredPoint[bucketBand.valueDataKey] = bucketBalance;

                    cumulativeTop = upperBound;
                });

                return layeredPoint;
            }),
        [
            balancesByDate,
            bucketBands,
            chartDataWithSimulations,
            selectedAccountIds,
            selectedCurrency,
        ],
    );

    const maximumMarkers = useMemo(
        () => chartData.filter(isSerenityLineMaximumMarker),
        [chartData],
    );

    const minimumMarkers = useMemo(
        () => chartData.filter(isSerenityLineMinimumMarker),
        [chartData],
    );

    const chartWidth = Math.max(
        SERENITYLINE_CHART_MIN_WIDTH_PX,
        chartDataWithLayers.length * SERENITYLINE_CHART_DAY_WIDTH_PX,
    );
    const firstAccountOpeningDate = useMemo(
        () => getFirstAccountOpeningDateForCurrency(accounts, selectedCurrency),
        [accounts, selectedCurrency],
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

    function getPreviousDailyBalancesRange() {
        if (!cacheEntry.loadedFrom) {
            return null;
        }

        if (
            firstAccountOpeningDate &&
            cacheEntry.loadedFrom <= firstAccountOpeningDate
        ) {
            return null;
        }

        const candidateFrom = addMonthsToIsoDate(
            cacheEntry.loadedFrom,
            -SERENITYLINE_PREVIOUS_RANGE_MONTHS,
        );

        const from =
            firstAccountOpeningDate && candidateFrom < firstAccountOpeningDate
                ? firstAccountOpeningDate
                : candidateFrom;

        if (from >= cacheEntry.loadedFrom) {
            return null;
        }

        return {
            from,
            to: cacheEntry.loadedFrom,
        };
    }

    function getNextDailyBalancesRange() {
        if (!cacheEntry.loadedTo) {
            return null;
        }

        return {
            from: cacheEntry.loadedTo,
            to: addMonthsToIsoDate(
                cacheEntry.loadedTo,
                SERENITYLINE_NEXT_RANGE_MONTHS,
            ),
        };
    }

    async function loadPreviousDailyBalancesRange() {
        if (isLoadingPreviousRangeRef.current) {
            return;
        }

        const previousRange = getPreviousDailyBalancesRange();

        if (!previousRange) {
            return;
        }

        const chartWindow = chartWindowRef.current;
        const previousScrollWidth = chartWindow?.scrollWidth ?? 0;
        const previousScrollLeft = chartWindow?.scrollLeft ?? 0;

        isLoadingPreviousRangeRef.current = true;
        setIsLoadingPreviousRange(true);

        try {
            await Promise.all([
                dispatch(
                    loadDailyBalancesRange({
                        range: previousRange,
                    }),
                ),
                ...selectedSimulationGroupIds.map((simulationGroupId) =>
                    dispatch(
                        loadDailyBalancesRange({
                            range: previousRange,
                            simulationGroupIds: [simulationGroupId],
                        }),
                    ),
                ),
            ]);

            window.requestAnimationFrame(() => {
                if (!chartWindow) {
                    return;
                }

                const newScrollWidth = chartWindow.scrollWidth;
                chartWindow.scrollLeft =
                    previousScrollLeft + newScrollWidth - previousScrollWidth;
            });
        } finally {
            isLoadingPreviousRangeRef.current = false;
            setIsLoadingPreviousRange(false);
        }
    }

    async function loadNextDailyBalancesRange() {
        if (isLoadingNextRangeRef.current) {
            return;
        }

        const nextRange = getNextDailyBalancesRange();

        if (!nextRange) {
            return;
        }

        isLoadingNextRangeRef.current = true;
        setIsLoadingNextRange(true);

        try {
            await Promise.all([
                dispatch(
                    loadDailyBalancesRange({
                        range: nextRange,
                    }),
                ),
                ...selectedSimulationGroupIds.map((simulationGroupId) =>
                    dispatch(
                        loadDailyBalancesRange({
                            range: nextRange,
                            simulationGroupIds: [simulationGroupId],
                        }),
                    ),
                ),
            ]);
        } finally {
            isLoadingNextRangeRef.current = false;
            setIsLoadingNextRange(false);
        }
    }

    function handleChartWindowScroll(event: UIEvent<HTMLDivElement>) {
        const chartWindow = event.currentTarget;
        const thresholdPx = Math.max(
            SERENITYLINE_SCROLL_LOAD_THRESHOLD_PX,
            chartWindow.clientWidth * 1.25,
        );

        const distanceFromRight =
            chartWindow.scrollWidth -
            chartWindow.scrollLeft -
            chartWindow.clientWidth;

        const isNearLeft = chartWindow.scrollLeft < thresholdPx;
        const isNearRight = distanceFromRight < thresholdPx;

        if (!isNearLeft) {
            previousRangeArmedRef.current = true;
        }

        if (!isNearRight) {
            nextRangeArmedRef.current = true;
        }

        if (isNearLeft && previousRangeArmedRef.current) {
            previousRangeArmedRef.current = false;
            void loadPreviousDailyBalancesRange();
        }

        if (isNearRight && nextRangeArmedRef.current) {
            nextRangeArmedRef.current = false;
            void loadNextDailyBalancesRange();
        }
    }

    useEffect(() => {
        if (
            hasScrolledToTodayRef.current ||
            chartData.length === 0 ||
            cacheEntry.loadedFrom == null ||
            cacheEntry.loadedTo == null
        ) {
            return;
        }

        const todayIndex = chartData.findIndex(
            (point) => point.date >= todayIsoDate,
        );

        if (todayIndex < 0) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            const chartWindow = chartWindowRef.current;

            if (!chartWindow) {
                return;
            }

            const maxScrollLeft = Math.max(
                0,
                chartWindow.scrollWidth - chartWindow.clientWidth,
            );

            const targetLeft =
                todayIndex * SERENITYLINE_CHART_DAY_WIDTH_PX -
                chartWindow.clientWidth / 4;

            chartWindow.scrollLeft = Math.min(
                Math.max(0, targetLeft),
                maxScrollLeft,
            );

            hasScrolledToTodayRef.current = true;
        });

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [
        cacheEntry.loadedFrom,
        cacheEntry.loadedTo,
        chartData,
        chartWidth,
        todayIsoDate,
    ]);

    useEffect(() => {
        hasScrolledToTodayRef.current = false;
        previousRangeArmedRef.current = true;
        nextRangeArmedRef.current = true;
    }, [selectedCurrency]);

    useEffect(() => {
        if (selectedSimulationGroupIds.length === 0) {
            return;
        }

        const range = {
            from: cacheEntry.loadedFrom ?? initialRange.from,
            to: cacheEntry.loadedTo ?? initialRange.to,
        };

        selectedSimulationGroupIds.forEach((simulationGroupId) => {
            void dispatch(
                loadDailyBalancesRange({
                    range,
                    simulationGroupIds: [simulationGroupId],
                }),
            );
        });
    }, [
        cacheEntry.loadedFrom,
        cacheEntry.loadedTo,
        dispatch,
        initialRange,
        selectedSimulationGroupIds,
    ]);

    function handleToggleAccount(accountId: string) {
        setSelectedAccountIdsByCurrency(
            (currentSelectedAccountIdsByCurrency) => {
                const currentSelectedAccountIds =
                    currentSelectedAccountIdsByCurrency[selectedCurrency] ??
                    currencyAccountIds;

                const nextSelectedAccountIds =
                    currentSelectedAccountIds.includes(accountId)
                        ? currentSelectedAccountIds.filter(
                              (currentAccountId) =>
                                  currentAccountId !== accountId,
                          )
                        : [...currentSelectedAccountIds, accountId];

                return {
                    ...currentSelectedAccountIdsByCurrency,
                    [selectedCurrency]: nextSelectedAccountIds,
                };
            },
        );
    }

    function handleSelectAllAccounts() {
        setSelectedAccountIdsByCurrency(
            (currentSelectedAccountIdsByCurrency) => ({
                ...currentSelectedAccountIdsByCurrency,
                [selectedCurrency]: currencyAccountIds,
            }),
        );
    }

    function handleClearAccounts() {
        setSelectedAccountIdsByCurrency(
            (currentSelectedAccountIdsByCurrency) => ({
                ...currentSelectedAccountIdsByCurrency,
                [selectedCurrency]: [],
            }),
        );
    }

    function isAccountSelected(accountId: string) {
        return selectedAccountIds.includes(accountId);
    }

    function handleToggleSimulationGroup(simulationGroupId: string) {
        setSimulationSelectionError(null);

        setSelectedSimulationGroupIds((currentSimulationGroupIds) => {
            if (currentSimulationGroupIds.includes(simulationGroupId)) {
                return currentSimulationGroupIds.filter(
                    (currentSimulationGroupId) =>
                        currentSimulationGroupId !== simulationGroupId,
                );
            }

            if (
                currentSimulationGroupIds.length >=
                SERENITYLINE_MAX_ACTIVE_SIMULATIONS
            ) {
                setSimulationSelectionError(t("simulations.limitReached"));
                return currentSimulationGroupIds;
            }

            return [...currentSimulationGroupIds, simulationGroupId];
        });
    }

    function isSimulationGroupSelected(simulationGroupId: string) {
        return selectedSimulationGroupIds.includes(simulationGroupId);
    }

    function handleToggleBucket(bucketId: string) {
        setSelectedBucketIdsByCurrency((currentSelectedBucketIdsByCurrency) => {
            const currentSelectedBucketIds =
                currentSelectedBucketIdsByCurrency[selectedCurrency] ?? [];

            const nextSelectedBucketIds = currentSelectedBucketIds.includes(
                bucketId,
            )
                ? currentSelectedBucketIds.filter(
                      (currentBucketId) => currentBucketId !== bucketId,
                  )
                : [...currentSelectedBucketIds, bucketId];

            return {
                ...currentSelectedBucketIdsByCurrency,
                [selectedCurrency]: nextSelectedBucketIds,
            };
        });
    }

    function handleClearBuckets() {
        setSelectedBucketIdsByCurrency(
            (currentSelectedBucketIdsByCurrency) => ({
                ...currentSelectedBucketIdsByCurrency,
                [selectedCurrency]: [],
            }),
        );
    }

    function isBucketSelected(bucketId: string) {
        return selectedBucketIds.includes(bucketId);
    }

    function handleToggleAnalyticalIndicator(
        indicatorKey: SerenityLineAnalyticalIndicatorKey,
    ) {
        setAnalyticalIndicators((currentIndicators) => ({
            ...currentIndicators,
            [indicatorKey]: !currentIndicators[indicatorKey],
        }));
    }

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
                            className="sl-serenityline-chart-window"
                            onScroll={handleChartWindowScroll}
                            ref={chartWindowRef}>
                            {isLoadingPreviousRange ? (
                                <div className="sl-serenityline-edge-loader sl-serenityline-edge-loader-left">
                                    {t("chart.loadingPrevious")}
                                </div>
                            ) : null}

                            {isLoadingNextRange ? (
                                <div className="sl-serenityline-edge-loader sl-serenityline-edge-loader-right">
                                    {t("chart.loadingNext")}
                                </div>
                            ) : null}
                            <div
                                className="sl-serenityline-chart-canvas"
                                style={{ width: `${chartWidth}px` }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={chartDataWithLayers}
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
                                                    payload={
                                                        payload as unknown as readonly TooltipPayloadItem[]
                                                    }
                                                />
                                            )}
                                        />
                                        <ReferenceLine
                                            ifOverflow="extendDomain"
                                            label="0 €"
                                            stroke="var(--sl-chart-zero)"
                                            strokeDasharray="6 6"
                                            y={0}
                                        />
                                        <ReferenceLine
                                            ifOverflow="extendDomain"
                                            label={t("chart.today")}
                                            stroke="var(--sl-chart-today)"
                                            strokeDasharray="4 4"
                                            x={todayIsoDate}
                                        />
                                        {bucketBands.map((bucketBand) => (
                                            <Area
                                                connectNulls={false}
                                                dataKey={bucketBand.dataKey}
                                                fill={bucketBand.color}
                                                fillOpacity={0.28}
                                                isAnimationActive={false}
                                                key={bucketBand.dataKey}
                                                name={bucketBand.name}
                                                stroke={bucketBand.color}
                                                strokeOpacity={0.85}
                                                strokeWidth={1.2}
                                                type="natural"
                                            />
                                        ))}

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

                                        {analyticalIndicators.movingAverage50 ? (
                                            <Line
                                                activeDot={false}
                                                dataKey="movingAverage50"
                                                dot={false}
                                                isAnimationActive={false}
                                                name={t(
                                                    "analytics.movingAverage50",
                                                )}
                                                stroke={
                                                    SERENITYLINE_ANALYTICS_COLORS.movingAverage50
                                                }
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                type="monotone"
                                            />
                                        ) : null}

                                        {analyticalIndicators.totalLinearTrend ? (
                                            <Line
                                                activeDot={false}
                                                dataKey="totalLinearTrend"
                                                dot={false}
                                                isAnimationActive={false}
                                                name={t(
                                                    "analytics.totalLinearTrend",
                                                )}
                                                stroke={
                                                    SERENITYLINE_ANALYTICS_COLORS.totalLinearTrend
                                                }
                                                strokeDasharray="10 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                type="linear"
                                            />
                                        ) : null}

                                        {analyticalIndicators.pastLinearTrend ? (
                                            <Line
                                                activeDot={false}
                                                dataKey="pastLinearTrend"
                                                dot={false}
                                                isAnimationActive={false}
                                                name={t(
                                                    "analytics.pastLinearTrend",
                                                )}
                                                stroke={
                                                    SERENITYLINE_ANALYTICS_COLORS.pastLinearTrend
                                                }
                                                strokeDasharray="7 6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                type="linear"
                                            />
                                        ) : null}

                                        {analyticalIndicators.futureLinearTrend ? (
                                            <Line
                                                activeDot={false}
                                                dataKey="futureLinearTrend"
                                                dot={false}
                                                isAnimationActive={false}
                                                name={t(
                                                    "analytics.futureLinearTrend",
                                                )}
                                                stroke={
                                                    SERENITYLINE_ANALYTICS_COLORS.futureLinearTrend
                                                }
                                                strokeDasharray="4 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                type="linear"
                                            />
                                        ) : null}

                                        {simulationLines.map(
                                            (simulationLine) => (
                                                <Line
                                                    activeDot={{ r: 4 }}
                                                    dataKey={
                                                        simulationLine.dataKey
                                                    }
                                                    dot={false}
                                                    isAnimationActive={false}
                                                    key={simulationLine.dataKey}
                                                    name={simulationLine.name}
                                                    stroke={
                                                        simulationLine.color
                                                    }
                                                    strokeDasharray="8 7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.2}
                                                    type="natural"
                                                />
                                            ),
                                        )}
                                        {simulationLines.map(
                                            (simulationLine) => {
                                                const lastPoint = [
                                                    ...chartDataWithSimulations,
                                                ]
                                                    .reverse()
                                                    .find(
                                                        (point) =>
                                                            typeof point[
                                                                simulationLine
                                                                    .dataKey
                                                            ] === "number",
                                                    );

                                                if (!lastPoint) {
                                                    return null;
                                                }

                                                return (
                                                    <ReferenceDot
                                                        fill="transparent"
                                                        ifOverflow="extendDomain"
                                                        key={`simulation-label-${simulationLine.dataKey}`}
                                                        r={0}
                                                        stroke="transparent"
                                                        x={lastPoint.date}
                                                        y={
                                                            lastPoint[
                                                                simulationLine
                                                                    .dataKey
                                                            ] as number
                                                        }
                                                        label={{
                                                            value: simulationLine.name,
                                                            position: "right",
                                                            className:
                                                                "sl-serenityline-simulation-line-label",
                                                        }}
                                                    />
                                                );
                                            },
                                        )}
                                        {maximumMarkers.map((marker) => (
                                            <ReferenceDot
                                                fill="var(--sl-color-card)"
                                                ifOverflow="extendDomain"
                                                key={`maximum-${marker.date}`}
                                                r={6}
                                                stroke="var(--sl-chart-maximum)"
                                                strokeWidth={2}
                                                x={marker.date}
                                                y={marker.serenitylineMaximum}
                                                label={{
                                                    value: marker.serenitylineMaximumLabel,
                                                    position: "top",
                                                    className:
                                                        "sl-serenityline-extremum-label sl-serenityline-extremum-label-maximum",
                                                }}
                                            />
                                        ))}

                                        {minimumMarkers.map((marker) => (
                                            <ReferenceDot
                                                fill="var(--sl-color-card)"
                                                ifOverflow="extendDomain"
                                                key={`minimum-${marker.date}`}
                                                r={6}
                                                stroke="var(--sl-chart-minimum)"
                                                strokeWidth={2}
                                                x={marker.date}
                                                y={marker.serenitylineMinimum}
                                                label={{
                                                    value: marker.serenitylineMinimumLabel,
                                                    position: "bottom",
                                                    className:
                                                        "sl-serenityline-extremum-label sl-serenityline-extremum-label-minimum",
                                                }}
                                            />
                                        ))}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
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

                    <div className="sl-serenityline-control-section">
                        <div className="sl-serenityline-control-section-heading">
                            <div>
                                <h3 className="h6">{t("accounts.title")}</h3>
                                <p>{t("accounts.description")}</p>
                            </div>

                            <div className="sl-serenityline-control-actions">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={handleSelectAllAccounts}
                                    type="button">
                                    {t("accounts.selectAll")}
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleClearAccounts}
                                    type="button">
                                    {t("accounts.clear")}
                                </button>
                            </div>
                        </div>

                        {currencyAccounts.length === 0 ? (
                            <p className="text-muted mb-0">
                                {t("accounts.empty")}
                            </p>
                        ) : (
                            <div className="sl-serenityline-account-toggles">
                                {currencyAccounts.map((account) => {
                                    const isSelected = isAccountSelected(
                                        account.accountId,
                                    );

                                    return (
                                        <button
                                            aria-pressed={isSelected}
                                            className={
                                                isSelected
                                                    ? "sl-serenityline-toggle-chip is-selected"
                                                    : "sl-serenityline-toggle-chip"
                                            }
                                            key={account.accountId}
                                            onClick={() =>
                                                handleToggleAccount(
                                                    account.accountId,
                                                )
                                            }
                                            type="button">
                                            <span>{account.accountName}</span>
                                            <small>{account.currency}</small>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="sl-serenityline-control-section">
                        <div className="sl-serenityline-control-section-heading">
                            <div>
                                <h3 className="h6">{t("buckets.title")}</h3>
                                <p>{t("buckets.description")}</p>
                            </div>

                            <div className="sl-serenityline-control-actions">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleClearBuckets}
                                    type="button">
                                    {t("buckets.clear")}
                                </button>
                            </div>
                        </div>

                        {currencyBuckets.length === 0 ? (
                            <p className="text-muted mb-0">
                                {t("buckets.empty")}
                            </p>
                        ) : (
                            <div className="sl-serenityline-account-toggles">
                                {currencyBuckets.map((bucket, index) => {
                                    const isSelected = isBucketSelected(
                                        bucket.bucketId,
                                    );
                                    const bucketColor = getBucketColor(index);

                                    return (
                                        <button
                                            aria-pressed={isSelected}
                                            className={
                                                isSelected
                                                    ? "sl-serenityline-toggle-chip sl-serenityline-bucket-chip is-selected"
                                                    : "sl-serenityline-toggle-chip sl-serenityline-bucket-chip"
                                            }
                                            key={bucket.bucketId}
                                            onClick={() =>
                                                handleToggleBucket(
                                                    bucket.bucketId,
                                                )
                                            }
                                            style={
                                                {
                                                    "--sl-bucket-color":
                                                        bucketColor,
                                                } as CSSProperties
                                            }
                                            type="button">
                                            <span>
                                                {getBucketDisplayName(bucket)}
                                            </span>
                                            <small>{t("buckets.band")}</small>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="sl-serenityline-control-section">
                        <div className="sl-serenityline-control-section-heading">
                            <div>
                                <h3 className="h6">{t("simulations.title")}</h3>
                                <p>
                                    {t("simulations.description", {
                                        count: SERENITYLINE_MAX_ACTIVE_SIMULATIONS,
                                    })}
                                </p>
                            </div>
                        </div>

                        {simulationSelectionError ? (
                            <div
                                className="alert alert-warning mb-0"
                                role="alert">
                                {simulationSelectionError}
                            </div>
                        ) : null}

                        {activeSimulationGroups.length === 0 ? (
                            <p className="text-muted mb-0">
                                {t("simulations.empty")}
                            </p>
                        ) : (
                            <div className="sl-serenityline-account-toggles">
                                {activeSimulationGroups.map(
                                    (simulationGroup, index) => {
                                        const isSelected =
                                            isSimulationGroupSelected(
                                                simulationGroup.simulationGroupId,
                                            );
                                        const simulationColor =
                                            getSimulationColor(index);

                                        return (
                                            <button
                                                aria-pressed={isSelected}
                                                className={
                                                    isSelected
                                                        ? "sl-serenityline-toggle-chip sl-serenityline-simulation-chip is-selected"
                                                        : "sl-serenityline-toggle-chip sl-serenityline-simulation-chip"
                                                }
                                                key={
                                                    simulationGroup.simulationGroupId
                                                }
                                                onClick={() =>
                                                    handleToggleSimulationGroup(
                                                        simulationGroup.simulationGroupId,
                                                    )
                                                }
                                                style={
                                                    {
                                                        "--sl-simulation-color":
                                                            simulationColor,
                                                    } as CSSProperties
                                                }
                                                type="button">
                                                <span>
                                                    {
                                                        simulationGroup.simulationGroupName
                                                    }
                                                </span>
                                                <small>
                                                    {t(
                                                        "simulations.dashedLine",
                                                    )}
                                                </small>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </div>

                    <div className="sl-serenityline-control-section">
                        <div className="sl-serenityline-control-section-heading">
                            <div>
                                <h3 className="h6">{t("analytics.title")}</h3>
                                <p>{t("analytics.description")}</p>
                            </div>
                        </div>

                        <div className="sl-serenityline-account-toggles">
                            <button
                                aria-pressed={
                                    analyticalIndicators.movingAverage50
                                }
                                className={
                                    analyticalIndicators.movingAverage50
                                        ? "sl-serenityline-toggle-chip sl-serenityline-analytics-chip is-selected"
                                        : "sl-serenityline-toggle-chip sl-serenityline-analytics-chip"
                                }
                                onClick={() =>
                                    handleToggleAnalyticalIndicator(
                                        "movingAverage50",
                                    )
                                }
                                style={
                                    {
                                        "--sl-analytics-color":
                                            SERENITYLINE_ANALYTICS_COLORS.movingAverage50,
                                    } as CSSProperties
                                }
                                type="button">
                                <span>{t("analytics.movingAverage50")}</span>
                                <small>
                                    {t("analytics.movingAverage50Description")}
                                </small>
                            </button>

                            <button
                                aria-pressed={
                                    analyticalIndicators.pastLinearTrend
                                }
                                className={
                                    analyticalIndicators.pastLinearTrend
                                        ? "sl-serenityline-toggle-chip sl-serenityline-analytics-chip is-selected"
                                        : "sl-serenityline-toggle-chip sl-serenityline-analytics-chip"
                                }
                                onClick={() =>
                                    handleToggleAnalyticalIndicator(
                                        "pastLinearTrend",
                                    )
                                }
                                style={
                                    {
                                        "--sl-analytics-color":
                                            SERENITYLINE_ANALYTICS_COLORS.pastLinearTrend,
                                    } as CSSProperties
                                }
                                type="button">
                                <span>{t("analytics.pastLinearTrend")}</span>
                                <small>
                                    {t("analytics.pastLinearTrendDescription")}
                                </small>
                            </button>

                            <button
                                aria-pressed={
                                    analyticalIndicators.totalLinearTrend
                                }
                                className={
                                    analyticalIndicators.totalLinearTrend
                                        ? "sl-serenityline-toggle-chip sl-serenityline-analytics-chip is-selected"
                                        : "sl-serenityline-toggle-chip sl-serenityline-analytics-chip"
                                }
                                onClick={() =>
                                    handleToggleAnalyticalIndicator(
                                        "totalLinearTrend",
                                    )
                                }
                                style={
                                    {
                                        "--sl-analytics-color":
                                            SERENITYLINE_ANALYTICS_COLORS.totalLinearTrend,
                                    } as CSSProperties
                                }
                                type="button">
                                <span>{t("analytics.totalLinearTrend")}</span>
                                <small>
                                    {t("analytics.totalLinearTrendDescription")}
                                </small>
                            </button>

                            <button
                                aria-pressed={
                                    analyticalIndicators.futureLinearTrend
                                }
                                className={
                                    analyticalIndicators.futureLinearTrend
                                        ? "sl-serenityline-toggle-chip sl-serenityline-analytics-chip is-selected"
                                        : "sl-serenityline-toggle-chip sl-serenityline-analytics-chip"
                                }
                                onClick={() =>
                                    handleToggleAnalyticalIndicator(
                                        "futureLinearTrend",
                                    )
                                }
                                style={
                                    {
                                        "--sl-analytics-color":
                                            SERENITYLINE_ANALYTICS_COLORS.futureLinearTrend,
                                    } as CSSProperties
                                }
                                type="button">
                                <span>{t("analytics.futureLinearTrend")}</span>
                                <small>
                                    {t(
                                        "analytics.futureLinearTrendDescription",
                                    )}
                                </small>
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}

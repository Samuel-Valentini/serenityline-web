import type {
    FinanceCalendarDailyBalanceResponseDto,
    IsoDate,
    Uuid,
} from "../api/financeApiTypes";

export const BASE_DAILY_BALANCES_SCENARIO_KEY = "base";

export type DailyBalancesRange = {
    from: IsoDate;
    to: IsoDate;
};

export type FinanceDailyBalancesError = {
    code: string;
    message?: string;
};

export type FinanceDailyBalancesCacheEntry = {
    balancesByDate: Record<IsoDate, FinanceCalendarDailyBalanceResponseDto>;
    loadedFrom: IsoDate | null;
    loadedTo: IsoDate | null;
    loadedRangeKeys: string[];
    pendingRangeKeys: string[];
    status: "idle" | "loading" | "loaded" | "failed";
    error: FinanceDailyBalancesError | null;
    updatedAt: number | null;
};

export type FinanceDailyBalancesState = {
    scenarios: Record<string, FinanceDailyBalancesCacheEntry>;
};

export function getDailyBalancesRangeKey(range: DailyBalancesRange) {
    return `${range.from}:${range.to}`;
}

export function normalizeDailyBalancesSimulationGroupIds(
    simulationGroupIds: Uuid[] = [],
) {
    return [...simulationGroupIds].sort();
}

export function getDailyBalancesScenarioKey(simulationGroupIds: Uuid[] = []) {
    const normalizedIds =
        normalizeDailyBalancesSimulationGroupIds(simulationGroupIds);

    return normalizedIds.length > 0
        ? `sim:${normalizedIds.join("|")}`
        : BASE_DAILY_BALANCES_SCENARIO_KEY;
}

export function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

export function addMonthsToIsoDate(date: IsoDate, months: number): IsoDate {
    const [year, month, day] = date.split("-").map(Number);
    const targetMonthDate = new Date(Date.UTC(year, month - 1 + months, 1));
    const targetYear = targetMonthDate.getUTCFullYear();
    const targetMonth = targetMonthDate.getUTCMonth();
    const lastDayOfTargetMonth = new Date(
        Date.UTC(targetYear, targetMonth + 1, 0),
    ).getUTCDate();

    const clampedDay = Math.min(day, lastDayOfTargetMonth);

    return new Date(Date.UTC(targetYear, targetMonth, clampedDay))
        .toISOString()
        .slice(0, 10);
}

export function getInitialSerenityLineRange(
    referenceDate: IsoDate = getTodayIsoDate(),
): DailyBalancesRange {
    return {
        from: addMonthsToIsoDate(referenceDate, -6),
        to: addMonthsToIsoDate(referenceDate, 18),
    };
}

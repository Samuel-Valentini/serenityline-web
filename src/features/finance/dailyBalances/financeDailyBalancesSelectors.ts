import type { RootState } from "../../../app/store/store";
import type {
    FinanceCalendarDailyBalanceResponseDto,
    IsoDate,
} from "../api/financeApiTypes";
import type { FinanceDailyBalancesCacheEntry } from "./financeDailyBalancesTypes";

const emptyDailyBalancesCacheEntry: FinanceDailyBalancesCacheEntry = {
    balancesByDate: {},
    loadedFrom: null,
    loadedTo: null,
    loadedRangeKeys: [],
    pendingRangeKeys: [],
    status: "idle",
    error: null,
    updatedAt: null,
};

export function selectDailyBalancesScenarioEntry(
    state: RootState,
    scenarioKey: string,
) {
    return (
        state.financeDailyBalances.scenarios[scenarioKey] ??
        emptyDailyBalancesCacheEntry
    );
}

export function selectDailyBalancesForScenario(
    state: RootState,
    scenarioKey: string,
): FinanceCalendarDailyBalanceResponseDto[] {
    const entry = selectDailyBalancesScenarioEntry(state, scenarioKey);

    return Object.values(entry.balancesByDate).sort((first, second) =>
        first.date.localeCompare(second.date),
    );
}

export function selectDailyBalanceByDate(
    state: RootState,
    scenarioKey: string,
    date: IsoDate,
) {
    return selectDailyBalancesScenarioEntry(state, scenarioKey).balancesByDate[
        date
    ];
}

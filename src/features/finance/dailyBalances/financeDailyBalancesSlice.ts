import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
    FinanceCalendarDailyBalanceResponseDto,
    IsoDate,
} from "../api/financeApiTypes";
import type {
    DailyBalancesRange,
    FinanceDailyBalancesCacheEntry,
    FinanceDailyBalancesError,
    FinanceDailyBalancesState,
} from "./financeDailyBalancesTypes";

function createEmptyCacheEntry(): FinanceDailyBalancesCacheEntry {
    return {
        balancesByDate: {},
        loadedFrom: null,
        loadedTo: null,
        loadedRangeKeys: [],
        pendingRangeKeys: [],
        status: "idle",
        error: null,
        updatedAt: null,
    };
}

function createInitialFinanceDailyBalancesState(): FinanceDailyBalancesState {
    return {
        scenarios: {},
    };
}

function getOrCreateCacheEntry(
    state: FinanceDailyBalancesState,
    scenarioKey: string,
) {
    state.scenarios[scenarioKey] ??= createEmptyCacheEntry();

    return state.scenarios[scenarioKey];
}

function addUniqueValue(values: string[], value: string) {
    if (values.includes(value)) {
        return values;
    }

    values.push(value);

    return values;
}

function removeValue(values: string[], value: string) {
    return values.filter((currentValue) => currentValue !== value);
}

function minIsoDate(first: IsoDate | null, second: IsoDate) {
    return first == null || second < first ? second : first;
}

function maxIsoDate(first: IsoDate | null, second: IsoDate) {
    return first == null || second > first ? second : first;
}

export const initialFinanceDailyBalancesState =
    createInitialFinanceDailyBalancesState();

const financeDailyBalancesSlice = createSlice({
    name: "financeDailyBalances",
    initialState: initialFinanceDailyBalancesState,
    reducers: {
        financeDailyBalancesRangeLoadingStarted(
            state,
            action: PayloadAction<{
                scenarioKey: string;
                rangeKey: string;
                replace?: boolean;
            }>,
        ) {
            const entry = getOrCreateCacheEntry(
                state,
                action.payload.scenarioKey,
            );

            if (action.payload.replace) {
                entry.balancesByDate = {};
                entry.loadedFrom = null;
                entry.loadedTo = null;
                entry.loadedRangeKeys = [];
                entry.pendingRangeKeys = [];
                entry.updatedAt = null;
            }

            entry.status = "loading";
            entry.error = null;
            addUniqueValue(entry.pendingRangeKeys, action.payload.rangeKey);
        },

        financeDailyBalancesRangeLoaded(
            state,
            action: PayloadAction<{
                scenarioKey: string;
                rangeKey: string;
                range: DailyBalancesRange;
                balances: FinanceCalendarDailyBalanceResponseDto[];
                loadedAt: number;
            }>,
        ) {
            const entry = getOrCreateCacheEntry(
                state,
                action.payload.scenarioKey,
            );

            action.payload.balances.forEach((balance) => {
                entry.balancesByDate[balance.date] = balance;
            });

            entry.loadedFrom = minIsoDate(
                entry.loadedFrom,
                action.payload.range.from,
            );
            entry.loadedTo = maxIsoDate(entry.loadedTo, action.payload.range.to);
            addUniqueValue(entry.loadedRangeKeys, action.payload.rangeKey);
            entry.pendingRangeKeys = removeValue(
                entry.pendingRangeKeys,
                action.payload.rangeKey,
            );
            entry.status = "loaded";
            entry.error = null;
            entry.updatedAt = action.payload.loadedAt;
        },

        financeDailyBalancesRangeLoadingFailed(
            state,
            action: PayloadAction<{
                scenarioKey: string;
                rangeKey: string;
                error: FinanceDailyBalancesError;
            }>,
        ) {
            const entry = getOrCreateCacheEntry(
                state,
                action.payload.scenarioKey,
            );

            entry.pendingRangeKeys = removeValue(
                entry.pendingRangeKeys,
                action.payload.rangeKey,
            );
            entry.status = "failed";
            entry.error = action.payload.error;
        },

        financeDailyBalancesCleared() {
            return createInitialFinanceDailyBalancesState();
        },
    },
});

export const {
    financeDailyBalancesCleared,
    financeDailyBalancesRangeLoaded,
    financeDailyBalancesRangeLoadingFailed,
    financeDailyBalancesRangeLoadingStarted,
} = financeDailyBalancesSlice.actions;

export const financeDailyBalancesReducer = financeDailyBalancesSlice.reducer;
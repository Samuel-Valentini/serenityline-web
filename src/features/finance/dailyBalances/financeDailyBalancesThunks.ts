import type { AppThunk } from "../../../app/store/store";
import { ApiError } from "../../../shared/api";
import { listDailyBalances } from "../api/financeApi";
import type { Uuid } from "../api/financeApiTypes";
import {
    financeDailyBalancesRangeLoaded,
    financeDailyBalancesRangeLoadingFailed,
    financeDailyBalancesRangeLoadingStarted,
} from "./financeDailyBalancesSlice";
import type {
    DailyBalancesRange,
    FinanceDailyBalancesError,
} from "./financeDailyBalancesTypes";
import {
    getDailyBalancesRangeKey,
    getDailyBalancesScenarioKey,
    normalizeDailyBalancesSimulationGroupIds,
} from "./financeDailyBalancesTypes";

function isErrorBody(
    value: unknown,
): value is { code?: unknown; message?: unknown } {
    return typeof value === "object" && value !== null;
}

function toFinanceDailyBalancesError(
    error: unknown,
): FinanceDailyBalancesError {
    if (error instanceof ApiError) {
        const code =
            isErrorBody(error.body) && typeof error.body.code === "string"
                ? error.body.code
                : `http.${error.status}`;

        const message =
            isErrorBody(error.body) && typeof error.body.message === "string"
                ? error.body.message
                : error.message;

        return {
            code,
            message,
        };
    }

    if (error instanceof Error) {
        return {
            code: "error.unexpected",
            message: error.message,
        };
    }

    return {
        code: "error.unexpected",
    };
}

export type LoadDailyBalancesRangeArgs = {
    range: DailyBalancesRange;
    simulationGroupIds?: Uuid[];
    force?: boolean;
    replace?: boolean;
};

export function loadDailyBalancesRange({
    range,
    simulationGroupIds = [],
    force = false,
    replace = false,
}: LoadDailyBalancesRangeArgs): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
        const normalizedSimulationGroupIds =
            normalizeDailyBalancesSimulationGroupIds(simulationGroupIds);
        const scenarioKey = getDailyBalancesScenarioKey(
            normalizedSimulationGroupIds,
        );
        const rangeKey = getDailyBalancesRangeKey(range);
        const cacheEntry =
            getState().financeDailyBalances.scenarios[scenarioKey];

        if (
            !force &&
            cacheEntry &&
            (cacheEntry.loadedRangeKeys.includes(rangeKey) ||
                cacheEntry.pendingRangeKeys.includes(rangeKey))
        ) {
            return;
        }

        dispatch(
            financeDailyBalancesRangeLoadingStarted({
                scenarioKey,
                rangeKey,
                replace,
            }),
        );

        try {
            const balances = await listDailyBalances({
                from: range.from,
                to: range.to,
                simulationGroupIds:
                    normalizedSimulationGroupIds.length > 0
                        ? normalizedSimulationGroupIds
                        : undefined,
            });

            dispatch(
                financeDailyBalancesRangeLoaded({
                    scenarioKey,
                    rangeKey,
                    range,
                    balances,
                    loadedAt: Date.now(),
                }),
            );
        } catch (error) {
            dispatch(
                financeDailyBalancesRangeLoadingFailed({
                    scenarioKey,
                    rangeKey,
                    error: toFinanceDailyBalancesError(error),
                }),
            );
        }
    };
}

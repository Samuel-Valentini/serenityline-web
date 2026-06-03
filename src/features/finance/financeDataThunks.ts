import type { AppThunk } from "../../app/store/store";
import { ApiError } from "../../shared/api";
import {
    findBuckets,
    findSimulationGroups,
    getAccounts,
    listCategories,
    listFinancialPriorities,
} from "./api/financeApi";
import {
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "./financeDataSlice";
import type { FinanceDataError } from "./financeDataTypes";

function isErrorBody(
    value: unknown,
): value is { code?: unknown; message?: unknown } {
    return typeof value === "object" && value !== null;
}

function toFinanceDataError(error: unknown): FinanceDataError {
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

export function loadFinanceReferenceData(): AppThunk<Promise<void>> {
    return async (dispatch) => {
        dispatch(financeReferenceDataLoadingStarted());

        try {
            const [
                accounts,
                categories,
                buckets,
                simulationGroups,
                financialPriorities,
            ] = await Promise.all([
                getAccounts(),
                listCategories(),
                findBuckets({ status: "ACTIVE" }),
                findSimulationGroups({ status: "ACTIVE" }),
                listFinancialPriorities(),
            ]);

            dispatch(
                financeReferenceDataLoaded({
                    accounts,
                    categories,
                    buckets,
                    simulationGroups,
                    financialPriorities,
                }),
            );
        } catch (error) {
            dispatch(
                financeReferenceDataLoadingFailed(toFinanceDataError(error)),
            );
        }
    };
}

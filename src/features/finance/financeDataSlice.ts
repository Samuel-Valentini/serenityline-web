import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AccountResponseDto } from "./api/financeApiTypes";

import type {
    FinanceDataError,
    FinanceDataState,
    FinanceReferenceData,
} from "./financeDataTypes";

export const initialFinanceDataState: FinanceDataState = {
    status: "idle",
    error: null,
    accounts: [],
    categories: [],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

const financeDataSlice = createSlice({
    name: "financeData",
    initialState: initialFinanceDataState,
    reducers: {
        financeReferenceDataLoadingStarted(state) {
            state.status = "loading";
            state.error = null;
        },
        financeReferenceDataLoaded(
            state,
            action: PayloadAction<FinanceReferenceData>,
        ) {
            state.status = "loaded";
            state.error = null;
            state.accounts = action.payload.accounts;
            state.categories = action.payload.categories;
            state.buckets = action.payload.buckets;
            state.simulationGroups = action.payload.simulationGroups;
            state.financialPriorities = action.payload.financialPriorities;
        },
        accountAdded(state, action: PayloadAction<AccountResponseDto>) {
            state.accounts.push(action.payload);
        },
        financeReferenceDataLoadingFailed(
            state,
            action: PayloadAction<FinanceDataError>,
        ) {
            state.status = "failed";
            state.error = action.payload;
        },
        financeDataCleared() {
            return initialFinanceDataState;
        },
    },
});

export const {
    accountAdded,
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} = financeDataSlice.actions;

export const financeDataReducer = financeDataSlice.reducer;

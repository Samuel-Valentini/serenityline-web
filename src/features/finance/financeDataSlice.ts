import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
    AccountResponseDto,
    BucketResponseDto,
    CategoryResponseDto,
    CreditCardResponseDto,
    SimulationGroupResponseDto,
} from "./api/financeApiTypes";

import type {
    FinanceDataError,
    FinanceDataState,
    FinanceReferenceData,
} from "./financeDataTypes";

export const initialFinanceDataState: FinanceDataState = {
    status: "idle",
    error: null,
    accounts: [],
    creditCards: [],
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
            state.creditCards = action.payload.creditCards;
            state.categories = action.payload.categories;
            state.buckets = action.payload.buckets;
            state.simulationGroups = action.payload.simulationGroups;
            state.financialPriorities = action.payload.financialPriorities;
        },
        accountAdded(state, action: PayloadAction<AccountResponseDto>) {
            state.accounts.push(action.payload);
        },
        accountUpdated(state, action: PayloadAction<AccountResponseDto>) {
            const accountIndex = state.accounts.findIndex(
                (account) => account.accountId === action.payload.accountId,
            );

            if (accountIndex >= 0) {
                state.accounts[accountIndex] = action.payload;
            }
        },
        creditCardAdded(state, action: PayloadAction<CreditCardResponseDto>) {
            state.creditCards.push(action.payload);
        },
        creditCardUpdated(state, action: PayloadAction<CreditCardResponseDto>) {
            const creditCardIndex = state.creditCards.findIndex(
                (creditCard) =>
                    creditCard.creditCardId === action.payload.creditCardId,
            );

            if (creditCardIndex >= 0) {
                state.creditCards[creditCardIndex] = action.payload;
            }
        },
        creditCardDeleted(state, action: PayloadAction<string>) {
            state.creditCards = state.creditCards.filter(
                (creditCard) => creditCard.creditCardId !== action.payload,
            );
        },
        categoryAdded(state, action: PayloadAction<CategoryResponseDto>) {
            state.categories.push(action.payload);
        },
        categoryUpdated(state, action: PayloadAction<CategoryResponseDto>) {
            const categoryIndex = state.categories.findIndex(
                (category) => category.categoryId === action.payload.categoryId,
            );

            if (categoryIndex >= 0) {
                state.categories[categoryIndex] = action.payload;
            }
        },
        bucketAdded(state, action: PayloadAction<BucketResponseDto>) {
            state.buckets.push(action.payload);
        },
        bucketUpdated(state, action: PayloadAction<BucketResponseDto>) {
            const bucketIndex = state.buckets.findIndex(
                (bucket) => bucket.bucketId === action.payload.bucketId,
            );

            if (bucketIndex >= 0) {
                state.buckets[bucketIndex] = action.payload;
                return;
            }

            state.buckets.push(action.payload);
        },
        simulationGroupAdded(
            state,
            action: PayloadAction<SimulationGroupResponseDto>,
        ) {
            state.simulationGroups.push(action.payload);
        },
        simulationGroupUpdated(
            state,
            action: PayloadAction<SimulationGroupResponseDto>,
        ) {
            const simulationGroupIndex = state.simulationGroups.findIndex(
                (simulationGroup) =>
                    simulationGroup.simulationGroupId ===
                    action.payload.simulationGroupId,
            );

            if (simulationGroupIndex >= 0) {
                state.simulationGroups[simulationGroupIndex] = action.payload;
                return;
            }

            state.simulationGroups.push(action.payload);
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
    accountUpdated,
    creditCardAdded,
    creditCardUpdated,
    creditCardDeleted,
    categoryAdded,
    categoryUpdated,
    bucketAdded,
    bucketUpdated,
    simulationGroupAdded,
    simulationGroupUpdated,
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} = financeDataSlice.actions;

export const financeDataReducer = financeDataSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
    AccountResponseDto,
    CreditCardResponseDto,
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
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} = financeDataSlice.actions;

export const financeDataReducer = financeDataSlice.reducer;

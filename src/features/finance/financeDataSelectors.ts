import type { RootState } from "../../app/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectFinanceDataStatus = (state: RootState) =>
    state.financeData.status;

export const selectFinanceDataError = (state: RootState) =>
    state.financeData.error;

export const selectAccounts = (state: RootState) => state.financeData.accounts;

export const selectCreditCards = (state: RootState) =>
    state.financeData.creditCards;

export const selectCategories = (state: RootState) =>
    state.financeData.categories;

export const selectActiveCategories = createSelector(
    [selectCategories],
    (categories) => categories.filter((category) => category.active),
);

export const selectBuckets = (state: RootState) => state.financeData.buckets;

export const selectSimulationGroups = (state: RootState) =>
    state.financeData.simulationGroups;

export const selectFinancialPriorities = (state: RootState) =>
    state.financeData.financialPriorities;

export const selectIsFinanceDataLoading = (state: RootState) =>
    state.financeData.status === "loading";

export const selectHasLoadedFinanceData = (state: RootState) =>
    state.financeData.status === "loaded";

export const selectFinanceReportSummary = (state: RootState) =>
    state.financeData.financeReportSummary;

import { describe, expect, it } from "vitest";

import {
    accountAdded,
    financeDataCleared,
    financeDataReducer,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
    initialFinanceDataState,
    accountUpdated,
} from "./financeDataSlice";
import type { FinanceReferenceData } from "./financeDataTypes";

const referenceData: FinanceReferenceData = {
    accounts: [
        {
            accountId: "account-id",
            accountName: "Conto principale",
            accountDescription: null,
            currency: "EUR",
            issuingInstitution: null,
            openingBalance: 1000,
            openingBalanceDate: "2026-01-01",
            userGroupId: "group-id",
            accountCreatedAt: "2026-01-01T00:00:00Z",
            accountUpdatedAt: "2026-01-01T00:00:00Z",
        },
    ],
    categories: [
        {
            categoryId: "category-id",
            categoryName: "Casa",
            categoryDescription: null,
            active: true,
        },
    ],
    buckets: [
        {
            bucketId: "bucket-id",
            bucketName: "Essenziali",
            bucketDescription: null,
            accountIds: ["account-id"],
            userGroupId: "group-id",
            bucketCreatedAt: "2026-01-01T00:00:00Z",
            bucketUpdatedAt: "2026-01-01T00:00:00Z",
            bucketClosedAt: null,
        },
    ],
    simulationGroups: [
        {
            simulationGroupId: "simulation-group-id",
            simulationGroupName: "Scenario base",
            simulationGroupDescription: null,
            simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
            simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
            simulationGroupArchivedAt: null,
            accountIds: ["account-id"],
        },
    ],
    financialPriorities: [
        {
            financialPriorityId: "priority-id",
            financialPriorityCode: "ESSENTIAL",
            financialPriorityDisplayName: "Essenziale",
            financialPriorityDescription: "Spese essenziali",
            financialPriorityRanking: 2,
        },
    ],
};

describe("financeDataSlice", () => {
    it("starts loading finance reference data", () => {
        const state = financeDataReducer(
            initialFinanceDataState,
            financeReferenceDataLoadingStarted(),
        );

        expect(state.status).toBe("loading");
        expect(state.error).toBeNull();
    });

    it("stores finance reference data", () => {
        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loading",
            },
            financeReferenceDataLoaded(referenceData),
        );

        expect(state.status).toBe("loaded");
        expect(state.error).toBeNull();
        expect(state.accounts).toHaveLength(1);
        expect(state.categories).toHaveLength(1);
        expect(state.buckets).toHaveLength(1);
        expect(state.simulationGroups).toHaveLength(1);
        expect(state.financialPriorities).toHaveLength(1);
    });

    it("stores loading errors", () => {
        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loading",
            },
            financeReferenceDataLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        expect(state.status).toBe("failed");
        expect(state.error).toEqual({
            code: "http.500",
            message: "Server error",
        });
    });

    it("clears finance data state", () => {
        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                ...referenceData,
                status: "loaded",
            },
            financeDataCleared(),
        );

        expect(state).toEqual(initialFinanceDataState);
    });

    it("adds an account to the finance data state", () => {
        const account = {
            accountId: "new-account-id",
            accountName: "Nuovo conto",
            accountDescription: null,
            currency: "EUR",
            issuingInstitution: null,
            openingBalance: 500,
            openingBalanceDate: "2026-06-03",
            userGroupId: "group-id",
            accountCreatedAt: "2026-06-03T10:00:00Z",
            accountUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loaded",
            },
            accountAdded(account),
        );

        expect(state.accounts).toEqual([account]);
    });

    it("updates an account in the finance data state", () => {
        const updatedAccount = {
            ...referenceData.accounts[0],
            accountName: "Conto aggiornato",
            accountDescription: "Descrizione aggiornata",
            issuingInstitution: "Banca aggiornata",
            openingBalance: 1500.25,
            openingBalanceDate: "2026-02-01",
            accountUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                ...referenceData,
                status: "loaded",
            },
            accountUpdated(updatedAccount),
        );

        expect(state.accounts).toEqual([updatedAccount]);
    });
});

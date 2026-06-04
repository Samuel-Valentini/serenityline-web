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
    creditCardAdded,
    creditCardUpdated,
    creditCardDeleted,
    categoryAdded,
    categoryUpdated,
    bucketAdded,
    bucketUpdated,
} from "./financeDataSlice";
import type { FinanceReferenceData } from "./financeDataTypes";

const creditCard = {
    creditCardId: "credit-card-id",
    creditCardName: "Carta principale",
    creditCardDescription: null,
    creditCardChargeDay: 15,
    accountId: "account-id",
    userGroupId: "group-id",
    creditCardCreatedAt: "2026-01-01T00:00:00Z",
    creditCardUpdatedAt: "2026-01-01T00:00:00Z",
};

const category = {
    categoryId: "category-id",
    categoryName: "Casa",
    categoryDescription: "Spese legate alla casa",
    active: true,
};

const bucket = {
    bucketId: "bucket-id",
    bucketName: "Risparmio",
    bucketDescription: "Portafoglio per obiettivi di risparmio",
    accountIds: ["account-id"],
    userGroupId: "group-id",
    bucketCreatedAt: "2026-01-01T00:00:00Z",
    bucketUpdatedAt: "2026-01-01T00:00:00Z",
    bucketClosedAt: null,
};

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
    creditCards: [creditCard],
    categories: [category],
    buckets: [bucket],
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
        expect(state.creditCards).toHaveLength(1);
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

    it("adds a credit card to the finance data state", () => {
        const newCreditCard = {
            ...creditCard,
            creditCardId: "new-credit-card-id",
            creditCardName: "Nuova carta",
            creditCardChargeDay: 20,
            creditCardCreatedAt: "2026-06-03T10:00:00Z",
            creditCardUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loaded",
            },
            creditCardAdded(newCreditCard),
        );

        expect(state.creditCards).toEqual([newCreditCard]);
    });

    it("updates a credit card in the finance data state", () => {
        const updatedCreditCard = {
            ...creditCard,
            creditCardName: "Carta aggiornata",
            creditCardDescription: "Descrizione aggiornata",
            creditCardChargeDay: 10,
            creditCardUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                creditCards: [creditCard],
                status: "loaded",
            },
            creditCardUpdated(updatedCreditCard),
        );

        expect(state.creditCards).toEqual([updatedCreditCard]);
    });

    it("deletes a credit card from the finance data state", () => {
        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                creditCards: [creditCard],
                status: "loaded",
            },
            creditCardDeleted(creditCard.creditCardId),
        );

        expect(state.creditCards).toEqual([]);
    });

    it("adds a category to the finance data state", () => {
        const newCategory = {
            ...category,
            categoryId: "new-category-id",
            categoryName: "Trasporti",
            categoryDescription: null,
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loaded",
            },
            categoryAdded(newCategory),
        );

        expect(state.categories).toEqual([newCategory]);
    });

    it("updates a category in the finance data state", () => {
        const updatedCategory = {
            ...category,
            categoryName: "Casa aggiornata",
            categoryDescription: "Descrizione aggiornata",
            active: false,
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                categories: [category],
                status: "loaded",
            },
            categoryUpdated(updatedCategory),
        );

        expect(state.categories).toEqual([updatedCategory]);
    });

    it("adds a bucket to the finance data state", () => {
        const newBucket = {
            ...bucket,
            bucketId: "new-bucket-id",
            bucketName: "Università",
            bucketDescription: null,
            accountIds: [],
            bucketCreatedAt: "2026-06-03T10:00:00Z",
            bucketUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loaded",
            },
            bucketAdded(newBucket),
        );

        expect(state.buckets).toEqual([newBucket]);
    });

    it("updates a bucket in the finance data state", () => {
        const updatedBucket = {
            ...bucket,
            bucketName: "Risparmio aggiornato",
            bucketDescription: "Descrizione aggiornata",
            accountIds: ["account-id", "second-account-id"],
            bucketUpdatedAt: "2026-06-03T10:00:00Z",
        };

        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                buckets: [bucket],
                status: "loaded",
            },
            bucketUpdated(updatedBucket),
        );

        expect(state.buckets).toEqual([updatedBucket]);
    });

    it("adds a bucket when updating a bucket that is not in finance data yet", () => {
        const state = financeDataReducer(
            {
                ...initialFinanceDataState,
                status: "loaded",
            },
            bucketUpdated(bucket),
        );

        expect(state.buckets).toEqual([bucket]);
    });
});

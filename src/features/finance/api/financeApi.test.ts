import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    closeBucket,
    createAccount,
    createBucket,
    createCategory,
    deactivateCategory,
    findBuckets,
    grantAccountAccess,
    linkBucketAccount,
    reactivateCategory,
    reopenBucket,
    revokeAccountAccess,
    unlinkBucketAccount,
    updateAccount,
    updateBucket,
    updateCategory,
    createTransaction,
    deleteTransaction,
    getTransaction,
    listTransactions,
    updateTransaction,
    confirmRecurringTransactionOccurrence,
    createRecurringTransaction,
    deleteRecurringTransaction,
    getRecurringTransaction,
    getRecurringTransactionHistory,
    listRecurringTransactions,
    patchRecurringTransaction,
} from "./financeApi";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
}

function noContentResponse(): Response {
    return new Response(null, {
        status: 204,
    });
}

function getLastFetchCall() {
    const fetchMock = vi.mocked(fetch);
    const lastCall = fetchMock.mock.calls.at(-1);

    if (!lastCall) {
        throw new Error("Expected fetch to have been called.");
    }

    return lastCall;
}

function getLastRequestPath(): string {
    const [url] = getLastFetchCall();

    return new URL(String(url)).pathname;
}

function getLastRequestSearch(): string {
    const [url] = getLastFetchCall();

    return new URL(String(url)).search;
}

function getLastRequestBody(): unknown {
    const [, init] = getLastFetchCall();

    if (!init || typeof init.body !== "string") {
        throw new Error("Expected fetch body to be a JSON string.");
    }

    return JSON.parse(init.body);
}

describe("financeApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sends the expected create account body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createAccount({
            accountName: "Conto principale",
            accountDescription: "Conto corrente personale",
            currency: "EUR",
            issuingInstitution: "Banca Test",
            openingBalance: 1250.5,
            openingBalanceDate: "2026-06-02",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/accounts");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            accountName: "Conto principale",
            accountDescription: "Conto corrente personale",
            currency: "EUR",
            issuingInstitution: "Banca Test",
            openingBalance: 1250.5,
            openingBalanceDate: "2026-06-02",
        });
    });

    it("sends the expected update account body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateAccount("account-id", {
            accountName: "Conto aggiornato",
            accountDescription: "Descrizione aggiornata",
            issuingInstitution: "Nuova banca",
            openingBalance: 2000,
            openingBalanceDate: "2026-06-03",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/accounts/account-id");
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            accountName: "Conto aggiornato",
            accountDescription: "Descrizione aggiornata",
            issuingInstitution: "Nuova banca",
            openingBalance: 2000,
            openingBalanceDate: "2026-06-03",
        });
    });

    it("grants account access without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await grantAccountAccess("account-id", "target-user-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/accounts/account-id/users/target-user-id",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("revokes account access without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await revokeAccountAccess("account-id", "target-user-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/accounts/account-id/users/target-user-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("sends the expected create category body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createCategory({
            categoryName: "Casa",
            categoryDescription: "Spese casa",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/categories");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            categoryName: "Casa",
            categoryDescription: "Spese casa",
        });
    });

    it("sends the expected update category body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateCategory("category-id", {
            categoryName: "Casa aggiornata",
            categoryDescription: "Descrizione aggiornata",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/categories/category-id",
        );
        expect(init?.method).toBe("PUT");
        expect(getLastRequestBody()).toEqual({
            categoryName: "Casa aggiornata",
            categoryDescription: "Descrizione aggiornata",
        });
    });

    it("deactivates a category without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await deactivateCategory("category-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/categories/category-id/deactivate",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("reactivates a category without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await reactivateCategory("category-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/categories/category-id/reactivate",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("adds the expected bucket status query parameter", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await findBuckets({
            status: "ALL",
        });

        expect(getLastRequestPath()).toBe("/api/finance/buckets");
        expect(getLastRequestSearch()).toBe("?status=ALL");
    });

    it("sends the expected create bucket body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createBucket({
            bucketName: "Fondo emergenza",
            bucketDescription: "Liquidità di sicurezza",
            accountIds: ["account-1", "account-2"],
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/buckets");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            bucketName: "Fondo emergenza",
            bucketDescription: "Liquidità di sicurezza",
            accountIds: ["account-1", "account-2"],
        });
    });

    it("sends the expected update bucket body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateBucket("bucket-id", {
            bucketName: "Fondo aggiornato",
            bucketDescription: "Descrizione aggiornata",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/buckets/bucket-id");
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            bucketName: "Fondo aggiornato",
            bucketDescription: "Descrizione aggiornata",
        });
    });

    it("links an account to a bucket without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await linkBucketAccount("bucket-id", "account-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/buckets/bucket-id/accounts/account-id",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("unlinks an account from a bucket without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await unlinkBucketAccount("bucket-id", "account-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/buckets/bucket-id/accounts/account-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("closes a bucket without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await closeBucket("bucket-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/buckets/bucket-id/close",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("reopens a bucket without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await reopenBucket("bucket-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/buckets/bucket-id/reopen",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("adds the expected transaction search query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listTransactions({
            from: "2026-06-01",
            to: "2026-06-30",
            accountId: "account-id",
            simulationGroupId: "simulation-group-id",
        });

        expect(getLastRequestPath()).toBe("/api/finance/transactions");
        expect(getLastRequestSearch()).toBe(
            "?from=2026-06-01&to=2026-06-30&accountId=account-id&simulationGroupId=simulation-group-id",
        );
    });

    it("gets a transaction by id", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await getTransaction("transaction-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/transactions/transaction-id",
        );
        expect(init?.method).toBe("GET");
    });

    it("sends the expected create transaction body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createTransaction({
            transactionDescription: "Stipendio",
            transactionAmount: 2500,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
            categoryId: "category-id",
            transactionChargeDate: "2026-06-05",
            transactionIsConfirmed: true,
            accountId: "account-id",
            creditCardId: null,
            bucketId: null,
            transactionIsSimulated: false,
            simulationGroupId: null,
            transactionReminderEnabled: true,
            transactionReminderDaysBefore: 3,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/transactions");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            transactionDescription: "Stipendio",
            transactionAmount: 2500,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
            categoryId: "category-id",
            transactionChargeDate: "2026-06-05",
            transactionIsConfirmed: true,
            accountId: "account-id",
            creditCardId: null,
            bucketId: null,
            transactionIsSimulated: false,
            simulationGroupId: null,
            transactionReminderEnabled: true,
            transactionReminderDaysBefore: 3,
        });
    });

    it("sends the expected update transaction body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateTransaction("transaction-id", {
            transactionDescription: "Affitto",
            transactionAmount: -850,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
            categoryId: "category-id",
            transactionChargeDate: "2026-06-10",
            transactionIsConfirmed: false,
            accountId: "account-id",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionIsSimulated: false,
            simulationGroupId: null,
            transactionReminderEnabled: true,
            transactionReminderDaysBefore: 5,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/transactions/transaction-id",
        );
        expect(init?.method).toBe("PUT");
        expect(getLastRequestBody()).toEqual({
            transactionDescription: "Affitto",
            transactionAmount: -850,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
            categoryId: "category-id",
            transactionChargeDate: "2026-06-10",
            transactionIsConfirmed: false,
            accountId: "account-id",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionIsSimulated: false,
            simulationGroupId: null,
            transactionReminderEnabled: true,
            transactionReminderDaysBefore: 5,
        });
    });

    it("deletes a transaction without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await deleteTransaction("transaction-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/transactions/transaction-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("adds the expected recurring transaction query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listRecurringTransactions({
            accountId: "account-id",
            simulationGroupIds: ["simulation-group-1", "simulation-group-2"],
        });

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions",
        );
        expect(getLastRequestSearch()).toBe(
            "?accountId=account-id&simulationGroupIds=simulation-group-1&simulationGroupIds=simulation-group-2",
        );
    });

    it("gets a recurring transaction by id", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await getRecurringTransaction("recurring-transaction-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id",
        );
        expect(init?.method).toBe("GET");
    });

    it("sends the expected create recurring transaction body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createRecurringTransaction({
            recurringTransactionDescription: "Affitto mensile",
            paymentAmount: -850,
            recurringTransactionAmountIsAdjustable: false,
            recurringTransactionFirstPaymentDate: "2026-06-05",
            recurrenceInterval: 1,
            recurrenceUnit: "MONTH",
            paymentDateAdjustmentPolicy: "NEXT_BUSINESS_DAY",
            recurringTransactionEndDate: null,
            finalPaymentAmount: null,
            categoryId: "category-id",
            financialPriorityId: "financial-priority-id",
            linkedAccountId: "account-id",
            linkedCreditCardId: null,
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: true,
            recurringTransactionIsSimulated: false,
            simulationGroupId: null,
            recurringTransactionReminderEnabled: true,
            recurringTransactionReminderDaysBefore: 5,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions",
        );
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            recurringTransactionDescription: "Affitto mensile",
            paymentAmount: -850,
            recurringTransactionAmountIsAdjustable: false,
            recurringTransactionFirstPaymentDate: "2026-06-05",
            recurrenceInterval: 1,
            recurrenceUnit: "MONTH",
            paymentDateAdjustmentPolicy: "NEXT_BUSINESS_DAY",
            recurringTransactionEndDate: null,
            finalPaymentAmount: null,
            categoryId: "category-id",
            financialPriorityId: "financial-priority-id",
            linkedAccountId: "account-id",
            linkedCreditCardId: null,
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: true,
            recurringTransactionIsSimulated: false,
            simulationGroupId: null,
            recurringTransactionReminderEnabled: true,
            recurringTransactionReminderDaysBefore: 5,
        });
    });

    it("sends the expected patch recurring transaction body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await patchRecurringTransaction("recurring-transaction-id", {
            recurringTransactionFirstPaymentDate: "2026-06-10",
            recurringTransactionAmountIsAdjustable: true,
            recurringTransactionIsSimulated: true,
            simulationGroupId: "simulation-group-id",
            recurringTransactionReminderEnabled: true,
            recurringTransactionReminderDaysBefore: 3,
            rule: {
                effectiveFrom: "2026-06-10",
                effectiveTo: null,
                dayOfUnit: 10,
                paymentAmount: -900,
                recurrenceInterval: 1,
                recurrenceUnit: "MONTH",
                paymentDateAdjustmentPolicy: "PREVIOUS_BUSINESS_DAY",
                recurringTransactionEndDate: null,
                finalPaymentAmount: null,
            },
            details: {
                effectiveFrom: "2026-06-10",
                recurringTransactionDescription: "Affitto aggiornato",
                categoryId: "category-id",
                financialPriorityId: "financial-priority-id",
                linkedAccountId: "account-id",
                linkedCreditCardId: null,
                linkedBucketId: "bucket-id",
                recurringTransactionAffectsAccountBalance: true,
                recurringtransactionAffectsSerenityline: true,
            },
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id",
        );
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            recurringTransactionFirstPaymentDate: "2026-06-10",
            recurringTransactionAmountIsAdjustable: true,
            recurringTransactionIsSimulated: true,
            simulationGroupId: "simulation-group-id",
            recurringTransactionReminderEnabled: true,
            recurringTransactionReminderDaysBefore: 3,
            rule: {
                effectiveFrom: "2026-06-10",
                effectiveTo: null,
                dayOfUnit: 10,
                paymentAmount: -900,
                recurrenceInterval: 1,
                recurrenceUnit: "MONTH",
                paymentDateAdjustmentPolicy: "PREVIOUS_BUSINESS_DAY",
                recurringTransactionEndDate: null,
                finalPaymentAmount: null,
            },
            details: {
                effectiveFrom: "2026-06-10",
                recurringTransactionDescription: "Affitto aggiornato",
                categoryId: "category-id",
                financialPriorityId: "financial-priority-id",
                linkedAccountId: "account-id",
                linkedCreditCardId: null,
                linkedBucketId: "bucket-id",
                recurringTransactionAffectsAccountBalance: true,
                recurringtransactionAffectsSerenityline: true,
            },
        });
    });

    it("deletes a recurring transaction without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await deleteRecurringTransaction("recurring-transaction-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("deletes a recurring transaction with final rule body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await deleteRecurringTransaction("recurring-transaction-id", {
            endDate: "2026-12-31",
            finalPaymentAmount: -425,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(getLastRequestBody()).toEqual({
            endDate: "2026-12-31",
            finalPaymentAmount: -425,
        });
    });

    it("gets recurring transaction history", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                recurringTransactionId: "recurring-transaction-id",
                ruleHistory: [],
                detailsHistory: [],
            }),
        );

        await getRecurringTransactionHistory("recurring-transaction-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id/history",
        );
        expect(init?.method).toBe("GET");
    });

    it("confirms a recurring transaction occurrence", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await confirmRecurringTransactionOccurrence(
            "recurring-transaction-id",
            {
                logicalDate: "2026-06-05",
                transactionAmount: -850,
                transactionChargeDate: "2026-06-05",
            },
        );

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id/occurrences/confirm",
        );
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            logicalDate: "2026-06-05",
            transactionAmount: -850,
            transactionChargeDate: "2026-06-05",
        });
    });
});

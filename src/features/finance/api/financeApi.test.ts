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
    archiveSimulationGroup,
    createCreditCard,
    createSimulationGroup,
    deleteCreditCard,
    findSimulationGroup,
    findSimulationGroups,
    getCreditCard,
    linkSimulationGroupAccount,
    listCreditCards,
    listFinancialPriorities,
    restoreSimulationGroup,
    unlinkSimulationGroupAccount,
    updateCreditCard,
    updateSimulationGroup,
    getFinanceReportSummary,
    listCalendarMovements,
    listDailyBalances,
    getAccounts,
} from "./financeApi";

import { setAccessToken, clearAccessToken } from "../../../shared/api";

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

function getLastRequestHeaders(): Headers {
    const [, init] = getLastFetchCall();

    return new Headers(init?.headers);
}

describe("financeApi", () => {
    beforeEach(() => {
        clearAccessToken();
        setAccessToken("access-token");
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        clearAccessToken();
        vi.unstubAllGlobals();
    });

    it("sends the expected create account body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createAccount({
            accountName: "Conto principale",
            accountDescription: "Conto corrente personale",
            currency: "EUR",
            issuingInstitution: "Banca Test",
            openingBalance: "1250.50",
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
            openingBalance: "1250.50",
            openingBalanceDate: "2026-06-02",
        });
    });

    it("sends the expected update account body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateAccount("account-id", {
            accountName: "Conto aggiornato",
            accountDescription: "Descrizione aggiornata",
            issuingInstitution: "Nuova banca",
            openingBalance: "2000.00",
            openingBalanceDate: "2026-06-03",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/accounts/account-id");
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            accountName: "Conto aggiornato",
            accountDescription: "Descrizione aggiornata",
            issuingInstitution: "Nuova banca",
            openingBalance: "2000.00",
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
            transactionAmount: "2500.00",
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
            transactionAmount: "2500.00",
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
            transactionAmount: "-850.00",
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
            transactionAmount: "-850.00",
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
            paymentAmount: "-850.00",
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
            paymentAmount: "-850.00",
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
                paymentAmount: "-900.00",
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
                paymentAmount: "-900.00",
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
            finalPaymentAmount: "-425.00",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/recurring-transactions/recurring-transaction-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(getLastRequestBody()).toEqual({
            endDate: "2026-12-31",
            finalPaymentAmount: "-425.00",
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
                transactionAmount: "-850.00",
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
            transactionAmount: "-850.00",
            transactionChargeDate: "2026-06-05",
        });
    });

    it("lists credit cards", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listCreditCards();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/credit-cards");
        expect(init?.method).toBe("GET");
    });

    it("gets a credit card by id", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await getCreditCard("credit-card-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/credit-cards/credit-card-id",
        );
        expect(init?.method).toBe("GET");
    });

    it("sends the expected create credit card body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createCreditCard({
            creditCardName: "Carta principale",
            creditCardDescription: "Carta Visa",
            creditCardChargeDay: 15,
            accountId: "account-id",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/credit-cards");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            creditCardName: "Carta principale",
            creditCardDescription: "Carta Visa",
            creditCardChargeDay: 15,
            accountId: "account-id",
        });
    });

    it("sends the expected update credit card body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateCreditCard("credit-card-id", {
            creditCardName: "Carta aggiornata",
            creditCardDescription: "Descrizione aggiornata",
            creditCardChargeDay: 20,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/credit-cards/credit-card-id",
        );
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            creditCardName: "Carta aggiornata",
            creditCardDescription: "Descrizione aggiornata",
            creditCardChargeDay: 20,
        });
    });

    it("deletes a credit card without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await deleteCreditCard("credit-card-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/credit-cards/credit-card-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("adds the expected simulation group status query parameter", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await findSimulationGroups({
            status: "ARCHIVED",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/simulation-groups");
        expect(getLastRequestSearch()).toBe("?status=ARCHIVED");
        expect(init?.method).toBe("GET");
    });

    it("gets a simulation group by id", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await findSimulationGroup("simulation-group-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id",
        );
        expect(init?.method).toBe("GET");
    });

    it("sends the expected create simulation group body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await createSimulationGroup({
            simulationGroupName: "Scenario prudente",
            simulationGroupDescription: "Scenario con spese ridotte",
            accountIds: ["account-1", "account-2"],
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/simulation-groups");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            simulationGroupName: "Scenario prudente",
            simulationGroupDescription: "Scenario con spese ridotte",
            accountIds: ["account-1", "account-2"],
        });
    });

    it("sends the expected update simulation group body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await updateSimulationGroup("simulation-group-id", {
            simulationGroupName: "Scenario aggiornato",
            simulationGroupDescription: "Descrizione aggiornata",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id",
        );
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            simulationGroupName: "Scenario aggiornato",
            simulationGroupDescription: "Descrizione aggiornata",
        });
    });

    it("archives a simulation group without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await archiveSimulationGroup("simulation-group-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id/archive",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("restores a simulation group without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await restoreSimulationGroup("simulation-group-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id/restore",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("links an account to a simulation group without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await linkSimulationGroupAccount("simulation-group-id", "account-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id/accounts/account-id",
        );
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeUndefined();
    });

    it("unlinks an account from a simulation group without a request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}));

        await unlinkSimulationGroupAccount("simulation-group-id", "account-id");

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/simulation-groups/simulation-group-id/accounts/account-id",
        );
        expect(init?.method).toBe("DELETE");
        expect(init?.body).toBeUndefined();
    });

    it("lists financial priorities", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listFinancialPriorities();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/financial-priorities");
        expect(init?.method).toBe("GET");
    });

    it("adds the expected calendar movement query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listCalendarMovements({
            from: "2026-06-01",
            to: "2026-06-30",
            accountIds: ["account-1", "account-2"],
            simulationGroupIds: ["simulation-group-1", "simulation-group-2"],
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/calendar");
        expect(getLastRequestSearch()).toBe(
            "?from=2026-06-01&to=2026-06-30&accountIds=account-1&accountIds=account-2&simulationGroupIds=simulation-group-1&simulationGroupIds=simulation-group-2",
        );
        expect(init?.method).toBe("GET");
    });

    it("adds the expected daily balances query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listDailyBalances({
            from: "2026-06-01",
            to: "2026-06-30",
            accountIds: ["account-1"],
            simulationGroupIds: ["simulation-group-1"],
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(
            "/api/finance/calendar/daily-balances",
        );
        expect(getLastRequestSearch()).toBe(
            "?from=2026-06-01&to=2026-06-30&accountIds=account-1&simulationGroupIds=simulation-group-1",
        );
        expect(init?.method).toBe("GET");
    });

    it("adds the expected finance report summary query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                asOfDate: "2026-06-03",
                projectionMode: "PROJECTED_PLANNING",
                extremesRange: {
                    from: "2026-06-03",
                    to: "2027-06-03",
                },
                yearEndForecastYears: 5,
                recurringByCurrency: [],
                extremesByCurrency: [],
                yearEndForecasts: [],
            }),
        );

        await getFinanceReportSummary({
            accountIds: ["account-1", "account-2"],
            simulationGroupIds: ["simulation-group-1", "simulation-group-2"],
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/reports/summary");
        expect(getLastRequestSearch()).toBe(
            "?accountIds=account-1&accountIds=account-2&simulationGroupIds=simulation-group-1&simulationGroupIds=simulation-group-2",
        );
        expect(init?.method).toBe("GET");
    });

    it("omits empty dashboard query parameters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listCalendarMovements();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/calendar");
        expect(getLastRequestSearch()).toBe("");
        expect(init?.method).toBe("GET");
    });

    it("omits accountIds when listing calendar movements for all accessible accounts", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await listCalendarMovements({
            from: "2026-06-01",
            to: "2026-06-30",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/calendar");
        expect(getLastRequestSearch()).toBe("?from=2026-06-01&to=2026-06-30");
        expect(init?.method).toBe("GET");
    });

    it("omits accountIds when requesting the summary for all accessible accounts", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                asOfDate: "2026-06-03",
                projectionMode: "PROJECTED_PLANNING",
                extremesRange: {
                    from: "2026-06-03",
                    to: "2027-06-03",
                },
                yearEndForecastYears: 5,
                recurringByCurrency: [],
                extremesByCurrency: [],
                yearEndForecasts: [],
            }),
        );

        await getFinanceReportSummary();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/finance/reports/summary");
        expect(getLastRequestSearch()).toBe("");
        expect(init?.method).toBe("GET");
    });

    it("sends the access token for finance requests", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

        await getAccounts();

        expect(getLastRequestPath()).toBe("/api/finance/accounts");
        expect(getLastRequestHeaders().get("Authorization")).toBe(
            "Bearer access-token",
        );
    });
});

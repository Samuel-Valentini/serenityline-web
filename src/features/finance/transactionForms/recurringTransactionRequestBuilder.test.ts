import { describe, expect, it } from "vitest";

import type { MoneyAmountInput } from "../api/financeApiTypes";
import {
    buildRecurringTransactionRequests,
    isZeroMoneyAmount,
    type RecurringTransactionBaseRequest,
} from "./recurringTransactionRequestBuilder";

const baseRequest: RecurringTransactionBaseRequest = {
    recurringTransactionDescription: "Movimento ricorrente",
    recurringTransactionAmountIsAdjustable: false,
    recurringTransactionFirstPaymentDate: "2026-06-01",
    recurrenceInterval: 1,
    recurrenceUnit: "MONTH",
    paymentDateAdjustmentPolicy: "NONE",
    recurringTransactionEndDate: null,
    categoryId: "category-id",
    financialPriorityId: "financial-priority-id",
    linkedAccountId: "account-id",
    recurringTransactionIsSimulated: false,
    simulationGroupId: null,
    recurringTransactionReminderEnabled: false,
    recurringTransactionReminderDaysBefore: 7,
};

function money(value: string): MoneyAmountInput {
    return value as MoneyAmountInput;
}

describe("buildRecurringTransactionRequests", () => {
    it("builds a normal recurring transaction affecting both account balance and SerenityLine", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("-100"),
            finalPaymentAmount: null,
            linkedCreditCardId: "",
            linkedBucketId: "",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            paymentAmount: "-100",
            finalPaymentAmount: null,
            linkedCreditCardId: null,
            linkedBucketId: null,
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: true,
        });
    });

    it("builds a credit card recurring transaction affecting only SerenityLine", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("-100"),
            finalPaymentAmount: null,
            linkedCreditCardId: "credit-card-id",
            linkedBucketId: "",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            paymentAmount: "-100",
            finalPaymentAmount: null,
            linkedCreditCardId: "credit-card-id",
            linkedBucketId: null,
            recurringTransactionAffectsAccountBalance: false,
            recurringtransactionAffectsSerenityline: true,
        });
    });

    it("builds a bucket transfer from a positive form amount", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("500"),
            finalPaymentAmount: null,
            linkedCreditCardId: "",
            linkedBucketId: "bucket-id",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            paymentAmount: "-500",
            finalPaymentAmount: null,
            linkedCreditCardId: null,
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: false,
            recurringtransactionAffectsSerenityline: true,
        });
    });

    it("builds a bucket payment from a negative form amount", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("-500"),
            finalPaymentAmount: null,
            linkedCreditCardId: "",
            linkedBucketId: "bucket-id",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            paymentAmount: "-500",
            finalPaymentAmount: null,
            linkedCreditCardId: null,
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: false,
        });
    });

    it("builds two recurring transactions when credit card and bucket are both selected", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("-500"),
            finalPaymentAmount: money("-450"),
            linkedCreditCardId: "credit-card-id",
            linkedBucketId: "bucket-id",
        });

        expect(requests).toHaveLength(2);

        expect(requests[0]).toMatchObject({
            paymentAmount: "-500",
            finalPaymentAmount: "-450",
            linkedCreditCardId: null,
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: false,
        });

        expect(requests[1]).toMatchObject({
            paymentAmount: "-500",
            finalPaymentAmount: "-450",
            linkedCreditCardId: "credit-card-id",
            linkedBucketId: null,
            recurringTransactionAffectsAccountBalance: false,
            recurringtransactionAffectsSerenityline: true,
        });
    });

    it("normalizes a positive final payment amount when a bucket is selected", () => {
        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount: money("500"),
            finalPaymentAmount: money("250"),
            linkedCreditCardId: "",
            linkedBucketId: "bucket-id",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            paymentAmount: "-500",
            finalPaymentAmount: "-250",
            linkedBucketId: "bucket-id",
            recurringTransactionAffectsAccountBalance: false,
            recurringtransactionAffectsSerenityline: true,
        });
    });
});

describe("isZeroMoneyAmount", () => {
    it("recognizes zero values", () => {
        expect(isZeroMoneyAmount(money("0"))).toBe(true);
        expect(isZeroMoneyAmount(money("0.00"))).toBe(true);
        expect(isZeroMoneyAmount(money("-0"))).toBe(true);
    });

    it("does not treat non-zero values as zero", () => {
        expect(isZeroMoneyAmount(money("0.01"))).toBe(false);
        expect(isZeroMoneyAmount(money("-0.01"))).toBe(false);
        expect(isZeroMoneyAmount(money("500"))).toBe(false);
    });
});

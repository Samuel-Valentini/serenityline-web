import { describe, expect, it } from "vitest";

import type { MoneyAmountInput } from "../api/financeApiTypes";
import {
    buildTransactionRequests,
    isZeroMoneyAmount,
    type TransactionBaseRequest,
} from "./transactionRequestBuilder";

const baseRequest: TransactionBaseRequest = {
    transactionDescription: "Movimento",
    categoryId: "category-id",
    transactionChargeDate: "2026-06-04",
    transactionIsConfirmed: true,
    accountId: "account-id",
    transactionIsSimulated: false,
    simulationGroupId: null,
    transactionReminderEnabled: false,
    transactionReminderDaysBefore: 7,
};

function money(value: string): MoneyAmountInput {
    return value as MoneyAmountInput;
}

describe("buildTransactionRequests", () => {
    it("builds a normal transaction affecting both account balance and SerenityLine", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("-100"),
            creditCardId: "",
            bucketId: "",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            transactionAmount: "-100",
            creditCardId: null,
            bucketId: null,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
        });
    });

    it("builds a credit card transaction affecting only SerenityLine", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("-100"),
            creditCardId: "credit-card-id",
            bucketId: "",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            transactionAmount: "-100",
            creditCardId: "credit-card-id",
            bucketId: null,
            transactionAffectsAccountBalance: false,
            transactionAffectsSerenityline: true,
        });
    });

    it("builds a bucket transfer from a positive form amount", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("500"),
            creditCardId: "",
            bucketId: "bucket-id",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionAffectsAccountBalance: false,
            transactionAffectsSerenityline: true,
        });
    });

    it("builds a bucket payment from a negative form amount", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("-500"),
            creditCardId: "",
            bucketId: "bucket-id",
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: false,
        });
    });

    it("builds two transactions when credit card and bucket are both selected", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("-500"),
            creditCardId: "credit-card-id",
            bucketId: "bucket-id",
        });

        expect(requests).toHaveLength(2);

        expect(requests[0]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: false,
        });

        expect(requests[1]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: "credit-card-id",
            bucketId: null,
            transactionAffectsAccountBalance: false,
            transactionAffectsSerenityline: true,
        });
    });

    it("normalizes a positive amount when credit card and bucket are both selected", () => {
        const requests = buildTransactionRequests({
            baseRequest,
            transactionAmount: money("500"),
            creditCardId: "credit-card-id",
            bucketId: "bucket-id",
        });

        expect(requests).toHaveLength(2);

        expect(requests[0]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: null,
            bucketId: "bucket-id",
            transactionAffectsAccountBalance: false,
            transactionAffectsSerenityline: true,
        });

        expect(requests[1]).toMatchObject({
            transactionAmount: "-500",
            creditCardId: "credit-card-id",
            bucketId: null,
            transactionAffectsAccountBalance: false,
            transactionAffectsSerenityline: true,
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

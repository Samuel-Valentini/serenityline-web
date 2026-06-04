import type {
    MoneyAmountInput,
    RecurringTransactionCreateRequestDto,
} from "../api/financeApiTypes";

export type RecurringTransactionBaseRequest = Omit<
    RecurringTransactionCreateRequestDto,
    | "paymentAmount"
    | "finalPaymentAmount"
    | "linkedCreditCardId"
    | "linkedBucketId"
    | "recurringTransactionAffectsAccountBalance"
    | "recurringtransactionAffectsSerenityline"
>;

function isNegativeMoneyAmount(value: MoneyAmountInput) {
    return value.startsWith("-");
}

export function isZeroMoneyAmount(value: MoneyAmountInput) {
    return Number(value) === 0;
}

function toNegativeAbsoluteMoneyAmount(
    value: MoneyAmountInput,
): MoneyAmountInput {
    return (value.startsWith("-") ? value : `-${value}`) as MoneyAmountInput;
}

function toNegativeAbsoluteMoneyAmountOrNull(
    value: MoneyAmountInput | null,
): MoneyAmountInput | null {
    return value ? toNegativeAbsoluteMoneyAmount(value) : null;
}

export function buildRecurringTransactionRequests({
    baseRequest,
    finalPaymentAmount,
    linkedBucketId,
    linkedCreditCardId,
    paymentAmount,
}: {
    baseRequest: RecurringTransactionBaseRequest;
    paymentAmount: MoneyAmountInput;
    finalPaymentAmount: MoneyAmountInput | null;
    linkedCreditCardId: string;
    linkedBucketId: string;
}): RecurringTransactionCreateRequestDto[] {
    const hasCreditCard = Boolean(linkedCreditCardId);
    const hasBucket = Boolean(linkedBucketId);

    if (hasCreditCard && hasBucket) {
        const isBucketPayment = isNegativeMoneyAmount(paymentAmount);

        return [
            {
                ...baseRequest,
                paymentAmount: toNegativeAbsoluteMoneyAmount(paymentAmount),
                finalPaymentAmount:
                    toNegativeAbsoluteMoneyAmountOrNull(finalPaymentAmount),
                linkedCreditCardId: null,
                linkedBucketId,
                recurringTransactionAffectsAccountBalance: isBucketPayment,
                recurringtransactionAffectsSerenityline: !isBucketPayment,
            },
            {
                ...baseRequest,
                paymentAmount: toNegativeAbsoluteMoneyAmount(paymentAmount),
                finalPaymentAmount:
                    toNegativeAbsoluteMoneyAmountOrNull(finalPaymentAmount),
                linkedCreditCardId,
                linkedBucketId: null,
                recurringTransactionAffectsAccountBalance: false,
                recurringtransactionAffectsSerenityline: true,
            },
        ];
    }

    if (hasCreditCard) {
        return [
            {
                ...baseRequest,
                paymentAmount,
                finalPaymentAmount,
                linkedCreditCardId,
                linkedBucketId: null,
                recurringTransactionAffectsAccountBalance: false,
                recurringtransactionAffectsSerenityline: true,
            },
        ];
    }

    if (hasBucket) {
        const isBucketPayment = isNegativeMoneyAmount(paymentAmount);

        return [
            {
                ...baseRequest,
                paymentAmount: toNegativeAbsoluteMoneyAmount(paymentAmount),
                finalPaymentAmount:
                    toNegativeAbsoluteMoneyAmountOrNull(finalPaymentAmount),
                linkedCreditCardId: null,
                linkedBucketId,
                recurringTransactionAffectsAccountBalance: isBucketPayment,
                recurringtransactionAffectsSerenityline: !isBucketPayment,
            },
        ];
    }

    return [
        {
            ...baseRequest,
            paymentAmount,
            finalPaymentAmount,
            linkedCreditCardId: null,
            linkedBucketId: null,
            recurringTransactionAffectsAccountBalance: true,
            recurringtransactionAffectsSerenityline: true,
        },
    ];
}

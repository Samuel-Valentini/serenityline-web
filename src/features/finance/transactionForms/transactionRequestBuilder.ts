import type {
    MoneyAmountInput,
    TransactionCreateRequestDto,
} from "../api/financeApiTypes";

export type TransactionBaseRequest = Omit<
    TransactionCreateRequestDto,
    | "transactionAmount"
    | "creditCardId"
    | "bucketId"
    | "transactionAffectsAccountBalance"
    | "transactionAffectsSerenityline"
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

export function buildTransactionRequests({
    baseRequest,
    bucketId,
    creditCardId,
    transactionAmount,
}: {
    baseRequest: TransactionBaseRequest;
    transactionAmount: MoneyAmountInput;
    creditCardId: string;
    bucketId: string;
}): TransactionCreateRequestDto[] {
    const hasCreditCard = Boolean(creditCardId);
    const hasBucket = Boolean(bucketId);

    if (hasCreditCard && hasBucket) {
        const isBucketPayment = isNegativeMoneyAmount(transactionAmount);

        return [
            {
                ...baseRequest,
                transactionAmount:
                    toNegativeAbsoluteMoneyAmount(transactionAmount),
                creditCardId: null,
                bucketId,
                transactionAffectsAccountBalance: isBucketPayment,
                transactionAffectsSerenityline: !isBucketPayment,
            },
            {
                ...baseRequest,
                transactionAmount:
                    toNegativeAbsoluteMoneyAmount(transactionAmount),
                creditCardId,
                bucketId: null,
                transactionAffectsAccountBalance: false,
                transactionAffectsSerenityline: true,
            },
        ];
    }

    if (hasCreditCard) {
        return [
            {
                ...baseRequest,
                transactionAmount,
                creditCardId,
                bucketId: null,
                transactionAffectsAccountBalance: false,
                transactionAffectsSerenityline: true,
            },
        ];
    }

    if (hasBucket) {
        const isBucketPayment = isNegativeMoneyAmount(transactionAmount);

        return [
            {
                ...baseRequest,
                transactionAmount:
                    toNegativeAbsoluteMoneyAmount(transactionAmount),
                creditCardId: null,
                bucketId,
                transactionAffectsAccountBalance: isBucketPayment,
                transactionAffectsSerenityline: !isBucketPayment,
            },
        ];
    }

    return [
        {
            ...baseRequest,
            transactionAmount,
            creditCardId: null,
            bucketId: null,
            transactionAffectsAccountBalance: true,
            transactionAffectsSerenityline: true,
        },
    ];
}

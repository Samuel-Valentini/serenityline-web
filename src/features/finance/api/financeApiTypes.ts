export type Uuid = string;
export type IsoDate = string;
export type IsoDateTime = string;
export type MoneyAmount = number;

export type AccountResponseDto = {
    accountId: Uuid;
    accountName: string;
    accountDescription: string | null;
    currency: string;
    issuingInstitution: string | null;
    openingBalance: MoneyAmount | null;
    openingBalanceDate: IsoDate;
    userGroupId: Uuid;
    accountCreatedAt: IsoDateTime;
    accountUpdatedAt: IsoDateTime;
};

export type CreateAccountRequestDto = {
    accountName: string;
    accountDescription?: string | null;
    currency: string;
    issuingInstitution?: string | null;
    openingBalance?: MoneyAmount | null;
    openingBalanceDate: IsoDate;
};

export type UpdateAccountRequestDto = {
    accountName?: string | null;
    accountDescription?: string | null;
    issuingInstitution?: string | null;
    openingBalance?: MoneyAmount | null;
    openingBalanceDate?: IsoDate | null;
};

export type CategoryResponseDto = {
    categoryId: Uuid;
    categoryName: string;
    categoryDescription: string | null;
    active: boolean;
};

export type CategoryCreateRequestDto = {
    categoryName: string;
    categoryDescription?: string | null;
};

export type CategoryUpdateRequestDto = {
    categoryName: string;
    categoryDescription?: string | null;
};

export type BucketStatusFilter = "ACTIVE" | "CLOSED" | "ALL";

export type BucketResponseDto = {
    bucketId: Uuid;
    bucketName: string | null;
    bucketDescription: string | null;
    accountIds: Uuid[];
    userGroupId: Uuid;
    bucketCreatedAt: IsoDateTime;
    bucketUpdatedAt: IsoDateTime;
    bucketClosedAt: IsoDateTime | null;
};

export type CreateBucketRequestDto = {
    bucketName?: string | null;
    bucketDescription?: string | null;
    accountIds?: Uuid[] | null;
};

export type UpdateBucketRequestDto = {
    bucketName?: string | null;
    bucketDescription?: string | null;
};

export type FindBucketsRequestDto = {
    status?: BucketStatusFilter;
};

export type TransactionResponseDto = {
    transactionId: Uuid;
    transactionDescription: string;
    transactionAmount: MoneyAmount;
    transactionAffectsAccountBalance: boolean;
    transactionAffectsSerenityline: boolean;
    categoryId: Uuid;
    transactionChargeDate: IsoDate;
    transactionIsConfirmed: boolean;
    accountId: Uuid;
    creditCardId: Uuid | null;
    bucketId: Uuid | null;
    transactionIsSimulated: boolean;
    simulationGroupId: Uuid | null;
    transactionIsUserEntered: boolean;
    recurringTransactionId: Uuid | null;
    recurringTransactionLogicalDate: IsoDate | null;
    recurringTransactionConfirmedAt: IsoDateTime | null;
    transactionReminderEnabled: boolean;
    transactionReminderDaysBefore: number;
    transactionCreatedAt: IsoDateTime;
    transactionUpdatedAt: IsoDateTime;
};

export type TransactionCreateRequestDto = {
    transactionDescription: string;
    transactionAmount: MoneyAmount;
    transactionAffectsAccountBalance?: boolean | null;
    transactionAffectsSerenityline?: boolean | null;
    categoryId: Uuid;
    transactionChargeDate: IsoDate;
    transactionIsConfirmed?: boolean | null;
    accountId: Uuid;
    creditCardId?: Uuid | null;
    bucketId?: Uuid | null;
    transactionIsSimulated?: boolean | null;
    simulationGroupId?: Uuid | null;
    transactionReminderEnabled?: boolean | null;
    transactionReminderDaysBefore?: number | null;
};

export type TransactionUpdateRequestDto = {
    transactionDescription: string;
    transactionAmount: MoneyAmount;
    transactionAffectsAccountBalance: boolean;
    transactionAffectsSerenityline: boolean;
    categoryId: Uuid;
    transactionChargeDate: IsoDate;
    transactionIsConfirmed: boolean;
    accountId: Uuid;
    creditCardId?: Uuid | null;
    bucketId?: Uuid | null;
    transactionIsSimulated: boolean;
    simulationGroupId?: Uuid | null;
    transactionReminderEnabled: boolean;
    transactionReminderDaysBefore: number;
};

export type FindTransactionsRequestDto = {
    from?: IsoDate;
    to?: IsoDate;
    accountId?: Uuid;
    simulationGroupId?: Uuid;
};

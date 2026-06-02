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

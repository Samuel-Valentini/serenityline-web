import { apiRequest } from "../../../shared/api";
import type {
    AccountResponseDto,
    BucketResponseDto,
    CategoryCreateRequestDto,
    CategoryResponseDto,
    CreateAccountRequestDto,
    CreateBucketRequestDto,
    FindBucketsRequestDto,
    UpdateAccountRequestDto,
    UpdateBucketRequestDto,
    CategoryUpdateRequestDto,
    Uuid,
} from "./financeApiTypes";

function encodePathSegment(value: string): string {
    return encodeURIComponent(value);
}

function buildBucketQuery(request?: FindBucketsRequestDto): string {
    if (!request?.status) {
        return "";
    }

    const params = new URLSearchParams({
        status: request.status,
    });

    return `?${params.toString()}`;
}

export async function getAccounts(): Promise<AccountResponseDto[]> {
    return apiRequest<AccountResponseDto[]>("/api/finance/accounts");
}

export async function getAccount(accountId: Uuid): Promise<AccountResponseDto> {
    return apiRequest<AccountResponseDto>(
        `/api/finance/accounts/${encodePathSegment(accountId)}`,
    );
}

export async function createAccount(
    request: CreateAccountRequestDto,
): Promise<AccountResponseDto> {
    return apiRequest<AccountResponseDto>("/api/finance/accounts", {
        method: "POST",
        body: request,
    });
}

export async function updateAccount(
    accountId: Uuid,
    request: UpdateAccountRequestDto,
): Promise<AccountResponseDto> {
    return apiRequest<AccountResponseDto>(
        `/api/finance/accounts/${encodePathSegment(accountId)}`,
        {
            method: "PATCH",
            body: request,
        },
    );
}

export async function grantAccountAccess(
    accountId: Uuid,
    targetUserId: Uuid,
): Promise<void> {
    return apiRequest<void>(
        `/api/finance/accounts/${encodePathSegment(
            accountId,
        )}/users/${encodePathSegment(targetUserId)}`,
        {
            method: "POST",
        },
    );
}

export async function revokeAccountAccess(
    accountId: Uuid,
    targetUserId: Uuid,
): Promise<void> {
    return apiRequest<void>(
        `/api/finance/accounts/${encodePathSegment(
            accountId,
        )}/users/${encodePathSegment(targetUserId)}`,
        {
            method: "DELETE",
        },
    );
}

export async function listCategories(): Promise<CategoryResponseDto[]> {
    return apiRequest<CategoryResponseDto[]>("/api/finance/categories");
}

export async function createCategory(
    request: CategoryCreateRequestDto,
): Promise<CategoryResponseDto> {
    return apiRequest<CategoryResponseDto>("/api/finance/categories", {
        method: "POST",
        body: request,
    });
}

export async function updateCategory(
    categoryId: Uuid,
    request: CategoryUpdateRequestDto,
): Promise<CategoryResponseDto> {
    return apiRequest<CategoryResponseDto>(
        `/api/finance/categories/${encodePathSegment(categoryId)}`,
        {
            method: "PUT",
            body: request,
        },
    );
}

export async function deactivateCategory(
    categoryId: Uuid,
): Promise<CategoryResponseDto> {
    return apiRequest<CategoryResponseDto>(
        `/api/finance/categories/${encodePathSegment(categoryId)}/deactivate`,
        {
            method: "POST",
        },
    );
}

export async function reactivateCategory(
    categoryId: Uuid,
): Promise<CategoryResponseDto> {
    return apiRequest<CategoryResponseDto>(
        `/api/finance/categories/${encodePathSegment(categoryId)}/reactivate`,
        {
            method: "POST",
        },
    );
}

export async function findBuckets(
    request?: FindBucketsRequestDto,
): Promise<BucketResponseDto[]> {
    return apiRequest<BucketResponseDto[]>(
        `/api/finance/buckets${buildBucketQuery(request)}`,
    );
}

export async function findBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}`,
    );
}

export async function createBucket(
    request: CreateBucketRequestDto,
): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>("/api/finance/buckets", {
        method: "POST",
        body: request,
    });
}

export async function updateBucket(
    bucketId: Uuid,
    request: UpdateBucketRequestDto,
): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}`,
        {
            method: "PATCH",
            body: request,
        },
    );
}

export async function linkBucketAccount(
    bucketId: Uuid,
    accountId: Uuid,
): Promise<void> {
    return apiRequest<void>(
        `/api/finance/buckets/${encodePathSegment(
            bucketId,
        )}/accounts/${encodePathSegment(accountId)}`,
        {
            method: "POST",
        },
    );
}

export async function unlinkBucketAccount(
    bucketId: Uuid,
    accountId: Uuid,
): Promise<void> {
    return apiRequest<void>(
        `/api/finance/buckets/${encodePathSegment(
            bucketId,
        )}/accounts/${encodePathSegment(accountId)}`,
        {
            method: "DELETE",
        },
    );
}

export async function closeBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}/close`,
        {
            method: "POST",
        },
    );
}

export async function reopenBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}/reopen`,
        {
            method: "POST",
        },
    );
}
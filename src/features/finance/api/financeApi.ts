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
    FindTransactionsRequestDto,
    TransactionCreateRequestDto,
    TransactionResponseDto,
    TransactionUpdateRequestDto,
    FindRecurringTransactionsRequestDto,
    RecurringTransactionCreateRequestDto,
    RecurringTransactionDeleteRequestDto,
    RecurringTransactionHistoryResponseDto,
    RecurringTransactionOccurrenceConfirmRequestDto,
    RecurringTransactionPatchRequestDto,
    RecurringTransactionResponseDto,
    CreditCardResponseDto,
    CreateCreditCardRequestDto,
    UpdateCreditCardRequestDto,
    FindSimulationGroupsRequestDto,
    FinancialPriorityResponseDto,
    SimulationGroupCreateRequestDto,
    SimulationGroupResponseDto,
    SimulationGroupUpdateRequestDto,
    FinanceCalendarDailyBalanceResponseDto,
    FinanceCalendarMovementResponseDto,
    FinanceCalendarSearchRequestDto,
    FinanceReportSummaryRequestDto,
    FinanceReportSummaryResponseDto,
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

function buildTransactionQuery(request?: FindTransactionsRequestDto): string {
    const params = new URLSearchParams();

    if (request?.from) {
        params.set("from", request.from);
    }

    if (request?.to) {
        params.set("to", request.to);
    }

    if (request?.accountId) {
        params.set("accountId", request.accountId);
    }

    if (request?.simulationGroupId) {
        params.set("simulationGroupId", request.simulationGroupId);
    }

    const query = params.toString();

    return query ? `?${query}` : "";
}

function buildRecurringTransactionQuery(
    request?: FindRecurringTransactionsRequestDto,
): string {
    const params = new URLSearchParams();

    if (request?.accountId) {
        params.set("accountId", request.accountId);
    }

    request?.simulationGroupIds?.forEach((simulationGroupId) => {
        params.append("simulationGroupIds", simulationGroupId);
    });

    const query = params.toString();

    return query ? `?${query}` : "";
}

function buildSimulationGroupQuery(
    request?: FindSimulationGroupsRequestDto,
): string {
    if (!request?.status) {
        return "";
    }

    const params = new URLSearchParams({
        status: request.status,
    });

    return `?${params.toString()}`;
}

function appendRepeatedParams(
    params: URLSearchParams,
    name: string,
    values?: string[],
) {
    values?.forEach((value) => {
        params.append(name, value);
    });
}

function buildCalendarSearchQuery(
    request?: FinanceCalendarSearchRequestDto,
): string {
    const params = new URLSearchParams();

    if (request?.from) {
        params.set("from", request.from);
    }

    if (request?.to) {
        params.set("to", request.to);
    }

    appendRepeatedParams(params, "accountIds", request?.accountIds);
    appendRepeatedParams(
        params,
        "simulationGroupIds",
        request?.simulationGroupIds,
    );

    const query = params.toString();

    return query ? `?${query}` : "";
}

function buildFinanceReportSummaryQuery(
    request?: FinanceReportSummaryRequestDto,
): string {
    const params = new URLSearchParams();

    appendRepeatedParams(params, "accountIds", request?.accountIds);
    appendRepeatedParams(
        params,
        "simulationGroupIds",
        request?.simulationGroupIds,
    );

    const query = params.toString();

    return query ? `?${query}` : "";
}

export async function getAccounts(): Promise<AccountResponseDto[]> {
    return apiRequest<AccountResponseDto[]>("/api/finance/accounts", {
        requiresAuth: true,
    });
}

export async function getAccount(accountId: Uuid): Promise<AccountResponseDto> {
    return apiRequest<AccountResponseDto>(
        `/api/finance/accounts/${encodePathSegment(accountId)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createAccount(
    request: CreateAccountRequestDto,
): Promise<AccountResponseDto> {
    return apiRequest<AccountResponseDto>("/api/finance/accounts", {
        method: "POST",
        body: request,
        requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
        },
    );
}

export async function listCategories(): Promise<CategoryResponseDto[]> {
    return apiRequest<CategoryResponseDto[]>("/api/finance/categories", {
        requiresAuth: true,
    });
}

export async function createCategory(
    request: CategoryCreateRequestDto,
): Promise<CategoryResponseDto> {
    return apiRequest<CategoryResponseDto>("/api/finance/categories", {
        method: "POST",
        body: request,
        requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
        },
    );
}

export async function findBuckets(
    request?: FindBucketsRequestDto,
): Promise<BucketResponseDto[]> {
    return apiRequest<BucketResponseDto[]>(
        `/api/finance/buckets${buildBucketQuery(request)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function findBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createBucket(
    request: CreateBucketRequestDto,
): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>("/api/finance/buckets", {
        method: "POST",
        body: request,
        requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
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
            requiresAuth: true,
        },
    );
}

export async function closeBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}/close`,
        {
            method: "POST",
            requiresAuth: true,
        },
    );
}

export async function reopenBucket(bucketId: Uuid): Promise<BucketResponseDto> {
    return apiRequest<BucketResponseDto>(
        `/api/finance/buckets/${encodePathSegment(bucketId)}/reopen`,
        {
            method: "POST",
            requiresAuth: true,
        },
    );
}

export async function listTransactions(
    request?: FindTransactionsRequestDto,
): Promise<TransactionResponseDto[]> {
    return apiRequest<TransactionResponseDto[]>(
        `/api/finance/transactions${buildTransactionQuery(request)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function getTransaction(
    transactionId: Uuid,
): Promise<TransactionResponseDto> {
    return apiRequest<TransactionResponseDto>(
        `/api/finance/transactions/${encodePathSegment(transactionId)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createTransaction(
    request: TransactionCreateRequestDto,
): Promise<TransactionResponseDto> {
    return apiRequest<TransactionResponseDto>("/api/finance/transactions", {
        method: "POST",
        body: request,
        requiresAuth: true,
    });
}

export async function updateTransaction(
    transactionId: Uuid,
    request: TransactionUpdateRequestDto,
): Promise<TransactionResponseDto> {
    return apiRequest<TransactionResponseDto>(
        `/api/finance/transactions/${encodePathSegment(transactionId)}`,
        {
            method: "PUT",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function deleteTransaction(transactionId: Uuid): Promise<void> {
    return apiRequest<void>(
        `/api/finance/transactions/${encodePathSegment(transactionId)}`,
        {
            method: "DELETE",
            requiresAuth: true,
        },
    );
}

export async function listRecurringTransactions(
    request?: FindRecurringTransactionsRequestDto,
): Promise<RecurringTransactionResponseDto[]> {
    return apiRequest<RecurringTransactionResponseDto[]>(
        `/api/finance/recurring-transactions${buildRecurringTransactionQuery(
            request,
        )}`,
        {
            requiresAuth: true,
        },
    );
}

export async function getRecurringTransaction(
    recurringTransactionId: Uuid,
): Promise<RecurringTransactionResponseDto> {
    return apiRequest<RecurringTransactionResponseDto>(
        `/api/finance/recurring-transactions/${encodePathSegment(
            recurringTransactionId,
        )}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createRecurringTransaction(
    request: RecurringTransactionCreateRequestDto,
): Promise<RecurringTransactionResponseDto> {
    return apiRequest<RecurringTransactionResponseDto>(
        "/api/finance/recurring-transactions",
        {
            method: "POST",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function patchRecurringTransaction(
    recurringTransactionId: Uuid,
    request: RecurringTransactionPatchRequestDto,
): Promise<RecurringTransactionResponseDto> {
    return apiRequest<RecurringTransactionResponseDto>(
        `/api/finance/recurring-transactions/${encodePathSegment(
            recurringTransactionId,
        )}`,
        {
            method: "PATCH",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function deleteRecurringTransaction(
    recurringTransactionId: Uuid,
    request?: RecurringTransactionDeleteRequestDto,
): Promise<void> {
    return apiRequest<void>(
        `/api/finance/recurring-transactions/${encodePathSegment(
            recurringTransactionId,
        )}`,
        {
            method: "DELETE",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function getRecurringTransactionHistory(
    recurringTransactionId: Uuid,
): Promise<RecurringTransactionHistoryResponseDto> {
    return apiRequest<RecurringTransactionHistoryResponseDto>(
        `/api/finance/recurring-transactions/${encodePathSegment(
            recurringTransactionId,
        )}/history`,
        {
            requiresAuth: true,
        },
    );
}

export async function confirmRecurringTransactionOccurrence(
    recurringTransactionId: Uuid,
    request: RecurringTransactionOccurrenceConfirmRequestDto,
): Promise<TransactionResponseDto> {
    return apiRequest<TransactionResponseDto>(
        `/api/finance/recurring-transactions/${encodePathSegment(
            recurringTransactionId,
        )}/occurrences/confirm`,
        {
            method: "POST",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function listCreditCards(): Promise<CreditCardResponseDto[]> {
    return apiRequest<CreditCardResponseDto[]>("/api/finance/credit-cards", {
        requiresAuth: true,
    });
}

export async function getCreditCard(
    creditCardId: Uuid,
): Promise<CreditCardResponseDto> {
    return apiRequest<CreditCardResponseDto>(
        `/api/finance/credit-cards/${encodePathSegment(creditCardId)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createCreditCard(
    request: CreateCreditCardRequestDto,
): Promise<CreditCardResponseDto> {
    return apiRequest<CreditCardResponseDto>("/api/finance/credit-cards", {
        method: "POST",
        body: request,
        requiresAuth: true,
    });
}

export async function updateCreditCard(
    creditCardId: Uuid,
    request: UpdateCreditCardRequestDto,
): Promise<CreditCardResponseDto> {
    return apiRequest<CreditCardResponseDto>(
        `/api/finance/credit-cards/${encodePathSegment(creditCardId)}`,
        {
            method: "PATCH",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function deleteCreditCard(creditCardId: Uuid): Promise<void> {
    return apiRequest<void>(
        `/api/finance/credit-cards/${encodePathSegment(creditCardId)}`,
        {
            method: "DELETE",
            requiresAuth: true,
        },
    );
}

export async function findSimulationGroups(
    request?: FindSimulationGroupsRequestDto,
): Promise<SimulationGroupResponseDto[]> {
    return apiRequest<SimulationGroupResponseDto[]>(
        `/api/finance/simulation-groups${buildSimulationGroupQuery(request)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function findSimulationGroup(
    simulationGroupId: Uuid,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}`,
        {
            requiresAuth: true,
        },
    );
}

export async function createSimulationGroup(
    request: SimulationGroupCreateRequestDto,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        "/api/finance/simulation-groups",
        {
            method: "POST",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function updateSimulationGroup(
    simulationGroupId: Uuid,
    request: SimulationGroupUpdateRequestDto,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}`,
        {
            method: "PATCH",
            body: request,
            requiresAuth: true,
        },
    );
}

export async function archiveSimulationGroup(
    simulationGroupId: Uuid,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}/archive`,
        {
            method: "POST",
            requiresAuth: true,
        },
    );
}

export async function restoreSimulationGroup(
    simulationGroupId: Uuid,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}/restore`,
        {
            method: "POST",
            requiresAuth: true,
        },
    );
}

export async function linkSimulationGroupAccount(
    simulationGroupId: Uuid,
    accountId: Uuid,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}/accounts/${encodePathSegment(accountId)}`,
        {
            method: "POST",
            requiresAuth: true,
        },
    );
}

export async function unlinkSimulationGroupAccount(
    simulationGroupId: Uuid,
    accountId: Uuid,
): Promise<SimulationGroupResponseDto> {
    return apiRequest<SimulationGroupResponseDto>(
        `/api/finance/simulation-groups/${encodePathSegment(
            simulationGroupId,
        )}/accounts/${encodePathSegment(accountId)}`,
        {
            method: "DELETE",
            requiresAuth: true,
        },
    );
}

export async function listFinancialPriorities(): Promise<
    FinancialPriorityResponseDto[]
> {
    return apiRequest<FinancialPriorityResponseDto[]>(
        "/api/finance/financial-priorities",
        {
            requiresAuth: true,
        },
    );
}

export async function listCalendarMovements(
    request?: FinanceCalendarSearchRequestDto,
): Promise<FinanceCalendarMovementResponseDto[]> {
    return apiRequest<FinanceCalendarMovementResponseDto[]>(
        `/api/finance/calendar${buildCalendarSearchQuery(request)}`,
        {
            requiresAuth: true,
        },
    );
}

export async function listDailyBalances(
    request?: FinanceCalendarSearchRequestDto,
): Promise<FinanceCalendarDailyBalanceResponseDto[]> {
    return apiRequest<FinanceCalendarDailyBalanceResponseDto[]>(
        `/api/finance/calendar/daily-balances${buildCalendarSearchQuery(
            request,
        )}`,
        {
            requiresAuth: true,
        },
    );
}

export async function getFinanceReportSummary(
    request?: FinanceReportSummaryRequestDto,
): Promise<FinanceReportSummaryResponseDto> {
    return apiRequest<FinanceReportSummaryResponseDto>(
        `/api/finance/reports/summary${buildFinanceReportSummaryQuery(
            request,
        )}`,
        {
            requiresAuth: true,
        },
    );
}

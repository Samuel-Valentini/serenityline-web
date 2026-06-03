import type { AppDispatch } from "../../app/store/store";
import { ApiError } from "../../shared/api";
import {
    findBuckets,
    findSimulationGroups,
    getAccounts,
    listCategories,
    listCreditCards,
    listFinancialPriorities,
} from "./api/financeApi";
import {
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "./financeDataSlice";
import { loadFinanceReferenceData } from "./financeDataThunks";
import { describe, expect, it, vi } from "vitest";
import type { CreditCardResponseDto } from "./api/financeApiTypes";

vi.mock("./api/financeApi", () => ({
    findBuckets: vi.fn(),
    findSimulationGroups: vi.fn(),
    getAccounts: vi.fn(),
    listCategories: vi.fn(),
    listCreditCards: vi.fn(),
    listFinancialPriorities: vi.fn(),
}));

function createDispatch() {
    const actions: unknown[] = [];
    const dispatch = vi.fn((action: unknown) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;

    return {
        actions,
        dispatch,
    };
}

describe("financeDataThunks", () => {
    it("loads finance reference data", async () => {
        const accounts = [
            {
                accountId: "account-id",
                accountName: "Conto principale",
                accountDescription: null,
                currency: "EUR",
                issuingInstitution: null,
                openingBalance: 1000,
                openingBalanceDate: "2026-01-01",
                userGroupId: "group-id",
                accountCreatedAt: "2026-01-01T00:00:00Z",
                accountUpdatedAt: "2026-01-01T00:00:00Z",
            },
        ];

        const creditCards: CreditCardResponseDto[] = [];

        const categories = [
            {
                categoryId: "category-id",
                categoryName: "Casa",
                categoryDescription: null,
                active: true,
            },
        ];

        const buckets = [
            {
                bucketId: "bucket-id",
                bucketName: "Essenziali",
                bucketDescription: null,
                accountIds: ["account-id"],
                userGroupId: "group-id",
                bucketCreatedAt: "2026-01-01T00:00:00Z",
                bucketUpdatedAt: "2026-01-01T00:00:00Z",
                bucketClosedAt: null,
            },
        ];

        const simulationGroups = [
            {
                simulationGroupId: "simulation-group-id",
                simulationGroupName: "Scenario base",
                simulationGroupDescription: null,
                simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
                simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
                simulationGroupArchivedAt: null,
                accountIds: ["account-id"],
            },
        ];

        const financialPriorities = [
            {
                financialPriorityId: "priority-id",
                financialPriorityCode: "ESSENTIAL" as const,
                financialPriorityDisplayName: "Essenziale",
                financialPriorityDescription: "Spese essenziali",
                financialPriorityRanking: 2,
            },
        ];

        vi.mocked(getAccounts).mockResolvedValueOnce(accounts);
        vi.mocked(listCreditCards).mockResolvedValueOnce(creditCards);
        vi.mocked(listCategories).mockResolvedValueOnce(categories);
        vi.mocked(findBuckets).mockResolvedValueOnce(buckets);
        vi.mocked(findSimulationGroups).mockResolvedValueOnce(simulationGroups);
        vi.mocked(listFinancialPriorities).mockResolvedValueOnce(
            financialPriorities,
        );

        const { actions, dispatch } = createDispatch();

        await loadFinanceReferenceData()(dispatch, vi.fn());

        expect(findBuckets).toHaveBeenCalledWith({ status: "ACTIVE" });
        expect(findSimulationGroups).toHaveBeenCalledWith({
            status: "ACTIVE",
        });

        expect(actions).toEqual([
            financeReferenceDataLoadingStarted(),
            financeReferenceDataLoaded({
                accounts,
                creditCards,
                categories,
                buckets,
                simulationGroups,
                financialPriorities,
            }),
        ]);
    });

    it("dispatches a typed error when finance reference data loading fails", async () => {
        vi.mocked(getAccounts).mockRejectedValueOnce(
            new ApiError(500, {
                code: "finance.error",
                message: "Finance error",
            }),
        );
        vi.mocked(listCreditCards).mockResolvedValueOnce([]);
        vi.mocked(listCategories).mockResolvedValueOnce([]);
        vi.mocked(findBuckets).mockResolvedValueOnce([]);
        vi.mocked(findSimulationGroups).mockResolvedValueOnce([]);
        vi.mocked(listFinancialPriorities).mockResolvedValueOnce([]);

        const { actions, dispatch } = createDispatch();

        await loadFinanceReferenceData()(dispatch, vi.fn());

        expect(actions).toEqual([
            financeReferenceDataLoadingStarted(),
            financeReferenceDataLoadingFailed({
                code: "finance.error",
                message: "Finance error",
            }),
        ]);
    });
});

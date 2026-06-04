import type {
    AccountResponseDto,
    BucketResponseDto,
    CategoryResponseDto,
    FinancialPriorityResponseDto,
    SimulationGroupResponseDto,
    CreditCardResponseDto,
    FinanceReportSummaryResponseDto,
} from "./api/financeApiTypes";

export type FinanceDataStatus = "idle" | "loading" | "loaded" | "failed";

export type FinanceDataError = {
    code: string;
    message?: string;
};

export type FinanceReferenceData = {
    accounts: AccountResponseDto[];
    creditCards: CreditCardResponseDto[];
    categories: CategoryResponseDto[];
    buckets: BucketResponseDto[];
    simulationGroups: SimulationGroupResponseDto[];
    financialPriorities: FinancialPriorityResponseDto[];
};

export type FinanceDataState = FinanceReferenceData & {
    status: FinanceDataStatus;
    error: FinanceDataError | null;
    financeReportSummary: FinanceReportSummaryResponseDto | null;
};

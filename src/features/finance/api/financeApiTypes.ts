export type Uuid = string;
export type IsoDate = string;
export type IsoDateTime = string;
export type MoneyAmount = number;
export type MoneyAmountInput = string;
export type FinancialPriorityCode =
    | "CRITICAL"
    | "ESSENTIAL"
    | "OPTIONAL"
    | "LEISURE_WELLBEING"
    | "UNCLASSIFIED";

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
    openingBalance?: MoneyAmountInput | null;
    openingBalanceDate: IsoDate;
};

export type UpdateAccountRequestDto = {
    accountName?: string | null;
    accountDescription?: string | null;
    issuingInstitution?: string | null;
    openingBalance?: MoneyAmountInput | null;
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
    transactionAmount: MoneyAmountInput;
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
    transactionAmount: MoneyAmountInput;
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

export type RecurrenceUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type PaymentDateAdjustmentPolicy =
    | "NONE"
    | "PREVIOUS_BUSINESS_DAY"
    | "NEXT_BUSINESS_DAY";

export type RecurringTransactionResponseDto = {
    recurringTransactionId: Uuid;

    recurringTransactionAmountIsAdjustable: boolean;
    recurringTransactionFirstPaymentDate: IsoDate;
    recurringTransactionIsSimulated: boolean;
    simulationGroupId: Uuid | null;
    recurringTransactionReminderEnabled: boolean;
    recurringTransactionReminderDaysBefore: number;
    recurringTransactionCreatedAt: IsoDateTime;
    recurringTransactionUpdatedAt: IsoDateTime;

    recurringTransactionHistoryId: Uuid;
    effectiveFrom: IsoDate;
    effectiveTo: IsoDate | null;
    dayOfUnit: number;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
    paymentDateAdjustmentPolicy: PaymentDateAdjustmentPolicy;
    paymentAmount: MoneyAmount;
    recurringTransactionEndDate: IsoDate | null;
    finalPaymentAmount: MoneyAmount | null;

    recurringTransactionDetailsHistoryId: Uuid;
    recurringTransactionDescription: string;
    categoryId: Uuid;
    financialPriorityId: Uuid;
    linkedAccountId: Uuid;
    linkedCreditCardId: Uuid | null;
    linkedBucketId: Uuid | null;
    recurringTransactionAffectsAccountBalance: boolean;
    recurringtransactionAffectsSerenityline: boolean;
    recurringTransactionDetailsEffectiveFrom: IsoDate;
};

export type RecurringTransactionCreateRequestDto = {
    recurringTransactionDescription: string;
    paymentAmount: MoneyAmountInput;
    recurringTransactionAmountIsAdjustable?: boolean | null;
    recurringTransactionFirstPaymentDate: IsoDate;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
    paymentDateAdjustmentPolicy?: PaymentDateAdjustmentPolicy | null;
    recurringTransactionEndDate?: IsoDate | null;
    finalPaymentAmount?: MoneyAmountInput | null;
    categoryId: Uuid;
    financialPriorityId: Uuid;
    linkedAccountId: Uuid;
    linkedCreditCardId?: Uuid | null;
    linkedBucketId?: Uuid | null;
    recurringTransactionAffectsAccountBalance?: boolean | null;
    recurringtransactionAffectsSerenityline?: boolean | null;
    recurringTransactionIsSimulated?: boolean | null;
    simulationGroupId?: Uuid | null;
    recurringTransactionReminderEnabled?: boolean | null;
    recurringTransactionReminderDaysBefore?: number | null;
};

export type RecurringTransactionRulePatchRequestDto = {
    effectiveFrom?: IsoDate;
    effectiveTo?: IsoDate | null;
    dayOfUnit?: number;
    paymentAmount?: MoneyAmountInput;
    recurrenceInterval?: number;
    recurrenceUnit?: RecurrenceUnit;
    paymentDateAdjustmentPolicy?: PaymentDateAdjustmentPolicy;
    recurringTransactionEndDate?: IsoDate | null;
    finalPaymentAmount?: MoneyAmountInput | null;
};

export type RecurringTransactionDetailsPatchRequestDto = {
    effectiveFrom?: IsoDate;
    recurringTransactionDescription?: string;
    categoryId?: Uuid;
    financialPriorityId?: Uuid;
    linkedAccountId?: Uuid;
    linkedCreditCardId?: Uuid | null;
    linkedBucketId?: Uuid | null;
    recurringTransactionAffectsAccountBalance?: boolean;
    recurringtransactionAffectsSerenityline?: boolean;
};

export type RecurringTransactionPatchRequestDto = {
    recurringTransactionFirstPaymentDate?: IsoDate;
    recurringTransactionAmountIsAdjustable?: boolean;
    recurringTransactionIsSimulated?: boolean;
    simulationGroupId?: Uuid | null;
    recurringTransactionReminderEnabled?: boolean;
    recurringTransactionReminderDaysBefore?: number;
    rule?: RecurringTransactionRulePatchRequestDto;
    details?: RecurringTransactionDetailsPatchRequestDto;
};

export type RecurringTransactionDeleteRequestDto = {
    endDate?: IsoDate;
    finalPaymentAmount?: MoneyAmountInput | null;
};

export type RecurringTransactionOccurrenceConfirmRequestDto = {
    logicalDate?: IsoDate | null;
    transactionAmount?: MoneyAmountInput | null;
    transactionChargeDate?: IsoDate | null;
};

export type FindRecurringTransactionsRequestDto = {
    accountId?: Uuid;
    simulationGroupIds?: Uuid[];
};

export type RecurringTransactionRuleHistoryItemResponseDto = {
    recurringTransactionHistoryId: Uuid;
    effectiveFrom: IsoDate;
    effectiveTo: IsoDate | null;
    dayOfUnit: number;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
    paymentDateAdjustmentPolicy: PaymentDateAdjustmentPolicy;
    paymentAmount: MoneyAmount;
    recurringTransactionEndDate: IsoDate | null;
    finalPaymentAmount: MoneyAmount | null;
    createdAt: IsoDateTime;
};

export type RecurringTransactionDetailsHistoryItemResponseDto = {
    recurringTransactionDetailsHistoryId: Uuid;
    effectiveFrom: IsoDate;
    recurringTransactionDescription: string;
    categoryId: Uuid;
    financialPriorityId: Uuid;
    linkedAccountId: Uuid;
    linkedCreditCardId: Uuid | null;
    linkedBucketId: Uuid | null;
    recurringTransactionAffectsAccountBalance: boolean;
    recurringtransactionAffectsSerenityline: boolean;
    createdAt: IsoDateTime;
};

export type RecurringTransactionHistoryResponseDto = {
    recurringTransactionId: Uuid;
    ruleHistory: RecurringTransactionRuleHistoryItemResponseDto[];
    detailsHistory: RecurringTransactionDetailsHistoryItemResponseDto[];
};

export type CreditCardResponseDto = {
    creditCardId: Uuid;
    creditCardName: string;
    creditCardDescription: string | null;
    creditCardChargeDay: number;
    accountId: Uuid;
    userGroupId: Uuid;
    creditCardCreatedAt: IsoDateTime;
    creditCardUpdatedAt: IsoDateTime;
};

export type CreateCreditCardRequestDto = {
    creditCardName: string;
    creditCardDescription?: string | null;
    creditCardChargeDay: number;
    accountId: Uuid;
};

export type UpdateCreditCardRequestDto = {
    creditCardName?: string | null;
    creditCardDescription?: string | null;
    creditCardChargeDay?: number | null;
};

export type SimulationGroupStatusFilter = "ACTIVE" | "ARCHIVED" | "ALL";

export type SimulationGroupResponseDto = {
    simulationGroupId: Uuid;
    simulationGroupName: string;
    simulationGroupDescription: string | null;
    simulationGroupCreatedAt: IsoDateTime;
    simulationGroupUpdatedAt: IsoDateTime;
    simulationGroupArchivedAt: IsoDateTime | null;
    accountIds: Uuid[];
};

export type SimulationGroupCreateRequestDto = {
    simulationGroupName: string;
    simulationGroupDescription?: string | null;
    accountIds?: Uuid[] | null;
};

export type SimulationGroupUpdateRequestDto = {
    simulationGroupName?: string | null;
    simulationGroupDescription?: string | null;
};

export type FindSimulationGroupsRequestDto = {
    status?: SimulationGroupStatusFilter;
};

export type FinancialPriorityResponseDto = {
    financialPriorityId: Uuid;
    financialPriorityCode: FinancialPriorityCode;
    financialPriorityDisplayName: string;
    financialPriorityDescription: string;
    financialPriorityRanking: number;
};

export type FinanceCalendarMovementType =
    | "PERSISTED_TRANSACTION"
    | "PROJECTED_RECURRING_TRANSACTION";

export type FinanceCalendarMovementResponseDto = {
    movementType: FinanceCalendarMovementType;
    transactionId: Uuid | null;
    recurringTransactionId: Uuid | null;
    logicalDate: IsoDate;
    chargeDate: IsoDate;
    description: string;
    amount: MoneyAmount;
    affectsAccountBalance: boolean;
    affectsSerenityline: boolean;
    categoryId: Uuid;
    financialPriorityId: Uuid | null;
    accountId: Uuid;
    creditCardId: Uuid | null;
    bucketId: Uuid | null;
    confirmed: boolean;
    simulated: boolean;
    simulationGroupId: Uuid | null;
    userEntered: boolean;
    finalOccurrence: boolean;
};

export type FinanceCalendarAccountBucketDailyBalanceResponseDto = {
    bucketId: Uuid;
    endOfDayBucketBalance: MoneyAmount;
};

export type FinanceCalendarAccountDailyBalanceResponseDto = {
    accountId: Uuid;
    currency: string;
    endOfDayAccountBalance: MoneyAmount;
    endOfDaySerenityline: MoneyAmount;
    endOfDayBucketsBalance: MoneyAmount;
    buckets: FinanceCalendarAccountBucketDailyBalanceResponseDto[];
};

export type FinanceCalendarBucketDailyBalanceResponseDto = {
    bucketId: Uuid;
    currency: string;
    endOfDayBucketBalance: MoneyAmount;
};

export type FinanceCalendarCurrencyDailyBalanceResponseDto = {
    currency: string;
    endOfDayAccountsBalance: MoneyAmount;
    endOfDaySerenityline: MoneyAmount;
    endOfDayBucketsBalance: MoneyAmount;
};

export type FinanceCalendarDailyBalanceResponseDto = {
    date: IsoDate;
    accounts: FinanceCalendarAccountDailyBalanceResponseDto[];
    buckets: FinanceCalendarBucketDailyBalanceResponseDto[];
    totalsByCurrency: FinanceCalendarCurrencyDailyBalanceResponseDto[];
};

export type FinanceCalendarSearchRequestDto = {
    from?: IsoDate;
    to?: IsoDate;
    accountIds?: Uuid[];
    simulationGroupIds?: Uuid[];
};

export type FinanceReportSummaryRequestDto = {
    accountIds?: Uuid[];
    simulationGroupIds?: Uuid[];
};

export type FinanceReportProjectionMode = "PROJECTED_PLANNING";

export type FinanceReportTemporalPosition = "PAST" | "TODAY" | "FUTURE";

export type FinanceReportExtremeClassification =
    | "IN_RANGE_EXTREME"
    | "RANGE_START_BOUNDARY"
    | "RANGE_END_BOUNDARY"
    | "MONOTONIC_TREND_WITHIN_HORIZON";

export type FinanceReportTrendDirection = "UP" | "DOWN" | "FLAT" | "MIXED";

export type FinanceReportTrendDto = {
    direction: FinanceReportTrendDirection;
    startedAt: IsoDate;
    observedUntil: IsoDate;
    monotonicUntilRangeEnd: boolean;
};

export type FinanceReportPointDto = {
    date: IsoDate;
    value: MoneyAmount;
    temporalPosition: FinanceReportTemporalPosition;
    classification: FinanceReportExtremeClassification;
    trend: FinanceReportTrendDto;
};

export type FinanceReportRangeDto = {
    from: IsoDate;
    to: IsoDate;
};

export type FinanceRecurringReportSummaryResponseDto = {
    currency: string;
    annualIncome: MoneyAmount;
    annualExpenses: MoneyAmount;
    annualNetBalance: MoneyAmount;
    averageMonthlyIncome: MoneyAmount;
    averageMonthlyExpenses: MoneyAmount;
    averageMonthlyNetBalance: MoneyAmount;
};

export type FinanceReportExtremesByCurrencyResponseDto = {
    currency: string;
    asOfDate: IsoDate;
    rangeFrom: IsoDate;
    rangeTo: IsoDate;
    minSerenityline: FinanceReportPointDto;
    maxSerenityline: FinanceReportPointDto;
    minAccountBalance: FinanceReportPointDto;
    maxAccountBalance: FinanceReportPointDto;
};

export type FinanceYearEndForecastByCurrencyResponseDto = {
    currency: string;
    endOfYearAccountBalance: MoneyAmount;
    endOfYearSerenityline: MoneyAmount;
};

export type FinanceYearEndForecastResponseDto = {
    year: number;
    date: IsoDate;
    balancesByCurrency: FinanceYearEndForecastByCurrencyResponseDto[];
};

export type FinanceReportSummaryResponseDto = {
    asOfDate: IsoDate;
    projectionMode: FinanceReportProjectionMode;
    extremesRange: FinanceReportRangeDto;
    yearEndForecastYears: number;
    recurringByCurrency: FinanceRecurringReportSummaryResponseDto[];
    extremesByCurrency: FinanceReportExtremesByCurrencyResponseDto[];
    yearEndForecasts: FinanceYearEndForecastResponseDto[];
};

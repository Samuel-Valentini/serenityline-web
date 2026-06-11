import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    createRecurringTransaction,
    getFinanceReportSummary,
    listRecurringTransactions,
    patchRecurringTransaction,
} from "../../features/finance/api/financeApi";
import { clearFinanceCalendarCache } from "../../features/finance/calendar/useFinanceCalendarCache";
import {
    financeDailyBalancesCleared,
    financeDailyBalancesRangeLoaded,
} from "../../features/finance/dailyBalances/financeDailyBalancesSlice";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { RecurringTransactionsPage } from "./RecurringTransactionsPage";
import { getTodayIsoDate } from "../../features/finance/dailyBalances/financeDailyBalancesTypes";

vi.mock("../../features/finance/api/financeApi", () => ({
    createRecurringTransaction: vi.fn(),
    getFinanceReportSummary: vi.fn(),
    listRecurringTransactions: vi.fn(),
    patchRecurringTransaction: vi.fn(),
}));

vi.mock("../../features/finance/calendar/useFinanceCalendarCache", () => ({
    clearFinanceCalendarCache: vi.fn(),
}));

const account = {
    accountId: "account-id",
    accountName: "Conto principale",
    accountDescription: "Conto per le spese quotidiane",
    currency: "EUR",
    issuingInstitution: "Banca Test",
    openingBalance: 1000,
    openingBalanceDate: "2026-01-01",
    userGroupId: "group-id",
    accountCreatedAt: "2026-01-01T00:00:00Z",
    accountUpdatedAt: "2026-01-01T00:00:00Z",
};

const category = {
    categoryId: "category-id",
    categoryName: "Casa",
    categoryDescription: "Spese legate alla casa",
    active: true,
};

const creditCard = {
    creditCardId: "credit-card-id",
    creditCardName: "Carta principale",
    creditCardDescription: "Carta per spese mensili",
    creditCardChargeDay: 15,
    accountId: "account-id",
    userGroupId: "group-id",
    creditCardCreatedAt: "2026-01-01T00:00:00Z",
    creditCardUpdatedAt: "2026-01-01T00:00:00Z",
};

const bucket = {
    bucketId: "bucket-id",
    bucketName: "Risparmio",
    bucketDescription: "Portafoglio per obiettivi",
    accountIds: ["account-id"],
    userGroupId: "group-id",
    bucketCreatedAt: "2026-01-01T00:00:00Z",
    bucketUpdatedAt: "2026-01-01T00:00:00Z",
    bucketClosedAt: null,
};

const financialPriority = {
    financialPriorityId: "financial-priority-id",
    financialPriorityCode: "ESSENTIAL" as const,
    financialPriorityDisplayName: "Essenziale",
    financialPriorityDescription: "Spese indispensabili.",
    financialPriorityRanking: 60,
};

const recurringTransaction = {
    recurringTransactionId: "recurring-transaction-id",
    recurringTransactionAmountIsAdjustable: false,
    recurringTransactionFirstPaymentDate: "2026-06-04",
    recurringTransactionIsSimulated: false,
    simulationGroupId: null,
    recurringTransactionReminderEnabled: false,
    recurringTransactionReminderDaysBefore: 7,
    recurringTransactionCreatedAt: "2026-06-04T10:00:00Z",
    recurringTransactionUpdatedAt: "2026-06-04T10:00:00Z",

    recurringTransactionHistoryId: "recurring-transaction-history-id",
    effectiveFrom: "2026-06-04",
    effectiveTo: null,
    dayOfUnit: 4,
    recurrenceInterval: 1,
    recurrenceUnit: "MONTH" as const,
    paymentDateAdjustmentPolicy: "NONE" as const,
    paymentAmount: -850,
    recurringTransactionEndDate: null,
    finalPaymentAmount: null,

    recurringTransactionDetailsHistoryId:
        "recurring-transaction-details-history-id",
    recurringTransactionDescription: "Affitto",
    categoryId: "category-id",
    financialPriorityId: "financial-priority-id",
    linkedAccountId: "account-id",
    linkedCreditCardId: null,
    linkedBucketId: null,
    recurringTransactionAffectsAccountBalance: true,
    recurringtransactionAffectsSerenityline: true,
    recurringTransactionDetailsEffectiveFrom: "2026-06-04",
};

const createdRecurringTransaction = {
    ...recurringTransaction,
    recurringTransactionId: "created-recurring-transaction-id",
    recurringTransactionDescription: "Stipendio",
    paymentAmount: 2400,
    recurringTransactionFirstPaymentDate: "2026-07-01",
    effectiveFrom: "2026-07-01",
    dayOfUnit: 1,
    recurringTransactionDetailsEffectiveFrom: "2026-07-01",
};

const updatedRecurringTransaction = {
    ...recurringTransaction,
    recurringTransactionDescription: "Affitto aggiornato",
    paymentAmount: -900,
    recurringTransactionFirstPaymentDate: "2026-07-01",
    effectiveFrom: "2026-07-01",
    dayOfUnit: 1,
    recurringTransactionDetailsEffectiveFrom: "2026-07-01",
    recurringTransactionUpdatedAt: "2026-07-01T10:00:00Z",
};

const financeReportSummary = {
    asOfDate: "2026-06-04",
    projectionMode: "PROJECTED_PLANNING" as const,
    extremesRange: {
        from: "2026-06-04",
        to: "2031-06-04",
    },
    yearEndForecastYears: 5,
    recurringByCurrency: [
        {
            currency: "EUR",
            annualIncome: 28800,
            annualExpenses: -10200,
            annualNetBalance: 18600,
            averageMonthlyIncome: 2400,
            averageMonthlyExpenses: -850,
            averageMonthlyNetBalance: 1550,
        },
    ],
    extremesByCurrency: [
        {
            currency: "EUR",
            asOfDate: "2026-06-04",
            rangeFrom: "2026-06-04",
            rangeTo: "2031-06-04",
            minSerenityline: {
                date: "2026-06-04",
                value: 1000,
                temporalPosition: "TODAY" as const,
                classification: "RANGE_START_BOUNDARY" as const,
                trend: null,
            },
            maxSerenityline: {
                date: "2031-06-04",
                value: 50000,
                temporalPosition: "FUTURE" as const,
                classification: "RANGE_END_BOUNDARY" as const,
                trend: {
                    direction: "UP" as const,
                    startedAt: "2026-06-04",
                    observedUntil: "2031-06-04",
                    monotonicUntilRangeEnd: true,
                },
            },
            minAccountBalance: {
                date: "2026-06-04",
                value: 1000,
                temporalPosition: "TODAY" as const,
                classification: "RANGE_START_BOUNDARY" as const,
                trend: null,
            },
            maxAccountBalance: {
                date: "2031-06-04",
                value: 50000,
                temporalPosition: "FUTURE" as const,
                classification: "RANGE_END_BOUNDARY" as const,
                trend: {
                    direction: "UP" as const,
                    startedAt: "2026-06-04",
                    observedUntil: "2031-06-04",
                    monotonicUntilRangeEnd: true,
                },
            },
        },
    ],
    yearEndForecasts: [
        {
            year: 2026,
            date: "2026-12-31",
            balancesByCurrency: [
                {
                    currency: "EUR",
                    endOfYearAccountBalance: 12000,
                    endOfYearSerenityline: 10000,
                },
            ],
        },
    ],
};

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [creditCard],
    categories: [category],
    buckets: [bucket],
    simulationGroups: [],
    financialPriorities: [financialPriority],
};

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <RecurringTransactionsPage />
        </AppProviders>,
    );
}

function changeCreateField(fieldName: string, value: string) {
    const field = document.getElementById(
        `recurringTransactionForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function submitCreateForm() {
    const descriptionField = document.getElementById(
        "recurringTransactionForm-description",
    );

    expect(descriptionField).not.toBeNull();

    const form = descriptionField!.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
}

function changeEditField(fieldName: string, value: string) {
    const field = document.getElementById(
        `recurringTransaction-recurring-transaction-id-editForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function submitEditForm() {
    const descriptionField = document.getElementById(
        "recurringTransaction-recurring-transaction-id-editForm-description",
    );

    expect(descriptionField).not.toBeNull();

    const form = descriptionField!.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
}

function seedDailyBalancesCache() {
    store.dispatch(
        financeDailyBalancesRangeLoaded({
            scenarioKey: "base",
            rangeKey: "2026-06-01:2026-06-30",
            range: {
                from: "2026-06-01",
                to: "2026-06-30",
            },
            balances: [
                {
                    date: "2026-06-04",
                    accounts: [
                        {
                            accountId: "account-id",
                            currency: "EUR",
                            endOfDayAccountBalance: 1000,
                            endOfDaySerenityline: 1000,
                            endOfDayBucketsBalance: 0,
                            buckets: [],
                        },
                    ],
                    buckets: [],
                    totalsByCurrency: [
                        {
                            currency: "EUR",
                            endOfDayAccountsBalance: 1000,
                            endOfDaySerenityline: 1000,
                            endOfDayBucketsBalance: 0,
                        },
                    ],
                },
            ],
            loadedAt: 1,
        }),
    );
}

function expectDailyBalancesCacheCleared() {
    expect(store.getState().financeDailyBalances.scenarios).toEqual({});
}

describe("RecurringTransactionsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");

        vi.clearAllMocks();

        store.dispatch(financeDataCleared());
        store.dispatch(financeDailyBalancesCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));

        vi.mocked(getFinanceReportSummary).mockResolvedValue(
            financeReportSummary,
        );
        vi.mocked(listRecurringTransactions).mockResolvedValue([
            recurringTransaction,
        ]);
    });

    it("loads report, financial priorities and recurring transactions", async () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: "Movimenti ricorrenti" }),
        ).toBeInTheDocument();

        expect(await screen.findByText("Affitto")).toBeInTheDocument();

        const prioritiesPanel = screen
            .getByRole("heading", { name: "Priorità finanziarie" })
            .closest("article");

        expect(prioritiesPanel).not.toBeNull();

        expect(
            within(prioritiesPanel as HTMLElement).getByText("Essenziale"),
        ).toBeInTheDocument();

        expect(
            within(prioritiesPanel as HTMLElement).getByText(
                "Spese indispensabili.",
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Flusso ricorrente")).toBeInTheDocument();
        expect(
            screen.getByText("Punti critici della proiezione"),
        ).toBeInTheDocument();
        expect(screen.getByText("Previsioni di fine anno")).toBeInTheDocument();

        expect(getFinanceReportSummary).toHaveBeenCalledTimes(1);
        expect(listRecurringTransactions).toHaveBeenCalledTimes(1);
    });

    it("sorts active recurring transactions from lowest to highest amount", async () => {
        const groceriesRecurringTransaction = {
            ...recurringTransaction,
            recurringTransactionId: "groceries-recurring-transaction-id",
            recurringTransactionDescription: "Spesa",
            paymentAmount: -700,
            recurringTransactionFirstPaymentDate: "2026-06-03",
        };

        const refundRecurringTransaction = {
            ...recurringTransaction,
            recurringTransactionId: "refund-recurring-transaction-id",
            recurringTransactionDescription: "Rimborso",
            paymentAmount: 10,
            recurringTransactionFirstPaymentDate: "2026-06-02",
        };

        const incomeRecurringTransaction = {
            ...recurringTransaction,
            recurringTransactionId: "income-recurring-transaction-id",
            recurringTransactionDescription: "Entrata extra",
            paymentAmount: 200,
            recurringTransactionFirstPaymentDate: "2026-06-01",
        };

        vi.mocked(listRecurringTransactions).mockResolvedValueOnce([
            incomeRecurringTransaction,
            refundRecurringTransaction,
            groceriesRecurringTransaction,
            recurringTransaction,
        ]);

        renderPage();

        expect(await screen.findByText("Affitto")).toBeInTheDocument();

        const rent = screen.getByText("Affitto");
        const groceries = screen.getByText("Spesa");
        const refund = screen.getByText("Rimborso");
        const income = screen.getByText("Entrata extra");

        expect(
            rent.compareDocumentPosition(groceries) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();

        expect(
            groceries.compareDocumentPosition(refund) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();

        expect(
            refund.compareDocumentPosition(income) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("creates a recurring transaction and refreshes the report", async () => {
        vi.mocked(createRecurringTransaction).mockResolvedValueOnce(
            createdRecurringTransaction,
        );
        seedDailyBalancesCache();

        renderPage();

        await screen.findByText("Affitto");

        fireEvent.click(
            screen.getByRole("button", { name: "Nuovo ricorrente" }),
        );

        changeCreateField("description", "Stipendio");
        changeCreateField("paymentAmount", "2400,00");
        changeCreateField("firstPaymentDate", "2026-07-01");
        changeCreateField("recurrenceInterval", "1");
        changeCreateField("recurrenceUnit", "MONTH");
        changeCreateField("category", "category-id");
        changeCreateField("financialPriority", "financial-priority-id");
        changeCreateField("account", "account-id");

        submitCreateForm();

        await waitFor(() => {
            expect(createRecurringTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    recurringTransactionDescription: "Stipendio",
                    paymentAmount: "2400.00",
                    recurringTransactionFirstPaymentDate: "2026-07-01",
                    recurrenceInterval: 1,
                    recurrenceUnit: "MONTH",
                    categoryId: "category-id",
                    financialPriorityId: "financial-priority-id",
                    linkedAccountId: "account-id",
                }),
            );
        });

        expect(
            await screen.findByText(
                "Movimento ricorrente creato correttamente.",
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Stipendio")).toBeInTheDocument();

        await waitFor(() => {
            expect(getFinanceReportSummary).toHaveBeenCalledTimes(2);
        });

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("patches a recurring transaction and refreshes the report", async () => {
        vi.mocked(patchRecurringTransaction).mockResolvedValueOnce(
            updatedRecurringTransaction,
        );
        seedDailyBalancesCache();

        renderPage();

        await screen.findByText("Affitto");

        fireEvent.click(screen.getAllByRole("button", { name: "Modifica" })[0]);

        expect(
            screen.getByText("Modifica movimento ricorrente"),
        ).toBeInTheDocument();

        changeEditField("description", "Affitto aggiornato");
        changeEditField("paymentAmount", "-900,00");
        changeEditField("firstPaymentDate", "2026-07-01");
        changeEditField("recurrenceInterval", "1");
        changeEditField("recurrenceUnit", "MONTH");
        changeEditField("category", "category-id");
        changeEditField("financialPriority", "financial-priority-id");
        changeEditField("account", "account-id");
        fireEvent.click(
            screen.getByRole("radio", {
                name: "Modifica tutta la ricorrenza",
            }),
        );

        submitEditForm();

        await waitFor(() => {
            expect(patchRecurringTransaction).toHaveBeenCalledWith(
                "recurring-transaction-id",
                expect.objectContaining({
                    recurringTransactionFirstPaymentDate: "2026-07-01",
                    recurringTransactionAmountIsAdjustable: false,
                    recurringTransactionIsSimulated: false,
                    simulationGroupId: null,
                    rule: expect.objectContaining({
                        effectiveFrom: "2026-07-01",
                        dayOfUnit: 1,
                        paymentAmount: "-900.00",
                        recurrenceInterval: 1,
                        recurrenceUnit: "MONTH",
                        paymentDateAdjustmentPolicy: "NONE",
                        recurringTransactionEndDate: null,
                        finalPaymentAmount: null,
                    }),
                    details: expect.objectContaining({
                        effectiveFrom: "2026-07-01",
                        recurringTransactionDescription: "Affitto aggiornato",
                        categoryId: "category-id",
                        financialPriorityId: "financial-priority-id",
                        linkedAccountId: "account-id",
                        linkedCreditCardId: null,
                        linkedBucketId: null,
                        recurringTransactionAffectsAccountBalance: true,
                        recurringtransactionAffectsSerenityline: true,
                    }),
                }),
            );
        });

        expect(
            await screen.findByText(
                "Movimento ricorrente aggiornato correttamente.",
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Affitto aggiornato")).toBeInTheDocument();

        await waitFor(() => {
            expect(getFinanceReportSummary).toHaveBeenCalledTimes(2);
        });

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("shows an error when page data loading fails", async () => {
        vi.mocked(getFinanceReportSummary).mockRejectedValueOnce(
            new Error("Errore caricamento"),
        );

        renderPage();

        expect(
            await screen.findByText("Errore caricamento"),
        ).toBeInTheDocument();
    });

    it("patches a recurring transaction from today by default without changing the first payment date", async () => {
        const today = getTodayIsoDate();

        vi.mocked(patchRecurringTransaction).mockResolvedValueOnce({
            ...updatedRecurringTransaction,
            recurringTransactionFirstPaymentDate:
                recurringTransaction.recurringTransactionFirstPaymentDate,
            effectiveFrom: today,
            recurringTransactionDetailsEffectiveFrom: today,
        });

        seedDailyBalancesCache();

        renderPage();

        await screen.findByText("Affitto");

        fireEvent.click(screen.getAllByRole("button", { name: "Modifica" })[0]);

        expect(
            screen.getByRole("radio", {
                name: "Modifica da oggi in poi",
            }),
        ).toBeChecked();

        expect(
            screen.queryByLabelText("Applica modifica dal"),
        ).not.toBeInTheDocument();

        changeEditField("description", "Affitto aggiornato");
        changeEditField("paymentAmount", "-900,00");
        changeEditField("recurrenceInterval", "1");
        changeEditField("recurrenceUnit", "MONTH");
        changeEditField("category", "category-id");
        changeEditField("financialPriority", "financial-priority-id");
        changeEditField("account", "account-id");

        submitEditForm();

        await waitFor(() => {
            expect(patchRecurringTransaction).toHaveBeenCalled();
        });

        const [, patchRequest] = vi.mocked(patchRecurringTransaction).mock
            .calls[0];

        expect(patchRequest).not.toHaveProperty(
            "recurringTransactionFirstPaymentDate",
        );

        expect(patchRequest).toEqual(
            expect.objectContaining({
                recurringTransactionAmountIsAdjustable: false,
                recurringTransactionIsSimulated: false,
                simulationGroupId: null,
            }),
        );

        expect(patchRequest.rule).toEqual(
            expect.objectContaining({
                effectiveFrom: today,
                dayOfUnit: 4,
                paymentAmount: "-900.00",
                recurrenceInterval: 1,
                recurrenceUnit: "MONTH",
                paymentDateAdjustmentPolicy: "NONE",
                recurringTransactionEndDate: null,
                finalPaymentAmount: null,
            }),
        );

        expect(patchRequest.details).toEqual(
            expect.objectContaining({
                effectiveFrom: today,
                recurringTransactionDescription: "Affitto aggiornato",
                categoryId: "category-id",
                financialPriorityId: "financial-priority-id",
                linkedAccountId: "account-id",
                linkedCreditCardId: null,
                linkedBucketId: null,
                recurringTransactionAffectsAccountBalance: true,
                recurringtransactionAffectsSerenityline: true,
            }),
        );

        expect(
            await screen.findByText(
                "Movimento ricorrente aggiornato correttamente.",
            ),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getFinanceReportSummary).toHaveBeenCalledTimes(2);
        });

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("patches a recurring transaction from a selected effective date without changing the first payment date", async () => {
        vi.mocked(patchRecurringTransaction).mockResolvedValueOnce({
            ...updatedRecurringTransaction,
            recurringTransactionFirstPaymentDate:
                recurringTransaction.recurringTransactionFirstPaymentDate,
            effectiveFrom: "2026-08-15",
            recurringTransactionDetailsEffectiveFrom: "2026-08-15",
        });

        seedDailyBalancesCache();

        renderPage();

        await screen.findByText("Affitto");

        fireEvent.click(screen.getAllByRole("button", { name: "Modifica" })[0]);

        fireEvent.click(
            screen.getByRole("radio", {
                name: "Modifica da una data specifica in poi",
            }),
        );

        expect(
            screen.getByLabelText("Applica modifica dal"),
        ).toBeInTheDocument();

        changeEditField("editEffectiveFrom", "2026-08-15");
        changeEditField("description", "Affitto aggiornato");
        changeEditField("paymentAmount", "-900,00");
        changeEditField("recurrenceInterval", "1");
        changeEditField("recurrenceUnit", "MONTH");
        changeEditField("category", "category-id");
        changeEditField("financialPriority", "financial-priority-id");
        changeEditField("account", "account-id");

        submitEditForm();

        await waitFor(() => {
            expect(patchRecurringTransaction).toHaveBeenCalled();
        });

        const [, patchRequest] = vi.mocked(patchRecurringTransaction).mock
            .calls[0];

        expect(patchRequest).not.toHaveProperty(
            "recurringTransactionFirstPaymentDate",
        );

        expect(patchRequest.rule).toEqual(
            expect.objectContaining({
                effectiveFrom: "2026-08-15",
                dayOfUnit: 4,
                paymentAmount: "-900.00",
                recurrenceInterval: 1,
                recurrenceUnit: "MONTH",
                paymentDateAdjustmentPolicy: "NONE",
                recurringTransactionEndDate: null,
                finalPaymentAmount: null,
            }),
        );

        expect(patchRequest.details).toEqual(
            expect.objectContaining({
                effectiveFrom: "2026-08-15",
                recurringTransactionDescription: "Affitto aggiornato",
                categoryId: "category-id",
                financialPriorityId: "financial-priority-id",
                linkedAccountId: "account-id",
                linkedCreditCardId: null,
                linkedBucketId: null,
                recurringTransactionAffectsAccountBalance: true,
                recurringtransactionAffectsSerenityline: true,
            }),
        );

        expect(
            await screen.findByText(
                "Movimento ricorrente aggiornato correttamente.",
            ),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getFinanceReportSummary).toHaveBeenCalledTimes(2);
        });

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });
});

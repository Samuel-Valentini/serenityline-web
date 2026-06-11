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
    createTransaction,
    listTransactions,
    updateTransaction,
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
import { TransactionsPage } from "./TransactionsPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    createAccount: vi.fn(),
    createBucket: vi.fn(),
    createCategory: vi.fn(),
    createCreditCard: vi.fn(),
    listTransactions: vi.fn(),
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

const createdTransaction = {
    transactionId: "transaction-id",
    transactionDescription: "Affitto",
    transactionAmount: -850,
    transactionAffectsAccountBalance: true,
    transactionAffectsSerenityline: true,
    categoryId: "category-id",
    transactionChargeDate: "2026-06-04",
    transactionIsConfirmed: true,
    accountId: "account-id",
    creditCardId: null,
    bucketId: null,
    transactionIsSimulated: false,
    simulationGroupId: null,
    transactionIsUserEntered: true,
    recurringTransactionId: null,
    recurringTransactionLogicalDate: null,
    recurringTransactionConfirmedAt: null,
    transactionReminderEnabled: false,
    transactionReminderDaysBefore: 7,
    transactionCreatedAt: "2026-06-04T10:00:00Z",
    transactionUpdatedAt: "2026-06-04T10:00:00Z",
};

const updatedTransaction = {
    ...createdTransaction,
    transactionDescription: "Affitto aggiornato",
    transactionAmount: -900,
    transactionUpdatedAt: "2026-06-04T11:00:00Z",
};

const searchedTransaction = {
    ...createdTransaction,
    transactionId: "searched-transaction-id",
    transactionDescription: "Spesa farmacia",
    transactionAmount: -42.5,
    transactionChargeDate: "2026-06-03",
    transactionCreatedAt: "2026-06-03T10:00:00Z",
    transactionUpdatedAt: "2026-06-03T10:00:00Z",
};

const searchedTransactionFromRecurring = {
    ...searchedTransaction,
    transactionId: "recurring-generated-transaction-id",
    transactionDescription: "Ricorrente confermata",
    transactionIsUserEntered: false,
};

const updatedSearchedTransaction = {
    ...searchedTransaction,
    transactionDescription: "Spesa farmacia aggiornata",
    transactionAmount: -45,
    transactionUpdatedAt: "2026-06-04T11:00:00Z",
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
    bucketDescription: "Portafoglio per obiettivi di risparmio",
    accountIds: ["account-id"],
    userGroupId: "group-id",
    bucketCreatedAt: "2026-01-01T00:00:00Z",
    bucketUpdatedAt: "2026-01-01T00:00:00Z",
    bucketClosedAt: null,
};

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [creditCard],
    categories: [category],
    buckets: [bucket],
    simulationGroups: [],
    financialPriorities: [],
};

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <TransactionsPage />
        </AppProviders>,
    );
}

function getTransactionRow(transactionDescription: string) {
    const transactionCell = screen.getByText(transactionDescription);
    const row = transactionCell.closest("tr");

    if (!row) {
        throw new Error(
            `Transaction row not found for ${transactionDescription}`,
        );
    }

    return row;
}

function getEditButtonForTransaction(transactionDescription: string) {
    return within(getTransactionRow(transactionDescription)).getByRole(
        "button",
        { name: "Modifica" },
    );
}

function getEditFormCell() {
    const editFormCell = screen
        .getByRole("heading", { name: "Modifica transazione" })
        .closest("td");

    if (!editFormCell) {
        throw new Error("Edit form cell not found");
    }

    return editFormCell;
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

describe("TransactionsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeDailyBalancesCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("creates a transaction and shows it in the current session", async () => {
        vi.mocked(createTransaction).mockResolvedValue(createdTransaction);
        seedDailyBalancesCache();

        renderPage();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "-850,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-06-04" },
        });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "category-id" },
        });
        fireEvent.change(screen.getByLabelText("Conto"), {
            target: { value: "account-id" },
        });
        fireEvent.click(screen.getByLabelText("Transazione già confermata"));

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        await waitFor(() => {
            expect(createTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionDescription: "Affitto",
                    transactionAmount: "-850.00",
                    transactionAffectsAccountBalance: true,
                    transactionAffectsSerenityline: true,
                    categoryId: "category-id",
                    transactionChargeDate: "2026-06-04",
                    transactionIsConfirmed: true,
                    accountId: "account-id",
                    creditCardId: null,
                    bucketId: null,
                    transactionIsSimulated: false,
                    simulationGroupId: null,
                }),
            );
        });

        expect(await screen.findByText("Affitto")).toBeInTheDocument();
        expect(screen.getByText("Confermata")).toBeInTheDocument();
        expect(getEditButtonForTransaction("Affitto")).toBeEnabled();

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("edits a transaction added in the current session", async () => {
        vi.mocked(createTransaction).mockResolvedValue(createdTransaction);
        vi.mocked(updateTransaction).mockResolvedValue(updatedTransaction);

        renderPage();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "-850,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-06-04" },
        });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "category-id" },
        });
        fireEvent.change(screen.getByLabelText("Conto"), {
            target: { value: "account-id" },
        });
        fireEvent.click(screen.getByLabelText("Transazione già confermata"));

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        expect(await screen.findByText("Affitto")).toBeInTheDocument();

        vi.mocked(clearFinanceCalendarCache).mockClear();
        seedDailyBalancesCache();

        fireEvent.click(getEditButtonForTransaction("Affitto"));

        const editFormCell = getEditFormCell();

        fireEvent.change(within(editFormCell).getByLabelText("Descrizione"), {
            target: { value: "Affitto aggiornato" },
        });
        fireEvent.change(within(editFormCell).getByLabelText("Importo"), {
            target: { value: "-900,00" },
        });

        fireEvent.click(
            within(editFormCell).getByRole("button", {
                name: "Salva modifiche",
            }),
        );

        await waitFor(() => {
            expect(updateTransaction).toHaveBeenCalledWith(
                "transaction-id",
                expect.objectContaining({
                    transactionDescription: "Affitto aggiornato",
                    transactionAmount: "-900.00",
                    transactionAffectsAccountBalance: true,
                    transactionAffectsSerenityline: true,
                    categoryId: "category-id",
                    transactionChargeDate: "2026-06-04",
                    transactionIsConfirmed: true,
                    accountId: "account-id",
                    creditCardId: null,
                    bucketId: null,
                    transactionIsSimulated: false,
                    simulationGroupId: null,
                }),
            );
        });

        expect(
            await screen.findByText("Affitto aggiornato"),
        ).toBeInTheDocument();

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("searches user-entered transactions and edits a search result", async () => {
        vi.mocked(listTransactions).mockResolvedValue([
            searchedTransaction,
            searchedTransactionFromRecurring,
        ]);
        vi.mocked(updateTransaction).mockResolvedValue(
            updatedSearchedTransaction,
        );
        seedDailyBalancesCache();

        renderPage();

        fireEvent.change(screen.getByLabelText("Dal"), {
            target: { value: "2026-06-01" },
        });
        fireEvent.change(screen.getByLabelText("Al"), {
            target: { value: "2026-06-30" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Visualizza transazioni" }),
        );

        await waitFor(() => {
            expect(listTransactions).toHaveBeenCalledWith({
                from: "2026-06-01",
                to: "2026-06-30",
            });
        });

        expect(await screen.findByText("Spesa farmacia")).toBeInTheDocument();
        expect(
            screen.queryByText("Ricorrente confermata"),
        ).not.toBeInTheDocument();

        fireEvent.click(getEditButtonForTransaction("Spesa farmacia"));

        const editFormCell = getEditFormCell();

        fireEvent.change(within(editFormCell).getByLabelText("Descrizione"), {
            target: { value: "Spesa farmacia aggiornata" },
        });
        fireEvent.change(within(editFormCell).getByLabelText("Importo"), {
            target: { value: "-45,00" },
        });

        fireEvent.click(
            within(editFormCell).getByRole("button", {
                name: "Salva modifiche",
            }),
        );

        await waitFor(() => {
            expect(updateTransaction).toHaveBeenCalledWith(
                "searched-transaction-id",
                expect.objectContaining({
                    transactionDescription: "Spesa farmacia aggiornata",
                    transactionAmount: "-45.00",
                    transactionIsSimulated: false,
                    simulationGroupId: null,
                }),
            );
        });

        expect(
            await screen.findByText("Spesa farmacia aggiornata"),
        ).toBeInTheDocument();

        expect(clearFinanceCalendarCache).toHaveBeenCalledTimes(1);
        expectDailyBalancesCacheCleared();
    });

    it("blocks editing when the update would generate multiple technical movements", async () => {
        vi.mocked(createTransaction).mockResolvedValue(createdTransaction);

        renderPage();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "-850,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-06-04" },
        });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "category-id" },
        });
        fireEvent.change(screen.getByLabelText("Conto"), {
            target: { value: "account-id" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        expect(await screen.findByText("Affitto")).toBeInTheDocument();

        fireEvent.click(getEditButtonForTransaction("Affitto"));

        const editFormCell = getEditFormCell();

        fireEvent.change(within(editFormCell).getByLabelText(/Carta/i), {
            target: { value: "credit-card-id" },
        });
        fireEvent.change(within(editFormCell).getByLabelText(/Portafoglio/i), {
            target: { value: "bucket-id" },
        });

        fireEvent.click(
            within(editFormCell).getByRole("button", {
                name: "Salva modifiche",
            }),
        );

        expect(
            await screen.findByText(
                "Questa modifica genererebbe più movimenti tecnici. Per ora modifica separatamente carta e portafoglio.",
            ),
        ).toBeInTheDocument();

        expect(updateTransaction).not.toHaveBeenCalled();
    });

    it("shows a validation error when search date range is incomplete", async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText("Dal"), {
            target: { value: "" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Visualizza transazioni" }),
        );

        expect(
            await screen.findByText(
                "Inserisci sia la data iniziale sia la data finale.",
            ),
        ).toBeInTheDocument();

        expect(listTransactions).not.toHaveBeenCalled();
    });

    it("shows a validation error when search start date is after end date", async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText("Dal"), {
            target: { value: "2026-06-30" },
        });
        fireEvent.change(screen.getByLabelText("Al"), {
            target: { value: "2026-06-01" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Visualizza transazioni" }),
        );

        expect(
            await screen.findByText(
                "La data iniziale non può essere successiva alla data finale.",
            ),
        ).toBeInTheDocument();

        expect(listTransactions).not.toHaveBeenCalled();
    });
});

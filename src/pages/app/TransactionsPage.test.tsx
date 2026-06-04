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
    updateTransaction,
} from "../../features/finance/api/financeApi";
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

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [],
    categories: [category],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
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

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <TransactionsPage />
        </AppProviders>,
    );
}

describe("TransactionsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("creates a transaction and shows it in the current session", async () => {
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
        expect(screen.getByRole("button", { name: "Modifica" })).toBeEnabled();
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

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));
        
        const editFormCell = screen
            .getByRole("heading", { name: "Modifica transazione" })
            .closest("td");

        expect(editFormCell).not.toBeNull();

        fireEvent.change(within(editFormCell!).getByLabelText("Descrizione"), {
            target: { value: "Affitto aggiornato" },
        });
        fireEvent.change(within(editFormCell!).getByLabelText("Importo"), {
            target: { value: "-900,00" },
        });

        fireEvent.click(
            within(editFormCell!).getByRole("button", {
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
    });
});

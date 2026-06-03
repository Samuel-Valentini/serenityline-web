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
    createAccount,
    getAccount,
    updateAccount,
} from "../../features/finance/api/financeApi";
import { i18n } from "../../shared/i18n/i18n";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { AccountsPage } from "./AccountsPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    createAccount: vi.fn(),
    getAccount: vi.fn(),
    updateAccount: vi.fn(),
}));

const referenceData: FinanceReferenceData = {
    accounts: [
        {
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
        },
    ],
    categories: [],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

const createdAccount = {
    accountId: "created-account-id",
    accountName: "Conto risparmio",
    accountDescription: null,
    currency: "EUR",
    issuingInstitution: "Banca Nuova",
    openingBalance: 2500,
    openingBalanceDate: "2026-06-03",
    userGroupId: "group-id",
    accountCreatedAt: "2026-06-03T10:00:00Z",
    accountUpdatedAt: "2026-06-03T10:00:00Z",
};

const updatedAccount = {
    ...referenceData.accounts[0],
    accountName: "Conto aggiornato",
    accountDescription: null,
    issuingInstitution: "Banca Aggiornata",
    openingBalance: 1500.25,
    openingBalanceDate: "2026-02-01",
    accountUpdatedAt: "2026-06-03T10:00:00Z",
};

function renderPage() {
    return render(
        <AppProviders enableAuthBootstrap={false}>
            <AccountsPage />
        </AppProviders>,
    );
}

describe("AccountsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
    });

    it("renders accounts from finance data", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Conti" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Conto principale")).toBeInTheDocument();
        expect(screen.getByText("Banca Test")).toBeInTheDocument();
        expect(
            screen.getByText("Conto per le spese quotidiane"),
        ).toBeInTheDocument();
    });

    it("renders the loading state", () => {
        store.dispatch(financeReferenceDataLoadingStarted());

        renderPage();

        expect(screen.getByText("Caricamento conti...")).toBeInTheDocument();
    });

    it("renders the error state", () => {
        store.dispatch(
            financeReferenceDataLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        renderPage();

        expect(
            screen.getByText("Impossibile caricare i conti."),
        ).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders the empty state", () => {
        store.dispatch(
            financeReferenceDataLoaded({
                accounts: [],
                categories: [],
                buckets: [],
                simulationGroups: [],
                financialPriorities: [],
            }),
        );

        renderPage();

        expect(
            screen.getByText(
                "Non hai ancora creato conti. Aggiungi il primo conto per iniziare.",
            ),
        ).toBeInTheDocument();
    });

    it("creates an account and stores it in finance data", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                accounts: [],
                categories: [],
                buckets: [],
                simulationGroups: [],
                financialPriorities: [],
            }),
        );

        vi.mocked(createAccount).mockResolvedValueOnce(createdAccount);

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome conto"), {
            target: { value: "Conto risparmio" },
        });
        fireEvent.change(screen.getByLabelText("Valuta"), {
            target: { value: "EUR" },
        });
        fireEvent.change(screen.getByLabelText("Saldo iniziale"), {
            target: { value: "2500,50" },
        });
        fireEvent.change(screen.getByLabelText("Data saldo iniziale"), {
            target: { value: "2026-06-03" },
        });
        fireEvent.change(screen.getByLabelText(/Istituto emittente/i), {
            target: { value: "Banca Nuova" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea conto" }));

        await waitFor(() => {
            expect(createAccount).toHaveBeenCalledWith({
                accountName: "Conto risparmio",
                currency: "EUR",
                openingBalance: "2500.50",
                openingBalanceDate: "2026-06-03",
                issuingInstitution: "Banca Nuova",
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto creato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.accounts).toEqual([createdAccount]);
    });

    it("shows account details", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(getAccount).mockResolvedValueOnce(referenceData.accounts[0]);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(getAccount).toHaveBeenCalledWith("account-id");
        });

        expect(screen.getByText("Dettaglio conto")).toBeInTheDocument();
        expect(screen.getAllByText("Banca Test")).not.toHaveLength(0);
        expect(screen.getAllByText("2026-01-01")).not.toHaveLength(0);
    });

    it("updates an account and stores it in finance data", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(getAccount).mockResolvedValueOnce(referenceData.accounts[0]);
        vi.mocked(updateAccount).mockResolvedValueOnce(updatedAccount);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(getAccount).toHaveBeenCalledWith("account-id");
        });

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const editForm = screen.getByRole("form", { name: "Modifica conto" });

        fireEvent.change(within(editForm).getByLabelText("Nome conto"), {
            target: { value: "Conto aggiornato" },
        });
        fireEvent.change(within(editForm).getByLabelText("Saldo iniziale"), {
            target: { value: "1500,25" },
        });
        fireEvent.change(
            within(editForm).getByLabelText("Data saldo iniziale"),
            {
                target: { value: "2026-02-01" },
            },
        );
        fireEvent.change(
            within(editForm).getByLabelText(/Istituto emittente/i),
            {
                target: { value: "Banca Aggiornata" },
            },
        );
        fireEvent.change(within(editForm).getByLabelText(/Descrizione/i), {
            target: { value: "" },
        });

        fireEvent.click(
            within(editForm).getByRole("button", { name: "Salva modifiche" }),
        );

        await waitFor(() => {
            expect(updateAccount).toHaveBeenCalledWith("account-id", {
                accountName: "Conto aggiornato",
                accountDescription: null,
                issuingInstitution: "Banca Aggiornata",
                openingBalance: "1500.25",
                openingBalanceDate: "2026-02-01",
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto aggiornato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.accounts).toEqual([updatedAccount]);
    });
});

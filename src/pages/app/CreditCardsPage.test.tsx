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
    createCreditCard,
    deleteCreditCard,
    getCreditCard,
    updateCreditCard,
} from "../../features/finance/api/financeApi";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { CreditCardsPage } from "./CreditCardsPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    createCreditCard: vi.fn(),
    deleteCreditCard: vi.fn(),
    getCreditCard: vi.fn(),
    updateCreditCard: vi.fn(),
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

const creditCard = {
    creditCardId: "credit-card-id",
    creditCardName: "Carta principale",
    creditCardDescription: "Carta per le spese quotidiane",
    creditCardChargeDay: 15,
    accountId: "account-id",
    userGroupId: "group-id",
    creditCardCreatedAt: "2026-01-01T00:00:00Z",
    creditCardUpdatedAt: "2026-01-01T00:00:00Z",
};

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [creditCard],
    categories: [],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

const createdCreditCard = {
    ...creditCard,
    creditCardId: "created-credit-card-id",
    creditCardName: "Carta nuova",
    creditCardDescription: null,
    creditCardChargeDay: 20,
    creditCardCreatedAt: "2026-06-03T10:00:00Z",
    creditCardUpdatedAt: "2026-06-03T10:00:00Z",
};

const updatedCreditCard = {
    ...creditCard,
    creditCardName: "Carta aggiornata",
    creditCardDescription: null,
    creditCardChargeDay: 10,
    creditCardUpdatedAt: "2026-06-03T10:00:00Z",
};

function renderPage() {
    return render(
        <AppProviders enableAuthBootstrap={false}>
            <CreditCardsPage />
        </AppProviders>,
    );
}

describe("CreditCardsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());

        vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    });

    it("renders credit cards from finance data", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Carte" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Carta principale")).toBeInTheDocument();
        expect(
            within(screen.getByRole("table")).getByText("Conto principale"),
        ).toBeInTheDocument();
        expect(screen.getByText("Giorno 15")).toBeInTheDocument();
        expect(
            screen.getByText("Carta per le spese quotidiane"),
        ).toBeInTheDocument();
    });

    it("renders the loading state", () => {
        store.dispatch(financeReferenceDataLoadingStarted());

        renderPage();

        expect(screen.getByText("Caricamento carte...")).toBeInTheDocument();
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
            screen.getByText("Impossibile caricare le carte."),
        ).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders the empty state and the missing accounts warning", () => {
        store.dispatch(
            financeReferenceDataLoaded({
                accounts: [],
                creditCards: [],
                categories: [],
                buckets: [],
                simulationGroups: [],
                financialPriorities: [],
            }),
        );

        renderPage();

        expect(
            screen.getByText(
                "Non hai ancora creato carte. Aggiungi la prima carta collegandola a un conto.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Prima di creare una carta devi avere almeno un conto.",
            ),
        ).toBeInTheDocument();
    });

    it("creates a credit card and stores it in finance data", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                creditCards: [],
            }),
        );

        vi.mocked(createCreditCard).mockResolvedValueOnce(createdCreditCard);

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome carta"), {
            target: { value: "Carta nuova" },
        });
        fireEvent.change(screen.getByLabelText("Conto collegato"), {
            target: { value: "account-id" },
        });
        fireEvent.change(screen.getByLabelText("Giorno di addebito"), {
            target: { value: "20" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea carta" }));

        await waitFor(() => {
            expect(createCreditCard).toHaveBeenCalledWith({
                creditCardName: "Carta nuova",
                creditCardDescription: null,
                creditCardChargeDay: 20,
                accountId: "account-id",
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Carta creata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.creditCards).toEqual([
            createdCreditCard,
        ]);
    });

    it("shows credit card details", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(getCreditCard).mockResolvedValueOnce(creditCard);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(getCreditCard).toHaveBeenCalledWith("credit-card-id");
        });

        expect(screen.getByText("Dettaglio carta")).toBeInTheDocument();
        expect(screen.getAllByText("Conto principale")).not.toHaveLength(0);
        expect(screen.getAllByText("Giorno 15")).not.toHaveLength(0);
    });

    it("updates a credit card and stores it in finance data", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(getCreditCard).mockResolvedValueOnce(creditCard);
        vi.mocked(updateCreditCard).mockResolvedValueOnce(updatedCreditCard);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(getCreditCard).toHaveBeenCalledWith("credit-card-id");
        });

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const editForm = screen.getByRole("form", { name: "Modifica carta" });

        fireEvent.change(within(editForm).getByLabelText("Nome carta"), {
            target: { value: "Carta aggiornata" },
        });
        fireEvent.change(
            within(editForm).getByLabelText("Giorno di addebito"),
            {
                target: { value: "10" },
            },
        );
        fireEvent.change(within(editForm).getByLabelText(/Descrizione/i), {
            target: { value: "" },
        });

        fireEvent.click(
            within(editForm).getByRole("button", {
                name: "Salva modifiche",
            }),
        );

        await waitFor(() => {
            expect(updateCreditCard).toHaveBeenCalledWith("credit-card-id", {
                creditCardName: "Carta aggiornata",
                creditCardDescription: null,
                creditCardChargeDay: 10,
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Carta aggiornata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.creditCards).toEqual([
            updatedCreditCard,
        ]);
    });

    it("deletes a credit card after confirmation", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(getCreditCard).mockResolvedValueOnce(creditCard);
        vi.mocked(deleteCreditCard).mockResolvedValueOnce();
        vi.spyOn(window, "confirm").mockReturnValueOnce(true);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(getCreditCard).toHaveBeenCalledWith("credit-card-id");
        });

        fireEvent.click(screen.getByRole("button", { name: "Elimina carta" }));

        await waitFor(() => {
            expect(deleteCreditCard).toHaveBeenCalledWith("credit-card-id");
        });

        await waitFor(() => {
            expect(
                screen.getByText("Carta eliminata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.creditCards).toEqual([]);
    });
});

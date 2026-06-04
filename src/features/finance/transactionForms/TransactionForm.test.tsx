import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";

import { AppProviders } from "../../../app/providers/AppProviders";
import { store } from "../../../app/store/store";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../financeDataSlice";
import type { FinanceReferenceData } from "../financeDataTypes";
import { i18n } from "../../../shared/i18n/i18n";
import { TransactionForm } from "./TransactionForm";
import { createCategory } from "../api/financeApi";

vi.mock("../api/financeApi", () => ({
    createCategory: vi.fn(),
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

const secondAccount = {
    ...account,
    accountId: "second-account-id",
    accountName: "Conto riserva",
};

const category = {
    categoryId: "category-id",
    categoryName: "Casa",
    categoryDescription: "Spese legate alla casa",
    active: true,
};

const createdCategoryFromModal = {
    ...category,
    categoryId: "created-category-from-modal-id",
    categoryName: "Trasporti",
    categoryDescription: null,
    active: true,
};

const inactiveCategory = {
    ...category,
    categoryId: "inactive-category-id",
    categoryName: "Categoria disattivata",
    active: false,
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

const secondAccountCreditCard = {
    ...creditCard,
    creditCardId: "second-credit-card-id",
    creditCardName: "Carta riserva",
    accountId: "second-account-id",
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

const closedBucket = {
    ...bucket,
    bucketId: "closed-bucket-id",
    bucketName: "Portafoglio chiuso",
    bucketClosedAt: "2026-06-01T00:00:00Z",
};

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [creditCard, secondAccountCreditCard],
    categories: [category, inactiveCategory],
    buckets: [bucket, closedBucket],
    simulationGroups: [],
    financialPriorities: [],
};

function renderForm(props?: Partial<ComponentProps<typeof TransactionForm>>) {
    const onSubmit = props?.onSubmit ?? vi.fn();

    render(
        <AppProviders enableAuthBootstrap={false}>
            <TransactionForm
                context={{ type: "standard" }}
                onSubmit={onSubmit}
                {...props}
            />
        </AppProviders>,
    );

    return { onSubmit };
}

describe("TransactionForm", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("submits a standard transaction request with normalized money amount", async () => {
        const { onSubmit } = renderForm();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "1.250,50" },
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
        fireEvent.change(screen.getByLabelText(/Carta/i), {
            target: { value: "credit-card-id" },
        });
        fireEvent.change(screen.getByLabelText(/Portafoglio/i), {
            target: { value: "bucket-id" },
        });

        fireEvent.click(screen.getByLabelText("Transazione già confermata"));
        fireEvent.click(screen.getByLabelText("Attiva promemoria"));
        fireEvent.change(
            screen.getByLabelText("Giorni di anticipo del promemoria"),
            {
                target: { value: "3" },
            },
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                transactionDescription: "Affitto",
                transactionAmount: "1250.50",
                transactionAffectsAccountBalance: true,
                transactionAffectsSerenityline: true,
                categoryId: "category-id",
                transactionChargeDate: "2026-06-04",
                transactionIsConfirmed: true,
                accountId: "account-id",
                creditCardId: "credit-card-id",
                bucketId: "bucket-id",
                transactionIsSimulated: false,
                simulationGroupId: null,
                transactionReminderEnabled: true,
                transactionReminderDaysBefore: 3,
            });
        });
    });

    it("submits a simulated transaction request from simulation context", async () => {
        const { onSubmit } = renderForm({
            context: {
                type: "simulation",
                simulationGroupId: "simulation-group-id",
                allowedAccountIds: ["account-id"],
            },
        });

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Spesa simulata" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "250,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-07-01" },
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

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionDescription: "Spesa simulata",
                    transactionAmount: "250.00",
                    transactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                    accountId: "account-id",
                    categoryId: "category-id",
                }),
            );
        });
    });

    it("shows validation error when category is missing", async () => {
        const { onSubmit } = renderForm();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "850,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-06-04" },
        });
        fireEvent.change(screen.getByLabelText("Conto"), {
            target: { value: "account-id" },
        });

        const submitButton = screen.getByRole("button", {
            name: "Salva transazione",
        });

        fireEvent.submit(submitButton.closest("form")!);

        expect(
            await screen.findByText("Seleziona una categoria."),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows validation error when account is missing", async () => {
        const { onSubmit } = renderForm();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Affitto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "850,00" },
        });
        fireEvent.change(screen.getByLabelText("Data addebito"), {
            target: { value: "2026-06-04" },
        });
        fireEvent.change(screen.getByLabelText("Categoria"), {
            target: { value: "category-id" },
        });

        const submitButton = screen.getByRole("button", {
            name: "Salva transazione",
        });

        fireEvent.submit(submitButton.closest("form")!);

        expect(
            await screen.findByText("Seleziona un conto."),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("filters inactive categories and closed buckets from selects", () => {
        renderForm();

        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(
            screen.queryByText("Categoria disattivata"),
        ).not.toBeInTheDocument();

        expect(screen.getByText("Risparmio")).toBeInTheDocument();
        expect(
            screen.queryByText("Portafoglio chiuso"),
        ).not.toBeInTheDocument();
    });

    it("filters accounts, cards and buckets by simulation allowed accounts", () => {
        renderForm({
            context: {
                type: "simulation",
                simulationGroupId: "simulation-group-id",
                allowedAccountIds: ["account-id"],
            },
        });

        expect(screen.getByText("Conto principale")).toBeInTheDocument();
        expect(screen.queryByText("Conto riserva")).not.toBeInTheDocument();

        expect(screen.getByText("Carta principale")).toBeInTheDocument();
        expect(screen.queryByText("Carta riserva")).not.toBeInTheDocument();

        expect(screen.getByText("Risparmio")).toBeInTheDocument();
    });

    it("clears selected card and bucket when account changes", async () => {
        const { onSubmit } = renderForm();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Cambio conto" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "100,00" },
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
        fireEvent.change(screen.getByLabelText(/Carta/i), {
            target: { value: "credit-card-id" },
        });
        fireEvent.change(screen.getByLabelText(/Portafoglio/i), {
            target: { value: "bucket-id" },
        });

        fireEvent.change(screen.getByLabelText("Conto"), {
            target: { value: "second-account-id" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    accountId: "second-account-id",
                    creditCardId: null,
                    bucketId: null,
                }),
            );
        });
    });

    it("calls reference creation actions", () => {
        const onCreateCategory = vi.fn();
        const onCreateAccount = vi.fn();
        const onCreateCreditCard = vi.fn();
        const onCreateBucket = vi.fn();

        renderForm({
            referenceActions: {
                onCreateCategory,
                onCreateAccount,
                onCreateCreditCard,
                onCreateBucket,
            },
        });

        const femaleNewButtons = screen.getAllByRole("button", {
            name: "Nuova",
        });
        const maleNewButtons = screen.getAllByRole("button", {
            name: "Nuovo",
        });

        fireEvent.click(femaleNewButtons[0]);
        fireEvent.click(maleNewButtons[0]);
        fireEvent.click(femaleNewButtons[1]);
        fireEvent.click(maleNewButtons[1]);

        expect(onCreateCategory).toHaveBeenCalledOnce();
        expect(onCreateAccount).toHaveBeenCalledOnce();
        expect(onCreateCreditCard).toHaveBeenCalledOnce();
        expect(onCreateBucket).toHaveBeenCalledOnce();
    });

    it("creates a category from the modal and selects it automatically", async () => {
        vi.mocked(createCategory).mockResolvedValueOnce(
            createdCategoryFromModal,
        );

        renderForm();

        fireEvent.click(screen.getByRole("button", { name: "Nuova" }));

        expect(
            screen.getByRole("dialog", { name: "Nuova categoria" }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Nome categoria"), {
            target: { value: "Trasporti" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea categoria" }));

        await waitFor(() => {
            expect(createCategory).toHaveBeenCalledWith({
                categoryName: "Trasporti",
                categoryDescription: null,
            });
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Nuova categoria" }),
            ).not.toBeInTheDocument();
        });

        expect(store.getState().financeData.categories).toContainEqual(
            createdCategoryFromModal,
        );

        expect(screen.getByLabelText("Categoria")).toHaveValue(
            "created-category-from-modal-id",
        );
    });
});

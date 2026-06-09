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
import {
    createAccount,
    createBucket,
    createCategory,
    createCreditCard,
} from "../api/financeApi";

vi.mock("../api/financeApi", () => ({
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

const createdAccountFromModal = {
    ...account,
    accountId: "created-account-from-modal-id",
    accountName: "Conto nuovo",
    accountDescription: null,
    currency: "EUR",
    issuingInstitution: null,
    openingBalance: 1250.5,
    openingBalanceDate: "2026-06-04",
    accountCreatedAt: "2026-06-04T10:00:00Z",
    accountUpdatedAt: "2026-06-04T10:00:00Z",
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

const createdCreditCardFromModal = {
    ...creditCard,
    creditCardId: "created-credit-card-from-modal-id",
    creditCardName: "Carta nuova",
    creditCardDescription: null,
    creditCardChargeDay: 20,
    accountId: "second-account-id",
    creditCardCreatedAt: "2026-06-04T10:00:00Z",
    creditCardUpdatedAt: "2026-06-04T10:00:00Z",
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

const createdBucketFromModal = {
    ...bucket,
    bucketId: "created-bucket-from-modal-id",
    bucketName: "Portafoglio nuovo",
    bucketDescription: null,
    accountIds: ["second-account-id"],
    bucketCreatedAt: "2026-06-04T10:00:00Z",
    bucketUpdatedAt: "2026-06-04T10:00:00Z",
    bucketClosedAt: null,
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
            expect(onSubmit).toHaveBeenCalledWith([
                {
                    transactionDescription: "Affitto",
                    transactionAmount: "1250.50",
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
                    transactionReminderEnabled: true,
                    transactionReminderDaysBefore: 3,
                },
            ]);
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
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    transactionDescription: "Spesa simulata",
                    transactionAmount: "250.00",
                    transactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                    accountId: "account-id",
                    categoryId: "category-id",
                    transactionIsConfirmed: false,
                    transactionReminderEnabled: false,
                    transactionReminderDaysBefore: 7,
                }),
            ]);
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
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    accountId: "second-account-id",
                    creditCardId: null,
                    bucketId: null,
                }),
            ]);
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

        const femaleNewButtons = screen.getAllByRole("button", {
            name: "Nuova",
        });

        fireEvent.click(femaleNewButtons[0]);

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

    it("creates an account from the modal and selects it automatically", async () => {
        vi.mocked(createAccount).mockResolvedValueOnce(createdAccountFromModal);

        renderForm();

        const accountButtons = screen.getAllByRole("button", { name: "Nuovo" });

        fireEvent.click(accountButtons[0]);

        expect(
            screen.getByRole("dialog", { name: "Nuovo conto" }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Nome conto"), {
            target: { value: "Conto nuovo" },
        });

        fireEvent.change(screen.getByLabelText("Saldo iniziale"), {
            target: { value: "1.250,50" },
        });

        fireEvent.change(screen.getByLabelText("Data saldo iniziale"), {
            target: { value: "2026-06-04" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea conto" }));

        await waitFor(() => {
            expect(createAccount).toHaveBeenCalledWith({
                accountName: "Conto nuovo",
                accountDescription: null,
                currency: "EUR",
                issuingInstitution: null,
                openingBalance: "1250.50",
                openingBalanceDate: "2026-06-04",
            });
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Nuovo conto" }),
            ).not.toBeInTheDocument();
        });

        expect(store.getState().financeData.accounts).toContainEqual(
            createdAccountFromModal,
        );

        expect(screen.getByLabelText("Conto")).toHaveValue(
            "created-account-from-modal-id",
        );
    });

    it("creates a credit card from the modal and selects it automatically", async () => {
        vi.mocked(createCreditCard).mockResolvedValueOnce(
            createdCreditCardFromModal,
        );

        renderForm();

        const femaleNewButtons = screen.getAllByRole("button", {
            name: "Nuova",
        });

        fireEvent.click(femaleNewButtons[1]);

        expect(
            screen.getByRole("dialog", { name: "Nuova carta" }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Nome carta"), {
            target: { value: "Carta nuova" },
        });

        fireEvent.change(screen.getByLabelText("Giorno di addebito"), {
            target: { value: "20" },
        });

        fireEvent.change(screen.getByLabelText("Conto collegato"), {
            target: { value: "second-account-id" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea carta" }));

        await waitFor(() => {
            expect(createCreditCard).toHaveBeenCalledWith({
                creditCardName: "Carta nuova",
                creditCardDescription: null,
                creditCardChargeDay: 20,
                accountId: "second-account-id",
            });
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Nuova carta" }),
            ).not.toBeInTheDocument();
        });

        expect(store.getState().financeData.creditCards).toContainEqual(
            createdCreditCardFromModal,
        );

        expect(screen.getByLabelText("Conto")).toHaveValue("second-account-id");
        expect(screen.getByLabelText(/Carta/i)).toHaveValue(
            "created-credit-card-from-modal-id",
        );
    });

    it("creates a bucket from the modal and selects it automatically", async () => {
        vi.mocked(createBucket).mockResolvedValueOnce(createdBucketFromModal);

        renderForm();

        const maleNewButtons = screen.getAllByRole("button", {
            name: "Nuovo",
        });

        fireEvent.click(maleNewButtons[1]);

        expect(
            screen.getByRole("dialog", { name: "Nuovo portafoglio" }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Nome portafoglio"), {
            target: { value: "Portafoglio nuovo" },
        });

        fireEvent.click(screen.getByLabelText("Conto riserva"));

        fireEvent.click(
            screen.getByRole("button", { name: "Crea portafoglio" }),
        );

        await waitFor(() => {
            expect(createBucket).toHaveBeenCalledWith({
                bucketName: "Portafoglio nuovo",
                bucketDescription: null,
                accountIds: ["second-account-id"],
            });
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", { name: "Nuovo portafoglio" }),
            ).not.toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toContainEqual(
            createdBucketFromModal,
        );

        expect(screen.getByLabelText("Conto")).toHaveValue("second-account-id");
        expect(screen.getByLabelText(/Portafoglio/i)).toHaveValue(
            "created-bucket-from-modal-id",
        );
    });

    it("shows the two-movements hint and submits two requests when credit card and bucket are selected", async () => {
        const { onSubmit } = renderForm();

        fireEvent.change(screen.getByLabelText("Descrizione"), {
            target: { value: "Spesa con carta e portafoglio" },
        });
        fireEvent.change(screen.getByLabelText("Importo"), {
            target: { value: "-500,00" },
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

        expect(screen.getByRole("status")).toHaveTextContent(/2 movimenti/i);

        fireEvent.click(
            screen.getByRole("button", { name: "Salva transazione" }),
        );

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    transactionAmount: "-500.00",
                    creditCardId: null,
                    bucketId: "bucket-id",
                    transactionAffectsAccountBalance: true,
                    transactionAffectsSerenityline: false,
                }),
                expect.objectContaining({
                    transactionAmount: "-500.00",
                    creditCardId: "credit-card-id",
                    bucketId: null,
                    transactionAffectsAccountBalance: false,
                    transactionAffectsSerenityline: true,
                }),
            ]);
        });
    });
    it("hides confirmed and reminder options in simulation context", () => {
        renderForm({
            context: {
                type: "simulation",
                simulationGroupId: "simulation-group-id",
                allowedAccountIds: ["account-id"],
            },
        });

        expect(
            screen.queryByLabelText("Transazione già confermata"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByLabelText("Attiva promemoria"),
        ).not.toBeInTheDocument();
    });

    it("shows a visible reminder for outgoing amount sign", () => {
        renderForm();

        expect(
            screen.getByText(
                "Ricorda: gli importi in uscita vanno inseriti con il segno meno (-) ad es. -50 €.",
            ),
        ).toBeInTheDocument();
    });
});

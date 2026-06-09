import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";

import { AppProviders } from "../../../app/providers/AppProviders";
import { store } from "../../../app/store/store";
import { i18n } from "../../../shared/i18n/i18n";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../financeDataSlice";
import type { FinanceReferenceData } from "../financeDataTypes";
import { RecurringTransactionForm } from "./RecurringTransactionForm";
import type { FinancialPriorityResponseDto } from "../api/financeApiTypes";

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

const financialPriority: FinancialPriorityResponseDto = {
    financialPriorityId: "financial-priority-id",
    financialPriorityCode: "ESSENTIAL",
    financialPriorityDisplayName: "Essenziale",
    financialPriorityDescription: "Spese indispensabili.",
    financialPriorityRanking: 60,
};

const lowerFinancialPriority: FinancialPriorityResponseDto = {
    ...financialPriority,
    financialPriorityId: "lower-financial-priority-id",
    financialPriorityCode: "OPTIONAL",
    financialPriorityDisplayName: "Opzionale",
    financialPriorityDescription: "Spese opzionali.",
    financialPriorityRanking: 40,
};

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [creditCard, secondAccountCreditCard],
    categories: [category, inactiveCategory],
    buckets: [bucket, closedBucket],
    simulationGroups: [],
    financialPriorities: [lowerFinancialPriority, financialPriority],
};

function renderForm(
    props?: Partial<ComponentProps<typeof RecurringTransactionForm>>,
) {
    const onSubmit = props?.onSubmit ?? vi.fn();

    render(
        <AppProviders enableAuthBootstrap={false}>
            <RecurringTransactionForm
                context={{ type: "standard" }}
                onSubmit={onSubmit}
                {...props}
            />
        </AppProviders>,
    );

    return { onSubmit };
}

function changeField(fieldName: string, value: string) {
    const field = document.getElementById(
        `recurringTransactionForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function submitForm() {
    const form = document.querySelector("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
}

function fillRequiredFields() {
    changeField("description", "Affitto");
    changeField("paymentAmount", "850,00");
    changeField("firstPaymentDate", "2026-06-04");
    changeField("recurrenceInterval", "1");
    changeField("recurrenceUnit", "MONTH");
    changeField("category", "category-id");
    changeField("financialPriority", "financial-priority-id");
    changeField("account", "account-id");
}

describe("RecurringTransactionForm", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("submits a standard recurring transaction request with normalized money amount", async () => {
        const { onSubmit } = renderForm();

        fillRequiredFields();

        submitForm();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith([
                {
                    recurringTransactionDescription: "Affitto",
                    paymentAmount: "850.00",
                    recurringTransactionAmountIsAdjustable: false,
                    recurringTransactionFirstPaymentDate: "2026-06-04",
                    recurrenceInterval: 1,
                    recurrenceUnit: "MONTH",
                    paymentDateAdjustmentPolicy: "NONE",
                    recurringTransactionEndDate: null,
                    finalPaymentAmount: null,
                    categoryId: "category-id",
                    financialPriorityId: "financial-priority-id",
                    linkedAccountId: "account-id",
                    linkedCreditCardId: null,
                    linkedBucketId: null,
                    recurringTransactionAffectsAccountBalance: true,
                    recurringtransactionAffectsSerenityline: true,
                    recurringTransactionIsSimulated: false,
                    simulationGroupId: null,
                    recurringTransactionReminderEnabled: false,
                    recurringTransactionReminderDaysBefore: 7,
                },
            ]);
        });
    });

    it("submits a simulated recurring transaction request from simulation context", async () => {
        const { onSubmit } = renderForm({
            context: {
                type: "simulation",
                simulationGroupId: "simulation-group-id",
                allowedAccountIds: ["account-id"],
            },
        });

        fillRequiredFields();

        submitForm();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    recurringTransactionDescription: "Affitto",
                    paymentAmount: "850.00",
                    linkedAccountId: "account-id",
                    categoryId: "category-id",
                    financialPriorityId: "financial-priority-id",
                    recurringTransactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                }),
            ]);
        });
    });

    it("shows validation error when financial priority is missing", async () => {
        const { onSubmit } = renderForm();

        changeField("description", "Affitto");
        changeField("paymentAmount", "850,00");
        changeField("firstPaymentDate", "2026-06-04");
        changeField("recurrenceInterval", "1");
        changeField("recurrenceUnit", "MONTH");
        changeField("category", "category-id");
        changeField("account", "account-id");

        submitForm();

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent(/priorit/i);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("filters inactive categories, closed buckets and simulation unavailable accounts", () => {
        renderForm({
            context: {
                type: "simulation",
                simulationGroupId: "simulation-group-id",
                allowedAccountIds: ["account-id"],
            },
        });

        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(
            screen.queryByText("Categoria disattivata"),
        ).not.toBeInTheDocument();

        expect(screen.getByText("Conto principale")).toBeInTheDocument();
        expect(screen.queryByText("Conto riserva")).not.toBeInTheDocument();

        expect(screen.getByText("Carta principale")).toBeInTheDocument();
        expect(screen.queryByText("Carta riserva")).not.toBeInTheDocument();

        expect(screen.getByText("Risparmio")).toBeInTheDocument();
        expect(
            screen.queryByText("Portafoglio chiuso"),
        ).not.toBeInTheDocument();
    });

    it("shows the two-movements hint and submits two requests when credit card and bucket are selected", async () => {
        const { onSubmit } = renderForm();

        fillRequiredFields();
        changeField("paymentAmount", "-500,00");
        changeField("finalPaymentAmount", "-450,00");
        changeField("creditCard", "credit-card-id");
        changeField("bucket", "bucket-id");

        expect(screen.getByRole("status")).toHaveTextContent(/2 movimenti/i);

        submitForm();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    paymentAmount: "-500.00",
                    finalPaymentAmount: "-450.00",
                    linkedCreditCardId: null,
                    linkedBucketId: "bucket-id",
                    recurringTransactionAffectsAccountBalance: true,
                    recurringtransactionAffectsSerenityline: false,
                }),
                expect.objectContaining({
                    paymentAmount: "-500.00",
                    finalPaymentAmount: "-450.00",
                    linkedCreditCardId: "credit-card-id",
                    linkedBucketId: null,
                    recurringTransactionAffectsAccountBalance: false,
                    recurringtransactionAffectsSerenityline: true,
                }),
            ]);
        });
    });

    it("submits a bucket transfer from a positive form amount", async () => {
        const { onSubmit } = renderForm();

        fillRequiredFields();
        changeField("paymentAmount", "+500,00");
        changeField("bucket", "bucket-id");

        submitForm();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith([
                expect.objectContaining({
                    paymentAmount: "-500.00",
                    linkedCreditCardId: null,
                    linkedBucketId: "bucket-id",
                    recurringTransactionAffectsAccountBalance: false,
                    recurringtransactionAffectsSerenityline: true,
                }),
            ]);
        });
    });

    it("shows a visible reminder for outgoing recurring amount sign", () => {
        renderForm();

        expect(
            screen.getByText(
                "Ricorda: gli importi in uscita vanno inseriti con il segno meno (-) ad es. -50 €.",
            ),
        ).toBeInTheDocument();
    });
});

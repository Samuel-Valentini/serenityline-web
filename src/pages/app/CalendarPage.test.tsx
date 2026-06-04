import { MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import { listCalendarMovements } from "../../features/finance/api/financeApi";
import { clearFinanceCalendarCacheForTests } from "../../features/finance/calendar/useFinanceCalendarCache";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { CalendarPage } from "./CalendarPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    listCalendarMovements: vi.fn(),
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

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [],
    categories: [category],
    buckets: [bucket],
    simulationGroups: [],
    financialPriorities: [],
};

const persistedMovement = {
    movementType: "PERSISTED_TRANSACTION" as const,
    transactionId: "transaction-id",
    recurringTransactionId: null,
    logicalDate: "2026-06-05",
    chargeDate: "2026-06-05",
    description: "Stipendio",
    amount: 2000,
    affectsAccountBalance: true,
    affectsSerenityline: true,
    categoryId: "category-id",
    financialPriorityId: null,
    accountId: "account-id",
    creditCardId: null,
    bucketId: null,
    confirmed: true,
    simulated: false,
    simulationGroupId: null,
    userEntered: true,
    finalOccurrence: false,
};

const projectedRecurringMovement = {
    ...persistedMovement,
    movementType: "PROJECTED_RECURRING_TRANSACTION" as const,
    transactionId: null,
    recurringTransactionId: "recurring-transaction-id",
    logicalDate: "2026-06-20",
    chargeDate: "2026-06-20",
    description: "Affitto previsto",
    amount: -850,
    confirmed: false,
    userEntered: false,
};

const technicalCreditCardMovement = {
    ...persistedMovement,
    movementType:
        "TECHNICAL_CREDIT_CARD_CHARGE_FROM_PROJECTED_RECURRING_TRANSACTION" as const,
    transactionId: null,
    recurringTransactionId: "recurring-card-transaction-id",
    logicalDate: "2026-06-25",
    chargeDate: "2026-07-15",
    description: "Addebito carta previsto",
    amount: -120,
    confirmed: false,
    creditCardId: "credit-card-id",
    bucketId: "bucket-id",
    userEntered: false,
};

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <MemoryRouter>
                <CalendarPage />
            </MemoryRouter>
        </AppProviders>,
    );
}

describe("CalendarPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        clearFinanceCalendarCacheForTests();
        store.dispatch(financeDataCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("loads the initial calendar range and shows calendar movements", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([
            persistedMovement,
            projectedRecurringMovement,
            technicalCreditCardMovement,
        ]);

        renderPage();

        await waitFor(() => {
            expect(listCalendarMovements).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                    to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                }),
            );
        });

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();
        expect(screen.getByText("Affitto previsto")).toBeInTheDocument();
        expect(screen.getByText("Addebito carta previsto")).toBeInTheDocument();

        expect(screen.getByText("Transazione")).toBeInTheDocument();
        expect(screen.getByText("Ricorrente prevista")).toBeInTheDocument();
        expect(screen.getByText("Addebito carta")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Aggiungi transazione" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: "Aggiungi transazione ricorrente",
            }),
        ).toBeInTheDocument();
    });

    it("reuses the in-memory cache when the page is mounted again", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([persistedMovement]);

        const firstRender = render(
            <AppProviders enableAuthBootstrap={false}>
                <MemoryRouter>
                    <CalendarPage />
                </MemoryRouter>
            </AppProviders>,
        );

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();

        firstRender.unmount();

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();
        expect(listCalendarMovements).toHaveBeenCalledTimes(1);
    });
});

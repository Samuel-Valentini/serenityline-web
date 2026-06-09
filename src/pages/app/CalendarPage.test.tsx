import { MemoryRouter } from "react-router";
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
    confirmRecurringTransactionOccurrence,
    getTransaction,
    listCalendarMovements,
    updateTransaction,
} from "../../features/finance/api/financeApi";
import { clearFinanceCalendarCacheForTests } from "../../features/finance/calendar/useFinanceCalendarCache";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { CalendarPage } from "./CalendarPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    confirmRecurringTransactionOccurrence: vi.fn(),
    getTransaction: vi.fn(),
    listCalendarMovements: vi.fn(),
    updateTransaction: vi.fn(),
}));

const unconfirmedTransaction = {
    transactionId: "unconfirmed-transaction-id",
    transactionDescription: "Bollette",
    transactionAmount: -90,
    transactionAffectsAccountBalance: true,
    transactionAffectsSerenityline: true,
    categoryId: "category-id",
    transactionChargeDate: "2026-06-05",
    transactionIsConfirmed: false,
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
    transactionCreatedAt: "2026-06-05T10:00:00Z",
    transactionUpdatedAt: "2026-06-05T10:00:00Z",
};

const simulationGroup = {
    simulationGroupId: "simulation-group-id",
    simulationGroupName: "Scenario vacanza",
    simulationGroupDescription: "Simulazione ferie estive",
    simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
    simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
    simulationGroupArchivedAt: null,
    accountIds: ["account-id"],
};

const secondSimulationGroup = {
    simulationGroupId: "second-simulation-group-id",
    simulationGroupName: "Scenario casa",
    simulationGroupDescription: "Simulazione acquisto casa",
    simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
    simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
    simulationGroupArchivedAt: null,
    accountIds: ["account-id"],
};

const confirmedTransaction = {
    ...unconfirmedTransaction,
    transactionIsConfirmed: true,
    transactionUpdatedAt: "2026-06-05T11:00:00Z",
};

const confirmedRecurringTransaction = {
    ...confirmedTransaction,
    transactionId: "confirmed-recurring-transaction-id",
    transactionDescription: "Affitto previsto",
    transactionAmount: -900,
    transactionChargeDate: "2026-06-21",
    recurringTransactionId: "recurring-transaction-id",
    recurringTransactionLogicalDate: "2026-06-20",
};

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
    simulationGroups: [simulationGroup, secondSimulationGroup],
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

const simulatedMovement = {
    ...persistedMovement,
    transactionId: "simulated-transaction-id",
    description: "Movimento simulato",
    chargeDate: "2026-06-10",
    logicalDate: "2026-06-10",
    simulated: true,
    simulationGroupId: "simulation-group-id",
};

const unconfirmedPersistedMovement = {
    ...persistedMovement,
    transactionId: "unconfirmed-transaction-id",
    description: "Bollette",
    amount: -90,
    confirmed: false,
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

const nextRangeMovement = {
    ...persistedMovement,
    transactionId: "next-range-transaction-id",
    logicalDate: "2027-01-15",
    chargeDate: "2027-01-15",
    description: "Movimento futuro",
    amount: -75,
    confirmed: false,
};

const serenitylineOnlyMovement = {
    ...persistedMovement,
    transactionId: "serenityline-only-transaction-id",
    description: "Acquisto carta",
    amount: -50,
    affectsAccountBalance: false,
    affectsSerenityline: true,
};

const accountBalanceOnlyMovement = {
    ...persistedMovement,
    transactionId: "account-balance-only-transaction-id",
    description: "Addebito tecnico già considerato",
    amount: -50,
    affectsAccountBalance: true,
    affectsSerenityline: false,
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

function openFiltersPanel() {
    const filtersToggle = screen.getByRole("button", { name: /Filtri/i });

    if (filtersToggle.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(filtersToggle);
    }
}

function openSimulationGroupsPanel() {
    const simulationsToggle = screen.getByRole("button", {
        name: /Scenari simulati/i,
    });

    if (simulationsToggle.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(simulationsToggle);
    }
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

    it("filters loaded calendar movements locally", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([
            persistedMovement,
            projectedRecurringMovement,
            technicalCreditCardMovement,
        ]);

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();
        expect(screen.getByText("Affitto previsto")).toBeInTheDocument();
        expect(screen.getByText("Addebito carta previsto")).toBeInTheDocument();

        openFiltersPanel();

        fireEvent.change(screen.getByLabelText("Cerca"), {
            target: { value: "affitto" },
        });

        expect(screen.queryByText("Stipendio")).not.toBeInTheDocument();
        expect(screen.getByText("Affitto previsto")).toBeInTheDocument();
        expect(
            screen.queryByText("Addebito carta previsto"),
        ).not.toBeInTheDocument();

        expect(listCalendarMovements).toHaveBeenCalledTimes(1);
    });

    it("filters loaded movements by confirmation status", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([
            persistedMovement,
            projectedRecurringMovement,
        ]);

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();
        expect(screen.getByText("Affitto previsto")).toBeInTheDocument();

        openFiltersPanel();

        fireEvent.change(screen.getByLabelText("Stato conferma"), {
            target: { value: "unconfirmed" },
        });

        expect(screen.queryByText("Stipendio")).not.toBeInTheDocument();
        expect(screen.getByText("Affitto previsto")).toBeInTheDocument();

        expect(listCalendarMovements).toHaveBeenCalledTimes(1);
    });

    it("loads the next calendar range before reaching the bottom of the scroll window", async () => {
        vi.mocked(listCalendarMovements)
            .mockResolvedValueOnce([persistedMovement])
            .mockResolvedValueOnce([nextRangeMovement]);

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();

        const calendarWindow = screen.getByLabelText(
            "Finestra scorrevole del calendario finanziario",
        );

        Object.defineProperty(calendarWindow, "scrollHeight", {
            configurable: true,
            value: 2_000,
        });
        Object.defineProperty(calendarWindow, "clientHeight", {
            configurable: true,
            value: 500,
        });
        Object.defineProperty(calendarWindow, "scrollTop", {
            configurable: true,
            value: 1_200,
            writable: true,
        });

        fireEvent.scroll(calendarWindow);

        await waitFor(() => {
            expect(listCalendarMovements).toHaveBeenCalledTimes(2);
        });

        expect(await screen.findByText("Movimento futuro")).toBeInTheDocument();
    });

    it("confirms an unconfirmed persisted transaction movement", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([
            unconfirmedPersistedMovement,
        ]);
        vi.mocked(getTransaction).mockResolvedValue(unconfirmedTransaction);
        vi.mocked(updateTransaction).mockResolvedValue(confirmedTransaction);

        renderPage();

        expect(await screen.findByText("Bollette")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

        await waitFor(() => {
            expect(getTransaction).toHaveBeenCalledWith(
                "unconfirmed-transaction-id",
            );
            expect(updateTransaction).toHaveBeenCalledWith(
                "unconfirmed-transaction-id",
                expect.objectContaining({
                    transactionDescription: "Bollette",
                    transactionIsConfirmed: true,
                }),
            );
        });

        expect(
            await screen.findByText("Transazione confermata."),
        ).toBeInTheDocument();
    });

    it("confirms a projected recurring movement with editable amount and charge date", async () => {
        vi.mocked(listCalendarMovements).mockResolvedValue([
            projectedRecurringMovement,
        ]);
        vi.mocked(confirmRecurringTransactionOccurrence).mockResolvedValue(
            confirmedRecurringTransaction,
        );

        renderPage();

        expect(await screen.findByText("Affitto previsto")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

        const confirmCell = screen
            .getByRole("heading", {
                name: "Conferma ricorrenza prevista",
            })
            .closest("td");

        expect(confirmCell).not.toBeNull();

        fireEvent.change(within(confirmCell!).getByLabelText("Importo"), {
            target: { value: "-900,00" },
        });
        fireEvent.change(within(confirmCell!).getByLabelText("Data addebito"), {
            target: { value: "2026-06-21" },
        });

        fireEvent.click(
            within(confirmCell!).getByRole("button", {
                name: "Conferma ricorrenza",
            }),
        );

        await waitFor(() => {
            expect(confirmRecurringTransactionOccurrence).toHaveBeenCalledWith(
                "recurring-transaction-id",
                {
                    logicalDate: "2026-06-20",
                    transactionAmount: "-900.00",
                    transactionChargeDate: "2026-06-21",
                },
            );
        });

        expect(
            await screen.findByText(
                "Ricorrenza confermata e salvata come transazione.",
            ),
        ).toBeInTheDocument();
    });

    it("reloads the calendar when a simulation group is selected", async () => {
        vi.mocked(listCalendarMovements)
            .mockResolvedValueOnce([persistedMovement])
            .mockResolvedValueOnce([simulatedMovement]);

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();

        openSimulationGroupsPanel();

        fireEvent.click(
            screen.getByRole("button", { name: "Scenario vacanza" }),
        );

        await waitFor(() => {
            expect(listCalendarMovements).toHaveBeenCalledTimes(2);
            expect(listCalendarMovements).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    simulationGroupIds: ["simulation-group-id"],
                }),
            );
        });

        expect(
            await screen.findByText("Movimento simulato"),
        ).toBeInTheDocument();
    });

    it("supports selecting multiple simulation groups", async () => {
        vi.mocked(listCalendarMovements)
            .mockResolvedValueOnce([persistedMovement])
            .mockResolvedValueOnce([simulatedMovement])
            .mockResolvedValueOnce([
                {
                    ...simulatedMovement,
                    transactionId: "multi-simulation-transaction-id",
                    description: "Movimento multi simulazione",
                    simulationGroupId: "second-simulation-group-id",
                },
            ]);

        renderPage();

        expect(await screen.findByText("Stipendio")).toBeInTheDocument();

        openSimulationGroupsPanel();

        fireEvent.click(
            screen.getByRole("button", { name: "Scenario vacanza" }),
        );

        await waitFor(() => {
            expect(listCalendarMovements).toHaveBeenCalledTimes(2);
        });

        fireEvent.click(screen.getByRole("button", { name: "Scenario casa" }));

        await waitFor(() => {
            expect(listCalendarMovements).toHaveBeenCalledTimes(3);
            expect(listCalendarMovements).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    simulationGroupIds: [
                        "second-simulation-group-id",
                        "simulation-group-id",
                    ],
                }),
            );
        });

        expect(
            await screen.findByText("Movimento multi simulazione"),
        ).toBeInTheDocument();
    });

    it("shows separate SerenityLine and movement amounts using the effect flags", async () => {
    vi.mocked(listCalendarMovements).mockResolvedValue([
        serenitylineOnlyMovement,
        accountBalanceOnlyMovement,
    ]);

    renderPage();

    const serenitylineOnlyRow = (
        await screen.findByText("Acquisto carta")
    ).closest("tr");

    expect(serenitylineOnlyRow).not.toBeNull();

    const serenitylineOnlyAmountCell =
        within(serenitylineOnlyRow!).getAllByRole("cell")[1];

    expect(
        within(serenitylineOnlyAmountCell).getByRole("group", {
            name: "SerenityLine",
        }),
    ).toHaveTextContent(/-50,00\s€/);

    expect(
        within(serenitylineOnlyAmountCell).getByRole("group", {
            name: "Movimento",
        }),
    ).toHaveTextContent(/0,00\s€/);

    const accountBalanceOnlyRow = (
        await screen.findByText("Addebito tecnico già considerato")
    ).closest("tr");

    expect(accountBalanceOnlyRow).not.toBeNull();

    const accountBalanceOnlyAmountCell =
        within(accountBalanceOnlyRow!).getAllByRole("cell")[1];

    expect(
        within(accountBalanceOnlyAmountCell).getByRole("group", {
            name: "SerenityLine",
        }),
    ).toHaveTextContent(/0,00\s€/);

    expect(
        within(accountBalanceOnlyAmountCell).getByRole("group", {
            name: "Movimento",
        }),
    ).toHaveTextContent(/-50,00\s€/);
});
});

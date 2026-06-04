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
    archiveSimulationGroup,
    createRecurringTransaction,
    createSimulationGroup,
    linkSimulationGroupAccount,
    restoreSimulationGroup,
    unlinkSimulationGroupAccount,
    updateSimulationGroup,
    listRecurringTransactions,
    listTransactions,
    updateTransaction,
} from "../../features/finance/api/financeApi";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { SimulationsPage } from "./SimulationsPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    archiveSimulationGroup: vi.fn(),
    createRecurringTransaction: vi.fn(),
    createSimulationGroup: vi.fn(),
    createTransaction: vi.fn(),
    linkSimulationGroupAccount: vi.fn(),
    restoreSimulationGroup: vi.fn(),
    unlinkSimulationGroupAccount: vi.fn(),
    updateSimulationGroup: vi.fn(),
    listRecurringTransactions: vi.fn(),
    listTransactions: vi.fn(),
    updateTransaction: vi.fn(),
}));

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

const simulationGroup = {
    simulationGroupId: "simulation-group-id",
    simulationGroupName: "Scenario base",
    simulationGroupDescription: "Scenario principale",
    simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
    simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
    simulationGroupArchivedAt: null,
    accountIds: ["account-id"],
};

const archivedSimulationGroup = {
    ...simulationGroup,
    simulationGroupId: "archived-simulation-group-id",
    simulationGroupName: "Scenario archiviato",
    simulationGroupDescription: null,
    simulationGroupArchivedAt: "2026-06-01T00:00:00Z",
    accountIds: ["second-account-id"],
};

const createdSimulationGroup = {
    simulationGroupId: "created-simulation-group-id",
    simulationGroupName: "Scenario vacanze",
    simulationGroupDescription: null,
    simulationGroupCreatedAt: "2026-06-04T10:00:00Z",
    simulationGroupUpdatedAt: "2026-06-04T10:00:00Z",
    simulationGroupArchivedAt: null,
    accountIds: ["account-id"],
};

const simulatedTransaction = {
    transactionId: "transaction-id",
    transactionDescription: "Spesa simulata",
    transactionAmount: -50,
    transactionAffectsAccountBalance: true,
    transactionAffectsSerenityline: true,
    categoryId: "category-id",
    transactionChargeDate: "2026-06-05",
    transactionIsConfirmed: false,
    accountId: "account-id",
    creditCardId: null,
    bucketId: null,
    transactionIsSimulated: true,
    simulationGroupId: "simulation-group-id",
    transactionIsUserEntered: true,
    recurringTransactionId: null,
    recurringTransactionLogicalDate: null,
    recurringTransactionConfirmedAt: null,
    transactionReminderEnabled: false,
    transactionReminderDaysBefore: 7,
    transactionCreatedAt: "2026-06-05T10:00:00Z",
    transactionUpdatedAt: "2026-06-05T10:00:00Z",
};

const updatedSimulatedTransaction = {
    ...simulatedTransaction,
    transactionDescription: "Spesa aggiornata",
    transactionAmount: -75,
    transactionChargeDate: "2026-06-06",
    transactionUpdatedAt: "2026-06-06T10:00:00Z",
};

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [creditCard],
    categories: [category],
    buckets: [bucket],
    simulationGroups: [archivedSimulationGroup, simulationGroup],
    financialPriorities: [financialPriority],
};

function submitSimulationRecurringForm() {
    const descriptionField = document.getElementById(
        "simulation-simulation-group-id-recurringTransactionForm-description",
    );

    expect(descriptionField).not.toBeNull();

    const form = descriptionField!.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
}

function changeSimulationRecurringField(fieldName: string, value: string) {
    const field = document.getElementById(
        `simulation-simulation-group-id-recurringTransactionForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function fillRequiredSimulationRecurringFields() {
    changeSimulationRecurringField("description", "Affitto simulato");
    changeSimulationRecurringField("paymentAmount", "850,00");
    changeSimulationRecurringField("firstPaymentDate", "2026-06-04");
    changeSimulationRecurringField("recurrenceInterval", "1");
    changeSimulationRecurringField("recurrenceUnit", "MONTH");
    changeSimulationRecurringField("category", "category-id");
    changeSimulationRecurringField(
        "financialPriority",
        "financial-priority-id",
    );
    changeSimulationRecurringField("account", "account-id");
}

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <SimulationsPage />
        </AppProviders>,
    );
}

async function openSimulatedTransactionEditForm() {
    vi.mocked(listRecurringTransactions).mockResolvedValueOnce([]);
    vi.mocked(listTransactions).mockResolvedValueOnce([simulatedTransaction]);

    renderPage();

    fireEvent.click(
        screen.getByRole("button", {
            name: "Visualizza movimenti collegati",
        }),
    );

    const transactionDescription = await screen.findByText("Spesa simulata");
    const transactionRow = transactionDescription.closest("tr");

    expect(transactionRow).not.toBeNull();

    fireEvent.click(
        within(transactionRow!).getByRole("button", { name: "Modifica" }),
    );
}

function changeSimulationTransactionEditField(
    fieldName: string,
    value: string,
) {
    const field = document.getElementById(
        `simulation-simulation-group-id-transaction-transaction-id-editForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function submitSimulationTransactionEditForm() {
    const descriptionField = document.getElementById(
        "simulation-simulation-group-id-transaction-transaction-id-editForm-description",
    );

    expect(descriptionField).not.toBeNull();

    const form = descriptionField!.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);
}

describe("SimulationsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("renders existing simulation groups with linked accounts and status", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: "Simulazioni" }),
        ).toBeInTheDocument();

        expect(screen.getByText("Scenario base")).toBeInTheDocument();
        expect(screen.getByText("Scenario principale")).toBeInTheDocument();

        expect(screen.getByText("Scenario archiviato")).toBeInTheDocument();

        expect(screen.getAllByText("Conto principale").length).toBeGreaterThan(
            0,
        );
        expect(screen.getAllByText("Conto riserva").length).toBeGreaterThan(0);

        expect(screen.getByText("Attiva")).toBeInTheDocument();
        expect(screen.getByText("Archiviata")).toBeInTheDocument();
    });

    it("shows validation error when simulation name is missing", async () => {
        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Crea simulazione" }),
        );

        expect(
            await screen.findByText("Inserisci un nome per la simulazione."),
        ).toBeInTheDocument();

        expect(createSimulationGroup).not.toHaveBeenCalled();
    });

    it("shows validation error when no account is selected", async () => {
        renderPage();

        fireEvent.change(screen.getByLabelText("Nome simulazione"), {
            target: { value: "Scenario senza conti" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Crea simulazione" }),
        );

        expect(
            await screen.findByText("Seleziona almeno un conto."),
        ).toBeInTheDocument();

        expect(createSimulationGroup).not.toHaveBeenCalled();
    });

    it("creates a simulation group and adds it to the finance data state", async () => {
        vi.mocked(createSimulationGroup).mockResolvedValueOnce(
            createdSimulationGroup,
        );

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome simulazione"), {
            target: { value: "Scenario vacanze" },
        });

        fireEvent.click(screen.getByLabelText("Conto principale"));

        fireEvent.click(
            screen.getByRole("button", { name: "Crea simulazione" }),
        );

        await waitFor(() => {
            expect(createSimulationGroup).toHaveBeenCalledWith({
                simulationGroupName: "Scenario vacanze",
                simulationGroupDescription: null,
                accountIds: ["account-id"],
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Simulazione creata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            createdSimulationGroup,
        );

        expect(screen.getByLabelText("Nome simulazione")).toHaveValue("");
        expect(screen.getByLabelText("Conto principale")).not.toBeChecked();
    });

    it("creates a simulation group with description and multiple accounts", async () => {
        vi.mocked(createSimulationGroup).mockResolvedValueOnce({
            ...createdSimulationGroup,
            simulationGroupDescription: "Scenario con due conti",
            accountIds: ["account-id", "second-account-id"],
        });

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome simulazione"), {
            target: { value: "Scenario completo" },
        });

        fireEvent.change(screen.getByLabelText(/Descrizione/i), {
            target: { value: "Scenario con due conti" },
        });

        fireEvent.click(screen.getByLabelText("Conto principale"));
        fireEvent.click(screen.getByLabelText("Conto riserva"));

        fireEvent.click(
            screen.getByRole("button", { name: "Crea simulazione" }),
        );

        await waitFor(() => {
            expect(createSimulationGroup).toHaveBeenCalledWith({
                simulationGroupName: "Scenario completo",
                simulationGroupDescription: "Scenario con due conti",
                accountIds: ["account-id", "second-account-id"],
            });
        });
    });

    it("updates an existing simulation group", async () => {
        const updatedSimulationGroup = {
            ...simulationGroup,
            simulationGroupName: "Scenario aggiornato",
            simulationGroupDescription: "Descrizione aggiornata",
            simulationGroupUpdatedAt: "2026-06-04T12:00:00Z",
        };

        vi.mocked(updateSimulationGroup).mockResolvedValueOnce(
            updatedSimulationGroup,
        );

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const nameFields = screen.getAllByLabelText("Nome simulazione");
        const descriptionFields = screen.getAllByLabelText(/Descrizione/i);

        fireEvent.change(nameFields[1], {
            target: { value: "Scenario aggiornato" },
        });

        fireEvent.change(descriptionFields[1], {
            target: { value: "Descrizione aggiornata" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Salva" }));

        await waitFor(() => {
            expect(updateSimulationGroup).toHaveBeenCalledWith(
                "simulation-group-id",
                {
                    simulationGroupName: "Scenario aggiornato",
                    simulationGroupDescription: "Descrizione aggiornata",
                },
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Simulazione aggiornata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            updatedSimulationGroup,
        );

        expect(screen.getByText("Scenario aggiornato")).toBeInTheDocument();
        expect(screen.getByText("Descrizione aggiornata")).toBeInTheDocument();
    });

    it("shows validation error when edited simulation name is missing", async () => {
        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const nameFields = screen.getAllByLabelText("Nome simulazione");

        fireEvent.change(nameFields[1], {
            target: { value: "" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Salva" }));

        expect(
            await screen.findByText("Inserisci un nome per la simulazione."),
        ).toBeInTheDocument();

        expect(updateSimulationGroup).not.toHaveBeenCalled();
    });

    it("archives an active simulation group", async () => {
        const archivedGroup = {
            ...simulationGroup,
            simulationGroupArchivedAt: "2026-06-04T12:00:00Z",
            simulationGroupUpdatedAt: "2026-06-04T12:00:00Z",
        };

        vi.mocked(archiveSimulationGroup).mockResolvedValueOnce(archivedGroup);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Archivia" }));

        await waitFor(() => {
            expect(archiveSimulationGroup).toHaveBeenCalledWith(
                "simulation-group-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Simulazione archiviata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            archivedGroup,
        );

        expect(screen.getAllByText("Archiviata").length).toBeGreaterThanOrEqual(
            2,
        );
    });

    it("restores an archived simulation group", async () => {
        const restoredGroup = {
            ...archivedSimulationGroup,
            simulationGroupArchivedAt: null,
            simulationGroupUpdatedAt: "2026-06-04T12:00:00Z",
        };

        vi.mocked(restoreSimulationGroup).mockResolvedValueOnce(restoredGroup);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Ripristina" }));

        await waitFor(() => {
            expect(restoreSimulationGroup).toHaveBeenCalledWith(
                "archived-simulation-group-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Simulazione ripristinata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            restoredGroup,
        );

        expect(screen.getAllByText("Attiva").length).toBeGreaterThanOrEqual(2);
    });

    it("opens account management and links another account to an active simulation group", async () => {
        const updatedSimulationGroup = {
            ...simulationGroup,
            accountIds: ["account-id", "second-account-id"],
            simulationGroupUpdatedAt: "2026-06-04T12:00:00Z",
        };

        vi.mocked(linkSimulationGroupAccount).mockResolvedValueOnce(
            updatedSimulationGroup,
        );

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Gestisci conti" }));

        const table = screen.getByRole("table");

        fireEvent.click(within(table).getByLabelText("Conto riserva"));

        await waitFor(() => {
            expect(linkSimulationGroupAccount).toHaveBeenCalledWith(
                "simulation-group-id",
                "second-account-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto collegato alla simulazione."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            updatedSimulationGroup,
        );
    });

    it("unlinks an account from an active simulation group with multiple linked accounts", async () => {
        const simulationGroupWithTwoAccounts = {
            ...simulationGroup,
            accountIds: ["account-id", "second-account-id"],
        };

        const updatedSimulationGroup = {
            ...simulationGroupWithTwoAccounts,
            accountIds: ["second-account-id"],
            simulationGroupUpdatedAt: "2026-06-04T12:00:00Z",
        };

        store.dispatch(financeDataCleared());
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                simulationGroups: [
                    archivedSimulationGroup,
                    simulationGroupWithTwoAccounts,
                ],
            }),
        );

        vi.mocked(unlinkSimulationGroupAccount).mockResolvedValueOnce(
            updatedSimulationGroup,
        );

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Gestisci conti" }));

        const table = screen.getByRole("table");

        fireEvent.click(within(table).getByLabelText("Conto principale"));

        await waitFor(() => {
            expect(unlinkSimulationGroupAccount).toHaveBeenCalledWith(
                "simulation-group-id",
                "account-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto scollegato dalla simulazione."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.simulationGroups).toContainEqual(
            updatedSimulationGroup,
        );
    });

    it("prevents unlinking the last account from an active simulation group", async () => {
        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Gestisci conti" }));

        const table = screen.getByRole("table");

        fireEvent.click(within(table).getByLabelText("Conto principale"));

        expect(
            await screen.findByText("Seleziona almeno un conto."),
        ).toBeInTheDocument();

        expect(unlinkSimulationGroupAccount).not.toHaveBeenCalled();
        expect(linkSimulationGroupAccount).not.toHaveBeenCalled();
    });

    it("closes account management mode", () => {
        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Gestisci conti" }));

        expect(
            screen.getByRole("button", { name: "Fine" }),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Fine" }));

        expect(
            screen.queryByRole("button", { name: "Fine" }),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Gestisci conti" }),
        ).toBeInTheDocument();
    });

    it("opens the simulated recurring transaction form for an active simulation group", () => {
        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Aggiungi ricorrente" }),
        );

        expect(
            screen.getByText("Nuovo movimento ricorrente simulato"),
        ).toBeInTheDocument();

        expect(
            document.getElementById(
                "simulation-simulation-group-id-recurringTransactionForm-description",
            ),
        ).not.toBeNull();

        expect(
            screen.queryByLabelText("Attiva promemoria"),
        ).not.toBeInTheDocument();
    });

    it("creates a simulated recurring transaction", async () => {
        vi.mocked(createRecurringTransaction).mockResolvedValueOnce(
            {} as Awaited<ReturnType<typeof createRecurringTransaction>>,
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Aggiungi ricorrente" }),
        );

        fillRequiredSimulationRecurringFields();
        submitSimulationRecurringForm();

        await waitFor(() => {
            expect(createRecurringTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    recurringTransactionDescription: "Affitto simulato",
                    paymentAmount: "850.00",
                    recurringTransactionFirstPaymentDate: "2026-06-04",
                    recurrenceInterval: 1,
                    recurrenceUnit: "MONTH",
                    paymentDateAdjustmentPolicy: "NONE",
                    categoryId: "category-id",
                    financialPriorityId: "financial-priority-id",
                    linkedAccountId: "account-id",
                    recurringTransactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                    recurringTransactionReminderEnabled: false,
                    recurringTransactionReminderDaysBefore: 7,
                }),
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Movimento ricorrente simulato creato correttamente.",
                ),
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByText("Nuovo movimento ricorrente simulato"),
        ).not.toBeInTheDocument();
    });

    it("creates two simulated recurring transactions when credit card and bucket are selected", async () => {
        vi.mocked(createRecurringTransaction)
            .mockResolvedValueOnce(
                {} as Awaited<ReturnType<typeof createRecurringTransaction>>,
            )
            .mockResolvedValueOnce(
                {} as Awaited<ReturnType<typeof createRecurringTransaction>>,
            );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Aggiungi ricorrente" }),
        );

        fillRequiredSimulationRecurringFields();
        changeSimulationRecurringField("paymentAmount", "-120,00");
        changeSimulationRecurringField("creditCard", "credit-card-id");
        changeSimulationRecurringField("bucket", "bucket-id");

        submitSimulationRecurringForm();

        await waitFor(() => {
            expect(createRecurringTransaction).toHaveBeenCalledTimes(2);
        });

        expect(createRecurringTransaction).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                paymentAmount: "-120.00",
                linkedCreditCardId: null,
                linkedBucketId: "bucket-id",
                recurringTransactionAffectsAccountBalance: true,
                recurringtransactionAffectsSerenityline: false,
                recurringTransactionIsSimulated: true,
                simulationGroupId: "simulation-group-id",
            }),
        );

        expect(createRecurringTransaction).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                paymentAmount: "-120.00",
                linkedCreditCardId: "credit-card-id",
                linkedBucketId: null,
                recurringTransactionAffectsAccountBalance: false,
                recurringtransactionAffectsSerenityline: true,
                recurringTransactionIsSimulated: true,
                simulationGroupId: "simulation-group-id",
            }),
        );
    });

    it("shows an error when simulated recurring transaction creation fails", async () => {
        vi.mocked(createRecurringTransaction).mockRejectedValueOnce(
            new Error("Errore ricorrenza simulata"),
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Aggiungi ricorrente" }),
        );

        fillRequiredSimulationRecurringFields();

        submitSimulationRecurringForm();

        expect(
            await screen.findByText("Errore ricorrenza simulata"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Nuovo movimento ricorrente simulato"),
        ).toBeInTheDocument();
    });

    it("opens the edit form for a simulated transaction", async () => {
        await openSimulatedTransactionEditForm();

        expect(
            screen.getByText("Modifica transazione simulata"),
        ).toBeInTheDocument();

        expect(
            document.getElementById(
                "simulation-simulation-group-id-transaction-transaction-id-editForm-description",
            ),
        ).not.toBeNull();

        expect(
            screen.queryByLabelText("Transazione già confermata"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByLabelText("Attiva promemoria"),
        ).not.toBeInTheDocument();
    });

    it("updates a simulated transaction", async () => {
        vi.mocked(updateTransaction).mockResolvedValueOnce(
            updatedSimulatedTransaction,
        );

        await openSimulatedTransactionEditForm();

        changeSimulationTransactionEditField("description", "Spesa aggiornata");
        changeSimulationTransactionEditField("amount", "-75,00");
        changeSimulationTransactionEditField("chargeDate", "2026-06-06");
        changeSimulationTransactionEditField("category", "category-id");
        changeSimulationTransactionEditField("account", "account-id");

        submitSimulationTransactionEditForm();

        await waitFor(() => {
            expect(updateTransaction).toHaveBeenCalledWith(
                "transaction-id",
                expect.objectContaining({
                    transactionDescription: "Spesa aggiornata",
                    transactionAmount: "-75.00",
                    transactionAffectsAccountBalance: true,
                    transactionAffectsSerenityline: true,
                    categoryId: "category-id",
                    transactionChargeDate: "2026-06-06",
                    transactionIsConfirmed: false,
                    accountId: "account-id",
                    creditCardId: null,
                    bucketId: null,
                    transactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                    transactionReminderEnabled: false,
                    transactionReminderDaysBefore: 7,
                }),
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Transazione simulata aggiornata correttamente.",
                ),
            ).toBeInTheDocument();
        });

        expect(screen.getByText("Spesa aggiornata")).toBeInTheDocument();
        expect(
            screen.queryByText("Modifica transazione simulata"),
        ).not.toBeInTheDocument();
    });

    it("shows an error when simulated transaction update fails", async () => {
        vi.mocked(updateTransaction).mockRejectedValueOnce(
            new Error("Errore aggiornamento transazione"),
        );

        await openSimulatedTransactionEditForm();

        changeSimulationTransactionEditField("description", "Spesa aggiornata");

        submitSimulationTransactionEditForm();

        expect(
            await screen.findByText("Errore aggiornamento transazione"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Modifica transazione simulata"),
        ).toBeInTheDocument();
    });
});

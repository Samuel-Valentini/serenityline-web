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
    listRecurringTransactions,
    listTransactions,
    patchRecurringTransaction,
    restoreSimulationGroup,
    unlinkSimulationGroupAccount,
    updateSimulationGroup,
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
    listRecurringTransactions: vi.fn(),
    listTransactions: vi.fn(),
    patchRecurringTransaction: vi.fn(),
    restoreSimulationGroup: vi.fn(),
    unlinkSimulationGroupAccount: vi.fn(),
    updateSimulationGroup: vi.fn(),
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

const baseTransactionReturnedWithSimulation = {
    ...simulatedTransaction,
    transactionId: "base-transaction-id",
    transactionDescription: "Spesa reale caricata con lo scenario",
    transactionIsSimulated: false,
    simulationGroupId: null,
};

const otherSimulationTransaction = {
    ...simulatedTransaction,
    transactionId: "other-simulation-transaction-id",
    transactionDescription: "Spesa di un altro scenario",
    simulationGroupId: "other-simulation-group-id",
};

const simulatedRecurringTransaction = {
    recurringTransactionId: "recurring-transaction-id",
    recurringTransactionAmountIsAdjustable: false,
    recurringTransactionFirstPaymentDate: "2026-06-04",
    recurringTransactionIsSimulated: true,
    simulationGroupId: "simulation-group-id",
    recurringTransactionReminderEnabled: false,
    recurringTransactionReminderDaysBefore: 7,
    recurringTransactionCreatedAt: "2026-06-04T10:00:00Z",
    recurringTransactionUpdatedAt: "2026-06-04T10:00:00Z",

    recurringTransactionHistoryId: "recurring-transaction-history-id",
    effectiveFrom: "2026-06-04",
    effectiveTo: null,
    dayOfUnit: 4,
    recurrenceInterval: 1,
    recurrenceUnit: "MONTH" as const,
    paymentDateAdjustmentPolicy: "NONE" as const,
    paymentAmount: -850,
    recurringTransactionEndDate: null,
    finalPaymentAmount: null,

    recurringTransactionDetailsHistoryId:
        "recurring-transaction-details-history-id",
    recurringTransactionDescription: "Affitto simulato",
    categoryId: "category-id",
    financialPriorityId: "financial-priority-id",
    linkedAccountId: "account-id",
    linkedCreditCardId: null,
    linkedBucketId: null,
    recurringTransactionAffectsAccountBalance: true,
    recurringtransactionAffectsSerenityline: true,
    recurringTransactionDetailsEffectiveFrom: "2026-06-04",
};

const updatedSimulatedRecurringTransaction = {
    ...simulatedRecurringTransaction,
    recurringTransactionDescription: "Affitto aggiornato",
    paymentAmount: -900,
    recurringTransactionFirstPaymentDate: "2026-07-01",
    recurringTransactionUpdatedAt: "2026-07-01T10:00:00Z",
};

const baseRecurringTransactionReturnedWithSimulation = {
    ...simulatedRecurringTransaction,
    recurringTransactionId: "base-recurring-transaction-id",
    recurringTransactionDescription:
        "Ricorrente reale caricata con lo scenario",
    recurringTransactionIsSimulated: false,
    simulationGroupId: null,
};

const otherSimulationRecurringTransaction = {
    ...simulatedRecurringTransaction,
    recurringTransactionId: "other-simulation-recurring-transaction-id",
    recurringTransactionDescription: "Ricorrente di un altro scenario",
    simulationGroupId: "other-simulation-group-id",
};

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [creditCard],
    categories: [category],
    buckets: [bucket],
    simulationGroups: [archivedSimulationGroup, simulationGroup],
    financialPriorities: [financialPriority],
};

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <SimulationsPage />
        </AppProviders>,
    );
}

function getSimulationGroupRow(simulationGroupName: string) {
    const nameCellContent = screen.getByText(simulationGroupName);
    const row = nameCellContent.closest("tr");

    if (!row) {
        throw new Error(
            `Simulation group row not found: ${simulationGroupName}`,
        );
    }

    return row;
}

function getSimulationGroupActionButton(
    simulationGroupName: string,
    actionName: string,
) {
    return within(getSimulationGroupRow(simulationGroupName)).getByRole(
        "button",
        { name: actionName },
    );
}

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

async function openSimulatedTransactionEditForm() {
    vi.mocked(listRecurringTransactions).mockResolvedValueOnce([]);
    vi.mocked(listTransactions).mockResolvedValueOnce([simulatedTransaction]);

    renderPage();

    fireEvent.click(
        getSimulationGroupActionButton(
            "Scenario base",
            "Visualizza movimenti collegati",
        ),
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

async function openSimulatedRecurringTransactionEditForm() {
    vi.mocked(listRecurringTransactions).mockResolvedValueOnce([
        simulatedRecurringTransaction,
    ]);
    vi.mocked(listTransactions).mockResolvedValueOnce([]);

    renderPage();

    fireEvent.click(
        getSimulationGroupActionButton(
            "Scenario base",
            "Visualizza movimenti collegati",
        ),
    );

    const recurringDescription = await screen.findByText("Affitto simulato");
    const recurringRow = recurringDescription.closest("tr");

    expect(recurringRow).not.toBeNull();

    fireEvent.click(
        within(recurringRow!).getByRole("button", { name: "Modifica" }),
    );
}

function changeSimulationRecurringEditField(fieldName: string, value: string) {
    const field = document.getElementById(
        `simulation-simulation-group-id-recurringTransaction-recurring-transaction-id-editForm-${fieldName}`,
    ) as HTMLInputElement | HTMLSelectElement | null;

    expect(field).not.toBeNull();

    fireEvent.change(field!, {
        target: { value },
    });
}

function submitSimulationRecurringEditForm() {
    const descriptionField = document.getElementById(
        "simulation-simulation-group-id-recurringTransaction-recurring-transaction-id-editForm-description",
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

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Modifica",
            }),
        );

        fireEvent.change(
            within(simulationGroupRow).getByLabelText("Nome simulazione"),
            {
                target: { value: "Scenario aggiornato" },
            },
        );

        fireEvent.change(
            within(simulationGroupRow).getByLabelText(/Descrizione/i),
            {
                target: { value: "Descrizione aggiornata" },
            },
        );

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", { name: "Salva" }),
        );

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

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Modifica",
            }),
        );

        fireEvent.change(
            within(simulationGroupRow).getByLabelText("Nome simulazione"),
            {
                target: { value: "" },
            },
        );

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", { name: "Salva" }),
        );

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

        fireEvent.click(
            getSimulationGroupActionButton("Scenario base", "Archivia"),
        );

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

        fireEvent.click(
            getSimulationGroupActionButton("Scenario archiviato", "Ripristina"),
        );

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

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Gestisci conti",
            }),
        );

        fireEvent.click(
            within(simulationGroupRow).getByLabelText("Conto riserva"),
        );

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

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Gestisci conti",
            }),
        );

        fireEvent.click(
            within(simulationGroupRow).getByLabelText("Conto principale"),
        );

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

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Gestisci conti",
            }),
        );

        fireEvent.click(
            within(simulationGroupRow).getByLabelText("Conto principale"),
        );

        expect(
            await screen.findByText("Seleziona almeno un conto."),
        ).toBeInTheDocument();

        expect(unlinkSimulationGroupAccount).not.toHaveBeenCalled();
        expect(linkSimulationGroupAccount).not.toHaveBeenCalled();
    });

    it("closes account management mode", () => {
        renderPage();

        const simulationGroupRow = getSimulationGroupRow("Scenario base");

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", {
                name: "Gestisci conti",
            }),
        );

        expect(
            within(simulationGroupRow).getByRole("button", { name: "Fine" }),
        ).toBeInTheDocument();

        fireEvent.click(
            within(simulationGroupRow).getByRole("button", { name: "Fine" }),
        );

        expect(
            within(simulationGroupRow).queryByRole("button", { name: "Fine" }),
        ).not.toBeInTheDocument();

        expect(
            within(simulationGroupRow).getByRole("button", {
                name: "Gestisci conti",
            }),
        ).toBeInTheDocument();
    });

    it("opens the simulated recurring transaction form for an active simulation group", () => {
        renderPage();

        fireEvent.click(
            getSimulationGroupActionButton(
                "Scenario base",
                "Aggiungi ricorrente",
            ),
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
            getSimulationGroupActionButton(
                "Scenario base",
                "Aggiungi ricorrente",
            ),
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
            getSimulationGroupActionButton(
                "Scenario base",
                "Aggiungi ricorrente",
            ),
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
            getSimulationGroupActionButton(
                "Scenario base",
                "Aggiungi ricorrente",
            ),
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

    it("shows only simulated movements belonging to the selected simulation group", async () => {
        vi.mocked(listRecurringTransactions).mockResolvedValueOnce([
            simulatedRecurringTransaction,
            baseRecurringTransactionReturnedWithSimulation,
            otherSimulationRecurringTransaction,
        ]);

        vi.mocked(listTransactions).mockResolvedValueOnce([
            simulatedTransaction,
            baseTransactionReturnedWithSimulation,
            otherSimulationTransaction,
        ]);

        renderPage();

        fireEvent.click(
            getSimulationGroupActionButton(
                "Scenario base",
                "Visualizza movimenti collegati",
            ),
        );

        expect(await screen.findByText("Spesa simulata")).toBeInTheDocument();
        expect(screen.getByText("Affitto simulato")).toBeInTheDocument();

        expect(
            screen.queryByText("Spesa reale caricata con lo scenario"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Spesa di un altro scenario"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Ricorrente reale caricata con lo scenario"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Ricorrente di un altro scenario"),
        ).not.toBeInTheDocument();

        expect(listRecurringTransactions).toHaveBeenCalledWith({
            simulationGroupIds: ["simulation-group-id"],
        });

        expect(listTransactions).toHaveBeenCalledWith({
            from: "2026-01-01",
            to: "2031-01-01",
            simulationGroupId: "simulation-group-id",
        });
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

    it("opens the edit form for a simulated recurring transaction", async () => {
        await openSimulatedRecurringTransactionEditForm();

        expect(
            screen.getByText("Modifica movimento ricorrente simulato"),
        ).toBeInTheDocument();

        expect(
            document.getElementById(
                "simulation-simulation-group-id-recurringTransaction-recurring-transaction-id-editForm-description",
            ),
        ).not.toBeNull();

        expect(
            screen.queryByLabelText("Attiva promemoria"),
        ).not.toBeInTheDocument();
    });

    it("patches a simulated recurring transaction", async () => {
        vi.mocked(patchRecurringTransaction).mockResolvedValueOnce(
            updatedSimulatedRecurringTransaction,
        );

        await openSimulatedRecurringTransactionEditForm();

        changeSimulationRecurringEditField("description", "Affitto aggiornato");
        changeSimulationRecurringEditField("paymentAmount", "-900,00");
        changeSimulationRecurringEditField("firstPaymentDate", "2026-07-01");
        changeSimulationRecurringEditField("recurrenceInterval", "1");
        changeSimulationRecurringEditField("recurrenceUnit", "MONTH");
        changeSimulationRecurringEditField("category", "category-id");
        changeSimulationRecurringEditField(
            "financialPriority",
            "financial-priority-id",
        );
        changeSimulationRecurringEditField("account", "account-id");

        submitSimulationRecurringEditForm();

        await waitFor(() => {
            expect(patchRecurringTransaction).toHaveBeenCalledWith(
                "recurring-transaction-id",
                expect.objectContaining({
                    recurringTransactionFirstPaymentDate: "2026-07-01",
                    recurringTransactionAmountIsAdjustable: false,
                    recurringTransactionIsSimulated: true,
                    simulationGroupId: "simulation-group-id",
                    recurringTransactionReminderEnabled: false,
                    recurringTransactionReminderDaysBefore: 7,
                    rule: expect.objectContaining({
                        effectiveFrom: "2026-07-01",
                        dayOfUnit: 1,
                        paymentAmount: "-900.00",
                        recurrenceInterval: 1,
                        recurrenceUnit: "MONTH",
                        paymentDateAdjustmentPolicy: "NONE",
                        recurringTransactionEndDate: null,
                        finalPaymentAmount: null,
                    }),
                    details: expect.objectContaining({
                        effectiveFrom: "2026-07-01",
                        recurringTransactionDescription: "Affitto aggiornato",
                        categoryId: "category-id",
                        financialPriorityId: "financial-priority-id",
                        linkedAccountId: "account-id",
                        linkedCreditCardId: null,
                        linkedBucketId: null,
                        recurringTransactionAffectsAccountBalance: true,
                        recurringtransactionAffectsSerenityline: true,
                    }),
                }),
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Movimento ricorrente simulato aggiornato correttamente.",
                ),
            ).toBeInTheDocument();
        });

        expect(screen.getByText("Affitto aggiornato")).toBeInTheDocument();
        expect(
            screen.queryByText("Modifica movimento ricorrente simulato"),
        ).not.toBeInTheDocument();
    });

    it("shows an error when simulated recurring transaction update fails", async () => {
        vi.mocked(patchRecurringTransaction).mockRejectedValueOnce(
            new Error("Errore aggiornamento ricorrenza"),
        );

        await openSimulatedRecurringTransactionEditForm();

        changeSimulationRecurringEditField("description", "Affitto aggiornato");
        submitSimulationRecurringEditForm();

        expect(
            await screen.findByText("Errore aggiornamento ricorrenza"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Modifica movimento ricorrente simulato"),
        ).toBeInTheDocument();
    });
});

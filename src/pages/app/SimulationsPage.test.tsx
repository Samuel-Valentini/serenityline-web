import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    archiveSimulationGroup,
    createSimulationGroup,
    restoreSimulationGroup,
    updateSimulationGroup,
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
    createSimulationGroup: vi.fn(),
    restoreSimulationGroup: vi.fn(),
    updateSimulationGroup: vi.fn(),
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

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [],
    categories: [],
    buckets: [],
    simulationGroups: [archivedSimulationGroup, simulationGroup],
    financialPriorities: [],
};

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <SimulationsPage />
        </AppProviders>,
    );
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
});

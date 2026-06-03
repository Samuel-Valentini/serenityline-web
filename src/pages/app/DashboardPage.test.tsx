import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { DashboardPage } from "./DashboardPage";

const referenceData: FinanceReferenceData = {
    accounts: [
        {
            accountId: "account-id",
            accountName: "Conto principale",
            accountDescription: null,
            currency: "EUR",
            issuingInstitution: null,
            openingBalance: 1000,
            openingBalanceDate: "2026-01-01",
            userGroupId: "group-id",
            accountCreatedAt: "2026-01-01T00:00:00Z",
            accountUpdatedAt: "2026-01-01T00:00:00Z",
        },
    ],
    creditCards: [],
    categories: [
        {
            categoryId: "category-id",
            categoryName: "Casa",
            categoryDescription: null,
            active: true,
        },
        {
            categoryId: "inactive-category-id",
            categoryName: "Archiviata",
            categoryDescription: null,
            active: false,
        },
    ],
    buckets: [
        {
            bucketId: "bucket-id",
            bucketName: "Essenziali",
            bucketDescription: null,
            accountIds: ["account-id"],
            userGroupId: "group-id",
            bucketCreatedAt: "2026-01-01T00:00:00Z",
            bucketUpdatedAt: "2026-01-01T00:00:00Z",
            bucketClosedAt: null,
        },
    ],
    simulationGroups: [
        {
            simulationGroupId: "simulation-group-id",
            simulationGroupName: "Scenario base",
            simulationGroupDescription: null,
            simulationGroupCreatedAt: "2026-01-01T00:00:00Z",
            simulationGroupUpdatedAt: "2026-01-01T00:00:00Z",
            simulationGroupArchivedAt: null,
            accountIds: ["account-id"],
        },
    ],
    financialPriorities: [
        {
            financialPriorityId: "priority-id",
            financialPriorityCode: "ESSENTIAL",
            financialPriorityDisplayName: "Essenziale",
            financialPriorityDescription: "Spese essenziali",
            financialPriorityRanking: 2,
        },
    ],
};

describe("DashboardPage", () => {
    beforeEach(() => {
        store.dispatch(financeDataCleared());
    });

    function renderPage() {
        return render(
            <AppProviders enableAuthBootstrap={false}>
                <DashboardPage />
            </AppProviders>,
        );
    }

    it("renders finance data metrics", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Dashboard" }),
        ).toBeInTheDocument();

        expect(screen.getByText("Conti")).toBeInTheDocument();
        expect(screen.getByText("Portafogli")).toBeInTheDocument();
        expect(screen.getByText("Simulazioni")).toBeInTheDocument();
        expect(screen.getByText("Categorie")).toBeInTheDocument();

        expect(screen.getAllByRole("heading", { name: "1" })).toHaveLength(4);
        expect(
            screen.getByText(
                "Sono disponibili 1 priorità per distinguere movimenti critici, essenziali e opzionali.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the finance data loading state", () => {
        store.dispatch(financeReferenceDataLoadingStarted());

        renderPage();

        expect(
            screen.getByText("Caricamento dati finanziari..."),
        ).toBeInTheDocument();
    });

    it("renders the finance data error state", () => {
        store.dispatch(
            financeReferenceDataLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        renderPage();

        expect(
            screen.getByText("Impossibile caricare i dati finanziari."),
        ).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders the empty state when finance data is loaded but empty", () => {
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
            screen.getByText("Non hai ancora dati finanziari"),
        ).toBeInTheDocument();
    });
});

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import { listDailyBalances } from "../../features/finance/api/financeApi";
import type { FinanceCalendarDailyBalanceResponseDto } from "../../features/finance/api/financeApiTypes";
import { financeDailyBalancesCleared } from "../../features/finance/dailyBalances/financeDailyBalancesSlice";
import { getTodayIsoDate } from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { DashboardPage } from "./DashboardPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    listDailyBalances: vi.fn(),
}));

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

function addDaysToIsoDate(date: string, days: number) {
    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);

    return nextDate.toISOString().slice(0, 10);
}

function createDailyBalance(
    date: string,
    serenityline: number,
    accountBalance: number,
): FinanceCalendarDailyBalanceResponseDto {
    return {
        date,
        accounts: [
            {
                accountId: "account-id",
                currency: "EUR",
                endOfDayAccountBalance: accountBalance,
                endOfDaySerenityline: serenityline,
                endOfDayBucketsBalance: 0,
                buckets: [],
            },
        ],
        buckets: [],
        totalsByCurrency: [
            {
                currency: "EUR",
                endOfDayAccountsBalance: accountBalance,
                endOfDaySerenityline: serenityline,
                endOfDayBucketsBalance: 0,
            },
        ],
    };
}

function createDailyBalances({
    todaySerenityline = 900,
    todayAccountBalance = 1000,
    futureMinimumSerenityline = 600,
    yearEndSerenityline = 1200,
}: {
    todaySerenityline?: number;
    todayAccountBalance?: number;
    futureMinimumSerenityline?: number;
    yearEndSerenityline?: number;
} = {}) {
    const today = getTodayIsoDate();

    return [
        createDailyBalance(today, todaySerenityline, todayAccountBalance),
        createDailyBalance(
            addDaysToIsoDate(today, 30),
            futureMinimumSerenityline,
            850,
        ),
        createDailyBalance(
            `${today.slice(0, 4)}-12-31`,
            yearEndSerenityline,
            1300,
        ),
    ];
}

describe("DashboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeDailyBalancesCleared());

        vi.mocked(listDailyBalances).mockResolvedValue([]);
    });

    function renderPage() {
        return render(
            <MemoryRouter initialEntries={["/app/dashboard"]}>
                <AppProviders enableAuthBootstrap={false}>
                    <DashboardPage />
                </AppProviders>
            </MemoryRouter>,
        );
    }

    it("renders the SerenityLine dashboard signal and projection metrics", async () => {
        vi.mocked(listDailyBalances).mockResolvedValueOnce(
            createDailyBalances(),
        );

        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "La tua serenità, oggi" }),
        ).toBeInTheDocument();

        expect(screen.getByText("SerenityLine oggi")).toBeInTheDocument();
        expect(screen.getByText("Saldo totale")).toBeInTheDocument();
        expect(screen.getByText("Minimo futuro")).toBeInTheDocument();
        expect(screen.getByText("Fine anno")).toBeInTheDocument();
        expect(
            screen.getByText("Rendi la previsione affidabile"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Non è solo saldo: è prospettiva"),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(listDailyBalances).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findByText("La traiettoria caricata è sostenibile"),
        ).toBeInTheDocument();

        expect(screen.getByText("Conti")).toBeInTheDocument();
        expect(screen.getByText("Portafogli")).toBeInTheDocument();
        expect(screen.getByText("Simulazioni")).toBeInTheDocument();
        expect(screen.getByText("Categorie")).toBeInTheDocument();
    });

    it("renders a risk signal when the future SerenityLine goes below zero", async () => {
        vi.mocked(listDailyBalances).mockResolvedValueOnce(
            createDailyBalances({
                todaySerenityline: 900,
                futureMinimumSerenityline: -250,
                yearEndSerenityline: 700,
            }),
        );

        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            await screen.findByText("C'è una soglia critica nel futuro"),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/La SerenityLine scende sotto zero/i),
        ).toBeInTheDocument();
        expect(screen.getByText("Controlla calendario")).toBeInTheDocument();
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

    it("guides users to create the first account when finance data is empty", () => {
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

        expect(screen.getByText("Inizia dal primo conto")).toBeInTheDocument();
        expect(screen.getByText("Aggiungi conto")).toBeInTheDocument();
        expect(listDailyBalances).not.toHaveBeenCalled();
    });

    it("renders the daily balances error state", async () => {
        vi.mocked(listDailyBalances).mockRejectedValueOnce(
            new Error("Daily balances failed"),
        );

        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        await waitFor(() => {
            expect(listDailyBalances).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findByText(
                "Non è stato possibile aggiornare la proiezione dei saldi.",
            ),
        ).toBeInTheDocument();
    });
});

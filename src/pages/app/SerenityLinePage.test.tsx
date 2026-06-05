import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import { listDailyBalances } from "../../features/finance/api/financeApi";
import { financeDailyBalancesCleared } from "../../features/finance/dailyBalances/financeDailyBalancesSlice";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { SerenityLinePage } from "./SerenityLinePage";

vi.mock("../../features/finance/api/financeApi", () => ({
    listDailyBalances: vi.fn(),
}));

const account = {
    accountId: "account-id",
    accountName: "Conto principale",
    accountDescription: "Conto per la liquidità ordinaria",
    currency: "EUR",
    issuingInstitution: "Banca Test",
    openingBalance: 1000,
    openingBalanceDate: "2026-01-01",
    userGroupId: "group-id",
    accountCreatedAt: "2026-01-01T00:00:00Z",
    accountUpdatedAt: "2026-01-01T00:00:00Z",
};

const referenceData: FinanceReferenceData = {
    accounts: [account],
    creditCards: [],
    categories: [],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

const dailyBalances = [
    {
        date: "2026-06-04",
        accounts: [
            {
                accountId: "account-id",
                currency: "EUR",
                endOfDayAccountBalance: 1200,
                endOfDaySerenityline: 1100,
                endOfDayBucketsBalance: 100,
                buckets: [],
            },
        ],
        buckets: [],
        totalsByCurrency: [
            {
                currency: "EUR",
                endOfDayAccountsBalance: 1200,
                endOfDaySerenityline: 1100,
                endOfDayBucketsBalance: 100,
            },
        ],
    },
    {
        date: "2026-06-05",
        accounts: [
            {
                accountId: "account-id",
                currency: "EUR",
                endOfDayAccountBalance: 1300,
                endOfDaySerenityline: 1250,
                endOfDayBucketsBalance: 50,
                buckets: [],
            },
        ],
        buckets: [],
        totalsByCurrency: [
            {
                currency: "EUR",
                endOfDayAccountsBalance: 1300,
                endOfDaySerenityline: 1250,
                endOfDayBucketsBalance: 50,
            },
        ],
    },
];

function renderPage() {
    render(
        <AppProviders enableAuthBootstrap={false}>
            <SerenityLinePage />
        </AppProviders>,
    );
}

describe("SerenityLinePage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());
        store.dispatch(financeDailyBalancesCleared());
        store.dispatch(financeReferenceDataLoaded(referenceData));
    });

    it("loads daily balances and shows the base SerenityLine chart", async () => {
        vi.mocked(listDailyBalances).mockResolvedValue(dailyBalances);

        renderPage();

        await waitFor(() => {
            expect(listDailyBalances).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                    to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                }),
            );
        });

        expect(
            await screen.findByRole("heading", {
                name: "SerenityLine",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Conto principale/i }),
        ).toBeInTheDocument();
    });

    it("reuses cached daily balances when mounted again", async () => {
        vi.mocked(listDailyBalances).mockResolvedValue(dailyBalances);

        const firstRender = render(
            <AppProviders enableAuthBootstrap={false}>
                <SerenityLinePage />
            </AppProviders>,
        );

        expect(
            await screen.findByRole("heading", {
                name: "SerenityLine",
            }),
        ).toBeInTheDocument();

        firstRender.unmount();

        renderPage();

        expect(
            await screen.findByRole("heading", {
                name: "SerenityLine",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Grafico della liquidità SerenityLine"),
        ).toBeInTheDocument();

        expect(listDailyBalances).toHaveBeenCalledTimes(1);
    });

    it("filters the SerenityLine by selected accounts", async () => {
        vi.mocked(listDailyBalances).mockResolvedValue(dailyBalances);

        renderPage();

        expect(
            await screen.findByRole("button", {
                name: /Conto principale/i,
            }),
        ).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(
            screen.getByRole("button", {
                name: /Conto principale/i,
            }),
        );

        expect(
            screen.getByRole("button", {
                name: /Conto principale/i,
            }),
        ).toHaveAttribute("aria-pressed", "false");

        expect(
            screen.getByText(
                "Non ci sono dati SerenityLine nel periodo caricato.",
            ),
        ).toBeInTheDocument();
    });
});

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
    closeBucket,
    createBucket,
    findBucket,
    linkBucketAccount,
    listDailyBalances,
    reopenBucket,
    unlinkBucketAccount,
    updateBucket,
} from "../../features/finance/api/financeApi";
import { financeDailyBalancesCleared } from "../../features/finance/dailyBalances/financeDailyBalancesSlice";
import { getTodayIsoDate } from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { BucketsPage } from "./BucketsPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    closeBucket: vi.fn(),
    createBucket: vi.fn(),
    findBucket: vi.fn(),
    linkBucketAccount: vi.fn(),
    listDailyBalances: vi.fn(),
    reopenBucket: vi.fn(),
    unlinkBucketAccount: vi.fn(),
    updateBucket: vi.fn(),
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
    bucketName: "Vecchio obiettivo",
    bucketClosedAt: "2026-06-01T00:00:00Z",
};

const referenceData: FinanceReferenceData = {
    accounts: [account, secondAccount],
    creditCards: [],
    categories: [],
    buckets: [bucket],
    simulationGroups: [],
    financialPriorities: [],
};

const createdBucket = {
    ...bucket,
    bucketId: "created-bucket-id",
    bucketName: "Università",
    bucketDescription: null,
    accountIds: ["account-id", "second-account-id"],
    bucketCreatedAt: "2026-06-03T10:00:00Z",
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

const updatedBucket = {
    ...bucket,
    bucketName: "Risparmio aggiornato",
    bucketDescription: null,
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

const closedBucketResult = {
    ...bucket,
    bucketClosedAt: "2026-06-03T10:00:00Z",
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

const reopenedBucketResult = {
    ...closedBucket,
    bucketClosedAt: null,
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

const bucketWithSecondAccount = {
    ...bucket,
    accountIds: ["account-id", "second-account-id"],
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

const bucketWithoutAccount = {
    ...bucket,
    accountIds: [],
    bucketUpdatedAt: "2026-06-03T10:00:00Z",
};

function renderPage() {
    return render(
        <AppProviders enableAuthBootstrap={false}>
            <BucketsPage />
        </AppProviders>,
    );
}

describe("BucketsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();

        store.dispatch(financeDataCleared());
        store.dispatch(financeDailyBalancesCleared());

        vi.mocked(listDailyBalances).mockResolvedValue([]);

        vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    });

    it("renders buckets from finance data", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Portafogli" }),
        ).toBeInTheDocument();

        expect(screen.getByText("Risparmio")).toBeInTheDocument();
        expect(
            screen.getByText("Portafoglio per obiettivi di risparmio"),
        ).toBeInTheDocument();
        expect(screen.getByText("1 conti collegati")).toBeInTheDocument();

        expect(screen.getAllByText("Attivo").length).toBeGreaterThanOrEqual(1);
    });

    it("renders today's total balance for each bucket", async () => {
        const today = getTodayIsoDate();

        store.dispatch(financeReferenceDataLoaded(referenceData));

        vi.mocked(listDailyBalances).mockResolvedValueOnce([
            {
                date: today,
                accounts: [],
                buckets: [
                    {
                        bucketId: "bucket-id",
                        currency: "EUR",
                        endOfDayBucketBalance: 350.5,
                    },
                ],
                totalsByCurrency: [],
            },
        ]);

        renderPage();

        expect(await screen.findByText(/350,50\s€|350,50 €/)).toBeInTheDocument();

        await waitFor(() => {
            expect(listDailyBalances).toHaveBeenCalledWith({
                from: today,
                to: today,
            });
        });
    });

    it("renders the loading state", () => {
        store.dispatch(financeReferenceDataLoadingStarted());

        renderPage();

        expect(
            screen.getByText("Caricamento portafogli..."),
        ).toBeInTheDocument();
    });

    it("renders the error state", () => {
        store.dispatch(
            financeReferenceDataLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        renderPage();

        expect(
            screen.getByText("Impossibile caricare i portafogli."),
        ).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders the empty state", () => {
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
            screen.getByText(
                "Non hai ancora creato portafogli. Aggiungi il primo portafoglio per destinare parte della liquidità.",
            ),
        ).toBeInTheDocument();
    });

    it("creates a bucket and stores it in finance data", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                buckets: [],
            }),
        );

        vi.mocked(createBucket).mockResolvedValueOnce(createdBucket);

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome portafoglio"), {
            target: { value: "Università" },
        });
        fireEvent.click(screen.getByLabelText("Conto principale"));
        fireEvent.click(screen.getByLabelText("Conto riserva"));

        fireEvent.click(
            screen.getByRole("button", { name: "Crea portafoglio" }),
        );

        await waitFor(() => {
            expect(createBucket).toHaveBeenCalledWith({
                bucketName: "Università",
                bucketDescription: null,
                accountIds: ["account-id", "second-account-id"],
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Portafoglio creato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([createdBucket]);
    });

    it("shows bucket details", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(findBucket).mockResolvedValueOnce(bucket);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("bucket-id");
        });

        expect(screen.getByText("Dettaglio portafoglio")).toBeInTheDocument();
        expect(screen.getAllByText("Risparmio").length).toBeGreaterThanOrEqual(
            1,
        );
        expect(
            screen.getAllByText("Conto principale").length,
        ).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Attivo").length).toBeGreaterThanOrEqual(1);
    });

    it("updates a bucket and stores it in finance data", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(findBucket).mockResolvedValueOnce(bucket);
        vi.mocked(updateBucket).mockResolvedValueOnce(updatedBucket);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("bucket-id");
        });

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const editForm = screen.getByRole("form", {
            name: "Modifica portafoglio",
        });

        fireEvent.change(within(editForm).getByLabelText("Nome portafoglio"), {
            target: { value: "Risparmio aggiornato" },
        });
        fireEvent.change(within(editForm).getByLabelText(/Descrizione/i), {
            target: { value: "" },
        });

        fireEvent.click(
            within(editForm).getByRole("button", {
                name: "Salva modifiche",
            }),
        );

        await waitFor(() => {
            expect(updateBucket).toHaveBeenCalledWith("bucket-id", {
                bucketName: "Risparmio aggiornato",
                bucketDescription: null,
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Portafoglio aggiornato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([updatedBucket]);
    });

    it("closes an active bucket after confirmation", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(findBucket).mockResolvedValueOnce(bucket);
        vi.mocked(closeBucket).mockResolvedValueOnce(closedBucketResult);
        vi.spyOn(window, "confirm").mockReturnValueOnce(true);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("bucket-id");
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Chiudi portafoglio" }),
        );

        await waitFor(() => {
            expect(closeBucket).toHaveBeenCalledWith("bucket-id");
        });

        await waitFor(() => {
            expect(
                screen.getByText("Portafoglio chiuso correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([
            closedBucketResult,
        ]);
    });

    it("reopens a closed bucket", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                buckets: [closedBucket],
            }),
        );
        vi.mocked(findBucket).mockResolvedValueOnce(closedBucket);
        vi.mocked(reopenBucket).mockResolvedValueOnce(reopenedBucketResult);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("closed-bucket-id");
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Riapri portafoglio" }),
        );

        await waitFor(() => {
            expect(reopenBucket).toHaveBeenCalledWith("closed-bucket-id");
        });

        await waitFor(() => {
            expect(
                screen.getByText("Portafoglio riaperto correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([
            reopenedBucketResult,
        ]);
    });

    it("links an account to a bucket", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(findBucket)
            .mockResolvedValueOnce(bucket)
            .mockResolvedValueOnce(bucketWithSecondAccount);
        vi.mocked(linkBucketAccount).mockResolvedValueOnce();

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("bucket-id");
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Collega Conto riserva" }),
        );

        await waitFor(() => {
            expect(linkBucketAccount).toHaveBeenCalledWith(
                "bucket-id",
                "second-account-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto collegato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([
            bucketWithSecondAccount,
        ]);
    });

    it("unlinks an account from a bucket", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(findBucket)
            .mockResolvedValueOnce(bucket)
            .mockResolvedValueOnce(bucketWithoutAccount);
        vi.mocked(unlinkBucketAccount).mockResolvedValueOnce();

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        await waitFor(() => {
            expect(findBucket).toHaveBeenCalledWith("bucket-id");
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Scollega Conto principale" }),
        );

        await waitFor(() => {
            expect(unlinkBucketAccount).toHaveBeenCalledWith(
                "bucket-id",
                "account-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Conto scollegato correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.buckets).toEqual([
            bucketWithoutAccount,
        ]);
    });
});
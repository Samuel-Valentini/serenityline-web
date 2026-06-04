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
    createCategory,
    deactivateCategory,
    reactivateCategory,
    updateCategory,
} from "../../features/finance/api/financeApi";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
    financeReferenceDataLoadingFailed,
    financeReferenceDataLoadingStarted,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { i18n } from "../../shared/i18n/i18n";
import { CategoriesPage } from "./CategoriesPage";

vi.mock("../../features/finance/api/financeApi", () => ({
    createCategory: vi.fn(),
    deactivateCategory: vi.fn(),
    reactivateCategory: vi.fn(),
    updateCategory: vi.fn(),
}));

const category = {
    categoryId: "category-id",
    categoryName: "Casa",
    categoryDescription: "Spese legate alla casa",
    active: true,
};

const inactiveCategory = {
    ...category,
    categoryId: "inactive-category-id",
    categoryName: "Viaggi",
    categoryDescription: "Spese di viaggio",
    active: false,
};

const referenceData: FinanceReferenceData = {
    accounts: [],
    creditCards: [],
    categories: [category],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

const createdCategory = {
    ...category,
    categoryId: "created-category-id",
    categoryName: "Trasporti",
    categoryDescription: null,
    active: true,
};

const updatedCategory = {
    ...category,
    categoryName: "Casa aggiornata",
    categoryDescription: null,
    active: true,
};

const deactivatedCategory = {
    ...category,
    active: false,
};

const reactivatedCategory = {
    ...inactiveCategory,
    active: true,
};

function renderPage() {
    return render(
        <AppProviders enableAuthBootstrap={false}>
            <CategoriesPage />
        </AppProviders>,
    );
}

describe("CategoriesPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
        vi.clearAllMocks();
        store.dispatch(financeDataCleared());

        vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    });

    it("renders categories from finance data", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Categorie" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(screen.getByText("Spese legate alla casa")).toBeInTheDocument();
        expect(screen.getByText("Attiva")).toBeInTheDocument();
    });

    it("renders the loading state", () => {
        store.dispatch(financeReferenceDataLoadingStarted());

        renderPage();

        expect(
            screen.getByText("Caricamento categorie..."),
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
            screen.getByText("Impossibile caricare le categorie."),
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
                "Non hai ancora creato categorie. Aggiungi la prima categoria per classificare i movimenti.",
            ),
        ).toBeInTheDocument();
    });

    it("creates a category and stores it in finance data", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                categories: [],
            }),
        );

        vi.mocked(createCategory).mockResolvedValueOnce(createdCategory);

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome categoria"), {
            target: { value: "Trasporti" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Crea categoria" }));

        await waitFor(() => {
            expect(createCategory).toHaveBeenCalledWith({
                categoryName: "Trasporti",
                categoryDescription: null,
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Categoria creata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.categories).toEqual([
            createdCategory,
        ]);
    });

    it("shows category details", () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        expect(screen.getByText("Dettaglio categoria")).toBeInTheDocument();
        expect(screen.getAllByText("Casa")).not.toHaveLength(0);
        expect(screen.getAllByText("Spese legate alla casa")).not.toHaveLength(
            0,
        );
        expect(screen.getAllByText("Attiva")).not.toHaveLength(0);
    });

    it("updates a category and stores it in finance data", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(updateCategory).mockResolvedValueOnce(updatedCategory);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        fireEvent.click(screen.getByRole("button", { name: "Modifica" }));

        const editForm = screen.getByRole("form", {
            name: "Modifica categoria",
        });

        fireEvent.change(within(editForm).getByLabelText("Nome categoria"), {
            target: { value: "Casa aggiornata" },
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
            expect(updateCategory).toHaveBeenCalledWith("category-id", {
                categoryName: "Casa aggiornata",
                categoryDescription: null,
            });
        });

        await waitFor(() => {
            expect(
                screen.getByText("Categoria aggiornata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.categories).toEqual([
            updatedCategory,
        ]);
    });

    it("deactivates an active category after confirmation", async () => {
        store.dispatch(financeReferenceDataLoaded(referenceData));
        vi.mocked(deactivateCategory).mockResolvedValueOnce(
            deactivatedCategory,
        );
        vi.spyOn(window, "confirm").mockReturnValueOnce(true);

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        fireEvent.click(
            screen.getByRole("button", { name: "Disattiva categoria" }),
        );

        await waitFor(() => {
            expect(deactivateCategory).toHaveBeenCalledWith("category-id");
        });

        await waitFor(() => {
            expect(
                screen.getByText("Categoria disattivata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.categories).toEqual([
            deactivatedCategory,
        ]);
    });

    it("reactivates an inactive category", async () => {
        store.dispatch(
            financeReferenceDataLoaded({
                ...referenceData,
                categories: [inactiveCategory],
            }),
        );
        vi.mocked(reactivateCategory).mockResolvedValueOnce(
            reactivatedCategory,
        );

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Vedi dettaglio" }));

        fireEvent.click(
            screen.getByRole("button", { name: "Riattiva categoria" }),
        );

        await waitFor(() => {
            expect(reactivateCategory).toHaveBeenCalledWith(
                "inactive-category-id",
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText("Categoria riattivata correttamente."),
            ).toBeInTheDocument();
        });

        expect(store.getState().financeData.categories).toEqual([
            reactivatedCategory,
        ]);
    });
});

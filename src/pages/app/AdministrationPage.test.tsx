import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import type { CurrentUserResponseDto } from "../../features/account/api/accountApiTypes";
import {
    accountCleared,
    accountLoaded,
} from "../../features/account/accountSlice";
import { inviteUser } from "../../features/auth/authApi";
import {
    financeDataCleared,
    financeReferenceDataLoaded,
} from "../../features/finance/financeDataSlice";
import type { FinanceReferenceData } from "../../features/finance/financeDataTypes";
import { AdministrationPage } from "./AdministrationPage";

vi.mock("../../features/auth/authApi", () => ({
    inviteUser: vi.fn(),
}));

const ownerUser: CurrentUserResponseDto = {
    userId: "owner-id",
    userName: "Samuel",
    email: "samuel@example.com",
    userGroupId: "group-id",
    userGroupName: "Famiglia Valentini",
    userRole: "OWNER",
    userPlatformRole: "USER",
    preferredLocale: "it-IT",
    preferredTheme: "DEFAULT",
    wantsInvoice: false,
    emailTwoFactorEnabled: false,
    paymentEmailRemindersEnabled: true,
};

const collaboratorUser: CurrentUserResponseDto = {
    ...ownerUser,
    userId: "collaborator-id",
    userName: "Collaboratore",
    email: "collaborator@example.com",
    userRole: "COLLABORATOR",
};

const referenceData: FinanceReferenceData = {
    accounts: [
        {
            accountId: "account-id",
            accountName: "Conto principale",
            accountDescription: "Conto per spese quotidiane",
            currency: "EUR",
            issuingInstitution: "Banca Test",
            openingBalance: 1000,
            openingBalanceDate: "2026-01-01",
            userGroupId: "group-id",
            accountCreatedAt: "2026-01-01T00:00:00Z",
            accountUpdatedAt: "2026-01-01T00:00:00Z",
        },
        {
            accountId: "savings-account-id",
            accountName: "Conto risparmio",
            accountDescription: "Conto per risparmi",
            currency: "EUR",
            issuingInstitution: "Banca Test",
            openingBalance: 5000,
            openingBalanceDate: "2026-01-01",
            userGroupId: "group-id",
            accountCreatedAt: "2026-01-01T00:00:00Z",
            accountUpdatedAt: "2026-01-01T00:00:00Z",
        },
    ],
    creditCards: [],
    categories: [],
    buckets: [],
    simulationGroups: [],
    financialPriorities: [],
};

describe("AdministrationPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        store.dispatch(accountCleared());
        store.dispatch(financeDataCleared());
    });

    function renderPage() {
        return render(
            <MemoryRouter initialEntries={["/app/amministrazione"]}>
                <AppProviders enableAuthBootstrap={false}>
                    <Routes>
                        <Route
                            path="/app/amministrazione"
                            element={<AdministrationPage />}
                        />
                        <Route
                            path="/app/dashboard"
                            element={<h1>Dashboard</h1>}
                        />
                    </Routes>
                </AppProviders>
            </MemoryRouter>,
        );
    }

    function loadOwnerWithFinanceData() {
        store.dispatch(accountLoaded(ownerUser));
        store.dispatch(financeReferenceDataLoaded(referenceData));
    }

    it("renders the invitation form for owners", () => {
        loadOwnerWithFinanceData();

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Amministrazione" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Ruolo")).toBeInTheDocument();
        expect(screen.getByLabelText("Lingua invito")).toBeInTheDocument();
        expect(screen.getByText("Conto principale")).toBeInTheDocument();
        expect(screen.getByText("Conto risparmio")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Invia invito" }),
        ).toBeInTheDocument();
    });

    it("redirects non-owner users to the dashboard", async () => {
        store.dispatch(accountLoaded(collaboratorUser));
        store.dispatch(financeReferenceDataLoaded(referenceData));

        renderPage();

        expect(
            await screen.findByRole("heading", { name: "Dashboard" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("heading", { name: "Amministrazione" }),
        ).not.toBeInTheDocument();
    });

    it("creates a viewer collaborator invitation without mandatory accounts", async () => {
        loadOwnerWithFinanceData();

        vi.mocked(inviteUser).mockResolvedValueOnce({
            userId: "invited-user-id",
            userName: "Maria",
            email: "maria@example.com",
            userGroupId: "group-id",
            userGroupName: "Famiglia Valentini",
            userRole: "VIEWER_COLLABORATOR",
            preferredLocale: "it-IT",
            accountIds: [],
        });

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Maria" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "maria@example.com" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Invia invito" }));

        await waitFor(() => {
            expect(inviteUser).toHaveBeenCalledWith({
                userName: "Maria",
                email: "maria@example.com",
                userRole: "VIEWER_COLLABORATOR",
                preferredLocale: "it-IT",
                paymentEmailRemindersEnabled: true,
                accountIds: [],
            });
        });

        expect(
            await screen.findByText(
                "Invito creato per maria@example.com. L'utente riceverà l'email con il link di accettazione.",
            ),
        ).toBeInTheDocument();
    });

    it("creates a viewer collaborator invitation with selected accounts", async () => {
        loadOwnerWithFinanceData();

        vi.mocked(inviteUser).mockResolvedValueOnce({
            userId: "invited-user-id",
            userName: "Maria",
            email: "maria@example.com",
            userGroupId: "group-id",
            userGroupName: "Famiglia Valentini",
            userRole: "VIEWER_COLLABORATOR",
            preferredLocale: "it-IT",
            accountIds: ["account-id"],
        });

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Maria" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "maria@example.com" },
        });

        fireEvent.click(
            screen.getByRole("checkbox", { name: /Conto principale/i }),
        );

        fireEvent.click(screen.getByRole("button", { name: "Invia invito" }));

        await waitFor(() => {
            expect(inviteUser).toHaveBeenCalledWith({
                userName: "Maria",
                email: "maria@example.com",
                userRole: "VIEWER_COLLABORATOR",
                preferredLocale: "it-IT",
                paymentEmailRemindersEnabled: true,
                accountIds: ["account-id"],
            });
        });
    });

    it("requires at least one account for limited collaborators", async () => {
        loadOwnerWithFinanceData();

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Luca" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "luca@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Ruolo"), {
            target: { value: "COLLABORATOR" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Invia invito" }));

        expect(
            screen.getByText(
                "Seleziona almeno un conto per invitare un collaboratore limitato.",
            ),
        ).toBeInTheDocument();
        expect(inviteUser).not.toHaveBeenCalled();
    });

    it("creates a limited collaborator invitation with selected accounts", async () => {
        loadOwnerWithFinanceData();

        vi.mocked(inviteUser).mockResolvedValueOnce({
            userId: "invited-user-id",
            userName: "Luca",
            email: "luca@example.com",
            userGroupId: "group-id",
            userGroupName: "Famiglia Valentini",
            userRole: "COLLABORATOR",
            preferredLocale: "it-IT",
            accountIds: ["account-id"],
        });

        renderPage();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Luca" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "luca@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Ruolo"), {
            target: { value: "COLLABORATOR" },
        });

        fireEvent.click(
            screen.getByRole("checkbox", { name: /Conto principale/i }),
        );
        fireEvent.click(screen.getByRole("button", { name: "Invia invito" }));

        await waitFor(() => {
            expect(inviteUser).toHaveBeenCalledWith({
                userName: "Luca",
                email: "luca@example.com",
                userRole: "COLLABORATOR",
                preferredLocale: "it-IT",
                paymentEmailRemindersEnabled: true,
                accountIds: ["account-id"],
            });
        });
    });

    it("hides account selection for super collaborators", async () => {
        loadOwnerWithFinanceData();

        vi.mocked(inviteUser).mockResolvedValueOnce({
            userId: "invited-user-id",
            userName: "Giulia",
            email: "giulia@example.com",
            userGroupId: "group-id",
            userGroupName: "Famiglia Valentini",
            userRole: "SUPER_COLLABORATOR",
            preferredLocale: "it-IT",
            accountIds: [],
        });

        renderPage();

        fireEvent.change(screen.getByLabelText("Ruolo"), {
            target: { value: "SUPER_COLLABORATOR" },
        });

        expect(screen.queryByText("Conto principale")).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Giulia" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "giulia@example.com" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Invia invito" }));

        await waitFor(() => {
            expect(inviteUser).toHaveBeenCalledWith({
                userName: "Giulia",
                email: "giulia@example.com",
                userRole: "SUPER_COLLABORATOR",
                preferredLocale: "it-IT",
                paymentEmailRemindersEnabled: true,
                accountIds: [],
            });
        });
    });
});

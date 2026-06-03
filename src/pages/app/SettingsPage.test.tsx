import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import * as accountApi from "../../features/account/api/accountApi";
import {
    accountCleared,
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} from "../../features/account/accountSlice";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
    const createObjectUrlMock = vi.fn(() => "blob:account-export");
    const revokeObjectUrlMock = vi.fn();

    beforeEach(() => {
        store.dispatch(accountCleared());
        createObjectUrlMock.mockClear();
        revokeObjectUrlMock.mockClear();

        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            value: createObjectUrlMock,
        });

        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            value: revokeObjectUrlMock,
        });
    });

    function renderPage() {
        return render(
            <MemoryRouter>
                <AppProviders enableAuthBootstrap={false}>
                    <SettingsPage />
                </AppProviders>
            </MemoryRouter>,
        );
    }

    it("renders the current user account details", () => {
        store.dispatch(
            accountLoaded({
                userId: "user-id",
                userName: "Samuel",
                email: "samuel@example.com",
                userGroupId: "group-id",
                userGroupName: "Famiglia Valentini",
                userRole: "OWNER",
                userPlatformRole: "USER",
                preferredLocale: "it-IT",
                preferredTheme: "DEFAULT",
                wantsInvoice: false,
                emailTwoFactorEnabled: true,
                paymentEmailRemindersEnabled: true,
            }),
        );

        renderPage();

        expect(
            screen.getByRole("heading", { name: "Impostazioni" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Samuel")).toBeInTheDocument();
        expect(screen.getByText("samuel@example.com")).toBeInTheDocument();
        expect(screen.getByText("Famiglia Valentini")).toBeInTheDocument();
        expect(screen.getByText("Italiano")).toBeInTheDocument();
        expect(screen.getByText("Predefinito")).toBeInTheDocument();
        expect(
            screen.getByText("Autenticazione a due fattori"),
        ).toBeInTheDocument();
        expect(screen.getByText("Attiva")).toBeInTheDocument();
        expect(screen.getByText("Ruolo utente")).toBeInTheDocument();
        expect(screen.getByText("Proprietario")).toBeInTheDocument();
        expect(screen.queryByText("Ruolo piattaforma")).not.toBeInTheDocument();
        expect(screen.queryByText("USER")).not.toBeInTheDocument();
    });

    it("renders the loading state", () => {
        store.dispatch(accountLoadingStarted());

        renderPage();

        expect(
            screen.getByText("Caricamento dati account..."),
        ).toBeInTheDocument();
    });

    it("renders the loading error state", () => {
        store.dispatch(
            accountLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        renderPage();

        expect(
            screen.getByText("Impossibile caricare i dati account."),
        ).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Ricarica dati" }),
        ).toBeInTheDocument();
    });

    it("renders the platform role only for platform admins", () => {
        store.dispatch(
            accountLoaded({
                userId: "user-id",
                userName: "Samuel",
                email: "samuel@example.com",
                userGroupId: "group-id",
                userGroupName: "Famiglia Valentini",
                userRole: "OWNER",
                userPlatformRole: "ADMIN",
                preferredLocale: "it-IT",
                preferredTheme: "DEFAULT",
                wantsInvoice: false,
                emailTwoFactorEnabled: false,
                paymentEmailRemindersEnabled: true,
            }),
        );

        renderPage();

        expect(screen.getByText("Ruolo piattaforma")).toBeInTheDocument();
        expect(screen.getByText("Amministratore")).toBeInTheDocument();
    });

    it("marks the opened settings action button as active", () => {
        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Cambia password" }),
        );

        const openedButton = screen.getByRole("button", {
            name: "Cambia password",
        });

        expect(openedButton).toHaveAttribute("aria-expanded", "true");
        expect(openedButton).toHaveAttribute("aria-pressed", "true");
        expect(openedButton).toHaveClass("active");
        expect(
            screen.getByLabelText("Password attuale", {
                selector: "#current-password",
            }),
        ).toBeInTheDocument();
    });

    it("exports the current user account data", async () => {
        const exportSpy = vi.spyOn(accountApi, "exportCurrentUserData");

        exportSpy.mockResolvedValueOnce({
            blob: new Blob(["zip-content"], { type: "application/zip" }),
            filename: "serenityline-export.zip",
        });

        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        const closedExportButton = screen.getByRole("button", {
            name: "Esporta dati account",
        });

        fireEvent.click(closedExportButton);

        const exportButtons = screen.getAllByRole("button", {
            name: "Esporta dati account",
        });

        expect(exportButtons[0]).toHaveClass("active");

        fireEvent.click(exportButtons[1]);

        await waitFor(() => {
            expect(exportSpy).toHaveBeenCalledOnce();
        });

        expect(createObjectUrlMock).toHaveBeenCalledOnce();
        expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:account-export");
        expect(
            await screen.findByText("Export scaricato correttamente."),
        ).toBeInTheDocument();

        exportSpy.mockRestore();
    });

    it("updates the payment email reminders preference", async () => {
        const updateSpy = vi.spyOn(accountApi, "updatePaymentEmailReminders");

        updateSpy.mockResolvedValueOnce({
            paymentEmailRemindersEnabled: false,
        });

        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Disattiva promemoria email",
            }),
        );

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledWith({ enabled: false });
        });

        expect(
            await screen.findByText("Preferenza aggiornata correttamente."),
        ).toBeInTheDocument();

        updateSpy.mockRestore();
    });

    it("changes the current user password and logs out", async () => {
        const changePasswordSpy = vi.spyOn(accountApi, "changePassword");

        changePasswordSpy.mockResolvedValueOnce();

        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Cambia password" }),
        );

        fireEvent.change(
            screen.getByLabelText("Password attuale", {
                selector: "#current-password",
            }),
            {
                target: { value: "OldPassword123!" },
            },
        );
        fireEvent.change(screen.getByLabelText("Nuova password"), {
            target: { value: "NewPassword123!" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Aggiorna password" }),
        );

        await waitFor(() => {
            expect(changePasswordSpy).toHaveBeenCalledWith({
                currentPassword: "OldPassword123!",
                newPassword: "NewPassword123!",
            });
        });

        changePasswordSpy.mockRestore();
    });

    it("requests an email change for the current user", async () => {
        const requestEmailChangeSpy = vi.spyOn(
            accountApi,
            "requestEmailChange",
        );

        requestEmailChangeSpy.mockResolvedValueOnce();

        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Cambia email" }));

        fireEvent.change(screen.getByLabelText("Nuova email"), {
            target: { value: "nuova@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password attuale"), {
            target: { value: "CurrentPassword123!" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Richiedi cambio email" }),
        );

        await waitFor(() => {
            expect(requestEmailChangeSpy).toHaveBeenCalledWith({
                newEmail: "nuova@example.com",
                currentPassword: "CurrentPassword123!",
            });
        });

        expect(
            await screen.findByText(
                "Ti abbiamo inviato un'email di conferma al nuovo indirizzo.",
            ),
        ).toBeInTheDocument();

        requestEmailChangeSpy.mockRestore();
    });

    it("deletes the current user account after email confirmation", async () => {
        const deleteCurrentUserSpy = vi.spyOn(accountApi, "deleteCurrentUser");

        deleteCurrentUserSpy.mockResolvedValueOnce();

        store.dispatch(
            accountLoaded({
                userId: "user-id",
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
            }),
        );

        renderPage();

        fireEvent.click(
            screen.getByRole("button", { name: "Cancellazione account" }),
        );

        const deleteButton = screen.getByRole("button", {
            name: "Elimina account",
        });

        expect(deleteButton).toBeDisabled();

        fireEvent.change(
            screen.getByLabelText("Conferma cancellazione account"),
            {
                target: { value: "samuel@example.com" },
            },
        );

        expect(deleteButton).toBeEnabled();

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteCurrentUserSpy).toHaveBeenCalledOnce();
        });

        await waitFor(() => {
            expect(store.getState().account.currentUser).toBeNull();
        });

        deleteCurrentUserSpy.mockRestore();
    });
});

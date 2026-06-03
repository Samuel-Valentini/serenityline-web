import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    accountCleared,
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} from "../../features/account/accountSlice";
import { SettingsPage } from "./SettingsPage";
import * as accountApi from "../../features/account/api/accountApi";

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
            <AppProviders enableAuthBootstrap={false}>
                <SettingsPage />
            </AppProviders>,
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

        fireEvent.click(
            screen.getByRole("button", { name: "Esporta dati account" }),
        );

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

        fireEvent.change(screen.getByLabelText("Password attuale"), {
            target: { value: "OldPassword123!" },
        });
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
});

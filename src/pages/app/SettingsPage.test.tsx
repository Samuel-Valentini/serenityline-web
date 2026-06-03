import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    accountCleared,
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} from "../../features/account/accountSlice";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
    beforeEach(() => {
        store.dispatch(accountCleared());
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
});

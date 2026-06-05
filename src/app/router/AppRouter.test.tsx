import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "../providers/AppProviders";
import { store } from "../store/store";
import {
    authAuthenticated,
    authLoggedOut,
} from "../../features/auth/authSlice";
import { AppRouter } from "./AppRouter";
import type { AuthUser } from "../../features/auth/authTypes";
import {
    accountCleared,
    accountLoaded,
} from "../../features/account/accountSlice";

describe("AppRouter", () => {
    const user: AuthUser = {
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
    };

    beforeEach(() => {
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
    });

    function renderRouterAt(path: string) {
        window.history.pushState({}, "", path);

        return render(
            <AppProviders enableAuthBootstrap={false}>
                <AppRouter />
            </AppProviders>,
        );
    }

    it("renders the public home page", () => {
        renderRouterAt("/");

        expect(
            screen.getByRole("heading", {
                name: "La tua serenità non ha prezzo.",
            }),
        ).toBeInTheDocument();
    });

    it("renders the login page for anonymous users", () => {
        renderRouterAt("/login");

        expect(
            screen.getByRole("heading", {
                name: "Accedi a SerenityLine",
            }),
        ).toBeInTheDocument();
    });

    it("redirects anonymous users from /app to login", async () => {
        renderRouterAt("/app");

        expect(
            await screen.findByRole("heading", {
                name: "Accedi a SerenityLine",
            }),
        ).toBeInTheDocument();
    });

    it("redirects authenticated users from login to dashboard", async () => {
        store.dispatch(authAuthenticated(user));

        renderRouterAt("/login");

        expect(
            await screen.findByRole("heading", {
                name: "La tua serenità, oggi",
            }),
        ).toBeInTheDocument();
    });

    it("renders the dashboard for authenticated users", () => {
        store.dispatch(authAuthenticated(user));

        renderRouterAt("/app/dashboard");

        expect(
            screen.getByRole("heading", {
                name: "La tua serenità, oggi",
            }),
        ).toBeInTheDocument();
    });

    it("renders the current user from account state in the app shell", () => {
        store.dispatch(authAuthenticated(user));
        store.dispatch(
            accountLoaded({
                userId: "account-user-id",
                userName: "Utente da api me",
                email: "account-user@example.com",
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

        renderRouterAt("/app/dashboard");

        expect(screen.getByText("Utente da api me")).toBeInTheDocument();
    });

    it("renders the public security page", () => {
        renderRouterAt("/sicurezza");

        expect(
            screen.getByRole("heading", {
                name: "I tuoi dati meritano più di una password",
            }),
        ).toBeInTheDocument();

        expect(screen.getByText("Sicurezza progettata, non promessa")).toBeInTheDocument();
    });
});

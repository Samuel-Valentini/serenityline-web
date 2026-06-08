import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { store } from "../../app/store/store";
import {
    authAuthenticated,
    authLoggedOut,
} from "../../features/auth/authSlice";
import { accountCleared } from "../../features/account/accountSlice";
import { submitSupportContact } from "../../features/support/api/supportApi";
import type { AuthUser } from "../../features/auth/authTypes";
import { ContactPage } from "./ContactPage";

vi.mock("../../features/support/api/supportApi", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../../features/support/api/supportApi")
        >();

    return {
        ...actual,
        submitSupportContact: vi.fn(),
    };
});

describe("ContactPage", () => {
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
        vi.clearAllMocks();
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
    });

    function renderContactPage() {
        return render(
            <AppProviders enableAuthBootstrap={false}>
                <MemoryRouter>
                    <ContactPage />
                </MemoryRouter>
            </AppProviders>,
        );
    }

    it("renders the anonymous contact form", () => {
        renderContactPage();

        expect(
            screen.getByRole("heading", { name: "Hai bisogno di supporto?" }),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Argomento")).toBeInTheDocument();
        expect(screen.getByLabelText("Oggetto")).toBeInTheDocument();
        expect(screen.getByLabelText("Messaggio")).toBeInTheDocument();
    });

    it("submits an anonymous support contact request", async () => {
        vi.mocked(submitSupportContact).mockResolvedValueOnce({
            accepted: true,
            message: "La tua richiesta è stata accettata.",
        });

        renderContactPage();

        fireEvent.change(screen.getByLabelText("Nome"), {
            target: { value: "Mario Rossi" },
        });

        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "mario@example.com" },
        });

        fireEvent.change(screen.getByLabelText("Argomento"), {
            target: { value: "BUG" },
        });

        fireEvent.change(screen.getByLabelText("Oggetto"), {
            target: { value: "Problema accesso account" },
        });

        fireEvent.change(screen.getByLabelText("Messaggio"), {
            target: { value: "Non riesco ad accedere al mio account." },
        });

        fireEvent.click(
            screen.getByLabelText(
                "Accetto che i dati inseriti vengano trattati per gestire questa richiesta di supporto.",
            ),
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Invia richiesta" }),
        );

        await waitFor(() => {
            expect(submitSupportContact).toHaveBeenCalledTimes(1);
        });

        expect(submitSupportContact).toHaveBeenCalledWith({
            name: "Mario Rossi",
            email: "mario@example.com",
            topic: "BUG",
            subject: "Problema accesso account",
            message: "Non riesco ad accedere al mio account.",
            privacyAccepted: true,
            website: "",
        });

        expect(
            await screen.findByText("La tua richiesta è stata accettata."),
        ).toBeInTheDocument();
    });

    it("hides name and email fields for authenticated users", () => {
        store.dispatch(authAuthenticated(user));

        renderContactPage();

        expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

        expect(
            screen.getByText(
                "Collegheremo la richiesta al tuo account e useremo l'email samuel@example.com come riferimento.",
            ),
        ).toBeInTheDocument();
    });

    it("submits an authenticated support contact request without body name and email", async () => {
        store.dispatch(authAuthenticated(user));

        vi.mocked(submitSupportContact).mockResolvedValueOnce({
            accepted: true,
            message: "La tua richiesta è stata accettata.",
        });

        renderContactPage();

        fireEvent.change(screen.getByLabelText("Argomento"), {
            target: { value: "ACCOUNT" },
        });

        fireEvent.change(screen.getByLabelText("Oggetto"), {
            target: { value: "Problema profilo" },
        });

        fireEvent.change(screen.getByLabelText("Messaggio"), {
            target: { value: "Vorrei assistenza sul mio account." },
        });

        fireEvent.click(
            screen.getByLabelText(
                "Accetto che i dati inseriti vengano trattati per gestire questa richiesta di supporto.",
            ),
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Invia richiesta" }),
        );

        await waitFor(() => {
            expect(submitSupportContact).toHaveBeenCalledTimes(1);
        });

        expect(submitSupportContact).toHaveBeenCalledWith({
            name: undefined,
            email: undefined,
            topic: "ACCOUNT",
            subject: "Problema profilo",
            message: "Vorrei assistenza sul mio account.",
            privacyAccepted: true,
            website: "",
        });
    });

    it("shows an error when the request fails", async () => {
        vi.mocked(submitSupportContact).mockRejectedValueOnce(
            new Error("Errore di rete"),
        );

        renderContactPage();

        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "mario@example.com" },
        });

        fireEvent.change(screen.getByLabelText("Oggetto"), {
            target: { value: "Problema" },
        });

        fireEvent.change(screen.getByLabelText("Messaggio"), {
            target: { value: "Messaggio valido." },
        });

        fireEvent.click(
            screen.getByLabelText(
                "Accetto che i dati inseriti vengano trattati per gestire questa richiesta di supporto.",
            ),
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Invia richiesta" }),
        );

        expect(await screen.findByText("Errore di rete")).toBeInTheDocument();
    });

    it("links the primary hero CTA to the support contact form", () => {
        renderContactPage();

        expect(
            screen.getByRole("link", { name: "Invia la tua richiesta" }),
        ).toHaveAttribute("href", "#support-contact-form");
    });

    it("does not show the sign in CTA for authenticated users", () => {
        store.dispatch(authAuthenticated(user));

        renderContactPage();

        expect(
            screen.getByRole("link", { name: "Invia la tua richiesta" }),
        ).toHaveAttribute("href", "#support-contact-form");

        expect(
            screen.queryByRole("link", { name: "Accedi" }),
        ).not.toBeInTheDocument();
    });

    it("shows the sign in CTA with contact return parameter for anonymous users", () => {
        renderContactPage();

        expect(screen.getByRole("link", { name: "Accedi" })).toHaveAttribute(
            "href",
            "/login?returnTo=%2Fcontatti",
        );
    });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyEmail } from "../../features/auth/authApi";
import { VerifyEmailPage } from "./VerifyEmailPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                title: "Verifica email",
                subtitle:
                    "Verifica il tuo indirizzo email per completare l'attivazione.",
                manualTitle: "Inserisci il token di verifica",
                manualText:
                    "Se il link non si è aperto correttamente, incolla qui il token ricevuto via email.",
                tokenLabel: "Token di verifica",
                tokenPlaceholder: "Incolla il token ricevuto via email",
                submit: "Verifica email",
                submitting: "Verifica in corso...",
                verifyingTitle: "Verifica in corso",
                verifyingText:
                    "Attendi qualche istante mentre completiamo la verifica.",
                successTitle: "Email verificata",
                successText:
                    "Il tuo indirizzo email è stato verificato correttamente. Ora puoi accedere a SerenityLine.",
                errorTitle: "Verifica non riuscita",
                errorFallback:
                    "Non siamo riusciti a verificare l'email. Il link potrebbe essere scaduto o già utilizzato.",
                goToLogin: "Vai al login",
                backHome: "Torna alla home",
            };

            return translations[key] ?? key;
        },
    }),
}));

vi.mock("../../features/auth/authApi", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../features/auth/authApi")>();

    return {
        ...actual,
        verifyEmail: vi.fn(),
    };
});

function renderVerifyEmailPage(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <VerifyEmailPage />
        </MemoryRouter>,
    );
}

describe("VerifyEmailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("verifies the email automatically using the token from the hash", async () => {
        vi.mocked(verifyEmail).mockResolvedValueOnce({
            emailVerified: true,
        });

        renderVerifyEmailPage("/verifica-email#token=email-verification-token");

        await waitFor(() => {
            expect(verifyEmail).toHaveBeenCalledTimes(1);
        });

        expect(verifyEmail).toHaveBeenCalledWith({
            token: "email-verification-token",
        });

        expect(await screen.findByText("Email verificata")).toBeInTheDocument();
    });

    it("shows the manual token form when the hash token is missing", () => {
        renderVerifyEmailPage("/verifica-email");

        expect(
            screen.getByText("Inserisci il token di verifica"),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Token di verifica")).toBeInTheDocument();
        expect(verifyEmail).not.toHaveBeenCalled();
    });

    it("verifies the email using a manually entered token", async () => {
        vi.mocked(verifyEmail).mockResolvedValueOnce({
            emailVerified: true,
        });

        renderVerifyEmailPage("/verifica-email");

        fireEvent.change(screen.getByLabelText("Token di verifica"), {
            target: {
                value: "manual-email-token",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Verifica email",
            }),
        );

        await waitFor(() => {
            expect(verifyEmail).toHaveBeenCalledTimes(1);
        });

        expect(verifyEmail).toHaveBeenCalledWith({
            token: "manual-email-token",
        });

        expect(await screen.findByText("Email verificata")).toBeInTheDocument();
    });

    it("shows an error message when verification fails", async () => {
        vi.mocked(verifyEmail).mockRejectedValueOnce(
            new Error("Token non valido o scaduto."),
        );

        renderVerifyEmailPage("/verifica-email#token=expired-token");

        expect(
            await screen.findByText("Verifica non riuscita"),
        ).toBeInTheDocument();

        expect(screen.getAllByText("Token non valido o scaduto.")).toHaveLength(
            2,
        );
    });
});

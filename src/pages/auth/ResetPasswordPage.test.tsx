import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetPassword } from "../../features/auth/authApi";
import { ResetPasswordPage } from "./ResetPasswordPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                title: "Reimposta password",
                subtitle:
                    "Scegli una nuova password per il tuo account SerenityLine.",
                tokenLabel: "Token di reset",
                tokenPlaceholder: "Incolla il token ricevuto via email",
                passwordLabel: "Nuova password",
                passwordPlaceholder: "Almeno 10 caratteri",
                confirmPasswordLabel: "Conferma nuova password",
                confirmPasswordPlaceholder: "Ripeti la nuova password",
                submit: "Reimposta password",
                submitting: "Reimpostazione in corso...",
                successTitle: "Password reimpostata",
                successText:
                    "La password è stata aggiornata correttamente. Ora puoi accedere con le nuove credenziali.",
                errorTitle: "Reimpostazione non riuscita",
                errorFallback:
                    "Non siamo riusciti a reimpostare la password. Il link potrebbe essere scaduto o già utilizzato.",
                passwordMismatch: "Le password non coincidono.",
                passwordTooShort:
                    "La password deve contenere almeno 10 caratteri.",
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
        resetPassword: vi.fn(),
    };
});

function renderResetPasswordPage(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ResetPasswordPage />
        </MemoryRouter>,
    );
}

describe("ResetPasswordPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("prefills the reset token from the hash", () => {
        renderResetPasswordPage("/reset-password#token=reset-token");

        expect(screen.getByLabelText("Token di reset")).toHaveValue(
            "reset-token",
        );
    });

    it("resets the password using resetToken from the hash token", async () => {
        vi.mocked(resetPassword).mockResolvedValueOnce(undefined);

        renderResetPasswordPage("/reset-password#token=reset-token");

        fireEvent.change(screen.getByLabelText("Nuova password"), {
            target: {
                value: "NewPassword123",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma nuova password"), {
            target: {
                value: "NewPassword123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reimposta password",
            }),
        );

        await waitFor(() => {
            expect(resetPassword).toHaveBeenCalledTimes(1);
        });

        expect(resetPassword).toHaveBeenCalledWith({
            resetToken: "reset-token",
            newPassword: "NewPassword123",
        });

        expect(
            await screen.findByText("Password reimpostata"),
        ).toBeInTheDocument();
    });

    it("resets the password using a manually entered token", async () => {
        vi.mocked(resetPassword).mockResolvedValueOnce(undefined);

        renderResetPasswordPage("/reset-password");

        fireEvent.change(screen.getByLabelText("Token di reset"), {
            target: {
                value: "manual-reset-token",
            },
        });

        fireEvent.change(screen.getByLabelText("Nuova password"), {
            target: {
                value: "NewPassword123",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma nuova password"), {
            target: {
                value: "NewPassword123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reimposta password",
            }),
        );

        await waitFor(() => {
            expect(resetPassword).toHaveBeenCalledTimes(1);
        });

        expect(resetPassword).toHaveBeenCalledWith({
            resetToken: "manual-reset-token",
            newPassword: "NewPassword123",
        });
    });

    it("does not submit when passwords do not match", async () => {
        renderResetPasswordPage("/reset-password#token=reset-token");

        fireEvent.change(screen.getByLabelText("Nuova password"), {
            target: {
                value: "NewPassword123",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma nuova password"), {
            target: {
                value: "DifferentPassword123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reimposta password",
            }),
        );

        expect(
            await screen.findByText("Le password non coincidono."),
        ).toBeInTheDocument();
        expect(resetPassword).not.toHaveBeenCalled();
    });

    it("does not submit when the password is too short", async () => {
        renderResetPasswordPage("/reset-password#token=reset-token");

        fireEvent.change(screen.getByLabelText("Nuova password"), {
            target: {
                value: "short",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma nuova password"), {
            target: {
                value: "short",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reimposta password",
            }),
        );

        expect(
            await screen.findByText(
                "La password deve contenere almeno 10 caratteri.",
            ),
        ).toBeInTheDocument();
        expect(resetPassword).not.toHaveBeenCalled();
    });
});

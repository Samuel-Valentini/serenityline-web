import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { acceptUserInvitation } from "../../features/auth/authApi";
import { AcceptInvitationPage } from "./AcceptInvitationPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                title: "Accetta invito",
                subtitle:
                    "Completa l'accesso al gruppo SerenityLine impostando la tua password.",
                tokenLabel: "Token invito",
                tokenPlaceholder: "Incolla il token ricevuto via email",
                passwordLabel: "Password",
                passwordPlaceholder: "Almeno 10 caratteri",
                confirmPasswordLabel: "Conferma password",
                confirmPasswordPlaceholder: "Ripeti la password",
                submit: "Accetta invito",
                submitting: "Accettazione in corso...",
                successTitle: "Invito accettato",
                successText:
                    "Il tuo accesso è stato configurato correttamente. Ora puoi accedere a SerenityLine.",
                errorTitle: "Invito non accettato",
                errorFallback:
                    "Non siamo riusciti ad accettare l'invito. Il link potrebbe essere scaduto o già utilizzato.",
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
        acceptUserInvitation: vi.fn(),
    };
});

function renderAcceptInvitationPage(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <AcceptInvitationPage />
        </MemoryRouter>,
    );
}

describe("AcceptInvitationPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("prefills the invitation token from the hash", () => {
        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        expect(screen.getByLabelText("Token invito")).toHaveValue(
            "invitation-token",
        );
    });

    it("accepts the invitation using the token from the hash", async () => {
        vi.mocked(acceptUserInvitation).mockResolvedValueOnce(undefined);

        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Password1234",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma password"), {
            target: {
                value: "Password1234",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Accetta invito",
            }),
        );

        await waitFor(() => {
            expect(acceptUserInvitation).toHaveBeenCalledTimes(1);
        });

        expect(acceptUserInvitation).toHaveBeenCalledWith({
            token: "invitation-token",
            password: "Password1234",
        });

        expect(await screen.findByText("Invito accettato")).toBeInTheDocument();
    });

    it("accepts the invitation using a manually entered token", async () => {
        vi.mocked(acceptUserInvitation).mockResolvedValueOnce(undefined);

        renderAcceptInvitationPage("/invito/accetta");

        fireEvent.change(screen.getByLabelText("Token invito"), {
            target: {
                value: "manual-invitation-token",
            },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Password1234",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma password"), {
            target: {
                value: "Password1234",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Accetta invito",
            }),
        );

        await waitFor(() => {
            expect(acceptUserInvitation).toHaveBeenCalledTimes(1);
        });

        expect(acceptUserInvitation).toHaveBeenCalledWith({
            token: "manual-invitation-token",
            password: "Password1234",
        });
    });

    it("does not submit when passwords do not match", async () => {
        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Password1234",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma password"), {
            target: {
                value: "DifferentPassword123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Accetta invito",
            }),
        );

        expect(
            await screen.findByText("Le password non coincidono."),
        ).toBeInTheDocument();
        expect(acceptUserInvitation).not.toHaveBeenCalled();
    });

    it("does not submit when the password is too short", async () => {
        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "short",
            },
        });

        fireEvent.change(screen.getByLabelText("Conferma password"), {
            target: {
                value: "short",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Accetta invito",
            }),
        );

        expect(
            await screen.findByText(
                "La password deve contenere almeno 10 caratteri.",
            ),
        ).toBeInTheDocument();
        expect(acceptUserInvitation).not.toHaveBeenCalled();
    });
});

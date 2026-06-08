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
                "legalConsent.title": "Consensi obbligatori",
                "legalConsent.subtitle":
                    "Per accettare l'invito devi confermare la presa visione dei documenti legali.",
                "legalConsent.termsPrefix": "Ho letto e accetto i ",
                "legalConsent.termsLink": "Termini di Servizio",
                "legalConsent.termsSuffix": ".",
                "legalConsent.privacyPrefix": "Dichiaro di aver letto la ",
                "legalConsent.privacyLink": "Privacy Policy",
                "legalConsent.privacySuffix": ".",
                "legalConsent.specificClausesPrefix":
                    "Approvo specificamente, ai sensi degli artt. 1341 e 1342 c.c., le clausole dei Termini di Servizio indicate nella ",
                "legalConsent.specificClausesLink":
                    "sezione “Approvazione specifica di alcune clausole”",
                "legalConsent.specificClausesSuffix":
                    ", e in particolare le clausole 8, 11, 12, 13, 15, 18, 23, 24, 25, 26, 28, 29 e 31.",
                "legalConsent.requiredError":
                    "Per proseguire devi accettare i Termini di Servizio, dichiarare di aver letto la Privacy Policy e approvare specificamente le clausole indicate.",
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

function acceptLegalConsents() {
    fireEvent.click(screen.getByLabelText(/Ho letto e accetto/i));
    fireEvent.click(screen.getByLabelText(/Dichiaro di aver letto/i));
    fireEvent.click(screen.getByLabelText(/Approvo specificamente/i));
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

    it("keeps the submit button disabled until all legal consents are accepted", () => {
        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        const submitButton = screen.getByRole("button", {
            name: "Accetta invito",
        });

        expect(submitButton).toBeDisabled();

        fireEvent.click(screen.getByLabelText(/Ho letto e accetto/i));

        expect(submitButton).toBeDisabled();

        fireEvent.click(screen.getByLabelText(/Dichiaro di aver letto/i));

        expect(submitButton).toBeDisabled();

        fireEvent.click(screen.getByLabelText(/Approvo specificamente/i));

        expect(submitButton).toBeEnabled();
    });

    it("opens legal documents in a new tab", () => {
        renderAcceptInvitationPage("/invito/accetta#token=invitation-token");

        expect(
            screen.getByRole("link", { name: "Termini di Servizio" }),
        ).toHaveAttribute("target", "_blank");

        expect(
            screen.getByRole("link", { name: "Termini di Servizio" }),
        ).toHaveAttribute("href", "/termini");

        expect(
            screen.getByRole("link", { name: "Privacy Policy" }),
        ).toHaveAttribute("target", "_blank");

        expect(
            screen.getByRole("link", { name: "Privacy Policy" }),
        ).toHaveAttribute("href", "/privacy");

        expect(
            screen.getByRole("link", {
                name: "sezione “Approvazione specifica di alcune clausole”",
            }),
        ).toHaveAttribute("target", "_blank");

        expect(
            screen.getByRole("link", {
                name: "sezione “Approvazione specifica di alcune clausole”",
            }),
        ).toHaveAttribute("href", "/termini#articolo-32");
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

        acceptLegalConsents();

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

        acceptLegalConsents();

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

        acceptLegalConsents();

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

        acceptLegalConsents();

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

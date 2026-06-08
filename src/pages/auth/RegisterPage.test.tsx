import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { register } from "../../features/auth/authApi";
import { RegisterPage } from "./RegisterPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: {
            language: "it-IT",
        },
        t: (key: string) => {
            const translations: Record<string, string> = {
                title: "Crea il tuo account",
                subtitle:
                    "Inizia configurando il tuo spazio SerenityLine personale. Dopo la registrazione ti chiederemo di verificare l'email.",
                userNameLabel: "Nome",
                userNamePlaceholder: "Mario Rossi",
                emailLabel: "Email",
                emailPlaceholder: "nome@email.it",
                passwordLabel: "Password",
                passwordPlaceholder: "Almeno 10 caratteri",
                confirmPasswordLabel: "Conferma password",
                confirmPasswordPlaceholder: "Ripeti la password",
                preferredLocaleLabel: "Lingua preferita",
                preferredLocaleIt: "Italiano",
                preferredLocaleEn: "Inglese",
                paymentRemindersLabel:
                    "Mandami un'email di promemoria quando una spesa o un'entrata che ho registrato sta per scadere",
                submit: "Crea account",
                submitting: "Creazione account...",
                errorTitle: "Registrazione non riuscita",
                passwordMismatch: "Le password non coincidono.",
                passwordTooShort:
                    "La password deve contenere almeno 10 caratteri.",
                successTitle: "Account creato",
                successText:
                    "Abbiamo creato il tuo account. Controlla la tua email per completare la verifica.",
                successEmailLabel: "Email registrata",
                goToLogin: "Vai al login",
                backHome: "Torna alla home",
                "legalConsent.title": "Consensi obbligatori",
                "legalConsent.subtitle":
                    "Per creare l'account devi confermare la presa visione dei documenti legali.",
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
        register: vi.fn(),
    };
});

function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>,
    );
}

function acceptLegalConsents() {
    fireEvent.click(screen.getByLabelText(/Ho letto e accetto/i));
    fireEvent.click(screen.getByLabelText(/Dichiaro di aver letto/i));
    fireEvent.click(screen.getByLabelText(/Approvo specificamente/i));
}

function fillRequiredRegistrationFields() {
    fireEvent.change(screen.getByLabelText("Nome"), {
        target: {
            value: "Mario Rossi",
        },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
        target: {
            value: "mario@example.com",
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
}

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("keeps the submit button disabled until all legal consents are accepted", () => {
        renderRegisterPage();

        const submitButton = screen.getByRole("button", {
            name: "Crea account",
        });

        expect(submitButton).toBeDisabled();

        acceptLegalConsents();

        expect(submitButton).toBeEnabled();
    });

    it("registers after all mandatory legal consents are accepted", async () => {
        vi.mocked(register).mockResolvedValueOnce({
            userId: "user-id",
            userName: "Mario Rossi",
            email: "mario@example.com",
            userGroupId: "group-id",
            userGroupName: "Mario Rossi",
            userRole: "OWNER",
            preferredLocale: "it-IT",
            wantsInvoice: false,
            emailVerificationRequired: true,
        });

        renderRegisterPage();

        fillRequiredRegistrationFields();
        acceptLegalConsents();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Crea account",
            }),
        );

        await waitFor(() => {
            expect(register).toHaveBeenCalledTimes(1);
        });

        expect(register).toHaveBeenCalledWith({
            userName: "Mario Rossi",
            email: "mario@example.com",
            password: "Password1234",
            preferredLocale: "it-IT",
            paymentEmailRemindersEnabled: true,
        });

        expect(await screen.findByText("Account creato")).toBeInTheDocument();
    });

    it("opens legal documents in a new tab", () => {
        renderRegisterPage();

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
        ).toHaveAttribute("href", "/termini#articolo-32");
    });
});

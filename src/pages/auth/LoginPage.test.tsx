import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resendEmailVerification } from "../../features/auth/authApi";
import type { EmailVerificationRequiredResponseDto } from "../../features/auth/authApiTypes";
import { authReducer } from "../../features/auth/authSlice";
import type { AuthState } from "../../features/auth/authTypes";
import { LoginPage } from "./LoginPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                loginTitle: "Accedi",
                loginSubtitle: "Accedi al tuo spazio SerenityLine.",
                loginErrorTitle: "Accesso non riuscito",
                emailLabel: "Email",
                emailPlaceholder: "nome@email.it",
                passwordLabel: "Password",
                passwordPlaceholder: "La tua password",
                loginSubmit: "Accedi",
                loginSubmitting: "Accesso in corso...",
                forgotPasswordLink: "Password dimenticata?",
                registerLink: "Crea account",
                backHome: "Torna alla home",
                emailVerificationRequiredTitle: "Email da verificare",
                emailVerificationRequiredText:
                    "Prima di accedere devi verificare il tuo indirizzo email. Controlla la tua casella oppure richiedi un nuovo link.",
                emailVerificationEmailLabel: "Email",
                emailVerificationResendSubmit: "Reinvia link di verifica",
                emailVerificationResendSubmitting: "Invio in corso...",
                emailVerificationResendSuccess:
                    "Abbiamo inviato un nuovo link di verifica. Controlla la tua email.",
                emailVerificationResendErrorTitle: "Reinvio non riuscito",
                emailVerificationResendErrorFallback:
                    "Non siamo riusciti a inviare un nuovo link. Riprova tra qualche istante.",
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
        resendEmailVerification: vi.fn(),
    };
});

const emailVerificationRequired: EmailVerificationRequiredResponseDto = {
    userId: "user-id",
    email: "samuel@example.com",
    emailVerificationResendToken: "resend-token",
    emailVerificationResendTokenExpiresAt: "2026-06-02T20:30:00Z",
    emailVerificationResendAvailableAt: "2026-06-02T20:05:00Z",
};

function renderLoginPage(authStateOverride: Partial<AuthState>) {
    const authState: AuthState = {
        status: "anonymous",
        user: null,
        twoFactorChallenge: null,
        error: null,
        hasCheckedSession: true,
        ...authStateOverride,
    };

    const store = configureStore({
        reducer: {
            auth: authReducer,
        },
        preloadedState: {
            auth: authState,
        },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        </Provider>,
    );
}

describe("LoginPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows the email verification required card", () => {
        renderLoginPage({
            error: {
                code: "auth.emailVerification.required",
                message: "Email verification required.",
                emailVerificationRequired,
            },
        });

        expect(screen.getByText("Email da verificare")).toBeInTheDocument();
        expect(screen.getByText("samuel@example.com")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Prima di accedere devi verificare il tuo indirizzo email. Controlla la tua casella oppure richiedi un nuovo link.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Accesso non riuscito"),
        ).not.toBeInTheDocument();
    });

    it("resends the verification email using the resend token", async () => {
        vi.mocked(resendEmailVerification).mockResolvedValueOnce({
            ...emailVerificationRequired,
            emailVerificationResendToken: "next-resend-token",
            emailVerificationResendTokenExpiresAt: "2026-06-02T21:30:00Z",
            emailVerificationResendAvailableAt: "2026-06-02T21:05:00Z",
        });

        renderLoginPage({
            error: {
                code: "auth.emailVerification.required",
                message: "Email verification required.",
                emailVerificationRequired,
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reinvia link di verifica",
            }),
        );

        await waitFor(() => {
            expect(resendEmailVerification).toHaveBeenCalledTimes(1);
        });

        expect(resendEmailVerification).toHaveBeenCalledWith({
            emailVerificationResendToken: "resend-token",
        });

        expect(
            await screen.findByText(
                "Abbiamo inviato un nuovo link di verifica. Controlla la tua email.",
            ),
        ).toBeInTheDocument();
    });
});

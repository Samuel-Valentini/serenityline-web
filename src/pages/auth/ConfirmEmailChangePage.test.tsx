import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { store } from "../../app/store/store";
import { accountCleared } from "../../features/account/accountSlice";
import { confirmEmailChange } from "../../features/auth/authApi";
import { authLoggedOut } from "../../features/auth/authSlice";
import { i18n } from "../../shared/i18n/i18n";
import { ConfirmEmailChangePage } from "./ConfirmEmailChangePage";

vi.mock("../../features/auth/authApi", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../features/auth/authApi")>();

    return {
        ...actual,
        confirmEmailChange: vi.fn(),
    };
});

function renderConfirmEmailChangePage(initialEntry: string) {
    return render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <MemoryRouter initialEntries={[initialEntry]}>
                    <ConfirmEmailChangePage />
                </MemoryRouter>
            </I18nextProvider>
        </Provider>,
    );
}

describe("ConfirmEmailChangePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
    });

    it("confirms the email change automatically using the token from the hash", async () => {
        vi.mocked(confirmEmailChange).mockResolvedValueOnce();

        renderConfirmEmailChangePage(
            "/cambia-email/conferma#token=email-change-token",
        );

        await waitFor(() => {
            expect(confirmEmailChange).toHaveBeenCalledTimes(1);
        });

        expect(confirmEmailChange).toHaveBeenCalledWith({
            token: "email-change-token",
        });

        expect(await screen.findByText("Email aggiornata")).toBeInTheDocument();
    });

    it("shows the manual token form when the hash token is missing", () => {
        renderConfirmEmailChangePage("/cambia-email/conferma");

        expect(
            screen.getByText("Inserisci il token di conferma"),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Token di conferma")).toBeInTheDocument();
        expect(confirmEmailChange).not.toHaveBeenCalled();
    });

    it("confirms the email change using a manually entered token", async () => {
        vi.mocked(confirmEmailChange).mockResolvedValueOnce();

        renderConfirmEmailChangePage("/cambia-email/conferma");

        fireEvent.change(screen.getByLabelText("Token di conferma"), {
            target: {
                value: "manual-email-change-token",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Conferma cambio email",
            }),
        );

        await waitFor(() => {
            expect(confirmEmailChange).toHaveBeenCalledTimes(1);
        });

        expect(confirmEmailChange).toHaveBeenCalledWith({
            token: "manual-email-change-token",
        });

        expect(await screen.findByText("Email aggiornata")).toBeInTheDocument();
    });

    it("shows an error message when confirmation fails", async () => {
        vi.mocked(confirmEmailChange).mockRejectedValueOnce(
            new Error("Token non valido o scaduto."),
        );

        renderConfirmEmailChangePage(
            "/cambia-email/conferma#token=expired-token",
        );

        expect(
            await screen.findByText("Conferma non riuscita"),
        ).toBeInTheDocument();

        expect(screen.getAllByText("Token non valido o scaduto.")).toHaveLength(
            2,
        );
    });
});

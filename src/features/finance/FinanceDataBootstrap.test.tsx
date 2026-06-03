import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { store } from "../../app/store/store";
import { accountCleared, accountLoaded } from "../account/accountSlice";
import { authAuthenticated, authLoggedOut } from "../auth/authSlice";
import { i18n } from "../../shared/i18n/i18n";
import { FinanceDataBootstrap } from "./FinanceDataBootstrap";
import { financeDataCleared } from "./financeDataSlice";
import { loadFinanceReferenceData } from "./financeDataThunks";
import type { CurrentUserResponseDto } from "../account/api/accountApiTypes";
import type { LoginUserDto } from "../auth/authApiTypes";

vi.mock("./financeDataThunks", () => ({
    loadFinanceReferenceData: vi.fn(() => ({
        type: "financeData/loadReferenceDataMock",
    })),
}));

const user: LoginUserDto = {
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

const currentUser: CurrentUserResponseDto = {
    ...user,
    emailTwoFactorEnabled: false,
    paymentEmailRemindersEnabled: true,
};

function renderBootstrap() {
    return render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <FinanceDataBootstrap />
            </I18nextProvider>
        </Provider>,
    );
}

describe("FinanceDataBootstrap", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
        store.dispatch(financeDataCleared());
    });

    it("loads finance reference data when the current user is loaded", async () => {
        store.dispatch(authAuthenticated(user));
        store.dispatch(accountLoaded(currentUser));

        renderBootstrap();

        await waitFor(() => {
            expect(loadFinanceReferenceData).toHaveBeenCalledOnce();
        });
    });

    it("does not load finance reference data before the current user is loaded", () => {
        store.dispatch(authAuthenticated(user));

        renderBootstrap();

        expect(loadFinanceReferenceData).not.toHaveBeenCalled();
    });

    it("clears finance data when the user is logged out", async () => {
        store.dispatch(authAuthenticated(user));
        store.dispatch(accountLoaded(currentUser));

        renderBootstrap();

        await waitFor(() => {
            expect(loadFinanceReferenceData).toHaveBeenCalledOnce();
        });

        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());

        await waitFor(() => {
            expect(store.getState().financeData.status).toBe("idle");
        });
    });
});

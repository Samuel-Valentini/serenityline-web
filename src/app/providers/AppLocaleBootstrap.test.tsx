import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import {
    accountCleared,
    accountLoaded,
} from "../../features/account/accountSlice";
import { authLoggedOut } from "../../features/auth/authSlice";
import { i18n } from "../../shared/i18n/i18n";
import { defaultLanguage } from "../../shared/i18n/resources";
import { store } from "../store/store";
import { AppLocaleBootstrap } from "./AppLocaleBootstrap";
import { mapPreferredLocaleToLanguage } from "./appLocale";

describe("AppLocaleBootstrap", () => {
    beforeEach(async () => {
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
        await i18n.changeLanguage(defaultLanguage);
    });

    it("maps backend preferred locales to supported frontend languages", () => {
        expect(mapPreferredLocaleToLanguage("it-IT")).toBe("it");
        expect(mapPreferredLocaleToLanguage("en-US")).toBe("en");
        expect(mapPreferredLocaleToLanguage(undefined)).toBe("it");
    });

    it("switches the app language using the current user preferred locale", async () => {
        store.dispatch(
            accountLoaded({
                userId: "user-id",
                userName: "Samuel",
                email: "samuel@example.com",
                userGroupId: "group-id",
                userGroupName: "Famiglia Valentini",
                userRole: "OWNER",
                userPlatformRole: "USER",
                preferredLocale: "en-US",
                preferredTheme: "DEFAULT",
                wantsInvoice: false,
                emailTwoFactorEnabled: false,
                paymentEmailRemindersEnabled: true,
            }),
        );

        render(
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <AppLocaleBootstrap />
                </I18nextProvider>
            </Provider>,
        );

        await waitFor(() => {
            expect(i18n.language).toBe("en");
        });
    });
});

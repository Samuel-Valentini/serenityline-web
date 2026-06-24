import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import {
    accountCleared,
    accountLoaded,
} from "../../features/account/accountSlice";
import {
    authAuthenticated,
    authLoggedOut,
} from "../../features/auth/authSlice";
import { i18n } from "../../shared/i18n/i18n";
import { defaultLanguage } from "../../shared/i18n/resources";
import { store } from "../store/store";
import { AppLocaleBootstrap } from "./AppLocaleBootstrap";
import {
    mapPreferredLocaleToLanguage,
    setStoredAnonymousLanguage,
} from "./appLocale";

describe("AppLocaleBootstrap", () => {
    beforeEach(async () => {
        window.localStorage.clear();
        store.dispatch(authLoggedOut());
        store.dispatch(accountCleared());
        await i18n.changeLanguage(defaultLanguage);
    });

    function renderAppLocaleBootstrap() {
        return render(
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <AppLocaleBootstrap />
                </I18nextProvider>
            </Provider>,
        );
    }

    it("maps backend preferred locales to supported frontend languages", () => {
        expect(mapPreferredLocaleToLanguage("it-IT")).toBe("it");
        expect(mapPreferredLocaleToLanguage("en-US")).toBe("en");
        expect(mapPreferredLocaleToLanguage(undefined)).toBe("it");
    });

    it("switches the app language using the current user preferred locale when authenticated", async () => {
        store.dispatch(
            authAuthenticated({
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
            }),
        );

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

        renderAppLocaleBootstrap();

        await waitFor(() => {
            expect(i18n.language).toBe("en");
        });
    });

    it("uses the authenticated user preferred locale instead of the anonymous selected language", async () => {
        setStoredAnonymousLanguage("en");
        await i18n.changeLanguage("en");

        store.dispatch(
            authAuthenticated({
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
            }),
        );

        renderAppLocaleBootstrap();

        await waitFor(() => {
            expect(i18n.language).toBe("it");
        });
    });
});
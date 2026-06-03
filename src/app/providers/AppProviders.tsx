import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import { i18n } from "../../shared/i18n/i18n";
import { AuthSessionBootstrap } from "./AuthSessionBootstrap";
import { store } from "../store/store";
import { AccountDataBootstrap } from "../../features/account/AccountDataBootstrap";

type AppProvidersProps = {
    children: ReactNode;
    enableAuthBootstrap?: boolean;
};

export function AppProviders({
    children,
    enableAuthBootstrap = true,
}: AppProvidersProps) {
    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                {enableAuthBootstrap ? (
                    <>
                        <AuthSessionBootstrap />
                        <AccountDataBootstrap />
                    </>
                ) : null}
                {children}
            </I18nextProvider>
        </Provider>
    );
}

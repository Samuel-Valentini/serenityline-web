import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import { i18n } from "../../shared/i18n/i18n";
import { store } from "../store/store";

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </Provider>
    );
}

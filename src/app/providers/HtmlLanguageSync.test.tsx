import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { i18n } from "../../shared/i18n/i18n";
import { HtmlLanguageSync } from "./HtmlLanguageSync";

describe("HtmlLanguageSync", () => {
    beforeEach(async () => {
        document.documentElement.lang = "it";
        await i18n.changeLanguage("it");
    });

    afterEach(async () => {
        document.documentElement.lang = "it";
        await i18n.changeLanguage("it");
    });

    function renderHtmlLanguageSync() {
        return render(
            <I18nextProvider i18n={i18n}>
                <HtmlLanguageSync />
            </I18nextProvider>,
        );
    }

    it("sets the html lang attribute to Italian when the app language is Italian", async () => {
        await i18n.changeLanguage("it");

        renderHtmlLanguageSync();

        await waitFor(() => {
            expect(document.documentElement.lang).toBe("it");
        });
    });

    it("updates the html lang attribute to English when the app language changes to English", async () => {
        renderHtmlLanguageSync();

        await i18n.changeLanguage("en");

        await waitFor(() => {
            expect(document.documentElement.lang).toBe("en");
        });
    });

    it("updates the html lang attribute back to Italian when the app language changes back to Italian", async () => {
        await i18n.changeLanguage("en");

        renderHtmlLanguageSync();

        await waitFor(() => {
            expect(document.documentElement.lang).toBe("en");
        });

        await i18n.changeLanguage("it");

        await waitFor(() => {
            expect(document.documentElement.lang).toBe("it");
        });
    });
});

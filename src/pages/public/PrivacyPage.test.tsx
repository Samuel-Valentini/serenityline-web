import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { i18n } from "../../shared/i18n/i18n";
import { PrivacyPage } from "./PrivacyPage";

describe("PrivacyPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
    });

    afterEach(async () => {
        await i18n.changeLanguage("it");
    });

    function renderPrivacyPage() {
        return render(
            <AppProviders enableAuthBootstrap={false}>
                <PrivacyPage />
            </AppProviders>,
        );
    }

    it("renders the Italian privacy policy by default", () => {
        renderPrivacyPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Privacy Policy di SerenityLine",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Ultimo aggiornamento:\s*09\/06\/2026/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Partita IVA:\s*IT02328650227/),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "10. Cookie e tecnologie simili",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Poiché attualmente SerenityLine utilizza solo cookie tecnici o strumenti strettamente necessari, non è richiesto il consenso preventivo dell’utente tramite cookie banner.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.queryByText(/Reference version:/i),
        ).not.toBeInTheDocument();
    });

    it("renders the English privacy policy when the active language is English", async () => {
        await i18n.changeLanguage("en");

        renderPrivacyPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "SerenityLine Privacy Policy",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Reference version: the Italian version of this Privacy Policy is the reference document. This English version is provided as a translation for convenience.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/VAT number:\s*IT02328650227/),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "10. Cookies and similar technologies",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                level: 1,
                name: "Privacy Policy di SerenityLine",
            }),
        ).not.toBeInTheDocument();
    });

    it("renders markdown tables as accessible tables", () => {
        renderPrivacyPage();

        const tables = screen.getAllByRole("table");

        expect(tables).toHaveLength(3);

        const suppliersTable = tables[1];

        expect(
            within(suppliersTable).getByRole("columnheader", {
                name: "Fornitore",
            }),
        ).toBeInTheDocument();

        expect(
            within(suppliersTable).getByRole("columnheader", {
                name: "Finalità",
            }),
        ).toBeInTheDocument();

        expect(within(suppliersTable).getByText("Netlify")).toBeInTheDocument();

        expect(
            within(suppliersTable).getByText(
                "hosting frontend, distribuzione del sito/applicazione e gestione DNS",
            ),
        ).toBeInTheDocument();
    });

    it("renders markdown lists as accessible lists", () => {
        renderPrivacyPage();

        expect(screen.getAllByRole("list").length).toBeGreaterThan(0);

        expect(
            screen.getByText("registrazione e gestione dell’account;"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("password protette tramite hash;"),
        ).toBeInTheDocument();
    });
});

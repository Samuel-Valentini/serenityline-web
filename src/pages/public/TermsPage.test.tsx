import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { i18n } from "../../shared/i18n/i18n";
import { TermsPage } from "./TermsPage";

describe("TermsPage", () => {
    beforeEach(async () => {
        await i18n.changeLanguage("it");
    });

    afterEach(async () => {
        await i18n.changeLanguage("it");
    });

    function renderTermsPage() {
        return render(
            <AppProviders enableAuthBootstrap={false}>
                <TermsPage />
            </AppProviders>,
        );
    }

    it("renders the Italian terms of service by default", () => {
        renderTermsPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Termini di Servizio di SerenityLine",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Ultimo aggiornamento:\s*08\/06\/2026/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Partita IVA:\s*IT02328650227/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "I presenti Termini sono redatti in lingua italiana. Qualunque traduzione fornita è da considerarsi una traduzione di cortesia, il testo che farà fede sarà quello redatto in Italiano.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "4. SerenityLine non è consulenza finanziaria, fiscale, legale o professionale",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "32. Approvazione specifica di alcune clausole",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "32. Approvazione specifica di alcune clausole",
            }),
        ).toHaveAttribute("id", "articolo-32");
    });

    it("renders the English terms of service when the active language is English", async () => {
        await i18n.changeLanguage("en");

        renderTermsPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "SerenityLine Terms of Service",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Last updated:\s*(08\/06\/2026|8 June 2026)/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/VAT number:\s*IT02328650227/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "These Terms are drafted in Italian. Any translation provided is to be considered a courtesy translation; the text that shall prevail is the one drafted in Italian.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "4. SerenityLine is not financial, tax, legal or professional advice",
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                level: 1,
                name: "Termini di Servizio di SerenityLine",
            }),
        ).not.toBeInTheDocument();
    });

    it("renders markdown lists as accessible lists", () => {
        renderTermsPage();

        expect(screen.getAllByRole("list").length).toBeGreaterThan(0);

        expect(
            screen.getByText("gestione di conti, carte di credito e saldi;"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("mantenere riservate le proprie credenziali;"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("24 - Limitazione di responsabilità;"),
        ).toBeInTheDocument();
    });

    it("does not render placeholder content", () => {
        renderTermsPage();

        expect(
            screen.queryByText(
                "Questa pagina ospiterà i termini di servizio completi prima del lancio pubblico del servizio.",
            ),
        ).not.toBeInTheDocument();
    });
});

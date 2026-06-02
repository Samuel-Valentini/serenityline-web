import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../App";

describe("AppRouter", () => {
    it("renders the public home page", () => {
        window.history.pushState({}, "", "/");

        render(<App />);

        expect(
            screen.getByRole("heading", {
                name: "La tua serenità non ha prezzo.",
            }),
        ).toBeInTheDocument();
    });

    it("renders the login page", () => {
        window.history.pushState({}, "", "/login");

        render(<App />);

        expect(
            screen.getByRole("heading", {
                name: "Accedi a SerenityLine",
            }),
        ).toBeInTheDocument();
    });

    it("redirects /app to the dashboard", () => {
        window.history.pushState({}, "", "/app");

        render(<App />);

        expect(
            screen.getByRole("heading", {
                name: "Dashboard",
            }),
        ).toBeInTheDocument();
    });
});

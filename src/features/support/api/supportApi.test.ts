import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, setAccessToken } from "../../../shared/api";
import { submitSupportContact } from "./supportApi";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
}

function getLastFetchCall() {
    const fetchMock = vi.mocked(fetch);
    const lastCall = fetchMock.mock.calls.at(-1);

    if (!lastCall) {
        throw new Error("Expected fetch to have been called.");
    }

    return lastCall;
}

function getLastRequestPath(): string {
    const [url] = getLastFetchCall();

    return new URL(String(url)).pathname;
}

function getLastRequestBody(): unknown {
    const [, init] = getLastFetchCall();

    if (!init || typeof init.body !== "string") {
        throw new Error("Expected fetch body to be a JSON string.");
    }

    return JSON.parse(init.body);
}

describe("supportApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        clearAccessToken();
    });

    afterEach(() => {
        clearAccessToken();
        vi.unstubAllGlobals();
    });

    it("sends the expected support contact body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                accepted: true,
                message: "La tua richiesta è stata accettata.",
            }),
        );

        await submitSupportContact({
            name: "Mario Rossi",
            email: "mario@example.com",
            topic: "BUG",
            subject: "Problema accesso account",
            message: "Non riesco ad accedere.",
            privacyAccepted: true,
            website: "",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/support/contact");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            name: "Mario Rossi",
            email: "mario@example.com",
            topic: "BUG",
            subject: "Problema accesso account",
            message: "Non riesco ad accedere.",
            privacyAccepted: true,
            website: "",
        });
    });

    it("sends authorization header when an access token is available", async () => {
        setAccessToken("access-token");

        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                accepted: true,
                message: "La tua richiesta è stata accettata.",
            }),
        );

        await submitSupportContact({
            topic: "ACCOUNT",
            subject: "Problema profilo",
            message: "Vorrei assistenza.",
            privacyAccepted: true,
            website: "",
        });

        const [, init] = getLastFetchCall();
        const headers = new Headers(init?.headers);

        expect(headers.get("Authorization")).toBe("Bearer access-token");
    });

    it("does not send authorization header when no access token is available", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                accepted: true,
                message: "La tua richiesta è stata accettata.",
            }),
        );

        await submitSupportContact({
            name: "Mario Rossi",
            email: "mario@example.com",
            topic: "OTHER",
            subject: "Domanda",
            message: "Messaggio.",
            privacyAccepted: true,
            website: "",
        });

        const [, init] = getLastFetchCall();
        const headers = new Headers(init?.headers);

        expect(headers.has("Authorization")).toBe(false);
    });
});
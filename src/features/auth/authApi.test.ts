import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    acceptUserInvitation,
    forgotPassword,
    register,
    resetPassword,
    verifyEmail,
} from "./authApi";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
}

function noContentResponse(): Response {
    return new Response(null, {
        status: 204,
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

describe("authApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sends the expected registration body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                userId: "user-id",
                userName: "Mario Rossi",
                email: "mario@example.com",
                userGroupId: "group-id",
                userGroupName: "Mario Rossi",
                userRole: "OWNER",
                preferredLocale: "it-IT",
                wantsInvoice: false,
                emailVerificationRequired: true,
            }),
        );

        await register({
            userName: "Mario Rossi",
            email: "mario@example.com",
            password: "Password1234",
            preferredLocale: "it-IT",
            paymentEmailRemindersEnabled: true,
        });

       const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/auth/register");
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            userName: "Mario Rossi",
            email: "mario@example.com",
            password: "Password1234",
            preferredLocale: "it-IT",
            paymentEmailRemindersEnabled: true,
        });
    });

    it("does not send wantsInvoice during registration", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                userId: "user-id",
                userName: "Mario Rossi",
                email: "mario@example.com",
                userGroupId: "group-id",
                userGroupName: "Mario Rossi",
                userRole: "OWNER",
                preferredLocale: "it-IT",
                wantsInvoice: false,
                emailVerificationRequired: true,
            }),
        );

        await register({
            userName: "Mario Rossi",
            email: "mario@example.com",
            password: "Password1234",
            preferredLocale: "it-IT",
            paymentEmailRemindersEnabled: true,
        });

        expect(getLastRequestBody()).not.toHaveProperty("wantsInvoice");
    });

    it("sends the expected verify email body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                emailVerified: true,
            }),
        );

        await verifyEmail({
            token: "email-verification-token",
        });

       const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(`/api/auth/verify-email`);
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            token: "email-verification-token",
        });
    });

    it("sends the expected forgot password body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await forgotPassword({
            email: "mario@example.com",
        });

       const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(`/api/auth/forgot-password`);
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            email: "mario@example.com",
        });
    });

    it("sends resetToken when resetting the password", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await resetPassword({
            resetToken: "reset-token",
            newPassword: "NewPassword123",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(`/api/auth/reset-password`);
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            resetToken: "reset-token",
            newPassword: "NewPassword123",
        });
    });

    it("sends the expected accept invitation body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await acceptUserInvitation({
            token: "invitation-token",
            password: "Password1234",
        });

       const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe(`/api/auth/user-invitations/accept`);
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            token: "invitation-token",
            password: "Password1234",
        });
    });
});

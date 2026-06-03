import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    changePassword,
    confirmDisableEmail2fa,
    confirmEnableEmail2fa,
    deleteCurrentUser,
    getCurrentUser,
    requestDisableEmail2fa,
    requestEmailChange,
    requestEnableEmail2fa,
    updatePaymentEmailReminders,
    exportCurrentUserData,
} from "./accountApi";

vi.mock("../../../shared/api/accessTokenStore", () => ({
    getAccessToken: vi.fn(() => "access-token"),
}));

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

function getLastRequestHeaders(): Headers {
    const [, init] = getLastFetchCall();

    return new Headers(init?.headers);
}

describe("accountApi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("gets the current user", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                userId: "user-id",
                userName: "Samuel",
                email: "samuel@example.com",
                userGroupId: "group-id",
                userGroupName: "Samuel",
                userRole: "OWNER",
                userPlatformRole: "USER",
                preferredLocale: "it-IT",
                preferredTheme: "DEFAULT",
                wantsInvoice: false,
                emailTwoFactorEnabled: false,
                paymentEmailRemindersEnabled: true,
            }),
        );

        await getCurrentUser();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me");
        expect(init?.method).toBe("GET");
        expect(getLastRequestHeaders().get("Authorization")).toBe(
            "Bearer access-token",
        );
    });

    it("sends the expected change password body and includes credentials to clear refresh cookie", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await changePassword({
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/change-password");
        expect(init?.method).toBe("POST");
        expect(init?.credentials).toBe("include");
        expect(getLastRequestBody()).toEqual({
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123",
        });
    });

    it("sends the expected payment email reminders body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                paymentEmailRemindersEnabled: false,
            }),
        );

        await updatePaymentEmailReminders({
            enabled: false,
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/payment-email-reminders");
        expect(init?.method).toBe("PATCH");
        expect(getLastRequestBody()).toEqual({
            enabled: false,
        });
    });

    it("sends the expected email change request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await requestEmailChange({
            newEmail: "new@example.com",
            currentPassword: "Password1234",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/email-change/request");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            newEmail: "new@example.com",
            currentPassword: "Password1234",
        });
    });

    it("sends the expected enable email 2FA request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                challengeId: "challenge-id",
                codeExpiresAt: "2026-06-03T20:30:00Z",
            }),
        );

        await requestEnableEmail2fa({
            currentPassword: "Password1234",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/email-2fa/enable/request");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            currentPassword: "Password1234",
        });
    });

    it("sends the expected enable email 2FA confirm body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await confirmEnableEmail2fa({
            challengeId: "challenge-id",
            code: "123456",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/email-2fa/enable/confirm");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            challengeId: "challenge-id",
            code: "123456",
        });
    });

    it("sends the expected disable email 2FA request body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            jsonResponse({
                challengeId: "challenge-id",
                codeExpiresAt: "2026-06-03T20:30:00Z",
            }),
        );

        await requestDisableEmail2fa({
            currentPassword: "Password1234",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/email-2fa/disable/request");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            currentPassword: "Password1234",
        });
    });

    it("sends the expected disable email 2FA confirm body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await confirmDisableEmail2fa({
            challengeId: "challenge-id",
            code: "654321",
        });

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/email-2fa/disable/confirm");
        expect(init?.method).toBe("POST");
        expect(getLastRequestBody()).toEqual({
            challengeId: "challenge-id",
            code: "654321",
        });
    });

    it("deletes the current user without a request body and includes credentials to clear refresh cookie", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());

        await deleteCurrentUser();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me");
        expect(init?.method).toBe("DELETE");
        expect(init?.credentials).toBe("include");
        expect(init?.body).toBeUndefined();
    });

    it("exports the current user data as a zip file", async () => {
        const blob = new Blob(["zip-content"], {
            type: "application/zip",
        });

        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(blob, {
                status: 200,
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition":
                        'attachment; filename="serenityline-export.zip"',
                },
            }),
        );

        const result = await exportCurrentUserData();

        const [, init] = getLastFetchCall();

        expect(getLastRequestPath()).toBe("/api/me/export");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({
            Accept: "application/zip",
            Authorization: "Bearer access-token",
        });
        expect(result.filename).toBe("serenityline-export.zip");
        expect(result.blob.type).toBe("application/zip");
    });

    it("uses a default filename when account export response has no content disposition", async () => {
        const blob = new Blob(["zip-content"], {
            type: "application/zip",
        });

        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(blob, {
                status: 200,
                headers: {
                    "Content-Type": "application/zip",
                },
            }),
        );

        const result = await exportCurrentUserData();

        expect(result.filename).toBe("serenityline-account-export.zip");
    });
});

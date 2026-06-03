import { describe, expect, it } from "vitest";

import {
    accountCleared,
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
    accountReducer,
    initialAccountState,
} from "./accountSlice";

describe("accountSlice", () => {
    it("starts loading the current user", () => {
        const state = accountReducer(
            initialAccountState,
            accountLoadingStarted(),
        );

        expect(state).toEqual({
            status: "loading",
            currentUser: null,
            error: null,
        });
    });

    it("stores the current user", () => {
        const state = accountReducer(
            {
                status: "loading",
                currentUser: null,
                error: null,
            },
            accountLoaded({
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

        expect(state.status).toBe("loaded");
        expect(state.currentUser?.email).toBe("samuel@example.com");
        expect(state.error).toBeNull();
    });

    it("stores loading errors", () => {
        const state = accountReducer(
            {
                status: "loading",
                currentUser: null,
                error: null,
            },
            accountLoadingFailed({
                code: "http.500",
                message: "Server error",
            }),
        );

        expect(state).toEqual({
            status: "failed",
            currentUser: null,
            error: {
                code: "http.500",
                message: "Server error",
            },
        });
    });

    it("clears account state", () => {
        const state = accountReducer(
            {
                status: "loaded",
                currentUser: {
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
                },
                error: null,
            },
            accountCleared(),
        );

        expect(state).toEqual(initialAccountState);
    });
});

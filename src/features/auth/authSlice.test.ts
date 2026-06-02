import { describe, expect, it } from "vitest";

import {
    authAuthenticated,
    authCheckingStarted,
    authErrorCleared,
    authFailed,
    authLoggedOut,
    authReducer,
    authTwoFactorRequired,
} from "./authSlice";
import type { AuthState, AuthUser } from "./authTypes";

describe("authSlice", () => {
    const user: AuthUser = {
        userId: "user-id",
        userName: "Samuel",
        email: "samuel@example.com",
        userGroupId: "group-id",
        userGroupName: "Famiglia Valentini",
        userRole: "OWNER",
        userPlatformRole: "USER",
        preferredLocale: "it-IT",
        preferredTheme: "SYSTEM",
        wantsInvoice: false,
    };

    it("starts as anonymous", () => {
        const state = authReducer(undefined, { type: "unknown" });

        expect(state.status).toBe("anonymous");
        expect(state.user).toBeNull();
        expect(state.twoFactorChallenge).toBeNull();
        expect(state.error).toBeNull();
    });

    it("sets checking status", () => {
        const state = authReducer(undefined, authCheckingStarted());

        expect(state.status).toBe("checking");
        expect(state.error).toBeNull();
    });

    it("sets authenticated user", () => {
        const state = authReducer(undefined, authAuthenticated(user));

        expect(state.status).toBe("authenticated");
        expect(state.user).toEqual(user);
        expect(state.twoFactorChallenge).toBeNull();
        expect(state.error).toBeNull();
    });

    it("sets two factor required status", () => {
        const state = authReducer(
            undefined,
            authTwoFactorRequired({
                challengeId: "challenge-id",
                codeExpiresAt: "2026-06-02T15:00:00Z",
            }),
        );

        expect(state.status).toBe("twoFactorRequired");
        expect(state.user).toBeNull();
        expect(state.twoFactorChallenge).toEqual({
            challengeId: "challenge-id",
            codeExpiresAt: "2026-06-02T15:00:00Z",
        });
        expect(state.error).toBeNull();
    });

    it("stores auth failure", () => {
        const state = authReducer(
            undefined,
            authFailed({
                code: "auth.invalidCredentials",
                message: "Credenziali non valide.",
            }),
        );

        expect(state.status).toBe("anonymous");
        expect(state.user).toBeNull();
        expect(state.twoFactorChallenge).toBeNull();
        expect(state.error).toEqual({
            code: "auth.invalidCredentials",
            message: "Credenziali non valide.",
        });
    });

    it("clears auth error", () => {
        const failedState: AuthState = {
            status: "anonymous",
            user: null,
            twoFactorChallenge: null,
            error: {
                code: "auth.invalidCredentials",
                message: "Credenziali non valide.",
            },
        };

        const state = authReducer(failedState, authErrorCleared());

        expect(state.error).toBeNull();
    });

    it("logs out user", () => {
        const authenticatedState: AuthState = {
            status: "authenticated",
            user,
            twoFactorChallenge: null,
            error: null,
        };

        const state = authReducer(authenticatedState, authLoggedOut());

        expect(state.status).toBe("anonymous");
        expect(state.user).toBeNull();
        expect(state.twoFactorChallenge).toBeNull();
        expect(state.error).toBeNull();
    });
});

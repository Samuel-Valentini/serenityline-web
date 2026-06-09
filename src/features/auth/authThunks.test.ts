import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppDispatch } from "../../app/store/store";
import { ApiError } from "../../shared/api";
import { accountCleared } from "../account/accountSlice";
import { financeDailyBalancesCleared } from "../finance/dailyBalances/financeDailyBalancesSlice";
import { financeDataCleared } from "../finance/financeDataSlice";
import {
    login as loginApi,
    logout as logoutApi,
    refreshSession as refreshSessionApi,
    verifyLogin2fa as verifyLogin2faApi,
} from "./authApi";
import type {
    AuthenticatedResponseDto,
    EmailVerificationRequiredResponseDto,
    LoginResult,
} from "./authApiTypes";
import {
    authAuthenticated,
    authCheckingStarted,
    authFailed,
    authLoggedOut,
    authTwoFactorRequired,
} from "./authSlice";
import {
    loginUser,
    logoutUser,
    restoreSession,
    verifyLogin2faCode,
} from "./authThunks";
import type { AuthUser } from "./authTypes";

vi.mock("./authApi", () => ({
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    verifyLogin2fa: vi.fn(),
}));

vi.mock("../finance/calendar/useFinanceCalendarCache", () => ({
    clearFinanceCalendarCache: vi.fn(),
}));

describe("authThunks", () => {
    const user: AuthUser = {
        userId: "user-id",
        userName: "Samuel",
        email: "samuel@example.com",
        userGroupId: "group-id",
        userGroupName: "Famiglia Valentini",
        userRole: "OWNER",
        userPlatformRole: "USER",
        preferredLocale: "it-IT",
        preferredTheme: "DEFAULT",
        wantsInvoice: false,
    };

    const authenticatedResponse: AuthenticatedResponseDto = {
        accessToken: "access-token",
        accessTokenExpiresAt: "2026-06-02T15:00:00Z",
        user,
    };

    const clearedUserScopedStateActions = [
        accountCleared(),
        financeDataCleared(),
        financeDailyBalancesCleared(),
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function createDispatch() {
        const actions: unknown[] = [];
        const dispatch = vi.fn((action: unknown) => {
            actions.push(action);
            return action;
        }) as unknown as AppDispatch;

        return {
            dispatch,
            actions,
        };
    }

    it("dispatches authenticated state after successful login", async () => {
        const result: LoginResult = {
            type: "authenticated",
            user,
        };

        vi.mocked(loginApi).mockResolvedValue(result);

        const { dispatch, actions } = createDispatch();

        await loginUser({
            email: "samuel@example.com",
            password: "password",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authAuthenticated(user),
        ]);
    });

    it("dispatches two factor required state after login challenge", async () => {
        const result: LoginResult = {
            type: "twoFactorRequired",
            challengeId: "challenge-id",
            codeExpiresAt: "2026-06-02T15:00:00Z",
        };

        vi.mocked(loginApi).mockResolvedValue(result);

        const { dispatch, actions } = createDispatch();

        await loginUser({
            email: "samuel@example.com",
            password: "password",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authTwoFactorRequired({
                challengeId: "challenge-id",
                codeExpiresAt: "2026-06-02T15:00:00Z",
            }),
        ]);
    });

    it("dispatches auth failure after failed login", async () => {
        vi.mocked(loginApi).mockRejectedValue(
            new ApiError(401, {
                code: "auth.invalidCredentials",
                message: "Credenziali non valide.",
            }),
        );

        const { dispatch, actions } = createDispatch();

        await loginUser({
            email: "samuel@example.com",
            password: "wrong-password",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authFailed({
                code: "auth.invalidCredentials",
                message: "Credenziali non valide.",
            }),
        ]);
    });

    it("restores an existing session", async () => {
        vi.mocked(refreshSessionApi).mockResolvedValue(authenticatedResponse);

        const { dispatch, actions } = createDispatch();

        const restored = await restoreSession()(dispatch, vi.fn());

        expect(restored).toBe(true);
        expect(actions).toEqual([
            authCheckingStarted(),
            authAuthenticated(user),
        ]);
    });

    it("logs out when session restore fails", async () => {
        vi.mocked(refreshSessionApi).mockRejectedValue(
            new Error("Unauthorized"),
        );

        const { dispatch, actions } = createDispatch();

        const restored = await restoreSession()(dispatch, vi.fn());

        expect(restored).toBe(false);
        expect(actions).toEqual([
            authCheckingStarted(),
            ...clearedUserScopedStateActions,
            authLoggedOut(),
        ]);
    });

    it("verifies login two factor code", async () => {
        vi.mocked(verifyLogin2faApi).mockResolvedValue(authenticatedResponse);

        const { dispatch, actions } = createDispatch();

        await verifyLogin2faCode({
            challengeId: "challenge-id",
            code: "123456",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authAuthenticated(user),
        ]);
    });

    it("logs out the user", async () => {
        vi.mocked(logoutApi).mockResolvedValue();

        const { dispatch, actions } = createDispatch();

        await logoutUser()(dispatch, vi.fn());

        expect(logoutApi).toHaveBeenCalledOnce();
        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authLoggedOut(),
        ]);
    });

    it("dispatches logged out state even when logout request fails", async () => {
        vi.mocked(logoutApi).mockRejectedValue(new Error("Network error"));

        const { dispatch, actions } = createDispatch();

        await logoutUser()(dispatch, vi.fn());

        expect(logoutApi).toHaveBeenCalledOnce();
        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authLoggedOut(),
        ]);
    });

    it("dispatches email verification required state after login conflict", async () => {
        const emailVerificationRequired: EmailVerificationRequiredResponseDto =
            {
                userId: "user-id",
                email: "samuel@example.com",
                emailVerificationResendToken: "resend-token",
                emailVerificationResendTokenExpiresAt: "2026-06-02T20:30:00Z",
                emailVerificationResendAvailableAt: "2026-06-02T20:05:00Z",
            };

        vi.mocked(loginApi).mockRejectedValue(
            new ApiError(409, emailVerificationRequired),
        );

        const { dispatch, actions } = createDispatch();

        await loginUser({
            email: "samuel@example.com",
            password: "password",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            expect.objectContaining({
                type: authFailed.type,
                payload: expect.objectContaining({
                    code: "auth.emailVerification.required",
                    emailVerificationRequired,
                }),
            }),
        ]);
    });

    it("dispatches restore required state after login restore challenge", async () => {
        const result: LoginResult = {
            type: "restoreRequired",
            restoreToken: "restore-token",
            restoreTokenExpiresAt: "2026-06-03T18:00:00Z",
        };

        vi.mocked(loginApi).mockResolvedValue(result);

        const { dispatch, actions } = createDispatch();

        await loginUser({
            email: "samuel@example.com",
            password: "password",
        })(dispatch, vi.fn());

        expect(actions).toEqual([
            ...clearedUserScopedStateActions,
            authCheckingStarted(),
            authFailed({
                code: "auth.restoreAccount.required",
                restoreAccountChallenge: {
                    restoreToken: "restore-token",
                    restoreTokenExpiresAt: "2026-06-03T18:00:00Z",
                },
            }),
        ]);
    });
});

import type { AppThunk } from "../../app/store/store";
import { ApiError, clearAccessToken } from "../../shared/api";
import {
    authAuthenticated,
    authCheckingStarted,
    authFailed,
    authLoggedOut,
    authTwoFactorRequired,
} from "./authSlice";
import { login, logout, refreshSession, verifyLogin2fa } from "./authApi";
import type {
    EmailVerificationRequiredResponseDto,
    LoginRequestDto,
    VerifyLogin2faRequestDto,
} from "./authApiTypes";
import type { AuthError } from "./authTypes";

function isErrorBody(
    value: unknown,
): value is { code?: unknown; message?: unknown } {
    return typeof value === "object" && value !== null;
}

function isEmailVerificationRequiredResponse(
    value: unknown,
): value is EmailVerificationRequiredResponseDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "emailVerificationResendToken" in value &&
        typeof value.emailVerificationResendToken === "string" &&
        "email" in value &&
        typeof value.email === "string"
    );
}

function toAuthError(error: unknown): AuthError {
    if (error instanceof ApiError) {
        if (
            error.status === 409 &&
            isEmailVerificationRequiredResponse(error.body)
        ) {
            return {
                code: "auth.emailVerification.required",
                message: error.message,
                emailVerificationRequired: error.body,
            };
        }
        const code =
            isErrorBody(error.body) && typeof error.body.code === "string"
                ? error.body.code
                : `http.${error.status}`;

        const message =
            isErrorBody(error.body) && typeof error.body.message === "string"
                ? error.body.message
                : error.message;

        return {
            code,
            message,
        };
    }

    if (error instanceof Error) {
        return {
            code: "error.unexpected",
            message: error.message,
        };
    }

    return {
        code: "error.unexpected",
    };
}

export function loginUser(request: LoginRequestDto): AppThunk<Promise<void>> {
    return async (dispatch) => {
        dispatch(authCheckingStarted());

        try {
            const result = await login(request);

            if (result.type === "authenticated") {
                dispatch(authAuthenticated(result.user));
                return;
            }

            dispatch(
                authTwoFactorRequired({
                    challengeId: result.challengeId,
                    codeExpiresAt: result.codeExpiresAt,
                }),
            );
        } catch (error) {
            clearAccessToken();
            dispatch(authFailed(toAuthError(error)));
        }
    };
}

export function verifyLogin2faCode(
    request: VerifyLogin2faRequestDto,
): AppThunk<Promise<void>> {
    return async (dispatch) => {
        dispatch(authCheckingStarted());

        try {
            const response = await verifyLogin2fa(request);

            dispatch(authAuthenticated(response.user));
        } catch (error) {
            clearAccessToken();
            dispatch(authFailed(toAuthError(error)));
        }
    };
}

export function restoreSession(): AppThunk<Promise<boolean>> {
    return async (dispatch) => {
        dispatch(authCheckingStarted());

        try {
            const response = await refreshSession();

            dispatch(authAuthenticated(response.user));

            return true;
        } catch {
            clearAccessToken();
            dispatch(authLoggedOut());

            return false;
        }
    };
}

export function logoutUser(): AppThunk<Promise<void>> {
    return async (dispatch) => {
        try {
            await logout();
        } catch {
            clearAccessToken();
        } finally {
            dispatch(authLoggedOut());
        }
    };
}

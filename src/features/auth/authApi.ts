import {
    ApiError,
    apiRequest,
    clearAccessToken,
    setAccessToken,
} from "../../shared/api";
import { setSessionRefreshHandler } from "../../shared/api/sessionRefresh";
import type {
    AuthenticatedResponseDto,
    CsrfTokenResponseDto,
    CurrentUserResponseDto,
    Login2faRequiredResponseDto,
    LoginRequestDto,
    LoginResult,
    RegisterRequestDto,
    RegisterResponseDto,
    VerifyLogin2faRequestDto,
    VerifyEmailRequestDto,
    VerifyEmailResponseDto,
    ForgotPasswordRequestDto,
    ResetPasswordRequestDto,
    AcceptUserInvitationRequestDto,
    EmailVerificationRequiredResponseDto,
    ResendEmailVerificationRequestDto,
    ConfirmEmailChangeRequestDto,
    RestoreAccountChallengeResponseDto,
    RestoreAccountRequestDto,
    RestoreAccountResult,
    LoginUserDto,
} from "./authApiTypes";

function isAuthenticatedResponse(
    value: unknown,
): value is AuthenticatedResponseDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "accessToken" in value &&
        "user" in value
    );
}

function isLogin2faRequiredResponse(
    value: unknown,
): value is Login2faRequiredResponseDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "login2faChallengeId" in value &&
        "login2faCodeExpiresAt" in value
    );
}

function isRestoreAccountChallengeResponse(
    value: unknown,
): value is RestoreAccountChallengeResponseDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "restoreToken" in value &&
        typeof value.restoreToken === "string" &&
        "restoreTokenExpiresAt" in value &&
        typeof value.restoreTokenExpiresAt === "string"
    );
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

function isLoginUserResponse(value: unknown): value is LoginUserDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "userId" in value &&
        typeof value.userId === "string" &&
        "userName" in value &&
        typeof value.userName === "string" &&
        "email" in value &&
        typeof value.email === "string"
    );
}

async function csrf(): Promise<CsrfTokenResponseDto> {
    return apiRequest<CsrfTokenResponseDto>("/api/auth/csrf", {
        includeCredentials: true,
    });
}

async function postWithCsrf<TResponse>(
    path: string,
    retryOnCsrfFailure = true,
): Promise<TResponse> {
    const csrfToken = await csrf();

    try {
        return await apiRequest<TResponse>(path, {
            method: "POST",
            includeCredentials: true,
            skipAuthRefresh: true,
            headers: {
                [csrfToken.headerName]: csrfToken.token,
            },
        });
    } catch (error) {
        if (
            retryOnCsrfFailure &&
            error instanceof ApiError &&
            error.status === 403
        ) {
            return postWithCsrf<TResponse>(path, false);
        }

        throw error;
    }
}

function storeAuthenticatedResponse(
    response: AuthenticatedResponseDto,
): AuthenticatedResponseDto {
    setAccessToken(response.accessToken);
    return response;
}

export async function login(request: LoginRequestDto): Promise<LoginResult> {
    let response: unknown;

    try {
        response = await apiRequest<unknown>("/api/auth/login", {
            method: "POST",
            body: request,
            includeCredentials: true,
        });
    } catch (error) {
        if (
            error instanceof ApiError &&
            error.status === 409 &&
            isRestoreAccountChallengeResponse(error.body)
        ) {
            return {
                type: "restoreRequired",
                restoreToken: error.body.restoreToken,
                restoreTokenExpiresAt: error.body.restoreTokenExpiresAt,
            };
        }

        throw error;
    }

    if (isAuthenticatedResponse(response)) {
        storeAuthenticatedResponse(response);

        return {
            type: "authenticated",
            user: response.user,
        };
    }

    if (isLogin2faRequiredResponse(response)) {
        return {
            type: "twoFactorRequired",
            challengeId: response.login2faChallengeId,
            codeExpiresAt: response.login2faCodeExpiresAt,
        };
    }

    throw new Error("Unexpected login response.");
}

export async function verifyLogin2fa(
    request: VerifyLogin2faRequestDto,
): Promise<AuthenticatedResponseDto> {
    const response = await apiRequest<AuthenticatedResponseDto>(
        "/api/auth/login/2fa/verify",
        {
            method: "POST",
            body: request,
            includeCredentials: true,
        },
    );

    return storeAuthenticatedResponse(response);
}

export async function register(
    request: RegisterRequestDto,
): Promise<RegisterResponseDto> {
    return apiRequest<RegisterResponseDto>("/api/auth/register", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function refreshSession(): Promise<AuthenticatedResponseDto> {
    const response =
        await postWithCsrf<AuthenticatedResponseDto>("/api/auth/refresh");

    return storeAuthenticatedResponse(response);
}

export async function logout(): Promise<void> {
    try {
        await apiRequest<void>("/api/auth/logout", {
            method: "POST",
            includeCredentials: true,
        });
    } finally {
        clearAccessToken();
    }
}

export async function getCurrentUser(): Promise<CurrentUserResponseDto> {
    return apiRequest<CurrentUserResponseDto>("/api/me", {
        requiresAuth: true,
    });
}

export async function verifyEmail(
    request: VerifyEmailRequestDto,
): Promise<VerifyEmailResponseDto> {
    return apiRequest<VerifyEmailResponseDto>("/api/auth/verify-email", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function forgotPassword(
    request: ForgotPasswordRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/auth/forgot-password", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function resetPassword(
    request: ResetPasswordRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/auth/reset-password", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function acceptUserInvitation(
    request: AcceptUserInvitationRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/auth/user-invitations/accept", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function resendEmailVerification(
    request: ResendEmailVerificationRequestDto,
): Promise<EmailVerificationRequiredResponseDto> {
    return apiRequest<EmailVerificationRequiredResponseDto>(
        "/api/auth/resend-email-verification",
        {
            method: "POST",
            body: request,
            includeCredentials: true,
        },
    );
}

export async function confirmEmailChange(
    request: ConfirmEmailChangeRequestDto,
): Promise<void> {
    try {
        await apiRequest<void>("/api/auth/email-change/confirm", {
            method: "POST",
            body: request,
            includeCredentials: true,
        });
    } finally {
        clearAccessToken();
    }
}

export async function restoreAccount(
    request: RestoreAccountRequestDto,
): Promise<RestoreAccountResult> {
    const response = await apiRequest<unknown>("/api/auth/restore-account", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });

    if (isEmailVerificationRequiredResponse(response)) {
        return {
            type: "emailVerificationRequired",
            emailVerificationRequired: response,
        };
    }

    if (isLoginUserResponse(response)) {
        return {
            type: "restored",
            user: response,
        };
    }

    throw new Error("Unexpected restore account response.");
}

setSessionRefreshHandler(async () => {
    try {
        await refreshSession();

        return true;
    } catch {
        clearAccessToken();

        return false;
    }
});

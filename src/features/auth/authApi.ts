import { apiRequest, clearAccessToken, setAccessToken } from "../../shared/api";
import type {
    AuthenticatedResponseDto,
    CsrfTokenResponseDto,
    CurrentUserResponseDto,
    Login2faRequiredResponseDto,
    LoginRequestDto,
    LoginResult,
    VerifyLogin2faRequestDto,
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

async function csrf(): Promise<CsrfTokenResponseDto> {
    return apiRequest<CsrfTokenResponseDto>("/api/auth/csrf", {
        includeCredentials: true,
    });
}

async function authenticatedRequestWithCsrf<TResponse>(
    path: string,
): Promise<TResponse> {
    const csrfToken = await csrf();

    return apiRequest<TResponse>(path, {
        method: "POST",
        includeCredentials: true,
        headers: {
            [csrfToken.headerName]: csrfToken.token,
        },
    });
}

function storeAuthenticatedResponse(
    response: AuthenticatedResponseDto,
): AuthenticatedResponseDto {
    setAccessToken(response.accessToken);
    return response;
}

export async function login(request: LoginRequestDto): Promise<LoginResult> {
    const response = await apiRequest<unknown>("/api/auth/login", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });

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

export async function refreshSession(): Promise<AuthenticatedResponseDto> {
    const response =
        await authenticatedRequestWithCsrf<AuthenticatedResponseDto>(
            "/api/auth/refresh",
        );

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

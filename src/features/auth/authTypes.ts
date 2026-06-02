export type AuthStatus =
    | "anonymous"
    | "checking"
    | "authenticated"
    | "twoFactorRequired";

export type AuthUser = {
    id: string;
    email: string;
    displayName?: string | null;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
};

export type AuthError = {
    code: string;
    message?: string;
};

export type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
    error: AuthError | null;
};

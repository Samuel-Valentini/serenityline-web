export type AuthStatus =
    | "anonymous"
    | "checking"
    | "authenticated"
    | "twoFactorRequired";

export type AuthUser = {
    userId: string;
    userName: string;
    email: string;
    userGroupId: string;
    userGroupName: string;
    userRole: string;
    userPlatformRole: string;
    preferredLocale: string;
    preferredTheme: string;
    wantsInvoice: boolean;
    emailTwoFactorEnabled?: boolean;
    paymentEmailRemindersEnabled?: boolean;
};

export type AuthTwoFactorChallenge = {
    challengeId: string;
    codeExpiresAt: string;
};

export type AuthError = {
    code: string;
    message?: string;
};

export type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
    twoFactorChallenge: AuthTwoFactorChallenge | null;
    error: AuthError | null;
};

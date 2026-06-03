import type {
    EmailVerificationRequiredResponseDto,
    RestoreAccountChallengeResponseDto,
    LoginUserDto,
} from "./authApiTypes";

export type AuthStatus =
    | "anonymous"
    | "checking"
    | "authenticated"
    | "twoFactorRequired";

export type AuthUser = LoginUserDto;

export type AuthTwoFactorChallenge = {
    challengeId: string;
    codeExpiresAt: string;
};

export type AuthError = {
    code: string;
    message?: string;
    emailVerificationRequired?: EmailVerificationRequiredResponseDto;
    restoreAccountChallenge?: RestoreAccountChallengeResponseDto;
};

export type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
    twoFactorChallenge: AuthTwoFactorChallenge | null;
    error: AuthError | null;
    hasCheckedSession: boolean;
};

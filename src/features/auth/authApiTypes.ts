import type {
    PreferredLocale,
    PreferredTheme,
    UserPlatformRole,
    UserRole,
} from "../account/api/accountApiTypes";

export type LoginRequestDto = {
    email: string;
    password: string;
    deviceLabel?: string;
};

export type VerifyLogin2faRequestDto = {
    challengeId: string;
    code: string;
    deviceLabel?: string;
};

export type LoginUserDto = {
    userId: string;
    userName: string;
    email: string;
    userGroupId: string;
    userGroupName: string;
    userRole: UserRole;
    userPlatformRole: UserPlatformRole;
    preferredLocale: PreferredLocale;
    preferredTheme: PreferredTheme;
    wantsInvoice: boolean;
};

export type CurrentUserResponseDto = LoginUserDto & {
    emailTwoFactorEnabled: boolean;
    paymentEmailRemindersEnabled: boolean;
};

export type AuthenticatedResponseDto = {
    accessToken: string;
    accessTokenExpiresAt: string;
    user: LoginUserDto;
};

export type Login2faRequiredResponseDto = {
    login2faChallengeId: string;
    login2faCodeExpiresAt: string;
};

export type CsrfTokenResponseDto = {
    headerName: string;
    parameterName: string;
    token: string;
};

export type LoginResult =
    | {
          type: "authenticated";
          user: LoginUserDto;
      }
    | {
          type: "twoFactorRequired";
          challengeId: string;
          codeExpiresAt: string;
      }
    | {
          type: "restoreRequired";
          restoreToken: string;
          restoreTokenExpiresAt: string;
      };

export type RegisterRequestDto = {
    userName: string;
    email: string;
    password: string;
    preferredLocale?: "it-IT" | "en-US";
    paymentEmailRemindersEnabled?: boolean;
};

export type RegisterResponseDto = {
    userId: string;
    userName: string;
    email: string;
    userGroupId: string;
    userGroupName: string;
    userRole: string;
    preferredLocale: string;
    wantsInvoice: boolean;
    emailVerificationRequired: boolean;
};

export type VerifyEmailRequestDto = {
    token: string;
};

export type VerifyEmailResponseDto = {
    emailVerified: boolean;
};

export type ForgotPasswordRequestDto = {
    email: string;
};

export type ResetPasswordRequestDto = {
    resetToken: string;
    newPassword: string;
};

export type AcceptUserInvitationRequestDto = {
    token: string;
    password: string;
};

export type CreateUserInvitationRequestDto = {
    userName: string;
    email: string;
    userRole: Exclude<UserRole, "OWNER">;
    preferredLocale?: PreferredLocale;
    paymentEmailRemindersEnabled?: boolean;
    accountIds?: string[];
};

export type UserInvitationResponseDto = {
    userId: string;
    userName: string;
    email: string;
    userGroupId: string;
    userGroupName: string;
    userRole: UserRole;
    preferredLocale: PreferredLocale;
    accountIds: string[];
};

export type ResendEmailVerificationRequestDto = {
    emailVerificationResendToken: string;
};

export type EmailVerificationRequiredResponseDto = {
    userId: string;
    email: string;
    emailVerificationResendToken: string;
    emailVerificationResendTokenExpiresAt: string;
    emailVerificationResendAvailableAt: string;
};

export type ConfirmEmailChangeRequestDto = {
    token: string;
};

export type RestoreAccountChallengeResponseDto = {
    restoreToken: string;
    restoreTokenExpiresAt: string;
};

export type RestoreAccountRequestDto = {
    restoreToken: string;
};

export type RestoreAccountResult =
    | {
          type: "restored";
          user: LoginUserDto;
      }
    | {
          type: "emailVerificationRequired";
          emailVerificationRequired: EmailVerificationRequiredResponseDto;
      };

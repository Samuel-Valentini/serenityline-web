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
    userRole: string;
    userPlatformRole: string;
    preferredLocale: string;
    preferredTheme: string;
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

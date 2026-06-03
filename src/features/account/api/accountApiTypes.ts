export type Uuid = string;
export type IsoDateTime = string;

export type PreferredLocale = "it-IT" | "en-US";
export type PreferredTheme = "DEFAULT" | "LIGHT" | "DARK";

export type UserRole =
    | "OWNER"
    | "SUPER_COLLABORATOR"
    | "VIEWER_COLLABORATOR"
    | "COLLABORATOR";

export type UserPlatformRole = "USER" | "ADMIN" | "SUPERADMIN";

export type CurrentUserResponseDto = {
    userId: Uuid;
    userName: string;
    email: string;
    userGroupId: Uuid;
    userGroupName: string;
    userRole: UserRole;
    userPlatformRole: UserPlatformRole;
    preferredLocale: PreferredLocale;
    preferredTheme: PreferredTheme;
    wantsInvoice: boolean;
    emailTwoFactorEnabled: boolean;
    paymentEmailRemindersEnabled: boolean;
};

export type ChangePasswordRequestDto = {
    currentPassword: string;
    newPassword: string;
};

export type UpdatePaymentEmailRemindersRequestDto = {
    enabled: boolean;
};

export type PaymentEmailRemindersResponseDto = {
    paymentEmailRemindersEnabled: boolean;
};

export type RequestEmailChangeRequestDto = {
    newEmail: string;
    currentPassword: string;
};

export type RequestEnableEmail2faRequestDto = {
    currentPassword: string;
};

export type RequestDisableEmail2faRequestDto = {
    currentPassword: string;
};

export type Email2faChallengeResponseDto = {
    challengeId: Uuid;
    codeExpiresAt: IsoDateTime;
};

export type ConfirmEnableEmail2faRequestDto = {
    challengeId: Uuid;
    code: string;
};

export type ConfirmDisableEmail2faRequestDto = {
    challengeId: Uuid;
    code: string;
};

export type AccountExportFile = {
    blob: Blob;
    filename: string;
};

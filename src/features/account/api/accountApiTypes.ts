export type Uuid = string;
export type IsoDateTime = string;

export type CurrentUserResponseDto = {
    userId: Uuid;
    userName: string;
    email: string;
    userGroupId: Uuid;
    userGroupName: string;
    userRole: string;
    userPlatformRole: string;
    preferredLocale: string;
    preferredTheme: string;
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

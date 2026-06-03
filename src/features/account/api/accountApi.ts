import { apiRequest } from "../../../shared/api";
import { getAccessToken } from "../../../shared/api/accessTokenStore";
import { env } from "../../../shared/config/env";

import type {
    ChangePasswordRequestDto,
    ConfirmDisableEmail2faRequestDto,
    ConfirmEnableEmail2faRequestDto,
    CurrentUserResponseDto,
    Email2faChallengeResponseDto,
    PaymentEmailRemindersResponseDto,
    RequestDisableEmail2faRequestDto,
    RequestEmailChangeRequestDto,
    RequestEnableEmail2faRequestDto,
    UpdatePaymentEmailRemindersRequestDto,
    AccountExportFile,
} from "./accountApiTypes";

export async function getCurrentUser(): Promise<CurrentUserResponseDto> {
    return apiRequest<CurrentUserResponseDto>("/api/me");
}

export async function changePassword(
    request: ChangePasswordRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/me/change-password", {
        method: "POST",
        body: request,
        includeCredentials: true,
    });
}

export async function updatePaymentEmailReminders(
    request: UpdatePaymentEmailRemindersRequestDto,
): Promise<PaymentEmailRemindersResponseDto> {
    return apiRequest<PaymentEmailRemindersResponseDto>(
        "/api/me/payment-email-reminders",
        {
            method: "PATCH",
            body: request,
        },
    );
}

export async function requestEmailChange(
    request: RequestEmailChangeRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/me/email-change/request", {
        method: "POST",
        body: request,
    });
}

export async function requestEnableEmail2fa(
    request: RequestEnableEmail2faRequestDto,
): Promise<Email2faChallengeResponseDto> {
    return apiRequest<Email2faChallengeResponseDto>(
        "/api/me/email-2fa/enable/request",
        {
            method: "POST",
            body: request,
        },
    );
}

export async function confirmEnableEmail2fa(
    request: ConfirmEnableEmail2faRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/me/email-2fa/enable/confirm", {
        method: "POST",
        body: request,
    });
}

export async function requestDisableEmail2fa(
    request: RequestDisableEmail2faRequestDto,
): Promise<Email2faChallengeResponseDto> {
    return apiRequest<Email2faChallengeResponseDto>(
        "/api/me/email-2fa/disable/request",
        {
            method: "POST",
            body: request,
        },
    );
}

export async function confirmDisableEmail2fa(
    request: ConfirmDisableEmail2faRequestDto,
): Promise<void> {
    return apiRequest<void>("/api/me/email-2fa/disable/confirm", {
        method: "POST",
        body: request,
    });
}

export async function deleteCurrentUser(): Promise<void> {
    return apiRequest<void>("/api/me", {
        method: "DELETE",
        includeCredentials: true,
    });
}

function getFilenameFromContentDisposition(
    contentDisposition: string | null,
): string {
    if (!contentDisposition) {
        return "serenityline-account-export.zip";
    }

    const filenameStarMatch = /filename\*=UTF-8''([^;]+)/i.exec(
        contentDisposition,
    );

    if (filenameStarMatch?.[1]) {
        return decodeURIComponent(filenameStarMatch[1].replaceAll('"', ""));
    }

    const filenameMatch = /filename="?([^"]+)"?/i.exec(contentDisposition);

    return filenameMatch?.[1] ?? "serenityline-account-export.zip";
}

export async function exportCurrentUserData(): Promise<AccountExportFile> {
    const accessToken = getAccessToken();

    const response = await fetch(`${env.apiBaseUrl}/api/me/export`, {
        method: "GET",
        headers: {
            Accept: "application/zip",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error(
            `Account export failed with status ${response.status}.`,
        );
    }

    return {
        blob: await response.blob(),
        filename: getFilenameFromContentDisposition(
            response.headers.get("Content-Disposition"),
        ),
    };
}

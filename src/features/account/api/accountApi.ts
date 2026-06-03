import { apiRequest } from "../../../shared/api";
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

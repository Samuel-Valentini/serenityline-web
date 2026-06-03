import type { CurrentUserResponseDto } from "./api/accountApiTypes";

export type AccountStatus = "idle" | "loading" | "loaded" | "failed";

export type AccountError = {
    code: string;
    message?: string;
};

export type AccountState = {
    status: AccountStatus;
    currentUser: CurrentUserResponseDto | null;
    error: AccountError | null;
};

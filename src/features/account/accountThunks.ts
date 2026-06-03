import type { AppThunk } from "../../app/store/store";
import { ApiError } from "../../shared/api";
import { getCurrentUser } from "./api/accountApi";
import {
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} from "./accountSlice";
import type { AccountError } from "./accountTypes";

function isErrorBody(
    value: unknown,
): value is { code?: unknown; message?: unknown } {
    return typeof value === "object" && value !== null;
}

function toAccountError(error: unknown): AccountError {
    if (error instanceof ApiError) {
        const code =
            isErrorBody(error.body) && typeof error.body.code === "string"
                ? error.body.code
                : `http.${error.status}`;

        const message =
            isErrorBody(error.body) && typeof error.body.message === "string"
                ? error.body.message
                : error.message;

        return {
            code,
            message,
        };
    }

    if (error instanceof Error) {
        return {
            code: "error.unexpected",
            message: error.message,
        };
    }

    return {
        code: "error.unexpected",
    };
}

export function loadCurrentUser(): AppThunk<Promise<void>> {
    return async (dispatch) => {
        dispatch(accountLoadingStarted());

        try {
            const currentUser = await getCurrentUser();

            dispatch(accountLoaded(currentUser));
        } catch (error) {
            dispatch(accountLoadingFailed(toAccountError(error)));
        }
    };
}

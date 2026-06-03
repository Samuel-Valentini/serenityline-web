import type { AppDispatch } from "../../app/store/store";
import type { CurrentUserResponseDto } from "./api/accountApiTypes";

import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../../shared/api";
import { getCurrentUser } from "./api/accountApi";
import {
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} from "./accountSlice";
import { loadCurrentUser } from "./accountThunks";

vi.mock("./api/accountApi", () => ({
    getCurrentUser: vi.fn(),
}));

function createDispatch() {
    const actions: unknown[] = [];
    const dispatch = vi.fn((action: unknown) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;

    return {
        actions,
        dispatch,
    };
}

describe("accountThunks", () => {
    it("loads the current user", async () => {
        const currentUser: CurrentUserResponseDto = {
            userId: "user-id",
            userName: "Samuel",
            email: "samuel@example.com",
            userGroupId: "group-id",
            userGroupName: "Samuel",
            userRole: "OWNER",
            userPlatformRole: "USER",
            preferredLocale: "it-IT",
            preferredTheme: "DEFAULT",
            wantsInvoice: false,
            emailTwoFactorEnabled: false,
            paymentEmailRemindersEnabled: true,
        };

        vi.mocked(getCurrentUser).mockResolvedValueOnce(currentUser);

        const { dispatch, actions } = createDispatch();

        await loadCurrentUser()(dispatch, vi.fn());

        expect(actions).toEqual([
            accountLoadingStarted(),
            accountLoaded(currentUser),
        ]);
    });

    it("dispatches a typed error when loading the current user fails", async () => {
        vi.mocked(getCurrentUser).mockRejectedValueOnce(
            new ApiError(403, {
                code: "auth.forbidden",
                message: "Forbidden",
            }),
        );

        const { dispatch, actions } = createDispatch();

        await loadCurrentUser()(dispatch, vi.fn());

        expect(actions[0]).toEqual(accountLoadingStarted());
        expect(actions[1]).toEqual(
            accountLoadingFailed({
                code: "auth.forbidden",
                message: "Forbidden",
            }),
        );
    });
});

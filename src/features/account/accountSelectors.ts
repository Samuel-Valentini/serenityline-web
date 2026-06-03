import type { RootState } from "../../app/store/store";

export const selectAccountStatus = (state: RootState) => state.account.status;

export const selectCurrentUser = (state: RootState) =>
    state.account.currentUser;

export const selectAccountError = (state: RootState) => state.account.error;

export const selectIsCurrentUserLoading = (state: RootState) =>
    state.account.status === "loading";

export const selectHasLoadedCurrentUser = (state: RootState) =>
    state.account.status === "loaded";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CurrentUserResponseDto } from "./api/accountApiTypes";
import type { AccountError, AccountState } from "./accountTypes";

export const initialAccountState: AccountState = {
    status: "idle",
    currentUser: null,
    error: null,
};

const accountSlice = createSlice({
    name: "account",
    initialState: initialAccountState,
    reducers: {
        accountLoadingStarted(state) {
            state.status = "loading";
            state.error = null;
        },
        accountLoaded(state, action: PayloadAction<CurrentUserResponseDto>) {
            state.status = "loaded";
            state.currentUser = action.payload;
            state.error = null;
        },
        accountLoadingFailed(state, action: PayloadAction<AccountError>) {
            state.status = "failed";
            state.error = action.payload;
        },
        accountCleared(state) {
            state.status = "idle";
            state.currentUser = null;
            state.error = null;
        },
    },
});

export const {
    accountCleared,
    accountLoaded,
    accountLoadingFailed,
    accountLoadingStarted,
} = accountSlice.actions;

export const accountReducer = accountSlice.reducer;

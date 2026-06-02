import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthError, AuthState, AuthUser } from "./authTypes";

const initialState: AuthState = {
  status: "anonymous",
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authCheckingStarted(state) {
      state.status = "checking";
      state.error = null;
    },
    authAuthenticated(state, action: PayloadAction<AuthUser>) {
      state.status = "authenticated";
      state.user = action.payload;
      state.error = null;
    },
    authTwoFactorRequired(state) {
      state.status = "twoFactorRequired";
      state.user = null;
      state.error = null;
    },
    authFailed(state, action: PayloadAction<AuthError>) {
      state.status = "anonymous";
      state.user = null;
      state.error = action.payload;
    },
    authLoggedOut(state) {
      state.status = "anonymous";
      state.user = null;
      state.error = null;
    },
    authErrorCleared(state) {
      state.error = null;
    },
  },
});

export const {
  authCheckingStarted,
  authAuthenticated,
  authTwoFactorRequired,
  authFailed,
  authLoggedOut,
  authErrorCleared,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  AuthError,
  AuthState,
  AuthTwoFactorChallenge,
  AuthUser,
} from "./authTypes";

const initialState: AuthState = {
  status: "anonymous",
  user: null,
  twoFactorChallenge: null,
  error: null,
  hasCheckedSession: false,
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
      state.twoFactorChallenge = null;
      state.error = null;
      state.hasCheckedSession = true;
    },
    authTwoFactorRequired(
      state,
      action: PayloadAction<AuthTwoFactorChallenge>,
    ) {
      state.status = "twoFactorRequired";
      state.user = null;
      state.twoFactorChallenge = action.payload;
      state.error = null;
      state.hasCheckedSession = true;
    },
    authFailed(state, action: PayloadAction<AuthError>) {
      state.status = "anonymous";
      state.user = null;
      state.twoFactorChallenge = null;
      state.error = action.payload;
      state.hasCheckedSession = true;
    },
    authLoggedOut(state) {
      state.status = "anonymous";
      state.user = null;
      state.twoFactorChallenge = null;
      state.error = null;
      state.hasCheckedSession = true;
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
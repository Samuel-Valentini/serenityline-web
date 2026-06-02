import type { RootState } from "../../app/store/store";

export function selectAuthStatus(state: RootState) {
    return state.auth.status;
}

export function selectAuthUser(state: RootState) {
    return state.auth.user;
}

export function selectAuthTwoFactorChallenge(state: RootState) {
    return state.auth.twoFactorChallenge;
}

export function selectAuthError(state: RootState) {
    return state.auth.error;
}

export function selectHasCheckedSession(state: RootState) {
    return state.auth.hasCheckedSession;
}

export function selectIsAuthenticated(state: RootState) {
    return state.auth.status === "authenticated";
}

export function selectIsCheckingAuth(state: RootState) {
    return state.auth.status === "checking";
}

export function selectIsTwoFactorRequired(state: RootState) {
    return state.auth.status === "twoFactorRequired";
}

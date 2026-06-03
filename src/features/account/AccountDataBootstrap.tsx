import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectIsAuthenticated,
    selectIsCheckingAuth,
} from "../auth/authSelectors";
import { selectAccountStatus } from "./accountSelectors";
import { accountCleared } from "./accountSlice";
import { loadCurrentUser } from "./accountThunks";

export function AccountDataBootstrap() {
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const accountStatus = useAppSelector(selectAccountStatus);

    useEffect(() => {
        if (isCheckingAuth) {
            return;
        }

        if (isAuthenticated) {
            if (accountStatus === "idle") {
                void dispatch(loadCurrentUser());
            }

            return;
        }

        if (accountStatus !== "idle") {
            dispatch(accountCleared());
        }
    }, [accountStatus, dispatch, isAuthenticated, isCheckingAuth]);

    return null;
}

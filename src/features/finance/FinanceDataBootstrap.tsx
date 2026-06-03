import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    selectAccountStatus,
    selectCurrentUser,
} from "../account/accountSelectors";
import { selectIsAuthenticated } from "../auth/authSelectors";
import { selectFinanceDataStatus } from "./financeDataSelectors";
import { financeDataCleared } from "./financeDataSlice";
import { loadFinanceReferenceData } from "./financeDataThunks";

export function FinanceDataBootstrap() {
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const accountStatus = useAppSelector(selectAccountStatus);
    const currentUser = useAppSelector(selectCurrentUser);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);

    useEffect(() => {
        if (!isAuthenticated || accountStatus === "idle") {
            if (financeDataStatus !== "idle") {
                dispatch(financeDataCleared());
            }

            return;
        }

        if (accountStatus !== "loaded" || !currentUser) {
            return;
        }

        if (financeDataStatus === "idle") {
            void dispatch(loadFinanceReferenceData());
        }
    }, [
        accountStatus,
        currentUser,
        dispatch,
        financeDataStatus,
        isAuthenticated,
    ]);

    return null;
}

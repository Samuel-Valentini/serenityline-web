import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "../../features/auth/authSlice";
import { appReducer } from "./appSlice";
import { accountReducer } from "../../features/account/accountSlice";
import { financeDataReducer } from "../../features/finance/financeDataSlice";

export const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
        account: accountReducer,
        financeData: financeDataReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<TResult = void> = (
    dispatch: AppDispatch,
    getState: () => RootState,
) => TResult;

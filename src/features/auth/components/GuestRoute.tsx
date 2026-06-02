import { Navigate, Outlet } from "react-router";

import { useAppSelector } from "../../../app/store/hooks";
import { FullPageLoading } from "../../../shared/components/FullPageLoading";
import { ROUTES } from "../../../shared/constants/routes";
import {
    selectHasCheckedSession,
    selectIsAuthenticated,
    selectIsCheckingAuth,
} from "../authSelectors";

export function GuestRoute() {
    const hasCheckedSession = useAppSelector(selectHasCheckedSession);
    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!hasCheckedSession || isCheckingAuth) {
        return <FullPageLoading />;
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.app.dashboard} replace />;
    }

    return <Outlet />;
}

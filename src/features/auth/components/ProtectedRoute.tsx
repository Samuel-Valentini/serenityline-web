import { Navigate, Outlet, useLocation } from "react-router";

import { useAppSelector } from "../../../app/store/hooks";
import { FullPageLoading } from "../../../shared/components/FullPageLoading";
import { ROUTES } from "../../../shared/constants/routes";
import {
    selectHasCheckedSession,
    selectIsAuthenticated,
    selectIsCheckingAuth,
} from "../authSelectors";

export function ProtectedRoute() {
    const location = useLocation();
    const hasCheckedSession = useAppSelector(selectHasCheckedSession);
    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!hasCheckedSession || isCheckingAuth) {
        return <FullPageLoading />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.auth.login}
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}

// todo: delete this comment
// import { Outlet } from "react-router";

// export function ProtectedRoute() {
//     return <Outlet />;
// }

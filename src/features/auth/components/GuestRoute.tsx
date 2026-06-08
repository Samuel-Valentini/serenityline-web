import { Navigate, Outlet, useLocation } from "react-router";

import { useAppSelector } from "../../../app/store/hooks";
import { FullPageLoading } from "../../../shared/components/FullPageLoading";
import { ROUTES } from "../../../shared/constants/routes";
import {
    selectHasCheckedSession,
    selectIsAuthenticated,
    selectIsCheckingAuth,
} from "../authSelectors";

type RouteLocationState = {
    from?: {
        pathname?: string;
    };
};

function getSafeInternalRedirectPath(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    if (!value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
}

export function GuestRoute() {
    const location = useLocation();

    const hasCheckedSession = useAppSelector(selectHasCheckedSession);
    const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const locationState = location.state as RouteLocationState | null;
    const searchParams = new URLSearchParams(location.search);

    const redirectTo =
        getSafeInternalRedirectPath(searchParams.get("returnTo")) ??
        getSafeInternalRedirectPath(locationState?.from?.pathname) ??
        ROUTES.app.dashboard;

    if (!hasCheckedSession || isCheckingAuth) {
        return <FullPageLoading />;
    }

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}

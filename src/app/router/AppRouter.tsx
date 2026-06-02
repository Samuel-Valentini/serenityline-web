import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { GuestRoute } from "../../features/auth/components/GuestRoute";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { AppLayout } from "../../layouts/AppLayout";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PublicLayout } from "../../layouts/PublicLayout";
import { DashboardPage } from "../../pages/app/DashboardPage";
import { Login2faPage } from "../../pages/auth/Login2faPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { HomePage } from "../../pages/public/HomePage";
import { ROUTES } from "../../shared/constants/routes";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                </Route>

                <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route
                            path={ROUTES.auth.login}
                            element={<LoginPage />}
                        />
                        <Route
                            path={ROUTES.auth.login2fa}
                            element={<Login2faPage />}
                        />
                    </Route>
                </Route>

                <Route path={ROUTES.app.root} element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route
                            index
                            element={
                                <Navigate to={ROUTES.app.dashboard} replace />
                            }
                        />
                        <Route path="dashboard" element={<DashboardPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

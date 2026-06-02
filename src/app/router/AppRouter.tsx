import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { AppLayout } from "../../layouts/AppLayout";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PublicLayout } from "../../layouts/PublicLayout";
import { DashboardPage } from "../../pages/app/DashboardPage";
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

                <Route element={<AuthLayout />}>
                    <Route path={ROUTES.auth.login} element={<LoginPage />} />
                </Route>

                <Route path={ROUTES.app.root} element={<AppLayout />}>
                    <Route
                        index
                        element={<Navigate to={ROUTES.app.dashboard} replace />}
                    />
                    <Route path="dashboard" element={<DashboardPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

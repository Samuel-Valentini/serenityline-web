import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { GuestRoute } from "../../features/auth/components/GuestRoute";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { AppLayout } from "../../layouts/AppLayout";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PublicLayout } from "../../layouts/PublicLayout";
import { AppPlaceholderPage } from "../../pages/app/AppPlaceholderPage";
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
                        <Route
                            path="serenityline"
                            element={
                                <AppPlaceholderPage pageKey="serenityline" />
                            }
                        />
                        <Route
                            path="calendario"
                            element={<AppPlaceholderPage pageKey="calendar" />}
                        />
                        <Route
                            path="transazioni"
                            element={
                                <AppPlaceholderPage pageKey="transactions" />
                            }
                        />
                        <Route
                            path="ricorrenti"
                            element={
                                <AppPlaceholderPage pageKey="recurringTransactions" />
                            }
                        />
                        <Route
                            path="simulazioni"
                            element={
                                <AppPlaceholderPage pageKey="simulations" />
                            }
                        />
                        <Route
                            path="portafogli"
                            element={
                                <AppPlaceholderPage pageKey="portfolios" />
                            }
                        />
                        <Route
                            path="conti"
                            element={<AppPlaceholderPage pageKey="accounts" />}
                        />
                        <Route
                            path="saldi"
                            element={<AppPlaceholderPage pageKey="balances" />}
                        />
                        <Route
                            path="categorie"
                            element={
                                <AppPlaceholderPage pageKey="categories" />
                            }
                        />
                        <Route
                            path="impostazioni"
                            element={<AppPlaceholderPage pageKey="settings" />}
                        />
                        <Route
                            path="amministrazione"
                            element={
                                <AppPlaceholderPage pageKey="administration" />
                            }
                        />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { GuestRoute } from "../../features/auth/components/GuestRoute";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { AppLayout } from "../../layouts/AppLayout";
import { AuthLayout } from "../../layouts/AuthLayout";
import { PublicLayout } from "../../layouts/PublicLayout";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { DashboardPage } from "../../pages/app/DashboardPage";
import { Login2faPage } from "../../pages/auth/Login2faPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { HomePage } from "../../pages/public/HomePage";
import { PublicInfoPage } from "../../pages/public/PublicInfoPage";
import { ROUTES } from "../../shared/constants/routes";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { VerifyEmailPage } from "../../pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "../../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../../pages/auth/ResetPasswordPage";
import { AcceptInvitationPage } from "../../pages/auth/AcceptInvitationPage";
import { SettingsPage } from "../../pages/app/SettingsPage";
import { ConfirmEmailChangePage } from "../../pages/auth/ConfirmEmailChangePage";
import { AccountsPage } from "../../pages/app/AccountsPage";
import { CreditCardsPage } from "../../pages/app/CreditCardsPage";
import { CategoriesPage } from "../../pages/app/CategoriesPage";
import { BucketsPage } from "../../pages/app/BucketsPage";
import { SimulationsPage } from "../../pages/app/SimulationsPage";
import { RecurringTransactionsPage } from "../../pages/app/RecurringTransactionsPage";
import { TransactionsPage } from "../../pages/app/TransactionsPage";
import { CalendarPage } from "../../pages/app/CalendarPage";
import { SerenityLinePage } from "../../pages/app/SerenityLinePage";
import { BalancesPage } from "../../pages/app/BalancesPage";
import { AdministrationPage } from "../../pages/app/AdministrationPage";
import { SecurityPage } from "../../pages/public/SecurityPage";
import { HowItWorksPage } from "../../pages/public/HowItWorksPage";
import { ScrollToTop } from "./ScrollToTop";
import { ContactPage } from "../../pages/public/ContactPage";
import { PrivacyPage } from "../../pages/public/PrivacyPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route
                        path={ROUTES.public.howItWorks}
                        element={<HowItWorksPage />}
                    />
                    <Route
                        path={ROUTES.public.security}
                        element={<SecurityPage />}
                    />
                    <Route
                        path={ROUTES.public.contact}
                        element={<ContactPage />}
                    />
                    <Route
                        path={ROUTES.public.privacy}
                        element={<PrivacyPage />}
                    />
                    <Route
                        path={ROUTES.public.terms}
                        element={<PublicInfoPage pageKey="terms" />}
                    />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route
                        path={ROUTES.auth.confirmEmailChange}
                        element={<ConfirmEmailChangePage />}
                    />
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
                        <Route
                            path={ROUTES.auth.register}
                            element={<RegisterPage />}
                        />
                        <Route
                            path={ROUTES.auth.verifyEmail}
                            element={<VerifyEmailPage />}
                        />
                        <Route
                            path={ROUTES.auth.forgotPassword}
                            element={<ForgotPasswordPage />}
                        />
                        <Route
                            path={ROUTES.auth.resetPassword}
                            element={<ResetPasswordPage />}
                        />
                        <Route
                            path={ROUTES.auth.acceptInvitation}
                            element={<AcceptInvitationPage />}
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
                            element={<SerenityLinePage />}
                        />
                        <Route path="calendario" element={<CalendarPage />} />
                        <Route
                            path="transazioni"
                            element={<TransactionsPage />}
                        />
                        <Route
                            path="ricorrenti"
                            element={<RecurringTransactionsPage />}
                        />
                        <Route
                            path="simulazioni"
                            element={<SimulationsPage />}
                        />
                        <Route path="portafogli" element={<BucketsPage />} />
                        <Route path="conti" element={<AccountsPage />} />
                        <Route path="carte" element={<CreditCardsPage />} />
                        <Route path="saldi" element={<BalancesPage />} />
                        <Route path="categorie" element={<CategoriesPage />} />
                        <Route path="impostazioni" element={<SettingsPage />} />
                        <Route
                            path="amministrazione"
                            element={<AdministrationPage />}
                        />
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

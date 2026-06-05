import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";

import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
    selectAuthStatus,
    selectIsAuthenticated,
} from "../features/auth/authSelectors";
import { logoutUser } from "../features/auth/authThunks";
import { ROUTES } from "../shared/constants/routes";
import serenityLineLogo from "../assets/serenityline-logo.svg";

export function PublicLayout() {
    const { t } = useTranslation("publicShell");
    const dispatch = useAppDispatch();

    const authStatus = useAppSelector(selectAuthStatus);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const isCheckingAuth = authStatus === "checking";

    function handleLogout() {
        void dispatch(logoutUser());
    }

    return (
        <div className="sl-public-layout">
            <header className="sl-public-topbar">
                <Link
                    aria-label={t("brandLabel")}
                    className="sl-public-brand"
                    to={ROUTES.public.home}>
                    <img
                        aria-hidden="true"
                        className="sl-public-brand-logo"
                        src={serenityLineLogo}
                        alt=""
                    />
                    <span className="sl-public-brand-name">SerenityLine</span>
                </Link>

                <nav
                    aria-label={t("navigationLabel")}
                    className="sl-public-nav">
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "sl-public-nav-link active"
                                : "sl-public-nav-link"
                        }
                        end
                        to={ROUTES.public.home}>
                        {t("home")}
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "sl-public-nav-link active"
                                : "sl-public-nav-link"
                        }
                        to={ROUTES.public.howItWorks}>
                        {t("howItWorks")}
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "sl-public-nav-link active"
                                : "sl-public-nav-link"
                        }
                        to={ROUTES.public.security}>
                        {t("security")}
                    </NavLink>
                </nav>

                <div className="sl-public-actions">
                    {isAuthenticated ? (
                        <>
                            <Link
                                className="btn btn-outline-primary btn-sm"
                                to={ROUTES.app.dashboard}>
                                {t("dashboard")}
                            </Link>

                            <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                disabled={isCheckingAuth}
                                onClick={handleLogout}>
                                {t("logout")}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                className="btn btn-outline-primary btn-sm"
                                to={ROUTES.auth.login}>
                                {t("login")}
                            </Link>

                            <Link
                                className="btn btn-primary btn-sm"
                                to={ROUTES.auth.register}>
                                {t("register")}
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <Outlet />

            <footer className="sl-public-footer text-center">
                <span>
                    © SerenityLine, 2026 <br />
                    Samuel Valentini
                </span>
                <span>{t("footerClaim")}</span>
            </footer>
        </div>
    );
}

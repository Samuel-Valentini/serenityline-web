import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";

import { ROUTES } from "../shared/constants/routes";

export function PublicLayout() {
    const { t } = useTranslation("publicShell");

    return (
        <div className="sl-public-layout">
            <header className="sl-public-topbar">
                <Link className="sl-public-brand" to={ROUTES.public.home}>
                    SerenityLine
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
                </div>
            </header>

            <Outlet />

            <footer className="sl-public-footer">
                <span className="text-center">
                    © SerenityLine, 2026
                    <br />
                    Samuel Valentini{" "}
                </span>
                <span>{t("footerClaim")}</span>
            </footer>
        </div>
    );
}

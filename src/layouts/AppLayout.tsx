import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";

import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import { selectCurrentUser } from "../features/account/accountSelectors";
import { selectAuthUser } from "../features/auth/authSelectors";
import { logoutUser } from "../features/auth/authThunks";
import { ROUTES } from "../shared/constants/routes";
import serenityLineLogo from "../assets/serenityline-logo.svg";

const appNavigationItems = [
    {
        to: ROUTES.app.dashboard,
        labelKey: "nav.dashboard",
    },
    {
        to: ROUTES.app.serenityline,
        labelKey: "nav.serenityline",
    },
    {
        to: ROUTES.app.calendar,
        labelKey: "nav.calendar",
    },
    {
        to: ROUTES.app.transactions,
        labelKey: "nav.transactions",
    },
    {
        to: ROUTES.app.recurringTransactions,
        labelKey: "nav.recurringTransactions",
    },
    {
        to: ROUTES.app.simulations,
        labelKey: "nav.simulations",
    },
    {
        to: ROUTES.app.buckets,
        labelKey: "nav.buckets",
    },
    {
        to: ROUTES.app.balances,
        labelKey: "nav.balances",
    },
    {
        to: ROUTES.app.accounts,
        labelKey: "nav.accounts",
    },
    {
        to: ROUTES.app.creditCards,
        labelKey: "nav.creditCards",
    },
    {
        to: ROUTES.app.categories,
        labelKey: "nav.categories",
    },
    {
        to: ROUTES.app.settings,
        labelKey: "nav.settings",
    },
    {
        to: ROUTES.app.administration,
        labelKey: "nav.administration",
    },
    {
        to: ROUTES.public.contact,
        labelKey: "nav.contact",
    },
] as const;

export function AppLayout() {
    const { t } = useTranslation(["appShell", "common"]);
    const dispatch = useAppDispatch();

    const authUser = useAppSelector(selectAuthUser);
    const currentUser = useAppSelector(selectCurrentUser);

    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileNavigationOpen, setMobileNavigationOpen] = useState(false);

    function handleLogout() {
        void dispatch(logoutUser());
    }

    function closeMobileNavigation() {
        setMobileNavigationOpen(false);
    }

    const userLabel =
        currentUser?.userName ||
        currentUser?.email ||
        authUser?.userName ||
        authUser?.email ||
        t("userFallback");

    const appLayoutClassName = isSidebarCollapsed
        ? "sl-app-layout is-sidebar-collapsed"
        : "sl-app-layout";

    const navigationLinks = appNavigationItems.map((item) => (
        <NavLink
            className={({ isActive }) =>
                isActive ? "sl-app-nav-link active" : "sl-app-nav-link"
            }
            key={item.to}
            to={item.to}
            onClick={closeMobileNavigation}>
            {t(item.labelKey)}
        </NavLink>
    ));

    return (
        <div className={appLayoutClassName}>
            <header className="sl-app-topbar">
                <div className="sl-app-topbar-main">
                    <button
                        className="sl-app-menu-button"
                        type="button"
                        aria-label={t("openNavigation")}
                        aria-expanded={isMobileNavigationOpen}
                        onClick={() => setMobileNavigationOpen(true)}>
                        <span />
                        <span />
                        <span />
                    </button>

                    <Link
                        className="sl-app-brand-lockup"
                        to={ROUTES.public.home}
                        aria-label={t("brandLabel")}>
                        <img
                            className="sl-app-brand-logo"
                            src={serenityLineLogo}
                            alt=""
                            aria-hidden="true"
                        />

                        <span>
                            <span className="sl-app-brand-eyebrow">
                                SerenityLine
                            </span>
                            <strong className="sl-app-brand">
                                {t("common:claim")}
                            </strong>
                        </span>
                    </Link>
                </div>

                <nav
                    className="sl-app-quick-actions"
                    aria-label={t("quickActionsLabel")}>
                    <Link
                        className="btn btn-primary btn-sm"
                        to={ROUTES.app.transactions}>
                        {t("nav.transactions")}
                    </Link>

                    <Link
                        className="btn btn-outline-primary btn-sm"
                        to={ROUTES.app.recurringTransactions}>
                        {t("nav.recurringTransactions")}
                    </Link>
                </nav>

                <div className="sl-app-user-area">
                    <span className="sl-app-user-name">{userLabel}</span>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleLogout}
                        type="button">
                        {t("logout")}
                    </button>
                </div>
            </header>

            {isSidebarCollapsed ? (
                <button
                    className="sl-app-sidebar-restore"
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}>
                    <span aria-hidden="true">☰</span>
                    {t("expandSidebar")}
                </button>
            ) : null}

            <div className="sl-app-shell">
                {!isSidebarCollapsed ? (
                    <aside className="sl-app-sidebar">
                        <div className="sl-app-sidebar-header">
                            <span>{t("navigationTitle")}</span>

                            <button
                                className="sl-app-sidebar-toggle"
                                type="button"
                                onClick={() => setSidebarCollapsed(true)}>
                                <span aria-hidden="true">‹</span>
                                {t("collapseSidebar")}
                            </button>
                        </div>

                        <nav
                            aria-label={t("navigationLabel")}
                            className="sl-app-nav">
                            {navigationLinks}
                        </nav>
                    </aside>
                ) : null}

                <div className="sl-app-main">
                    <Outlet />
                </div>
            </div>

            {isMobileNavigationOpen ? (
                <div
                    className="sl-app-mobile-nav-backdrop"
                    role="presentation"
                    onClick={closeMobileNavigation}>
                    <aside
                        className="sl-app-mobile-drawer"
                        aria-label={t("navigationLabel")}
                        onClick={(event) => event.stopPropagation()}>
                        <div className="sl-app-mobile-drawer-header">
                            <Link
                                className="sl-app-brand-lockup"
                                to={ROUTES.public.home}
                                onClick={closeMobileNavigation}
                                aria-label={t("brandLabel")}>
                                <img
                                    className="sl-app-brand-logo"
                                    src={serenityLineLogo}
                                    alt=""
                                    aria-hidden="true"
                                />

                                <span>
                                    <span className="sl-app-brand-eyebrow">
                                        SerenityLine
                                    </span>
                                    <strong className="sl-app-brand">
                                        {t("common:claim")}
                                    </strong>
                                </span>
                            </Link>

                            <button
                                className="btn btn-outline-primary btn-sm"
                                type="button"
                                onClick={closeMobileNavigation}>
                                {t("closeNavigation")}
                            </button>
                        </div>

                        <nav
                            aria-label={t("navigationLabel")}
                            className="sl-app-nav sl-app-mobile-nav">
                            {navigationLinks}
                        </nav>
                    </aside>
                </div>
            ) : null}
        </div>
    );
}

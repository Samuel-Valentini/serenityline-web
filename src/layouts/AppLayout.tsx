import { NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import { selectAuthUser } from "../features/auth/authSelectors";
import { logoutUser } from "../features/auth/authThunks";
import { ROUTES } from "../shared/constants/routes";

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
    to: ROUTES.app.portfolios,
    labelKey: "nav.portfolios",
  },
  {
    to: ROUTES.app.accounts,
    labelKey: "nav.accounts",
  },
  {
    to: ROUTES.app.balances,
    labelKey: "nav.balances",
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
] as const;

export function AppLayout() {
  const { t } = useTranslation("appShell");
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  function handleLogout() {
    void dispatch(logoutUser());
  }

  const userLabel = user?.userName || user?.email || t("userFallback");

  return (
    <div className="sl-app-layout">
      <header className="sl-app-topbar">
        <div>
          <p className="sl-app-brand-eyebrow">SerenityLine</p>
          <strong className="sl-app-brand">La tua serenità non ha prezzo.</strong>
        </div>

        <div className="sl-app-user-area">
          <span className="sl-app-user-name">{userLabel}</span>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleLogout}
            type="button"
          >
            {t("logout")}
          </button>
        </div>
      </header>

      <div className="sl-app-shell">
        <aside className="sl-app-sidebar">
          <nav
            aria-label={t("navigationLabel")}
            className="sl-app-nav"
          >
            {appNavigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? "sl-app-nav-link active" : "sl-app-nav-link"
                }
                key={item.to}
                to={item.to}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="sl-app-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
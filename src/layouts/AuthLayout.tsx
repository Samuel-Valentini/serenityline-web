import { Outlet } from "react-router";

export function AuthLayout() {
    return (
        <div className="sl-auth-layout">
            <Outlet />
        </div>
    );
}

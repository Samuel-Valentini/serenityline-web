import { Outlet } from "react-router";

export function AppLayout() {
    return (
        <div className="sl-app-layout">
            <Outlet />
        </div>
    );
}

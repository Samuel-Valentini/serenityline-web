import { Outlet } from "react-router";

export function PublicLayout() {
    return (
        <div className="sl-public-layout">
            <Outlet />
        </div>
    );
}

import { useEffect } from "react";

import { useAppDispatch } from "../store/hooks";
import { restoreSession } from "../../features/auth/authThunks";

let hasStartedSessionRestore = false;

export function AuthSessionBootstrap() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (hasStartedSessionRestore) {
            return;
        }

        hasStartedSessionRestore = true;

        void dispatch(restoreSession());
    }, [dispatch]);

    return null;
}

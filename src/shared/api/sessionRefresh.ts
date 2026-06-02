type SessionRefreshHandler = () => Promise<boolean>;

let sessionRefreshHandler: SessionRefreshHandler | null = null;
let ongoingRefresh: Promise<boolean> | null = null;

export function setSessionRefreshHandler(
    handler: SessionRefreshHandler | null,
): void {
    sessionRefreshHandler = handler;
    ongoingRefresh = null;
}

export async function refreshSessionOnce(): Promise<boolean> {
    if (!sessionRefreshHandler) {
        return false;
    }

    if (!ongoingRefresh) {
        ongoingRefresh = sessionRefreshHandler().finally(() => {
            ongoingRefresh = null;
        });
    }

    return ongoingRefresh;
}

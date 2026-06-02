import { beforeEach, describe, expect, it, vi } from "vitest";

import { refreshSessionOnce, setSessionRefreshHandler } from "./sessionRefresh";

describe("sessionRefresh", () => {
    beforeEach(() => {
        setSessionRefreshHandler(null);
    });

    it("returns false when no refresh handler is registered", async () => {
        await expect(refreshSessionOnce()).resolves.toBe(false);
    });

    it("uses the registered refresh handler", async () => {
        const handler = vi.fn().mockResolvedValue(true);

        setSessionRefreshHandler(handler);

        await expect(refreshSessionOnce()).resolves.toBe(true);

        expect(handler).toHaveBeenCalledOnce();
    });

    it("shares the same refresh promise while a refresh is ongoing", async () => {
        let resolveRefresh: (value: boolean) => void = () => {
            throw new Error("Refresh resolver was not initialized.");
        };

        const handler = vi.fn(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveRefresh = resolve;
                }),
        );

        setSessionRefreshHandler(handler);

        const firstRefresh = refreshSessionOnce();
        const secondRefresh = refreshSessionOnce();

        resolveRefresh(true);

        await expect(firstRefresh).resolves.toBe(true);
        await expect(secondRefresh).resolves.toBe(true);

        expect(handler).toHaveBeenCalledOnce();
    });
});

import { afterEach, describe, expect, it } from "vitest";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "./accessTokenStore";

describe("accessTokenStore", () => {
    afterEach(() => {
        clearAccessToken();
    });

    it("stores the access token in memory", () => {
        setAccessToken("access-token");

        expect(getAccessToken()).toBe("access-token");
    });

    it("clears the access token", () => {
        setAccessToken("access-token");

        clearAccessToken();

        expect(getAccessToken()).toBeNull();
    });
});

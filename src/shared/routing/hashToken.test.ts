import { describe, expect, it } from "vitest";

import { getTokenFromHash } from "./hashToken";

describe("getTokenFromHash", () => {
    it("reads token from a hash fragment", () => {
        expect(getTokenFromHash("#token=abc123")).toBe("abc123");
    });

    it("reads token from a hash fragment without leading hash", () => {
        expect(getTokenFromHash("token=abc123")).toBe("abc123");
    });

    it("trims the token value", () => {
        expect(getTokenFromHash("#token=%20abc123%20")).toBe("abc123");
    });

    it("returns an empty string when token is missing", () => {
        expect(getTokenFromHash("#other=value")).toBe("");
    });

    it("returns an empty string for an empty hash", () => {
        expect(getTokenFromHash("")).toBe("");
    });
});

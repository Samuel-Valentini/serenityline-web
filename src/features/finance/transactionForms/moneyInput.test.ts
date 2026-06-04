import { describe, expect, it } from "vitest";

import {
    isValidMoneyInput,
    moneyAmountToFormValue,
    normalizeMoneyInput,
} from "./moneyInput";

describe("moneyInput", () => {
    it("normalizes Italian decimal inputs", () => {
        expect(normalizeMoneyInput("250,50", "it")).toBe("250.50");
        expect(normalizeMoneyInput("1.250,50", "it")).toBe("1250.50");
        expect(normalizeMoneyInput("-850,25", "it")).toBe("-850.25");
    });

    it("normalizes English decimal inputs", () => {
        expect(normalizeMoneyInput("250.50", "en")).toBe("250.50");
        expect(normalizeMoneyInput("1,250.50", "en")).toBe("1250.50");
        expect(normalizeMoneyInput("-850.25", "en")).toBe("-850.25");
    });

    it("rejects invalid money inputs", () => {
        expect(normalizeMoneyInput("", "it")).toBeNull();
        expect(normalizeMoneyInput("abc", "it")).toBeNull();
        expect(normalizeMoneyInput("12,50,30", "it")).toBeNull();
        expect(normalizeMoneyInput("--12", "it")).toBeNull();
    });

    it("checks whether a money input is valid", () => {
        expect(isValidMoneyInput("12,50", "it")).toBe(true);
        expect(isValidMoneyInput("12.50", "en")).toBe(true);
        expect(isValidMoneyInput("abc", "it")).toBe(false);
    });

    it("converts response money amounts to form values", () => {
        expect(moneyAmountToFormValue(12.5)).toBe("12.5");
        expect(moneyAmountToFormValue(null)).toBe("");
        expect(moneyAmountToFormValue(undefined)).toBe("");
    });
});

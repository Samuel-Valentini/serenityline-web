import { describe, expect, it } from "vitest";

import {
    isValidMoneyInput,
    moneyAmountToFormValue,
    normalizeMoneyInput,
    toggleMoneyInputSign,
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
    it.each([
        ["125,50", "it", "-125,50"],
        ["-125,50", "it", "125,50"],
        ["+125,50", "it", "-125,50"],
        ["1.250,50", "it", "-1.250,50"],
        ["1,250.50", "en", "-1,250.50"],
        ["-1,250.50", "en", "1,250.50"],
        [" 125,50 ", "it", "-125,50"],
        ["99999999999999999,99", "it", "-99999999999999999,99"],
        ["0,00", "it", "-0,00"],
        ["-0,00", "it", "0,00"],
    ])("changes only the sign of %s in %s", (value, language, expected) => {
        expect(toggleMoneyInputSign(value, language)).toBe(expected);
    });

    it.each(["", "   ", "-", "+", "abc", "--12", "12,50,30"])(
        "does not change an empty or invalid input: %s",
        (value) => {
            expect(toggleMoneyInputSign(value, "it")).toBe(value);
        },
    );
    it("accepts both decimal separators for Italian input", () => {
        expect(normalizeMoneyInput("250,50", "it")).toBe("250.50");
        expect(normalizeMoneyInput("250.50", "it")).toBe("250.50");
        expect(normalizeMoneyInput("-850,25", "it")).toBe("-850.25");
        expect(normalizeMoneyInput("-850.25", "it")).toBe("-850.25");
    });

    it("accepts both decimal separators for English input", () => {
        expect(normalizeMoneyInput("250.50", "en")).toBe("250.50");
        expect(normalizeMoneyInput("250,50", "en")).toBe("250.50");
        expect(normalizeMoneyInput("-850.25", "en")).toBe("-850.25");
        expect(normalizeMoneyInput("-850,25", "en")).toBe("-850.25");
    });

    it("keeps locale-specific grouping precedence for ambiguous inputs", () => {
        expect(normalizeMoneyInput("1.250", "it")).toBe("1250");
        expect(normalizeMoneyInput("1,250", "it")).toBe("1.250");

        expect(normalizeMoneyInput("1,250", "en")).toBe("1250");
        expect(normalizeMoneyInput("1.250", "en")).toBe("1.250");
    });

    it("accepts complete Italian and English formatted amounts in either language", () => {
        expect(normalizeMoneyInput("1.250,50", "it")).toBe("1250.50");
        expect(normalizeMoneyInput("1,250.50", "it")).toBe("1250.50");

        expect(normalizeMoneyInput("1,250.50", "en")).toBe("1250.50");
        expect(normalizeMoneyInput("1.250,50", "en")).toBe("1250.50");
    });

    it("accepts grouped amounts with multiple thousands separators", () => {
        expect(normalizeMoneyInput("1.234.567,89", "it")).toBe("1234567.89");
        expect(normalizeMoneyInput("1,234,567.89", "en")).toBe("1234567.89");

        expect(normalizeMoneyInput("1,234,567.89", "it")).toBe("1234567.89");
        expect(normalizeMoneyInput("1.234.567,89", "en")).toBe("1234567.89");
    });

    it("rejects malformed separator combinations", () => {
        expect(normalizeMoneyInput("12,50,30", "it")).toBeNull();
        expect(normalizeMoneyInput("12.50.30", "en")).toBeNull();
        expect(normalizeMoneyInput("12.34,56", "it")).toBeNull();
        expect(normalizeMoneyInput("12,34.56", "en")).toBeNull();
        expect(normalizeMoneyInput("--12", "it")).toBeNull();
    });
});

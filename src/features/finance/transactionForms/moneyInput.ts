import type { MoneyAmountInput } from "../api/financeApiTypes";

const MONEY_AMOUNT_PATTERN = /^-?\d+(\.\d+)?$/;

function usesCommaDecimalSeparator(language: string) {
    return language.toLowerCase().startsWith("it");
}

export function normalizeMoneyInput(
    value: string,
    language: string,
): MoneyAmountInput | null {
    const compactValue = value.trim().replace(/\s/g, "");

    if (!compactValue) {
        return null;
    }

    const normalizedValue = usesCommaDecimalSeparator(language)
        ? compactValue.replace(/\./g, "").replace(",", ".")
        : compactValue.replace(/,/g, "");

    if (!MONEY_AMOUNT_PATTERN.test(normalizedValue)) {
        return null;
    }

    return normalizedValue;
}

export function isValidMoneyInput(value: string, language: string) {
    return normalizeMoneyInput(value, language) !== null;
}

export function moneyAmountToFormValue(value: number | null | undefined) {
    if (value == null) {
        return "";
    }

    return String(value);
}

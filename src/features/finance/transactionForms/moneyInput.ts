import type { MoneyAmountInput } from "../api/financeApiTypes";

type MoneySeparator = "." | ",";

function usesCommaDecimalSeparator(language: string) {
    return language.toLowerCase().startsWith("it");
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeMoneyInputWithSeparators(
    value: string,
    decimalSeparator: MoneySeparator,
    groupingSeparator: MoneySeparator,
): MoneyAmountInput | null {
    let unsignedValue = value;
    let isNegative = false;

    if (unsignedValue.startsWith("+") || unsignedValue.startsWith("-")) {
        isNegative = unsignedValue.startsWith("-");
        unsignedValue = unsignedValue.slice(1);
    }

    if (
        !unsignedValue ||
        unsignedValue.includes("+") ||
        unsignedValue.includes("-")
    ) {
        return null;
    }

    const decimalParts = unsignedValue.split(decimalSeparator);

    if (decimalParts.length > 2) {
        return null;
    }

    const integerPart = decimalParts[0];
    const decimalPart = decimalParts[1];

    if (!integerPart) {
        return null;
    }

    if (
        decimalPart !== undefined &&
        (decimalPart.length === 0 || !/^\d+$/.test(decimalPart))
    ) {
        return null;
    }

    let normalizedIntegerPart: string;

    if (integerPart.includes(groupingSeparator)) {
        const escapedGroupingSeparator = escapeRegExp(groupingSeparator);
        const groupedIntegerPattern = new RegExp(
            `^\\d{1,3}(?:${escapedGroupingSeparator}\\d{3})+$`,
        );

        if (!groupedIntegerPattern.test(integerPart)) {
            return null;
        }

        normalizedIntegerPart = integerPart.split(groupingSeparator).join("");
    } else {
        if (!/^\d+$/.test(integerPart)) {
            return null;
        }

        normalizedIntegerPart = integerPart;
    }

    const normalizedValue = [
        isNegative ? "-" : "",
        normalizedIntegerPart,
        decimalPart !== undefined ? `.${decimalPart}` : "",
    ].join("");

    return normalizedValue as MoneyAmountInput;
}

export function normalizeMoneyInput(
    value: string,
    language: string,
): MoneyAmountInput | null {
    const compactValue = value.trim().replace(/\s/g, "");

    if (!compactValue) {
        return null;
    }

    const preferredDecimalSeparator: MoneySeparator = usesCommaDecimalSeparator(
        language,
    )
        ? ","
        : ".";
    const preferredGroupingSeparator: MoneySeparator =
        preferredDecimalSeparator === "," ? "." : ",";

    const preferredNormalization = normalizeMoneyInputWithSeparators(
        compactValue,
        preferredDecimalSeparator,
        preferredGroupingSeparator,
    );

    if (preferredNormalization !== null) {
        return preferredNormalization;
    }

    return normalizeMoneyInputWithSeparators(
        compactValue,
        preferredGroupingSeparator,
        preferredDecimalSeparator,
    );
}

export function isValidMoneyInput(value: string, language: string) {
    return normalizeMoneyInput(value, language) !== null;
}

export function toggleMoneyInputSign(value: string, language: string): string {
    if (!isValidMoneyInput(value, language)) {
        return value;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.startsWith("-")) {
        return trimmedValue.slice(1);
    }

    const unsignedValue = trimmedValue.startsWith("+")
        ? trimmedValue.slice(1)
        : trimmedValue;

    return `-${unsignedValue}`;
}

export function moneyAmountToFormValue(
    value: number | null | undefined,
    language = "en",
) {
    if (value == null) {
        return "";
    }

    const stringValue = String(value);

    return usesCommaDecimalSeparator(language)
        ? stringValue.replace(".", ",")
        : stringValue;
}

export function formatMoneyAmountForDisplay(
    value: number,
    language: string,
    currency: string,
) {
    try {
        return new Intl.NumberFormat(language || undefined, {
            style: "currency",
            currency,
        }).format(value);
    } catch {
        return `${value} ${currency}`;
    }
}

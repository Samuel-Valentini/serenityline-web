const preferredCurrencies = ["EUR", "USD", "GBP", "CHF", "JPY"];

const majorCurrencies = [
    "AUD",
    "CAD",
    "CNY",
    "DKK",
    "HKD",
    "NOK",
    "NZD",
    "SEK",
    "SGD",
];

const fallbackCurrencies = [
    "AED",
    "ARS",
    "BRL",
    "CLP",
    "COP",
    "CZK",
    "HUF",
    "IDR",
    "ILS",
    "INR",
    "KRW",
    "MXN",
    "MYR",
    "PHP",
    "PLN",
    "RON",
    "SAR",
    "THB",
    "TRY",
    "TWD",
    "ZAR",
];

let cachedCurrencyOptions: string[] | null = null;

function getSupportedCurrencyCodes(): string[] {
    const intlWithSupportedValues = Intl as typeof Intl & {
        supportedValuesOf?: (key: "currency") => string[];
    };

    return intlWithSupportedValues.supportedValuesOf?.("currency") ?? [];
}

function uniqueCurrencyCodes(codes: string[]) {
    return Array.from(new Set(codes));
}

export function getCurrencyOptions(): string[] {
    if (cachedCurrencyOptions) {
        return cachedCurrencyOptions;
    }

    const supportedCurrencies = getSupportedCurrencyCodes();

    const remainingCurrencies = uniqueCurrencyCodes([
        ...fallbackCurrencies,
        ...supportedCurrencies,
    ])
        .filter(
            (currency) =>
                !preferredCurrencies.includes(currency) &&
                !majorCurrencies.includes(currency),
        )
        .sort((first, second) => first.localeCompare(second));

    cachedCurrencyOptions = uniqueCurrencyCodes([
        ...preferredCurrencies,
        ...majorCurrencies,
        ...remainingCurrencies,
    ]);

    return cachedCurrencyOptions;
}

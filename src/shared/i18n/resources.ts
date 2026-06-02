export const resources = {
    it: {
        common: {
            appName: "SerenityLine",
            eyebrow: "Pianifica, prevedi, vivi sereno.",
            claim: "La tua serenità non ha prezzo.",
            homeIntro:
                "SerenityLine ti aiuta a visualizzare la tua liquidità futura e a prendere decisioni con più chiarezza.",
        },
        auth: {
            loginTitle: "Accedi a SerenityLine",
            loginPlaceholder:
                "Il flusso di login verrà implementato nella fase auth.",
        },
        dashboard: {
            title: "Dashboard",
            subtitle: "Cosa devo sapere adesso?",
        },
    },
    en: {
        common: {
            appName: "SerenityLine",
            eyebrow: "Plan, forecast, live with peace of mind.",
            claim: "Your peace of mind is priceless.",
            homeIntro:
                "SerenityLine helps you visualize your future liquidity and make clearer decisions.",
        },
        auth: {
            loginTitle: "Sign in to SerenityLine",
            loginPlaceholder:
                "The login flow will be implemented during the auth phase.",
        },
        dashboard: {
            title: "Dashboard",
            subtitle: "What do I need to know now?",
        },
    },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const defaultLanguage: SupportedLanguage = "it";

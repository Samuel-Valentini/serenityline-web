export const resources = {
  it: {
    common: {
      appName: "SerenityLine",
      loading: "Caricamento...",
      eyebrow: "Pianifica, prevedi, vivi sereno.",
      claim: "La tua serenità non ha prezzo.",
      homeIntro:
        "SerenityLine ti aiuta a visualizzare la tua liquidità futura e a prendere decisioni con più chiarezza.",
    },
    auth: {
      loginTitle: "Accedi a SerenityLine",
      loginSubtitle: "Entra nel tuo spazio finanziario personale.",
      loginPlaceholder: "Il flusso di login verrà implementato nella fase auth.",
      emailLabel: "Email",
      emailPlaceholder: "nome@email.it",
      passwordLabel: "Password",
      passwordPlaceholder: "Inserisci la password",
      loginSubmit: "Accedi",
      loginSubmitting: "Accesso in corso...",
      loginErrorTitle: "Accesso non riuscito",
      twoFactorTitle: "Verifica in due passaggi",
      twoFactorSubtitle:
        "Inserisci il codice che hai ricevuto per completare l'accesso.",
      twoFactorCodeLabel: "Codice di verifica",
      twoFactorCodePlaceholder: "123456",
      twoFactorSubmit: "Verifica codice",
      twoFactorSubmitting: "Verifica in corso...",
      backToLogin: "Torna al login",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Cosa devo sapere adesso?",
    },
  },
  en: {
    common: {
      appName: "SerenityLine",
      loading: "Loading...",
      eyebrow: "Plan, forecast, live with peace of mind.",
      claim: "Your peace of mind is priceless.",
      homeIntro:
        "SerenityLine helps you visualize your future liquidity and make clearer decisions.",
    },
    auth: {
      loginTitle: "Sign in to SerenityLine",
      loginSubtitle: "Enter your personal financial space.",
      loginPlaceholder: "The login flow will be implemented during the auth phase.",
      emailLabel: "Email",
      emailPlaceholder: "name@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      loginSubmit: "Sign in",
      loginSubmitting: "Signing in...",
      loginErrorTitle: "Sign in failed",
      twoFactorTitle: "Two-step verification",
      twoFactorSubtitle:
        "Enter the code you received to complete your sign in.",
      twoFactorCodeLabel: "Verification code",
      twoFactorCodePlaceholder: "123456",
      twoFactorSubmit: "Verify code",
      twoFactorSubmitting: "Verifying...",
      backToLogin: "Back to login",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "What do I need to know now?",
    },
  },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const defaultLanguage: SupportedLanguage = "it";
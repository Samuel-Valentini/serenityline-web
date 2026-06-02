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
        publicShell: {
            navigationLabel: "Navigazione pubblica",
            home: "Home",
            howItWorks: "Come funziona",
            security: "Sicurezza",
            login: "Accedi",
            register: "Crea account",
            footerClaim: "Pianifica, prevedi, vivi sereno.",
        },
        home: {
            heroEyebrow: "Pianifica, prevedi, vivi sereno.",
            heroTitle: "La tua serenità non ha prezzo.",
            heroSubtitle:
                "SerenityLine ti aiuta a leggere il futuro della tua liquidità, anticipare i momenti critici e decidere con più lucidità.",
            primaryCta: "Crea il tuo account",
            secondaryCta: "Scopri come funziona",
            previewLabel: "Anteprima MVP",
            previewTitle: "La tua proiezione finanziaria",
            previewText:
                "Una linea temporale chiara per capire dove stai andando, non solo quanto hai oggi.",
            featureOneTitle: "Visione futura",
            featureOneText:
                "Non solo saldo attuale: SerenityLine mette in evidenza la traiettoria dei prossimi mesi.",
            featureTwoTitle: "Decisioni simulate",
            featureTwoText:
                "Prima di una scelta importante, confronti scenari e conseguenze sulla liquidità futura.",
            featureThreeTitle: "Scadenze sotto controllo",
            featureThreeText:
                "Ricorrenze, uscite, entrate e promemoria vengono integrati in una vista unica.",
        },
        auth: {
            loginTitle: "Accedi a SerenityLine",
            loginSubtitle: "Entra nel tuo spazio finanziario personale.",
            loginPlaceholder:
                "Il flusso di login verrà implementato nella fase auth.",
            emailLabel: "Email",
            emailPlaceholder: "nome@email.it",
            passwordLabel: "Password",
            passwordPlaceholder: "Inserisci la password",
            loginSubmit: "Accedi",
            loginSubmitting: "Accesso in corso...",
            loginErrorTitle: "Accesso non riuscito",
            forgotPasswordLink: "Password dimenticata?",
            registerLink: "Crea un account",
            backHome: "Torna alla home",
            twoFactorTitle: "Verifica in due passaggi",
            twoFactorSubtitle:
                "Inserisci il codice che hai ricevuto per completare l'accesso.",
            twoFactorCodeLabel: "Codice di verifica",
            twoFactorCodePlaceholder: "123456",
            twoFactorSubmit: "Verifica codice",
            twoFactorSubmitting: "Verifica in corso...",
            backToLogin: "Torna al login",
        },
        appShell: {
            navigationLabel: "Navigazione principale",
            logout: "Esci",
            userFallback: "Utente SerenityLine",
            nav: {
                dashboard: "Dashboard",
                serenityline: "SerenityLine",
                calendar: "Calendario",
                transactions: "Transazioni",
                recurringTransactions: "Ricorrenti",
                simulations: "Simulazioni",
                portfolios: "Portafogli",
                accounts: "Conti",
                balances: "Saldi",
                categories: "Categorie",
                settings: "Impostazioni",
                administration: "Amministrazione",
            },
        },
        dashboard: {
            title: "Dashboard",
            subtitle: "Cosa devo sapere adesso?",
            cards: {
                serenitylineTitle: "SerenityLine",
                serenitylineText:
                    "La proiezione della liquidità futura sarà il cuore operativo dell'app.",
                calendarTitle: "Calendario",
                calendarText:
                    "Qui leggerai entrate, uscite e scadenze giorno per giorno.",
                simulationsTitle: "Simulazioni",
                simulationsText:
                    "Qui confronterai scenari alternativi prima di prendere decisioni.",
            },
        },
        appPages: {
            placeholderBadge: "Area MVP",
            serenityline: {
                title: "SerenityLine",
                subtitle: "Dove sto andando?",
            },
            calendar: {
                title: "Calendario",
                subtitle: "Cosa succede giorno per giorno?",
            },
            transactions: {
                title: "Transazioni",
                subtitle:
                    "Quali movimenti compongono la mia situazione finanziaria?",
            },
            recurringTransactions: {
                title: "Ricorrenti",
                subtitle: "Quali automatismi generano il mio futuro?",
            },
            simulations: {
                title: "Simulazioni",
                subtitle: "Cosa succede se cambio qualcosa?",
            },
            portfolios: {
                title: "Portafogli",
                subtitle: "Che obiettivi sto perseguendo?",
            },
            accounts: {
                title: "Conti",
                subtitle:
                    "Su quali basi finanziarie si fonda la mia proiezione?",
            },
            balances: {
                title: "Saldi",
                subtitle: "Cosa accade ai singoli conti?",
            },
            categories: {
                title: "Categorie",
                subtitle: "Come classifico entrate e uscite?",
            },
            settings: {
                title: "Impostazioni",
                subtitle: "Come proteggo e personalizzo il mio spazio?",
            },
            administration: {
                title: "Amministrazione",
                subtitle: "Chi può fare cosa?",
            },
        },
        publicPages: {
            howItWorks: {
                title: "Come funziona",
                subtitle: "Una visione semplice del tuo futuro finanziario.",
                body: "SerenityLine parte dai tuoi conti, dalle tue transazioni e dagli eventi ricorrenti per costruire una proiezione leggibile della liquidità futura.",
            },
            security: {
                title: "Sicurezza",
                subtitle: "Protezione, chiarezza e controllo dei dati.",
                body: "L'accesso è protetto da token temporanei, refresh token HttpOnly e flussi pensati per ridurre l'esposizione dei dati sensibili.",
            },
            privacy: {
                title: "Privacy",
                subtitle: "I tuoi dati finanziari meritano rispetto.",
                body: "Questa pagina ospiterà l'informativa privacy completa prima del lancio pubblico del servizio.",
            },
            terms: {
                title: "Termini",
                subtitle: "Le condizioni di utilizzo di SerenityLine.",
                body: "Questa pagina ospiterà i termini di servizio completi prima del lancio pubblico del servizio.",
            },
        },
        authFlows: {
            backToLogin: "Torna al login",
            register: {
                title: "Crea il tuo account",
                subtitle:
                    "Il flusso di registrazione verrà collegato al backend nel prossimo blocco auth.",
            },
            verifyEmail: {
                title: "Verifica email",
                subtitle:
                    "Qui confermerai l'indirizzo email usando il link ricevuto.",
            },
            forgotPassword: {
                title: "Password dimenticata",
                subtitle: "Qui potrai richiedere il reset della password.",
            },
            resetPassword: {
                title: "Reimposta password",
                subtitle:
                    "Qui potrai scegliere una nuova password usando il token ricevuto.",
            },
            acceptInvitation: {
                title: "Accetta invito",
                subtitle:
                    "Qui potrai accettare un invito a entrare in un gruppo SerenityLine.",
            },
            backHome: "Torna alla home",
        },
        notFound: {
            title: "Pagina non trovata",
            subtitle:
                "La pagina che stai cercando non esiste o è stata spostata.",
            backHome: "Torna alla home",
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
        publicShell: {
            navigationLabel: "Public navigation",
            home: "Home",
            howItWorks: "How it works",
            security: "Security",
            login: "Sign in",
            register: "Create account",
            footerClaim: "Plan, forecast, live with peace of mind.",
        },
        home: {
            heroEyebrow: "Plan, forecast, live with peace of mind.",
            heroTitle: "Your peace of mind is priceless.",
            heroSubtitle:
                "SerenityLine helps you read the future of your liquidity, anticipate critical moments and make clearer decisions.",
            primaryCta: "Create your account",
            secondaryCta: "See how it works",
            previewLabel: "MVP preview",
            previewTitle: "Your financial projection",
            previewText:
                "A clear timeline to understand where you are going, not just how much you have today.",
            featureOneTitle: "Future view",
            featureOneText:
                "Not just today's balance: SerenityLine highlights the trajectory of the months ahead.",
            featureTwoTitle: "Decision simulation",
            featureTwoText:
                "Before an important choice, you compare scenarios and their effect on future liquidity.",
            featureThreeTitle: "Deadlines under control",
            featureThreeText:
                "Recurring events, income, expenses and reminders are integrated into one view.",
        },
        auth: {
            loginTitle: "Sign in to SerenityLine",
            loginSubtitle: "Enter your personal financial space.",
            loginPlaceholder:
                "The login flow will be implemented during the auth phase.",
            emailLabel: "Email",
            emailPlaceholder: "name@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "Enter your password",
            loginSubmit: "Sign in",
            loginSubmitting: "Signing in...",
            loginErrorTitle: "Sign in failed",
            forgotPasswordLink: "Forgot password?",
            registerLink: "Create an account",
            backHome: "Back to home",
            twoFactorTitle: "Two-step verification",
            twoFactorSubtitle:
                "Enter the code you received to complete your sign in.",
            twoFactorCodeLabel: "Verification code",
            twoFactorCodePlaceholder: "123456",
            twoFactorSubmit: "Verify code",
            twoFactorSubmitting: "Verifying...",
            backToLogin: "Back to login",
        },
        appShell: {
            navigationLabel: "Main navigation",
            logout: "Sign out",
            userFallback: "SerenityLine user",
            nav: {
                dashboard: "Dashboard",
                serenityline: "SerenityLine",
                calendar: "Calendar",
                transactions: "Transactions",
                recurringTransactions: "Recurring",
                simulations: "Simulations",
                portfolios: "Portfolios",
                accounts: "Accounts",
                balances: "Balances",
                categories: "Categories",
                settings: "Settings",
                administration: "Administration",
            },
        },
        dashboard: {
            title: "Dashboard",
            subtitle: "What do I need to know now?",
            cards: {
                serenitylineTitle: "SerenityLine",
                serenitylineText:
                    "The future liquidity projection will be the operational heart of the app.",
                calendarTitle: "Calendar",
                calendarText:
                    "Here you will read income, expenses and deadlines day by day.",
                simulationsTitle: "Simulations",
                simulationsText:
                    "Here you will compare alternative scenarios before making decisions.",
            },
        },
        appPages: {
            placeholderBadge: "MVP area",
            serenityline: {
                title: "SerenityLine",
                subtitle: "Where am I going?",
            },
            calendar: {
                title: "Calendar",
                subtitle: "What happens day by day?",
            },
            transactions: {
                title: "Transactions",
                subtitle: "Which movements make up my financial situation?",
            },
            recurringTransactions: {
                title: "Recurring",
                subtitle: "Which automations generate my future?",
            },
            simulations: {
                title: "Simulations",
                subtitle: "What happens if I change something?",
            },
            portfolios: {
                title: "Portfolios",
                subtitle: "Which goals am I pursuing?",
            },
            accounts: {
                title: "Accounts",
                subtitle: "Which financial bases support my projection?",
            },
            balances: {
                title: "Balances",
                subtitle: "What happens to each account?",
            },
            categories: {
                title: "Categories",
                subtitle: "How do I classify income and expenses?",
            },
            settings: {
                title: "Settings",
                subtitle: "How do I protect and customize my space?",
            },
            administration: {
                title: "Administration",
                subtitle: "Who can do what?",
            },
        },
        publicPages: {
            howItWorks: {
                title: "How it works",
                subtitle: "A simple view of your financial future.",
                body: "SerenityLine starts from your accounts, transactions and recurring events to build a readable projection of your future liquidity.",
            },
            security: {
                title: "Security",
                subtitle: "Protection, clarity and control over your data.",
                body: "Access is protected by short-lived tokens, HttpOnly refresh tokens and flows designed to reduce exposure of sensitive data.",
            },
            privacy: {
                title: "Privacy",
                subtitle: "Your financial data deserves respect.",
                body: "This page will host the full privacy policy before the public launch of the service.",
            },
            terms: {
                title: "Terms",
                subtitle: "The terms of use of SerenityLine.",
                body: "This page will host the full terms of service before the public launch of the service.",
            },
        },
        authFlows: {
            backToLogin: "Back to login",
            register: {
                title: "Create your account",
                subtitle:
                    "The registration flow will be connected to the backend in the next auth block.",
            },
            verifyEmail: {
                title: "Verify email",
                subtitle:
                    "Here you will confirm your email address using the link you received.",
            },
            forgotPassword: {
                title: "Forgot password",
                subtitle: "Here you will be able to request a password reset.",
            },
            resetPassword: {
                title: "Reset password",
                subtitle:
                    "Here you will choose a new password using the token you received.",
            },
            acceptInvitation: {
                title: "Accept invitation",
                subtitle:
                    "Here you will accept an invitation to join a SerenityLine group.",
            },
            backHome: "Back to home",
        },
        notFound: {
            title: "Page not found",
            subtitle:
                "The page you are looking for does not exist or has been moved.",
            backHome: "Back to home",
        },
    },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const defaultLanguage: SupportedLanguage = "it";

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
            emailVerificationRequiredTitle: "Email da verificare",
            emailVerificationRequiredText:
                "Prima di accedere devi verificare il tuo indirizzo email. Controlla la tua casella oppure richiedi un nuovo link.",
            emailVerificationEmailLabel: "Email",
            emailVerificationResendSubmit: "Reinvia link di verifica",
            emailVerificationResendSubmitting: "Invio in corso...",
            emailVerificationResendSuccess:
                "Abbiamo inviato un nuovo link di verifica. Controlla la tua email.",
            emailVerificationResendErrorTitle: "Reinvio non riuscito",
            emailVerificationResendErrorFallback:
                "Non siamo riusciti a inviare un nuovo link. Riprova tra qualche istante.",
            restoreAccountRequiredTitle: "Account in cancellazione",
            restoreAccountRequiredText:
                "Questo account è stato messo in cancellazione. Puoi ripristinarlo se sei ancora entro il periodo di sicurezza di 30 giorni.",
            restoreAccountSubmit: "Ripristina account",
            restoreAccountSubmitting: "Ripristino in corso...",
            restoreAccountSuccess:
                "Account ripristinato correttamente. Ora puoi effettuare di nuovo l'accesso.",
            restoreAccountEmailVerificationRequiredSuccess:
                "Account ripristinato. Prima di accedere devi completare la verifica email.",
            restoreAccountErrorTitle: "Ripristino non riuscito",
            restoreAccountErrorFallback:
                "Non è stato possibile ripristinare l'account. Il token potrebbe essere scaduto o non più valido.",
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
            loading: "Caricamento dati finanziari...",
            loadErrorTitle: "Impossibile caricare i dati finanziari.",
            loadErrorFallback: "Riprova tra qualche istante.",
            emptyState: {
                title: "Non hai ancora dati finanziari",
                text: "Aggiungi il primo conto per iniziare a costruire la tua proiezione SerenityLine.",
            },
            metrics: {
                accounts: "Conti",
                accountsDescription: "Conti collegati alla tua proiezione.",
                buckets: "Portafogli",
                bucketsDescription:
                    "Portafogli attivi per organizzare la liquidità.",
                simulations: "Simulazioni",
                simulationsDescription:
                    "Scenari attivi per confrontare decisioni.",
                categories: "Categorie",
                categoriesDescription:
                    "Categorie attive per classificare i movimenti.",
            },
            sections: {
                nextSteps: "Prossimi passi",
                nextStepsText:
                    "La dashboard userà questi dati come base per saldi, calendario, simulazioni e SerenityLine.",
                priorities: "Priorità finanziarie",
                prioritiesText:
                    "Sono disponibili {{count}} priorità per distinguere movimenti critici, essenziali e opzionali.",
            },
        },
        accounts: {
            eyebrow: "Base finanziaria",
            title: "Conti",
            subtitle:
                "Gestisci i conti che alimentano la tua proiezione SerenityLine.",
            loading: "Caricamento conti...",
            loadErrorTitle: "Impossibile caricare i conti.",
            loadErrorFallback: "Riprova tra qualche istante.",
            listEyebrow: "Conti collegati",
            listTitle: "I tuoi conti",
            accountsCount: "{{count}} conti",
            emptyState:
                "Non hai ancora creato conti. Aggiungi il primo conto per iniziare.",
            notProvided: "Non indicato",
            table: {
                name: "Nome",
                institution: "Istituto",
                openingBalance: "Saldo iniziale",
                date: "Data",
            },
            formEyebrow: "Nuovo conto",
            formTitle: "Aggiungi conto",
            formIntro:
                "Il saldo iniziale è il punto di partenza della proiezione futura.",
            fields: {
                accountName: "Nome conto",
                currency: "Valuta",
                openingBalance: "Saldo iniziale",
                openingBalanceDate: "Data saldo iniziale",
                issuingInstitution: "Istituto emittente",
                accountDescription: "Descrizione",
                optional: "opzionale",
            },
            validation: {
                accountNameRequired: "Inserisci il nome del conto.",
                currencyInvalid: "La valuta deve essere composta da 3 lettere.",
                openingBalanceInvalid:
                    "Inserisci un saldo iniziale valido, usando la virgola e al massimo 17 cifre intere e 2 decimali.",
                openingBalanceDateRequired:
                    "Inserisci la data del saldo iniziale.",
            },
            createSubmit: "Crea conto",
            createSubmitting: "Creazione conto...",
            createSuccess: "Conto creato correttamente.",
            createErrorFallback: "Non siamo riusciti a creare il conto.",
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
        authRegister: {
            title: "Crea il tuo account",
            subtitle:
                "Inizia configurando il tuo spazio SerenityLine personale. Dopo la registrazione ti chiederemo di verificare l'email.",
            userNameLabel: "Nome",
            userNamePlaceholder: "Mario Rossi",
            emailLabel: "Email",
            emailPlaceholder: "nome@email.it",
            passwordLabel: "Password",
            passwordPlaceholder: "Almeno 10 caratteri",
            confirmPasswordLabel: "Conferma password",
            confirmPasswordPlaceholder: "Ripeti la password",
            preferredLocaleLabel: "Lingua preferita",
            preferredLocaleIt: "Italiano",
            preferredLocaleEn: "Inglese",
            paymentRemindersLabel:
                "Mandami un'email di promemoria quando una spesa o un'entrata che ho registrato sta per scadere",
            submit: "Crea account",
            submitting: "Creazione account...",
            errorTitle: "Registrazione non riuscita",
            passwordMismatch: "Le password non coincidono.",
            passwordTooShort: "La password deve contenere almeno 10 caratteri.",
            successTitle: "Account creato",
            successText:
                "Abbiamo creato il tuo account. Controlla la tua email per completare la verifica.",
            successEmailLabel: "Email registrata",
            goToLogin: "Vai al login",
            backHome: "Torna alla home",
        },
        notFound: {
            title: "Pagina non trovata",
            subtitle:
                "La pagina che stai cercando non esiste o è stata spostata.",
            backHome: "Torna alla home",
        },
        authVerifyEmail: {
            title: "Verifica email",
            subtitle:
                "Verifica il tuo indirizzo email per completare l'attivazione.",
            manualTitle: "Inserisci il token di verifica",
            manualText:
                "Se il link non si è aperto correttamente, incolla qui il token ricevuto via email.",
            tokenLabel: "Token di verifica",
            tokenPlaceholder: "Incolla il token ricevuto via email",
            submit: "Verifica email",
            submitting: "Verifica in corso...",
            verifyingTitle: "Verifica in corso",
            verifyingText:
                "Attendi qualche istante mentre completiamo la verifica.",
            successTitle: "Email verificata",
            successText:
                "Il tuo indirizzo email è stato verificato correttamente. Ora puoi accedere a SerenityLine.",
            errorTitle: "Verifica non riuscita",
            errorFallback:
                "Non siamo riusciti a verificare l'email. Il link potrebbe essere scaduto o già utilizzato.",
            goToLogin: "Vai al login",
            backHome: "Torna alla home",
        },
        authForgotPassword: {
            title: "Password dimenticata",
            subtitle:
                "Inserisci l'email associata al tuo account. Se l'indirizzo è presente, riceverai le istruzioni per reimpostare la password.",
            emailLabel: "Email",
            emailPlaceholder: "nome@email.it",
            submit: "Invia istruzioni",
            submitting: "Invio in corso...",
            successTitle: "Controlla la tua email",
            successText:
                "Se l'indirizzo è associato a un account SerenityLine, riceverai un link per reimpostare la password.",
            errorTitle: "Richiesta non riuscita",
            errorFallback:
                "Non siamo riusciti a completare la richiesta. Riprova tra qualche istante.",
            backToLogin: "Torna al login",
            backHome: "Torna alla home",
        },
        authResetPassword: {
            title: "Reimposta password",
            subtitle:
                "Scegli una nuova password per il tuo account SerenityLine.",
            tokenLabel: "Token di reset",
            tokenPlaceholder: "Incolla il token ricevuto via email",
            passwordLabel: "Nuova password",
            passwordPlaceholder: "Almeno 10 caratteri",
            confirmPasswordLabel: "Conferma nuova password",
            confirmPasswordPlaceholder: "Ripeti la nuova password",
            submit: "Reimposta password",
            submitting: "Reimpostazione in corso...",
            successTitle: "Password reimpostata",
            successText:
                "La password è stata aggiornata correttamente. Ora puoi accedere con le nuove credenziali.",
            errorTitle: "Reimpostazione non riuscita",
            errorFallback:
                "Non siamo riusciti a reimpostare la password. Il link potrebbe essere scaduto o già utilizzato.",
            passwordMismatch: "Le password non coincidono.",
            passwordTooShort: "La password deve contenere almeno 10 caratteri.",
            goToLogin: "Vai al login",
            backHome: "Torna alla home",
        },
        authAcceptInvitation: {
            title: "Accetta invito",
            subtitle:
                "Completa l'accesso al gruppo SerenityLine impostando la tua password.",
            tokenLabel: "Token invito",
            tokenPlaceholder: "Incolla il token ricevuto via email",
            passwordLabel: "Password",
            passwordPlaceholder: "Almeno 10 caratteri",
            confirmPasswordLabel: "Conferma password",
            confirmPasswordPlaceholder: "Ripeti la password",
            submit: "Accetta invito",
            submitting: "Accettazione in corso...",
            successTitle: "Invito accettato",
            successText:
                "Il tuo accesso è stato configurato correttamente. Ora puoi accedere a SerenityLine.",
            errorTitle: "Invito non accettato",
            errorFallback:
                "Non siamo riusciti ad accettare l'invito. Il link potrebbe essere scaduto o già utilizzato.",
            passwordMismatch: "Le password non coincidono.",
            passwordTooShort: "La password deve contenere almeno 10 caratteri.",
            goToLogin: "Vai al login",
            backHome: "Torna alla home",
        },
        settings: {
            eyebrow: "Account",
            title: "Impostazioni",
            subtitle:
                "Gestisci il tuo profilo, la sicurezza e le preferenze principali.",
            loading: "Caricamento dati account...",
            emptyState: "I dati account non sono ancora disponibili.",
            loadErrorTitle: "Impossibile caricare i dati account.",
            loadErrorFallback: "Riprova tra qualche istante.",
            reload: "Ricarica dati",
            sections: {
                profile: "Profilo",
                preferences: "Preferenze",
                security: "Sicurezza",
                accountData: "Dati account",
                dangerZone: "Cancellazione account",
            },
            fields: {
                userName: "Nome",
                email: "Email",
                groupName: "Gruppo",
                locale: "Lingua",
                theme: "Tema",
                paymentReminders: "Promemoria email",
                email2fa: "Autenticazione a due fattori",
                userRole: "Ruolo utente",
                platformRole: "Ruolo piattaforma",
            },
            status: {
                enabled: "Attivo",
                disabled: "Non attivo",
                enabledPlural: "Attivi",
                disabledPlural: "Non attivi",
                enabledFeminine: "Attiva",
                disabledFeminine: "Non attiva",
            },
            locales: {
                "it-IT": "Italiano",
                "en-US": "Inglese",
            },
            themes: {
                DEFAULT: "Predefinito",
                LIGHT: "Chiaro",
                DARK: "Scuro",
            },
            userRoles: {
                OWNER: "Proprietario",
                SUPER_COLLABORATOR: "Collaboratore avanzato",
                VIEWER_COLLABORATOR:
                    "Collaboratore con visibilità su tutti i conti",
                COLLABORATOR: "Collaboratore",
            },
            platformRoles: {
                USER: "Utente",
                ADMIN: "Amministratore",
                SUPERADMIN: "Super amministratore",
            },
            accountExport: {
                open: "Esporta dati account",
                description:
                    "Scarica una copia dei dati associati al tuo account SerenityLine.",
                button: "Esporta dati account",
                loading: "Preparazione export...",
                success: "Export scaricato correttamente.",
                error: "Non è stato possibile esportare i dati. Riprova tra qualche istante.",
            },
            paymentReminders: {
                enable: "Attiva promemoria email",
                disable: "Disattiva promemoria email",
                updating: "Aggiornamento...",
                success: "Preferenza aggiornata correttamente.",
                error: "Non è stato possibile aggiornare la preferenza. Riprova tra qualche istante.",
            },
            passwordChange: {
                open: "Cambia password",
                title: "Cambia password",
                currentPassword: "Password attuale",
                newPassword: "Nuova password",
                submit: "Aggiorna password",
                loading: "Aggiornamento...",
                success: "Password aggiornata. Effettua di nuovo l'accesso.",
                error: "Non è stato possibile aggiornare la password. Controlla i dati e riprova.",
            },
            emailChange: {
                open: "Cambia email",
                title: "Cambia email",
                newEmail: "Nuova email",
                currentPassword: "Password attuale",
                submit: "Richiedi cambio email",
                loading: "Invio richiesta...",
                success:
                    "Ti abbiamo inviato un'email di conferma al nuovo indirizzo.",
                error: "Non è stato possibile richiedere il cambio email. Controlla i dati e riprova.",
            },
            email2fa: {
                open: "Gestisci autenticazione a due fattori",
                title: "Autenticazione a due fattori",
                enableDescription:
                    "Riceverai un codice via email per completare l'attivazione.",
                disableDescription:
                    "Riceverai un codice via email per confermare la disattivazione.",
                currentPassword: "Password attuale",
                code: "Codice ricevuto via email",
                enable: "Attiva autenticazione a due fattori",
                disable: "Disattiva autenticazione a due fattori",
                sending: "Invio codice...",
                challengeSent: "Ti abbiamo inviato un codice via email.",
                confirm: "Conferma codice",
                confirming: "Conferma in corso...",
                success:
                    "Autenticazione a due fattori aggiornata correttamente.",
                error: "Non è stato possibile aggiornare l'autenticazione a due fattori. Controlla i dati e riprova.",
            },
            accountDeletion: {
                open: "Cancellazione account",
                description:
                    "Con questa operazione avvii la cancellazione dell'account. Se non lo riattivi entro 30 giorni l'account verrà eliminato definitivamente e non sarà possibile recuperare i tuoi dati in alcun modo. Se sei il proprietario dell'account verranno cancellati i tuoi dati personali e i tuoi dati economici, se non sei il proprietario verranno cancellati solo i tuoi dati personali.",
                confirmLabel: "Conferma cancellazione account",
                confirmHelp:
                    "Per continuare, digita esattamente l'indirizzo email {{email}}.",
                submit: "Elimina account",
                loading: "Eliminazione in corso...",
                error: "Non è stato possibile eliminare l'account. Riprova tra qualche istante.",
            },
        },
        authConfirmEmailChange: {
            title: "Conferma cambio email",
            subtitle: "Conferma il nuovo indirizzo email del tuo account.",
            manualTitle: "Inserisci il token di conferma",
            manualText:
                "Se il link non si è aperto correttamente, incolla qui il token ricevuto via email.",
            tokenLabel: "Token di conferma",
            tokenPlaceholder: "Incolla il token ricevuto via email",
            submit: "Conferma cambio email",
            confirmingTitle: "Conferma in corso",
            confirmingText:
                "Attendi qualche istante mentre confermiamo il nuovo indirizzo email.",
            successTitle: "Email aggiornata",
            successText:
                "Il tuo indirizzo email è stato aggiornato correttamente. Per sicurezza effettua di nuovo l'accesso.",
            errorTitle: "Conferma non riuscita",
            errorFallback:
                "Non siamo riusciti a confermare il cambio email. Il link potrebbe essere scaduto o già utilizzato.",
            goToLogin: "Vai al login",
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
            emailVerificationRequiredTitle: "Email verification required",
            emailVerificationRequiredText:
                "Before signing in, you need to verify your email address. Check your inbox or request a new verification link.",
            emailVerificationEmailLabel: "Email",
            emailVerificationResendSubmit: "Resend verification link",
            emailVerificationResendSubmitting: "Sending...",
            emailVerificationResendSuccess:
                "We sent a new verification link. Please check your email.",
            emailVerificationResendErrorTitle: "Resend failed",
            emailVerificationResendErrorFallback:
                "We could not send a new verification link. Please try again in a moment.",
            restoreAccountRequiredTitle: "Account pending deletion",
            restoreAccountRequiredText:
                "This account has been marked for deletion. You can restore it if you are still within the 30-day safety period.",
            restoreAccountSubmit: "Restore account",
            restoreAccountSubmitting: "Restoring account...",
            restoreAccountSuccess:
                "Account restored successfully. You can now sign in again.",
            restoreAccountEmailVerificationRequiredSuccess:
                "Account restored. Before signing in, you need to complete email verification.",
            restoreAccountErrorTitle: "Restore failed",
            restoreAccountErrorFallback:
                "Could not restore the account. The token may have expired or may no longer be valid.",
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
            subtitle: "What should I know right now?",
            loading: "Loading financial data...",
            loadErrorTitle: "Could not load financial data.",
            loadErrorFallback: "Please try again in a moment.",
            emptyState: {
                title: "You do not have financial data yet",
                text: "Add your first account to start building your SerenityLine projection.",
            },
            metrics: {
                accounts: "Accounts",
                accountsDescription: "Accounts connected to your projection.",
                buckets: "Portfolios",
                bucketsDescription:
                    "Active portfolios used to organize liquidity.",
                simulations: "Simulations",
                simulationsDescription:
                    "Active scenarios for comparing decisions.",
                categories: "Categories",
                categoriesDescription:
                    "Active categories used to classify movements.",
            },
            sections: {
                nextSteps: "Next steps",
                nextStepsText:
                    "The dashboard will use this data as the foundation for balances, calendar, simulations and SerenityLine.",
                priorities: "Financial priorities",
                prioritiesText:
                    "{{count}} priorities are available to distinguish critical, essential and optional movements.",
            },
        },
        accounts: {
            eyebrow: "Financial foundation",
            title: "Accounts",
            subtitle:
                "Manage the accounts that feed your SerenityLine projection.",
            loading: "Loading accounts...",
            loadErrorTitle: "Could not load accounts.",
            loadErrorFallback: "Please try again in a moment.",
            listEyebrow: "Connected accounts",
            listTitle: "Your accounts",
            accountsCount: "{{count}} accounts",
            emptyState:
                "You have not created any accounts yet. Add your first account to get started.",
            notProvided: "Not provided",
            table: {
                name: "Name",
                institution: "Institution",
                openingBalance: "Opening balance",
                date: "Date",
            },
            formEyebrow: "New account",
            formTitle: "Add account",
            formIntro:
                "The opening balance is the starting point of your future projection.",
            fields: {
                accountName: "Account name",
                currency: "Currency",
                openingBalance: "Opening balance",
                openingBalanceDate: "Opening balance date",
                issuingInstitution: "Issuing institution",
                accountDescription: "Description",
                optional: "optional",
            },
            validation: {
                accountNameRequired: "Enter the account name.",
                currencyInvalid: "Currency must be made of 3 letters.",
                openingBalanceInvalid:
                    "Enter a valid opening balance, using a dot and up to 17 integer digits and 2 decimal places.",
                openingBalanceDateRequired: "Enter the opening balance date.",
            },
            createSubmit: "Create account",
            createSubmitting: "Creating account...",
            createSuccess: "Account created successfully.",
            createErrorFallback: "We could not create the account.",
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
        authRegister: {
            title: "Create your account",
            subtitle:
                "Start by setting up your personal SerenityLine space. After registration, you will be asked to verify your email.",
            userNameLabel: "Name",
            userNamePlaceholder: "Jane Smith",
            emailLabel: "Email",
            emailPlaceholder: "name@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "At least 10 characters",
            confirmPasswordLabel: "Confirm password",
            confirmPasswordPlaceholder: "Repeat your password",
            preferredLocaleLabel: "Preferred language",
            preferredLocaleIt: "Italian",
            preferredLocaleEn: "English",
            paymentRemindersLabel:
                "Send me an email reminder when a registered expense or income is coming due",
            submit: "Create account",
            submitting: "Creating account...",
            errorTitle: "Registration failed",
            passwordMismatch: "Passwords do not match.",
            passwordTooShort: "Password must be at least 10 characters long.",
            successTitle: "Account created",
            successText:
                "We created your account. Check your email to complete verification.",
            successEmailLabel: "Registered email",
            goToLogin: "Go to login",
            backHome: "Back to home",
        },
        notFound: {
            title: "Page not found",
            subtitle:
                "The page you are looking for does not exist or has been moved.",
            backHome: "Back to home",
        },
        authVerifyEmail: {
            title: "Verify email",
            subtitle: "Verify your email address to complete activation.",
            manualTitle: "Enter the verification token",
            manualText:
                "If the link did not open correctly, paste the token you received by email here.",
            tokenLabel: "Verification token",
            tokenPlaceholder: "Paste the token you received by email",
            submit: "Verify email",
            submitting: "Verifying...",
            verifyingTitle: "Verification in progress",
            verifyingText: "Please wait while we complete the verification.",
            successTitle: "Email verified",
            successText:
                "Your email address has been verified successfully. You can now sign in to SerenityLine.",
            errorTitle: "Verification failed",
            errorFallback:
                "We could not verify your email. The link may have expired or already been used.",
            goToLogin: "Go to login",
            backHome: "Back to home",
        },
        authForgotPassword: {
            title: "Forgot password",
            subtitle:
                "Enter the email associated with your account. If the address exists, you will receive instructions to reset your password.",
            emailLabel: "Email",
            emailPlaceholder: "name@email.com",
            submit: "Send instructions",
            submitting: "Sending...",
            successTitle: "Check your email",
            successText:
                "If the address is associated with a SerenityLine account, you will receive a link to reset your password.",
            errorTitle: "Request failed",
            errorFallback:
                "We could not complete the request. Please try again in a moment.",
            backToLogin: "Back to login",
            backHome: "Back to home",
        },
        authResetPassword: {
            title: "Reset password",
            subtitle: "Choose a new password for your SerenityLine account.",
            tokenLabel: "Reset token",
            tokenPlaceholder: "Paste the token you received by email",
            passwordLabel: "New password",
            passwordPlaceholder: "At least 10 characters",
            confirmPasswordLabel: "Confirm new password",
            confirmPasswordPlaceholder: "Repeat the new password",
            submit: "Reset password",
            submitting: "Resetting...",
            successTitle: "Password reset",
            successText:
                "Your password has been updated successfully. You can now sign in with your new credentials.",
            errorTitle: "Reset failed",
            errorFallback:
                "We could not reset your password. The link may have expired or already been used.",
            passwordMismatch: "Passwords do not match.",
            passwordTooShort: "Password must be at least 10 characters long.",
            goToLogin: "Go to login",
            backHome: "Back to home",
        },
        authAcceptInvitation: {
            title: "Accept invitation",
            subtitle:
                "Complete your access to the SerenityLine group by setting your password.",
            tokenLabel: "Invitation token",
            tokenPlaceholder: "Paste the token you received by email",
            passwordLabel: "Password",
            passwordPlaceholder: "At least 10 characters",
            confirmPasswordLabel: "Confirm password",
            confirmPasswordPlaceholder: "Repeat the password",
            submit: "Accept invitation",
            submitting: "Accepting...",
            successTitle: "Invitation accepted",
            successText:
                "Your access has been configured successfully. You can now sign in to SerenityLine.",
            errorTitle: "Invitation not accepted",
            errorFallback:
                "We could not accept the invitation. The link may have expired or already been used.",
            passwordMismatch: "Passwords do not match.",
            passwordTooShort: "Password must be at least 10 characters long.",
            goToLogin: "Go to login",
            backHome: "Back to home",
        },
        settings: {
            eyebrow: "Account",
            title: "Settings",
            subtitle: "Manage your profile, security and main preferences.",
            loading: "Loading account data...",
            emptyState: "Account data is not available yet.",
            loadErrorTitle: "Could not load account data.",
            loadErrorFallback: "Please try again in a moment.",
            reload: "Reload data",
            sections: {
                profile: "Profile",
                preferences: "Preferences",
                security: "Security",
                accountData: "Account data",
                dangerZone: "Account deletion",
            },
            fields: {
                userName: "Name",
                email: "Email",
                groupName: "Group",
                locale: "Language",
                theme: "Theme",
                paymentReminders: "Email reminders",
                email2fa: "Two-factor authentication",
                userRole: "User role",
                platformRole: "Platform role",
            },
            status: {
                enabled: "Enabled",
                disabled: "Disabled",
                enabledPlural: "Enabled",
                disabledPlural: "Disabled",
                enabledFeminine: "Enabled",
                disabledFeminine: "Disabled",
            },
            locales: {
                "it-IT": "Italian",
                "en-US": "English",
            },
            themes: {
                DEFAULT: "Default",
                LIGHT: "Light",
                DARK: "Dark",
            },
            userRoles: {
                OWNER: "Owner",
                SUPER_COLLABORATOR: "Advanced collaborator",
                VIEWER_COLLABORATOR:
                    "Collaborator with visibility on all accounts",
                COLLABORATOR: "Collaborator",
            },
            platformRoles: {
                USER: "User",
                ADMIN: "Administrator",
                SUPERADMIN: "Super administrator",
            },
            accountExport: {
                open: "Export account data",
                description:
                    "Download a copy of the data associated with your SerenityLine account.",
                button: "Export account data",
                loading: "Preparing export...",
                success: "Export downloaded successfully.",
                error: "Could not export your data. Please try again in a moment.",
            },
            paymentReminders: {
                enable: "Enable email reminders",
                disable: "Disable email reminders",
                updating: "Updating...",
                success: "Preference updated successfully.",
                error: "Could not update the preference. Please try again in a moment.",
            },
            passwordChange: {
                open: "Change password",
                title: "Change password",
                currentPassword: "Current password",
                newPassword: "New password",
                submit: "Update password",
                loading: "Updating...",
                success: "Password updated. Please sign in again.",
                error: "Could not update the password. Check the details and try again.",
            },
            emailChange: {
                open: "Change email",
                title: "Change email",
                newEmail: "New email",
                currentPassword: "Current password",
                submit: "Request email change",
                loading: "Sending request...",
                success: "We sent a confirmation email to the new address.",
                error: "Could not request the email change. Check the details and try again.",
            },
            accountDeletion: {
                open: "Account deletion",
                description:
                    "This action starts the account deletion process. If you do not reactivate it within 30 days, the account will be permanently deleted and your data cannot be recovered in any way. If you are the account owner, your personal data and financial data will be deleted; if you are not the owner, only your personal data will be deleted.",
                confirmLabel: "Confirm account deletion",
                confirmHelp:
                    "To continue, type exactly the email address {{email}}.",
                submit: "Delete account",
                loading: "Deleting account...",
                error: "Could not delete the account. Please try again in a moment.",
            },
            email2fa: {
                open: "Manage two-factor authentication",
                title: "Two-factor authentication",
                enableDescription:
                    "You will receive an email code to complete activation.",
                disableDescription:
                    "You will receive an email code to confirm deactivation.",
                currentPassword: "Current password",
                code: "Code received by email",
                enable: "Enable two-factor authentication",
                disable: "Disable two-factor authentication",
                sending: "Sending code...",
                challengeSent: "We sent you a code by email.",
                confirm: "Confirm code",
                confirming: "Confirming...",
                success: "Two-factor authentication updated successfully.",
                error: "Could not update two-factor authentication. Check the details and try again.",
            },
        },
        authConfirmEmailChange: {
            title: "Confirm email change",
            subtitle: "Confirm the new email address for your account.",
            manualTitle: "Enter the confirmation token",
            manualText:
                "If the link did not open correctly, paste the token you received by email here.",
            tokenLabel: "Confirmation token",
            tokenPlaceholder: "Paste the token you received by email",
            submit: "Confirm email change",
            confirmingTitle: "Confirming email change",
            confirmingText:
                "Please wait while we confirm your new email address.",
            successTitle: "Email updated",
            successText:
                "Your email address has been updated successfully. For security reasons, please sign in again.",
            errorTitle: "Confirmation failed",
            errorFallback:
                "We could not confirm the email change. The link may have expired or already been used.",
            goToLogin: "Go to login",
            backHome: "Back to home",
        },
        email2fa: {
            title: "Two-factor authentication",
            enableDescription:
                "You will receive an email code to complete activation.",
            disableDescription:
                "You will receive an email code to confirm deactivation.",
            currentPassword: "Current password",
            code: "Code received by email",
            enable: "Enable two-factor authentication",
            disable: "Disable two-factor authentication",
            sending: "Sending code...",
            challengeSent: "We sent you a code by email.",
            confirm: "Confirm code",
            confirming: "Confirming...",
            success: "Two-factor authentication updated successfully.",
            error: "Could not update two-factor authentication. Check the details and try again.",
        },
    },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const defaultLanguage: SupportedLanguage = "it";

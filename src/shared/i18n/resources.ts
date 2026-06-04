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
                buckets: "Portafogli",
                accounts: "Conti",
                creditCards: "Carte di Credito",
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
        recurringTransactions: {
            eyebrow: "Futuro ricorrente",
            title: "Movimenti ricorrenti",
            subtitle:
                "Gestisci gli automatismi che alimentano la proiezione futura di SerenityLine.",
            referenceDataLoading: "Caricamento dati finanziari...",
            referenceDataLoadErrorTitle:
                "Impossibile caricare i dati finanziari.",
            referenceDataLoadErrorFallback: "Riprova tra qualche istante.",
            loading: "Caricamento movimenti ricorrenti...",
            loadErrorFallback:
                "Non è stato possibile caricare i movimenti ricorrenti. Riprova tra qualche istante.",
            createSuccess: "Movimento ricorrente creato correttamente.",
            createErrorFallback:
                "Non è stato possibile creare il movimento ricorrente. Riprova tra qualche istante.",
            unknown: {
                account: "Conto sconosciuto",
                category: "Categoria sconosciuta",
                financialPriority: "Priorità sconosciuta",
            },
            edit: {
                title: "Modifica movimento ricorrente",
                subtitle:
                    "Aggiorna i dati del movimento ricorrente selezionato.",
                submit: "Salva modifica",
                submitting: "Salvataggio modifica...",
                success: "Movimento ricorrente aggiornato correttamente.",
                errorFallback:
                    "Non è stato possibile aggiornare il movimento ricorrente. Riprova tra qualche istante.",
                singleRequestRequired:
                    "Questa modifica genererebbe più movimenti tecnici. Per ora modifica separatamente carta e portafoglio.",
            },
            report: {
                trendUnavailable: "Trend non disponibile",
                eyebrow: "Report",
                title: "Sintesi ricorrenti",
                subtitle: "Report aggiornato al {{date}}.",
                empty: "Il report verrà mostrato appena disponibile.",
                averageMonthlyNetBalance: "Saldo medio mensile netto",
                annualIncome: "Entrate annue",
                annualExpenses: "Uscite annue",
                annualNetBalance: "Saldo annuo netto",
                recurringTitle: "Flusso ricorrente",
                recurringSubtitle:
                    "Sintesi delle entrate e uscite ricorrenti, su base mensile e annuale.",
                averageMonthlyIncome: "Entrate medie mensili",
                averageMonthlyExpenses: "Uscite medie mensili",

                extremesTitle: "Punti critici della proiezione",
                extremesSubtitle: "Analisi del periodo dal {{from}} al {{to}}.",
                serenityline: "SerenityLine",
                accountBalance: "Saldo conto",
                minimum: "Minimo",
                maximum: "Massimo",

                yearEndForecastTitle: "Previsioni di fine anno",
                yearEndForecastSubtitle:
                    "Proiezione dei prossimi {{years}} anni per saldo conto e SerenityLine.",
                forecastYear: "Anno",
                forecastDate: "Data",
                currency: "Valuta",
                endOfYearAccountBalance: "Saldo conto fine anno",
                endOfYearSerenityline: "SerenityLine fine anno",

                emptySection: "Nessun dato disponibile per questa sezione.",

                trendDirections: {
                    UP: "Trend in crescita",
                    DOWN: "Trend in calo",
                    FLAT: "Trend stabile",
                    MIXED: "Trend variabile",
                },

                temporalPositions: {
                    PAST: "Passato",
                    TODAY: "Oggi",
                    FUTURE: "Futuro",
                },

                extremeClassifications: {
                    IN_RANGE_EXTREME: "Estremo nel periodo analizzato",
                    RANGE_START_BOUNDARY: "Valore iniziale del periodo",
                    RANGE_END_BOUNDARY: "Valore finale del periodo",
                    MONOTONIC_TREND_WITHIN_HORIZON:
                        "Trend monotono entro l'orizzonte analizzato",
                },
            },
            priorities: {
                eyebrow: "Classificazione",
                title: "Priorità finanziarie",
                subtitle:
                    "Le priorità aiutano SerenityLine a distinguere ciò che è critico, essenziale, opzionale o legato al benessere.",
            },
            form: {
                eyebrow: "Nuova ricorrenza",
                title: "Aggiungi movimento ricorrente",
                subtitle:
                    "Crea entrate o uscite che si ripetono nel tempo e alimentano la proiezione.",
                submit: "Salva movimento ricorrente",
                submitting: "Salvataggio ricorrente...",
            },
            list: {
                eyebrow: "Ricorrenze attive",
                title: "Lista movimenti ricorrenti",
                count: "{{count}} ricorrenti",
                empty: "Non hai ancora creato movimenti ricorrenti.",
            },
            table: {
                description: "Descrizione",
                amount: "Importo",
                frequency: "Frequenza",
                firstPayment: "Prima data",
                actions: "Azioni",
            },
            actions: {
                showForm: "Nuovo ricorrente",
                hideForm: "Chiudi",
                edit: "Modifica",
            },
            recurrenceEvery: "Ogni {{interval}} {{unit}}",
            recurrenceUnits: {
                DAY: {
                    singular: "Giornaliero",
                    plural: "giorni",
                },
                WEEK: {
                    singular: "Settimanale",
                    plural: "settimane",
                },
                MONTH: {
                    singular: "Mensile",
                    plural: "mesi",
                },
                YEAR: {
                    singular: "Annuale",
                    plural: "anni",
                },
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
                actions: "Azioni",
            },
            newAccount: "Nuovo conto",
            viewDetails: "Vedi dettaglio",
            detailLoading: "Caricamento dettaglio conto...",
            detailErrorFallback:
                "Non siamo riusciti a caricare il dettaglio del conto.",
            detailEyebrow: "Dettaglio conto",
            edit: "Modifica",
            editFormAriaLabel: "Modifica conto",
            currencyReadonlyHelp:
                "La valuta non è modificabile per un conto esistente.",
            updateSubmit: "Salva modifiche",
            updateSubmitting: "Salvataggio...",
            cancelEdit: "Annulla",
            editSuccess: "Conto aggiornato correttamente.",
            editErrorFallback: "Non siamo riusciti ad aggiornare il conto.",
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
        creditCards: {
            eyebrow: "Base finanziaria",
            title: "Carte",
            subtitle:
                "Gestisci le carte di credito collegate ai tuoi conti SerenityLine.",
            loading: "Caricamento carte...",
            loadErrorTitle: "Impossibile caricare le carte.",
            loadErrorFallback: "Riprova tra qualche istante.",
            listEyebrow: "Carte collegate",
            listTitle: "Le tue carte",
            creditCardsCount: "{{count}} carte",
            emptyState:
                "Non hai ancora creato carte. Aggiungi la prima carta collegandola a un conto.",
            accountFallback: "Conto non disponibile",
            table: {
                name: "Nome",
                account: "Conto",
                chargeDay: "Giorno di addebito",
            },
            chargeDayValue: "Giorno {{day}}",
            formEyebrow: "Nuova carta",
            formTitle: "Aggiungi carta",
            formIntro:
                "Collega la carta a un conto e indica il giorno di addebito abituale.",
            noAccountsWarning:
                "Prima di creare una carta devi avere almeno un conto.",
            selectAccount: "Seleziona un conto",
            fields: {
                creditCardName: "Nome carta",
                account: "Conto collegato",
                chargeDay: "Giorno di addebito",
                description: "Descrizione",
                optional: "opzionale",
            },
            validation: {
                creditCardNameRequired: "Inserisci il nome della carta.",
                accountRequired: "Seleziona il conto collegato alla carta.",
                chargeDayInvalid:
                    "Inserisci un giorno di addebito valido tra 1 e 31.",
            },
            createSubmit: "Crea carta",
            createSubmitting: "Creazione carta...",
            createSuccess: "Carta creata correttamente.",
            createErrorFallback: "Non siamo riusciti a creare la carta.",
            viewDetails: "Vedi dettaglio",
            detailLoading: "Caricamento dettaglio carta...",
            detailErrorFallback:
                "Non siamo riusciti a caricare il dettaglio della carta.",
            detailEyebrow: "Dettaglio carta",
            edit: "Modifica",
            editFormAriaLabel: "Modifica carta",
            accountReadonlyHelp:
                "Il conto collegato non è modificabile per una carta esistente.",
            updateSubmit: "Salva modifiche",
            updateSubmitting: "Salvataggio...",
            cancelEdit: "Annulla",
            editSuccess: "Carta aggiornata correttamente.",
            editErrorFallback: "Non siamo riusciti ad aggiornare la carta.",
            newCreditCard: "Nuova carta",
            deleteConfirm:
                "Vuoi eliminare questa carta? L'operazione è possibile solo se non è mai stata usata.",
            deleteHint:
                "Puoi eliminare solo carte mai usate in movimenti o transazioni.",
            deleteSubmit: "Elimina carta",
            deleteSubmitting: "Eliminazione...",
            deleteSuccess: "Carta eliminata correttamente.",
            deleteErrorFallback:
                "Non siamo riusciti a eliminare la carta. Puoi eliminare solo carte mai usate.",
        },
        categories: {
            eyebrow: "Classificazione",
            title: "Categorie",
            subtitle:
                "Organizza entrate e uscite con categorie chiare e riutilizzabili.",
            loading: "Caricamento categorie...",
            loadErrorTitle: "Impossibile caricare le categorie.",
            loadErrorFallback: "Riprova tra qualche istante.",
            listEyebrow: "Categorie disponibili",
            listTitle: "Le tue categorie",
            categoriesCount: "{{count}} categorie",
            emptyState:
                "Non hai ancora creato categorie. Aggiungi la prima categoria per classificare i movimenti.",
            table: {
                name: "Nome",
                status: "Stato",
            },
            status: {
                active: "Attiva",
                inactive: "Disattivata",
            },
            formEyebrow: "Nuova categoria",
            formTitle: "Aggiungi categoria",
            formIntro:
                "Crea una categoria per rendere più leggibili transazioni, ricorrenze e proiezioni.",
            fields: {
                categoryName: "Nome categoria",
                description: "Descrizione",
                status: "Stato",
                optional: "opzionale",
            },
            validation: {
                categoryNameRequired: "Inserisci il nome della categoria.",
            },
            createSubmit: "Crea categoria",
            createSubmitting: "Creazione categoria...",
            createSuccess: "Categoria creata correttamente.",
            createErrorFallback: "Non siamo riusciti a creare la categoria.",
            viewDetails: "Vedi dettaglio",
            detailEyebrow: "Dettaglio categoria",
            edit: "Modifica",
            editFormAriaLabel: "Modifica categoria",
            updateSubmit: "Salva modifiche",
            updateSubmitting: "Salvataggio...",
            cancelEdit: "Annulla",
            editSuccess: "Categoria aggiornata correttamente.",
            editErrorFallback: "Non siamo riusciti ad aggiornare la categoria.",
            newCategory: "Nuova categoria",
            deactivateConfirm:
                "Vuoi disattivare questa categoria? Potrai riattivarla in seguito.",
            deactivateHint:
                "Disattiva la categoria se non vuoi più usarla per nuovi movimenti.",
            reactivateHint:
                "Riattiva la categoria per renderla di nuovo disponibile.",
            deactivateSubmit: "Disattiva categoria",
            reactivateSubmit: "Riattiva categoria",
            statusSubmitting: "Aggiornamento...",
            deactivateSuccess: "Categoria disattivata correttamente.",
            reactivateSuccess: "Categoria riattivata correttamente.",
            deactivateErrorFallback:
                "Non siamo riusciti a disattivare la categoria.",
            reactivateErrorFallback:
                "Non siamo riusciti a riattivare la categoria.",
        },
        buckets: {
            eyebrow: "Destinazione liquidità",
            title: "Portafogli",
            subtitle:
                "Separa la liquidità libera da quella destinata a obiettivi o vincoli specifici.",
            loading: "Caricamento portafogli...",
            loadErrorTitle: "Impossibile caricare i portafogli.",
            loadErrorFallback: "Riprova tra qualche istante.",
            listEyebrow: "Portafogli disponibili",
            listTitle: "I tuoi portafogli",
            bucketsCount: "{{count}} portafogli",
            emptyState:
                "Non hai ancora creato portafogli. Aggiungi il primo portafoglio per destinare parte della liquidità.",
            unnamedBucket: "Portafoglio senza nome",
            table: {
                name: "Nome",
                accounts: "Conti",
                status: "Stato",
            },
            status: {
                active: "Attivo",
                closed: "Chiuso",
            },
            linkedAccountsCount: "{{count}} conti collegati",
            accountFallback: "Conto non disponibile",
            formEyebrow: "Nuovo portafoglio",
            formTitle: "Aggiungi portafoglio",
            formIntro:
                "Crea un portafoglio per rappresentare una destinazione della liquidità.",
            fields: {
                bucketName: "Nome portafoglio",
                description: "Descrizione",
                accounts: "Conti collegati",
                status: "Stato",
                optional: "opzionale",
            },
            validation: {
                bucketNameRequired: "Inserisci il nome del portafoglio.",
            },
            noAccountsHint:
                "Non ci sono conti disponibili. Potrai collegarli dopo averli creati.",
            createSubmit: "Crea portafoglio",
            createSubmitting: "Creazione portafoglio...",
            createSuccess: "Portafoglio creato correttamente.",
            createErrorFallback: "Non siamo riusciti a creare il portafoglio.",
            viewDetails: "Vedi dettaglio",
            detailLoading: "Caricamento dettaglio portafoglio...",
            detailErrorFallback:
                "Non siamo riusciti a caricare il dettaglio del portafoglio.",
            detailEyebrow: "Dettaglio portafoglio",
            edit: "Modifica",
            editFormAriaLabel: "Modifica portafoglio",
            updateSubmit: "Salva modifiche",
            updateSubmitting: "Salvataggio...",
            cancelEdit: "Annulla",
            editSuccess: "Portafoglio aggiornato correttamente.",
            editErrorFallback:
                "Non siamo riusciti ad aggiornare il portafoglio.",
            newBucket: "Nuovo portafoglio",
            noLinkedAccounts: "Nessun conto collegato",
            linkedAccountsTitle: "Conti collegati",
            linkedAccountsHint:
                "Collega o scollega i conti che alimentano questo portafoglio.",
            linkAccount: "Collega {{accountName}}",
            unlinkAccount: "Scollega {{accountName}}",
            linkAccountSuccess: "Conto collegato correttamente.",
            unlinkAccountSuccess: "Conto scollegato correttamente.",
            linkAccountErrorFallback:
                "Non siamo riusciti a collegare il conto al portafoglio.",
            unlinkAccountErrorFallback:
                "Non siamo riusciti a scollegare il conto dal portafoglio.",
            closeConfirm:
                "Vuoi chiudere questo portafoglio? Potrai riaprirlo in seguito.",
            closeHint:
                "Chiudi il portafoglio se non vuoi più usarlo per nuove pianificazioni.",
            reopenHint:
                "Riapri il portafoglio per renderlo nuovamente disponibile.",
            closeSubmit: "Chiudi portafoglio",
            reopenSubmit: "Riapri portafoglio",
            statusSubmitting: "Aggiornamento...",
            closeSuccess: "Portafoglio chiuso correttamente.",
            reopenSuccess: "Portafoglio riaperto correttamente.",
            closeErrorFallback: "Non siamo riusciti a chiudere il portafoglio.",
            reopenErrorFallback:
                "Non siamo riusciti a riaprire il portafoglio.",
        },
        transactionForms: {
            fields: {
                description: "Descrizione",
                amount: "Importo",
                chargeDate: "Data addebito",
                category: "Categoria",
                account: "Conto",
                creditCard: "Carta",
                bucket: "Portafoglio",
                confirmed: "Transazione già confermata",
                reminderEnabled: "Attiva promemoria",
                reminderDaysBefore: "Giorni di anticipo del promemoria",
                optional: "opzionale",
            },
            placeholders: {
                amount: "Es. 250,50",
            },
            options: {
                selectCategory: "Seleziona categoria",
                selectAccount: "Seleziona conto",
                noCreditCard: "Nessuna carta",
                noBucket: "Nessun portafoglio",
                unnamedBucket: "Portafoglio senza nome",
            },
            actions: {
                submit: "Salva transazione",
                submitting: "Salvataggio...",
                cancel: "Annulla",
                newCategory: "Nuova",
                newAccount: "Nuovo",
                newCreditCard: "Nuova",
                newBucket: "Nuovo",
            },
            validation: {
                descriptionRequired:
                    "Inserisci la descrizione della transazione.",
                amountInvalid: "Inserisci un importo valido.",
                chargeDateRequired: "Inserisci la data di addebito.",
                categoryRequired: "Seleziona una categoria.",
                accountRequired: "Seleziona un conto.",
                reminderDaysInvalid:
                    "Inserisci un numero di giorni di promemoria valido.",
            },
            bucketAmountSignHint:
                "Con un portafoglio collegato, usa + per trasferire al portafoglio e - per pagare usando il portafoglio.",
            twoMovementsHint:
                "Questa transazione genererà 2 movimenti: uno legato al portafoglio e uno legato alla carta di credito.",
            recurring: {
                fields: {
                    description: "Descrizione",
                    paymentAmount: "Importo pagamento",
                    amountIsAdjustable:
                        "Potresti modificare questo importo se volessi?",
                    firstPaymentDate: "Prima data pagamento",
                    recurrenceInterval: "Ogni",
                    recurrenceUnit: "Unità ricorrenza",
                    paymentDateAdjustmentPolicy:
                        "Gestione giorno non lavorativo",
                    category: "Categoria",
                    financialPriority: "Priorità finanziaria",
                    account: "Conto collegato",
                    creditCard: "Carta collegata",
                    bucket: "Portafoglio collegato",
                    endDate: "Data fine",
                    finalPaymentAmount: "Importo rata finale",
                    reminderEnabled: "Attiva promemoria",
                    reminderDaysBefore: "Giorni di anticipo del promemoria",
                },
                placeholders: {
                    amount: "Es. 250,50",
                },
                options: {
                    selectCategory: "Seleziona categoria",
                    selectFinancialPriority: "Seleziona priorità",
                    selectAccount: "Seleziona conto",
                    noCreditCard: "Nessuna carta",
                    noBucket: "Nessun portafoglio",
                    unnamedBucket: "Portafoglio senza nome",
                },
                recurrenceUnits: {
                    singular: {
                        day: "Giorno",
                        week: "Settimana",
                        month: "Mese",
                        year: "Anno",
                    },
                    plural: {
                        day: "Giorni",
                        week: "Settimane",
                        month: "Mesi",
                        year: "Anni",
                    },
                },
                paymentDatePolicies: {
                    none: "Nessun aggiustamento",
                    previous: "Giorno lavorativo precedente",
                    next: "Giorno lavorativo successivo",
                },
                actions: {
                    submit: "Salva ricorrenza",
                    submitting: "Salvataggio...",
                },
                validation: {
                    descriptionRequired:
                        "Inserisci la descrizione della ricorrenza.",
                    paymentAmountInvalid:
                        "Inserisci un importo pagamento valido.",
                    firstPaymentDateRequired:
                        "Inserisci la prima data pagamento.",
                    recurrenceIntervalInvalid:
                        "Inserisci un intervallo di ricorrenza valido.",
                    categoryRequired: "Seleziona una categoria.",
                    financialPriorityRequired:
                        "Seleziona una priorità finanziaria.",
                    accountRequired: "Seleziona un conto collegato.",
                    finalPaymentAmountInvalid:
                        "Inserisci un importo rata finale valido.",
                    reminderDaysInvalid:
                        "Inserisci un numero di giorni di promemoria valido.",
                },
                bucketAmountSignHint:
                    "Con un portafoglio collegato, usa + per trasferire al portafoglio e - per pagare usando il portafoglio.",
                twoMovementsHint:
                    "Questa ricorrenza genererà 2 movimenti: uno legato al portafoglio e uno legato alla carta di credito.",
            },
        },
        referenceModals: {
            common: {
                cancel: "Annulla",
                close: "Chiudi",
                optional: "opzionale",
            },
            category: {
                eyebrow: "Nuova voce",
                title: "Nuova categoria",
                intro: "Crea una categoria senza uscire dal form della transazione.",
                fields: {
                    name: "Nome categoria",
                    description: "Descrizione",
                },
                validation: {
                    nameRequired: "Inserisci il nome della categoria.",
                },
                submit: "Crea categoria",
                submitting: "Creazione...",
                createErrorFallback:
                    "Non siamo riusciti a creare la categoria.",
            },
            account: {
                eyebrow: "Nuova voce",
                title: "Nuovo conto",
                intro: "Crea un conto senza uscire dal form della transazione.",
                fields: {
                    name: "Nome conto",
                    description: "Descrizione",
                    currency: "Valuta",
                    issuingInstitution: "Istituto emittente",
                    openingBalance: "Saldo iniziale",
                    openingBalanceDate: "Data saldo iniziale",
                },
                placeholders: {
                    openingBalance: "Es. 0 oppure 1.250,50",
                },
                validation: {
                    nameRequired: "Inserisci il nome del conto.",
                    currencyInvalid: "Seleziona una valuta valida.",
                    openingBalanceInvalid:
                        "Inserisci un saldo iniziale valido.",
                    openingBalanceDateRequired:
                        "Inserisci la data del saldo iniziale.",
                },
                submit: "Crea conto",
                submitting: "Creazione...",
                createErrorFallback: "Non siamo riusciti a creare il conto.",
            },
            creditCard: {
                eyebrow: "Nuova voce",
                title: "Nuova carta",
                intro: "Crea una carta senza uscire dal form della transazione.",
                fields: {
                    name: "Nome carta",
                    description: "Descrizione",
                    chargeDay: "Giorno di addebito",
                    account: "Conto collegato",
                },
                options: {
                    selectAccount: "Seleziona conto",
                },
                validation: {
                    nameRequired: "Inserisci il nome della carta.",
                    chargeDayInvalid:
                        "Inserisci un giorno di addebito valido tra 1 e 31.",
                    accountRequired: "Seleziona il conto collegato alla carta.",
                },
                submit: "Crea carta",
                submitting: "Creazione...",
                createErrorFallback: "Non siamo riusciti a creare la carta.",
            },
            bucket: {
                eyebrow: "Nuova voce",
                title: "Nuovo portafoglio",
                intro: "Crea un portafoglio senza uscire dal form della transazione.",
                fields: {
                    name: "Nome portafoglio",
                    description: "Descrizione",
                    accounts: "Conti collegati",
                },
                validation: {
                    nameRequired: "Inserisci il nome del portafoglio.",
                },
                noAccountsHint:
                    "Non ci sono conti disponibili. Potrai collegarli dopo averli creati.",
                submit: "Crea portafoglio",
                submitting: "Creazione...",
                createErrorFallback:
                    "Non siamo riusciti a creare il portafoglio.",
            },
        },
        simulations: {
            eyebrow: "Scenari",
            title: "Simulazioni",
            subtitle:
                "Crea scenari alternativi per valutare decisioni e confrontare l'impatto sulla tua SerenityLine.",
            loading: "Caricamento simulazioni...",
            loadErrorTitle: "Impossibile caricare le simulazioni.",
            loadErrorFallback: "Riprova tra qualche istante.",
            createTitle: "Nuova simulazione",
            createSubtitle:
                "Scegli un nome e collega i conti che potranno essere usati nello scenario.",
            noAccounts:
                "Crea almeno un conto prima di configurare una simulazione.",
            optional: "opzionale",
            createSuccess: "Simulazione creata correttamente.",
            createErrorFallback:
                "Non è stato possibile creare la simulazione. Riprova tra qualche istante.",
            listTitle: "Scenari disponibili",
            listSubtitle:
                "Le simulazioni attive potranno contenere movimenti e ricorrenze simulate.",
            count: "{{count}} simulazioni",
            emptyState:
                "Non hai ancora creato simulazioni. Crea il primo scenario per confrontare decisioni future.",
            updateSuccess: "Simulazione aggiornata correttamente.",
            updateErrorFallback:
                "Non è stato possibile aggiornare la simulazione. Riprova tra qualche istante.",
            archiveSuccess: "Simulazione archiviata correttamente.",
            archiveErrorFallback:
                "Non è stato possibile archiviare la simulazione. Riprova tra qualche istante.",
            restoreSuccess: "Simulazione ripristinata correttamente.",
            restoreErrorFallback:
                "Non è stato possibile ripristinare la simulazione. Riprova tra qualche istante.",
            accountLinkSuccess: "Conto collegato alla simulazione.",
            accountLinkErrorFallback:
                "Non è stato possibile collegare il conto. Riprova tra qualche istante.",
            accountUnlinkSuccess: "Conto scollegato dalla simulazione.",
            accountUnlinkErrorFallback:
                "Non è stato possibile scollegare il conto. Riprova tra qualche istante.",
            transactionCreateSuccess:
                "Movimento simulato creato correttamente.",
            transactionCreateErrorFallback:
                "Non è stato possibile creare il movimento simulato. Riprova tra qualche istante.",
            recurringTransactionCreateSuccess:
                "Movimento ricorrente simulato creato correttamente.",
            recurringTransactionCreateErrorFallback:
                "Non è stato possibile creare il movimento ricorrente simulato. Riprova tra qualche istante.",
            transactionUpdateSuccess:
                "Transazione simulata aggiornata correttamente.",
            transactionUpdateErrorFallback:
                "Non è stato possibile aggiornare la transazione simulata. Riprova tra qualche istante.",
            recurringTransactionUpdateSuccess:
                "Movimento ricorrente simulato aggiornato correttamente.",
            recurringTransactionUpdateErrorFallback:
                "Non è stato possibile aggiornare il movimento ricorrente simulato. Riprova tra qualche istante.",
            recurringTransactionEditForm: {
                title: "Modifica movimento ricorrente simulato",
                subtitle:
                    "Aggiorna i dati del movimento ricorrente simulato selezionato.",
                submit: "Salva modifica",
                submitting: "Salvataggio modifica...",
            },
            movementEdit: {
                singleRequestRequired:
                    "Questa modifica genererebbe più movimenti tecnici. Per ora modifica separatamente carta e portafoglio.",
            },
            transactionEditForm: {
                title: "Modifica transazione simulata",
                subtitle: "Aggiorna i dati del movimento simulato selezionato.",
                submit: "Salva modifica",
                submitting: "Salvataggio modifica...",
            },
            transactionForm: {
                title: "Nuovo movimento simulato",
                subtitle:
                    "Il movimento verrà aggiunto allo scenario “{{name}}”.",
                submit: "Salva movimento simulato",
                submitting: "Salvataggio movimento...",
            },
            recurringTransactionForm: {
                title: "Nuovo movimento ricorrente simulato",
                subtitle:
                    "Il movimento ricorrente verrà aggiunto allo scenario “{{name}}”.",
                submit: "Salva ricorrente simulato",
                submitting: "Salvataggio ricorrente...",
            },
            fields: {
                name: "Nome simulazione",
                description: "Descrizione",
                accounts: "Conti collegati",
            },
            movements: {
                title: "Movimenti collegati",
                subtitle:
                    "Movimenti simulati collegati allo scenario “{{name}}”.",
                loading: "Caricamento movimenti...",
                empty: "Non ci sono ancora movimenti collegati a questo scenario.",
                loadErrorFallback:
                    "Non è stato possibile caricare i movimenti collegati. Riprova tra qualche istante.",
                recurringTitle: "Movimenti ricorrenti",
                transactionsTitle: "Transazioni",
                recurringFrequency: "Ogni {{interval}} {{unit}}",
                recurrenceUnits: {
                    DAY: {
                        singular: "Giornaliero",
                        plural: "giorni",
                    },
                    WEEK: {
                        singular: "Settimanale",
                        plural: "settimane",
                    },
                    MONTH: {
                        singular: "Mensile",
                        plural: "mesi",
                    },
                    YEAR: {
                        singular: "Annuale",
                        plural: "anni",
                    },
                },
            },
            actions: {
                create: "Crea simulazione",
                creating: "Creazione in corso...",
                edit: "Modifica",
                save: "Salva",
                saving: "Salvataggio...",
                cancel: "Annulla",
                archive: "Archivia",
                archiving: "Archiviazione...",
                restore: "Ripristina",
                restoring: "Ripristino...",
                manageAccounts: "Gestisci conti",
                done: "Fine",
                addTransaction: "Aggiungi movimento",
                addRecurringTransaction: "Aggiungi ricorrente",
                showMovements: "Visualizza movimenti collegati",
                hideMovements: "Nascondi movimenti collegati",
            },
            validation: {
                nameRequired: "Inserisci un nome per la simulazione.",
                accountRequired: "Seleziona almeno un conto.",
            },
            table: {
                name: "Nome",
                accounts: "Conti collegati",
                status: "Stato",
                actions: "Azioni",
            },
            status: {
                active: "Attiva",
                archived: "Archiviata",
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
            creditCards: {
                title: "Carte",
                subtitle: "Quali carte alimentano la mia proiezione?",
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
                buckets: "Buckets",
                accounts: "Accounts",
                creditCards: "Credit Cards",
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

        recurringTransactions: {
            eyebrow: "Recurring future",
            title: "Recurring movements",
            subtitle:
                "Manage the automations that feed SerenityLine's future projection.",
            referenceDataLoading: "Loading financial data...",
            referenceDataLoadErrorTitle: "Could not load financial data.",
            referenceDataLoadErrorFallback: "Please try again in a moment.",
            loading: "Loading recurring movements...",
            loadErrorFallback:
                "We could not load recurring movements. Please try again in a moment.",
            createSuccess: "Recurring movement created successfully.",
            createErrorFallback:
                "We could not create the recurring movement. Please try again in a moment.",
            unknown: {
                account: "Unknown account",
                category: "Unknown category",
                financialPriority: "Unknown priority",
            },
            edit: {
                title: "Edit recurring movement",
                subtitle: "Update the selected recurring movement.",
                submit: "Save changes",
                submitting: "Saving changes...",
                success: "Recurring movement updated successfully.",
                errorFallback:
                    "We could not update the recurring movement. Please try again in a moment.",
                singleRequestRequired:
                    "This edit would generate multiple technical movements. For now, edit card and portfolio movements separately.",
            },
            report: {
                trendUnavailable: "Trend unavailable",
                eyebrow: "Report",
                title: "Recurring summary",
                subtitle: "Report updated on {{date}}.",
                empty: "The report will be shown as soon as it is available.",
                averageMonthlyNetBalance: "Average monthly net balance",
                annualIncome: "Annual income",
                annualExpenses: "Annual expenses",
                annualNetBalance: "Annual net balance",
                recurringTitle: "Recurring flow",
                recurringSubtitle:
                    "Summary of recurring income and expenses, on a monthly and annual basis.",
                averageMonthlyIncome: "Average monthly income",
                averageMonthlyExpenses: "Average monthly expenses",

                extremesTitle: "Projection critical points",
                extremesSubtitle: "Analysis period from {{from}} to {{to}}.",
                serenityline: "SerenityLine",
                accountBalance: "Account balance",
                minimum: "Minimum",
                maximum: "Maximum",

                yearEndForecastTitle: "Year-end forecasts",
                yearEndForecastSubtitle:
                    "Projection for the next {{years}} years for account balance and SerenityLine.",
                forecastYear: "Year",
                forecastDate: "Date",
                currency: "Currency",
                endOfYearAccountBalance: "Year-end account balance",
                endOfYearSerenityline: "Year-end SerenityLine",

                emptySection: "No data available for this section.",

                trendDirections: {
                    UP: "Upward trend",
                    DOWN: "Downward trend",
                    FLAT: "Flat trend",
                    MIXED: "Mixed trend",
                },

                temporalPositions: {
                    PAST: "Past",
                    TODAY: "Today",
                    FUTURE: "Future",
                },

                extremeClassifications: {
                    IN_RANGE_EXTREME: "Extreme within the analysed period",
                    RANGE_START_BOUNDARY: "Initial value of the period",
                    RANGE_END_BOUNDARY: "Final value of the period",
                    MONOTONIC_TREND_WITHIN_HORIZON:
                        "Monotonic trend within the analysed horizon",
                },
            },
            priorities: {
                eyebrow: "Classification",
                title: "Financial priorities",
                subtitle:
                    "Priorities help SerenityLine distinguish what is critical, essential, optional or related to wellbeing.",
            },
            form: {
                eyebrow: "New recurrence",
                title: "Add recurring movement",
                subtitle:
                    "Create income or expenses that repeat over time and feed the projection.",
                submit: "Save recurring movement",
                submitting: "Saving recurring movement...",
            },
            list: {
                eyebrow: "Active recurrences",
                title: "Recurring movement list",
                count: "{{count}} recurring",
                empty: "You have not created recurring movements yet.",
            },
            table: {
                description: "Description",
                amount: "Amount",
                frequency: "Frequency",
                firstPayment: "First date",
                actions: "Actions",
            },
            actions: {
                showForm: "New recurring",
                hideForm: "Close",
                edit: "Edit",
            },
            recurrenceEvery: "Every {{interval}} {{unit}}",
            recurrenceUnits: {
                DAY: {
                    singular: "Daily",
                    plural: "days",
                },
                WEEK: {
                    singular: "Weekly",
                    plural: "weeks",
                },
                MONTH: {
                    singular: "Monthly",
                    plural: "months",
                },
                YEAR: {
                    singular: "Yearly",
                    plural: "years",
                },
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
                actions: "Actions",
            },
            newAccount: "New account",
            viewDetails: "View details",
            detailLoading: "Loading account detail...",
            detailErrorFallback: "We could not load the account detail.",
            detailEyebrow: "Account detail",
            edit: "Edit",
            editFormAriaLabel: "Edit account",
            currencyReadonlyHelp:
                "Currency cannot be changed for an existing account.",
            updateSubmit: "Save changes",
            updateSubmitting: "Saving...",
            cancelEdit: "Cancel",
            editSuccess: "Account updated successfully.",
            editErrorFallback: "We could not update the account.",
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
        creditCards: {
            eyebrow: "Financial foundation",
            title: "Cards",
            subtitle:
                "Manage the credit cards connected to your SerenityLine accounts.",
            loading: "Loading cards...",
            loadErrorTitle: "Unable to load cards.",
            loadErrorFallback: "Please try again in a moment.",
            listEyebrow: "Connected cards",
            listTitle: "Your cards",
            creditCardsCount: "{{count}} cards",
            emptyState:
                "You have not created any cards yet. Add your first card and connect it to an account.",
            accountFallback: "Account unavailable",
            table: {
                name: "Name",
                account: "Account",
                chargeDay: "Charge day",
            },
            chargeDayValue: "Day {{day}}",
            formEyebrow: "New card",
            formTitle: "Add card",
            formIntro:
                "Connect the card to an account and set its usual charge day.",
            noAccountsWarning:
                "You need at least one account before creating a card.",
            selectAccount: "Select an account",
            fields: {
                creditCardName: "Card name",
                account: "Connected account",
                chargeDay: "Charge day",
                description: "Description",
                optional: "optional",
            },
            validation: {
                creditCardNameRequired: "Enter the card name.",
                accountRequired: "Select the account connected to the card.",
                chargeDayInvalid: "Enter a valid charge day between 1 and 31.",
            },
            createSubmit: "Create card",
            createSubmitting: "Creating card...",
            createSuccess: "Card created successfully.",
            createErrorFallback: "We could not create the card.",
            viewDetails: "View details",
            detailLoading: "Loading card detail...",
            detailErrorFallback: "We could not load the card detail.",
            detailEyebrow: "Card detail",
            edit: "Edit",
            editFormAriaLabel: "Edit card",
            accountReadonlyHelp:
                "The connected account cannot be changed for an existing card.",
            updateSubmit: "Save changes",
            updateSubmitting: "Saving...",
            cancelEdit: "Cancel",
            editSuccess: "Card updated successfully.",
            editErrorFallback: "We could not update the card.",
            newCreditCard: "New card",
            deleteConfirm:
                "Do you want to delete this card? This is only possible if it has never been used.",
            deleteHint:
                "You can only delete cards that have never been used in movements or transactions.",
            deleteSubmit: "Delete card",
            deleteSubmitting: "Deleting...",
            deleteSuccess: "Card deleted successfully.",
            deleteErrorFallback:
                "We could not delete the card. You can only delete cards that have never been used.",
        },
        categories: {
            eyebrow: "Classification",
            title: "Categories",
            subtitle:
                "Organize income and expenses with clear reusable categories.",
            loading: "Loading categories...",
            loadErrorTitle: "Unable to load categories.",
            loadErrorFallback: "Please try again in a moment.",
            listEyebrow: "Available categories",
            listTitle: "Your categories",
            categoriesCount: "{{count}} categories",
            emptyState:
                "You have not created any categories yet. Add your first category to classify movements.",
            table: {
                name: "Name",
                status: "Status",
            },
            status: {
                active: "Active",
                inactive: "Inactive",
            },
            formEyebrow: "New category",
            formTitle: "Add category",
            formIntro:
                "Create a category to make transactions, recurring items and projections easier to read.",
            fields: {
                categoryName: "Category name",
                description: "Description",
                status: "Status",
                optional: "optional",
            },
            validation: {
                categoryNameRequired: "Enter the category name.",
            },
            createSubmit: "Create category",
            createSubmitting: "Creating category...",
            createSuccess: "Category created successfully.",
            createErrorFallback: "We could not create the category.",
            viewDetails: "View details",
            detailEyebrow: "Category detail",
            edit: "Edit",
            editFormAriaLabel: "Edit category",
            updateSubmit: "Save changes",
            updateSubmitting: "Saving...",
            cancelEdit: "Cancel",
            editSuccess: "Category updated successfully.",
            editErrorFallback: "We could not update the category.",
            newCategory: "New category",
            deactivateConfirm:
                "Do you want to deactivate this category? You can reactivate it later.",
            deactivateHint:
                "Deactivate the category if you no longer want to use it for new movements.",
            reactivateHint:
                "Reactivate the category to make it available again.",
            deactivateSubmit: "Deactivate category",
            reactivateSubmit: "Reactivate category",
            statusSubmitting: "Updating...",
            deactivateSuccess: "Category deactivated successfully.",
            reactivateSuccess: "Category reactivated successfully.",
            deactivateErrorFallback: "We could not deactivate the category.",
            reactivateErrorFallback: "We could not reactivate the category.",
        },
        buckets: {
            eyebrow: "Liquidity allocation",
            title: "Buckets",
            subtitle:
                "Separate available liquidity from money allocated to specific goals or constraints.",
            loading: "Loading buckets...",
            loadErrorTitle: "Unable to load buckets.",
            loadErrorFallback: "Please try again in a moment.",
            listEyebrow: "Available buckets",
            listTitle: "Your buckets",
            bucketsCount: "{{count}} buckets",
            emptyState:
                "You have not created any buckets yet. Add your first bucket to allocate part of your liquidity.",
            unnamedBucket: "Unnamed bucket",
            table: {
                name: "Name",
                accounts: "Accounts",
                status: "Status",
            },
            status: {
                active: "Active",
                closed: "Closed",
            },
            linkedAccountsCount: "{{count}} linked accounts",
            accountFallback: "Account unavailable",
            formEyebrow: "New bucket",
            formTitle: "Add bucket",
            formIntro:
                "Create a bucket to represent a planned allocation of liquidity.",
            fields: {
                bucketName: "Bucket name",
                description: "Description",
                accounts: "Linked accounts",
                status: "Status",
                optional: "optional",
            },
            validation: {
                bucketNameRequired: "Enter the bucket name.",
            },
            noAccountsHint:
                "There are no accounts available. You can link them after creating them.",
            createSubmit: "Create bucket",
            createSubmitting: "Creating bucket...",
            createSuccess: "Bucket created successfully.",
            createErrorFallback: "We could not create the bucket.",
            viewDetails: "View details",
            detailLoading: "Loading bucket detail...",
            detailErrorFallback: "We could not load the bucket detail.",
            detailEyebrow: "Bucket detail",
            edit: "Edit",
            editFormAriaLabel: "Edit bucket",
            updateSubmit: "Save changes",
            updateSubmitting: "Saving...",
            cancelEdit: "Cancel",
            editSuccess: "Bucket updated successfully.",
            editErrorFallback: "We could not update the bucket.",
            newBucket: "New bucket",
            noLinkedAccounts: "No linked accounts",
            linkedAccountsTitle: "Linked accounts",
            linkedAccountsHint:
                "Link or unlink the accounts that feed this bucket.",
            linkAccount: "Link {{accountName}}",
            unlinkAccount: "Unlink {{accountName}}",
            linkAccountSuccess: "Account linked successfully.",
            unlinkAccountSuccess: "Account unlinked successfully.",
            linkAccountErrorFallback:
                "We could not link the account to the bucket.",
            unlinkAccountErrorFallback:
                "We could not unlink the account from the bucket.",
            closeConfirm:
                "Do you want to close this bucket? You can reopen it later.",
            closeHint:
                "Close the bucket if you no longer want to use it for new planning.",
            reopenHint: "Reopen the bucket to make it available again.",
            closeSubmit: "Close bucket",
            reopenSubmit: "Reopen bucket",
            statusSubmitting: "Updating...",
            closeSuccess: "Bucket closed successfully.",
            reopenSuccess: "Bucket reopened successfully.",
            closeErrorFallback: "We could not close the bucket.",
            reopenErrorFallback: "We could not reopen the bucket.",
        },
        transactionForms: {
            fields: {
                description: "Description",
                amount: "Amount",
                chargeDate: "Charge date",
                category: "Category",
                account: "Account",
                creditCard: "Card",
                bucket: "Bucket",
                confirmed: "Transaction already confirmed",
                reminderEnabled: "Enable reminder",
                reminderDaysBefore: "Reminder days before",
                optional: "optional",
            },
            placeholders: {
                amount: "E.g. 250.50",
            },
            options: {
                selectCategory: "Select category",
                selectAccount: "Select account",
                noCreditCard: "No card",
                noBucket: "No bucket",
                unnamedBucket: "Unnamed bucket",
            },
            actions: {
                submit: "Save transaction",
                submitting: "Saving...",
                cancel: "Cancel",
                newCategory: "New",
                newAccount: "New",
                newCreditCard: "New",
                newBucket: "New",
            },
            validation: {
                descriptionRequired: "Enter the transaction description.",
                amountInvalid: "Enter a valid amount.",
                chargeDateRequired: "Enter the charge date.",
                categoryRequired: "Select a category.",
                accountRequired: "Select an account.",
                reminderDaysInvalid: "Enter a valid number of reminder days.",
            },
            bucketAmountSignHint:
                "With a linked bucket, use + to transfer money to the bucket and - to pay using the bucket.",
            twoMovementsHint:
                "This transaction will generate 2 movements: one linked to the bucket and one linked to the credit card.",
            recurring: {
                fields: {
                    description: "Description",
                    paymentAmount: "Payment amount",
                    amountIsAdjustable:
                        "Could you change this amount if you wanted?",
                    firstPaymentDate: "First payment date",
                    recurrenceInterval: "Every",
                    recurrenceUnit: "Recurrence unit",
                    paymentDateAdjustmentPolicy: "Non-business day handling",
                    category: "Category",
                    financialPriority: "Financial priority",
                    account: "Linked account",
                    creditCard: "Linked card",
                    bucket: "Linked bucket",
                    endDate: "End date",
                    finalPaymentAmount: "Final payment amount",
                    reminderEnabled: "Enable reminder",
                    reminderDaysBefore: "Reminder days before",
                },
                placeholders: {
                    amount: "E.g. 250.50",
                },
                options: {
                    selectCategory: "Select category",
                    selectFinancialPriority: "Select priority",
                    selectAccount: "Select account",
                    noCreditCard: "No card",
                    noBucket: "No bucket",
                    unnamedBucket: "Unnamed bucket",
                },
                recurrenceUnits: {
                    singular: {
                        day: "Day",
                        week: "Week",
                        month: "Month",
                        year: "Year",
                    },
                    plural: {
                        day: "Days",
                        week: "Weeks",
                        month: "Months",
                        year: "Years",
                    },
                },
                paymentDatePolicies: {
                    none: "No adjustment",
                    previous: "Previous business day",
                    next: "Next business day",
                },
                actions: {
                    submit: "Save recurring transaction",
                    submitting: "Saving...",
                },
                validation: {
                    descriptionRequired:
                        "Enter the recurring transaction description.",
                    paymentAmountInvalid: "Enter a valid payment amount.",
                    firstPaymentDateRequired: "Enter the first payment date.",
                    recurrenceIntervalInvalid:
                        "Enter a valid recurrence interval.",
                    categoryRequired: "Select a category.",
                    financialPriorityRequired: "Select a financial priority.",
                    accountRequired: "Select a linked account.",
                    finalPaymentAmountInvalid:
                        "Enter a valid final payment amount.",
                    reminderDaysInvalid:
                        "Enter a valid number of reminder days.",
                },
                bucketAmountSignHint:
                    "With a linked bucket, use + to transfer money to the bucket and - to pay using the bucket.",
                twoMovementsHint:
                    "This recurring transaction will generate 2 movements: one linked to the bucket and one linked to the credit card.",
            },
        },
        referenceModals: {
            common: {
                cancel: "Cancel",
                close: "Close",
                optional: "optional",
            },
            category: {
                eyebrow: "New item",
                title: "New category",
                intro: "Create a category without leaving the transaction form.",
                fields: {
                    name: "Category name",
                    description: "Description",
                },
                validation: {
                    nameRequired: "Enter the category name.",
                },
                submit: "Create category",
                submitting: "Creating...",
                createErrorFallback: "We could not create the category.",
            },
            account: {
                eyebrow: "New item",
                title: "New account",
                intro: "Create an account without leaving the transaction form.",
                fields: {
                    name: "Account name",
                    description: "Description",
                    currency: "Currency",
                    issuingInstitution: "Issuing institution",
                    openingBalance: "Opening balance",
                    openingBalanceDate: "Opening balance date",
                },
                placeholders: {
                    openingBalance: "E.g. 0 or 1,250.50",
                },
                validation: {
                    nameRequired: "Enter the account name.",
                    currencyInvalid: "Select a valid currency.",
                    openingBalanceInvalid: "Enter a valid opening balance.",
                    openingBalanceDateRequired:
                        "Enter the opening balance date.",
                },
                submit: "Create account",
                submitting: "Creating...",
                createErrorFallback: "We could not create the account.",
            },
            creditCard: {
                eyebrow: "New item",
                title: "New card",
                intro: "Create a card without leaving the transaction form.",
                fields: {
                    name: "Card name",
                    description: "Description",
                    chargeDay: "Charge day",
                    account: "Linked account",
                },
                options: {
                    selectAccount: "Select account",
                },
                validation: {
                    nameRequired: "Enter the card name.",
                    chargeDayInvalid:
                        "Enter a valid charge day between 1 and 31.",
                    accountRequired: "Select the account linked to the card.",
                },
                submit: "Create card",
                submitting: "Creating...",
                createErrorFallback: "We could not create the card.",
            },
            bucket: {
                eyebrow: "New item",
                title: "New bucket",
                intro: "Create a bucket without leaving the transaction form.",
                fields: {
                    name: "Bucket name",
                    description: "Description",
                    accounts: "Linked accounts",
                },
                validation: {
                    nameRequired: "Enter the bucket name.",
                },
                noAccountsHint:
                    "There are no accounts available. You can link them after creating them.",
                submit: "Create bucket",
                submitting: "Creating...",
                createErrorFallback: "We could not create the bucket.",
            },
        },
        simulations: {
            eyebrow: "Scenarios",
            title: "Simulations",
            subtitle:
                "Create alternative scenarios to evaluate decisions and compare their impact on your SerenityLine.",
            loading: "Loading simulations...",
            loadErrorTitle: "Unable to load simulations.",
            loadErrorFallback: "Please try again in a moment.",
            createTitle: "New simulation",
            createSubtitle:
                "Choose a name and link the accounts that can be used in this scenario.",
            noAccounts:
                "Create at least one account before configuring a simulation.",
            optional: "optional",
            createSuccess: "Simulation created successfully.",
            createErrorFallback:
                "We could not create the simulation. Please try again in a moment.",
            listTitle: "Available scenarios",
            listSubtitle:
                "Active simulations will be able to contain simulated movements and recurring transactions.",
            count: "{{count}} simulations",
            emptyState:
                "You have not created any simulations yet. Create your first scenario to compare future decisions.",
            updateSuccess: "Simulation updated successfully.",
            updateErrorFallback:
                "We could not update the simulation. Please try again in a moment.",
            archiveSuccess: "Simulation archived successfully.",
            archiveErrorFallback:
                "We could not archive the simulation. Please try again in a moment.",
            restoreSuccess: "Simulation restored successfully.",
            restoreErrorFallback:
                "We could not restore the simulation. Please try again in a moment.",
            accountLinkSuccess: "Account linked to the simulation.",
            accountLinkErrorFallback:
                "We could not link the account. Please try again in a moment.",
            accountUnlinkSuccess: "Account unlinked from the simulation.",
            accountUnlinkErrorFallback:
                "We could not unlink the account. Please try again in a moment.",
            transactionCreateSuccess:
                "Simulated movement created successfully.",
            transactionCreateErrorFallback:
                "We could not create the simulated movement. Please try again in a moment.",
            recurringTransactionCreateSuccess:
                "Simulated recurring movement created successfully.",
            recurringTransactionCreateErrorFallback:
                "We could not create the simulated recurring movement. Please try again in a moment.",
            transactionUpdateSuccess:
                "Simulated transaction updated successfully.",
            transactionUpdateErrorFallback:
                "We could not update the simulated transaction. Please try again in a moment.",
            recurringTransactionUpdateSuccess:
                "Simulated recurring movement updated successfully.",
            recurringTransactionUpdateErrorFallback:
                "We could not update the simulated recurring movement. Please try again in a moment.",
            recurringTransactionEditForm: {
                title: "Edit simulated recurring movement",
                subtitle: "Update the selected simulated recurring movement.",
                submit: "Save changes",
                submitting: "Saving changes...",
            },
            movementEdit: {
                singleRequestRequired:
                    "This edit would generate multiple technical movements. For now, edit card and bucket movements separately.",
            },
            transactionEditForm: {
                title: "Edit simulated transaction",
                subtitle: "Update the selected simulated movement.",
                submit: "Save changes",
                submitting: "Saving changes...",
            },
            transactionForm: {
                title: "New simulated movement",
                subtitle:
                    "The movement will be added to the “{{name}}” scenario.",
                submit: "Save simulated movement",
                submitting: "Saving movement...",
            },
            recurringTransactionForm: {
                title: "New simulated recurring movement",
                subtitle:
                    "The recurring movement will be added to the “{{name}}” scenario.",
                submit: "Save simulated recurring movement",
                submitting: "Saving recurring movement...",
            },
            movements: {
                title: "Linked movements",
                subtitle:
                    "Simulated movements linked to the “{{name}}” scenario.",
                loading: "Loading movements...",
                empty: "There are no movements linked to this scenario yet.",
                loadErrorFallback:
                    "We could not load linked movements. Please try again in a moment.",
                recurringTitle: "Recurring movements",
                transactionsTitle: "Transactions",
                recurringFrequency: "Every {{interval}} {{unit}}",
                recurrenceUnits: {
                    DAY: {
                        singular: "Daily",
                        plural: "days",
                    },
                    WEEK: {
                        singular: "Weekly",
                        plural: "weeks",
                    },
                    MONTH: {
                        singular: "Monthly",
                        plural: "months",
                    },
                    YEAR: {
                        singular: "Yearly",
                        plural: "years",
                    },
                },
            },
            fields: {
                name: "Simulation name",
                description: "Description",
                accounts: "Linked accounts",
            },
            actions: {
                create: "Create simulation",
                creating: "Creating...",
                edit: "Edit",
                save: "Save",
                saving: "Saving...",
                cancel: "Cancel",
                archive: "Archive",
                archiving: "Archiving...",
                restore: "Restore",
                restoring: "Restoring...",
                manageAccounts: "Manage accounts",
                done: "Done",
                addTransaction: "Add movement",
                addRecurringTransaction: "Add recurring movement",
                showMovements: "View linked movements",
                hideMovements: "Hide linked movements",
            },
            validation: {
                nameRequired: "Enter a simulation name.",
                accountRequired: "Select at least one account.",
            },
            table: {
                name: "Name",
                accounts: "Linked accounts",
                status: "Status",
                actions: "Actions",
            },
            status: {
                active: "Active",
                archived: "Archived",
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
            creditCards: {
                title: "Cards",
                subtitle: "Which cards feed my projection?",
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

import { Fragment, type ComponentProps, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    archiveSimulationGroup,
    createRecurringTransaction,
    createSimulationGroup,
    createTransaction,
    linkSimulationGroupAccount,
    listRecurringTransactions,
    listTransactions,
    restoreSimulationGroup,
    unlinkSimulationGroupAccount,
    updateSimulationGroup,
    updateTransaction,
    patchRecurringTransaction,
} from "../../features/finance/api/financeApi";
import type {
    AccountResponseDto,
    RecurrenceUnit,
    RecurringTransactionCreateRequestDto,
    RecurringTransactionResponseDto,
    SimulationGroupCreateRequestDto,
    SimulationGroupResponseDto,
    SimulationGroupUpdateRequestDto,
    TransactionCreateRequestDto,
    TransactionResponseDto,
    TransactionUpdateRequestDto,
    RecurringTransactionPatchRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectBuckets,
    selectCategories,
    selectCreditCards,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectFinancialPriorities,
    selectSimulationGroups,
} from "../../features/finance/financeDataSelectors";
import {
    simulationGroupAdded,
    simulationGroupUpdated,
} from "../../features/finance/financeDataSlice";
import { clearFinanceCalendarCache } from "../../features/finance/calendar/useFinanceCalendarCache";
import { financeDailyBalancesCleared } from "../../features/finance/dailyBalances/financeDailyBalancesSlice";
import { ApiError } from "../../shared/api";
import {
    TransactionForm,
    type TransactionFormState,
} from "../../features/finance/transactionForms/TransactionForm";
import {
    RecurringTransactionForm,
    type RecurringTransactionFormState,
    type RecurringTransactionFormSubmitMeta,
} from "../../features/finance/transactionForms/RecurringTransactionForm";
import {
    formatMoneyAmountForDisplay,
    moneyAmountToFormValue,
} from "../../features/finance/transactionForms/moneyInput";
import { getTodayIsoDate } from "../../features/finance/dailyBalances/financeDailyBalancesTypes";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type SimulationGroupFormState = {
    simulationGroupName: string;
    simulationGroupDescription: string;
    accountIds: string[];
};

type SimulationGroupMovementsState = {
    status: "idle" | "loading" | "loaded" | "failed";
    transactions: TransactionResponseDto[];
    recurringTransactions: RecurringTransactionResponseDto[];
    error: string | null;
};

const initialFormState: SimulationGroupFormState = {
    simulationGroupName: "",
    simulationGroupDescription: "",
    accountIds: [],
};

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        if (
            typeof error.body === "object" &&
            error.body !== null &&
            "message" in error.body &&
            typeof error.body.message === "string"
        ) {
            return error.body.message;
        }

        return error.message || fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

function isSimulationGroupArchived(
    simulationGroup: SimulationGroupResponseDto,
) {
    return simulationGroup.simulationGroupArchivedAt !== null;
}

function getLinkedAccounts(
    simulationGroup: SimulationGroupResponseDto,
    accounts: AccountResponseDto[],
) {
    return simulationGroup.accountIds
        .map((accountId) =>
            accounts.find((account) => account.accountId === accountId),
        )
        .filter(
            (account): account is AccountResponseDto => account !== undefined,
        );
}

export function SimulationsPage() {
    const { i18n, t } = useTranslation("simulations");
    const dispatch = useAppDispatch();

    const accounts = useAppSelector(selectAccounts);
    const simulationGroups = useAppSelector(selectSimulationGroups);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] =
        useState<SimulationGroupFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingSimulationGroupId, setEditingSimulationGroupId] = useState<
        string | null
    >(null);
    const [editForm, setEditForm] = useState({
        simulationGroupName: "",
        simulationGroupDescription: "",
    });
    const [editError, setEditError] = useState<string | null>(null);
    const [updatingSimulationGroupId, setUpdatingSimulationGroupId] = useState<
        string | null
    >(null);
    const [
        statusChangingSimulationGroupId,
        setStatusChangingSimulationGroupId,
    ] = useState<string | null>(null);
    const [
        transactionFormSimulationGroupId,
        setTransactionFormSimulationGroupId,
    ] = useState<string | null>(null);
    const [
        transactionSubmittingSimulationGroupId,
        setTransactionSubmittingSimulationGroupId,
    ] = useState<string | null>(null);
    const [transactionFormError, setTransactionFormError] = useState<
        string | null
    >(null);
    const [
        recurringTransactionFormSimulationGroupId,
        setRecurringTransactionFormSimulationGroupId,
    ] = useState<string | null>(null);

    const [
        recurringTransactionSubmittingSimulationGroupId,
        setRecurringTransactionSubmittingSimulationGroupId,
    ] = useState<string | null>(null);

    const [recurringTransactionFormError, setRecurringTransactionFormError] =
        useState<string | null>(null);

    const [movementsSimulationGroupId, setMovementsSimulationGroupId] =
        useState<string | null>(null);

    const [movementsBySimulationGroupId, setMovementsBySimulationGroupId] =
        useState<Record<string, SimulationGroupMovementsState>>({});

    const [editingTransactionId, setEditingTransactionId] = useState<
        string | null
    >(null);

    const [transactionUpdateSubmittingId, setTransactionUpdateSubmittingId] =
        useState<string | null>(null);

    const [transactionUpdateError, setTransactionUpdateError] = useState<
        string | null
    >(null);

    const [editingRecurringTransactionId, setEditingRecurringTransactionId] =
        useState<string | null>(null);

    const [
        recurringTransactionUpdateSubmittingId,
        setRecurringTransactionUpdateSubmittingId,
    ] = useState<string | null>(null);

    const [
        recurringTransactionUpdateError,
        setRecurringTransactionUpdateError,
    ] = useState<string | null>(null);

    const creditCards = useAppSelector(selectCreditCards);
    const categories = useAppSelector(selectCategories);
    const buckets = useAppSelector(selectBuckets);
    const financialPriorities = useAppSelector(selectFinancialPriorities);

    const sortedSimulationGroups = useMemo(
        () =>
            [...simulationGroups].sort((first, second) => {
                const firstArchived = isSimulationGroupArchived(first);
                const secondArchived = isSimulationGroupArchived(second);

                if (firstArchived !== secondArchived) {
                    return firstArchived ? 1 : -1;
                }

                return first.simulationGroupName.localeCompare(
                    second.simulationGroupName,
                );
            }),
        [simulationGroups],
    );

    const [
        managingAccountsSimulationGroupId,
        setManagingAccountsSimulationGroupId,
    ] = useState<string | null>(null);
    const [accountChangingKey, setAccountChangingKey] = useState<string | null>(
        null,
    );

    function deriveDayOfUnit(date: string, recurrenceUnit: RecurrenceUnit) {
        const [year, month, day] = date.split("-").map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day));

        if (recurrenceUnit === "DAY") {
            return 1;
        }

        if (recurrenceUnit === "WEEK") {
            const dayOfWeek = utcDate.getUTCDay();

            return dayOfWeek === 0 ? 7 : dayOfWeek;
        }

        if (recurrenceUnit === "MONTH") {
            return day;
        }

        const startOfYear = new Date(Date.UTC(year, 0, 1));

        return (
            Math.floor(
                (utcDate.getTime() - startOfYear.getTime()) /
                    (24 * 60 * 60 * 1000),
            ) + 1
        );
    }

    function invalidateFinanceProjectionCaches() {
        clearFinanceCalendarCache();
        dispatch(financeDailyBalancesCleared());
    }

    function getRecurringTransactionInitialValues(
        recurringTransaction: RecurringTransactionResponseDto,
    ): Partial<RecurringTransactionFormState> {
        return {
            recurringTransactionDescription:
                recurringTransaction.recurringTransactionDescription,
            paymentAmount: moneyAmountToFormValue(
                recurringTransaction.paymentAmount,
                displayLanguage,
            ),
            recurringTransactionAmountIsAdjustable:
                recurringTransaction.recurringTransactionAmountIsAdjustable,
            recurringTransactionFirstPaymentDate:
                recurringTransaction.recurringTransactionFirstPaymentDate,
            recurrenceInterval: String(recurringTransaction.recurrenceInterval),
            recurrenceUnit: recurringTransaction.recurrenceUnit,
            paymentDateAdjustmentPolicy:
                recurringTransaction.paymentDateAdjustmentPolicy,
            recurringTransactionEndDate:
                recurringTransaction.recurringTransactionEndDate ?? "",
            finalPaymentAmount: moneyAmountToFormValue(
                recurringTransaction.finalPaymentAmount,
                displayLanguage,
            ),
            categoryId: recurringTransaction.categoryId,
            financialPriorityId: recurringTransaction.financialPriorityId,
            linkedAccountId: recurringTransaction.linkedAccountId,
            linkedCreditCardId: recurringTransaction.linkedCreditCardId ?? "",
            linkedBucketId: recurringTransaction.linkedBucketId ?? "",
            recurringTransactionReminderEnabled:
                recurringTransaction.recurringTransactionReminderEnabled,
            recurringTransactionReminderDaysBefore: String(
                recurringTransaction.recurringTransactionReminderDaysBefore,
            ),
        };
    }

    function startEditingRecurringTransaction(
        recurringTransaction: RecurringTransactionResponseDto,
    ) {
        setEditingRecurringTransactionId(
            recurringTransaction.recurringTransactionId,
        );
        setRecurringTransactionUpdateError(null);
        setSuccessMessage(null);
    }

    function cancelEditingRecurringTransaction() {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
    }

    async function handleUpdateSimulationRecurringTransaction(
        recurringTransaction: RecurringTransactionResponseDto,
        requests: RecurringTransactionCreateRequestDto[],
        meta?: RecurringTransactionFormSubmitMeta,
    ) {
        if (requests.length !== 1) {
            setRecurringTransactionUpdateError(
                t("movementEdit.singleRequestRequired"),
            );
            return;
        }

        if (!meta) {
            setRecurringTransactionUpdateError(t("movementEdit.errorFallback"));
            return;
        }

        const request = requests[0];

        const effectiveFrom =
            meta.editScope === "FULL_SERIES"
                ? request.recurringTransactionFirstPaymentDate
                : meta.editScope === "FROM_TODAY"
                  ? getTodayIsoDate()
                  : meta.editEffectiveFrom;

        const cadenceAnchorDate = request.recurringTransactionFirstPaymentDate;

        const patchRequest: RecurringTransactionPatchRequestDto = {
            ...(meta.editScope === "FULL_SERIES"
                ? {
                      recurringTransactionFirstPaymentDate:
                          request.recurringTransactionFirstPaymentDate,
                  }
                : {}),
            recurringTransactionAmountIsAdjustable:
                request.recurringTransactionAmountIsAdjustable ?? false,
            recurringTransactionIsSimulated: true,
            simulationGroupId: recurringTransaction.simulationGroupId,
            recurringTransactionReminderEnabled: false,
            recurringTransactionReminderDaysBefore: 7,
            rule: {
                effectiveFrom,
                dayOfUnit: deriveDayOfUnit(
                    cadenceAnchorDate,
                    request.recurrenceUnit,
                ),
                paymentAmount: request.paymentAmount,
                recurrenceInterval: request.recurrenceInterval,
                recurrenceUnit: request.recurrenceUnit,
                paymentDateAdjustmentPolicy:
                    request.paymentDateAdjustmentPolicy ?? "NONE",
                recurringTransactionEndDate:
                    request.recurringTransactionEndDate ?? null,
                finalPaymentAmount: request.finalPaymentAmount ?? null,
            },
            details: {
                effectiveFrom,
                recurringTransactionDescription:
                    request.recurringTransactionDescription,
                categoryId: request.categoryId,
                financialPriorityId: request.financialPriorityId,
                linkedAccountId: request.linkedAccountId,
                linkedCreditCardId: request.linkedCreditCardId ?? null,
                linkedBucketId: request.linkedBucketId ?? null,
                recurringTransactionAffectsAccountBalance:
                    request.recurringTransactionAffectsAccountBalance ??
                    recurringTransaction.recurringTransactionAffectsAccountBalance,
                recurringtransactionAffectsSerenityline:
                    request.recurringtransactionAffectsSerenityline ??
                    recurringTransaction.recurringtransactionAffectsSerenityline,
            },
        };

        setRecurringTransactionUpdateSubmittingId(
            recurringTransaction.recurringTransactionId,
        );
        setRecurringTransactionUpdateError(null);
        setSuccessMessage(null);

        try {
            const updatedRecurringTransaction = await patchRecurringTransaction(
                recurringTransaction.recurringTransactionId,
                patchRequest,
            );

            if (recurringTransaction.simulationGroupId) {
                setMovementsBySimulationGroupId((currentState) => {
                    const currentMovements =
                        currentState[recurringTransaction.simulationGroupId!];

                    if (!currentMovements) {
                        return currentState;
                    }

                    return {
                        ...currentState,
                        [recurringTransaction.simulationGroupId!]: {
                            ...currentMovements,
                            recurringTransactions:
                                currentMovements.recurringTransactions.map(
                                    (currentRecurringTransaction) =>
                                        currentRecurringTransaction.recurringTransactionId ===
                                        updatedRecurringTransaction.recurringTransactionId
                                            ? updatedRecurringTransaction
                                            : currentRecurringTransaction,
                                ),
                        },
                    };
                });
            }

            invalidateFinanceProjectionCaches();

            setEditingRecurringTransactionId(null);
            setSuccessMessage(t("recurringTransactionUpdateSuccess"));
        } catch (error) {
            setRecurringTransactionUpdateError(
                getErrorMessage(
                    error,
                    t("recurringTransactionUpdateErrorFallback"),
                ),
            );
        } finally {
            setRecurringTransactionUpdateSubmittingId(null);
        }
    }

    function getTransactionInitialValues(
        transaction: TransactionResponseDto,
    ): Partial<TransactionFormState> {
        return {
            transactionDescription: transaction.transactionDescription,
            transactionAmount: moneyAmountToFormValue(
                transaction.transactionAmount,
                displayLanguage,
            ),
            transactionChargeDate: transaction.transactionChargeDate,
            categoryId: transaction.categoryId,
            accountId: transaction.accountId,
            creditCardId: transaction.creditCardId ?? "",
            bucketId: transaction.bucketId ?? "",
            transactionIsConfirmed: transaction.transactionIsConfirmed,
            transactionReminderEnabled: transaction.transactionReminderEnabled,
            transactionReminderDaysBefore: String(
                transaction.transactionReminderDaysBefore,
            ),
        };
    }

    const displayLanguage = i18n.resolvedLanguage ?? i18n.language;

    function getIsoDateFromDateTime(dateTime: string) {
        return dateTime.split("T")[0];
    }

    function addYearsToIsoDate(date: string, years: number) {
        const [year, month, day] = date.split("-").map(Number);

        const targetDate = new Date(Date.UTC(year + years, month - 1, day));

        return targetDate.toISOString().split("T")[0];
    }

    function getAccountCurrency(accountId: string) {
        return (
            accounts.find((account) => account.accountId === accountId)
                ?.currency ?? null
        );
    }

    function formatMovementMoneyAmount(amount: number, accountId: string) {
        const currency = getAccountCurrency(accountId);

        if (!currency) {
            return String(amount);
        }

        return formatMoneyAmountForDisplay(amount, displayLanguage, currency);
    }

    function formatIsoDateForDisplay(date: string) {
        const [year, month, day] = date.split("-").map(Number);

        return new Intl.DateTimeFormat(displayLanguage || undefined).format(
            new Date(year, month - 1, day),
        );
    }

    function formatRecurrenceFrequency(interval: number, unit: RecurrenceUnit) {
        if (interval === 1) {
            return t(`movements.recurrenceUnits.${unit}.singular`);
        }

        return t("movements.recurringFrequency", {
            interval,
            unit: t(`movements.recurrenceUnits.${unit}.plural`),
        });
    }

    function getAccountName(accountId: string) {
        return (
            accounts.find((account) => account.accountId === accountId)
                ?.accountName ?? "—"
        );
    }

    function getCategoryName(categoryId: string) {
        return (
            categories.find((category) => category.categoryId === categoryId)
                ?.categoryName ?? "—"
        );
    }

    function getCreditCardName(creditCardId: string | null) {
        if (!creditCardId) {
            return null;
        }

        return (
            creditCards.find(
                (creditCard) => creditCard.creditCardId === creditCardId,
            )?.creditCardName ?? "—"
        );
    }

    function getBucketName(bucketId: string | null) {
        if (!bucketId) {
            return null;
        }

        return (
            buckets.find((bucket) => bucket.bucketId === bucketId)
                ?.bucketName ?? "—"
        );
    }

    function getFinancialPriorityName(financialPriorityId: string) {
        return (
            financialPriorities.find(
                (financialPriority) =>
                    financialPriority.financialPriorityId ===
                    financialPriorityId,
            )?.financialPriorityDisplayName ?? "—"
        );
    }

    function updateField(
        field: keyof Omit<SimulationGroupFormState, "accountIds">,
        value: string,
    ) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    function toggleAccount(accountId: string) {
        setForm((currentForm) => {
            const isSelected = currentForm.accountIds.includes(accountId);

            return {
                ...currentForm,
                accountIds: isSelected
                    ? currentForm.accountIds.filter((id) => id !== accountId)
                    : [...currentForm.accountIds, accountId],
            };
        });
        setFormError(null);
        setSuccessMessage(null);
    }

    function startEditingSimulationGroup(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
        setMovementsSimulationGroupId(null);
        setTransactionFormError(null);
        setRecurringTransactionFormError(null);
        setManagingAccountsSimulationGroupId(null);
        setTransactionFormSimulationGroupId(null);
        setRecurringTransactionFormSimulationGroupId(null);
        setEditingSimulationGroupId(simulationGroup.simulationGroupId);
        setEditForm({
            simulationGroupName: simulationGroup.simulationGroupName,
            simulationGroupDescription:
                simulationGroup.simulationGroupDescription ?? "",
        });
        setEditError(null);
        setSuccessMessage(null);
    }

    function cancelEditingSimulationGroup() {
        setEditingSimulationGroupId(null);
        setEditForm({
            simulationGroupName: "",
            simulationGroupDescription: "",
        });
        setEditError(null);
    }

    function startManagingSimulationGroupAccounts(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
        setMovementsSimulationGroupId(null);
        setTransactionFormError(null);
        setRecurringTransactionFormError(null);
        setTransactionFormSimulationGroupId(null);
        setRecurringTransactionFormSimulationGroupId(null);
        setEditingSimulationGroupId(null);
        setManagingAccountsSimulationGroupId(simulationGroup.simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);
    }

    function stopManagingSimulationGroupAccounts() {
        setManagingAccountsSimulationGroupId(null);
        setEditError(null);
    }

    function updateEditField(field: keyof typeof editForm, value: string) {
        setEditForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setEditError(null);
        setSuccessMessage(null);
    }

    function startAddingTransaction(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
        setMovementsSimulationGroupId(null);
        setEditingSimulationGroupId(null);
        setManagingAccountsSimulationGroupId(null);
        setRecurringTransactionFormSimulationGroupId(null);
        setTransactionFormSimulationGroupId(simulationGroup.simulationGroupId);
        setTransactionFormError(null);
        setRecurringTransactionFormError(null);
        setEditError(null);
        setSuccessMessage(null);
    }

    function cancelAddingTransaction() {
        setTransactionFormSimulationGroupId(null);
        setTransactionFormError(null);
    }

    function startAddingRecurringTransaction(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
        setMovementsSimulationGroupId(null);
        setEditingSimulationGroupId(null);
        setManagingAccountsSimulationGroupId(null);
        setTransactionFormSimulationGroupId(null);
        setRecurringTransactionFormSimulationGroupId(
            simulationGroup.simulationGroupId,
        );
        setTransactionFormError(null);
        setRecurringTransactionFormError(null);
        setEditError(null);
        setSuccessMessage(null);
    }

    function cancelAddingRecurringTransaction() {
        setRecurringTransactionFormSimulationGroupId(null);
        setRecurringTransactionFormError(null);
    }

    async function handleToggleSimulationGroupMovements(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        const simulationGroupId = simulationGroup.simulationGroupId;
        const movementsFromDate = getIsoDateFromDateTime(
            simulationGroup.simulationGroupCreatedAt,
        );
        const movementsToDate = addYearsToIsoDate(movementsFromDate, 5);

        if (movementsSimulationGroupId === simulationGroupId) {
            setMovementsSimulationGroupId(null);
            return;
        }

        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
        setEditingSimulationGroupId(null);
        setManagingAccountsSimulationGroupId(null);
        setTransactionFormSimulationGroupId(null);
        setRecurringTransactionFormSimulationGroupId(null);
        setTransactionFormError(null);
        setRecurringTransactionFormError(null);
        setEditError(null);
        setSuccessMessage(null);
        setMovementsSimulationGroupId(simulationGroupId);

        setMovementsBySimulationGroupId((currentState) => ({
            ...currentState,
            [simulationGroupId]: {
                status: "loading",
                transactions:
                    currentState[simulationGroupId]?.transactions ?? [],
                recurringTransactions:
                    currentState[simulationGroupId]?.recurringTransactions ??
                    [],
                error: null,
            },
        }));

        try {
            const [recurringTransactions, transactions] = await Promise.all([
                listRecurringTransactions({
                    simulationGroupIds: [simulationGroupId],
                }),
                listTransactions({
                    from: movementsFromDate,
                    to: movementsToDate,
                    simulationGroupId,
                }),
            ]);

            const simulatedRecurringTransactions = recurringTransactions.filter(
                (recurringTransaction) =>
                    recurringTransaction.recurringTransactionIsSimulated ===
                        true &&
                    recurringTransaction.simulationGroupId ===
                        simulationGroupId,
            );

            const simulatedTransactions = transactions.filter(
                (transaction) =>
                    transaction.transactionIsSimulated === true &&
                    transaction.simulationGroupId === simulationGroupId,
            );

            setMovementsBySimulationGroupId((currentState) => ({
                ...currentState,
                [simulationGroupId]: {
                    status: "loaded",
                    recurringTransactions: simulatedRecurringTransactions,
                    transactions: simulatedTransactions,
                    error: null,
                },
            }));
        } catch (error) {
            setMovementsBySimulationGroupId((currentState) => ({
                ...currentState,
                [simulationGroupId]: {
                    status: "failed",
                    recurringTransactions: [],
                    transactions: [],
                    error: getErrorMessage(
                        error,
                        t("movements.loadErrorFallback"),
                    ),
                },
            }));
        }
    }

    async function handleCreateSimulationRecurringTransactions(
        simulationGroup: SimulationGroupResponseDto,
        requests: RecurringTransactionCreateRequestDto[],
    ) {
        if (simulationGroup.accountIds.length === 0) {
            setRecurringTransactionFormError(t("validation.accountRequired"));
            return;
        }

        setRecurringTransactionSubmittingSimulationGroupId(
            simulationGroup.simulationGroupId,
        );
        setRecurringTransactionFormError(null);
        setSuccessMessage(null);

        try {
            for (const request of requests) {
                await createRecurringTransaction(request);
            }

            invalidateFinanceProjectionCaches();

            setRecurringTransactionFormSimulationGroupId(null);
            setSuccessMessage(t("recurringTransactionCreateSuccess"));
        } catch (error) {
            setRecurringTransactionFormError(
                getErrorMessage(
                    error,
                    t("recurringTransactionCreateErrorFallback"),
                ),
            );
        } finally {
            setRecurringTransactionSubmittingSimulationGroupId(null);
        }
    }

    async function handleCreateSimulationTransactions(
        simulationGroup: SimulationGroupResponseDto,
        requests: TransactionCreateRequestDto[],
    ) {
        if (simulationGroup.accountIds.length === 0) {
            setTransactionFormError(t("validation.accountRequired"));
            return;
        }

        setTransactionSubmittingSimulationGroupId(
            simulationGroup.simulationGroupId,
        );
        setTransactionFormError(null);
        setSuccessMessage(null);

        try {
            for (const request of requests) {
                await createTransaction(request);
            }

            invalidateFinanceProjectionCaches();

            setTransactionFormSimulationGroupId(null);
            setSuccessMessage(t("transactionCreateSuccess"));
        } catch (error) {
            setTransactionFormError(
                getErrorMessage(error, t("transactionCreateErrorFallback")),
            );
        } finally {
            setTransactionSubmittingSimulationGroupId(null);
        }
    }

    function startEditingTransaction(transaction: TransactionResponseDto) {
        setEditingRecurringTransactionId(null);
        setRecurringTransactionUpdateError(null);
        setEditingTransactionId(transaction.transactionId);
        setTransactionUpdateError(null);
        setSuccessMessage(null);
    }

    function cancelEditingTransaction() {
        setEditingTransactionId(null);
        setTransactionUpdateError(null);
    }

    async function handleUpdateSimulationTransaction(
        transaction: TransactionResponseDto,
        requests: TransactionCreateRequestDto[],
    ) {
        if (requests.length !== 1) {
            setTransactionUpdateError(t("movementEdit.singleRequestRequired"));
            return;
        }

        const request = requests[0];

        const updateRequest: TransactionUpdateRequestDto = {
            transactionDescription: request.transactionDescription,
            transactionAmount: request.transactionAmount,
            transactionAffectsAccountBalance:
                request.transactionAffectsAccountBalance ??
                transaction.transactionAffectsAccountBalance,
            transactionAffectsSerenityline:
                request.transactionAffectsSerenityline ??
                transaction.transactionAffectsSerenityline,
            categoryId: request.categoryId,
            transactionChargeDate: request.transactionChargeDate,
            transactionIsConfirmed: false,
            accountId: request.accountId,
            creditCardId: request.creditCardId ?? null,
            bucketId: request.bucketId ?? null,
            transactionIsSimulated: true,
            simulationGroupId: transaction.simulationGroupId,
            transactionReminderEnabled: false,
            transactionReminderDaysBefore: 7,
        };

        setTransactionUpdateSubmittingId(transaction.transactionId);
        setTransactionUpdateError(null);
        setSuccessMessage(null);

        try {
            const updatedTransaction = await updateTransaction(
                transaction.transactionId,
                updateRequest,
            );

            if (transaction.simulationGroupId) {
                setMovementsBySimulationGroupId((currentState) => {
                    const currentMovements =
                        currentState[transaction.simulationGroupId!];

                    if (!currentMovements) {
                        return currentState;
                    }

                    return {
                        ...currentState,
                        [transaction.simulationGroupId!]: {
                            ...currentMovements,
                            transactions: currentMovements.transactions.map(
                                (currentTransaction) =>
                                    currentTransaction.transactionId ===
                                    updatedTransaction.transactionId
                                        ? updatedTransaction
                                        : currentTransaction,
                            ),
                        },
                    };
                });
            }

            invalidateFinanceProjectionCaches();

            setEditingTransactionId(null);
            setSuccessMessage(t("transactionUpdateSuccess"));
        } catch (error) {
            setTransactionUpdateError(
                getErrorMessage(error, t("transactionUpdateErrorFallback")),
            );
        } finally {
            setTransactionUpdateSubmittingId(null);
        }
    }

    async function handleUpdateSimulationGroup(simulationGroupId: string) {
        const simulationGroupName = editForm.simulationGroupName.trim();
        const simulationGroupDescription =
            editForm.simulationGroupDescription.trim();

        if (!simulationGroupName) {
            setEditError(t("validation.nameRequired"));
            return;
        }

        const request: SimulationGroupUpdateRequestDto = {
            simulationGroupName,
            simulationGroupDescription: simulationGroupDescription || null,
        };

        setUpdatingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const updatedSimulationGroup = await updateSimulationGroup(
                simulationGroupId,
                request,
            );

            dispatch(simulationGroupUpdated(updatedSimulationGroup));
            cancelEditingSimulationGroup();
            setSuccessMessage(t("updateSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("updateErrorFallback")));
        } finally {
            setUpdatingSimulationGroupId(null);
        }
    }

    async function handleCreateSimulationGroup(event: FormSubmitEvent) {
        event.preventDefault();

        const simulationGroupName = form.simulationGroupName.trim();
        const simulationGroupDescription =
            form.simulationGroupDescription.trim();

        if (!simulationGroupName) {
            setFormError(t("validation.nameRequired"));
            return;
        }

        if (form.accountIds.length === 0) {
            setFormError(t("validation.accountRequired"));
            return;
        }

        const request: SimulationGroupCreateRequestDto = {
            simulationGroupName,
            simulationGroupDescription: simulationGroupDescription || null,
            accountIds: form.accountIds,
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdSimulationGroup = await createSimulationGroup(request);

            dispatch(simulationGroupAdded(createdSimulationGroup));
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleArchiveSimulationGroup(simulationGroupId: string) {
        setStatusChangingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const archivedSimulationGroup =
                await archiveSimulationGroup(simulationGroupId);

            dispatch(simulationGroupUpdated(archivedSimulationGroup));

            setSuccessMessage(t("archiveSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("archiveErrorFallback")));
        } finally {
            setStatusChangingSimulationGroupId(null);
        }
    }

    async function handleRestoreSimulationGroup(simulationGroupId: string) {
        setStatusChangingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const restoredSimulationGroup =
                await restoreSimulationGroup(simulationGroupId);

            dispatch(simulationGroupUpdated(restoredSimulationGroup));

            setSuccessMessage(t("restoreSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("restoreErrorFallback")));
        } finally {
            setStatusChangingSimulationGroupId(null);
        }
    }

    async function handleToggleSimulationGroupAccount(
        simulationGroup: SimulationGroupResponseDto,
        accountId: string,
    ) {
        const isLinked = simulationGroup.accountIds.includes(accountId);

        if (isLinked && simulationGroup.accountIds.length <= 1) {
            setEditError(t("validation.accountRequired"));
            return;
        }

        const changingKey = `${simulationGroup.simulationGroupId}:${accountId}`;

        setAccountChangingKey(changingKey);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const updatedSimulationGroup = isLinked
                ? await unlinkSimulationGroupAccount(
                      simulationGroup.simulationGroupId,
                      accountId,
                  )
                : await linkSimulationGroupAccount(
                      simulationGroup.simulationGroupId,
                      accountId,
                  );

            dispatch(simulationGroupUpdated(updatedSimulationGroup));

            invalidateFinanceProjectionCaches();

            setSuccessMessage(
                isLinked ? t("accountUnlinkSuccess") : t("accountLinkSuccess"),
            );
        } catch (error) {
            setEditError(
                getErrorMessage(
                    error,
                    isLinked
                        ? t("accountUnlinkErrorFallback")
                        : t("accountLinkErrorFallback"),
                ),
            );
        } finally {
            setAccountChangingKey(null);
        }
    }

    if (financeDataStatus === "loading") {
        return (
            <section className="d-grid gap-3">
                <p className="text-muted mb-0">{t("loading")}</p>
            </section>
        );
    }

    if (financeDataStatus === "failed") {
        return (
            <section className="d-grid gap-3">
                <div className="alert alert-danger" role="alert">
                    <strong>{t("loadErrorTitle")}</strong>
                    <p className="mb-0">
                        {financeDataError?.message ?? t("loadErrorFallback")}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="d-grid gap-4">
            <header>
                <p className="text-uppercase text-muted small mb-1">
                    {t("eyebrow")}
                </p>
                <h1 className="h2 mb-2">{t("title")}</h1>
                <p className="text-muted mb-0">{t("subtitle")}</p>
            </header>

            <div className="card">
                <div className="card-body">
                    <h2 className="h5">{t("createTitle")}</h2>
                    <p className="text-muted">{t("createSubtitle")}</p>

                    {formError ? (
                        <div className="alert alert-danger" role="alert">
                            {formError}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="alert alert-success" role="status">
                            {successMessage}
                        </div>
                    ) : null}

                    {accounts.length === 0 ? (
                        <div className="alert alert-info mb-0" role="status">
                            {t("noAccounts")}
                        </div>
                    ) : (
                        <form
                            className="d-grid gap-3"
                            onSubmit={handleCreateSimulationGroup}>
                            <div>
                                <label
                                    className="form-label"
                                    htmlFor="simulationGroupName">
                                    {t("fields.name")}
                                </label>
                                <input
                                    className="form-control"
                                    id="simulationGroupName"
                                    onChange={(event) =>
                                        updateField(
                                            "simulationGroupName",
                                            event.target.value,
                                        )
                                    }
                                    type="text"
                                    value={form.simulationGroupName}
                                />
                            </div>

                            <div>
                                <label
                                    className="form-label"
                                    htmlFor="simulationGroupDescription">
                                    {t("fields.description")}{" "}
                                    <span className="text-muted">
                                        ({t("optional")})
                                    </span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="simulationGroupDescription"
                                    onChange={(event) =>
                                        updateField(
                                            "simulationGroupDescription",
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    value={form.simulationGroupDescription}
                                />
                            </div>

                            <fieldset>
                                <legend className="form-label">
                                    {t("fields.accounts")}
                                </legend>

                                <div className="d-grid gap-2">
                                    {accounts.map((account) => (
                                        <div
                                            className="form-check"
                                            key={account.accountId}>
                                            <input
                                                checked={form.accountIds.includes(
                                                    account.accountId,
                                                )}
                                                className="form-check-input"
                                                id={`simulation-account-${account.accountId}`}
                                                onChange={() =>
                                                    toggleAccount(
                                                        account.accountId,
                                                    )
                                                }
                                                type="checkbox"
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`simulation-account-${account.accountId}`}>
                                                {account.accountName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

                            <div>
                                <button
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    type="submit">
                                    {isSubmitting
                                        ? t("actions.creating")
                                        : t("actions.create")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                        <div>
                            <h2 className="h5 mb-1">{t("listTitle")}</h2>
                            <p className="text-muted mb-0">
                                {t("listSubtitle")}
                            </p>
                        </div>
                        <span className="badge text-bg-light">
                            {t("count", {
                                count: sortedSimulationGroups.length,
                            })}
                        </span>
                    </div>
                    {editError ? (
                        <div className="alert alert-danger" role="alert">
                            {editError}
                        </div>
                    ) : null}
                    {sortedSimulationGroups.length === 0 ? (
                        <p className="text-muted mb-0">{t("emptyState")}</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle sl-simulations-table">
                                <thead>
                                    <tr>
                                        <th scope="col">{t("table.name")}</th>
                                        <th scope="col">
                                            {t("table.accounts")}
                                        </th>
                                        <th scope="col">{t("table.status")}</th>
                                        <th
                                            className="sl-simulations-actions-heading"
                                            scope="col">
                                            {t("table.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSimulationGroups.map(
                                        (simulationGroup) => {
                                            const linkedAccounts =
                                                getLinkedAccounts(
                                                    simulationGroup,
                                                    accounts,
                                                );
                                            const isArchived =
                                                isSimulationGroupArchived(
                                                    simulationGroup,
                                                );

                                            const isEditing =
                                                editingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isUpdating =
                                                updatingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isManagingAccounts =
                                                managingAccountsSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isAddingTransaction =
                                                transactionFormSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isSubmittingTransaction =
                                                transactionSubmittingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isAddingRecurringTransaction =
                                                recurringTransactionFormSimulationGroupId ===
                                                simulationGroup.simulationGroupId;

                                            const isSubmittingRecurringTransaction =
                                                recurringTransactionSubmittingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;

                                            const isShowingMovements =
                                                movementsSimulationGroupId ===
                                                simulationGroup.simulationGroupId;

                                            const movementsState =
                                                movementsBySimulationGroupId[
                                                    simulationGroup
                                                        .simulationGroupId
                                                ];

                                            const simulationGroupActions =
                                                isEditing ? (
                                                    <div className="d-flex flex-wrap gap-2 sl-simulations-actions">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            onClick={() =>
                                                                handleUpdateSimulationGroup(
                                                                    simulationGroup.simulationGroupId,
                                                                )
                                                            }
                                                            type="button">
                                                            {isUpdating
                                                                ? t(
                                                                      "actions.saving",
                                                                  )
                                                                : t(
                                                                      "actions.save",
                                                                  )}
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            onClick={
                                                                cancelEditingSimulationGroup
                                                            }
                                                            type="button">
                                                            {t(
                                                                "actions.cancel",
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : isManagingAccounts ? (
                                                    <div className="sl-simulations-actions">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            disabled={
                                                                accountChangingKey !==
                                                                null
                                                            }
                                                            onClick={
                                                                stopManagingSimulationGroupAccounts
                                                            }
                                                            type="button">
                                                            {t("actions.done")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-wrap gap-2 sl-simulations-actions">
                                                        {!isArchived ? (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        startEditingSimulationGroup(
                                                                            simulationGroup,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {t(
                                                                        "actions.edit",
                                                                    )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        startManagingSimulationGroupAccounts(
                                                                            simulationGroup,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {t(
                                                                        "actions.manageAccounts",
                                                                    )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    disabled={
                                                                        statusChangingSimulationGroupId ===
                                                                        simulationGroup.simulationGroupId
                                                                    }
                                                                    onClick={() =>
                                                                        handleArchiveSimulationGroup(
                                                                            simulationGroup.simulationGroupId,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {statusChangingSimulationGroupId ===
                                                                    simulationGroup.simulationGroupId
                                                                        ? t(
                                                                              "actions.archiving",
                                                                          )
                                                                        : t(
                                                                              "actions.archive",
                                                                          )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        startAddingTransaction(
                                                                            simulationGroup,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {t(
                                                                        "actions.addTransaction",
                                                                    )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        startAddingRecurringTransaction(
                                                                            simulationGroup,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {t(
                                                                        "actions.addRecurringTransaction",
                                                                    )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        handleToggleSimulationGroupMovements(
                                                                            simulationGroup,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {isShowingMovements
                                                                        ? t(
                                                                              "actions.hideMovements",
                                                                          )
                                                                        : t(
                                                                              "actions.showMovements",
                                                                          )}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                disabled={
                                                                    statusChangingSimulationGroupId ===
                                                                    simulationGroup.simulationGroupId
                                                                }
                                                                onClick={() =>
                                                                    handleRestoreSimulationGroup(
                                                                        simulationGroup.simulationGroupId,
                                                                    )
                                                                }
                                                                type="button">
                                                                {statusChangingSimulationGroupId ===
                                                                simulationGroup.simulationGroupId
                                                                    ? t(
                                                                          "actions.restoring",
                                                                      )
                                                                    : t(
                                                                          "actions.restore",
                                                                      )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );

                                            return (
                                                <Fragment
                                                    key={
                                                        simulationGroup.simulationGroupId
                                                    }>
                                                    <tr>
                                                        <td>
                                                            {isEditing ? (
                                                                <div className="d-grid gap-2">
                                                                    <input
                                                                        aria-label={t(
                                                                            "fields.name",
                                                                        )}
                                                                        className="form-control"
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateEditField(
                                                                                "simulationGroupName",
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        type="text"
                                                                        value={
                                                                            editForm.simulationGroupName
                                                                        }
                                                                    />

                                                                    <textarea
                                                                        aria-label={t(
                                                                            "fields.description",
                                                                        )}
                                                                        className="form-control"
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateEditField(
                                                                                "simulationGroupDescription",
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        rows={2}
                                                                        value={
                                                                            editForm.simulationGroupDescription
                                                                        }
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <strong>
                                                                        {
                                                                            simulationGroup.simulationGroupName
                                                                        }
                                                                    </strong>
                                                                    {simulationGroup.simulationGroupDescription ? (
                                                                        <p className="text-muted mb-0">
                                                                            {
                                                                                simulationGroup.simulationGroupDescription
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {isManagingAccounts ? (
                                                                <fieldset className="mb-0">
                                                                    <legend className="visually-hidden">
                                                                        {t(
                                                                            "fields.accounts",
                                                                        )}
                                                                    </legend>

                                                                    <div className="d-grid gap-2">
                                                                        {accounts.map(
                                                                            (
                                                                                account,
                                                                            ) => {
                                                                                const checkboxId = `simulation-${simulationGroup.simulationGroupId}-account-${account.accountId}`;
                                                                                const isLinked =
                                                                                    simulationGroup.accountIds.includes(
                                                                                        account.accountId,
                                                                                    );

                                                                                return (
                                                                                    <div
                                                                                        className="form-check"
                                                                                        key={
                                                                                            account.accountId
                                                                                        }>
                                                                                        <input
                                                                                            checked={
                                                                                                isLinked
                                                                                            }
                                                                                            className="form-check-input"
                                                                                            disabled={
                                                                                                accountChangingKey !==
                                                                                                null
                                                                                            }
                                                                                            id={
                                                                                                checkboxId
                                                                                            }
                                                                                            onChange={() =>
                                                                                                handleToggleSimulationGroupAccount(
                                                                                                    simulationGroup,
                                                                                                    account.accountId,
                                                                                                )
                                                                                            }
                                                                                            type="checkbox"
                                                                                        />
                                                                                        <label
                                                                                            className="form-check-label"
                                                                                            htmlFor={
                                                                                                checkboxId
                                                                                            }>
                                                                                            {
                                                                                                account.accountName
                                                                                            }
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </fieldset>
                                                            ) : linkedAccounts.length >
                                                              0 ? (
                                                                linkedAccounts
                                                                    .map(
                                                                        (
                                                                            account,
                                                                        ) =>
                                                                            account.accountName,
                                                                    )
                                                                    .join(", ")
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={
                                                                    isArchived
                                                                        ? "badge text-bg-secondary"
                                                                        : "badge text-bg-success"
                                                                }>
                                                                {isArchived
                                                                    ? t(
                                                                          "status.archived",
                                                                      )
                                                                    : t(
                                                                          "status.active",
                                                                      )}
                                                            </span>
                                                        </td>
                                                        <td className="sl-simulations-actions-cell">
                                                            {
                                                                simulationGroupActions
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr className="sl-simulations-actions-mobile-row">
                                                        <td colSpan={3}>
                                                            {
                                                                simulationGroupActions
                                                            }
                                                        </td>
                                                    </tr>
                                                    {isAddingTransaction ? (
                                                        <tr>
                                                            <td colSpan={4}>
                                                                <div className="border rounded p-3 sl-simulations-inline-form">
                                                                    <div className="mb-3">
                                                                        <h3 className="h6 mb-1">
                                                                            {t(
                                                                                "transactionForm.title",
                                                                            )}
                                                                        </h3>
                                                                        <p className="text-muted mb-0">
                                                                            {t(
                                                                                "transactionForm.subtitle",
                                                                                {
                                                                                    name: simulationGroup.simulationGroupName,
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    {transactionFormError ? (
                                                                        <div
                                                                            className="alert alert-danger"
                                                                            role="alert">
                                                                            {
                                                                                transactionFormError
                                                                            }
                                                                        </div>
                                                                    ) : null}

                                                                    <TransactionForm
                                                                        context={{
                                                                            type: "simulation",
                                                                            simulationGroupId:
                                                                                simulationGroup.simulationGroupId,
                                                                            allowedAccountIds:
                                                                                simulationGroup.accountIds,
                                                                        }}
                                                                        idPrefix={`simulation-${simulationGroup.simulationGroupId}-transactionForm`}
                                                                        isSubmitting={
                                                                            isSubmittingTransaction
                                                                        }
                                                                        onCancel={
                                                                            cancelAddingTransaction
                                                                        }
                                                                        onSubmit={(
                                                                            requests,
                                                                        ) =>
                                                                            handleCreateSimulationTransactions(
                                                                                simulationGroup,
                                                                                requests,
                                                                            )
                                                                        }
                                                                        submitLabel={t(
                                                                            "transactionForm.submit",
                                                                        )}
                                                                        submittingLabel={t(
                                                                            "transactionForm.submitting",
                                                                        )}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                    {isAddingRecurringTransaction ? (
                                                        <tr>
                                                            <td colSpan={4}>
                                                                <div className="border rounded p-3 sl-simulations-inline-form">
                                                                    <div className="mb-3">
                                                                        <h3 className="h6 mb-1">
                                                                            {t(
                                                                                "recurringTransactionForm.title",
                                                                            )}
                                                                        </h3>
                                                                        <p className="text-muted mb-0">
                                                                            {t(
                                                                                "recurringTransactionForm.subtitle",
                                                                                {
                                                                                    name: simulationGroup.simulationGroupName,
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    {recurringTransactionFormError ? (
                                                                        <div
                                                                            className="alert alert-danger"
                                                                            role="alert">
                                                                            {
                                                                                recurringTransactionFormError
                                                                            }
                                                                        </div>
                                                                    ) : null}

                                                                    <RecurringTransactionForm
                                                                        context={{
                                                                            type: "simulation",
                                                                            simulationGroupId:
                                                                                simulationGroup.simulationGroupId,
                                                                            allowedAccountIds:
                                                                                simulationGroup.accountIds,
                                                                        }}
                                                                        idPrefix={`simulation-${simulationGroup.simulationGroupId}-recurringTransactionForm`}
                                                                        isSubmitting={
                                                                            isSubmittingRecurringTransaction
                                                                        }
                                                                        onCancel={
                                                                            cancelAddingRecurringTransaction
                                                                        }
                                                                        onSubmit={(
                                                                            requests,
                                                                        ) =>
                                                                            handleCreateSimulationRecurringTransactions(
                                                                                simulationGroup,
                                                                                requests,
                                                                            )
                                                                        }
                                                                        submitLabel={t(
                                                                            "recurringTransactionForm.submit",
                                                                        )}
                                                                        submittingLabel={t(
                                                                            "recurringTransactionForm.submitting",
                                                                        )}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                    {isShowingMovements ? (
                                                        <tr>
                                                            <td colSpan={4}>
                                                                <div className="border rounded p-3">
                                                                    <div className="mb-3">
                                                                        <h3 className="h6 mb-1">
                                                                            {t(
                                                                                "movements.title",
                                                                            )}
                                                                        </h3>
                                                                        <p className="text-muted mb-0">
                                                                            {t(
                                                                                "movements.subtitle",
                                                                                {
                                                                                    name: simulationGroup.simulationGroupName,
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    {movementsState?.status ===
                                                                    "loading" ? (
                                                                        <p className="text-muted mb-0">
                                                                            {t(
                                                                                "movements.loading",
                                                                            )}
                                                                        </p>
                                                                    ) : null}

                                                                    {movementsState?.status ===
                                                                    "failed" ? (
                                                                        <div
                                                                            className="alert alert-danger"
                                                                            role="alert">
                                                                            {movementsState.error ??
                                                                                t(
                                                                                    "movements.loadErrorFallback",
                                                                                )}
                                                                        </div>
                                                                    ) : null}

                                                                    {movementsState?.status ===
                                                                        "loaded" &&
                                                                    movementsState
                                                                        .recurringTransactions
                                                                        .length ===
                                                                        0 &&
                                                                    movementsState
                                                                        .transactions
                                                                        .length ===
                                                                        0 ? (
                                                                        <p className="text-muted mb-0">
                                                                            {t(
                                                                                "movements.empty",
                                                                            )}
                                                                        </p>
                                                                    ) : null}

                                                                    {movementsState?.status ===
                                                                        "loaded" &&
                                                                    movementsState
                                                                        .recurringTransactions
                                                                        .length >
                                                                        0 ? (
                                                                        <div className="mb-4">
                                                                            <h4 className="h6">
                                                                                {t(
                                                                                    "movements.recurringTitle",
                                                                                )}
                                                                            </h4>

                                                                            <div className="table-responsive">
                                                                                <table className="table table-sm align-middle mb-0">
                                                                                    <tbody>
                                                                                        {movementsState.recurringTransactions.map(
                                                                                            (
                                                                                                recurringTransaction,
                                                                                            ) => {
                                                                                                const isEditingRecurringTransaction =
                                                                                                    editingRecurringTransactionId ===
                                                                                                    recurringTransaction.recurringTransactionId;

                                                                                                const isUpdatingRecurringTransaction =
                                                                                                    recurringTransactionUpdateSubmittingId ===
                                                                                                    recurringTransaction.recurringTransactionId;

                                                                                                return (
                                                                                                    <Fragment
                                                                                                        key={
                                                                                                            recurringTransaction.recurringTransactionId
                                                                                                        }>
                                                                                                        <tr className="table-success">
                                                                                                            <td>
                                                                                                                <strong>
                                                                                                                    {
                                                                                                                        recurringTransaction.recurringTransactionDescription
                                                                                                                    }
                                                                                                                </strong>
                                                                                                                <div className="text-muted small">
                                                                                                                    {getCategoryName(
                                                                                                                        recurringTransaction.categoryId,
                                                                                                                    )}{" "}
                                                                                                                    ·{" "}
                                                                                                                    {getFinancialPriorityName(
                                                                                                                        recurringTransaction.financialPriorityId,
                                                                                                                    )}{" "}
                                                                                                                    ·{" "}
                                                                                                                    {getAccountName(
                                                                                                                        recurringTransaction.linkedAccountId,
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </td>

                                                                                                            <td>
                                                                                                                {formatMovementMoneyAmount(
                                                                                                                    recurringTransaction.paymentAmount,
                                                                                                                    recurringTransaction.linkedAccountId,
                                                                                                                )}
                                                                                                            </td>

                                                                                                            <td>
                                                                                                                {formatRecurrenceFrequency(
                                                                                                                    recurringTransaction.recurrenceInterval,
                                                                                                                    recurringTransaction.recurrenceUnit,
                                                                                                                )}
                                                                                                            </td>

                                                                                                            <td>
                                                                                                                {formatIsoDateForDisplay(
                                                                                                                    recurringTransaction.recurringTransactionFirstPaymentDate,
                                                                                                                )}
                                                                                                            </td>

                                                                                                            <td className="text-end">
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                                    onClick={() =>
                                                                                                                        startEditingRecurringTransaction(
                                                                                                                            recurringTransaction,
                                                                                                                        )
                                                                                                                    }
                                                                                                                    type="button">
                                                                                                                    {t(
                                                                                                                        "actions.edit",
                                                                                                                    )}
                                                                                                                </button>
                                                                                                            </td>
                                                                                                        </tr>

                                                                                                        {isEditingRecurringTransaction ? (
                                                                                                            <tr>
                                                                                                                <td
                                                                                                                    colSpan={
                                                                                                                        5
                                                                                                                    }>
                                                                                                                    <div className="border rounded p-3 sl-simulations-inline-form">
                                                                                                                        <div className="mb-3">
                                                                                                                            <h5 className="h6 mb-1">
                                                                                                                                {t(
                                                                                                                                    "recurringTransactionEditForm.title",
                                                                                                                                )}
                                                                                                                            </h5>
                                                                                                                            <p className="text-muted mb-0">
                                                                                                                                {t(
                                                                                                                                    "recurringTransactionEditForm.subtitle",
                                                                                                                                )}
                                                                                                                            </p>
                                                                                                                        </div>

                                                                                                                        {recurringTransactionUpdateError ? (
                                                                                                                            <div
                                                                                                                                className="alert alert-danger"
                                                                                                                                role="alert">
                                                                                                                                {
                                                                                                                                    recurringTransactionUpdateError
                                                                                                                                }
                                                                                                                            </div>
                                                                                                                        ) : null}

                                                                                                                        <RecurringTransactionForm
                                                                                                                            context={{
                                                                                                                                type: "simulation",
                                                                                                                                simulationGroupId:
                                                                                                                                    recurringTransaction.simulationGroupId ??
                                                                                                                                    "",
                                                                                                                                allowedAccountIds:
                                                                                                                                    simulationGroup.accountIds,
                                                                                                                            }}
                                                                                                                            editOptions={{
                                                                                                                                enabled: true,
                                                                                                                            }}
                                                                                                                            idPrefix={`simulation-${simulationGroup.simulationGroupId}-recurringTransaction-${recurringTransaction.recurringTransactionId}-editForm`}
                                                                                                                            initialValues={getRecurringTransactionInitialValues(
                                                                                                                                recurringTransaction,
                                                                                                                            )}
                                                                                                                            isSubmitting={
                                                                                                                                isUpdatingRecurringTransaction
                                                                                                                            }
                                                                                                                            onCancel={
                                                                                                                                cancelEditingRecurringTransaction
                                                                                                                            }
                                                                                                                            onSubmit={(
                                                                                                                                requests,
                                                                                                                                meta,
                                                                                                                            ) =>
                                                                                                                                handleUpdateSimulationRecurringTransaction(
                                                                                                                                    recurringTransaction,
                                                                                                                                    requests,
                                                                                                                                    meta,
                                                                                                                                )
                                                                                                                            }
                                                                                                                            submitLabel={t(
                                                                                                                                "recurringTransactionEditForm.submit",
                                                                                                                            )}
                                                                                                                            submittingLabel={t(
                                                                                                                                "recurringTransactionEditForm.submitting",
                                                                                                                            )}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        ) : null}
                                                                                                    </Fragment>
                                                                                                );
                                                                                            },
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}

                                                                    {movementsState?.status ===
                                                                        "loaded" &&
                                                                    movementsState
                                                                        .transactions
                                                                        .length >
                                                                        0 ? (
                                                                        <div>
                                                                            <h4 className="h6">
                                                                                {t(
                                                                                    "movements.transactionsTitle",
                                                                                )}
                                                                            </h4>

                                                                            <div className="table-responsive">
                                                                                <table className="table table-sm align-middle mb-0">
                                                                                    <tbody>
                                                                                        {movementsState.transactions.map(
                                                                                            (
                                                                                                transaction,
                                                                                            ) => {
                                                                                                const isEditingTransaction =
                                                                                                    editingTransactionId ===
                                                                                                    transaction.transactionId;

                                                                                                const isUpdatingTransaction =
                                                                                                    transactionUpdateSubmittingId ===
                                                                                                    transaction.transactionId;

                                                                                                return (
                                                                                                    <Fragment
                                                                                                        key={
                                                                                                            transaction.transactionId
                                                                                                        }>
                                                                                                        <tr>
                                                                                                            <td>
                                                                                                                <strong>
                                                                                                                    {
                                                                                                                        transaction.transactionDescription
                                                                                                                    }
                                                                                                                </strong>
                                                                                                                <div className="text-muted small">
                                                                                                                    {getCategoryName(
                                                                                                                        transaction.categoryId,
                                                                                                                    )}{" "}
                                                                                                                    ·{" "}
                                                                                                                    {getAccountName(
                                                                                                                        transaction.accountId,
                                                                                                                    )}
                                                                                                                    {getCreditCardName(
                                                                                                                        transaction.creditCardId,
                                                                                                                    )
                                                                                                                        ? ` · ${getCreditCardName(
                                                                                                                              transaction.creditCardId,
                                                                                                                          )}`
                                                                                                                        : ""}
                                                                                                                    {getBucketName(
                                                                                                                        transaction.bucketId,
                                                                                                                    )
                                                                                                                        ? ` · ${getBucketName(transaction.bucketId)}`
                                                                                                                        : ""}
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {formatMovementMoneyAmount(
                                                                                                                    transaction.transactionAmount,
                                                                                                                    transaction.accountId,
                                                                                                                )}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {formatIsoDateForDisplay(
                                                                                                                    transaction.transactionChargeDate,
                                                                                                                )}
                                                                                                            </td>
                                                                                                            <td className="text-end">
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                                    onClick={() =>
                                                                                                                        startEditingTransaction(
                                                                                                                            transaction,
                                                                                                                        )
                                                                                                                    }
                                                                                                                    type="button">
                                                                                                                    {t(
                                                                                                                        "actions.edit",
                                                                                                                    )}
                                                                                                                </button>
                                                                                                            </td>
                                                                                                        </tr>

                                                                                                        {isEditingTransaction ? (
                                                                                                            <tr>
                                                                                                                <td
                                                                                                                    colSpan={
                                                                                                                        4
                                                                                                                    }>
                                                                                                                    <div className="border rounded p-3 sl-simulations-inline-form">
                                                                                                                        <div className="mb-3">
                                                                                                                            <h5 className="h6 mb-1">
                                                                                                                                {t(
                                                                                                                                    "transactionEditForm.title",
                                                                                                                                )}
                                                                                                                            </h5>
                                                                                                                            <p className="text-muted mb-0">
                                                                                                                                {t(
                                                                                                                                    "transactionEditForm.subtitle",
                                                                                                                                )}
                                                                                                                            </p>
                                                                                                                        </div>

                                                                                                                        {transactionUpdateError ? (
                                                                                                                            <div
                                                                                                                                className="alert alert-danger"
                                                                                                                                role="alert">
                                                                                                                                {
                                                                                                                                    transactionUpdateError
                                                                                                                                }
                                                                                                                            </div>
                                                                                                                        ) : null}

                                                                                                                        <TransactionForm
                                                                                                                            context={{
                                                                                                                                type: "simulation",
                                                                                                                                simulationGroupId:
                                                                                                                                    transaction.simulationGroupId ??
                                                                                                                                    "",
                                                                                                                                allowedAccountIds:
                                                                                                                                    simulationGroup.accountIds,
                                                                                                                            }}
                                                                                                                            idPrefix={`simulation-${simulationGroup.simulationGroupId}-transaction-${transaction.transactionId}-editForm`}
                                                                                                                            initialValues={getTransactionInitialValues(
                                                                                                                                transaction,
                                                                                                                            )}
                                                                                                                            isSubmitting={
                                                                                                                                isUpdatingTransaction
                                                                                                                            }
                                                                                                                            onCancel={
                                                                                                                                cancelEditingTransaction
                                                                                                                            }
                                                                                                                            onSubmit={(
                                                                                                                                requests,
                                                                                                                            ) =>
                                                                                                                                handleUpdateSimulationTransaction(
                                                                                                                                    transaction,
                                                                                                                                    requests,
                                                                                                                                )
                                                                                                                            }
                                                                                                                            submitLabel={t(
                                                                                                                                "transactionEditForm.submit",
                                                                                                                            )}
                                                                                                                            submittingLabel={t(
                                                                                                                                "transactionEditForm.submitting",
                                                                                                                            )}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        ) : null}
                                                                                                    </Fragment>
                                                                                                );
                                                                                            },
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                </Fragment>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

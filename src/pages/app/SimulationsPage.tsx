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
import { ApiError } from "../../shared/api";
import { TransactionForm } from "../../features/finance/transactionForms/TransactionForm";
import { RecurringTransactionForm } from "../../features/finance/transactionForms/RecurringTransactionForm";
import { formatMoneyAmountForDisplay } from "../../features/finance/transactionForms/moneyInput";

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

            setMovementsBySimulationGroupId((currentState) => ({
                ...currentState,
                [simulationGroupId]: {
                    status: "loaded",
                    recurringTransactions,
                    transactions,
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
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th scope="col">{t("table.name")}</th>
                                        <th scope="col">
                                            {t("table.accounts")}
                                        </th>
                                        <th scope="col">{t("table.status")}</th>
                                        <th scope="col">
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
                                                        <td>
                                                            {isEditing ? (
                                                                <div className="d-flex flex-wrap gap-2">
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
                                                                    {t(
                                                                        "actions.done",
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <div className="d-flex flex-wrap gap-2">
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
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {isAddingTransaction ? (
                                                        <tr>
                                                            <td colSpan={4}>
                                                                <div className="border rounded p-3">
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
                                                                <div className="border rounded p-3">
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
                                                                                            ) => (
                                                                                                <tr
                                                                                                    className="table-success"
                                                                                                    key={
                                                                                                        recurringTransaction.recurringTransactionId
                                                                                                    }>
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
                                                                                                            type="button">
                                                                                                            {t(
                                                                                                                "actions.edit",
                                                                                                            )}
                                                                                                        </button>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
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
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        transaction.transactionId
                                                                                                    }>
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
                                                                                                                ? ` · ${getBucketName(
                                                                                                                      transaction.bucketId,
                                                                                                                  )}`
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
                                                                                                            type="button">
                                                                                                            {t(
                                                                                                                "actions.edit",
                                                                                                            )}
                                                                                                        </button>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
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

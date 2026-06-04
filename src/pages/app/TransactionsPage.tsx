import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../app/store/hooks";
import {
    createTransaction,
    listTransactions,
    updateTransaction,
} from "../../features/finance/api/financeApi";
import type {
    TransactionCreateRequestDto,
    TransactionResponseDto,
    TransactionUpdateRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectBuckets,
    selectCategories,
    selectCreditCards,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import {
    TransactionForm,
    type TransactionFormState,
} from "../../features/finance/transactionForms/TransactionForm";
import {
    formatMoneyAmountForDisplay,
    moneyAmountToFormValue,
} from "../../features/finance/transactionForms/moneyInput";
import { ApiError } from "../../shared/api";

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

type TransactionListScope = "session" | "search";

type EditingTransactionState = {
    scope: TransactionListScope;
    transactionId: string;
} | null;

function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

function getFirstDayOfCurrentMonthIsoDate() {
    const today = getTodayIsoDate();

    return `${today.slice(0, 8)}01`;
}

export function TransactionsPage() {
    const { i18n, t } = useTranslation("transactions");

    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectCategories);
    const creditCards = useAppSelector(selectCreditCards);
    const buckets = useAppSelector(selectBuckets);

    const [sessionTransactions, setSessionTransactions] = useState<
        TransactionResponseDto[]
    >([]);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] =
        useState<EditingTransactionState>(null);
    const [transactionUpdateSubmittingId, setTransactionUpdateSubmittingId] =
        useState<string | null>(null);
    const [transactionUpdateError, setTransactionUpdateError] = useState<
        string | null
    >(null);
    const [searchFrom, setSearchFrom] = useState(
        getFirstDayOfCurrentMonthIsoDate,
    );
    const [searchTo, setSearchTo] = useState(getTodayIsoDate);
    const [searchedTransactions, setSearchedTransactions] = useState<
        TransactionResponseDto[]
    >([]);
    const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";

    const accountsById = useMemo(
        () => new Map(accounts.map((account) => [account.accountId, account])),
        [accounts],
    );

    const categoriesById = useMemo(
        () =>
            new Map(
                categories.map((category) => [category.categoryId, category]),
            ),
        [categories],
    );

    const creditCardsById = useMemo(
        () =>
            new Map(
                creditCards.map((creditCard) => [
                    creditCard.creditCardId,
                    creditCard,
                ]),
            ),
        [creditCards],
    );

    const bucketsById = useMemo(
        () => new Map(buckets.map((bucket) => [bucket.bucketId, bucket])),
        [buckets],
    );

    function getAccountName(accountId: string) {
        return accountsById.get(accountId)?.accountName ?? t("unknown.account");
    }

    function getAccountCurrency(accountId: string) {
        return accountsById.get(accountId)?.currency ?? "EUR";
    }

    function getCategoryName(categoryId: string) {
        return (
            categoriesById.get(categoryId)?.categoryName ??
            t("unknown.category")
        );
    }

    function getCreditCardName(creditCardId: string | null) {
        if (!creditCardId) {
            return t("emptyValue");
        }

        return (
            creditCardsById.get(creditCardId)?.creditCardName ??
            t("unknown.creditCard")
        );
    }

    function getBucketName(bucketId: string | null) {
        if (!bucketId) {
            return t("emptyValue");
        }

        return bucketsById.get(bucketId)?.bucketName ?? t("unknown.bucket");
    }

    function formatMoneyAmount(transaction: TransactionResponseDto) {
        return formatMoneyAmountForDisplay(
            transaction.transactionAmount,
            displayLanguage,
            getAccountCurrency(transaction.accountId),
        );
    }

    function formatIsoDateForDisplay(date: string) {
        return new Intl.DateTimeFormat(displayLanguage).format(new Date(date));
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

    function isEditingTransaction(
        scope: TransactionListScope,
        transactionId: string,
    ) {
        return (
            editingTransaction?.scope === scope &&
            editingTransaction.transactionId === transactionId
        );
    }

    function startEditingTransaction(
        scope: TransactionListScope,
        transaction: TransactionResponseDto,
    ) {
        setEditingTransaction({
            scope,
            transactionId: transaction.transactionId,
        });
        setTransactionUpdateError(null);
        setCreateError(null);
        setSearchError(null);
        setSuccessMessage(null);
    }

    function cancelEditingTransaction() {
        setEditingTransaction(null);
        setTransactionUpdateError(null);
    }

    function replaceTransaction(
        transactions: TransactionResponseDto[],
        updatedTransaction: TransactionResponseDto,
    ) {
        return transactions.map((currentTransaction) =>
            currentTransaction.transactionId ===
            updatedTransaction.transactionId
                ? updatedTransaction
                : currentTransaction,
        );
    }

    async function handleUpdateTransactionFromForm(
        transaction: TransactionResponseDto,
        requests: TransactionCreateRequestDto[],
    ) {
        if (requests.length !== 1) {
            setTransactionUpdateError(t("edit.singleRequestRequired"));
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
            transactionIsConfirmed: request.transactionIsConfirmed ?? false,
            accountId: request.accountId,
            creditCardId: request.creditCardId ?? null,
            bucketId: request.bucketId ?? null,
            transactionIsSimulated: transaction.transactionIsSimulated,
            simulationGroupId: transaction.simulationGroupId,
            transactionReminderEnabled:
                request.transactionReminderEnabled ?? false,
            transactionReminderDaysBefore:
                request.transactionReminderDaysBefore ?? 7,
        };

        setTransactionUpdateSubmittingId(transaction.transactionId);
        setTransactionUpdateError(null);
        setSuccessMessage(null);

        try {
            const updatedTransaction = await updateTransaction(
                transaction.transactionId,
                updateRequest,
            );

            setSessionTransactions((currentTransactions) =>
                replaceTransaction(currentTransactions, updatedTransaction),
            );

            setSearchedTransactions((currentTransactions) =>
                replaceTransaction(currentTransactions, updatedTransaction),
            );

            setEditingTransaction(null);
            setSuccessMessage(t("edit.success"));
        } catch (error) {
            setTransactionUpdateError(
                getErrorMessage(error, t("edit.errorFallback")),
            );
        } finally {
            setTransactionUpdateSubmittingId(null);
        }
    }

    async function handleCreateTransactions(
        requests: TransactionCreateRequestDto[],
    ) {
        setIsCreateSubmitting(true);
        setCreateError(null);
        setSuccessMessage(null);

        try {
            const createdTransactions: TransactionResponseDto[] = [];

            for (const request of requests) {
                const createdTransaction = await createTransaction(request);
                createdTransactions.push(createdTransaction);
            }

            setSessionTransactions((currentTransactions) => [
                ...createdTransactions,
                ...currentTransactions,
            ]);

            setSuccessMessage(t("create.success"));
        } catch (error) {
            setCreateError(getErrorMessage(error, t("create.errorFallback")));
        } finally {
            setIsCreateSubmitting(false);
        }
    }

    async function handleSearchTransactions() {
        setSearchError(null);
        setSuccessMessage(null);

        if (!searchFrom || !searchTo) {
            setSearchError(t("search.validation.requiredRange"));
            return;
        }

        if (searchFrom > searchTo) {
            setSearchError(t("search.validation.invalidRange"));
            return;
        }

        setIsSearchSubmitting(true);

        try {
            const transactions = await listTransactions({
                from: searchFrom,
                to: searchTo,
            });

            setSearchedTransactions(
                transactions.filter(
                    (transaction) => transaction.transactionIsUserEntered,
                ),
            );
            setHasSearched(true);
        } catch (error) {
            setSearchError(getErrorMessage(error, t("search.errorFallback")));
        } finally {
            setIsSearchSubmitting(false);
        }
    }

    function renderTransactionRows(
        scope: TransactionListScope,
        transactions: TransactionResponseDto[],
    ) {
        return transactions.map((transaction) => {
            const isEditing = isEditingTransaction(
                scope,
                transaction.transactionId,
            );
            const isUpdating =
                transactionUpdateSubmittingId === transaction.transactionId;

            return (
                <Fragment key={`${scope}-${transaction.transactionId}`}>
                    <tr>
                        <td>{transaction.transactionDescription}</td>
                        <td>{formatMoneyAmount(transaction)}</td>
                        <td>
                            {formatIsoDateForDisplay(
                                transaction.transactionChargeDate,
                            )}
                        </td>
                        <td>{getAccountName(transaction.accountId)}</td>
                        <td>{getCategoryName(transaction.categoryId)}</td>
                        <td>{getCreditCardName(transaction.creditCardId)}</td>
                        <td>{getBucketName(transaction.bucketId)}</td>
                        <td>
                            <span
                                className={
                                    transaction.transactionIsConfirmed
                                        ? "badge text-bg-success"
                                        : "badge text-bg-secondary"
                                }>
                                {transaction.transactionIsConfirmed
                                    ? t("session.status.confirmed")
                                    : t("session.status.planned")}
                            </span>
                        </td>
                        <td>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                    startEditingTransaction(scope, transaction)
                                }
                                type="button">
                                {t("session.actions.edit")}
                            </button>
                        </td>
                    </tr>

                    {isEditing ? (
                        <tr>
                            <td colSpan={9}>
                                <div className="border rounded p-3">
                                    <div className="mb-3">
                                        <h3 className="h6 mb-1">
                                            {t("edit.title")}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            {t("edit.subtitle")}
                                        </p>
                                    </div>

                                    {transactionUpdateError ? (
                                        <div
                                            className="alert alert-danger"
                                            role="alert">
                                            {transactionUpdateError}
                                        </div>
                                    ) : null}

                                    <TransactionForm
                                        context={{ type: "standard" }}
                                        idPrefix={`transaction-${scope}-${transaction.transactionId}-editForm`}
                                        initialValues={getTransactionInitialValues(
                                            transaction,
                                        )}
                                        isSubmitting={isUpdating}
                                        onCancel={cancelEditingTransaction}
                                        onSubmit={(requests) =>
                                            handleUpdateTransactionFromForm(
                                                transaction,
                                                requests,
                                            )
                                        }
                                        submitLabel={t("edit.submit")}
                                        submittingLabel={t("edit.submitting")}
                                    />
                                </div>
                            </td>
                        </tr>
                    ) : null}
                </Fragment>
            );
        });
    }

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            {financeDataStatus === "loading" ? (
                <div className="alert alert-info" role="status">
                    {t("referenceDataLoading")}
                </div>
            ) : null}

            {financeDataStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("referenceDataLoadErrorTitle")}</h2>
                    <p className="mb-0">
                        {financeDataError?.message ??
                            t("referenceDataLoadErrorFallback")}
                    </p>
                </div>
            ) : null}

            {successMessage ? (
                <div className="alert alert-success" role="status">
                    {successMessage}
                </div>
            ) : null}

            <div className="row g-3">
                <div className="col-12 col-xl-5">
                    <article className="sl-panel h-100">
                        <p className="sl-eyebrow">{t("create.eyebrow")}</p>
                        <h2>{t("create.title")}</h2>
                        <p>{t("create.subtitle")}</p>

                        {createError ? (
                            <div className="alert alert-danger" role="alert">
                                {createError}
                            </div>
                        ) : null}

                        <TransactionForm
                            context={{ type: "standard" }}
                            isSubmitting={isCreateSubmitting}
                            onSubmit={handleCreateTransactions}
                            submitLabel={t("create.submit")}
                            submittingLabel={t("create.submitting")}
                        />
                    </article>
                </div>

                <div className="col-12 col-xl-7">
                    <article className="sl-panel h-100">
                        <p className="sl-eyebrow">{t("session.eyebrow")}</p>
                        <h2>{t("session.title")}</h2>
                        <p>{t("session.subtitle")}</p>

                        {sessionTransactions.length === 0 ? (
                            <p className="text-muted mb-0">
                                {t("session.empty")}
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t("session.table.description")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.amount")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.date")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.account")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.category")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.creditCard")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.bucket")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.status")}
                                            </th>
                                            <th scope="col">
                                                {t("session.table.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTransactionRows(
                                            "session",
                                            sessionTransactions,
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </article>
                </div>
            </div>
            <article className="sl-panel mt-3">
                <p className="sl-eyebrow">{t("search.eyebrow")}</p>
                <h2>{t("search.title")}</h2>
                <p>{t("search.subtitle")}</p>

                <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-4">
                        <label
                            className="form-label"
                            htmlFor="transactionsSearchFrom">
                            {t("search.from")}
                        </label>
                        <input
                            className="form-control"
                            id="transactionsSearchFrom"
                            onChange={(event) =>
                                setSearchFrom(event.target.value)
                            }
                            type="date"
                            value={searchFrom}
                        />
                    </div>

                    <div className="col-12 col-md-4">
                        <label
                            className="form-label"
                            htmlFor="transactionsSearchTo">
                            {t("search.to")}
                        </label>
                        <input
                            className="form-control"
                            id="transactionsSearchTo"
                            onChange={(event) =>
                                setSearchTo(event.target.value)
                            }
                            type="date"
                            value={searchTo}
                        />
                    </div>

                    <div className="col-12 col-md-4">
                        <button
                            className="btn btn-primary w-100"
                            disabled={isSearchSubmitting}
                            onClick={handleSearchTransactions}
                            type="button">
                            {isSearchSubmitting
                                ? t("search.submitting")
                                : t("search.submit")}
                        </button>
                    </div>
                </div>

                {searchError ? (
                    <div className="alert alert-danger mt-3" role="alert">
                        {searchError}
                    </div>
                ) : null}

                {hasSearched && searchedTransactions.length === 0 ? (
                    <p className="text-muted mt-3 mb-0">{t("search.empty")}</p>
                ) : null}

                {searchedTransactions.length > 0 ? (
                    <div className="table-responsive mt-3">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        {t("session.table.description")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.amount")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.date")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.account")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.category")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.creditCard")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.bucket")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.status")}
                                    </th>
                                    <th scope="col">
                                        {t("session.table.actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTransactionRows(
                                    "search",
                                    searchedTransactions,
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </article>
        </section>
    );
}

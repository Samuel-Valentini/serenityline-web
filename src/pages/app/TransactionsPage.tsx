import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../app/store/hooks";
import { createTransaction } from "../../features/finance/api/financeApi";
import type {
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
} from "../../features/finance/financeDataSelectors";
import { TransactionForm } from "../../features/finance/transactionForms/TransactionForm";
import { formatMoneyAmountForDisplay } from "../../features/finance/transactionForms/moneyInput";
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
                                        {sessionTransactions.map(
                                            (transaction) => (
                                                <tr
                                                    key={
                                                        transaction.transactionId
                                                    }>
                                                    <td>
                                                        {
                                                            transaction.transactionDescription
                                                        }
                                                    </td>
                                                    <td>
                                                        {formatMoneyAmount(
                                                            transaction,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatIsoDateForDisplay(
                                                            transaction.transactionChargeDate,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getAccountName(
                                                            transaction.accountId,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getCategoryName(
                                                            transaction.categoryId,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getCreditCardName(
                                                            transaction.creditCardId,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getBucketName(
                                                            transaction.bucketId,
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                transaction.transactionIsConfirmed
                                                                    ? "badge text-bg-success"
                                                                    : "badge text-bg-secondary"
                                                            }>
                                                            {transaction.transactionIsConfirmed
                                                                ? t(
                                                                      "session.status.confirmed",
                                                                  )
                                                                : t(
                                                                      "session.status.planned",
                                                                  )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            disabled
                                                            title={t(
                                                                "session.actions.editComingSoon",
                                                            )}
                                                            type="button">
                                                            {t(
                                                                "session.actions.edit",
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}

import { type ComponentProps, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../app/store/hooks";
import {
    selectAccounts,
    selectBuckets,
    selectCategories,
    selectCreditCards,
} from "../financeDataSelectors";
import type { TransactionCreateRequestDto } from "../api/financeApiTypes";
import {
    isSimulationMovementContext,
    type FinanceMovementFormContext,
} from "./movementFormContext";
import { normalizeMoneyInput } from "./moneyInput";

import { CreateCategoryModal } from "../referenceModals/CreateCategoryModal";
import { CreateAccountModal } from "../referenceModals/CreateAccountModal";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type TransactionFormState = {
    transactionDescription: string;
    transactionAmount: string;
    transactionChargeDate: string;
    categoryId: string;
    accountId: string;
    creditCardId: string;
    bucketId: string;
    transactionIsConfirmed: boolean;
    transactionAffectsAccountBalance: boolean;
    transactionAffectsSerenityline: boolean;
    transactionReminderEnabled: boolean;
    transactionReminderDaysBefore: string;
};

export type TransactionFormReferenceActions = {
    onCreateCategory?: () => void;
    onCreateAccount?: () => void;
    onCreateCreditCard?: () => void;
    onCreateBucket?: () => void;
};

export type TransactionFormProps = {
    context: FinanceMovementFormContext;
    isSubmitting?: boolean;
    submitLabel?: string;
    submittingLabel?: string;
    idPrefix?: string;
    referenceActions?: TransactionFormReferenceActions;
    onCancel?: () => void;
    onSubmit: (request: TransactionCreateRequestDto) => Promise<void> | void;
};

function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

function getInitialFormState(): TransactionFormState {
    return {
        transactionDescription: "",
        transactionAmount: "",
        transactionChargeDate: getTodayIsoDate(),
        categoryId: "",
        accountId: "",
        creditCardId: "",
        bucketId: "",
        transactionIsConfirmed: false,
        transactionAffectsAccountBalance: true,
        transactionAffectsSerenityline: true,
        transactionReminderEnabled: false,
        transactionReminderDaysBefore: "7",
    };
}

function isBucketClosed(bucketClosedAt: string | null) {
    return bucketClosedAt !== null;
}

export function TransactionForm({
    context,
    idPrefix = "transactionForm",
    isSubmitting = false,
    referenceActions,
    submitLabel,
    submittingLabel,
    onCancel,
    onSubmit,
}: TransactionFormProps) {
    const { i18n, t } = useTranslation("transactionForms");

    const accounts = useAppSelector(selectAccounts);
    const buckets = useAppSelector(selectBuckets);
    const categories = useAppSelector(selectCategories);
    const creditCards = useAppSelector(selectCreditCards);

    const [form, setForm] = useState<TransactionFormState>(() =>
        getInitialFormState(),
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
        useState(false);
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
        useState(false);

    const allowedAccountIds = useMemo(() => {
        if (!isSimulationMovementContext(context)) {
            return null;
        }

        return new Set(context.allowedAccountIds);
    }, [context]);

    const availableAccounts = useMemo(
        () =>
            allowedAccountIds
                ? accounts.filter((account) =>
                      allowedAccountIds.has(account.accountId),
                  )
                : accounts,
        [accounts, allowedAccountIds],
    );

    const activeCategories = useMemo(
        () =>
            categories
                .filter((category) => category.active)
                .sort((first, second) =>
                    first.categoryName.localeCompare(second.categoryName),
                ),
        [categories],
    );

    const availableCreditCards = useMemo(
        () =>
            creditCards
                .filter((creditCard) => {
                    const isAccountAllowed = allowedAccountIds
                        ? allowedAccountIds.has(creditCard.accountId)
                        : true;

                    if (!isAccountAllowed) {
                        return false;
                    }

                    if (!form.accountId) {
                        return true;
                    }

                    return creditCard.accountId === form.accountId;
                })
                .sort((first, second) =>
                    first.creditCardName.localeCompare(second.creditCardName),
                ),
        [allowedAccountIds, creditCards, form.accountId],
    );

    const availableBuckets = useMemo(
        () =>
            buckets
                .filter((bucket) => {
                    if (isBucketClosed(bucket.bucketClosedAt)) {
                        return false;
                    }

                    if (form.accountId) {
                        return bucket.accountIds.includes(form.accountId);
                    }

                    if (!allowedAccountIds) {
                        return true;
                    }

                    return bucket.accountIds.some((accountId) =>
                        allowedAccountIds.has(accountId),
                    );
                })
                .sort((first, second) =>
                    (first.bucketName ?? "").localeCompare(
                        second.bucketName ?? "",
                    ),
                ),
        [allowedAccountIds, buckets, form.accountId],
    );

    function handleCreateCategoryClick() {
        if (referenceActions?.onCreateCategory) {
            referenceActions.onCreateCategory();
            return;
        }

        setIsCreateCategoryModalOpen(true);
    }

    function handleCreateAccountClick() {
        if (referenceActions?.onCreateAccount) {
            referenceActions.onCreateAccount();
            return;
        }

        setIsCreateAccountModalOpen(true);
    }

    function updateField(
        field: keyof TransactionFormState,
        value: string | boolean,
    ) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
    }

    function updateAccount(accountId: string) {
        setForm((currentForm) => ({
            ...currentForm,
            accountId,
            creditCardId: "",
            bucketId: "",
        }));
        setFormError(null);
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const transactionDescription = form.transactionDescription.trim();
        const transactionAmount = normalizeMoneyInput(
            form.transactionAmount,
            i18n.language,
        );
        const reminderDaysBefore = Number(form.transactionReminderDaysBefore);

        if (!transactionDescription) {
            setFormError(t("validation.descriptionRequired"));
            return;
        }

        if (!transactionAmount) {
            setFormError(t("validation.amountInvalid"));
            return;
        }

        if (!form.transactionChargeDate) {
            setFormError(t("validation.chargeDateRequired"));
            return;
        }

        if (!form.categoryId) {
            setFormError(t("validation.categoryRequired"));
            return;
        }

        if (!form.accountId) {
            setFormError(t("validation.accountRequired"));
            return;
        }

        if (
            form.transactionReminderEnabled &&
            (!Number.isInteger(reminderDaysBefore) || reminderDaysBefore < 0)
        ) {
            setFormError(t("validation.reminderDaysInvalid"));
            return;
        }

        const isSimulated = isSimulationMovementContext(context);

        const request: TransactionCreateRequestDto = {
            transactionDescription,
            transactionAmount,
            transactionAffectsAccountBalance:
                form.transactionAffectsAccountBalance,
            transactionAffectsSerenityline: form.transactionAffectsSerenityline,
            categoryId: form.categoryId,
            transactionChargeDate: form.transactionChargeDate,
            transactionIsConfirmed: form.transactionIsConfirmed,
            accountId: form.accountId,
            creditCardId: form.creditCardId || null,
            bucketId: form.bucketId || null,
            transactionIsSimulated: isSimulated,
            simulationGroupId: isSimulated ? context.simulationGroupId : null,
            transactionReminderEnabled: form.transactionReminderEnabled,
            transactionReminderDaysBefore: form.transactionReminderEnabled
                ? reminderDaysBefore
                : 7,
        };

        await onSubmit(request);
    };

    return (
        <>
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
                {formError ? (
                    <div className="alert alert-danger" role="alert">
                        {formError}
                    </div>
                ) : null}

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-description`}>
                        {t("fields.description")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-description`}
                        onChange={(event) =>
                            updateField(
                                "transactionDescription",
                                event.target.value,
                            )
                        }
                        required
                        type="text"
                        value={form.transactionDescription}
                    />
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-amount`}>
                        {t("fields.amount")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-amount`}
                        inputMode="decimal"
                        onChange={(event) =>
                            updateField("transactionAmount", event.target.value)
                        }
                        placeholder={t("placeholders.amount")}
                        required
                        type="text"
                        value={form.transactionAmount}
                    />
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-chargeDate`}>
                        {t("fields.chargeDate")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-chargeDate`}
                        onChange={(event) =>
                            updateField(
                                "transactionChargeDate",
                                event.target.value,
                            )
                        }
                        required
                        type="date"
                        value={form.transactionChargeDate}
                    />
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-category`}>
                        {t("fields.category")}
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-category`}
                            onChange={(event) =>
                                updateField("categoryId", event.target.value)
                            }
                            required
                            value={form.categoryId}>
                            <option value="">
                                {t("options.selectCategory")}
                            </option>
                            {activeCategories.map((category) => (
                                <option
                                    key={category.categoryId}
                                    value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-outline-primary"
                            onClick={handleCreateCategoryClick}
                            type="button">
                            {t("actions.newCategory")}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-account`}>
                        {t("fields.account")}
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-account`}
                            onChange={(event) =>
                                updateAccount(event.target.value)
                            }
                            required
                            value={form.accountId}>
                            <option value="">
                                {t("options.selectAccount")}
                            </option>
                            {availableAccounts.map((account) => (
                                <option
                                    key={account.accountId}
                                    value={account.accountId}>
                                    {account.accountName}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-outline-primary"
                            onClick={handleCreateAccountClick}
                            type="button">
                            {t("actions.newAccount")}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-creditCard`}>
                        {t("fields.creditCard")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-creditCard`}
                            onChange={(event) =>
                                updateField("creditCardId", event.target.value)
                            }
                            value={form.creditCardId}>
                            <option value="">
                                {t("options.noCreditCard")}
                            </option>
                            {availableCreditCards.map((creditCard) => (
                                <option
                                    key={creditCard.creditCardId}
                                    value={creditCard.creditCardId}>
                                    {creditCard.creditCardName}
                                </option>
                            ))}
                        </select>

                        {referenceActions?.onCreateCreditCard ? (
                            <button
                                className="btn btn-outline-primary"
                                onClick={referenceActions.onCreateCreditCard}
                                type="button">
                                {t("actions.newCreditCard")}
                            </button>
                        ) : null}
                    </div>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-bucket`}>
                        {t("fields.bucket")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-bucket`}
                            onChange={(event) =>
                                updateField("bucketId", event.target.value)
                            }
                            value={form.bucketId}>
                            <option value="">{t("options.noBucket")}</option>
                            {availableBuckets.map((bucket) => (
                                <option
                                    key={bucket.bucketId}
                                    value={bucket.bucketId}>
                                    {bucket.bucketName ??
                                        t("options.unnamedBucket")}
                                </option>
                            ))}
                        </select>

                        {referenceActions?.onCreateBucket ? (
                            <button
                                className="btn btn-outline-primary"
                                onClick={referenceActions.onCreateBucket}
                                type="button">
                                {t("actions.newBucket")}
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="form-check">
                    <input
                        checked={form.transactionIsConfirmed}
                        className="form-check-input"
                        id={`${idPrefix}-confirmed`}
                        onChange={(event) =>
                            updateField(
                                "transactionIsConfirmed",
                                event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`${idPrefix}-confirmed`}>
                        {t("fields.confirmed")}
                    </label>
                </div>

                <div className="form-check">
                    <input
                        checked={form.transactionAffectsAccountBalance}
                        className="form-check-input"
                        id={`${idPrefix}-affectsAccountBalance`}
                        onChange={(event) =>
                            updateField(
                                "transactionAffectsAccountBalance",
                                event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`${idPrefix}-affectsAccountBalance`}>
                        {t("fields.affectsAccountBalance")}
                    </label>
                </div>

                <div className="form-check">
                    <input
                        checked={form.transactionAffectsSerenityline}
                        className="form-check-input"
                        id={`${idPrefix}-affectsSerenityline`}
                        onChange={(event) =>
                            updateField(
                                "transactionAffectsSerenityline",
                                event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`${idPrefix}-affectsSerenityline`}>
                        {t("fields.affectsSerenityline")}
                    </label>
                </div>

                <div className="form-check">
                    <input
                        checked={form.transactionReminderEnabled}
                        className="form-check-input"
                        id={`${idPrefix}-reminderEnabled`}
                        onChange={(event) =>
                            updateField(
                                "transactionReminderEnabled",
                                event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`${idPrefix}-reminderEnabled`}>
                        {t("fields.reminderEnabled")}
                    </label>
                </div>

                {form.transactionReminderEnabled ? (
                    <div>
                        <label
                            className="form-label"
                            htmlFor={`${idPrefix}-reminderDaysBefore`}>
                            {t("fields.reminderDaysBefore")}
                        </label>
                        <input
                            className="form-control"
                            id={`${idPrefix}-reminderDaysBefore`}
                            min={0}
                            onChange={(event) =>
                                updateField(
                                    "transactionReminderDaysBefore",
                                    event.target.value,
                                )
                            }
                            type="number"
                            value={form.transactionReminderDaysBefore}
                        />
                    </div>
                ) : null}

                <div className="d-flex flex-wrap gap-2">
                    <button
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        type="submit">
                        {isSubmitting
                            ? (submittingLabel ?? t("actions.submitting"))
                            : (submitLabel ?? t("actions.submit"))}
                    </button>

                    {onCancel ? (
                        <button
                            className="btn btn-outline-secondary"
                            disabled={isSubmitting}
                            onClick={onCancel}
                            type="button">
                            {t("actions.cancel")}
                        </button>
                    ) : null}
                </div>
            </form>
            <CreateCategoryModal
                isOpen={isCreateCategoryModalOpen}
                onClose={() => setIsCreateCategoryModalOpen(false)}
                onCreated={(createdCategory) =>
                    updateField("categoryId", createdCategory.categoryId)
                }
            />
            <CreateAccountModal
                isOpen={isCreateAccountModalOpen}
                onClose={() => setIsCreateAccountModalOpen(false)}
                onCreated={(createdAccount) =>
                    updateAccount(createdAccount.accountId)
                }
            />
        </>
    );
}

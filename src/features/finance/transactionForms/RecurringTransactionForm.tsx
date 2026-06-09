import { type ComponentProps, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    buildRecurringTransactionRequests,
    isZeroMoneyAmount,
    type RecurringTransactionBaseRequest,
} from "./recurringTransactionRequestBuilder";

import { useAppSelector } from "../../../app/store/hooks";
import type {
    BucketResponseDto,
    CreditCardResponseDto,
    PaymentDateAdjustmentPolicy,
    RecurrenceUnit,
    RecurringTransactionCreateRequestDto,
} from "../api/financeApiTypes";
import {
    selectAccounts,
    selectBuckets,
    selectCategories,
    selectCreditCards,
    selectFinancialPriorities,
} from "../financeDataSelectors";
import { CreateAccountModal } from "../referenceModals/CreateAccountModal";
import { CreateBucketModal } from "../referenceModals/CreateBucketModal";
import { CreateCategoryModal } from "../referenceModals/CreateCategoryModal";
import { CreateCreditCardModal } from "../referenceModals/CreateCreditCardModal";
import {
    isSimulationMovementContext,
    type FinanceMovementFormContext,
} from "./movementFormContext";
import { normalizeMoneyInput } from "./moneyInput";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

export type RecurringTransactionFormState = {
    recurringTransactionDescription: string;
    paymentAmount: string;
    recurringTransactionAmountIsAdjustable: boolean;
    recurringTransactionFirstPaymentDate: string;
    recurrenceInterval: string;
    recurrenceUnit: RecurrenceUnit;
    paymentDateAdjustmentPolicy: PaymentDateAdjustmentPolicy;
    recurringTransactionEndDate: string;
    finalPaymentAmount: string;
    categoryId: string;
    financialPriorityId: string;
    linkedAccountId: string;
    linkedCreditCardId: string;
    linkedBucketId: string;
    recurringTransactionReminderEnabled: boolean;
    recurringTransactionReminderDaysBefore: string;
};

export type RecurringTransactionFormReferenceActions = {
    onCreateCategory?: () => void;
    onCreateAccount?: () => void;
    onCreateCreditCard?: () => void;
    onCreateBucket?: () => void;
};

export type RecurringTransactionFormProps = {
    context: FinanceMovementFormContext;
    initialValues?: Partial<RecurringTransactionFormState>;
    isSubmitting?: boolean;
    submitLabel?: string;
    submittingLabel?: string;
    idPrefix?: string;
    referenceActions?: RecurringTransactionFormReferenceActions;
    onCancel?: () => void;
    onSubmit: (
        requests: RecurringTransactionCreateRequestDto[],
    ) => Promise<void> | void;
};

function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

function getInitialFormState(): RecurringTransactionFormState {
    return {
        recurringTransactionDescription: "",
        paymentAmount: "",
        recurringTransactionAmountIsAdjustable: false,
        recurringTransactionFirstPaymentDate: getTodayIsoDate(),
        recurrenceInterval: "1",
        recurrenceUnit: "MONTH",
        paymentDateAdjustmentPolicy: "NONE",
        recurringTransactionEndDate: "",
        finalPaymentAmount: "",
        categoryId: "",
        financialPriorityId: "",
        linkedAccountId: "",
        linkedCreditCardId: "",
        linkedBucketId: "",
        recurringTransactionReminderEnabled: false,
        recurringTransactionReminderDaysBefore: "7",
    };
}

function isBucketClosed(bucketClosedAt: string | null) {
    return bucketClosedAt !== null;
}

export function RecurringTransactionForm({
    context,
    idPrefix = "recurringTransactionForm",
    initialValues,
    isSubmitting = false,
    referenceActions,
    submitLabel,
    submittingLabel,
    onCancel,
    onSubmit,
}: RecurringTransactionFormProps) {
    const { i18n, t } = useTranslation("transactionForms");

    const accounts = useAppSelector(selectAccounts);
    const buckets = useAppSelector(selectBuckets);
    const categories = useAppSelector(selectCategories);
    const creditCards = useAppSelector(selectCreditCards);
    const financialPriorities = useAppSelector(selectFinancialPriorities);

    const [form, setForm] = useState<RecurringTransactionFormState>(() => ({
        ...getInitialFormState(),
        ...initialValues,
    }));
    const [formError, setFormError] = useState<string | null>(null);

    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
        useState(false);
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
        useState(false);
    const [isCreateCreditCardModalOpen, setIsCreateCreditCardModalOpen] =
        useState(false);
    const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] =
        useState(false);
    const isSimulated = isSimulationMovementContext(context);
    const showStandardRecurringOptions = !isSimulated;

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

    const sortedFinancialPriorities = useMemo(
        () =>
            [...financialPriorities].sort(
                (first, second) =>
                    second.financialPriorityRanking -
                    first.financialPriorityRanking,
            ),
        [financialPriorities],
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

                    if (!form.linkedAccountId) {
                        return true;
                    }

                    return creditCard.accountId === form.linkedAccountId;
                })
                .sort((first, second) =>
                    first.creditCardName.localeCompare(second.creditCardName),
                ),
        [allowedAccountIds, creditCards, form.linkedAccountId],
    );

    const availableBuckets = useMemo(
        () =>
            buckets
                .filter((bucket) => {
                    if (isBucketClosed(bucket.bucketClosedAt)) {
                        return false;
                    }

                    if (form.linkedAccountId) {
                        return bucket.accountIds.includes(form.linkedAccountId);
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
        [allowedAccountIds, buckets, form.linkedAccountId],
    );

    const isSingularRecurrenceInterval = Number(form.recurrenceInterval) === 1;
    const recurrenceUnitTranslationKey = isSingularRecurrenceInterval
        ? "singular"
        : "plural";

    const willGenerateTwoRecurringTransactions = Boolean(
        form.linkedCreditCardId && form.linkedBucketId,
    );

    function updateField(
        field: keyof RecurringTransactionFormState,
        value: string | boolean,
    ) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
    }

    function updateLinkedAccount(linkedAccountId: string) {
        setForm((currentForm) => ({
            ...currentForm,
            linkedAccountId,
            linkedCreditCardId: "",
            linkedBucketId: "",
        }));
        setFormError(null);
    }

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

    function handleCreateCreditCardClick() {
        if (referenceActions?.onCreateCreditCard) {
            referenceActions.onCreateCreditCard();
            return;
        }

        setIsCreateCreditCardModalOpen(true);
    }

    function handleCreateBucketClick() {
        if (referenceActions?.onCreateBucket) {
            referenceActions.onCreateBucket();
            return;
        }

        setIsCreateBucketModalOpen(true);
    }

    function selectCreatedCreditCard(createdCreditCard: CreditCardResponseDto) {
        setForm((currentForm) => ({
            ...currentForm,
            linkedAccountId: createdCreditCard.accountId,
            linkedCreditCardId: createdCreditCard.creditCardId,
            linkedBucketId:
                currentForm.linkedAccountId === createdCreditCard.accountId
                    ? currentForm.linkedBucketId
                    : "",
        }));
        setFormError(null);
    }

    function selectCreatedBucket(createdBucket: BucketResponseDto) {
        setForm((currentForm) => {
            const canKeepCurrentAccount =
                currentForm.linkedAccountId !== "" &&
                createdBucket.accountIds.includes(currentForm.linkedAccountId);

            const inferredAccountId =
                canKeepCurrentAccount || createdBucket.accountIds.length !== 1
                    ? currentForm.linkedAccountId
                    : createdBucket.accountIds[0];

            return {
                ...currentForm,
                linkedAccountId: inferredAccountId,
                linkedCreditCardId:
                    inferredAccountId === currentForm.linkedAccountId
                        ? currentForm.linkedCreditCardId
                        : "",
                linkedBucketId: createdBucket.bucketId,
            };
        });
        setFormError(null);
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const recurringTransactionDescription =
            form.recurringTransactionDescription.trim();
        const paymentAmount = normalizeMoneyInput(
            form.paymentAmount,
            i18n.language,
        );
        const recurrenceInterval = Number(form.recurrenceInterval);
        const reminderDaysBefore = Number(
            form.recurringTransactionReminderDaysBefore,
        );
        const finalPaymentAmount = form.finalPaymentAmount.trim()
            ? normalizeMoneyInput(form.finalPaymentAmount, i18n.language)
            : null;

        if (!recurringTransactionDescription) {
            setFormError(t("recurring.validation.descriptionRequired"));
            return;
        }

        if (!paymentAmount || isZeroMoneyAmount(paymentAmount)) {
            setFormError(t("recurring.validation.paymentAmountInvalid"));
            return;
        }

        if (!form.recurringTransactionFirstPaymentDate) {
            setFormError(t("recurring.validation.firstPaymentDateRequired"));
            return;
        }

        if (!Number.isInteger(recurrenceInterval) || recurrenceInterval < 1) {
            setFormError(t("recurring.validation.recurrenceIntervalInvalid"));
            return;
        }

        if (!form.categoryId) {
            setFormError(t("recurring.validation.categoryRequired"));
            return;
        }

        if (!form.financialPriorityId) {
            setFormError(t("recurring.validation.financialPriorityRequired"));
            return;
        }

        if (!form.linkedAccountId) {
            setFormError(t("recurring.validation.accountRequired"));
            return;
        }

        if (
            form.finalPaymentAmount.trim() &&
            (!finalPaymentAmount || isZeroMoneyAmount(finalPaymentAmount))
        ) {
            setFormError(t("recurring.validation.finalPaymentAmountInvalid"));
            return;
        }

        if (
            form.recurringTransactionReminderEnabled &&
            (!Number.isInteger(reminderDaysBefore) || reminderDaysBefore < 0)
        ) {
            setFormError(t("recurring.validation.reminderDaysInvalid"));
            return;
        }

        const baseRequest: RecurringTransactionBaseRequest = {
            recurringTransactionDescription,
            recurringTransactionAmountIsAdjustable:
                form.recurringTransactionAmountIsAdjustable,
            recurringTransactionFirstPaymentDate:
                form.recurringTransactionFirstPaymentDate,
            recurrenceInterval,
            recurrenceUnit: form.recurrenceUnit,
            paymentDateAdjustmentPolicy: form.paymentDateAdjustmentPolicy,
            recurringTransactionEndDate:
                form.recurringTransactionEndDate || null,
            categoryId: form.categoryId,
            financialPriorityId: form.financialPriorityId,
            linkedAccountId: form.linkedAccountId,
            recurringTransactionIsSimulated: isSimulated,
            simulationGroupId: isSimulated ? context.simulationGroupId : null,
            recurringTransactionReminderEnabled: isSimulated
                ? false
                : form.recurringTransactionReminderEnabled,
            recurringTransactionReminderDaysBefore:
                !isSimulated && form.recurringTransactionReminderEnabled
                    ? reminderDaysBefore
                    : 7,
        };

        const requests = buildRecurringTransactionRequests({
            baseRequest,
            paymentAmount,
            finalPaymentAmount,
            linkedCreditCardId: form.linkedCreditCardId,
            linkedBucketId: form.linkedBucketId,
        });

        await onSubmit(requests);
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
                        {t("recurring.fields.description")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-description`}
                        onChange={(event) =>
                            updateField(
                                "recurringTransactionDescription",
                                event.target.value,
                            )
                        }
                        required
                        type="text"
                        value={form.recurringTransactionDescription}
                    />
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-paymentAmount`}>
                        {t("recurring.fields.paymentAmount")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-paymentAmount`}
                        inputMode="decimal"
                        onChange={(event) =>
                            updateField("paymentAmount", event.target.value)
                        }
                        placeholder={t("recurring.placeholders.amount")}
                        required
                        type="text"
                        value={form.paymentAmount}
                    />
                    <div className="sl-amount-sign-reminder" role="note">
                        {t("amountSignReminder")}
                    </div>
                </div>

                <div className="form-check">
                    <input
                        checked={form.recurringTransactionAmountIsAdjustable}
                        className="form-check-input"
                        id={`${idPrefix}-amountIsAdjustable`}
                        onChange={(event) =>
                            updateField(
                                "recurringTransactionAmountIsAdjustable",
                                event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`${idPrefix}-amountIsAdjustable`}>
                        {t("recurring.fields.amountIsAdjustable")}
                    </label>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-firstPaymentDate`}>
                        {t("recurring.fields.firstPaymentDate")}
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-firstPaymentDate`}
                        onChange={(event) =>
                            updateField(
                                "recurringTransactionFirstPaymentDate",
                                event.target.value,
                            )
                        }
                        required
                        type="date"
                        value={form.recurringTransactionFirstPaymentDate}
                    />
                </div>

                <div className="row g-3">
                    <div className="col-12 col-md-5">
                        <label
                            className="form-label"
                            htmlFor={`${idPrefix}-recurrenceInterval`}>
                            {t("recurring.fields.recurrenceInterval")}
                        </label>
                        <input
                            className="form-control"
                            id={`${idPrefix}-recurrenceInterval`}
                            min={1}
                            onChange={(event) =>
                                updateField(
                                    "recurrenceInterval",
                                    event.target.value,
                                )
                            }
                            required
                            type="number"
                            value={form.recurrenceInterval}
                        />
                    </div>

                    <div className="col-12 col-md-7">
                        <label
                            className="form-label"
                            htmlFor={`${idPrefix}-recurrenceUnit`}>
                            {t("recurring.fields.recurrenceUnit")}
                        </label>
                        <select
                            className="form-select"
                            id={`${idPrefix}-recurrenceUnit`}
                            onChange={(event) =>
                                updateField(
                                    "recurrenceUnit",
                                    event.target.value,
                                )
                            }
                            required
                            value={form.recurrenceUnit}>
                            <option value="DAY">
                                {t(
                                    `recurring.recurrenceUnits.${recurrenceUnitTranslationKey}.day`,
                                )}
                            </option>
                            <option value="WEEK">
                                {t(
                                    `recurring.recurrenceUnits.${recurrenceUnitTranslationKey}.week`,
                                )}
                            </option>
                            <option value="MONTH">
                                {t(
                                    `recurring.recurrenceUnits.${recurrenceUnitTranslationKey}.month`,
                                )}
                            </option>
                            <option value="YEAR">
                                {t(
                                    `recurring.recurrenceUnits.${recurrenceUnitTranslationKey}.year`,
                                )}
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-paymentDateAdjustmentPolicy`}>
                        {t("recurring.fields.paymentDateAdjustmentPolicy")}
                    </label>
                    <select
                        className="form-select"
                        id={`${idPrefix}-paymentDateAdjustmentPolicy`}
                        onChange={(event) =>
                            updateField(
                                "paymentDateAdjustmentPolicy",
                                event.target.value,
                            )
                        }
                        value={form.paymentDateAdjustmentPolicy}>
                        <option value="NONE">
                            {t("recurring.paymentDatePolicies.none")}
                        </option>
                        <option value="PREVIOUS_BUSINESS_DAY">
                            {t("recurring.paymentDatePolicies.previous")}
                        </option>
                        <option value="NEXT_BUSINESS_DAY">
                            {t("recurring.paymentDatePolicies.next")}
                        </option>
                    </select>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-category`}>
                        {t("recurring.fields.category")}
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
                                {t("recurring.options.selectCategory")}
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
                        htmlFor={`${idPrefix}-financialPriority`}>
                        {t("recurring.fields.financialPriority")}
                    </label>
                    <select
                        className="form-select"
                        id={`${idPrefix}-financialPriority`}
                        onChange={(event) =>
                            updateField(
                                "financialPriorityId",
                                event.target.value,
                            )
                        }
                        required
                        value={form.financialPriorityId}>
                        <option value="">
                            {t("recurring.options.selectFinancialPriority")}
                        </option>
                        {sortedFinancialPriorities.map((priority) => (
                            <option
                                key={priority.financialPriorityId}
                                value={priority.financialPriorityId}>
                                {priority.financialPriorityDisplayName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-account`}>
                        {t("recurring.fields.account")}
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-account`}
                            onChange={(event) =>
                                updateLinkedAccount(event.target.value)
                            }
                            required
                            value={form.linkedAccountId}>
                            <option value="">
                                {t("recurring.options.selectAccount")}
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
                        {t("recurring.fields.creditCard")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-creditCard`}
                            onChange={(event) =>
                                updateField(
                                    "linkedCreditCardId",
                                    event.target.value,
                                )
                            }
                            value={form.linkedCreditCardId}>
                            <option value="">
                                {t("recurring.options.noCreditCard")}
                            </option>
                            {availableCreditCards.map((creditCard) => (
                                <option
                                    key={creditCard.creditCardId}
                                    value={creditCard.creditCardId}>
                                    {creditCard.creditCardName}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-outline-primary"
                            onClick={handleCreateCreditCardClick}
                            type="button">
                            {t("actions.newCreditCard")}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-bucket`}>
                        {t("recurring.fields.bucket")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <div className="input-group">
                        <select
                            className="form-select"
                            id={`${idPrefix}-bucket`}
                            onChange={(event) =>
                                updateField(
                                    "linkedBucketId",
                                    event.target.value,
                                )
                            }
                            value={form.linkedBucketId}>
                            <option value="">
                                {t("recurring.options.noBucket")}
                            </option>
                            {availableBuckets.map((bucket) => (
                                <option
                                    key={bucket.bucketId}
                                    value={bucket.bucketId}>
                                    {bucket.bucketName ??
                                        t("recurring.options.unnamedBucket")}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-outline-primary"
                            onClick={handleCreateBucketClick}
                            type="button">
                            {t("actions.newBucket")}
                        </button>
                    </div>

                    {form.linkedBucketId ? (
                        <div className="form-text mt-2">
                            {t("recurring.bucketAmountSignHint")}
                        </div>
                    ) : null}
                </div>

                {willGenerateTwoRecurringTransactions ? (
                    <div className="alert alert-info mb-0" role="status">
                        {t("recurring.twoMovementsHint")}
                    </div>
                ) : null}

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-endDate`}>
                        {t("recurring.fields.endDate")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-endDate`}
                        onChange={(event) =>
                            updateField(
                                "recurringTransactionEndDate",
                                event.target.value,
                            )
                        }
                        type="date"
                        value={form.recurringTransactionEndDate}
                    />
                </div>

                <div>
                    <label
                        className="form-label"
                        htmlFor={`${idPrefix}-finalPaymentAmount`}>
                        {t("recurring.fields.finalPaymentAmount")}{" "}
                        <span className="text-muted">
                            ({t("fields.optional")})
                        </span>
                    </label>
                    <input
                        className="form-control"
                        id={`${idPrefix}-finalPaymentAmount`}
                        inputMode="decimal"
                        onChange={(event) =>
                            updateField(
                                "finalPaymentAmount",
                                event.target.value,
                            )
                        }
                        placeholder={t("recurring.placeholders.amount")}
                        type="text"
                        value={form.finalPaymentAmount}
                    />
                </div>
                {showStandardRecurringOptions ? (
                    <div className="form-check">
                        <input
                            checked={form.recurringTransactionReminderEnabled}
                            className="form-check-input"
                            id={`${idPrefix}-reminderEnabled`}
                            onChange={(event) =>
                                updateField(
                                    "recurringTransactionReminderEnabled",
                                    event.target.checked,
                                )
                            }
                            type="checkbox"
                        />
                        <label
                            className="form-check-label"
                            htmlFor={`${idPrefix}-reminderEnabled`}>
                            {t("recurring.fields.reminderEnabled")}
                        </label>
                    </div>
                ) : null}

                {showStandardRecurringOptions &&
                form.recurringTransactionReminderEnabled ? (
                    <div>
                        <label
                            className="form-label"
                            htmlFor={`${idPrefix}-reminderDaysBefore`}>
                            {t("recurring.fields.reminderDaysBefore")}
                        </label>
                        <input
                            className="form-control"
                            id={`${idPrefix}-reminderDaysBefore`}
                            min={0}
                            onChange={(event) =>
                                updateField(
                                    "recurringTransactionReminderDaysBefore",
                                    event.target.value,
                                )
                            }
                            type="number"
                            value={form.recurringTransactionReminderDaysBefore}
                        />
                    </div>
                ) : null}

                <div className="d-flex flex-wrap gap-2">
                    <button
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        type="submit">
                        {isSubmitting
                            ? (submittingLabel ??
                              t("recurring.actions.submitting"))
                            : (submitLabel ?? t("recurring.actions.submit"))}
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
                    updateLinkedAccount(createdAccount.accountId)
                }
            />

            {isCreateCreditCardModalOpen ? (
                <CreateCreditCardModal
                    accounts={availableAccounts}
                    initialAccountId={form.linkedAccountId}
                    isOpen={isCreateCreditCardModalOpen}
                    onClose={() => setIsCreateCreditCardModalOpen(false)}
                    onCreated={selectCreatedCreditCard}
                />
            ) : null}

            {isCreateBucketModalOpen ? (
                <CreateBucketModal
                    accounts={availableAccounts}
                    initialAccountId={form.linkedAccountId}
                    isOpen={isCreateBucketModalOpen}
                    onClose={() => setIsCreateBucketModalOpen(false)}
                    onCreated={selectCreatedBucket}
                />
            ) : null}
        </>
    );
}

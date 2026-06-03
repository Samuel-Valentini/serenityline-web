import {
    Fragment,
    type ComponentProps,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    createCreditCard,
    deleteCreditCard,
    getCreditCard,
    updateCreditCard,
} from "../../features/finance/api/financeApi";
import type {
    CreditCardResponseDto,
    CreateCreditCardRequestDto,
    UpdateCreditCardRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectCreditCards,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import {
    creditCardAdded,
    creditCardDeleted,
    creditCardUpdated,
} from "../../features/finance/financeDataSlice";
import { ApiError } from "../../shared/api";

type CreditCardFormState = {
    creditCardName: string;
    creditCardDescription: string;
    creditCardChargeDay: string;
    accountId: string;
};

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const initialFormState: CreditCardFormState = {
    creditCardName: "",
    creditCardDescription: "",
    creditCardChargeDay: "15",
    accountId: "",
};

const WORKSPACE_SCROLL_OFFSET_PX = 96;

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

function isValidChargeDay(value: string) {
    const chargeDay = Number(value);

    return Number.isInteger(chargeDay) && chargeDay >= 1 && chargeDay <= 31;
}

function toCreditCardFormState(
    creditCard: CreditCardResponseDto,
): CreditCardFormState {
    return {
        creditCardName: creditCard.creditCardName,
        creditCardDescription: creditCard.creditCardDescription ?? "",
        creditCardChargeDay: String(creditCard.creditCardChargeDay),
        accountId: creditCard.accountId,
    };
}

export function CreditCardsPage() {
    const { t } = useTranslation("creditCards");
    const dispatch = useAppDispatch();
    const creditCardWorkspaceRef = useRef<HTMLElement | null>(null);

    const accounts = useAppSelector(selectAccounts);
    const creditCards = useAppSelector(selectCreditCards);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] = useState<CreditCardFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedCreditCardId, setSelectedCreditCardId] = useState<
        string | null
    >(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<CreditCardFormState | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(
        null,
    );

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const sortedCreditCards = useMemo(
        () =>
            [...creditCards].sort((first, second) =>
                first.creditCardName.localeCompare(second.creditCardName),
            ),
        [creditCards],
    );

    const selectedCreditCard = useMemo(
        () =>
            selectedCreditCardId
                ? (creditCards.find(
                      (creditCard) =>
                          creditCard.creditCardId === selectedCreditCardId,
                  ) ?? null)
                : null,
        [creditCards, selectedCreditCardId],
    );

    function getAccountName(accountId: string) {
        return (
            accounts.find((account) => account.accountId === accountId)
                ?.accountName ?? t("accountFallback")
        );
    }

    function requestCreditCardWorkspaceScroll() {
        if (typeof window === "undefined") {
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const workspaceElement = creditCardWorkspaceRef.current;

                if (!workspaceElement) {
                    return;
                }

                const workspaceTop =
                    workspaceElement.getBoundingClientRect().top +
                    window.scrollY -
                    WORKSPACE_SCROLL_OFFSET_PX;

                window.scrollTo({
                    behavior: "smooth",
                    top: Math.max(workspaceTop, 0),
                });
            });
        });
    }

    function updateField(field: keyof CreditCardFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    function updateEditField(field: keyof CreditCardFormState, value: string) {
        setEditForm((currentForm) =>
            currentForm
                ? {
                      ...currentForm,
                      [field]: value,
                  }
                : currentForm,
        );
        setEditError(null);
        setEditSuccessMessage(null);
    }

    async function selectCreditCard(creditCard: CreditCardResponseDto) {
        setSelectedCreditCardId(creditCard.creditCardId);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setDeleteError(null);
        setEditSuccessMessage(null);
        setSuccessMessage(null);
        setIsDetailLoading(true);
        requestCreditCardWorkspaceScroll();

        try {
            const creditCardDetail = await getCreditCard(
                creditCard.creditCardId,
            );
            dispatch(creditCardUpdated(creditCardDetail));
        } catch (error) {
            setDetailError(getErrorMessage(error, t("detailErrorFallback")));
        } finally {
            setIsDetailLoading(false);
        }
    }

    function startEdit(creditCard: CreditCardResponseDto) {
        setSelectedCreditCardId(creditCard.creditCardId);
        setEditForm(toCreditCardFormState(creditCard));
        setIsEditMode(true);
        setEditError(null);
        setDeleteError(null);
        setEditSuccessMessage(null);
    }

    function cancelEdit() {
        setIsEditMode(false);
        setEditForm(null);
        setEditError(null);
    }

    function showCreateCreditCardForm() {
        setSelectedCreditCardId(null);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setDeleteError(null);
        setEditSuccessMessage(null);
        setSuccessMessage(null);
        requestCreditCardWorkspaceScroll();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const creditCardName = form.creditCardName.trim();
        const creditCardChargeDay = Number(form.creditCardChargeDay);

        if (!creditCardName) {
            setFormError(t("validation.creditCardNameRequired"));
            return;
        }

        if (!form.accountId) {
            setFormError(t("validation.accountRequired"));
            return;
        }

        if (!isValidChargeDay(form.creditCardChargeDay)) {
            setFormError(t("validation.chargeDayInvalid"));
            return;
        }

        const request: CreateCreditCardRequestDto = {
            creditCardName,
            creditCardDescription: form.creditCardDescription.trim() || null,
            creditCardChargeDay,
            accountId: form.accountId,
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdCreditCard = await createCreditCard(request);

            dispatch(creditCardAdded(createdCreditCard));
            setSelectedCreditCardId(createdCreditCard.creditCardId);
            setIsEditMode(false);
            setEditForm(null);
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
            requestCreditCardWorkspaceScroll();
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        if (!selectedCreditCard || !editForm) {
            return;
        }

        const creditCardName = editForm.creditCardName.trim();
        const creditCardChargeDay = Number(editForm.creditCardChargeDay);

        if (!creditCardName) {
            setEditError(t("validation.creditCardNameRequired"));
            return;
        }

        if (!isValidChargeDay(editForm.creditCardChargeDay)) {
            setEditError(t("validation.chargeDayInvalid"));
            return;
        }

        const request: UpdateCreditCardRequestDto = {
            creditCardName,
            creditCardDescription:
                editForm.creditCardDescription.trim() || null,
            creditCardChargeDay,
        };

        setIsUpdating(true);
        setEditError(null);
        setEditSuccessMessage(null);

        try {
            const updatedCreditCard = await updateCreditCard(
                selectedCreditCard.creditCardId,
                request,
            );

            dispatch(creditCardUpdated(updatedCreditCard));
            setEditForm(toCreditCardFormState(updatedCreditCard));
            setIsEditMode(false);
            setEditSuccessMessage(t("editSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("editErrorFallback")));
        } finally {
            setIsUpdating(false);
        }
    };

    async function handleDeleteCreditCard() {
        if (!selectedCreditCard) {
            return;
        }

        const confirmed = window.confirm(t("deleteConfirm"));

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);
        setEditSuccessMessage(null);

        try {
            await deleteCreditCard(selectedCreditCard.creditCardId);

            dispatch(creditCardDeleted(selectedCreditCard.creditCardId));
            setSelectedCreditCardId(null);
            setIsEditMode(false);
            setEditForm(null);
            setSuccessMessage(t("deleteSuccess"));
            requestCreditCardWorkspaceScroll();
        } catch (error) {
            setDeleteError(getErrorMessage(error, t("deleteErrorFallback")));
        } finally {
            setIsDeleting(false);
        }
    }

    const isLoading =
        financeDataStatus === "idle" || financeDataStatus === "loading";

    return (
        <section className="sl-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <h1>{t("title")}</h1>
                <p className="lead">{t("subtitle")}</p>
            </header>

            {isLoading ? (
                <div className="alert alert-info" role="status">
                    {t("loading")}
                </div>
            ) : null}

            {financeDataStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("loadErrorTitle")}</h2>
                    <p className="mb-0">
                        {financeDataError?.message ?? t("loadErrorFallback")}
                    </p>
                </div>
            ) : null}

            <div className="row g-4">
                <div className="col-12 col-xl-7">
                    <article className="sl-panel">
                        <div className="d-flex align-items-start justify-content-between gap-3">
                            <div>
                                <p className="sl-eyebrow">{t("listEyebrow")}</p>
                                <h2>{t("listTitle")}</h2>
                            </div>
                            <span className="badge text-bg-light">
                                {t("creditCardsCount", {
                                    count: creditCards.length,
                                })}
                            </span>
                        </div>

                        {financeDataStatus === "loaded" &&
                        sortedCreditCards.length === 0 ? (
                            <p className="mb-0">{t("emptyState")}</p>
                        ) : null}

                        {sortedCreditCards.length > 0 ? (
                            <div className="table-responsive mt-3">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t("table.name")}
                                            </th>
                                            <th scope="col">
                                                {t("table.account")}
                                            </th>
                                            <th scope="col">
                                                {t("table.chargeDay")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCreditCards.map((creditCard) => {
                                            const isSelected =
                                                creditCard.creditCardId ===
                                                selectedCreditCardId;

                                            return (
                                                <Fragment
                                                    key={
                                                        creditCard.creditCardId
                                                    }>
                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td className="border-bottom-0">
                                                            <strong>
                                                                {
                                                                    creditCard.creditCardName
                                                                }
                                                            </strong>
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {getAccountName(
                                                                creditCard.accountId,
                                                            )}
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {t(
                                                                "chargeDayValue",
                                                                {
                                                                    day: creditCard.creditCardChargeDay,
                                                                },
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td colSpan={3}>
                                                            <div className="d-grid gap-2">
                                                                <p className="text-muted mb-0">
                                                                    {creditCard.creditCardDescription ??
                                                                        ""}
                                                                </p>

                                                                <div className="text-center">
                                                                    <button
                                                                        className={
                                                                            isSelected
                                                                                ? "btn btn-primary btn-sm w-100 my-1"
                                                                                : "btn btn-outline-primary btn-sm w-100 my-1"
                                                                        }
                                                                        onClick={() =>
                                                                            void selectCreditCard(
                                                                                creditCard,
                                                                            )
                                                                        }
                                                                        type="button">
                                                                        {t(
                                                                            "viewDetails",
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </article>
                </div>

                <div className="col-12 col-xl-5">
                    <article
                        className="sl-panel"
                        ref={creditCardWorkspaceRef}
                        tabIndex={-1}>
                        {successMessage ? (
                            <div className="alert alert-success" role="status">
                                {successMessage}
                            </div>
                        ) : null}

                        {!selectedCreditCard ? (
                            <>
                                <p className="sl-eyebrow">{t("formEyebrow")}</p>
                                <h2>{t("formTitle")}</h2>
                                <p>{t("formIntro")}</p>

                                {accounts.length === 0 ? (
                                    <div
                                        className="alert alert-warning"
                                        role="alert">
                                        {t("noAccountsWarning")}
                                    </div>
                                ) : null}

                                {formError ? (
                                    <div
                                        className="alert alert-danger"
                                        role="alert">
                                        {formError}
                                    </div>
                                ) : null}

                                <form
                                    className="d-grid gap-3"
                                    onSubmit={handleSubmit}>
                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="creditCardName">
                                            {t("fields.creditCardName")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="creditCardName"
                                            onChange={(event) =>
                                                updateField(
                                                    "creditCardName",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            type="text"
                                            value={form.creditCardName}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="accountId">
                                            {t("fields.account")}
                                        </label>
                                        <select
                                            className="form-select"
                                            disabled={accounts.length === 0}
                                            id="accountId"
                                            onChange={(event) =>
                                                updateField(
                                                    "accountId",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            value={form.accountId}>
                                            <option value="">
                                                {t("selectAccount")}
                                            </option>
                                            {accounts.map((account) => (
                                                <option
                                                    key={account.accountId}
                                                    value={account.accountId}>
                                                    {account.accountName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="creditCardChargeDay">
                                            {t("fields.chargeDay")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="creditCardChargeDay"
                                            max={31}
                                            min={1}
                                            onChange={(event) =>
                                                updateField(
                                                    "creditCardChargeDay",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            type="number"
                                            value={form.creditCardChargeDay}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="creditCardDescription">
                                            {t("fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="creditCardDescription"
                                            onChange={(event) =>
                                                updateField(
                                                    "creditCardDescription",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            value={form.creditCardDescription}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        disabled={
                                            isSubmitting ||
                                            accounts.length === 0
                                        }
                                        type="submit">
                                        {isSubmitting
                                            ? t("createSubmitting")
                                            : t("createSubmit")}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div>
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                    <div>
                                        <p className="sl-eyebrow">
                                            {t("detailEyebrow")}
                                        </p>
                                        <h3 className="h4 mb-1">
                                            {selectedCreditCard.creditCardName}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            {selectedCreditCard.creditCardDescription ??
                                                ""}
                                        </p>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={showCreateCreditCardForm}
                                            type="button">
                                            {t("newCreditCard")}
                                        </button>

                                        {!isEditMode ? (
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() =>
                                                    startEdit(
                                                        selectedCreditCard,
                                                    )
                                                }
                                                type="button">
                                                {t("edit")}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {isEditMode && editForm ? (
                                    <form
                                        aria-label={t("editFormAriaLabel")}
                                        className="d-grid gap-3 mt-4"
                                        onSubmit={handleUpdateSubmit}>
                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editCreditCardName">
                                                {t("fields.creditCardName")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="editCreditCardName"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "creditCardName",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                type="text"
                                                value={editForm.creditCardName}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editAccountId">
                                                {t("fields.account")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="editAccountId"
                                                readOnly
                                                type="text"
                                                value={getAccountName(
                                                    editForm.accountId,
                                                )}
                                            />
                                            <p className="form-text">
                                                {t("accountReadonlyHelp")}
                                            </p>
                                        </div>

                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editCreditCardChargeDay">
                                                {t("fields.chargeDay")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="editCreditCardChargeDay"
                                                max={31}
                                                min={1}
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "creditCardChargeDay",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                type="number"
                                                value={
                                                    editForm.creditCardChargeDay
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editCreditCardDescription">
                                                {t("fields.description")}{" "}
                                                <span className="text-muted">
                                                    ({t("fields.optional")})
                                                </span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="editCreditCardDescription"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "creditCardDescription",
                                                        event.target.value,
                                                    )
                                                }
                                                rows={3}
                                                value={
                                                    editForm.creditCardDescription
                                                }
                                            />
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                className="btn btn-primary"
                                                disabled={isUpdating}
                                                type="submit">
                                                {isUpdating
                                                    ? t("updateSubmitting")
                                                    : t("updateSubmit")}
                                            </button>

                                            <button
                                                className="btn btn-outline-secondary"
                                                disabled={isUpdating}
                                                onClick={cancelEdit}
                                                type="button">
                                                {t("cancelEdit")}
                                            </button>
                                        </div>
                                    </form>
                                ) : null}

                                {detailError ? (
                                    <div
                                        className="alert alert-danger mt-4"
                                        role="alert">
                                        {detailError}
                                    </div>
                                ) : null}

                                {isDetailLoading ? (
                                    <div
                                        className="alert alert-info mt-4"
                                        role="status">
                                        {t("detailLoading")}
                                    </div>
                                ) : null}

                                <dl className="row mt-4 mb-0">
                                    <dt className="col-sm-4">
                                        {t("fields.account")}
                                    </dt>
                                    <dd className="col-sm-8">
                                        {getAccountName(
                                            selectedCreditCard.accountId,
                                        )}
                                    </dd>

                                    <dt className="col-sm-4">
                                        {t("fields.chargeDay")}
                                    </dt>
                                    <dd className="col-sm-8">
                                        {t("chargeDayValue", {
                                            day: selectedCreditCard.creditCardChargeDay,
                                        })}
                                    </dd>
                                </dl>

                                {editSuccessMessage ? (
                                    <div
                                        className="alert alert-success mt-4"
                                        role="status">
                                        {editSuccessMessage}
                                    </div>
                                ) : null}

                                {editError ? (
                                    <div
                                        className="alert alert-danger mt-4"
                                        role="alert">
                                        {editError}
                                    </div>
                                ) : null}

                                {deleteError ? (
                                    <div
                                        className="alert alert-danger mt-4"
                                        role="alert">
                                        {deleteError}
                                    </div>
                                ) : null}

                                <div className="border-top mt-4 pt-4">
                                    <p className="text-muted small">
                                        {t("deleteHint")}
                                    </p>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        disabled={isDeleting}
                                        onClick={() =>
                                            void handleDeleteCreditCard()
                                        }
                                        type="button">
                                        {isDeleting
                                            ? t("deleteSubmitting")
                                            : t("deleteSubmit")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}

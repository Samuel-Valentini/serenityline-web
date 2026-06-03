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
    createAccount,
    getAccount,
    updateAccount,
} from "../../features/finance/api/financeApi";
import type {
    AccountResponseDto,
    CreateAccountRequestDto,
    UpdateAccountRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import {
    accountAdded,
    accountUpdated,
} from "../../features/finance/financeDataSlice";
import { ApiError } from "../../shared/api";
import { getCurrencyOptions } from "../../features/finance/currencyOptions";

type AccountFormState = {
    accountName: string;
    currency: string;
    openingBalance: string;
    openingBalanceDate: string;
    issuingInstitution: string;
    accountDescription: string;
};

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const initialFormState: AccountFormState = {
    accountName: "",
    currency: "EUR",
    openingBalance: "0",
    openingBalanceDate: new Date().toISOString().slice(0, 10),
    issuingInstitution: "",
    accountDescription: "",
};

function getMoneyLocale(language: string) {
    return language.toLowerCase().startsWith("en") ? "en-US" : "it-IT";
}

function formatMoney(
    value: number | null | undefined,
    currency: string,
    language: string,
    fallback = "—",
) {
    if (value == null) {
        return fallback;
    }

    return new Intl.NumberFormat(getMoneyLocale(language), {
        currency,
        style: "currency",
    }).format(value);
}

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

type DecimalSeparator = "," | ".";

function getDecimalSeparator(language: string): DecimalSeparator {
    return language.toLowerCase().startsWith("it") ? "," : ".";
}

function getOpeningBalancePattern(decimalSeparator: DecimalSeparator) {
    const separator = decimalSeparator === "." ? "\\." : ",";

    return new RegExp(`^-?\\d{1,17}(${separator}\\d{1,2})?$`);
}

function isValidOpeningBalance(
    value: string,
    decimalSeparator: DecimalSeparator,
) {
    return getOpeningBalancePattern(decimalSeparator).test(value.trim());
}

function normalizeOpeningBalance(
    value: string,
    decimalSeparator: DecimalSeparator,
) {
    const trimmedValue = value.trim();

    return decimalSeparator === ","
        ? trimmedValue.replace(",", ".")
        : trimmedValue;
}

function formatOpeningBalanceForInput(
    value: number | null | undefined,
    decimalSeparator: DecimalSeparator,
) {
    const normalizedValue = (value ?? 0).toFixed(2);

    return decimalSeparator === ","
        ? normalizedValue.replace(".", ",")
        : normalizedValue;
}

function toAccountFormState(
    account: AccountResponseDto,
    decimalSeparator: DecimalSeparator,
): AccountFormState {
    return {
        accountName: account.accountName,
        currency: account.currency,
        openingBalance: formatOpeningBalanceForInput(
            account.openingBalance,
            decimalSeparator,
        ),
        openingBalanceDate: account.openingBalanceDate,
        issuingInstitution: account.issuingInstitution ?? "",
        accountDescription: account.accountDescription ?? "",
    };
}

const WORKSPACE_SCROLL_OFFSET_PX = 96;

export function AccountsPage() {
    const { t, i18n } = useTranslation("accounts");
    const decimalSeparator = getDecimalSeparator(i18n.language);
    const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
    const accountWorkspaceRef = useRef<HTMLElement | null>(null);
    const dispatch = useAppDispatch();

    const currencyOptions = useMemo(() => getCurrencyOptions(), []);

    const accounts = useAppSelector(selectAccounts);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] = useState<AccountFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
        null,
    );
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<AccountFormState | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(
        null,
    );

    const sortedAccounts = useMemo(
        () =>
            [...accounts].sort((first, second) =>
                first.accountName.localeCompare(second.accountName),
            ),
        [accounts],
    );

    const selectedAccount = useMemo(
        () =>
            selectedAccountId
                ? (accounts.find(
                      (account) => account.accountId === selectedAccountId,
                  ) ?? null)
                : null,
        [accounts, selectedAccountId],
    );

    function requestAccountWorkspaceScroll() {
        if (typeof window === "undefined") {
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const workspaceElement = accountWorkspaceRef.current;

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

    function updateField(field: keyof AccountFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    function updateEditField(field: keyof AccountFormState, value: string) {
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

    async function selectAccount(account: AccountResponseDto) {
        setSelectedAccountId(account.accountId);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setEditSuccessMessage(null);
        setSuccessMessage(null);
        setIsDetailLoading(true);
        requestAccountWorkspaceScroll();

        try {
            const accountDetail = await getAccount(account.accountId);
            dispatch(accountUpdated(accountDetail));
        } catch (error) {
            setDetailError(getErrorMessage(error, t("detailErrorFallback")));
        } finally {
            setIsDetailLoading(false);
        }
    }

    function startEdit(account: AccountResponseDto) {
        setSelectedAccountId(account.accountId);
        setEditForm(toAccountFormState(account, decimalSeparator));
        setIsEditMode(true);
        setEditError(null);
        setEditSuccessMessage(null);
    }

    function cancelEdit() {
        setIsEditMode(false);
        setEditForm(null);
        setEditError(null);
    }

    function showCreateAccountForm() {
        setSelectedAccountId(null);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setEditSuccessMessage(null);
        setSuccessMessage(null);
        requestAccountWorkspaceScroll();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        const accountName = form.accountName.trim();
        const currency = form.currency.trim().toUpperCase();
        const openingBalanceText = form.openingBalance.trim();

        if (!accountName) {
            setFormError(t("validation.accountNameRequired"));
            return;
        }

        if (!/^[A-Z]{3}$/.test(currency)) {
            setFormError(t("validation.currencyInvalid"));
            return;
        }

        if (!isValidOpeningBalance(openingBalanceText, decimalSeparator)) {
            setFormError(t("validation.openingBalanceInvalid"));
            return;
        }

        const openingBalance = normalizeOpeningBalance(
            openingBalanceText,
            decimalSeparator,
        );

        if (!form.openingBalanceDate) {
            setFormError(t("validation.openingBalanceDateRequired"));
            return;
        }

        const request: CreateAccountRequestDto = {
            accountName,
            currency,
            openingBalance,
            openingBalanceDate: form.openingBalanceDate,
            ...(form.issuingInstitution.trim()
                ? { issuingInstitution: form.issuingInstitution.trim() }
                : {}),
            ...(form.accountDescription.trim()
                ? { accountDescription: form.accountDescription.trim() }
                : {}),
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdAccount = await createAccount(request);

            dispatch(accountAdded(createdAccount));
            setSelectedAccountId(createdAccount.accountId);
            setIsEditMode(false);
            setEditForm(null);
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
            requestAccountWorkspaceScroll();
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        if (!selectedAccount || !editForm) {
            return;
        }

        const accountName = editForm.accountName.trim();
        const openingBalanceText = editForm.openingBalance.trim();

        if (!accountName) {
            setEditError(t("validation.accountNameRequired"));
            return;
        }

        if (!isValidOpeningBalance(openingBalanceText, decimalSeparator)) {
            setEditError(t("validation.openingBalanceInvalid"));
            return;
        }

        const openingBalance = normalizeOpeningBalance(
            openingBalanceText,
            decimalSeparator,
        );

        if (!editForm.openingBalanceDate) {
            setEditError(t("validation.openingBalanceDateRequired"));
            return;
        }

        const request: UpdateAccountRequestDto = {
            accountName,
            accountDescription: editForm.accountDescription.trim() || null,
            issuingInstitution: editForm.issuingInstitution.trim() || null,
            openingBalance,
            openingBalanceDate: editForm.openingBalanceDate,
        };

        setIsUpdating(true);
        setEditError(null);
        setEditSuccessMessage(null);

        try {
            const updatedAccount = await updateAccount(
                selectedAccount.accountId,
                request,
            );

            dispatch(accountUpdated(updatedAccount));
            setEditForm(toAccountFormState(updatedAccount, decimalSeparator));
            setIsEditMode(false);
            setEditSuccessMessage(t("editSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("editErrorFallback")));
        } finally {
            setIsUpdating(false);
        }
    };

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
                                {t("accountsCount", {
                                    count: accounts.length,
                                })}
                            </span>
                        </div>

                        {financeDataStatus === "loaded" &&
                        sortedAccounts.length === 0 ? (
                            <p className="mb-0">{t("emptyState")}</p>
                        ) : null}

                        {sortedAccounts.length > 0 ? (
                            <div className="table-responsive mt-3">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t("table.name")}
                                            </th>
                                            <th scope="col">
                                                {t("table.institution")}
                                            </th>
                                            <th scope="col">
                                                {t("table.openingBalance")}
                                            </th>
                                            <th scope="col">
                                                {t("table.date")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAccounts.map((account) => {
                                            const isSelected =
                                                account.accountId ===
                                                selectedAccountId;

                                            return (
                                                <Fragment
                                                    key={account.accountId}>
                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td className="border-bottom-0">
                                                            <strong>
                                                                {
                                                                    account.accountName
                                                                }
                                                            </strong>
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {account.issuingInstitution ??
                                                                ""}
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {formatMoney(
                                                                account.openingBalance,
                                                                account.currency,
                                                                currentLanguage,
                                                            )}
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {
                                                                account.openingBalanceDate
                                                            }
                                                        </td>
                                                    </tr>

                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td colSpan={4}>
                                                            <div className="d-grid gap-2">
                                                                <p className="text-muted mb-0">
                                                                    {account.accountDescription ??
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
                                                                            void selectAccount(
                                                                                account,
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
                    <article className="sl-panel" ref={accountWorkspaceRef} tabIndex={-1}>
                        {successMessage ? (
                            <div className="alert alert-success" role="status">
                                {successMessage}
                            </div>
                        ) : null}

                        {!selectedAccount ? (
                            <>
                                <p className="sl-eyebrow">{t("formEyebrow")}</p>
                                <h2>{t("formTitle")}</h2>
                                <p>{t("formIntro")}</p>

                                {formError ? (
                                    <div
                                        className="alert alert-danger"
                                        role="alert">
                                        {formError}
                                    </div>
                                ) : null}

                                {successMessage ? (
                                    <div
                                        className="alert alert-success"
                                        role="status">
                                        {successMessage}
                                    </div>
                                ) : null}

                                <form
                                    className="d-grid gap-3"
                                    onSubmit={handleSubmit}>
                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="accountName">
                                            {t("fields.accountName")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="accountName"
                                            onChange={(event) =>
                                                updateField(
                                                    "accountName",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            type="text"
                                            value={form.accountName}
                                        />
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label
                                                className="form-label"
                                                htmlFor="currency">
                                                {t("fields.currency")}
                                            </label>
                                            <select
                                                className="form-select"
                                                id="currency"
                                                onChange={(event) =>
                                                    updateField(
                                                        "currency",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                value={form.currency}>
                                                {currencyOptions.map(
                                                    (currency) => (
                                                        <option
                                                            key={currency}
                                                            value={currency}>
                                                            {currency}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label
                                                className="form-label"
                                                htmlFor="openingBalanceDate">
                                                {t("fields.openingBalanceDate")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="openingBalanceDate"
                                                onChange={(event) =>
                                                    updateField(
                                                        "openingBalanceDate",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                type="date"
                                                value={form.openingBalanceDate}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="openingBalance">
                                            {t("fields.openingBalance")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="openingBalance"
                                            inputMode="decimal"
                                            onChange={(event) =>
                                                updateField(
                                                    "openingBalance",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                decimalSeparator === ","
                                                    ? "0,00"
                                                    : "0.00"
                                            }
                                            required
                                            type="text"
                                            value={form.openingBalance}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="issuingInstitution">
                                            {t("fields.issuingInstitution")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </label>
                                        <input
                                            className="form-control"
                                            id="issuingInstitution"
                                            onChange={(event) =>
                                                updateField(
                                                    "issuingInstitution",
                                                    event.target.value,
                                                )
                                            }
                                            type="text"
                                            value={form.issuingInstitution}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="accountDescription">
                                            {t("fields.accountDescription")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="accountDescription"
                                            onChange={(event) =>
                                                updateField(
                                                    "accountDescription",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            value={form.accountDescription}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                        type="submit">
                                        {isSubmitting
                                            ? t("createSubmitting")
                                            : t("createSubmit")}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="d-flex align-items-start justify-content-between gap-3">
                                        <div>
                                            <p className="sl-eyebrow">
                                                {t("detailEyebrow")}
                                            </p>
                                            <h3 className="h4 mb-1">
                                                {selectedAccount.accountName}
                                            </h3>
                                            <p className="text-muted mb-0">
                                                {selectedAccount.accountDescription ??
                                                    ""}
                                            </p>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 justify-content-end">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={showCreateAccountForm}
                                                type="button">
                                                {t("newAccount")}
                                            </button>

                                            {!isEditMode ? (
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() =>
                                                        startEdit(
                                                            selectedAccount,
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
                                                    htmlFor="editAccountName">
                                                    {t("fields.accountName")}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="editAccountName"
                                                    onChange={(event) =>
                                                        updateEditField(
                                                            "accountName",
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    type="text"
                                                    value={editForm.accountName}
                                                />
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-12 col-md-6">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="editCurrency">
                                                        {t("fields.currency")}
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        id="editCurrency"
                                                        readOnly
                                                        type="text"
                                                        value={
                                                            editForm.currency
                                                        }
                                                    />
                                                    <p className="form-text">
                                                        {t(
                                                            "currencyReadonlyHelp",
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="editOpeningBalanceDate">
                                                        {t(
                                                            "fields.openingBalanceDate",
                                                        )}
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        id="editOpeningBalanceDate"
                                                        onChange={(event) =>
                                                            updateEditField(
                                                                "openingBalanceDate",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        required
                                                        type="date"
                                                        value={
                                                            editForm.openingBalanceDate
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    className="form-label"
                                                    htmlFor="editOpeningBalance">
                                                    {t("fields.openingBalance")}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="editOpeningBalance"
                                                    inputMode="decimal"
                                                    onChange={(event) =>
                                                        updateEditField(
                                                            "openingBalance",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        decimalSeparator === ","
                                                            ? "0,00"
                                                            : "0.00"
                                                    }
                                                    required
                                                    type="text"
                                                    value={
                                                        editForm.openingBalance
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="form-label"
                                                    htmlFor="editIssuingInstitution">
                                                    {t(
                                                        "fields.issuingInstitution",
                                                    )}{" "}
                                                    <span className="text-muted">
                                                        ({t("fields.optional")})
                                                    </span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="editIssuingInstitution"
                                                    onChange={(event) =>
                                                        updateEditField(
                                                            "issuingInstitution",
                                                            event.target.value,
                                                        )
                                                    }
                                                    type="text"
                                                    value={
                                                        editForm.issuingInstitution
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="form-label"
                                                    htmlFor="editAccountDescription">
                                                    {t(
                                                        "fields.accountDescription",
                                                    )}{" "}
                                                    <span className="text-muted">
                                                        ({t("fields.optional")})
                                                    </span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    id="editAccountDescription"
                                                    onChange={(event) =>
                                                        updateEditField(
                                                            "accountDescription",
                                                            event.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                    value={
                                                        editForm.accountDescription
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
                                            {t("fields.currency")}
                                        </dt>
                                        <dd className="col-sm-8">
                                            {selectedAccount.currency}
                                        </dd>

                                        <dt className="col-sm-4">
                                            {t("fields.openingBalance")}
                                        </dt>
                                        <dd className="col-sm-8">
                                            {formatMoney(
                                                selectedAccount.openingBalance,
                                                selectedAccount.currency,
                                                currentLanguage,
                                            )}
                                        </dd>

                                        <dt className="col-sm-4">
                                            {t("fields.openingBalanceDate")}
                                        </dt>
                                        <dd className="col-sm-8">
                                            {selectedAccount.openingBalanceDate}
                                        </dd>

                                        <dt className="col-sm-4">
                                            {t("fields.issuingInstitution")}
                                        </dt>
                                        <dd className="col-sm-8">
                                            {selectedAccount.issuingInstitution ??
                                                ""}
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
                                </div>
                            </>
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}

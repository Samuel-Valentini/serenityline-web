import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import { createAccount } from "../../features/finance/api/financeApi";
import type { CreateAccountRequestDto } from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import { accountAdded } from "../../features/finance/financeDataSlice";
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

const initialFormState: AccountFormState = {
    accountName: "",
    currency: "EUR",
    openingBalance: "0",
    openingBalanceDate: new Date().toISOString().slice(0, 10),
    issuingInstitution: "",
    accountDescription: "",
};

function formatMoney(amount: number | null | undefined, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
    }).format(amount ?? 0);
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

export function AccountsPage() {
    const { t, i18n } = useTranslation("accounts");
    const decimalSeparator = getDecimalSeparator(i18n.language);
    const dispatch = useAppDispatch();

    const currencyOptions = useMemo(() => getCurrencyOptions(), []);

    const accounts = useAppSelector(selectAccounts);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] = useState<AccountFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const sortedAccounts = useMemo(
        () =>
            [...accounts].sort((first, second) =>
                first.accountName.localeCompare(second.accountName),
            ),
        [accounts],
    );

    function updateField(field: keyof AccountFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
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
                                        {sortedAccounts.map((account) => (
                                            <tr key={account.accountId}>
                                                <td>
                                                    <strong>
                                                        {account.accountName}
                                                    </strong>
                                                    {account.accountDescription ? (
                                                        <p className="mb-0 text-muted small">
                                                            {
                                                                account.accountDescription
                                                            }
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td>
                                                    {account.issuingInstitution ??
                                                        t("notProvided")}
                                                </td>
                                                <td>
                                                    {formatMoney(
                                                        account.openingBalance,
                                                        account.currency,
                                                    )}
                                                </td>
                                                <td>
                                                    {account.openingBalanceDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </article>
                </div>

                <div className="col-12 col-xl-5">
                    <article className="sl-panel">
                        <p className="sl-eyebrow">{t("formEyebrow")}</p>
                        <h2>{t("formTitle")}</h2>
                        <p>{t("formIntro")}</p>

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

                        <form className="d-grid gap-3" onSubmit={handleSubmit}>
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
                                        {currencyOptions.map((currency) => (
                                            <option
                                                key={currency}
                                                value={currency}>
                                                {currency}
                                            </option>
                                        ))}
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
                    </article>
                </div>
            </div>
        </section>
    );
}

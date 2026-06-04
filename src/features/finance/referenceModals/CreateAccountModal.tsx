import { type ComponentProps, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "../../../app/store/hooks";
import { ApiError } from "../../../shared/api";
import { createAccount } from "../api/financeApi";
import type {
    AccountResponseDto,
    CreateAccountRequestDto,
} from "../api/financeApiTypes";
import { getCurrencyOptions } from "../currencyOptions";
import { accountAdded } from "../financeDataSlice";
import { normalizeMoneyInput } from "../transactionForms/moneyInput";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type CreateAccountModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (account: AccountResponseDto) => void;
};

type AccountFormState = {
    accountName: string;
    accountDescription: string;
    currency: string;
    issuingInstitution: string;
    openingBalance: string;
    openingBalanceDate: string;
};

function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

function getInitialFormState(): AccountFormState {
    return {
        accountName: "",
        accountDescription: "",
        currency: "EUR",
        issuingInstitution: "",
        openingBalance: "0",
        openingBalanceDate: getTodayIsoDate(),
    };
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

export function CreateAccountModal({
    isOpen,
    onClose,
    onCreated,
}: CreateAccountModalProps) {
    const { i18n, t } = useTranslation("referenceModals");
    const dispatch = useAppDispatch();

    const currencyOptions = useMemo(() => getCurrencyOptions(), []);

    const [form, setForm] = useState<AccountFormState>(() =>
        getInitialFormState(),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    function updateField(field: keyof AccountFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
    }

    function handleClose() {
        if (isSubmitting) {
            return;
        }

        setForm(getInitialFormState());
        setFormError(null);
        onClose();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const accountName = form.accountName.trim();
        const currency = form.currency.trim().toUpperCase();
        const openingBalance = normalizeMoneyInput(
            form.openingBalance,
            i18n.language,
        );

        if (!accountName) {
            setFormError(t("account.validation.nameRequired"));
            return;
        }

        if (!/^[A-Z]{3}$/.test(currency)) {
            setFormError(t("account.validation.currencyInvalid"));
            return;
        }

        if (!openingBalance) {
            setFormError(t("account.validation.openingBalanceInvalid"));
            return;
        }

        if (!form.openingBalanceDate) {
            setFormError(t("account.validation.openingBalanceDateRequired"));
            return;
        }

        const request: CreateAccountRequestDto = {
            accountName,
            accountDescription: form.accountDescription.trim() || null,
            currency,
            issuingInstitution: form.issuingInstitution.trim() || null,
            openingBalance,
            openingBalanceDate: form.openingBalanceDate,
        };

        setIsSubmitting(true);
        setFormError(null);

        try {
            const createdAccount = await createAccount(request);

            dispatch(accountAdded(createdAccount));
            onCreated(createdAccount);
            setForm(getInitialFormState());
            onClose();
        } catch (error) {
            setFormError(
                getErrorMessage(error, t("account.createErrorFallback")),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                aria-labelledby="createAccountModalTitle"
                aria-modal="true"
                className="modal d-block"
                role="dialog"
                tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <div>
                                    <p className="sl-eyebrow mb-1">
                                        {t("account.eyebrow")}
                                    </p>
                                    <h2
                                        className="modal-title h5"
                                        id="createAccountModalTitle">
                                        {t("account.title")}
                                    </h2>
                                </div>

                                <button
                                    aria-label={t("common.close")}
                                    className="btn-close"
                                    disabled={isSubmitting}
                                    onClick={handleClose}
                                    type="button"
                                />
                            </div>

                            <div className="modal-body">
                                <p className="text-muted">
                                    {t("account.intro")}
                                </p>

                                {formError ? (
                                    <div
                                        className="alert alert-danger"
                                        role="alert">
                                        {formError}
                                    </div>
                                ) : null}

                                <div className="d-grid gap-3">
                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createAccountName">
                                            {t("account.fields.name")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createAccountName"
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

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createAccountDescription">
                                            {t("account.fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="createAccountDescription"
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

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createAccountCurrency">
                                            {t("account.fields.currency")}
                                        </label>
                                        <select
                                            className="form-select"
                                            id="createAccountCurrency"
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

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createAccountIssuingInstitution">
                                            {t(
                                                "account.fields.issuingInstitution",
                                            )}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createAccountIssuingInstitution"
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
                                            htmlFor="createAccountOpeningBalance">
                                            {t("account.fields.openingBalance")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createAccountOpeningBalance"
                                            inputMode="decimal"
                                            onChange={(event) =>
                                                updateField(
                                                    "openingBalance",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={t(
                                                "account.placeholders.openingBalance",
                                            )}
                                            required
                                            type="text"
                                            value={form.openingBalance}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createAccountOpeningBalanceDate">
                                            {t(
                                                "account.fields.openingBalanceDate",
                                            )}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createAccountOpeningBalanceDate"
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
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary"
                                    disabled={isSubmitting}
                                    onClick={handleClose}
                                    type="button">
                                    {t("common.cancel")}
                                </button>

                                <button
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    type="submit">
                                    {isSubmitting
                                        ? t("account.submitting")
                                        : t("account.submit")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show" />
        </>
    );
}

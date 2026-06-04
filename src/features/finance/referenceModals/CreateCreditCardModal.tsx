import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "../../../app/store/hooks";
import { ApiError } from "../../../shared/api";
import { createCreditCard } from "../api/financeApi";
import type {
    AccountResponseDto,
    CreateCreditCardRequestDto,
    CreditCardResponseDto,
} from "../api/financeApiTypes";
import { creditCardAdded } from "../financeDataSlice";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type CreateCreditCardModalProps = {
    isOpen: boolean;
    accounts: AccountResponseDto[];
    initialAccountId?: string | null;
    onClose: () => void;
    onCreated: (creditCard: CreditCardResponseDto) => void;
};

type CreditCardFormState = {
    creditCardName: string;
    creditCardDescription: string;
    creditCardChargeDay: string;
    accountId: string;
};

function getInitialFormState(
    initialAccountId?: string | null,
): CreditCardFormState {
    return {
        creditCardName: "",
        creditCardDescription: "",
        creditCardChargeDay: "1",
        accountId: initialAccountId ?? "",
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

export function CreateCreditCardModal({
    accounts,
    initialAccountId,
    isOpen,
    onClose,
    onCreated,
}: CreateCreditCardModalProps) {
    const { t } = useTranslation("referenceModals");
    const dispatch = useAppDispatch();

    const [form, setForm] = useState<CreditCardFormState>(() =>
        getInitialFormState(initialAccountId),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    function updateField(field: keyof CreditCardFormState, value: string) {
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

        setForm(getInitialFormState(initialAccountId));
        setFormError(null);
        onClose();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const creditCardName = form.creditCardName.trim();
        const creditCardChargeDay = Number(form.creditCardChargeDay);

        if (!creditCardName) {
            setFormError(t("creditCard.validation.nameRequired"));
            return;
        }

        if (
            !Number.isInteger(creditCardChargeDay) ||
            creditCardChargeDay < 1 ||
            creditCardChargeDay > 31
        ) {
            setFormError(t("creditCard.validation.chargeDayInvalid"));
            return;
        }

        if (!form.accountId) {
            setFormError(t("creditCard.validation.accountRequired"));
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

        try {
            const createdCreditCard = await createCreditCard(request);

            dispatch(creditCardAdded(createdCreditCard));
            onCreated(createdCreditCard);
            setForm(getInitialFormState(initialAccountId));
            onClose();
        } catch (error) {
            setFormError(
                getErrorMessage(error, t("creditCard.createErrorFallback")),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                aria-labelledby="createCreditCardModalTitle"
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
                                        {t("creditCard.eyebrow")}
                                    </p>
                                    <h2
                                        className="modal-title h5"
                                        id="createCreditCardModalTitle">
                                        {t("creditCard.title")}
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
                                    {t("creditCard.intro")}
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
                                            htmlFor="createCreditCardName">
                                            {t("creditCard.fields.name")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createCreditCardName"
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
                                            htmlFor="createCreditCardDescription">
                                            {t("creditCard.fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="createCreditCardDescription"
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

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createCreditCardChargeDay">
                                            {t("creditCard.fields.chargeDay")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createCreditCardChargeDay"
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
                                            htmlFor="createCreditCardAccount">
                                            {t("creditCard.fields.account")}
                                        </label>
                                        <select
                                            className="form-select"
                                            id="createCreditCardAccount"
                                            onChange={(event) =>
                                                updateField(
                                                    "accountId",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            value={form.accountId}>
                                            <option value="">
                                                {t(
                                                    "creditCard.options.selectAccount",
                                                )}
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
                                        ? t("creditCard.submitting")
                                        : t("creditCard.submit")}
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

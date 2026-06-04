import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "../../../app/store/hooks";
import { ApiError } from "../../../shared/api";
import { createBucket } from "../api/financeApi";
import type {
    AccountResponseDto,
    BucketResponseDto,
    CreateBucketRequestDto,
} from "../api/financeApiTypes";
import { bucketAdded } from "../financeDataSlice";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type CreateBucketModalProps = {
    isOpen: boolean;
    accounts: AccountResponseDto[];
    initialAccountId?: string | null;
    onClose: () => void;
    onCreated: (bucket: BucketResponseDto) => void;
};

type BucketFormState = {
    bucketName: string;
    bucketDescription: string;
    accountIds: string[];
};

function getInitialFormState(
    initialAccountId?: string | null,
): BucketFormState {
    return {
        bucketName: "",
        bucketDescription: "",
        accountIds: initialAccountId ? [initialAccountId] : [],
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

export function CreateBucketModal({
    accounts,
    initialAccountId,
    isOpen,
    onClose,
    onCreated,
}: CreateBucketModalProps) {
    const { t } = useTranslation("referenceModals");
    const dispatch = useAppDispatch();

    const [form, setForm] = useState<BucketFormState>(() =>
        getInitialFormState(initialAccountId),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    function updateField(field: keyof BucketFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
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

        const bucketName = form.bucketName.trim();

        if (!bucketName) {
            setFormError(t("bucket.validation.nameRequired"));
            return;
        }

        const request: CreateBucketRequestDto = {
            bucketName,
            bucketDescription: form.bucketDescription.trim() || null,
            accountIds: form.accountIds.length > 0 ? form.accountIds : null,
        };

        setIsSubmitting(true);
        setFormError(null);

        try {
            const createdBucket = await createBucket(request);

            dispatch(bucketAdded(createdBucket));
            onCreated(createdBucket);
            setForm(getInitialFormState(initialAccountId));
            onClose();
        } catch (error) {
            setFormError(
                getErrorMessage(error, t("bucket.createErrorFallback")),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                aria-labelledby="createBucketModalTitle"
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
                                        {t("bucket.eyebrow")}
                                    </p>
                                    <h2
                                        className="modal-title h5"
                                        id="createBucketModalTitle">
                                        {t("bucket.title")}
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
                                    {t("bucket.intro")}
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
                                            htmlFor="createBucketName">
                                            {t("bucket.fields.name")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createBucketName"
                                            onChange={(event) =>
                                                updateField(
                                                    "bucketName",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            type="text"
                                            value={form.bucketName}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createBucketDescription">
                                            {t("bucket.fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="createBucketDescription"
                                            onChange={(event) =>
                                                updateField(
                                                    "bucketDescription",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            value={form.bucketDescription}
                                        />
                                    </div>

                                    <fieldset>
                                        <legend className="form-label">
                                            {t("bucket.fields.accounts")}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </legend>

                                        {accounts.length === 0 ? (
                                            <p className="text-muted mb-0">
                                                {t("bucket.noAccountsHint")}
                                            </p>
                                        ) : (
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
                                                            id={`createBucketAccount-${account.accountId}`}
                                                            onChange={() =>
                                                                toggleAccount(
                                                                    account.accountId,
                                                                )
                                                            }
                                                            type="checkbox"
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`createBucketAccount-${account.accountId}`}>
                                                            {
                                                                account.accountName
                                                            }
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </fieldset>
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
                                        ? t("bucket.submitting")
                                        : t("bucket.submit")}
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

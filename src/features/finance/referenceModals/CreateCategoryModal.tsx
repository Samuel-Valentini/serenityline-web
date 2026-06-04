import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "../../../app/store/hooks";
import { ApiError } from "../../../shared/api";
import { createCategory } from "../api/financeApi";
import type {
    CategoryCreateRequestDto,
    CategoryResponseDto,
} from "../api/financeApiTypes";
import { categoryAdded } from "../financeDataSlice";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type CreateCategoryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (category: CategoryResponseDto) => void;
};

type CategoryFormState = {
    categoryName: string;
    categoryDescription: string;
};

const initialFormState: CategoryFormState = {
    categoryName: "",
    categoryDescription: "",
};

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

export function CreateCategoryModal({
    isOpen,
    onClose,
    onCreated,
}: CreateCategoryModalProps) {
    const { t } = useTranslation("referenceModals");
    const dispatch = useAppDispatch();

    const [form, setForm] = useState<CategoryFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    function updateField(field: keyof CategoryFormState, value: string) {
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

        setForm(initialFormState);
        setFormError(null);
        onClose();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const categoryName = form.categoryName.trim();

        if (!categoryName) {
            setFormError(t("category.validation.nameRequired"));
            return;
        }

        const request: CategoryCreateRequestDto = {
            categoryName,
            categoryDescription: form.categoryDescription.trim() || null,
        };

        setIsSubmitting(true);
        setFormError(null);

        try {
            const createdCategory = await createCategory(request);

            dispatch(categoryAdded(createdCategory));
            onCreated(createdCategory);
            setForm(initialFormState);
            onClose();
        } catch (error) {
            setFormError(
                getErrorMessage(error, t("category.createErrorFallback")),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                aria-labelledby="createCategoryModalTitle"
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
                                        {t("category.eyebrow")}
                                    </p>
                                    <h2
                                        className="modal-title h5"
                                        id="createCategoryModalTitle">
                                        {t("category.title")}
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
                                    {t("category.intro")}
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
                                            htmlFor="createCategoryName">
                                            {t("category.fields.name")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="createCategoryName"
                                            onChange={(event) =>
                                                updateField(
                                                    "categoryName",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            type="text"
                                            value={form.categoryName}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="createCategoryDescription">
                                            {t("category.fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("common.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="createCategoryDescription"
                                            onChange={(event) =>
                                                updateField(
                                                    "categoryDescription",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            value={form.categoryDescription}
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
                                        ? t("category.submitting")
                                        : t("category.submit")}
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

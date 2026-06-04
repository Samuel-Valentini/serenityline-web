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
    createCategory,
    deactivateCategory,
    reactivateCategory,
    updateCategory,
} from "../../features/finance/api/financeApi";
import type {
    CategoryCreateRequestDto,
    CategoryResponseDto,
    CategoryUpdateRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectCategories,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import {
    categoryAdded,
    categoryUpdated,
} from "../../features/finance/financeDataSlice";
import { ApiError } from "../../shared/api";

type CategoryFormState = {
    categoryName: string;
    categoryDescription: string;
};

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const initialFormState: CategoryFormState = {
    categoryName: "",
    categoryDescription: "",
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

function toCategoryFormState(category: CategoryResponseDto): CategoryFormState {
    return {
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription ?? "",
    };
}

export function CategoriesPage() {
    const { t } = useTranslation("categories");
    const dispatch = useAppDispatch();
    const categoryWorkspaceRef = useRef<HTMLElement | null>(null);

    const categories = useAppSelector(selectCategories);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] = useState<CategoryFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null,
    );
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<CategoryFormState | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(
        null,
    );

    const [isStatusChanging, setIsStatusChanging] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);

    const sortedCategories = useMemo(
        () =>
            [...categories].sort((first, second) => {
                if (first.active !== second.active) {
                    return first.active ? -1 : 1;
                }

                return first.categoryName.localeCompare(second.categoryName);
            }),
        [categories],
    );

    const selectedCategory = useMemo(
        () =>
            selectedCategoryId
                ? (categories.find(
                      (category) => category.categoryId === selectedCategoryId,
                  ) ?? null)
                : null,
        [categories, selectedCategoryId],
    );

    function requestCategoryWorkspaceScroll() {
        if (typeof window === "undefined") {
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const workspaceElement = categoryWorkspaceRef.current;

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

    function updateField(field: keyof CategoryFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    function updateEditField(field: keyof CategoryFormState, value: string) {
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

    function selectCategory(category: CategoryResponseDto) {
        setSelectedCategoryId(category.categoryId);
        setIsEditMode(false);
        setEditForm(null);
        setFormError(null);
        setEditError(null);
        setStatusError(null);
        setSuccessMessage(null);
        setEditSuccessMessage(null);
        requestCategoryWorkspaceScroll();
    }

    function startEdit(category: CategoryResponseDto) {
        setSelectedCategoryId(category.categoryId);
        setEditForm(toCategoryFormState(category));
        setIsEditMode(true);
        setEditError(null);
        setStatusError(null);
        setEditSuccessMessage(null);
    }

    function cancelEdit() {
        setIsEditMode(false);
        setEditForm(null);
        setEditError(null);
    }

    function showCreateCategoryForm() {
        setSelectedCategoryId(null);
        setIsEditMode(false);
        setEditForm(null);
        setFormError(null);
        setEditError(null);
        setStatusError(null);
        setSuccessMessage(null);
        setEditSuccessMessage(null);
        requestCategoryWorkspaceScroll();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const categoryName = form.categoryName.trim();

        if (!categoryName) {
            setFormError(t("validation.categoryNameRequired"));
            return;
        }

        const request: CategoryCreateRequestDto = {
            categoryName,
            categoryDescription: form.categoryDescription.trim() || null,
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdCategory = await createCategory(request);

            dispatch(categoryAdded(createdCategory));
            setSelectedCategoryId(createdCategory.categoryId);
            setIsEditMode(false);
            setEditForm(null);
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
            requestCategoryWorkspaceScroll();
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        if (!selectedCategory || !editForm) {
            return;
        }

        const categoryName = editForm.categoryName.trim();

        if (!categoryName) {
            setEditError(t("validation.categoryNameRequired"));
            return;
        }

        const request: CategoryUpdateRequestDto = {
            categoryName,
            categoryDescription: editForm.categoryDescription.trim() || null,
        };

        setIsUpdating(true);
        setEditError(null);
        setEditSuccessMessage(null);

        try {
            const updatedCategory = await updateCategory(
                selectedCategory.categoryId,
                request,
            );

            dispatch(categoryUpdated(updatedCategory));
            setEditForm(toCategoryFormState(updatedCategory));
            setIsEditMode(false);
            setEditSuccessMessage(t("editSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("editErrorFallback")));
        } finally {
            setIsUpdating(false);
        }
    };

    async function handleStatusChange() {
        if (!selectedCategory) {
            return;
        }

        const confirmed = selectedCategory.active
            ? window.confirm(t("deactivateConfirm"))
            : true;

        if (!confirmed) {
            return;
        }

        setIsStatusChanging(true);
        setStatusError(null);
        setEditSuccessMessage(null);

        try {
            const updatedCategory = selectedCategory.active
                ? await deactivateCategory(selectedCategory.categoryId)
                : await reactivateCategory(selectedCategory.categoryId);

            dispatch(categoryUpdated(updatedCategory));
            setSuccessMessage(
                updatedCategory.active
                    ? t("reactivateSuccess")
                    : t("deactivateSuccess"),
            );
        } catch (error) {
            setStatusError(
                getErrorMessage(
                    error,
                    selectedCategory.active
                        ? t("deactivateErrorFallback")
                        : t("reactivateErrorFallback"),
                ),
            );
        } finally {
            setIsStatusChanging(false);
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
                                {t("categoriesCount", {
                                    count: categories.length,
                                })}
                            </span>
                        </div>

                        {financeDataStatus === "loaded" &&
                        sortedCategories.length === 0 ? (
                            <p className="mb-0">{t("emptyState")}</p>
                        ) : null}

                        {sortedCategories.length > 0 ? (
                            <div className="table-responsive mt-3">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t("table.name")}
                                            </th>
                                            <th scope="col">
                                                {t("table.status")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCategories.map((category) => {
                                            const isSelected =
                                                category.categoryId ===
                                                selectedCategoryId;

                                            return (
                                                <Fragment
                                                    key={category.categoryId}>
                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td className="border-bottom-0">
                                                            <strong>
                                                                {
                                                                    category.categoryName
                                                                }
                                                            </strong>
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            <span
                                                                className={
                                                                    category.active
                                                                        ? "badge text-bg-success"
                                                                        : "badge text-bg-secondary"
                                                                }>
                                                                {category.active
                                                                    ? t(
                                                                          "status.active",
                                                                      )
                                                                    : t(
                                                                          "status.inactive",
                                                                      )}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td colSpan={2}>
                                                            <div className="d-grid gap-2">
                                                                <p className="text-muted mb-0">
                                                                    {category.categoryDescription ??
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
                                                                            selectCategory(
                                                                                category,
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
                        ref={categoryWorkspaceRef}
                        tabIndex={-1}>
                        {successMessage ? (
                            <div className="alert alert-success" role="status">
                                {successMessage}
                            </div>
                        ) : null}

                        {!selectedCategory ? (
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

                                <form
                                    className="d-grid gap-3"
                                    onSubmit={handleSubmit}>
                                    <div>
                                        <label
                                            className="form-label"
                                            htmlFor="categoryName">
                                            {t("fields.categoryName")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="categoryName"
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
                                            htmlFor="categoryDescription">
                                            {t("fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="categoryDescription"
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
                            <div>
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                    <div>
                                        <p className="sl-eyebrow">
                                            {t("detailEyebrow")}
                                        </p>
                                        <h3 className="h4 mb-1">
                                            {selectedCategory.categoryName}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            {selectedCategory.categoryDescription ??
                                                ""}
                                        </p>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={showCreateCategoryForm}
                                            type="button">
                                            {t("newCategory")}
                                        </button>

                                        {!isEditMode ? (
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() =>
                                                    startEdit(selectedCategory)
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
                                                htmlFor="editCategoryName">
                                                {t("fields.categoryName")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="editCategoryName"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "categoryName",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                type="text"
                                                value={editForm.categoryName}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editCategoryDescription">
                                                {t("fields.description")}{" "}
                                                <span className="text-muted">
                                                    ({t("fields.optional")})
                                                </span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="editCategoryDescription"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "categoryDescription",
                                                        event.target.value,
                                                    )
                                                }
                                                rows={3}
                                                value={
                                                    editForm.categoryDescription
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

                                <dl className="row mt-4 mb-0">
                                    <dt className="col-sm-4">
                                        {t("fields.status")}
                                    </dt>
                                    <dd className="col-sm-8">
                                        <span
                                            className={
                                                selectedCategory.active
                                                    ? "badge text-bg-success"
                                                    : "badge text-bg-secondary"
                                            }>
                                            {selectedCategory.active
                                                ? t("status.active")
                                                : t("status.inactive")}
                                        </span>
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

                                {statusError ? (
                                    <div
                                        className="alert alert-danger mt-4"
                                        role="alert">
                                        {statusError}
                                    </div>
                                ) : null}

                                <div className="border-top mt-4 pt-4">
                                    <p className="text-muted small">
                                        {selectedCategory.active
                                            ? t("deactivateHint")
                                            : t("reactivateHint")}
                                    </p>
                                    <button
                                        className={
                                            selectedCategory.active
                                                ? "btn btn-outline-warning btn-sm"
                                                : "btn btn-outline-success btn-sm"
                                        }
                                        disabled={isStatusChanging}
                                        onClick={() =>
                                            void handleStatusChange()
                                        }
                                        type="button">
                                        {isStatusChanging
                                            ? t("statusSubmitting")
                                            : selectedCategory.active
                                              ? t("deactivateSubmit")
                                              : t("reactivateSubmit")}
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

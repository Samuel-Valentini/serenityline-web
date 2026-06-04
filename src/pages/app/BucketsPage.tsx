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
    closeBucket,
    createBucket,
    findBucket,
    linkBucketAccount,
    reopenBucket,
    unlinkBucketAccount,
    updateBucket,
} from "../../features/finance/api/financeApi";
import type {
    AccountResponseDto,
    BucketResponseDto,
    CreateBucketRequestDto,
    UpdateBucketRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectBuckets,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import {
    bucketAdded,
    bucketUpdated,
} from "../../features/finance/financeDataSlice";
import { ApiError } from "../../shared/api";

type BucketFormState = {
    bucketName: string;
    bucketDescription: string;
    accountIds: string[];
};

type BucketEditFormState = {
    bucketName: string;
    bucketDescription: string;
};

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const initialFormState: BucketFormState = {
    bucketName: "",
    bucketDescription: "",
    accountIds: [],
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

function isBucketClosed(bucket: BucketResponseDto) {
    return bucket.bucketClosedAt !== null;
}

function getBucketDisplayName(bucket: BucketResponseDto, fallback: string) {
    return bucket.bucketName?.trim() || fallback;
}

function toBucketEditFormState(bucket: BucketResponseDto): BucketEditFormState {
    return {
        bucketName: bucket.bucketName ?? "",
        bucketDescription: bucket.bucketDescription ?? "",
    };
}

export function BucketsPage() {
    const { t } = useTranslation("buckets");
    const dispatch = useAppDispatch();
    const bucketWorkspaceRef = useRef<HTMLElement | null>(null);

    const accounts = useAppSelector(selectAccounts);
    const buckets = useAppSelector(selectBuckets);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] = useState<BucketFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedBucketId, setSelectedBucketId] = useState<string | null>(
        null,
    );
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState<BucketEditFormState | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(
        null,
    );

    const [isStatusChanging, setIsStatusChanging] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);

    const [isAccountLinkChanging, setIsAccountLinkChanging] = useState(false);
    const [accountLinkError, setAccountLinkError] = useState<string | null>(
        null,
    );

    const sortedBuckets = useMemo(
        () =>
            [...buckets].sort((first, second) => {
                const firstClosed = isBucketClosed(first);
                const secondClosed = isBucketClosed(second);

                if (firstClosed !== secondClosed) {
                    return firstClosed ? 1 : -1;
                }

                return getBucketDisplayName(
                    first,
                    t("unnamedBucket"),
                ).localeCompare(
                    getBucketDisplayName(second, t("unnamedBucket")),
                );
            }),
        [buckets, t],
    );

    const selectedBucket = useMemo(
        () =>
            selectedBucketId
                ? (buckets.find(
                      (bucket) => bucket.bucketId === selectedBucketId,
                  ) ?? null)
                : null,
        [buckets, selectedBucketId],
    );

    function requestBucketWorkspaceScroll() {
        if (typeof window === "undefined") {
            return;
        }

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const workspaceElement = bucketWorkspaceRef.current;

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

    function getLinkedAccounts(bucket: BucketResponseDto) {
        return bucket.accountIds
            .map((accountId) =>
                accounts.find((account) => account.accountId === accountId),
            )
            .filter(
                (account): account is AccountResponseDto =>
                    account !== undefined,
            );
    }

    function updateField(field: keyof BucketFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
    }

    function toggleFormAccount(accountId: string) {
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
        setSuccessMessage(null);
    }

    function updateEditField(field: keyof BucketEditFormState, value: string) {
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

    async function selectBucket(bucket: BucketResponseDto) {
        setSelectedBucketId(bucket.bucketId);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setStatusError(null);
        setAccountLinkError(null);
        setSuccessMessage(null);
        setEditSuccessMessage(null);
        setIsDetailLoading(true);
        requestBucketWorkspaceScroll();

        try {
            const bucketDetail = await findBucket(bucket.bucketId);
            dispatch(bucketUpdated(bucketDetail));
        } catch (error) {
            setDetailError(getErrorMessage(error, t("detailErrorFallback")));
        } finally {
            setIsDetailLoading(false);
        }
    }

    function startEdit(bucket: BucketResponseDto) {
        setSelectedBucketId(bucket.bucketId);
        setEditForm(toBucketEditFormState(bucket));
        setIsEditMode(true);
        setEditError(null);
        setStatusError(null);
        setAccountLinkError(null);
        setEditSuccessMessage(null);
    }

    function cancelEdit() {
        setIsEditMode(false);
        setEditForm(null);
        setEditError(null);
    }

    function showCreateBucketForm() {
        setSelectedBucketId(null);
        setIsEditMode(false);
        setEditForm(null);
        setDetailError(null);
        setEditError(null);
        setStatusError(null);
        setAccountLinkError(null);
        setSuccessMessage(null);
        setEditSuccessMessage(null);
        requestBucketWorkspaceScroll();
    }

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        const bucketName = form.bucketName.trim();

        if (!bucketName) {
            setFormError(t("validation.bucketNameRequired"));
            return;
        }

        const request: CreateBucketRequestDto = {
            bucketName,
            bucketDescription: form.bucketDescription.trim() || null,
            accountIds: form.accountIds.length > 0 ? form.accountIds : null,
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdBucket = await createBucket(request);

            dispatch(bucketAdded(createdBucket));
            setSelectedBucketId(createdBucket.bucketId);
            setIsEditMode(false);
            setEditForm(null);
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
            requestBucketWorkspaceScroll();
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();

        if (!selectedBucket || !editForm) {
            return;
        }

        const bucketName = editForm.bucketName.trim();

        if (!bucketName) {
            setEditError(t("validation.bucketNameRequired"));
            return;
        }

        const request: UpdateBucketRequestDto = {
            bucketName,
            bucketDescription: editForm.bucketDescription.trim() || null,
        };

        setIsUpdating(true);
        setEditError(null);
        setEditSuccessMessage(null);

        try {
            const updatedBucket = await updateBucket(
                selectedBucket.bucketId,
                request,
            );

            dispatch(bucketUpdated(updatedBucket));
            setEditForm(toBucketEditFormState(updatedBucket));
            setIsEditMode(false);
            setEditSuccessMessage(t("editSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("editErrorFallback")));
        } finally {
            setIsUpdating(false);
        }
    };

    async function handleStatusChange() {
        if (!selectedBucket) {
            return;
        }

        const isClosed = isBucketClosed(selectedBucket);
        const confirmed = isClosed ? true : window.confirm(t("closeConfirm"));

        if (!confirmed) {
            return;
        }

        setIsStatusChanging(true);
        setStatusError(null);
        setEditSuccessMessage(null);

        try {
            const updatedBucket = isClosed
                ? await reopenBucket(selectedBucket.bucketId)
                : await closeBucket(selectedBucket.bucketId);

            dispatch(bucketUpdated(updatedBucket));
            setSuccessMessage(
                isBucketClosed(updatedBucket)
                    ? t("closeSuccess")
                    : t("reopenSuccess"),
            );
        } catch (error) {
            setStatusError(
                getErrorMessage(
                    error,
                    isClosed
                        ? t("reopenErrorFallback")
                        : t("closeErrorFallback"),
                ),
            );
        } finally {
            setIsStatusChanging(false);
        }
    }

    async function handleAccountLinkChange(accountId: string) {
        if (!selectedBucket) {
            return;
        }

        const isLinked = selectedBucket.accountIds.includes(accountId);

        setIsAccountLinkChanging(true);
        setAccountLinkError(null);
        setEditSuccessMessage(null);

        try {
            if (isLinked) {
                await unlinkBucketAccount(selectedBucket.bucketId, accountId);
            } else {
                await linkBucketAccount(selectedBucket.bucketId, accountId);
            }

            const updatedBucket = await findBucket(selectedBucket.bucketId);
            dispatch(bucketUpdated(updatedBucket));
            setSuccessMessage(
                isLinked ? t("unlinkAccountSuccess") : t("linkAccountSuccess"),
            );
        } catch (error) {
            setAccountLinkError(
                getErrorMessage(
                    error,
                    isLinked
                        ? t("unlinkAccountErrorFallback")
                        : t("linkAccountErrorFallback"),
                ),
            );
        } finally {
            setIsAccountLinkChanging(false);
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
                                {t("bucketsCount", {
                                    count: buckets.length,
                                })}
                            </span>
                        </div>

                        {financeDataStatus === "loaded" &&
                        sortedBuckets.length === 0 ? (
                            <p className="mb-0">{t("emptyState")}</p>
                        ) : null}

                        {sortedBuckets.length > 0 ? (
                            <div className="table-responsive mt-3">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {t("table.name")}
                                            </th>
                                            <th scope="col">
                                                {t("table.accounts")}
                                            </th>
                                            <th scope="col">
                                                {t("table.status")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedBuckets.map((bucket) => {
                                            const isSelected =
                                                bucket.bucketId ===
                                                selectedBucketId;
                                            const isClosed =
                                                isBucketClosed(bucket);

                                            return (
                                                <Fragment key={bucket.bucketId}>
                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td className="border-bottom-0">
                                                            <strong>
                                                                {getBucketDisplayName(
                                                                    bucket,
                                                                    t(
                                                                        "unnamedBucket",
                                                                    ),
                                                                )}
                                                            </strong>
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            {t(
                                                                "linkedAccountsCount",
                                                                {
                                                                    count: bucket
                                                                        .accountIds
                                                                        .length,
                                                                },
                                                            )}
                                                        </td>
                                                        <td className="border-bottom-0">
                                                            <span
                                                                className={
                                                                    isClosed
                                                                        ? "badge text-bg-secondary"
                                                                        : "badge text-bg-success"
                                                                }>
                                                                {isClosed
                                                                    ? t(
                                                                          "status.closed",
                                                                      )
                                                                    : t(
                                                                          "status.active",
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
                                                        <td colSpan={3}>
                                                            <div className="d-grid gap-2">
                                                                <p className="text-muted mb-0">
                                                                    {bucket.bucketDescription ??
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
                                                                            void selectBucket(
                                                                                bucket,
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
                        ref={bucketWorkspaceRef}
                        tabIndex={-1}>
                        {successMessage ? (
                            <div className="alert alert-success" role="status">
                                {successMessage}
                            </div>
                        ) : null}

                        {!selectedBucket ? (
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
                                            htmlFor="bucketName">
                                            {t("fields.bucketName")}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="bucketName"
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
                                            htmlFor="bucketDescription">
                                            {t("fields.description")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="bucketDescription"
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
                                            {t("fields.accounts")}{" "}
                                            <span className="text-muted">
                                                ({t("fields.optional")})
                                            </span>
                                        </legend>

                                        {accounts.length === 0 ? (
                                            <p className="text-muted mb-0">
                                                {t("noAccountsHint")}
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
                                                            id={`bucketAccount-${account.accountId}`}
                                                            onChange={() =>
                                                                toggleFormAccount(
                                                                    account.accountId,
                                                                )
                                                            }
                                                            type="checkbox"
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`bucketAccount-${account.accountId}`}>
                                                            {
                                                                account.accountName
                                                            }
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </fieldset>

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
                                            {getBucketDisplayName(
                                                selectedBucket,
                                                t("unnamedBucket"),
                                            )}
                                        </h3>
                                        <p className="text-muted mb-0">
                                            {selectedBucket.bucketDescription ??
                                                ""}
                                        </p>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={showCreateBucketForm}
                                            type="button">
                                            {t("newBucket")}
                                        </button>

                                        {!isEditMode ? (
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() =>
                                                    startEdit(selectedBucket)
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
                                                htmlFor="editBucketName">
                                                {t("fields.bucketName")}
                                            </label>
                                            <input
                                                className="form-control"
                                                id="editBucketName"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "bucketName",
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                type="text"
                                                value={editForm.bucketName}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="form-label"
                                                htmlFor="editBucketDescription">
                                                {t("fields.description")}{" "}
                                                <span className="text-muted">
                                                    ({t("fields.optional")})
                                                </span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="editBucketDescription"
                                                onChange={(event) =>
                                                    updateEditField(
                                                        "bucketDescription",
                                                        event.target.value,
                                                    )
                                                }
                                                rows={3}
                                                value={
                                                    editForm.bucketDescription
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
                                        {t("fields.status")}
                                    </dt>
                                    <dd className="col-sm-8">
                                        <span
                                            className={
                                                isBucketClosed(selectedBucket)
                                                    ? "badge text-bg-secondary"
                                                    : "badge text-bg-success"
                                            }>
                                            {isBucketClosed(selectedBucket)
                                                ? t("status.closed")
                                                : t("status.active")}
                                        </span>
                                    </dd>

                                    <dt className="col-sm-4">
                                        {t("fields.accounts")}
                                    </dt>
                                    <dd className="col-sm-8">
                                        {getLinkedAccounts(selectedBucket)
                                            .length > 0
                                            ? getLinkedAccounts(selectedBucket)
                                                  .map(
                                                      (account) =>
                                                          account.accountName,
                                                  )
                                                  .join(", ")
                                            : t("noLinkedAccounts")}
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

                                {accountLinkError ? (
                                    <div
                                        className="alert alert-danger mt-4"
                                        role="alert">
                                        {accountLinkError}
                                    </div>
                                ) : null}

                                <div className="border-top mt-4 pt-4">
                                    <h4 className="h6">
                                        {t("linkedAccountsTitle")}
                                    </h4>
                                    <p className="text-muted small">
                                        {t("linkedAccountsHint")}
                                    </p>

                                    {accounts.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            {t("noAccountsHint")}
                                        </p>
                                    ) : (
                                        <div className="d-grid gap-2">
                                            {accounts.map((account) => {
                                                const isLinked =
                                                    selectedBucket.accountIds.includes(
                                                        account.accountId,
                                                    );

                                                return (
                                                    <button
                                                        className={
                                                            isLinked
                                                                ? "btn btn-outline-danger btn-sm"
                                                                : "btn btn-outline-primary btn-sm"
                                                        }
                                                        disabled={
                                                            isAccountLinkChanging
                                                        }
                                                        key={account.accountId}
                                                        onClick={() =>
                                                            void handleAccountLinkChange(
                                                                account.accountId,
                                                            )
                                                        }
                                                        type="button">
                                                        {isLinked
                                                            ? t(
                                                                  "unlinkAccount",
                                                                  {
                                                                      accountName:
                                                                          account.accountName,
                                                                  },
                                                              )
                                                            : t("linkAccount", {
                                                                  accountName:
                                                                      account.accountName,
                                                              })}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="border-top mt-4 pt-4">
                                    <p className="text-muted small">
                                        {isBucketClosed(selectedBucket)
                                            ? t("reopenHint")
                                            : t("closeHint")}
                                    </p>
                                    <button
                                        className={
                                            isBucketClosed(selectedBucket)
                                                ? "btn btn-outline-success btn-sm"
                                                : "btn btn-outline-warning btn-sm"
                                        }
                                        disabled={isStatusChanging}
                                        onClick={() =>
                                            void handleStatusChange()
                                        }
                                        type="button">
                                        {isStatusChanging
                                            ? t("statusSubmitting")
                                            : isBucketClosed(selectedBucket)
                                              ? t("reopenSubmit")
                                              : t("closeSubmit")}
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

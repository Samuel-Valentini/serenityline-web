import { type ComponentProps, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import {
    archiveSimulationGroup,
    createSimulationGroup,
    restoreSimulationGroup,
    updateSimulationGroup,
} from "../../features/finance/api/financeApi";
import type {
    AccountResponseDto,
    SimulationGroupCreateRequestDto,
    SimulationGroupResponseDto,
    SimulationGroupUpdateRequestDto,
} from "../../features/finance/api/financeApiTypes";
import {
    selectAccounts,
    selectFinanceDataError,
    selectFinanceDataStatus,
    selectSimulationGroups,
} from "../../features/finance/financeDataSelectors";
import {
    simulationGroupAdded,
    simulationGroupUpdated,
} from "../../features/finance/financeDataSlice";
import { ApiError } from "../../shared/api";

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type SimulationGroupFormState = {
    simulationGroupName: string;
    simulationGroupDescription: string;
    accountIds: string[];
};

const initialFormState: SimulationGroupFormState = {
    simulationGroupName: "",
    simulationGroupDescription: "",
    accountIds: [],
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

function isSimulationGroupArchived(
    simulationGroup: SimulationGroupResponseDto,
) {
    return simulationGroup.simulationGroupArchivedAt !== null;
}

function getLinkedAccounts(
    simulationGroup: SimulationGroupResponseDto,
    accounts: AccountResponseDto[],
) {
    return simulationGroup.accountIds
        .map((accountId) =>
            accounts.find((account) => account.accountId === accountId),
        )
        .filter(
            (account): account is AccountResponseDto => account !== undefined,
        );
}

export function SimulationsPage() {
    const { t } = useTranslation("simulations");
    const dispatch = useAppDispatch();

    const accounts = useAppSelector(selectAccounts);
    const simulationGroups = useAppSelector(selectSimulationGroups);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const [form, setForm] =
        useState<SimulationGroupFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [editingSimulationGroupId, setEditingSimulationGroupId] = useState<
        string | null
    >(null);
    const [editForm, setEditForm] = useState({
        simulationGroupName: "",
        simulationGroupDescription: "",
    });
    const [editError, setEditError] = useState<string | null>(null);
    const [updatingSimulationGroupId, setUpdatingSimulationGroupId] = useState<
        string | null
    >(null);
    const [
        statusChangingSimulationGroupId,
        setStatusChangingSimulationGroupId,
    ] = useState<string | null>(null);

    const sortedSimulationGroups = useMemo(
        () =>
            [...simulationGroups].sort((first, second) => {
                const firstArchived = isSimulationGroupArchived(first);
                const secondArchived = isSimulationGroupArchived(second);

                if (firstArchived !== secondArchived) {
                    return firstArchived ? 1 : -1;
                }

                return first.simulationGroupName.localeCompare(
                    second.simulationGroupName,
                );
            }),
        [simulationGroups],
    );

    function updateField(
        field: keyof Omit<SimulationGroupFormState, "accountIds">,
        value: string,
    ) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setFormError(null);
        setSuccessMessage(null);
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
        setSuccessMessage(null);
    }

    function startEditingSimulationGroup(
        simulationGroup: SimulationGroupResponseDto,
    ) {
        setEditingSimulationGroupId(simulationGroup.simulationGroupId);
        setEditForm({
            simulationGroupName: simulationGroup.simulationGroupName,
            simulationGroupDescription:
                simulationGroup.simulationGroupDescription ?? "",
        });
        setEditError(null);
        setSuccessMessage(null);
    }

    function cancelEditingSimulationGroup() {
        setEditingSimulationGroupId(null);
        setEditForm({
            simulationGroupName: "",
            simulationGroupDescription: "",
        });
        setEditError(null);
    }

    function updateEditField(field: keyof typeof editForm, value: string) {
        setEditForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setEditError(null);
        setSuccessMessage(null);
    }

    async function handleUpdateSimulationGroup(simulationGroupId: string) {
        const simulationGroupName = editForm.simulationGroupName.trim();
        const simulationGroupDescription =
            editForm.simulationGroupDescription.trim();

        if (!simulationGroupName) {
            setEditError(t("validation.nameRequired"));
            return;
        }

        const request: SimulationGroupUpdateRequestDto = {
            simulationGroupName,
            simulationGroupDescription: simulationGroupDescription || null,
        };

        setUpdatingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const updatedSimulationGroup = await updateSimulationGroup(
                simulationGroupId,
                request,
            );

            dispatch(simulationGroupUpdated(updatedSimulationGroup));
            cancelEditingSimulationGroup();
            setSuccessMessage(t("updateSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("updateErrorFallback")));
        } finally {
            setUpdatingSimulationGroupId(null);
        }
    }

    async function handleCreateSimulationGroup(event: FormSubmitEvent) {
        event.preventDefault();

        const simulationGroupName = form.simulationGroupName.trim();
        const simulationGroupDescription =
            form.simulationGroupDescription.trim();

        if (!simulationGroupName) {
            setFormError(t("validation.nameRequired"));
            return;
        }

        if (form.accountIds.length === 0) {
            setFormError(t("validation.accountRequired"));
            return;
        }

        const request: SimulationGroupCreateRequestDto = {
            simulationGroupName,
            simulationGroupDescription: simulationGroupDescription || null,
            accountIds: form.accountIds,
        };

        setIsSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const createdSimulationGroup = await createSimulationGroup(request);

            dispatch(simulationGroupAdded(createdSimulationGroup));
            setForm(initialFormState);
            setSuccessMessage(t("createSuccess"));
        } catch (error) {
            setFormError(getErrorMessage(error, t("createErrorFallback")));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleArchiveSimulationGroup(simulationGroupId: string) {
        setStatusChangingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const archivedSimulationGroup =
                await archiveSimulationGroup(simulationGroupId);

            dispatch(simulationGroupUpdated(archivedSimulationGroup));
            setSuccessMessage(t("archiveSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("archiveErrorFallback")));
        } finally {
            setStatusChangingSimulationGroupId(null);
        }
    }

    async function handleRestoreSimulationGroup(simulationGroupId: string) {
        setStatusChangingSimulationGroupId(simulationGroupId);
        setEditError(null);
        setSuccessMessage(null);

        try {
            const restoredSimulationGroup =
                await restoreSimulationGroup(simulationGroupId);

            dispatch(simulationGroupUpdated(restoredSimulationGroup));
            setSuccessMessage(t("restoreSuccess"));
        } catch (error) {
            setEditError(getErrorMessage(error, t("restoreErrorFallback")));
        } finally {
            setStatusChangingSimulationGroupId(null);
        }
    }

    if (financeDataStatus === "loading") {
        return (
            <section className="d-grid gap-3">
                <p className="text-muted mb-0">{t("loading")}</p>
            </section>
        );
    }

    if (financeDataStatus === "failed") {
        return (
            <section className="d-grid gap-3">
                <div className="alert alert-danger" role="alert">
                    <strong>{t("loadErrorTitle")}</strong>
                    <p className="mb-0">
                        {financeDataError?.message ?? t("loadErrorFallback")}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="d-grid gap-4">
            <header>
                <p className="text-uppercase text-muted small mb-1">
                    {t("eyebrow")}
                </p>
                <h1 className="h2 mb-2">{t("title")}</h1>
                <p className="text-muted mb-0">{t("subtitle")}</p>
            </header>

            <div className="card">
                <div className="card-body">
                    <h2 className="h5">{t("createTitle")}</h2>
                    <p className="text-muted">{t("createSubtitle")}</p>

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

                    {accounts.length === 0 ? (
                        <div className="alert alert-info mb-0" role="status">
                            {t("noAccounts")}
                        </div>
                    ) : (
                        <form
                            className="d-grid gap-3"
                            onSubmit={handleCreateSimulationGroup}>
                            <div>
                                <label
                                    className="form-label"
                                    htmlFor="simulationGroupName">
                                    {t("fields.name")}
                                </label>
                                <input
                                    className="form-control"
                                    id="simulationGroupName"
                                    onChange={(event) =>
                                        updateField(
                                            "simulationGroupName",
                                            event.target.value,
                                        )
                                    }
                                    type="text"
                                    value={form.simulationGroupName}
                                />
                            </div>

                            <div>
                                <label
                                    className="form-label"
                                    htmlFor="simulationGroupDescription">
                                    {t("fields.description")}{" "}
                                    <span className="text-muted">
                                        ({t("optional")})
                                    </span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="simulationGroupDescription"
                                    onChange={(event) =>
                                        updateField(
                                            "simulationGroupDescription",
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    value={form.simulationGroupDescription}
                                />
                            </div>

                            <fieldset>
                                <legend className="form-label">
                                    {t("fields.accounts")}
                                </legend>

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
                                                id={`simulation-account-${account.accountId}`}
                                                onChange={() =>
                                                    toggleAccount(
                                                        account.accountId,
                                                    )
                                                }
                                                type="checkbox"
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`simulation-account-${account.accountId}`}>
                                                {account.accountName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

                            <div>
                                <button
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    type="submit">
                                    {isSubmitting
                                        ? t("actions.creating")
                                        : t("actions.create")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                        <div>
                            <h2 className="h5 mb-1">{t("listTitle")}</h2>
                            <p className="text-muted mb-0">
                                {t("listSubtitle")}
                            </p>
                        </div>
                        <span className="badge text-bg-light">
                            {t("count", {
                                count: sortedSimulationGroups.length,
                            })}
                        </span>
                    </div>
                    {editError ? (
                        <div className="alert alert-danger" role="alert">
                            {editError}
                        </div>
                    ) : null}
                    {sortedSimulationGroups.length === 0 ? (
                        <p className="text-muted mb-0">{t("emptyState")}</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th scope="col">{t("table.name")}</th>
                                        <th scope="col">
                                            {t("table.accounts")}
                                        </th>
                                        <th scope="col">{t("table.status")}</th>
                                        <th scope="col">
                                            {t("table.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSimulationGroups.map(
                                        (simulationGroup) => {
                                            const linkedAccounts =
                                                getLinkedAccounts(
                                                    simulationGroup,
                                                    accounts,
                                                );
                                            const isArchived =
                                                isSimulationGroupArchived(
                                                    simulationGroup,
                                                );

                                            const isEditing =
                                                editingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;
                                            const isUpdating =
                                                updatingSimulationGroupId ===
                                                simulationGroup.simulationGroupId;

                                            return (
                                                <tr
                                                    key={
                                                        simulationGroup.simulationGroupId
                                                    }>
                                                    <td>
                                                        {isEditing ? (
                                                            <div className="d-grid gap-2">
                                                                <input
                                                                    aria-label={t(
                                                                        "fields.name",
                                                                    )}
                                                                    className="form-control"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateEditField(
                                                                            "simulationGroupName",
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    type="text"
                                                                    value={
                                                                        editForm.simulationGroupName
                                                                    }
                                                                />

                                                                <textarea
                                                                    aria-label={t(
                                                                        "fields.description",
                                                                    )}
                                                                    className="form-control"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateEditField(
                                                                            "simulationGroupDescription",
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    rows={2}
                                                                    value={
                                                                        editForm.simulationGroupDescription
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <strong>
                                                                    {
                                                                        simulationGroup.simulationGroupName
                                                                    }
                                                                </strong>
                                                                {simulationGroup.simulationGroupDescription ? (
                                                                    <p className="text-muted mb-0">
                                                                        {
                                                                            simulationGroup.simulationGroupDescription
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {linkedAccounts.length >
                                                        0
                                                            ? linkedAccounts
                                                                  .map(
                                                                      (
                                                                          account,
                                                                      ) =>
                                                                          account.accountName,
                                                                  )
                                                                  .join(", ")
                                                            : "—"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                isArchived
                                                                    ? "badge text-bg-secondary"
                                                                    : "badge text-bg-success"
                                                            }>
                                                            {isArchived
                                                                ? t(
                                                                      "status.archived",
                                                                  )
                                                                : t(
                                                                      "status.active",
                                                                  )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={() =>
                                                                        handleUpdateSimulationGroup(
                                                                            simulationGroup.simulationGroupId,
                                                                        )
                                                                    }
                                                                    type="button">
                                                                    {isUpdating
                                                                        ? t(
                                                                              "actions.saving",
                                                                          )
                                                                        : t(
                                                                              "actions.save",
                                                                          )}
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={
                                                                        cancelEditingSimulationGroup
                                                                    }
                                                                    type="button">
                                                                    {t(
                                                                        "actions.cancel",
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {!isArchived ? (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() =>
                                                                                startEditingSimulationGroup(
                                                                                    simulationGroup,
                                                                                )
                                                                            }
                                                                            type="button">
                                                                            {t(
                                                                                "actions.edit",
                                                                            )}
                                                                        </button>

                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            disabled={
                                                                                statusChangingSimulationGroupId ===
                                                                                simulationGroup.simulationGroupId
                                                                            }
                                                                            onClick={() =>
                                                                                handleArchiveSimulationGroup(
                                                                                    simulationGroup.simulationGroupId,
                                                                                )
                                                                            }
                                                                            type="button">
                                                                            {statusChangingSimulationGroupId ===
                                                                            simulationGroup.simulationGroupId
                                                                                ? t(
                                                                                      "actions.archiving",
                                                                                  )
                                                                                : t(
                                                                                      "actions.archive",
                                                                                  )}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        disabled={
                                                                            statusChangingSimulationGroupId ===
                                                                            simulationGroup.simulationGroupId
                                                                        }
                                                                        onClick={() =>
                                                                            handleRestoreSimulationGroup(
                                                                                simulationGroup.simulationGroupId,
                                                                            )
                                                                        }
                                                                        type="button">
                                                                        {statusChangingSimulationGroupId ===
                                                                        simulationGroup.simulationGroupId
                                                                            ? t(
                                                                                  "actions.restoring",
                                                                              )
                                                                            : t(
                                                                                  "actions.restore",
                                                                              )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

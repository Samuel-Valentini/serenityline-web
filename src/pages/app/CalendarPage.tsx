import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useAppSelector } from "../../app/store/hooks";
import type { FinanceCalendarMovementResponseDto } from "../../features/finance/api/financeApiTypes";
import {
    getFinanceCalendarMovementKey,
    getInitialFinanceCalendarRange,
    getTodayIsoDate,
    useFinanceCalendarCache,
} from "../../features/finance/calendar/useFinanceCalendarCache";
import {
    selectAccounts,
    selectBuckets,
    selectCategories,
    selectFinanceDataError,
    selectFinanceDataStatus,
} from "../../features/finance/financeDataSelectors";
import { formatMoneyAmountForDisplay } from "../../features/finance/transactionForms/moneyInput";
import { ApiError } from "../../shared/api";
import { ROUTES } from "../../shared/constants/routes";

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

function formatIsoDateForDisplay(date: string, language: string) {
    return new Intl.DateTimeFormat(language).format(
        new Date(`${date}T00:00:00`),
    );
}

function isTechnicalCreditCardMovement(
    movement: FinanceCalendarMovementResponseDto,
) {
    return (
        movement.movementType ===
            "TECHNICAL_CREDIT_CARD_CHARGE_FROM_PERSISTED_TRANSACTION" ||
        movement.movementType ===
            "TECHNICAL_CREDIT_CARD_CHARGE_FROM_PROJECTED_RECURRING_TRANSACTION"
    );
}

type CalendarConfirmedFilter = "all" | "confirmed" | "unconfirmed";

function getSelectedValues(options: HTMLCollectionOf<HTMLOptionElement>) {
    return Array.from(options, (option) => option.value);
}

export function CalendarPage() {
    const { i18n, t } = useTranslation("calendar");
    const navigate = useNavigate();

    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";
    const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
    const initialRange = useMemo(
        () => getInitialFinanceCalendarRange(todayIsoDate),
        [todayIsoDate],
    );

    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectCategories);
    const buckets = useAppSelector(selectBuckets);

    const [selectedSimulationGroupIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [selectedBucketIds, setSelectedBucketIds] = useState<string[]>([]);
    const [confirmedFilter, setConfirmedFilter] =
        useState<CalendarConfirmedFilter>("all");

    const {
        movements,
        loadedFrom,
        loadedTo,
        isLoading,
        error,
        loadRange,
        refreshRange,
    } = useFinanceCalendarCache(selectedSimulationGroupIds);

    const hasRequestedInitialRangeRef = useRef(false);
    const hasScrolledToTodayRef = useRef(false);
    const todayMovementRef = useRef<HTMLTableRowElement | null>(null);

    const accountsById = useMemo(
        () => new Map(accounts.map((account) => [account.accountId, account])),
        [accounts],
    );

    const categoriesById = useMemo(
        () =>
            new Map(
                categories.map((category) => [category.categoryId, category]),
            ),
        [categories],
    );

    const bucketsById = useMemo(
        () => new Map(buckets.map((bucket) => [bucket.bucketId, bucket])),
        [buckets],
    );

    const normalizedSearchQuery = searchQuery
        .trim()
        .toLocaleLowerCase(displayLanguage);

    const filteredMovements = useMemo(() => {
        return movements.filter((movement) => {
            if (
                normalizedSearchQuery.length > 0 &&
                !movement.description
                    .toLocaleLowerCase(displayLanguage)
                    .includes(normalizedSearchQuery)
            ) {
                return false;
            }

            if (
                selectedCategoryIds.length > 0 &&
                !selectedCategoryIds.includes(movement.categoryId)
            ) {
                return false;
            }

            if (
                selectedAccountIds.length > 0 &&
                !selectedAccountIds.includes(movement.accountId)
            ) {
                return false;
            }

            if (
                selectedBucketIds.length > 0 &&
                (!movement.bucketId ||
                    !selectedBucketIds.includes(movement.bucketId))
            ) {
                return false;
            }

            if (confirmedFilter === "confirmed" && !movement.confirmed) {
                return false;
            }

            if (confirmedFilter === "unconfirmed" && movement.confirmed) {
                return false;
            }

            return true;
        });
    }, [
        confirmedFilter,
        displayLanguage,
        movements,
        normalizedSearchQuery,
        selectedAccountIds,
        selectedBucketIds,
        selectedCategoryIds,
    ]);

    const hasActiveFilters =
        normalizedSearchQuery.length > 0 ||
        selectedCategoryIds.length > 0 ||
        selectedAccountIds.length > 0 ||
        selectedBucketIds.length > 0 ||
        confirmedFilter !== "all";

    const todayTargetMovementKey = useMemo(() => {
        if (movements.length === 0) {
            return null;
        }

        const firstFutureOrTodayMovement = movements.find(
            (movement) => movement.chargeDate >= todayIsoDate,
        );

        return getFinanceCalendarMovementKey(
            firstFutureOrTodayMovement ?? movements[movements.length - 1],
        );
    }, [movements, todayIsoDate]);

    useEffect(() => {
        if (hasRequestedInitialRangeRef.current || movements.length > 0) {
            return;
        }

        hasRequestedInitialRangeRef.current = true;
        void loadRange(initialRange);
    }, [initialRange, loadRange, movements.length]);

    useEffect(() => {
        if (hasScrolledToTodayRef.current || movements.length === 0) {
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            todayMovementRef.current?.scrollIntoView({
                block: "center",
            });
            hasScrolledToTodayRef.current = true;
        });

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [movements.length]);

    function getAccountName(accountId: string) {
        return accountsById.get(accountId)?.accountName ?? t("unknown.account");
    }

    function getAccountCurrency(accountId: string) {
        return accountsById.get(accountId)?.currency ?? "EUR";
    }

    function getCategoryName(categoryId: string) {
        return (
            categoriesById.get(categoryId)?.categoryName ??
            t("unknown.category")
        );
    }

    function getBucketName(bucketId: string | null) {
        if (!bucketId) {
            return null;
        }

        return bucketsById.get(bucketId)?.bucketName ?? t("unknown.bucket");
    }

    function getMovementTypeLabel(
        movement: FinanceCalendarMovementResponseDto,
    ) {
        if (movement.movementType === "PERSISTED_TRANSACTION") {
            return t("movementTypes.persistedTransaction");
        }

        if (movement.movementType === "PROJECTED_RECURRING_TRANSACTION") {
            return t("movementTypes.projectedRecurringTransaction");
        }

        return t("movementTypes.technicalCreditCardCharge");
    }

    function getMovementTypeBadgeClass(
        movement: FinanceCalendarMovementResponseDto,
    ) {
        if (isTechnicalCreditCardMovement(movement)) {
            return "badge text-bg-warning";
        }

        if (movement.movementType === "PROJECTED_RECURRING_TRANSACTION") {
            return "badge text-bg-info";
        }

        return "badge text-bg-primary";
    }

    function formatMovementAmount(
        movement: FinanceCalendarMovementResponseDto,
    ) {
        return formatMoneyAmountForDisplay(
            movement.amount,
            displayLanguage,
            getAccountCurrency(movement.accountId),
        );
    }

    function handleRefreshCalendar() {
        hasScrolledToTodayRef.current = false;
        void refreshRange(initialRange);
    }

    function handleClearFilters() {
        setSearchQuery("");
        setSelectedCategoryIds([]);
        setSelectedAccountIds([]);
        setSelectedBucketIds([]);
        setConfirmedFilter("all");
    }

    return (
        <section className="sl-page sl-calendar-page">
            <header className="sl-page-header">
                <p className="sl-eyebrow">{t("eyebrow")}</p>
                <div className="sl-calendar-header-row">
                    <div>
                        <h1>{t("title")}</h1>
                        <p className="lead">{t("subtitle")}</p>
                    </div>

                    <div className="sl-calendar-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(ROUTES.app.transactions)}
                            type="button">
                            {t("actions.addTransaction")}
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() =>
                                navigate(ROUTES.app.recurringTransactions)
                            }
                            type="button">
                            {t("actions.addRecurringTransaction")}
                        </button>
                    </div>
                </div>
            </header>

            {financeDataStatus === "loading" ? (
                <div className="alert alert-info" role="status">
                    {t("referenceDataLoading")}
                </div>
            ) : null}

            {financeDataStatus === "failed" ? (
                <div className="alert alert-danger" role="alert">
                    <h2 className="h6">{t("referenceDataLoadErrorTitle")}</h2>
                    <p className="mb-0">
                        {financeDataError?.message ??
                            t("referenceDataLoadErrorFallback")}
                    </p>
                </div>
            ) : null}

            <article className="sl-panel">
                <div className="sl-calendar-toolbar">
                    <div>
                        <p className="sl-eyebrow">{t("timeline.eyebrow")}</p>
                        <h2>{t("timeline.title")}</h2>
                        <p>
                            {loadedFrom && loadedTo
                                ? t("timeline.loadedRange", {
                                      from: formatIsoDateForDisplay(
                                          loadedFrom,
                                          displayLanguage,
                                      ),
                                      to: formatIsoDateForDisplay(
                                          loadedTo,
                                          displayLanguage,
                                      ),
                                  })
                                : t("timeline.initialRange", {
                                      from: formatIsoDateForDisplay(
                                          initialRange.from,
                                          displayLanguage,
                                      ),
                                      to: formatIsoDateForDisplay(
                                          initialRange.to,
                                          displayLanguage,
                                      ),
                                  })}
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-primary"
                        disabled={isLoading}
                        onClick={handleRefreshCalendar}
                        type="button">
                        {isLoading
                            ? t("timeline.refreshing")
                            : t("timeline.refresh")}
                    </button>
                </div>

                <div className="sl-calendar-filters mt-3">
                    <div className="sl-calendar-filter-heading">
                        <div>
                            <h3 className="h5">{t("filters.title")}</h3>
                            <p className="text-muted mb-0">
                                {t("filters.description")}
                            </p>
                        </div>

                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={!hasActiveFilters}
                            onClick={handleClearFilters}
                            type="button">
                            {t("filters.clear")}
                        </button>
                    </div>

                    <div className="row g-3">
                        <div className="col-12 col-lg-4">
                            <label
                                className="form-label"
                                htmlFor="calendarSearchQuery">
                                {t("filters.search")}
                            </label>
                            <input
                                className="form-control"
                                id="calendarSearchQuery"
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder={t("filters.searchPlaceholder")}
                                type="search"
                                value={searchQuery}
                            />
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <label
                                className="form-label"
                                htmlFor="calendarCategoryFilter">
                                {t("filters.categories")}
                            </label>
                            <select
                                className="form-select"
                                id="calendarCategoryFilter"
                                multiple
                                onChange={(event) =>
                                    setSelectedCategoryIds(
                                        getSelectedValues(
                                            event.target.selectedOptions,
                                        ),
                                    )
                                }
                                value={selectedCategoryIds}>
                                {categories.map((category) => (
                                    <option
                                        key={category.categoryId}
                                        value={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <label
                                className="form-label"
                                htmlFor="calendarAccountFilter">
                                {t("filters.accounts")}
                            </label>
                            <select
                                className="form-select"
                                id="calendarAccountFilter"
                                multiple
                                onChange={(event) =>
                                    setSelectedAccountIds(
                                        getSelectedValues(
                                            event.target.selectedOptions,
                                        ),
                                    )
                                }
                                value={selectedAccountIds}>
                                {accounts.map((account) => (
                                    <option
                                        key={account.accountId}
                                        value={account.accountId}>
                                        {account.accountName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <label
                                className="form-label"
                                htmlFor="calendarBucketFilter">
                                {t("filters.buckets")}
                            </label>
                            <select
                                className="form-select"
                                id="calendarBucketFilter"
                                multiple
                                onChange={(event) =>
                                    setSelectedBucketIds(
                                        getSelectedValues(
                                            event.target.selectedOptions,
                                        ),
                                    )
                                }
                                value={selectedBucketIds}>
                                {buckets.map((bucket) => (
                                    <option
                                        key={bucket.bucketId}
                                        value={bucket.bucketId}>
                                        {bucket.bucketName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <label
                                className="form-label"
                                htmlFor="calendarConfirmedFilter">
                                {t("filters.confirmed")}
                            </label>
                            <select
                                className="form-select"
                                id="calendarConfirmedFilter"
                                onChange={(event) =>
                                    setConfirmedFilter(
                                        event.target
                                            .value as CalendarConfirmedFilter,
                                    )
                                }
                                value={confirmedFilter}>
                                <option value="all">
                                    {t("filters.confirmedOptions.all")}
                                </option>
                                <option value="confirmed">
                                    {t("filters.confirmedOptions.confirmed")}
                                </option>
                                <option value="unconfirmed">
                                    {t("filters.confirmedOptions.unconfirmed")}
                                </option>
                            </select>
                        </div>

                        <div className="col-12 col-lg-4 d-flex align-items-end">
                            <p className="text-muted mb-0">
                                {t("filters.resultCount", {
                                    filtered: filteredMovements.length,
                                    total: movements.length,
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="alert alert-danger mt-3" role="alert">
                        {getErrorMessage(error, t("loadErrorFallback"))}
                    </div>
                ) : null}

                {isLoading && movements.length === 0 ? (
                    <div className="alert alert-info mt-3" role="status">
                        {t("loading")}
                    </div>
                ) : null}

                {!isLoading && movements.length === 0 && !error ? (
                    <p className="text-muted mt-3 mb-0">{t("empty")}</p>
                ) : null}

                {movements.length > 0 && filteredMovements.length === 0 ? (
                    <p className="text-muted mt-3 mb-0">{t("filters.empty")}</p>
                ) : null}

                {filteredMovements.length > 0 ? (
                    <div
                        aria-label={t("timeline.windowLabel")}
                        className="sl-calendar-window mt-3"
                        tabIndex={0}>
                        <table className="table align-middle sl-calendar-table">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        {t("table.description")}
                                    </th>
                                    <th scope="col">{t("table.amount")}</th>
                                    <th scope="col">{t("table.category")}</th>
                                    <th scope="col">{t("table.date")}</th>
                                    <th scope="col">{t("table.confirmed")}</th>
                                    <th scope="col">{t("table.account")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.map((movement) => {
                                    const movementKey =
                                        getFinanceCalendarMovementKey(movement);
                                    const isTodayTarget =
                                        movementKey === todayTargetMovementKey;
                                    const bucketName = getBucketName(
                                        movement.bucketId,
                                    );

                                    return (
                                        <tr
                                            className={
                                                movement.chargeDate ===
                                                todayIsoDate
                                                    ? "sl-calendar-today-row"
                                                    : undefined
                                            }
                                            key={movementKey}
                                            ref={
                                                isTodayTarget
                                                    ? todayMovementRef
                                                    : undefined
                                            }>
                                            <td>
                                                <div className="sl-calendar-description">
                                                    <span>
                                                        {movement.description}
                                                    </span>
                                                    <span
                                                        className={getMovementTypeBadgeClass(
                                                            movement,
                                                        )}>
                                                        {getMovementTypeLabel(
                                                            movement,
                                                        )}
                                                    </span>
                                                    {bucketName ? (
                                                        <small>
                                                            {t("table.bucket", {
                                                                bucketName,
                                                            })}
                                                        </small>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td>
                                                {formatMovementAmount(movement)}
                                            </td>
                                            <td>
                                                {getCategoryName(
                                                    movement.categoryId,
                                                )}
                                            </td>
                                            <td>
                                                {formatIsoDateForDisplay(
                                                    movement.chargeDate,
                                                    displayLanguage,
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        movement.confirmed
                                                            ? "badge text-bg-success"
                                                            : "badge text-bg-secondary"
                                                    }>
                                                    {movement.confirmed
                                                        ? t("status.confirmed")
                                                        : t(
                                                              "status.unconfirmed",
                                                          )}
                                                </span>
                                            </td>
                                            <td>
                                                {getAccountName(
                                                    movement.accountId,
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </article>
        </section>
    );
}

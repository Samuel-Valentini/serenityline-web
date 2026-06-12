import {
    Fragment,
    type ComponentProps,
    useEffect,
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
    FinanceCalendarDailyBalanceResponseDto,
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
import {
    selectDailyBalanceByDate,
    selectDailyBalancesScenarioEntry,
} from "../../features/finance/dailyBalances/financeDailyBalancesSelectors";
import { loadDailyBalancesRange } from "../../features/finance/dailyBalances/financeDailyBalancesThunks";
import {
    BASE_DAILY_BALANCES_SCENARIO_KEY,
    getDailyBalancesRangeKey,
    getTodayIsoDate,
} from "../../features/finance/dailyBalances/financeDailyBalancesTypes";
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

type BucketAccountCoverageBalance = {
    accountId: string;
    accountName: string;
    currency: string;
    balance: number;
    linked: boolean;
};

type BucketAccountCoverageWarning = {
    key: string;
    bucketName: string;
    negativeAccountName: string;
    negativeAmount: number;
    positiveAccountName: string | null;
    positiveAmount: number | null;
    positiveTotal: number;
    positiveAccountCount: number;
    currency: string;
};

type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const initialFormState: BucketFormState = {
    bucketName: "",
    bucketDescription: "",
    accountIds: [],
};

const WORKSPACE_SCROLL_FALLBACK_OFFSET_PX = 96;
const WORKSPACE_SCROLL_EXTRA_GAP_PX = 16;

function getWorkspaceScrollOffsetPx() {
    if (typeof document === "undefined") {
        return WORKSPACE_SCROLL_FALLBACK_OFFSET_PX;
    }

    const appTopbar = document.querySelector<HTMLElement>(".sl-app-topbar");

    if (!appTopbar) {
        return WORKSPACE_SCROLL_FALLBACK_OFFSET_PX;
    }

    return Math.ceil(
        appTopbar.getBoundingClientRect().height +
            WORKSPACE_SCROLL_EXTRA_GAP_PX,
    );
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

function formatMoneyAmount(amount: number, currency: string, language: string) {
    return new Intl.NumberFormat(language, {
        currency,
        maximumFractionDigits: 2,
        style: "currency",
    }).format(amount);
}

function getBucketCurrencies(
    bucket: BucketResponseDto,
    accounts: AccountResponseDto[],
    todayBalance:
        | {
              buckets: {
                  bucketId: string;
                  currency: string;
              }[];
          }
        | undefined,
) {
    const currencies = new Set<string>();

    todayBalance?.buckets
        .filter((bucketBalance) => bucketBalance.bucketId === bucket.bucketId)
        .forEach((bucketBalance) => {
            currencies.add(bucketBalance.currency);
        });

    bucket.accountIds.forEach((accountId) => {
        const account = accounts.find(
            (currentAccount) => currentAccount.accountId === accountId,
        );

        if (account) {
            currencies.add(account.currency);
        }
    });

    return [...currencies].sort();
}

function getBucketBalanceAmount(
    bucketId: string,
    currency: string,
    todayBalance:
        | {
              buckets: {
                  bucketId: string;
                  currency: string;
                  endOfDayBucketBalance: number;
              }[];
          }
        | undefined,
) {
    return (
        todayBalance?.buckets.find(
            (bucketBalance) =>
                bucketBalance.bucketId === bucketId &&
                bucketBalance.currency === currency,
        )?.endOfDayBucketBalance ?? 0
    );
}

function getBucketAccountCoverageBalances(
    bucket: BucketResponseDto,
    accounts: AccountResponseDto[],
    todayBalance: FinanceCalendarDailyBalanceResponseDto | undefined,
    accountFallback: string,
): BucketAccountCoverageBalance[] {
    const accountsById = new Map(
        accounts.map((account) => [account.accountId, account]),
    );

    const dailyAccountsById = new Map(
        todayBalance?.accounts.map((accountBalance) => [
            accountBalance.accountId,
            accountBalance,
        ]) ?? [],
    );

    const accountIds = new Set(bucket.accountIds);

    todayBalance?.accounts.forEach((accountBalance) => {
        const hasBucketBalance = accountBalance.buckets.some(
            (bucketBalance) =>
                bucketBalance.bucketId === bucket.bucketId &&
                bucketBalance.endOfDayBucketBalance !== 0,
        );

        if (hasBucketBalance) {
            accountIds.add(accountBalance.accountId);
        }
    });

    return [...accountIds]
        .map((accountId) => {
            const account = accountsById.get(accountId);
            const dailyAccountBalance = dailyAccountsById.get(accountId);

            const bucketBalance =
                dailyAccountBalance?.buckets.find(
                    (currentBucketBalance) =>
                        currentBucketBalance.bucketId === bucket.bucketId,
                )?.endOfDayBucketBalance ?? 0;

            const numericBalance = Number(bucketBalance);

            return {
                accountId,
                accountName: account?.accountName ?? accountFallback,
                currency:
                    dailyAccountBalance?.currency ?? account?.currency ?? "EUR",
                balance: Number.isFinite(numericBalance) ? numericBalance : 0,
                linked: bucket.accountIds.includes(accountId),
            };
        })
        .sort((first, second) =>
            first.accountName.localeCompare(second.accountName),
        );
}

function getBucketAccountCoverageWarnings(
    bucket: BucketResponseDto,
    bucketName: string,
    coverageBalances: BucketAccountCoverageBalance[],
): BucketAccountCoverageWarning[] {
    return coverageBalances
        .filter((coverageBalance) => coverageBalance.balance < 0)
        .map((negativeBalance) => {
            const positiveBalances = coverageBalances
                .filter(
                    (coverageBalance) =>
                        coverageBalance.accountId !==
                            negativeBalance.accountId &&
                        coverageBalance.currency === negativeBalance.currency &&
                        coverageBalance.balance > 0,
                )
                .sort((first, second) => second.balance - first.balance);

            const positiveTotal = positiveBalances.reduce(
                (sum, positiveBalance) => sum + positiveBalance.balance,
                0,
            );

            return {
                key: `${bucket.bucketId}:${negativeBalance.accountId}:${negativeBalance.currency}`,
                bucketName,
                negativeAccountName: negativeBalance.accountName,
                negativeAmount: Math.abs(negativeBalance.balance),
                positiveAccountName:
                    positiveBalances.length === 1
                        ? positiveBalances[0].accountName
                        : null,
                positiveAmount:
                    positiveBalances.length === 1
                        ? positiveBalances[0].balance
                        : null,
                positiveTotal,
                positiveAccountCount: positiveBalances.length,
                currency: negativeBalance.currency,
            };
        });
}

export function BucketsPage() {
    const { i18n, t } = useTranslation("buckets");
    const displayLanguage = i18n.resolvedLanguage || i18n.language || "it";
    const dispatch = useAppDispatch();
    const bucketWorkspaceRef = useRef<HTMLElement | null>(null);

    const todayIsoDate = useMemo(() => getTodayIsoDate(), []);

    const todayBalanceRange = useMemo(
        () => ({
            from: todayIsoDate,
            to: todayIsoDate,
        }),
        [todayIsoDate],
    );

    const todayBalanceRangeKey = useMemo(
        () => getDailyBalancesRangeKey(todayBalanceRange),
        [todayBalanceRange],
    );

    const accounts = useAppSelector(selectAccounts);
    const buckets = useAppSelector(selectBuckets);
    const financeDataStatus = useAppSelector(selectFinanceDataStatus);
    const financeDataError = useAppSelector(selectFinanceDataError);

    const todayBalance = useAppSelector((state) =>
        selectDailyBalanceByDate(
            state,
            BASE_DAILY_BALANCES_SCENARIO_KEY,
            todayIsoDate,
        ),
    );

    const todayBalancesCacheEntry = useAppSelector((state) =>
        selectDailyBalancesScenarioEntry(
            state,
            BASE_DAILY_BALANCES_SCENARIO_KEY,
        ),
    );

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

    const hasRequestedTodayBalance =
        todayBalancesCacheEntry.loadedRangeKeys.includes(
            todayBalanceRangeKey,
        ) ||
        todayBalancesCacheEntry.pendingRangeKeys.includes(todayBalanceRangeKey);

    useEffect(() => {
        if (financeDataStatus !== "loaded" || hasRequestedTodayBalance) {
            return;
        }

        void dispatch(
            loadDailyBalancesRange({
                range: todayBalanceRange,
            }),
        );
    }, [
        dispatch,
        financeDataStatus,
        hasRequestedTodayBalance,
        todayBalanceRange,
    ]);

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

    const selectedBucketAccountCoverageBalances = useMemo(
        () =>
            selectedBucket
                ? getBucketAccountCoverageBalances(
                      selectedBucket,
                      accounts,
                      todayBalance,
                      t("accountFallback"),
                  )
                : [],
        [accounts, selectedBucket, t, todayBalance],
    );

    const selectedBucketAccountCoverageWarnings = useMemo(
        () =>
            selectedBucket
                ? getBucketAccountCoverageWarnings(
                      selectedBucket,
                      getBucketDisplayName(selectedBucket, t("unnamedBucket")),
                      selectedBucketAccountCoverageBalances,
                  )
                : [],
        [selectedBucket, selectedBucketAccountCoverageBalances, t],
    );

    const isLoading =
        financeDataStatus === "idle" || financeDataStatus === "loading";

    const isTodayBalanceLoading =
        todayBalancesCacheEntry.status === "loading" && !todayBalance;

    const isTodayBalanceUnavailable =
        todayBalancesCacheEntry.status === "failed" && !todayBalance;

    const selectedBucketNonZeroAccountBalances = useMemo(
        () =>
            selectedBucketAccountCoverageBalances.filter(
                (coverageBalance) => Math.abs(coverageBalance.balance) > 0.005,
            ),
        [selectedBucketAccountCoverageBalances],
    );

    const isSelectedBucketCloseDisabledByBalance =
        selectedBucket !== null &&
        !isBucketClosed(selectedBucket) &&
        !isTodayBalanceLoading &&
        !isTodayBalanceUnavailable &&
        selectedBucketNonZeroAccountBalances.length > 0;

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
                    getWorkspaceScrollOffsetPx();

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
                                                {t("table.todayBalance")}
                                            </th>
                                            <th
                                                className="d-none d-md-table-cell"
                                                scope="col">
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
                                            const bucketCurrencies =
                                                getBucketCurrencies(
                                                    bucket,
                                                    accounts,
                                                    todayBalance,
                                                );

                                            return (
                                                <Fragment key={bucket.bucketId}>
                                                    <tr
                                                        className={
                                                            isSelected
                                                                ? "table-active"
                                                                : undefined
                                                        }>
                                                        <td className="border-bottom-0">
                                                            <div className="d-grid gap-1">
                                                                <strong>
                                                                    {getBucketDisplayName(
                                                                        bucket,
                                                                        t(
                                                                            "unnamedBucket",
                                                                        ),
                                                                    )}
                                                                </strong>

                                                                <span
                                                                    className={
                                                                        isClosed
                                                                            ? "badge text-bg-secondary align-self-start d-inline-flex d-md-none"
                                                                            : "badge text-bg-success align-self-start d-inline-flex d-md-none"
                                                                    }>
                                                                    {isClosed
                                                                        ? t(
                                                                              "status.closed",
                                                                          )
                                                                        : t(
                                                                              "status.active",
                                                                          )}
                                                                </span>
                                                            </div>
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
                                                            {isTodayBalanceLoading ? (
                                                                <span className="text-muted">
                                                                    {t(
                                                                        "todayBalance.loading",
                                                                    )}
                                                                </span>
                                                            ) : isTodayBalanceUnavailable ? (
                                                                <span className="text-muted">
                                                                    {t(
                                                                        "todayBalance.unavailable",
                                                                    )}
                                                                </span>
                                                            ) : bucketCurrencies.length >
                                                              0 ? (
                                                                <div className="d-grid gap-1">
                                                                    {bucketCurrencies.map(
                                                                        (
                                                                            currency,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    currency
                                                                                }>
                                                                                {formatMoneyAmount(
                                                                                    getBucketBalanceAmount(
                                                                                        bucket.bucketId,
                                                                                        currency,
                                                                                        todayBalance,
                                                                                    ),
                                                                                    currency,
                                                                                    displayLanguage,
                                                                                )}
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">
                                                                    {t(
                                                                        "todayBalance.empty",
                                                                    )}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="border-bottom-0 d-none d-md-table-cell">
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
                                                        <td colSpan={4}>
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

                                <div className="sl-bucket-coverage-card mt-4">
                                    <div>
                                        <h4 className="h6 mb-1">
                                            {t("coverage.title")}
                                        </h4>
                                        <p className="text-muted small">
                                            {t("coverage.subtitle")}
                                        </p>
                                    </div>

                                    {isTodayBalanceLoading ? (
                                        <div
                                            className="alert alert-info mt-3 mb-0"
                                            role="status">
                                            {t("coverage.loading")}
                                        </div>
                                    ) : isTodayBalanceUnavailable ? (
                                        <div
                                            className="alert alert-warning mt-3 mb-0"
                                            role="status">
                                            {t("coverage.unavailable")}
                                        </div>
                                    ) : (
                                        <>
                                            {selectedBucketAccountCoverageBalances.length >
                                            0 ? (
                                                <div className="sl-bucket-coverage-list mt-3">
                                                    {selectedBucketAccountCoverageBalances.map(
                                                        (coverageBalance) => (
                                                            <div
                                                                className={[
                                                                    "sl-bucket-coverage-row",
                                                                    coverageBalance.balance <
                                                                    0
                                                                        ? "is-negative"
                                                                        : coverageBalance.balance >
                                                                            0
                                                                          ? "is-positive"
                                                                          : "is-zero",
                                                                ].join(" ")}
                                                                key={`${coverageBalance.accountId}:${coverageBalance.currency}`}>
                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            coverageBalance.accountName
                                                                        }
                                                                    </strong>
                                                                    <small>
                                                                        {coverageBalance.linked
                                                                            ? t(
                                                                                  "coverage.linked",
                                                                              )
                                                                            : t(
                                                                                  "coverage.notLinked",
                                                                              )}
                                                                    </small>
                                                                </div>

                                                                <div className="sl-bucket-coverage-amount">
                                                                    <strong>
                                                                        {formatMoneyAmount(
                                                                            coverageBalance.balance,
                                                                            coverageBalance.currency,
                                                                            displayLanguage,
                                                                        )}
                                                                    </strong>
                                                                    <small>
                                                                        {coverageBalance.balance <
                                                                        0
                                                                            ? t(
                                                                                  "coverage.states.negative",
                                                                              )
                                                                            : coverageBalance.balance >
                                                                                0
                                                                              ? t(
                                                                                    "coverage.states.positive",
                                                                                )
                                                                              : t(
                                                                                    "coverage.states.zero",
                                                                                )}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-muted small mt-3 mb-0">
                                                    {t("coverage.noBalances")}
                                                </p>
                                            )}

                                            {selectedBucketAccountCoverageWarnings.length >
                                            0 ? (
                                                <div
                                                    className="sl-bucket-coverage-warning-list mt-3"
                                                    role="alert">
                                                    {selectedBucketAccountCoverageWarnings.map(
                                                        (warning) => (
                                                            <article
                                                                className="sl-bucket-coverage-warning"
                                                                key={
                                                                    warning.key
                                                                }>
                                                                <span aria-hidden="true">
                                                                    !
                                                                </span>
                                                                <p>
                                                                    {warning.positiveAccountCount ===
                                                                        1 &&
                                                                    warning.positiveAccountName &&
                                                                    warning.positiveAmount !=
                                                                        null
                                                                        ? t(
                                                                              "coverage.withSinglePositive",
                                                                              {
                                                                                  bucketName:
                                                                                      warning.bucketName,
                                                                                  negativeAccountName:
                                                                                      warning.negativeAccountName,
                                                                                  negativeAmount:
                                                                                      formatMoneyAmount(
                                                                                          warning.negativeAmount,
                                                                                          warning.currency,
                                                                                          displayLanguage,
                                                                                      ),
                                                                                  positiveAccountName:
                                                                                      warning.positiveAccountName,
                                                                                  positiveAmount:
                                                                                      formatMoneyAmount(
                                                                                          warning.positiveAmount,
                                                                                          warning.currency,
                                                                                          displayLanguage,
                                                                                      ),
                                                                              },
                                                                          )
                                                                        : warning.positiveAccountCount >
                                                                            1
                                                                          ? t(
                                                                                "coverage.withMultiplePositive",
                                                                                {
                                                                                    bucketName:
                                                                                        warning.bucketName,
                                                                                    negativeAccountName:
                                                                                        warning.negativeAccountName,
                                                                                    negativeAmount:
                                                                                        formatMoneyAmount(
                                                                                            warning.negativeAmount,
                                                                                            warning.currency,
                                                                                            displayLanguage,
                                                                                        ),
                                                                                    positiveTotal:
                                                                                        formatMoneyAmount(
                                                                                            warning.positiveTotal,
                                                                                            warning.currency,
                                                                                            displayLanguage,
                                                                                        ),
                                                                                },
                                                                            )
                                                                          : t(
                                                                                "coverage.negativeOnly",
                                                                                {
                                                                                    bucketName:
                                                                                        warning.bucketName,
                                                                                    negativeAccountName:
                                                                                        warning.negativeAccountName,
                                                                                    negativeAmount:
                                                                                        formatMoneyAmount(
                                                                                            warning.negativeAmount,
                                                                                            warning.currency,
                                                                                            displayLanguage,
                                                                                        ),
                                                                                },
                                                                            )}
                                                                </p>
                                                            </article>
                                                        ),
                                                    )}
                                                </div>
                                            ) : selectedBucketAccountCoverageBalances.length >
                                              0 ? (
                                                <p className="sl-bucket-coverage-ok mt-3">
                                                    {t("coverage.noShortfalls")}
                                                </p>
                                            ) : null}
                                        </>
                                    )}
                                </div>

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

                                <div className="border-top mt-4 pt-4 text-center">
                                    <p className="text-muted small">
                                        {isBucketClosed(selectedBucket)
                                            ? t("reopenHint")
                                            : t("closeHint")}
                                    </p>

                                    <button
                                        className={
                                            isBucketClosed(selectedBucket)
                                                ? "btn btn-outline-success btn-sm"
                                                : "btn btn-sm"
                                        }
                                        disabled={
                                            isStatusChanging ||
                                            isSelectedBucketCloseDisabledByBalance
                                        }
                                        id={
                                            isBucketClosed(selectedBucket)
                                                ? undefined
                                                : "sl-close-bucket-button"
                                        }
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

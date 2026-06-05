import { useCallback, useMemo, useState } from "react";

import { listCalendarMovements } from "../api/financeApi";
import type {
    FinanceCalendarMovementResponseDto,
    FinanceCalendarSearchRequestDto,
    IsoDate,
    TransactionResponseDto,
    Uuid,
} from "../api/financeApiTypes";

export type FinanceCalendarRange = {
    from: IsoDate;
    to: IsoDate;
};

type FinanceCalendarCacheEntry = {
    movements: FinanceCalendarMovementResponseDto[];
    loadedFrom: IsoDate | null;
    loadedTo: IsoDate | null;
    loadedRangeKeys: Set<string>;
    pendingRangeKeys: Set<string>;
    updatedAt: number | null;
};

type FinanceCalendarCacheSnapshot = {
    movements: FinanceCalendarMovementResponseDto[];
    loadedFrom: IsoDate | null;
    loadedTo: IsoDate | null;
    updatedAt: number | null;
};

type LoadRangeOptions = {
    force?: boolean;
    replace?: boolean;
};

const BASE_CACHE_KEY = "__base__";

const calendarCache = new Map<string, FinanceCalendarCacheEntry>();

function createEmptyCacheEntry(): FinanceCalendarCacheEntry {
    return {
        movements: [],
        loadedFrom: null,
        loadedTo: null,
        loadedRangeKeys: new Set<string>(),
        pendingRangeKeys: new Set<string>(),
        updatedAt: null,
    };
}

function getCacheEntry(cacheKey: string) {
    const existingEntry = calendarCache.get(cacheKey);

    if (existingEntry) {
        return existingEntry;
    }

    const newEntry = createEmptyCacheEntry();
    calendarCache.set(cacheKey, newEntry);

    return newEntry;
}

function getSnapshot(cacheKey: string): FinanceCalendarCacheSnapshot {
    const entry = getCacheEntry(cacheKey);

    return {
        movements: entry.movements,
        loadedFrom: entry.loadedFrom,
        loadedTo: entry.loadedTo,
        updatedAt: entry.updatedAt,
    };
}

function getRangeKey(range: FinanceCalendarRange) {
    return `${range.from}:${range.to}`;
}

function normalizeSimulationGroupIds(simulationGroupIds: Uuid[]) {
    return [...simulationGroupIds].sort();
}

function getCacheKey(simulationGroupIds: Uuid[]) {
    const normalizedIds = normalizeSimulationGroupIds(simulationGroupIds);

    return normalizedIds.length > 0 ? normalizedIds.join("|") : BASE_CACHE_KEY;
}

function minIsoDate(first: IsoDate | null, second: IsoDate) {
    return first == null || second < first ? second : first;
}

function maxIsoDate(first: IsoDate | null, second: IsoDate) {
    return first == null || second > first ? second : first;
}

function sortMovements(
    movements: FinanceCalendarMovementResponseDto[],
): FinanceCalendarMovementResponseDto[] {
    return [...movements].sort((first, second) => {
        const dateCompare = first.chargeDate.localeCompare(second.chargeDate);

        if (dateCompare !== 0) {
            return dateCompare;
        }

        return first.description.localeCompare(second.description);
    });
}

export function getFinanceCalendarMovementKey(
    movement: FinanceCalendarMovementResponseDto,
) {
    return [
        movement.movementType,
        movement.transactionId ?? "",
        movement.recurringTransactionId ?? "",
        movement.logicalDate,
        movement.chargeDate,
        movement.accountId,
        movement.creditCardId ?? "",
        movement.bucketId ?? "",
        movement.simulationGroupId ?? "",
    ].join("|");
}

function mergeMovements(
    currentMovements: FinanceCalendarMovementResponseDto[],
    incomingMovements: FinanceCalendarMovementResponseDto[],
) {
    const movementsByKey = new Map<
        string,
        FinanceCalendarMovementResponseDto
    >();

    currentMovements.forEach((movement) => {
        movementsByKey.set(getFinanceCalendarMovementKey(movement), movement);
    });

    incomingMovements.forEach((movement) => {
        movementsByKey.set(getFinanceCalendarMovementKey(movement), movement);
    });

    return sortMovements([...movementsByKey.values()]);
}

export function getTodayIsoDate() {
    const currentDate = new Date();
    const timezoneOffsetMs = currentDate.getTimezoneOffset() * 60_000;
    const localDate = new Date(currentDate.getTime() - timezoneOffsetMs);

    return localDate.toISOString().slice(0, 10);
}

export function addDaysToIsoDate(date: IsoDate, days: number): IsoDate {
    const [year, month, day] = date.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return utcDate.toISOString().slice(0, 10);
}

export function getInitialFinanceCalendarRange(
    referenceDate: IsoDate = getTodayIsoDate(),
): FinanceCalendarRange {
    return {
        from: addDaysToIsoDate(referenceDate, -90),
        to: addDaysToIsoDate(referenceDate, 180),
    };
}

export function clearFinanceCalendarCacheForTests() {
    calendarCache.clear();
}

function addLoadingRangeKey(
    loadingRangeKeys: Record<string, string[]>,
    cacheKey: string,
    rangeKey: string,
) {
    const currentRangeKeys = loadingRangeKeys[cacheKey] ?? [];

    if (currentRangeKeys.includes(rangeKey)) {
        return loadingRangeKeys;
    }

    return {
        ...loadingRangeKeys,
        [cacheKey]: [...currentRangeKeys, rangeKey],
    };
}

function removeLoadingRangeKey(
    loadingRangeKeys: Record<string, string[]>,
    cacheKey: string,
    rangeKey: string,
) {
    const currentRangeKeys = loadingRangeKeys[cacheKey] ?? [];
    const nextRangeKeys = currentRangeKeys.filter(
        (currentRangeKey) => currentRangeKey !== rangeKey,
    );

    if (nextRangeKeys.length === currentRangeKeys.length) {
        return loadingRangeKeys;
    }

    if (nextRangeKeys.length === 0) {
        const remainingLoadingRangeKeys = { ...loadingRangeKeys };

        delete remainingLoadingRangeKeys[cacheKey];

        return remainingLoadingRangeKeys;
    }

    return {
        ...loadingRangeKeys,
        [cacheKey]: nextRangeKeys,
    };
}

function transactionToCalendarMovement(
    transaction: TransactionResponseDto,
    sourceMovement: FinanceCalendarMovementResponseDto,
): FinanceCalendarMovementResponseDto {
    return {
        movementType: "PERSISTED_TRANSACTION",
        transactionId: transaction.transactionId,
        recurringTransactionId: transaction.recurringTransactionId,
        logicalDate:
            transaction.recurringTransactionLogicalDate ??
            transaction.transactionChargeDate,
        chargeDate: transaction.transactionChargeDate,
        description: transaction.transactionDescription,
        amount: transaction.transactionAmount,
        affectsAccountBalance: transaction.transactionAffectsAccountBalance,
        affectsSerenityline: transaction.transactionAffectsSerenityline,
        categoryId: transaction.categoryId,
        financialPriorityId: sourceMovement.financialPriorityId,
        accountId: transaction.accountId,
        creditCardId: transaction.creditCardId,
        bucketId: transaction.bucketId,
        confirmed: transaction.transactionIsConfirmed,
        simulated: transaction.transactionIsSimulated,
        simulationGroupId: transaction.simulationGroupId,
        userEntered: transaction.transactionIsUserEntered,
        finalOccurrence: sourceMovement.finalOccurrence,
    };
}

export function useFinanceCalendarCache(simulationGroupIds: Uuid[]) {
    const simulationGroupIdsKey = useMemo(
        () => getCacheKey(simulationGroupIds),
        [simulationGroupIds],
    );

    const normalizedSimulationGroupIds = useMemo(
        () => normalizeSimulationGroupIds(simulationGroupIds),
        [simulationGroupIds],
    );

    const [, setCacheRevision] = useState(0);
    const [loadingRangeKeys, setLoadingRangeKeys] = useState<
        Record<string, string[]>
    >({});
    const [errorState, setErrorState] = useState<{
        cacheKey: string;
        error: unknown;
    } | null>(null);

    const snapshot = getSnapshot(simulationGroupIdsKey);

    const error =
        errorState?.cacheKey === simulationGroupIdsKey
            ? errorState.error
            : null;

    const loadRange = useCallback(
        async (range: FinanceCalendarRange, options: LoadRangeOptions = {}) => {
            const rangeKey = getRangeKey(range);
            const cacheEntry = getCacheEntry(simulationGroupIdsKey);

            if (
                !options.force &&
                (cacheEntry.loadedRangeKeys.has(rangeKey) ||
                    cacheEntry.pendingRangeKeys.has(rangeKey))
            ) {
                return;
            }

            cacheEntry.pendingRangeKeys.add(rangeKey);

            setLoadingRangeKeys((currentLoadingRangeKeys) =>
                addLoadingRangeKey(
                    currentLoadingRangeKeys,
                    simulationGroupIdsKey,
                    rangeKey,
                ),
            );
            setErrorState(null);

            try {
                const request: FinanceCalendarSearchRequestDto = {
                    from: range.from,
                    to: range.to,
                };

                if (normalizedSimulationGroupIds.length > 0) {
                    request.simulationGroupIds = normalizedSimulationGroupIds;
                }

                const movements = await listCalendarMovements(request);

                const entryToUpdate = getCacheEntry(simulationGroupIdsKey);

                if (options.replace) {
                    entryToUpdate.movements = [];
                    entryToUpdate.loadedFrom = null;
                    entryToUpdate.loadedTo = null;
                    entryToUpdate.loadedRangeKeys.clear();
                    entryToUpdate.pendingRangeKeys.clear();
                    entryToUpdate.updatedAt = null;
                }

                entryToUpdate.movements = mergeMovements(
                    entryToUpdate.movements,
                    movements,
                );
                entryToUpdate.loadedFrom = minIsoDate(
                    entryToUpdate.loadedFrom,
                    range.from,
                );
                entryToUpdate.loadedTo = maxIsoDate(
                    entryToUpdate.loadedTo,
                    range.to,
                );
                entryToUpdate.loadedRangeKeys.add(rangeKey);
                entryToUpdate.updatedAt = Date.now();

                setCacheRevision((currentRevision) => currentRevision + 1);
            } catch (caughtError) {
                setErrorState({
                    cacheKey: simulationGroupIdsKey,
                    error: caughtError,
                });
            } finally {
                const entryToUpdate = getCacheEntry(simulationGroupIdsKey);
                entryToUpdate.pendingRangeKeys.delete(rangeKey);

                setLoadingRangeKeys((currentLoadingRangeKeys) =>
                    removeLoadingRangeKey(
                        currentLoadingRangeKeys,
                        simulationGroupIdsKey,
                        rangeKey,
                    ),
                );
            }
        },
        [normalizedSimulationGroupIds, simulationGroupIdsKey],
    );

    const refreshRange = useCallback(
        async (range: FinanceCalendarRange) => {
            await loadRange(range, {
                force: true,
                replace: true,
            });
        },
        [loadRange],
    );

    const replaceMovementWithTransaction = useCallback(
        (
            movementKeyToReplace: string,
            sourceMovement: FinanceCalendarMovementResponseDto,
            transaction: TransactionResponseDto,
        ) => {
            const cacheEntry = getCacheEntry(simulationGroupIdsKey);
            const confirmedMovement = transactionToCalendarMovement(
                transaction,
                sourceMovement,
            );

            cacheEntry.movements = sortMovements([
                ...cacheEntry.movements.filter(
                    (movement) =>
                        getFinanceCalendarMovementKey(movement) !==
                        movementKeyToReplace,
                ),
                confirmedMovement,
            ]);
            cacheEntry.updatedAt = Date.now();

            setCacheRevision((currentRevision) => currentRevision + 1);
        },
        [simulationGroupIdsKey],
    );

    return {
        movements: snapshot.movements,
        loadedFrom: snapshot.loadedFrom,
        loadedTo: snapshot.loadedTo,
        updatedAt: snapshot.updatedAt,
        isLoading: (loadingRangeKeys[simulationGroupIdsKey] ?? []).length > 0,
        error,
        loadRange,
        refreshRange,
        replaceMovementWithTransaction,
    };
}

function noop() {}

function toPositiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

function toNonNegativeNumber(value, fallback) {
    return Number.isFinite(value) && value >= 0 ? Number(value) : fallback;
}

function isRetryableError(error) {
    const status = error?.response?.status;

    if (error?.code === 'ECONNABORTED') {
        return true;
    }

    if (typeof status !== 'number') {
        return true;
    }

    return status === 408 || status === 429 || status >= 500;
}

export function createStudyReviewTransport({
    submitBatch,
    onBatchSuccess = noop,
    onError = noop,
    maxConcurrent = 3,
    maxBatchSize = 10,
    flushIntervalMs = 3_000,
    maxAttempts = 3,
    retryBaseDelayMs = 500,
    retryMaxDelayMs = 8_000,
    shouldRetry = isRetryableError,
}) {
    if (typeof submitBatch !== 'function') {
        throw new TypeError('submitBatch must be a function');
    }

    const concurrencyLimit = toPositiveInteger(maxConcurrent, 3);
    const batchSizeLimit = toPositiveInteger(maxBatchSize, 10);
    const flushDelayMs = toPositiveInteger(flushIntervalMs, 3_000);
    const attemptLimit = toPositiveInteger(maxAttempts, 3);
    const baseRetryDelayMs = toNonNegativeNumber(retryBaseDelayMs, 500);
    const maxRetryDelayMs = toNonNegativeNumber(retryMaxDelayMs, 8_000);

    let pendingEntries = [];
    let inFlightBatchCount = 0;
    let inFlightReviewCount = 0;
    let retryQueueCount = 0;
    let disposed = false;
    let nextEntryId = 0;
    let forceFlushMode = false;
    let flushTimer = null;

    const fatalErrors = [];
    const listeners = new Set();
    const inFlightTasks = new Set();
    const scheduledRetries = new Set();

    const getSnapshot = () => ({
        pendingCount: pendingEntries.length + retryQueueCount,
        inFlightCount: inFlightBatchCount,
        queuedCount: pendingEntries.length + retryQueueCount + inFlightReviewCount,
        isFlushing:
            pendingEntries.length > 0 ||
            retryQueueCount > 0 ||
            inFlightBatchCount > 0 ||
            scheduledRetries.size > 0,
    });

    const emit = () => {
        const snapshot = getSnapshot();
        listeners.forEach((listener) => listener(snapshot));
    };

    const settleEntry = (entry, error, result) => {
        if (entry.settled) {
            return;
        }

        entry.settled = true;

        if (error) {
            entry.reject(error);
            return;
        }

        entry.resolve(result);
    };

    const settleEntries = (entries, error, result) => {
        entries.forEach((entry) => settleEntry(entry, error, result));
    };

    const clearFlushTimer = () => {
        if (!flushTimer) {
            return;
        }

        clearTimeout(flushTimer);
        flushTimer = null;
    };

    const computeRetryDelay = (attemptNumber) => {
        const exponentialDelay = baseRetryDelayMs * 2 ** Math.max(attemptNumber - 1, 0);
        return Math.min(maxRetryDelayMs, exponentialDelay);
    };

    const dispatchNext = ({ allowPartial = false } = {}) => {
        if (disposed) {
            return;
        }

        while (inFlightBatchCount < concurrencyLimit && pendingEntries.length > 0) {
            const canSendPartialBatch = forceFlushMode || allowPartial;
            if (!canSendPartialBatch && pendingEntries.length < batchSizeLimit) {
                break;
            }

            const currentBatchSize = canSendPartialBatch
                ? Math.min(batchSizeLimit, pendingEntries.length)
                : batchSizeLimit;
            const batchEntries = pendingEntries.splice(0, currentBatchSize);
            const batchReviews = batchEntries.map((entry) => entry.review);

            batchEntries.forEach((entry) => {
                entry.attempts += 1;
            });

            inFlightBatchCount += 1;
            inFlightReviewCount += batchEntries.length;
            emit();

            let task;
            task = Promise.resolve()
                .then(() => submitBatch(batchReviews))
                .then((result) => {
                    try {
                        onBatchSuccess(result, batchReviews);
                    } catch {
                        // Ignore callback errors to keep sync flow stable.
                    }

                    settleEntries(batchEntries, null, result);
                    return result;
                })
                .catch((error) => {
                    const retryableEntries = [];
                    const exhaustedEntries = [];

                    batchEntries.forEach((entry) => {
                        const canRetry =
                            entry.attempts < attemptLimit &&
                            shouldRetry(error, entry.attempts, entry.review, batchReviews);

                        if (canRetry) {
                            retryableEntries.push(entry);
                        } else {
                            exhaustedEntries.push(entry);
                        }
                    });

                    if (retryableEntries.length > 0 && !disposed) {
                        const maxAttemptInBatch = Math.max(...retryableEntries.map((entry) => entry.attempts));
                        const retryDelayMs = computeRetryDelay(maxAttemptInBatch);

                        if (retryDelayMs > 0) {
                            retryQueueCount += retryableEntries.length;
                            const scheduled = {
                                timer: null,
                                entries: retryableEntries,
                            };

                            scheduled.timer = setTimeout(() => {
                                if (!scheduledRetries.has(scheduled) || disposed) {
                                    return;
                                }

                                scheduledRetries.delete(scheduled);
                                retryQueueCount = Math.max(retryQueueCount - scheduled.entries.length, 0);
                                pendingEntries = scheduled.entries.concat(pendingEntries);
                                emit();
                                dispatchNext();
                            }, retryDelayMs);

                            scheduledRetries.add(scheduled);
                            emit();
                        } else {
                            pendingEntries = retryableEntries.concat(pendingEntries);
                            emit();
                        }
                    }

                    if (exhaustedEntries.length > 0) {
                        fatalErrors.push(error);
                        onError(error, exhaustedEntries.map((entry) => entry.review));
                        settleEntries(exhaustedEntries, error);
                    }

                    return undefined;
                })
                .finally(() => {
                    inFlightTasks.delete(task);
                    inFlightBatchCount = Math.max(inFlightBatchCount - 1, 0);
                    inFlightReviewCount = Math.max(inFlightReviewCount - batchEntries.length, 0);
                    emit();
                    dispatchNext();
                });

            inFlightTasks.add(task);
        }

        if (pendingEntries.length > 0 && !flushTimer) {
            flushTimer = setTimeout(() => {
                flushTimer = null;
                dispatchNext({ allowPartial: true });
            }, flushDelayMs);
        }
    };

    const releaseScheduledRetries = () => {
        if (scheduledRetries.size === 0) {
            return;
        }

        const releasedEntries = [];

        for (const scheduled of Array.from(scheduledRetries)) {
            clearTimeout(scheduled.timer);
            scheduledRetries.delete(scheduled);
            retryQueueCount = Math.max(retryQueueCount - scheduled.entries.length, 0);
            releasedEntries.push(...scheduled.entries);
        }

        if (releasedEntries.length > 0) {
            pendingEntries = releasedEntries.concat(pendingEntries);
            emit();
        }
    };

    const flushAll = async (options = {}) => {
        if (disposed) {
            return [];
        }

        const timeoutMs = toNonNegativeNumber(options.timeoutMs, 0);
        const startedAt = Date.now();

        forceFlushMode = true;
        clearFlushTimer();
        releaseScheduledRetries();
        dispatchNext({ allowPartial: true });

        while (
            pendingEntries.length > 0 ||
            retryQueueCount > 0 ||
            scheduledRetries.size > 0 ||
            inFlightTasks.size > 0
        ) {
            if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
                forceFlushMode = false;
                throw new Error(`Study review sync timed out after ${timeoutMs}ms`);
            }

            if (inFlightTasks.size === 0) {
                releaseScheduledRetries();
                dispatchNext({ allowPartial: true });

                if (inFlightTasks.size === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    continue;
                }
            }

            if (timeoutMs > 0) {
                const remainingMs = Math.max(timeoutMs - (Date.now() - startedAt), 1);
                await Promise.race([
                    Promise.allSettled(Array.from(inFlightTasks)),
                    new Promise((resolve) => setTimeout(resolve, Math.min(remainingMs, 50))),
                ]);
            } else {
                await Promise.allSettled(Array.from(inFlightTasks));
            }
        }

        forceFlushMode = false;

        if (fatalErrors.length > 0) {
            const [firstError] = fatalErrors.splice(0, fatalErrors.length);
            throw firstError;
        }

        return [];
    };

    const enqueue = (review) => {
        if (disposed) {
            return Promise.resolve(undefined);
        }

        let resolveEntry;
        let rejectEntry;
        const entry = {
            id: nextEntryId,
            review,
            attempts: 0,
            settled: false,
            promise: null,
            resolve: null,
            reject: null,
        };
        nextEntryId += 1;

        entry.promise = new Promise((resolve, reject) => {
            resolveEntry = resolve;
            rejectEntry = reject;
        });
        entry.resolve = resolveEntry;
        entry.reject = rejectEntry;

        pendingEntries.push(entry);
        emit();
        dispatchNext();

        return entry.promise.catch(() => undefined);
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        listener(getSnapshot());
        return () => listeners.delete(listener);
    };

    const dispose = () => {
        disposed = true;

        clearFlushTimer();
        for (const scheduled of Array.from(scheduledRetries)) {
            clearTimeout(scheduled.timer);
            settleEntries(scheduled.entries, new Error('Study review transport disposed'));
            scheduledRetries.delete(scheduled);
        }

        if (pendingEntries.length > 0) {
            settleEntries(pendingEntries, new Error('Study review transport disposed'));
        }

        pendingEntries = [];
        retryQueueCount = 0;
        listeners.clear();
        emit();
    };

    return {
        enqueue,
        flushAll,
        subscribe,
        dispose,
        getSnapshot,
    };
}
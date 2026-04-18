function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPositiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
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

export async function mapWithConcurrency(items, mapper, options = {}) {
    if (!Array.isArray(items)) {
        throw new TypeError('items must be an array');
    }

    if (typeof mapper !== 'function') {
        throw new TypeError('mapper must be a function');
    }

    if (items.length === 0) {
        return [];
    }

    const concurrency = toPositiveInteger(options.concurrency, 4);
    const retries = Number.isInteger(options.retries) && options.retries >= 0 ? options.retries : 0;
    const retryDelayMs = Number.isFinite(options.retryDelayMs) && options.retryDelayMs >= 0 ? Number(options.retryDelayMs) : 0;
    const shouldRetry = typeof options.shouldRetry === 'function' ? options.shouldRetry : isRetryableError;

    const results = new Array(items.length);
    let cursor = 0;

    async function runItem(item, index) {
        let attempts = 0;

        while (true) {
            try {
                return await mapper(item, index);
            } catch (error) {
                const canRetry = attempts < retries && shouldRetry(error, attempts + 1, item, index);
                if (!canRetry) {
                    throw error;
                }

                attempts += 1;

                if (retryDelayMs > 0) {
                    await sleep(retryDelayMs);
                }
            }
        }
    }

    async function worker() {
        while (true) {
            const index = cursor;
            cursor += 1;

            if (index >= items.length) {
                return;
            }

            results[index] = await runItem(items[index], index);
        }
    }

    const workerCount = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}

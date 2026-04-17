function defaultNow() {
    return Date.now();
}

function toPositiveNumber(value, fallback) {
    return Number.isFinite(value) && value > 0 ? Number(value) : fallback;
}

export function createTimedRequestMemo({ now = defaultNow } = {}) {
    const cache = new Map();
    const inFlight = new Map();

    async function run(key, loader, options = {}) {
        if (!key && key !== 0) {
            throw new TypeError('request memo key is required');
        }

        if (typeof loader !== 'function') {
            throw new TypeError('loader must be a function');
        }

        const ttlMs = toPositiveNumber(options.ttlMs, 0);
        const force = options.force === true;
        const normalizedKey = String(key);
        const currentTime = now();

        if (!force) {
            const cachedEntry = cache.get(normalizedKey);
            if (cachedEntry && cachedEntry.expiresAt > currentTime) {
                return cachedEntry.value;
            }

            if (inFlight.has(normalizedKey)) {
                return inFlight.get(normalizedKey);
            }
        } else {
            cache.delete(normalizedKey);
            inFlight.delete(normalizedKey);
        }

        const promise = Promise.resolve()
            .then(loader)
            .then((value) => {
                if (ttlMs > 0) {
                    cache.set(normalizedKey, {
                        value,
                        expiresAt: now() + ttlMs,
                    });
                } else {
                    cache.delete(normalizedKey);
                }
                return value;
            })
            .finally(() => {
                inFlight.delete(normalizedKey);
            });

        inFlight.set(normalizedKey, promise);
        return promise;
    }

    function clear() {
        cache.clear();
        inFlight.clear();
    }

    function invalidate(key) {
        const normalizedKey = String(key);
        cache.delete(normalizedKey);
        inFlight.delete(normalizedKey);
    }

    return {
        run,
        clear,
        invalidate,
    };
}

const CHECKOUT_SESSION_KEY = 'skr-checkout-session';

function isBrowser() {
    return typeof window !== 'undefined';
}

export function readCheckoutSession() {
    if (!isBrowser()) {
        return null;
    }

    try {
        const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
        if (!raw) {
            return null;
        }

        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function writeCheckoutSession(payload) {
    if (!isBrowser() || !payload || typeof payload !== 'object') {
        return payload;
    }

    const nextSession = {
        ...payload,
        updatedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(nextSession));
    return nextSession;
}

export function clearCheckoutSession() {
    if (!isBrowser()) {
        return;
    }

    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
}

export function resolveCheckoutSessionByOrderCode(orderCode) {
    const session = readCheckoutSession();

    if (!session) {
        return null;
    }

    if (!orderCode || session.orderCode === orderCode) {
        return session;
    }

    return null;
}

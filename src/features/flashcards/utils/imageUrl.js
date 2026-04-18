const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function isInvalidLiteral(value) {
    const normalized = value.toLowerCase();
    return normalized === 'null' || normalized === 'undefined' || normalized === 'nan';
}

export function resolveFlashcardImageUrl(value) {
    if (typeof value !== 'string') {
        return '';
    }

    let raw = value.trim();
    if (!raw || isInvalidLiteral(raw)) {
        return '';
    }

    raw = raw.replace(/\\/g, '/');

    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
        return raw;
    }

    if (raw.startsWith('//')) {
        return `https:${raw}`;
    }

    if (!API_BASE) {
        return raw.startsWith('/') ? raw : `/${raw}`;
    }

    return raw.startsWith('/') ? `${API_BASE}${raw}` : `${API_BASE}/${raw}`;
}

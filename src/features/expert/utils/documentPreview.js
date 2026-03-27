const MIME_TYPE_TO_EXTENSION = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.oasis.opendocument.text': 'odt',
    'text/plain': 'txt',
};

const OFFICE_VIEWER_TYPES = new Set(['doc', 'docx', 'ppt', 'pptx']);

function getBackendOrigin() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    try {
        return new URL(apiBase).origin;
    } catch {
        return 'http://localhost:5000';
    }
}

function getDefaultOrigin() {
    return getBackendOrigin();
}

function normalizeDocumentType(value) {
    if (!value) return null;

    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return null;
    if (normalized.startsWith('.')) return normalized.slice(1);
    if (MIME_TYPE_TO_EXTENSION[normalized]) return MIME_TYPE_TO_EXTENSION[normalized];
    if (normalized.includes('/')) return null;
    return normalized;
}

function extractExtension(value) {
    if (!value) return null;

    const stringValue = String(value).trim();
    if (!stringValue) return null;

    const withoutQuery = stringValue.split('#')[0].split('?')[0];
    const segment = withoutQuery.split('/').pop() || withoutQuery;
    const parts = segment.split('.');

    if (parts.length < 2) return null;
    return parts.pop()?.toLowerCase() || null;
}

function isPrivateIpAddress(hostname) {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;

    const [a, b] = hostname.split('.').map((part) => Number.parseInt(part, 10));
    return (
        a === 10 ||
        a === 127 ||
        (a === 192 && b === 168) ||
        (a === 172 && b >= 16 && b <= 31)
    );
}

export function resolveDocumentUrl(fileUrl, origin = getDefaultOrigin()) {
    if (!fileUrl) return null;

    try {
        return new URL(fileUrl, origin).href;
    } catch {
        return fileUrl;
    }
}

export function getDocumentType(document) {
    return (
        normalizeDocumentType(document?.fileType) ||
        extractExtension(document?.fileName) ||
        extractExtension(document?.fileUrl)
    );
}

export function isPublicViewerReachableUrl(fileUrl, origin = getDefaultOrigin()) {
    if (!fileUrl) return false;

    try {
        const url = new URL(resolveDocumentUrl(fileUrl, origin));
        if (!['http:', 'https:'].includes(url.protocol)) return false;
        if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) return false;
        if (url.hostname.endsWith('.local')) return false;
        if (isPrivateIpAddress(url.hostname)) return false;
        return true;
    } catch {
        return false;
    }
}

export function getDocumentPreviewStrategy(document, origin = getDefaultOrigin()) {
    const fileUrl = resolveDocumentUrl(document?.fileUrl, origin);
    if (!fileUrl) {
        return { kind: 'unsupported', reason: 'missing-url' };
    }

    if (fileUrl.includes('drive.google.com')) {
        const match = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
            return {
                kind: 'iframe',
                src: `https://drive.google.com/file/d/${match[1]}/preview`,
            };
        }
    }

    const documentType = getDocumentType(document);
    const isSameOrigin = (() => {
        try {
            return new URL(fileUrl).origin === new URL(origin).origin;
        } catch {
            return false;
        }
    })();

    if (documentType === 'pdf') {
        return { kind: 'iframe', src: fileUrl };
    }

    if (documentType === 'txt') {
        return { kind: 'text', src: fileUrl };
    }

    if (documentType === 'docx') {
        if (isSameOrigin) {
            return { kind: 'docx', src: fileUrl };
        }

        if (isPublicViewerReachableUrl(fileUrl, origin)) {
            return {
                kind: 'iframe',
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`,
            };
        }

        return { kind: 'docx', src: fileUrl };
    }

    if (OFFICE_VIEWER_TYPES.has(documentType)) {
        if (isPublicViewerReachableUrl(fileUrl, origin)) {
            return {
                kind: 'iframe',
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`,
            };
        }

        return { kind: 'unsupported', reason: 'private-office-file', src: fileUrl };
    }

    return { kind: 'iframe', src: fileUrl };
}

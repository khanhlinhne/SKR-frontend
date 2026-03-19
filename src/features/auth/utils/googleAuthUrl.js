const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

function normalizeApiBaseUrl(apiBaseUrl = DEFAULT_API_BASE_URL) {
    return apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
}

function isSafeRedirectTarget(redirectTarget) {
    return typeof redirectTarget === 'string' && redirectTarget.startsWith('/');
}

export function buildGoogleAuthUrl(apiBaseUrl = DEFAULT_API_BASE_URL, redirectTarget) {
    const googleAuthUrl = new URL(`${normalizeApiBaseUrl(apiBaseUrl)}/auth/google`);

    if (isSafeRedirectTarget(redirectTarget)) {
        googleAuthUrl.searchParams.set('redirect', redirectTarget);
    }

    return googleAuthUrl.toString();
}

/**
 * Token Manager - Quản lý token với thời hạn
 * Giúp tránh lag khi token hết hạn mà hệ thống vẫn nghĩ user đã login
 */

// Thời hạn mặc định của access token (24 giờ = 86400 giây)
const DEFAULT_TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;

/**
 * Lưu access token với thời hạn
 * @param {string} token - Access token từ server
 * @param {number} expiresInSeconds - Thời hạn token tính theo giây (mặc định 24h)
 */
export function setAccessToken(token, expiresInSeconds = DEFAULT_TOKEN_EXPIRY_SECONDS) {
    if (!token) {
        console.warn('[TokenManager] Cannot save empty token');
        return;
    }

    const expiresAt = Date.now() + (expiresInSeconds * 1000);

    try {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());
    } catch (error) {
        console.error('[TokenManager] Failed to save token:', error);
    }
}

/**
 * Lưu refresh token
 * @param {string} token - Refresh token từ server
 */
export function setRefreshToken(token) {
    if (!token) {
        return;
    }

    try {
        localStorage.setItem('refreshToken', token);
    } catch (error) {
        console.error('[TokenManager] Failed to save refresh token:', error);
    }
}

/**
 * Kiểm tra token còn hiệu lực không
 * @returns {boolean} - true nếu token còn hiệu lực
 */
export function isTokenValid() {
    const token = localStorage.getItem('accessToken');
    const expiresAtStr = localStorage.getItem('accessTokenExpiresAt');

    if (!token || token === 'undefined' || token === 'null') {
        return false;
    }

    // Nếu không có expiresAt, coi như token vô hạn (backward compatibility)
    if (!expiresAtStr) {
        return true;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();

    // Token đã hết hạn
    if (now >= expiresAt) {
        clearTokens();
        return false;
    }

    return true;
}

/**
 * Lấy access token hiện tại
 * @returns {string|null} - Access token hoặc null nếu không hợp lệ
 */
export function getAccessToken() {
    if (!isTokenValid()) {
        return null;
    }

    return localStorage.getItem('accessToken');
}

/**
 * Lấy refresh token
 * @returns {string|null}
 */
export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

/**
 * Xóa tất cả tokens
 */
export function clearTokens() {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    } catch (error) {
        console.error('[TokenManager] Failed to clear tokens:', error);
    }
}

/**
 * Lấy thời gian còn lại của token (tính theo giây)
 * @returns {number} - Số giây còn lại, -1 nếu không có token
 */
export function getTokenTimeRemaining() {
    const expiresAtStr = localStorage.getItem('accessTokenExpiresAt');

    if (!expiresAtStr) {
        return -1; // Token vô hạn (backward compatibility)
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();
    const remainingMs = expiresAt - now;

    if (remainingMs <= 0) {
        return 0;
    }

    return Math.floor(remainingMs / 1000);
}

/**
 * Kiểm tra token sắp hết hạn (còn < 5 phút)
 * @returns {boolean}
 */
export function isTokenExpiringSoon() {
    const remaining = getTokenTimeRemaining();
    return remaining > 0 && remaining < 5 * 60; // < 5 phút
}

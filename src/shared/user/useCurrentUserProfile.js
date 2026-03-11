import { useCallback, useEffect, useMemo, useState } from 'react';
import authApi from '@/shared/api/authApi';

const PROFILE_STORAGE_KEY = 'skr-current-user-profile';
const PROFILE_UPDATED_EVENT = 'skr:profile-updated';
const PROFILE_FETCH_TTL_MS = 60 * 1000;

const DEFAULT_PROFILE = {
    name: 'Ngu?i dùng',
    avatarUrl: '',
    email: '',
    isPremium: false,
};

let pendingProfileRequest = null;
let lastProfileFetchAt = 0;

function isBrowser() {
    return typeof window !== 'undefined';
}

function safeParse(value) {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function getStoredUser() {
    if (!isBrowser()) {
        return null;
    }

    return safeParse(localStorage.getItem('user'));
}

function extractRoleCodes(roles) {
    if (!Array.isArray(roles)) {
        return [];
    }

    return roles
        .map((role) => {
            if (typeof role === 'string') {
                return role;
            }
            return role?.roleCode || role?.role_code || null;
        })
        .filter(Boolean);
}

function normalizeProfile(source) {
    const raw = source || {};
    const storedUser = getStoredUser() || {};

    const roleCodes = extractRoleCodes(raw.roles || storedUser.roles);
    const premiumByRole = roleCodes.includes('premium_user');
    const premiumValue =
        raw.isPremium !== undefined
            ? raw.isPremium
            : storedUser.isPremium !== undefined
              ? storedUser.isPremium
              : premiumByRole;

    return {
        name:
            raw.fullName ||
            raw.displayName ||
            raw.username ||
            raw.name ||
            storedUser.fullName ||
            storedUser.displayName ||
            storedUser.username ||
            storedUser.name ||
            DEFAULT_PROFILE.name,
        avatarUrl: raw.avatarUrl || raw.avatar_url || raw.avatar || storedUser.avatarUrl || storedUser.avatar || '',
        email: raw.email || storedUser.email || '',
        isPremium: Boolean(premiumValue),
    };
}

function resolveResponseData(response) {
    return response?.data || response?.user || response;
}

export function getUserInitials(name) {
    if (!name || typeof name !== 'string') {
        return 'U';
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) {
        return 'U';
    }

    return parts.map((part) => part[0].toUpperCase()).join('');
}

export function readCachedUserProfile() {
    if (!isBrowser()) {
        return { ...DEFAULT_PROFILE };
    }

    const cached = safeParse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if (cached) {
        return normalizeProfile(cached);
    }

    return normalizeProfile(getStoredUser() || {});
}

export function updateCachedUserProfile(source) {
    const normalized = normalizeProfile(source);

    if (!isBrowser()) {
        return normalized;
    }

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));

    const storedUser = getStoredUser() || {};
    localStorage.setItem(
        'user',
        JSON.stringify({
            ...storedUser,
            name: normalized.name,
            fullName: storedUser.fullName || normalized.name,
            displayName: storedUser.displayName || normalized.name,
            avatarUrl: normalized.avatarUrl,
            email: normalized.email,
            isPremium: normalized.isPremium,
        }),
    );

    window.dispatchEvent(
        new CustomEvent(PROFILE_UPDATED_EVENT, {
            detail: normalized,
        }),
    );

    lastProfileFetchAt = Date.now();

    return normalized;
}

export function useCurrentUserProfile({ fetchOnMount = true } = {}) {
    const initialProfile = useMemo(() => readCachedUserProfile(), []);
    const [profile, setProfile] = useState(initialProfile);

    const refreshProfile = useCallback(async (options = {}) => {
        const { force = false } = options;
        const cachedProfile = readCachedUserProfile();

        if (!isBrowser()) {
            return cachedProfile;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            return cachedProfile;
        }

        const hasCachedProfile =
            cachedProfile.email ||
            cachedProfile.avatarUrl ||
            cachedProfile.name !== DEFAULT_PROFILE.name;

        if (!force && hasCachedProfile && Date.now() - lastProfileFetchAt < PROFILE_FETCH_TTL_MS) {
            setProfile(cachedProfile);
            return cachedProfile;
        }

        if (!pendingProfileRequest) {
            pendingProfileRequest = authApi
                .getMe()
                .then((response) => {
                    const user = resolveResponseData(response);
                    return updateCachedUserProfile(user);
                })
                .catch(() => null)
                .finally(() => {
                    pendingProfileRequest = null;
                });
        }

        const freshProfile = await pendingProfileRequest;
        if (freshProfile) {
            setProfile(freshProfile);
            return freshProfile;
        }

        return cachedProfile;
    }, []);

    useEffect(() => {
        if (!isBrowser()) {
            return undefined;
        }

        const handleProfileUpdated = (event) => {
            setProfile(normalizeProfile(event.detail));
        };

        const handleStorageChange = (event) => {
            if (event.key === PROFILE_STORAGE_KEY || event.key === 'user') {
                setProfile(readCachedUserProfile());
            }
        };

        window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (!fetchOnMount) {
            return undefined;
        }

        const timer = setTimeout(() => {
            void refreshProfile();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchOnMount, refreshProfile]);

    const setProfileLocally = useCallback((nextProfile) => {
        const updated = updateCachedUserProfile(nextProfile);
        setProfile(updated);
        return updated;
    }, []);

    return {
        profile,
        refreshProfile,
        setProfileLocally,
    };
}

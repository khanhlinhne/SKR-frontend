import authApi from '@/shared/api/authApi';
import { updateCachedUserProfile } from './useCurrentUserProfile';

function resolveResponseData(response) {
    return response?.data || response?.user || response || null;
}

export default async function hydrateProfileAfterAuth(initialUser = null) {
    const providedUser = resolveResponseData(initialUser);
    if (providedUser) {
        return updateCachedUserProfile(providedUser);
    }

    try {
        const response = await authApi.getMe();
        const user = resolveResponseData(response);
        if (user) {
            return updateCachedUserProfile(user);
        }
    } catch (error) {
        console.warn('Unable to hydrate current user profile after auth.', error);
    }

    return null;
}

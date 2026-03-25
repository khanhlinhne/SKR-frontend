import { Navigate } from 'react-router-dom';
import { isTokenValid } from '@/shared/utils/tokenManager';
import { readCachedUserProfile } from '@/shared/user';

/**
 * ExpertRoute — Chỉ cho phép creator (Expert) hoặc admin truy cập.
 * - Chưa đăng nhập → trang Unauthorized 401
 * - Đã đăng nhập nhưng không phải creator/admin → trang Unauthorized 403
 */
export default function ExpertRoute({ children }) {
    if (!isTokenValid()) {
        return <Navigate to="/unauthorized?type=not_authenticated" replace />;
    }

    const profile = readCachedUserProfile();
    const roles = profile?.roles || [];
    const isExpert = roles.includes('creator') || roles.includes('CREATOR')
        || roles.includes('admin') || roles.includes('ADMIN')
        || roles.includes('super_admin');

    if (!isExpert) {
        return <Navigate to="/unauthorized?type=not_authorized" replace />;
    }

    return children;
}

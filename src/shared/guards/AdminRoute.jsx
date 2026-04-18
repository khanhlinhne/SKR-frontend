import { Navigate } from 'react-router-dom';
import { isTokenValid } from '@/shared/utils/tokenManager';
import { readCachedUserProfile } from '@/shared/user';

/**
 * AdminRoute — Chỉ cho phép admin truy cập.
 * - Chưa đăng nhập → trang Unauthorized 401
 * - Đã đăng nhập nhưng không phải admin → trang Unauthorized 403
 */
export default function AdminRoute({ children }) {
    if (!isTokenValid()) {
        return <Navigate to="/unauthorized?type=not_authenticated" replace />;
    }

    const profile = readCachedUserProfile();
    const roles = profile?.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('ADMIN') || roles.includes('super_admin');

    if (!isAdmin) {
        return <Navigate to="/unauthorized?type=not_authorized" replace />;
    }

    return children;
}

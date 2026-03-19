import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '@/shared/utils/tokenManager';

/**
 * ProtectedRoute — Chỉ cho phép người dùng đã đăng nhập truy cập.
 * Nếu chưa đăng nhập, chuyển hướng về trang Unauthorized (401).
 */
export default function ProtectedRoute({ children }) {
    const location = useLocation();

    if (!isTokenValid()) {
        // Truyền location hiện tại để sau khi login có thể redirect về
        return (
            <Navigate
                to={`/unauthorized?type=not_authenticated&from=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return children;
}

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Component xu ly Google OAuth callback.
 * Backend redirect ve: /auth/callback?accessToken=xxx&refreshToken=xxx
 * Component nay se lay token tu URL, luu vao localStorage, roi chuyen ve dashboard.
 */
export default function GoogleCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error') || searchParams.get('message');

        if (accessToken) {
            // Luu token vao localStorage
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            // Chuyen ve dashboard
            navigate('/dashboard', { replace: true });
        } else if (error) {
            // Co loi tu Google OAuth -> chuyen ve login voi thong bao loi
            navigate('/login?error=google_failed', { replace: true });
        } else {
            // Khong co token cung khong co error -> ve login
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-base-content/60 font-medium">Đang xử lý đăng nhập Google...</p>
            </div>
        </div>
    );
}

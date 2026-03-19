import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard, AuthShell } from '@/features/auth/components';
import { hydrateProfileAfterAuth } from '@/shared/user';
import { setAccessToken, setRefreshToken } from '@/shared/utils/tokenManager';

export default function GoogleCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTarget = searchParams.get('redirect');
    const safeRedirectTarget = redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : null;

    useEffect(() => {
        const handleCallback = async () => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error') || searchParams.get('message');

        if (accessToken) {
            // Lưu token với thời hạn (Google callback mặc định 24h)
            setAccessToken(accessToken, 24 * 60 * 60);
            if (refreshToken) {
                setRefreshToken(refreshToken);
            }
            await hydrateProfileAfterAuth();
            navigate(safeRedirectTarget || '/dashboard', { replace: true });
            return;
        }

        if (error) {
            const loginPath = safeRedirectTarget
                ? `/login?error=google_failed&redirect=${encodeURIComponent(safeRedirectTarget)}`
                : '/login?error=google_failed';
            navigate(loginPath, { replace: true });
            return;
        }

        navigate('/login', { replace: true });
        };

        void handleCallback();
    }, [navigate, safeRedirectTarget, searchParams]);

    return (
        <AuthShell
            badge="Google OAuth"
            title="Đang xử lý đăng nhập"
            highlight="và đồng bộ phiên làm việc"
            description="Hệ thống đang xác minh phản hồi từ Google để đưa bạn trở lại dashboard an toàn."
            features={[]}
            summaryTitle="Phiên xác thực"
            summaryItems={[
                { label: 'Nguồn đăng nhập', value: 'Google OAuth' },
                { label: 'Bước hiện tại', value: 'Đồng bộ token' },
                { label: 'Điểm đến', value: 'Dashboard' },
            ]}
            contentWidthClassName="max-w-md"
        >
            <AuthCard
                eyebrow="Google"
                title="Đang đăng nhập"
                subtitle="Vui lòng đợi trong giây lát. Bạn sẽ được chuyển hướng tự động khi xác thực hoàn tất."
            >
                <div className="flex flex-col items-center justify-center gap-5 py-4 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                        className="apple-chip flex h-16 w-16 items-center justify-center rounded-full"
                    >
                        <Loader2 className="apple-accent-text h-7 w-7" />
                    </motion.div>
                    <div>
                        <p className="apple-main-text text-base font-semibold">Đang xử lý đăng nhập Google</p>
                        <p className="apple-secondary-text mt-2 text-sm leading-6">
                            Chúng tôi đang xác minh tài khoản và khởi tạo phiên bảo mật cho bạn.
                        </p>
                    </div>
                    <div className="apple-auth-panel rounded-2xl px-4 py-3 text-sm backdrop-blur-xl">
                        <div className="flex items-center gap-2 apple-secondary-text">
                            <ShieldCheck className="apple-accent-text h-4 w-4" />
                            Phiên xác thực đang được bảo vệ.
                        </div>
                    </div>
                </div>
            </AuthCard>
        </AuthShell>
    );
}

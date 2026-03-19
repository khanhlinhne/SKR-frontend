import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, BrainCircuit, Layers3, Lock, Mail } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/shared/api';
import { hydrateProfileAfterAuth } from '@/shared/user';
import {
    AuthCard,
    AuthField,
    AuthGoogleButton,
    AuthShell,
    AuthStatusBanner,
} from '@/features/auth/components';
import { buildGoogleAuthUrl } from '@/features/auth/utils/googleAuthUrl';
import { setAccessToken, setRefreshToken } from '@/shared/utils/tokenManager';

const loginFeatures = [
    {
        icon: Layers3,
        title: 'Luồng học tập rõ ràng',
        description: 'Bài học, flashcards và quiz nằm trong cùng một không gian gọn, dễ quay lại mỗi ngày.',
    },
    {
        icon: BrainCircuit,
        title: 'AI hỗ trợ đúng lúc',
        description: 'Nhận gợi ý ôn tập, tóm tắt và giải thích khi bạn thật sự cần, không thêm nhiều.',
    },
    {
        icon: BarChart3,
        title: 'Theo dõi tiến độ có ích',
        description: 'Biết hôm nay cần học gì tiếp theo nhờ các chỉ số ngắn gọn và có thể hành động.',
    },
];

const loginSummary = [
    { label: 'Người học hoạt động mỗi ngày', value: '12.400+' },
    { label: 'Tỷ lệ giữ nhịp sau 30 ngày', value: '92%' },
    { label: 'Thời gian tạo bộ học liệu mới', value: '< 2 phút' },
];

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const redirectTarget = searchParams.get('redirect');
    const safeRedirectTarget = redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : null;

    useEffect(() => {
        if (searchParams.get('error')) {
            setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
        }
    }, [searchParams]);

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
        setError('');
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            const token = data.data?.tokens?.accessToken;
            const expiresIn = data.data?.tokens?.expiresIn;
            if (!token) {
                setError('Đăng nhập thất bại: không nhận được token từ server.');
                return;
            }

            // Lưu token với thời hạn (mặc định 24h nếu server không trả expiresIn)
            setAccessToken(token, expiresIn || 24 * 60 * 60);
            if (data.data?.tokens?.refreshToken) {
                setRefreshToken(data.data.tokens.refreshToken);
            }
            await hydrateProfileAfterAuth(data.data?.user || data.user || null);
            navigate(safeRedirectTarget || '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            badge="Không gian học tập gọn, rõ và ít ma sát"
            title="Đăng nhập để tiếp tục"
            highlight="nhịp học của bạn"
            description="SKR giúp bạn quay lại đúng phần cần học tiếp theo, thay vì mất thời gian tìm lại ngữ cảnh cũ."
            features={loginFeatures}
            summaryTitle="Trải nghiệm học tập"
            summaryItems={loginSummary}
        >
            <AuthCard
                eyebrow="Chào mừng trở lại"
                title="Đăng nhập"
                subtitle="Tiếp tục flashcards, quiz, AI và toàn bộ tiến độ học tập của bạn trong một nơi duy nhất."
                footer={
                    <p className="apple-secondary-text text-sm">
                        Chưa có tài khoản?{' '}
                        <Link to="/signup" className="apple-auth-accent-link font-semibold">
                            Tạo tài khoản miễn phí
                        </Link>
                    </p>
                }
            >
                <form className="space-y-5" onSubmit={handleLogin}>
                    <AuthStatusBanner variant="error" message={error} />

                    <AuthField
                        label="Địa chỉ email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        autoComplete="email"
                        icon={Mail}
                        disabled={loading}
                    />

                    <AuthField
                        label="Mật khẩu"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                    />

                    <div className="flex items-center justify-between gap-3 text-sm">
                        <label className="apple-secondary-text flex items-center gap-2">
                            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded-md" />
                            Ghi nhớ tôi
                        </label>
                        <Link to="/forgot-password" className="apple-auth-accent-link font-semibold">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>

                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t apple-border" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="apple-panel-strong apple-secondary-text rounded-full px-3 text-xs font-semibold uppercase tracking-[0.18em]">
                                Hoặc
                            </span>
                        </div>
                    </div>
                    <AuthGoogleButton
                        onClick={() => {
                            window.location.href = buildGoogleAuthUrl(
                                import.meta.env.VITE_API_BASE_URL,
                                safeRedirectTarget,
                            );
                        }}
                    />
                </form>
            </AuthCard>
        </AuthShell>
    );
}



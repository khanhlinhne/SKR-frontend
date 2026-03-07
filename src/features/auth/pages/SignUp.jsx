import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BrainCircuit, Layers3, Lock, Mail, Sparkles, UserRoundPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api';
import {
    AuthCard,
    AuthField,
    AuthGoogleButton,
    AuthShell,
    AuthStatusBanner,
} from '@/features/auth/components';

const signupFeatures = [
    {
        icon: Sparkles,
        title: 'Bắt đầu nhanh',
        description: 'Tạo tài khoản trong vài phút và vào thẳng dashboard học tập của riêng bạn.',
    },
    {
        icon: BrainCircuit,
        title: 'AI đi cùng lộ trình',
        description: 'Tạo câu hỏi, nhận giải thích và giữ nhịp ôn tập ngay từ ngày đầu tiên.',
    },
    {
        icon: Layers3,
        title: 'Một tài khoản, toàn bộ công cụ',
        description: 'Học liệu, flashcards, quiz và tiến độ được giữ cùng nhau trong một luồng thống nhất.',
    },
];

const signupSummary = [
    { label: 'Bộ flashcard và quiz cơ bản', value: 'Miễn phí' },
    { label: 'Truy cập dashboard cá nhân', value: 'Ngay sau khi tạo' },
    { label: 'Xác minh email bảo mật', value: 'OTP 6 số' },
];

export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
        setError('');
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setLoading(false);
            return;
        }

        try {
            const data = await authApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            setSuccess(data.message || 'Đăng ký thành công. Đang chuyển đến bước xác minh email...');
            setTimeout(() => {
                navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            badge="Thiết lập tài khoản để bắt đầu học ngay"
            title="Tạo tài khoản mới"
            highlight="và bắt đầu học sâu hơn"
            description="Từ những bộ flashcards đầu tiên đến các phiên ôn tập bằng AI, mọi thứ bắt đầu từ một tài khoản gọn gàng và bảo mật."
            features={signupFeatures}
            summaryTitle="Khi đăng ký"
            summaryItems={signupSummary}
        >
            <AuthCard
                eyebrow="Tạo tài khoản"
                title="Đăng ký"
                subtitle="Mở không gian học tập cá nhân với dashboard, flashcards, quiz và AI trong cùng một trải nghiệm."
                footer={
                    <div className="space-y-3">
                        <p className="apple-secondary-text text-sm leading-6">
                            Bằng việc tạo tài khoản, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của SKR.
                        </p>
                        <p className="apple-secondary-text text-sm">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="apple-auth-accent-link font-semibold">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                }
            >
                <form className="space-y-5" onSubmit={handleSignUp}>
                    <AuthStatusBanner variant="error" message={error} />
                    <AuthStatusBanner variant="success" message={success} />

                    <AuthField
                        label="Tên đăng nhập"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username123"
                        autoComplete="username"
                        icon={UserRoundPlus}
                        disabled={loading}
                    />

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
                        placeholder="Tối thiểu 6 ký tự"
                        autoComplete="new-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                    />

                    <AuthField
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                    />

                    <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
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
                            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
                        }}
                    >
                        Đăng ký với Google
                    </AuthGoogleButton>
                </form>
            </AuthCard>
        </AuthShell>
    );
}

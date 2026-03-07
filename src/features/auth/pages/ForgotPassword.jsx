import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api';
import { AuthCard, AuthField, AuthShell, AuthStatusBanner } from '@/features/auth/components';

const forgotFeatures = [
    {
        icon: LockKeyhole,
        title: 'Khôi phục nhanh',
        description: 'Nhận mã OTP để đặt lại mật khẩu và quay lại luồng học tập mà không mất dữ liệu.',
    },
    {
        icon: ShieldCheck,
        title: 'Xác minh nhiều lớp',
        description: 'Quy trình khôi phục dùng email và OTP để giảm rủi ro truy cập trái phép.',
    },
    {
        icon: Mail,
        title: 'Rõ ràng từng bước',
        description: 'Chỉ cần nhập email, nhận mã và tiếp tục đặt mật khẩu mới trong một flow ngắn gọn.',
    },
];

const forgotSummary = [
    { label: 'Loại xác minh', value: 'OTP 6 số' },
    { label: 'Kênh gửi mã', value: 'Email đăng ký' },
    { label: 'Bước tiếp theo', value: 'Đặt lại mật khẩu' },
];

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await authApi.forgotPassword({ email });
            setSuccess('Đã gửi mã OTP đến email của bạn. Đang chuyển sang bước đặt lại mật khẩu...');
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            badge="Khôi phục quyền truy cập an toàn"
            title="Quên mật khẩu"
            highlight="nhưng không mất nhịp học"
            description="Chỉ mất vài bước để nhận OTP, đặt lại mật khẩu và quay lại dashboard của bạn với toàn bộ tiến độ vẫn được giữ nguyên."
            features={forgotFeatures}
            summaryTitle="Quy trình bảo mật"
            summaryItems={forgotSummary}
        >
            <AuthCard
                eyebrow="Khôi phục tài khoản"
                title="Đặt lại mật khẩu"
                subtitle="Nhập email đã đăng ký để nhận mã OTP xác minh và chuyển sang bước tạo mật khẩu mới."
                footer={
                    <Link to="/login" className="apple-auth-muted-link apple-transition inline-flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại đăng nhập
                    </Link>
                }
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AuthStatusBanner variant="error" message={error} />
                    <AuthStatusBanner variant="success" message={success} />

                    <AuthField
                        label="Địa chỉ email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError('');
                        }}
                        placeholder="name@example.com"
                        autoComplete="email"
                        icon={Mail}
                        disabled={isLoading}
                    />

                    <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isLoading}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-60"
                    >
                        {isLoading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>
                </form>
            </AuthCard>
        </AuthShell>
    );
}

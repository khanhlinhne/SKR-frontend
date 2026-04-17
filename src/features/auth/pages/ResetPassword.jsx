import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/shared/api';
import {
    AuthCard,
    AuthField,
    AuthOtpInputRow,
    AuthShell,
    AuthStatusBanner,
} from '@/features/auth/components';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const resetFeatures = [
    {
        icon: ShieldCheck,
        title: 'Mã OTP theo phiên',
        description: 'Mỗi yêu cầu khôi phục đều được xác minh bằng OTP trước khi cho phép đổi mật khẩu.',
    },
    {
        icon: Lock,
        title: 'Mật khẩu mới ngay lập tức',
        description: 'Sau khi xác minh thành công, mật khẩu mới sẽ áp dụng ngay cho lần đăng nhập tiếp theo.',
    },
    {
        icon: RefreshCw,
        title: 'Gửi lại mã khi cần',
        description: 'Bạn có thể yêu cầu OTP mới sau thời gian chờ ngắn nếu chưa nhận được email.',
    },
];

const resetSummary = [
    { label: 'Yêu cầu tối thiểu', value: 'Mật khẩu từ 6 ký tự' },
    { label: 'Thời gian gửi lại OTP', value: '60 giây' },
    { label: 'Điểm đến sau khi xong', value: 'Trang đăng nhập' },
];

function maskEmail(email) {
    if (!email) {
        return '';
    }

    return email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => start + '•'.repeat(Math.min(middle.length, 6)) + end);
}

function ResendTimer({ seconds }) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    return <span className="apple-auth-accent-link font-semibold tabular-nums">{mins}:{secs}</span>;
}

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password', { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setResendCooldown((current) => current - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const focusInput = useCallback((index) => {
        inputRefs.current[index]?.focus();
    }, []);

    const handleOtpChange = useCallback((index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setDigits((current) => {
            const next = [...current];
            next[index] = digit;
            return next;
        });
        setError('');

        if (digit && index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    }, [focusInput]);

    const handleOtpKeyDown = useCallback((index, event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            setDigits((current) => {
                const next = [...current];
                if (!next[index] && index > 0) {
                    next[index - 1] = '';
                    focusInput(index - 1);
                } else {
                    next[index] = '';
                }
                return next;
            });
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            focusInput(index - 1);
        }

        if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    }, [focusInput]);

    const handleOtpPaste = useCallback((event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) {
            return;
        }

        const next = Array(OTP_LENGTH).fill('');
        for (let index = 0; index < pasted.length; index += 1) {
            next[index] = pasted[index];
        }

        setDigits(next);
        setError('');
        focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
    }, [focusInput]);

    const otpValue = digits.join('');
    const isFormValid = otpValue.length === OTP_LENGTH && newPassword.length >= 6 && newPassword === confirmPassword;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (otpValue.length !== OTP_LENGTH) {
            setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.resetPassword({
                email,
                otp: otpValue,
                newPassword,
            });

            setSuccess(data.message || 'Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1600);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || resendLoading) {
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.resendForgotOtp({ email });
            setSuccess(data.message || 'Đã gửi lại mã OTP mới.');
            setResendCooldown(RESEND_COOLDOWN);
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <AuthShell
            badge="Đổi mật khẩu mà không làm gián đoạn luồng học"
            title="Tạo mật khẩu mới"
            highlight="và quay lại dashboard"
            description="Nhập mã OTP được gửi qua email, đặt mật khẩu mới và tiếp tục học tập trong cùng một flow ngắn gọn."
            features={resetFeatures}
            summaryTitle="Khôi phục bảo mật"
            summaryItems={resetSummary}
        >
            <AuthCard
                eyebrow="Bước 2"
                title="Đặt lại mật khẩu"
                subtitle={`Nhập mã OTP được gửi đến ${maskEmail(email)} và tạo mật khẩu mới cho tài khoản của bạn.`}
                footer={
                    <Link to="/forgot-password" className="apple-auth-muted-link apple-transition inline-flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại bước gửi email
                    </Link>
                }
            >
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AuthStatusBanner variant="error" message={error} />
                    <AuthStatusBanner variant="success" message={success} />

                    <div className="space-y-2">
                        <label className="apple-muted-text block text-xs font-semibold uppercase tracking-[0.18em]">
                            Mã OTP
                        </label>
                        <AuthOtpInputRow
                            digits={digits}
                            onChange={handleOtpChange}
                            onKeyDown={handleOtpKeyDown}
                            onPaste={handleOtpPaste}
                            inputRefs={inputRefs}
                            disabled={loading}
                        />
                    </div>

                    <AuthField
                        label="Mật khẩu mới"
                        name="newPassword"
                        value={newPassword}
                        onChange={(event) => {
                            setNewPassword(event.target.value);
                            setError('');
                        }}
                        placeholder="Tối thiểu 6 ký tự"
                        autoComplete="new-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                    />

                    <AuthField
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setError('');
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                    />

                    <motion.button
                        whileHover={isFormValid && !loading ? { y: -2, scale: 1.01 } : {}}
                        whileTap={isFormValid && !loading ? { scale: 0.99 } : {}}
                        type="submit"
                        disabled={!isFormValid || loading}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-sm apple-secondary-text">
                    {resendCooldown > 0 ? (
                        <p>
                            Gửi lại mã sau <ResendTimer seconds={resendCooldown} />
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="apple-auth-accent-link font-semibold disabled:opacity-50"
                        >
                            {resendLoading ? 'Đang gửi lại OTP...' : 'Gửi lại mã OTP'}
                        </button>
                    )}
                </div>
            </AuthCard>
        </AuthShell>
    );
}

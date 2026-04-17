import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/shared/api';
import {
    AuthCard,
    AuthOtpInputRow,
    AuthShell,
    AuthStatusBanner,
} from '@/features/auth/components';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const verifyFeatures = [
    {
        icon: MailCheck,
        title: 'Xác minh nhanh trong vài giây',
        description: 'Chỉ cần nhập mã OTP 6 số để kích hoạt tài khoản và mở toàn bộ trải nghiệm học tập.',
    },
    {
        icon: ShieldCheck,
        title: 'Bảo vệ email đăng ký',
        description: 'Bước xác minh giúp bảo đảm tài khoản và các dữ liệu học tập của bạn luôn thuộc quyền kiểm soát.',
    },
    {
        icon: RefreshCw,
        title: 'Gửi lại mã khi cần',
        description: 'Nếu chưa nhận được OTP, bạn có thể yêu cầu gửi lại sau khoảng chờ ngắn.',
    },
];

const verifySummary = [
    { label: 'Mã xác minh', value: 'OTP 6 số' },
    { label: 'Trạng thái sau khi xong', value: 'Kích hoạt tài khoản' },
    { label: 'Điểm đến tiếp theo', value: 'Trang đăng nhập' },
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

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/signup', { replace: true });
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
    const isComplete = otpValue.length === OTP_LENGTH;

    const handleSubmit = useCallback(async () => {
        if (!isComplete || loading || success) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.verifyEmail({ email, otp: otpValue });
            setSuccess(data.message || 'Xác minh email thành công. Đang chuyển sang đăng nhập...');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1600);
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } finally {
            setLoading(false);
        }
    }, [email, focusInput, isComplete, loading, navigate, otpValue, success]);

    useEffect(() => {
        if (isComplete && !loading && !success) {
            handleSubmit();
        }
    }, [handleSubmit, isComplete, loading, success]);

    const handleResend = async () => {
        if (resendCooldown > 0 || resendLoading) {
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.resendOtp({ email });
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
            badge="Kích hoạt tài khoản để bắt đầu học"
            title="Xác minh email"
            highlight="và mở toàn bộ trải nghiệm"
            description="Chúng tôi đã gửi mã OTP đến email đăng ký của bạn. Chỉ cần xác minh là bạn có thể đăng nhập và bắt đầu sử dụng SKR."
            features={verifyFeatures}
            summaryTitle="Kích hoạt tài khoản"
            summaryItems={verifySummary}
        >
            <AuthCard
                eyebrow="Bước 1"
                title="Nhập mã xác minh"
                subtitle={`Mã OTP đã được gửi đến ${maskEmail(email)}. Hệ thống sẽ tự xác minh ngay khi bạn nhập đủ 6 số.`}
                footer={
                    <Link to="/signup" className="apple-auth-muted-link apple-transition inline-flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại đăng ký
                    </Link>
                }
            >
                <div className="space-y-5">
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

                    <motion.button
                        whileHover={isComplete && !loading ? { y: -2, scale: 1.01 } : {}}
                        whileTap={isComplete && !loading ? { scale: 0.99 } : {}}
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isComplete || loading}
                        className="apple-primary-button apple-transition inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Đang xác minh...' : 'Xác minh email'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>
                </div>

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

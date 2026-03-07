import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    Lock,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    GraduationCap,
    Eye,
    EyeOff,
} from 'lucide-react';
import { authApi } from '@/shared/api';

/* ================== Constants ================== */

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // giay

/* ================== Sub-components ================== */

/**
 * Single OTP digit input box.
 */
const OtpDigitInput = ({ index, value, onChange, onKeyDown, onPaste, inputRef, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index }}
            className="relative"
        >
            {/* Gradient glow khi focus */}
            <motion.div
                animate={isFocused ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-40"
            />

            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(index, e)}
                onPaste={onPaste}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label={`Digit ${index + 1}`}
                className={`
                    relative w-14 h-16 sm:w-16 sm:h-[4.5rem] text-center text-2xl font-black
                    rounded-2xl border-2 outline-none transition-all duration-300
                    bg-base-100 caret-transparent select-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isFocused
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                        : hasValue
                            ? 'border-blue-400/60 shadow-md shadow-blue-400/10'
                            : 'border-base-300 hover:border-base-content/20'
                    }
                    ${hasValue ? 'text-blue-600' : 'text-base-content'}
                `}
            />

            {/* Bottom dot indicator */}
            <motion.div
                animate={hasValue ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
            />
        </motion.div>
    );
};

/**
 * Countdown timer for OTP resend cooldown.
 */
const ResendTimer = ({ seconds }) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    return (
        <span className="font-mono font-bold text-blue-600 tabular-nums">
            {mins}:{secs}
        </span>
    );
};

/* ================== Main Component ================== */

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    // OTP state
    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const inputRefs = useRef([]);

    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [resendLoading, setResendLoading] = useState(false);

    /* ---------- Redirect if no email ---------- */
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password', { replace: true });
        }
    }, [email, navigate]);

    /* ---------- Resend cooldown timer ---------- */
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    /* ---------- OTP input handlers ---------- */

    const focusInput = useCallback((index) => {
        inputRefs.current[index]?.focus();
    }, []);

    const handleChange = useCallback((index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        setError('');

        if (digit && index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    }, [focusInput]);

    const handleKeyDown = useCallback((index, e) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                setDigits((prev) => {
                    const next = [...prev];
                    next[index - 1] = '';
                    return next;
                });
                focusInput(index - 1);
            } else {
                setDigits((prev) => {
                    const next = [...prev];
                    next[index] = '';
                    return next;
                });
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            focusInput(index - 1);
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    }, [digits, focusInput]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;

        const newDigits = Array(OTP_LENGTH).fill('');
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setDigits(newDigits);
        setError('');

        const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
        focusInput(focusIdx);
    }, [focusInput]);

    /* ---------- Submit OTP + Password ---------- */
    const otpString = digits.join('');
    const isOtpComplete = otpString.length === OTP_LENGTH;
    const isFormValid = isOtpComplete && newPassword.length >= 6 && newPassword === confirmPassword;

    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!isOtpComplete) {
            setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
            return;
        }

        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.resetPassword({
                email,
                otp: otpString,
                newPassword,
            });
            setSuccess(data.message || 'Đặt lại mật khẩu thành công!');

            // Chuyen ve login sau 2 giay
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!';
            setError(msg);
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Resend OTP ---------- */
    const handleResend = async () => {
        if (resendCooldown > 0 || resendLoading) return;

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.resendForgotOtp({ email });
            setSuccess(data.message || 'Đã gửi lại mã OTP!');
            setResendCooldown(RESEND_COOLDOWN);
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại!';
            setError(msg);
        } finally {
            setResendLoading(false);
        }
    };

    /* ---------- Masked email ---------- */
    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '•'.repeat(Math.min(b.length, 6)) + c)
        : '';

    /* ---------- Animation variants ---------- */
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
    };

    /* ---------- Render ---------- */
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-base-100 font-sans selection:bg-blue-500/30 overflow-hidden relative px-4">

            {/* ---- Animated Background Orbs ---- */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -30, 0],
                    y: [0, 20, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"
            />

            {/* ---- Main Card ---- */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-lg bg-base-100/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 sm:p-12 border border-base-200 relative overflow-hidden z-10"
            >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

                {/* Back link */}
                <motion.div variants={itemVariants}>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 text-sm font-bold text-base-content/50 hover:text-blue-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Quay lại
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                        className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20"
                    >
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Lock className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                        </motion.div>
                    </motion.div>

                    <h1 className="text-3xl font-black text-base-content mb-3 tracking-tight">
                        Đặt lại mật khẩu
                    </h1>
                    <p className="text-base-content/60 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                        Nhập mã OTP được gửi đến{' '}
                        <span className="text-blue-600 font-bold">{maskedEmail}</span>
                    </p>
                </motion.div>

                {/* Status messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium mb-6"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium mb-6"
                    >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        {success}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* OTP Input */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <label className="block text-xs font-bold text-base-content/60 uppercase tracking-wider mb-3 text-center">
                            Mã xác nhận OTP
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                            {digits.map((digit, i) => (
                                <OtpDigitInput
                                    key={i}
                                    index={i}
                                    value={digit}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    onPaste={handlePaste}
                                    inputRef={(el) => (inputRefs.current[i] = el)}
                                    disabled={loading || success}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Password Input */}
                    <motion.div variants={itemVariants} className="mb-4">
                        <label className="block text-xs font-bold text-base-content/60 uppercase tracking-wider mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                                disabled={loading || success}
                                placeholder="Nhập mật khẩu mới"
                                className="w-full h-12 pl-12 pr-12 bg-base-100 border-2 border-base-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>

                    {/* Confirm Password Input */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <label className="block text-xs font-bold text-base-content/60 uppercase tracking-wider mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                disabled={loading || success}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full h-12 pl-12 pr-12 bg-base-100 border-2 border-base-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-blue-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>

                    {/* Submit button */}
                    <motion.div variants={itemVariants}>
                        <motion.button
                            type="submit"
                            disabled={!isFormValid || loading || success}
                            whileHover={isFormValid && !loading && !success ? { scale: 1.02, y: -2 } : {}}
                            whileTap={isFormValid && !loading && !success ? { scale: 0.98 } : {}}
                            className={`
                                btn w-full rounded-xl shadow-xl border-none text-base h-12 font-bold
                                group transition-all duration-300
                                ${isFormValid && !success
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-blue-600/20'
                                    : success
                                        ? 'bg-green-500 text-white'
                                        : 'bg-base-300 text-base-content/40 cursor-not-allowed'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Thành công!
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Đặt lại mật khẩu
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </form>

                {/* Resend section */}
                <motion.div variants={itemVariants} className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-base-content/60 font-medium">
                        {resendCooldown > 0 ? (
                            <p>
                                Gửi lại mã sau <ResendTimer seconds={resendCooldown} />
                            </p>
                        ) : (
                            <p>Chưa nhận được mã?</p>
                        )}
                    </div>

                    {resendCooldown <= 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleResend}
                            disabled={resendLoading || success}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Gửi lại mã OTP
                        </motion.button>
                    )}
                </motion.div>

                {/* Footer */}
                <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-base-200">
                    <div className="flex items-center justify-center gap-3 text-base-content/40">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold tracking-tight">
                            SKR<span className="text-blue-600">.</span>
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

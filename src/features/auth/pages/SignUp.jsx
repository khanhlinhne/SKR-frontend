import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BrainCircuit, Layers3, Lock, Mail, Sparkles, User, UserRoundPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/shared/api';
import {
    AuthCard,
    AuthField,
    AuthGoogleButton,
    AuthShell,
    AuthStatusBanner,
} from '@/features/auth/components';
import { buildGoogleAuthUrl } from '@/features/auth/utils/googleAuthUrl';

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

// ── Helpers validate ──────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// Kiểm tra độ mạnh mật khẩu: trả về { score: 0-4, label, color }
function getPasswordStrength(password) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
        { label: 'Rất yếu', color: '#ef4444' },
        { label: 'Yếu', color: '#f97316' },
        { label: 'Trung bình', color: '#eab308' },
        { label: 'Mạnh', color: '#22c55e' },
        { label: 'Rất mạnh', color: '#16a34a' },
    ];
    return { score, ...levels[score] };
}

function validateSignupField(name, value, formData) {
    if (name === 'username') {
        if (!value.trim()) return 'Tên đăng nhập không được để trống.';
        if (value.trim().length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
        if (value.trim().length > 30) return 'Tên đăng nhập không được quá 30 ký tự.';
        if (!USERNAME_REGEX.test(value.trim())) return 'Tên đăng nhập chỉ được dùng chữ, số và dấu gạch dưới (_).';
    }
    if (name === 'email') {
        if (!value.trim()) return 'Email không được để trống.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Email không đúng định dạng (vd: name@example.com).';
    }
    if (name === 'password') {
        if (!value) return 'Mật khẩu không được để trống.';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
        if (value.length > 100) return 'Mật khẩu không được quá 100 ký tự.';
    }
    if (name === 'confirmPassword') {
        if (!value) return 'Vui lòng nhập lại mật khẩu để xác nhận.';
        if (value !== formData.password) return 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.';
    }
    return '';
}

// ── Component PasswordStrengthBar ─────────────────────────────────────────────
function PasswordStrengthBar({ password }) {
    const strength = getPasswordStrength(password);
    if (!password || !strength) return null;
    const segments = 4;

    return (
        <div style={{ marginTop: '6px', paddingLeft: '2px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {Array.from({ length: segments }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '3px',
                            flex: 1,
                            borderRadius: '99px',
                            background: i < strength.score ? strength.color : 'var(--apple-border, #e5e7eb)',
                            transition: 'background 0.25s',
                        }}
                    />
                ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600 }}>
                Độ mạnh: {strength.label}
                {strength.score < 2 && ' — hãy thêm chữ hoa, số hoặc ký tự đặc biệt'}
            </p>
        </div>
    );
}

export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setError('');
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));

        // Nếu đang sửa password thì re-validate confirmPassword live
        if (name === 'password' && formData.confirmPassword) {
            const confirmErr = value !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.' : '';
            setFieldErrors((prev) => ({ ...prev, password: '', confirmPassword: confirmErr }));
        }
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        setFieldErrors((prev) => ({
            ...prev,
            [name]: validateSignupField(name, value, formData),
        }));
    };

    const runAllValidations = () => {
        const errors = {
            username: validateSignupField('username', formData.username, formData),
            email: validateSignupField('email', formData.email, formData),
            password: validateSignupField('password', formData.password, formData),
            confirmPassword: validateSignupField('confirmPassword', formData.confirmPassword, formData),
        };
        setFieldErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        if (!runAllValidations()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await authApi.register({
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            setSuccess(data.message || 'Đăng ký thành công! Đang chuyển đến bước xác minh email...');
            setTimeout(() => {
                navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
            }, 1200);
        } catch (err) {
            const msg = (err.response?.data?.message || '').toLowerCase();
            if (msg.includes('email') && (msg.includes('exist') || msg.includes('tồn tại') || msg.includes('already'))) {
                setFieldErrors((prev) => ({ ...prev, email: 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.' }));
            } else if (msg.includes('username') && (msg.includes('exist') || msg.includes('tồn tại') || msg.includes('taken'))) {
                setFieldErrors((prev) => ({ ...prev, username: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.' }));
            } else {
                setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
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
                <form className="space-y-5" onSubmit={handleSignUp} noValidate>
                    <AuthStatusBanner variant="error" message={error} />
                    <AuthStatusBanner variant="success" message={success} />

                    <AuthField
                        label="Tên đăng nhập"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="username123"
                        autoComplete="username"
                        icon={UserRoundPlus}
                        disabled={loading}
                        required
                        error={fieldErrors.username}
                    />

                    <AuthField
                        label="Địa chỉ email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="name@example.com"
                        autoComplete="email"
                        icon={Mail}
                        disabled={loading}
                        required
                        error={fieldErrors.email}
                    />

                    <div>
                        <AuthField
                            label="Mật khẩu"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Tối thiểu 6 ký tự"
                            autoComplete="new-password"
                            icon={Lock}
                            isPassword
                            disabled={loading}
                            required
                            error={fieldErrors.password}
                        />
                        {!fieldErrors.password && <PasswordStrengthBar password={formData.password} />}
                    </div>

                    <AuthField
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        icon={Lock}
                        isPassword
                        disabled={loading}
                        required
                        error={fieldErrors.confirmPassword}
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
                            window.location.href = buildGoogleAuthUrl(import.meta.env.VITE_API_BASE_URL);
                        }}
                    >
                        Đăng ký với Google
                    </AuthGoogleButton>
                </form>
            </AuthCard>
        </AuthShell>
    );
}

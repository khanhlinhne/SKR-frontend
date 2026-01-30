import React, { useState, useRef } from 'react';
import * as motion from 'motion/react-client';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    UserPen,
    Lock,
    RotateCcw,
    Brain,
    Eye,
    EyeOff,
    Sparkles,
    HelpCircle,
    Database,
    Share2,
    ArrowRight,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';

/* ================== Small Components ================== */

const FeatureCard = ({ icon: Icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-base-100/50 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-base-200 flex flex-col gap-3 group transition-all hover:shadow-xl hover:border-blue-500/30"
    >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-base-content text-sm mb-1">{title}</h3>
            <p className="text-base-content/60 text-xs leading-relaxed font-medium">{description}</p>
        </div>
    </motion.div>
);

const InputField = React.forwardRef(({
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    isPassword = false,
    value,
    onChange,
    name,
    onBlur,
    onFocus,
    hasError = false,
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="form-control w-full"
        >
            <label className="label py-1">
                <span className="label-text font-bold text-base-content/70 text-xs uppercase tracking-widest">{label}</span>
            </label>

            <div className="relative group">
                <motion.div
                    animate={isFocused ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"
                />
                <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center transition-colors duration-300 pointer-events-none ${isFocused ? 'text-blue-600' : 'text-base-content/30'}`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    <input
                        ref={ref}
                        name={name}
                        value={value}
                        onChange={onChange}
                        type={inputType}
                        placeholder={placeholder}
                        onFocus={() => { setIsFocused(true); onFocus && onFocus(); }}
                        onBlur={() => { setIsFocused(false); onBlur && onBlur(); }}
                        className={`input w-full pl-12 bg-base-100 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-base-300 focus:border-blue-500'} focus:outline-none transition-all rounded-xl font-medium h-12 text-sm`}
                        aria-invalid={hasError}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-blue-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

InputField.displayName = 'InputField';

/* ================== Main Component ================== */

export default function SignUp() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const navigate = useNavigate();
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmRef = useRef(null);
    const termsRef = useRef(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Inline validation state
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [termsError, setTermsError] = useState('');

    const [touchedName, setTouchedName] = useState(false);
    const [touchedEmail, setTouchedEmail] = useState(false);
    const [touchedPassword, setTouchedPassword] = useState(false);
    const [touchedConfirm, setTouchedConfirm] = useState(false);
    const [touchedTerms, setTouchedTerms] = useState(false);

    // Validation helpers
    const validateName = (v) => (!v.trim() ? 'Họ và tên là bắt buộc' : '');
    const validateEmail = (v) => {
        if (!v) return 'Email là bắt buộc';
        if (!v.toLowerCase().endsWith('@gmail.com')) return 'Email phải có đuôi @gmail.com';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email không hợp lệ';
        return '';
    };
    const validatePassword = (v) => {
        if (!v) return 'Mật khẩu là bắt buộc';
        if (v.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
    };
    const validateConfirm = (v) => (v !== password ? 'Mật khẩu xác nhận không khớp' : '');
    const validateTerms = (checked) => (!checked ? 'Bạn phải đồng ý với Điều khoản và Chính sách bảo mật' : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validations (set touched states & inline errors)
        setTouchedName(true);
        setTouchedEmail(true);
        setTouchedPassword(true);
        setTouchedConfirm(true);
        setTouchedTerms(true);

        const nErr = validateName(fullName);
        const emErr = validateEmail(email);
        const pwErr = validatePassword(password);
        const cpwErr = validateConfirm(confirmPassword);
        const tErr = validateTerms(acceptedTerms);

        setNameError(nErr);
        setEmailError(emErr);
        setPasswordError(pwErr);
        setConfirmPasswordError(cpwErr);
        setTermsError(tErr);

        if (nErr || emErr || pwErr || cpwErr || tErr) {
            setError('Vui lòng sửa các trường có lỗi');
            // focus first invalid field
            setTimeout(() => {
                if (nErr) nameRef.current?.focus();
                else if (emErr) emailRef.current?.focus();
                else if (pwErr) passwordRef.current?.focus();
                else if (cpwErr) confirmRef.current?.focus();
                else if (tErr) termsRef.current?.focus();
            }, 0);
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch('http://localhost:4000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, email, password, acceptedTerms }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Đăng ký thất bại');

            // Hiển thị thông báo thành công và điều hướng đến trang đăng nhập
            setSuccess('Đăng ký thành công!');

            // Đặt timeout để hiển thị thông báo trước khi điều hướng
            setTimeout(() => {
                // truyền state để trang Login có thể hiển thị thông báo nếu muốn
                navigate('/login', { state: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' } });
            }, 1200);
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-base-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">

            {/* Animated Background Orbs */}
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

            {/* LEFT SIDE - Brand Content */}
            <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative z-10 border-r border-base-200">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-12 max-w-lg"
                >
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
                        >
                            <GraduationCap className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-3xl font-black text-base-content tracking-tighter">
                            SKR<span className="text-blue-600">.</span>
                        </span>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-black leading-tight tracking-tight text-base-content">
                            Tham gia cộng đồng <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 italic">
                                Học tập Thông minh
                            </span>
                        </h1>
                        <p className="text-base-content/60 text-lg font-medium leading-relaxed">
                            Kiến tạo tương lai với hệ thống ôn thi cá nhân hóa bằng sức mạnh của trí tuệ nhân tạo.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Sparkles, title: "AI Thông minh", desc: "Tự động tạo câu hỏi từ tài liệu." },
                            { icon: HelpCircle, title: "Luyện tập đa dạng", desc: "Nhiều hình thức câu hỏi phong phú." },
                            { icon: Database, title: "Kho lưu trữ", desc: "Quản lý ngân hàng câu hỏi tập trung." },
                            { icon: Share2, title: "Cộng đồng", desc: "Học tập & chia sẻ tri thức." }
                        ].map((feat, i) => (
                            <FeatureCard key={i} index={i} icon={feat.icon} title={feat.title} description={feat.desc} />
                        ))}
                    </div>

                    {/* Footer for Left Side */}
                    <div className="flex items-center gap-4 pt-4 border-t border-base-200">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-base-100 overflow-hidden bg-base-200">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-base-content">10,000+</span>
                            <span className="text-base-content/50 ml-1 font-medium">người học đang tham gia</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* RIGHT SIDE - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 overflow-y-auto no-scrollbar py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md bg-base-100/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-base-200 relative overflow-hidden"
                >
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

                    <div className="text-center mb-10">
                        <motion.h2 variants={itemVariants} className="text-3xl font-black text-base-content mb-3 tracking-tight">
                            Tạo tài khoản mới
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-base-content/60 font-medium">
                            Bắt đầu trải nghiệm học tập AI ngay hôm nay
                        </motion.p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants}>
                            {success && <div className="alert alert-success mb-4">{success}</div>}
                            {error && <div className="alert alert-error mb-4">{error}</div>}

                            <InputField
                                ref={nameRef}
                                label="Họ và tên"
                                placeholder="Nguyễn Văn A"
                                icon={UserPen}
                                name="fullname"
                                value={fullName}
                                hasError={!!nameError}
                                onChange={(e) => { setFullName(e.target.value); if (touchedName) setNameError(validateName(e.target.value)); }}
                                onBlur={() => { setTouchedName(true); setNameError(validateName(fullName)); }}
                            />
                            {touchedName && nameError && <p className="text-xs text-error mt-1">{nameError}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <InputField
                                ref={emailRef}
                                label="Địa chỉ Email"
                                type="email"
                                placeholder="name@example.com"
                                icon={Mail}
                                name="email"
                                value={email}
                                hasError={!!emailError}
                                onChange={(e) => { setEmail(e.target.value); if (touchedEmail) setEmailError(validateEmail(e.target.value)); }}
                                onBlur={() => { setTouchedEmail(true); setEmailError(validateEmail(email)); }}
                            />
                            {touchedEmail && emailError && <p className="text-xs text-error mt-1">{emailError}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <InputField
                                ref={passwordRef}
                                label="Mật khẩu"
                                placeholder="••••••••"
                                icon={Lock}
                                isPassword
                                name="password"
                                value={password}
                                hasError={!!passwordError}
                                onChange={(e) => { setPassword(e.target.value); if (touchedPassword) setPasswordError(validatePassword(e.target.value)); }}
                                onBlur={() => { setTouchedPassword(true); setPasswordError(validatePassword(password)); }}
                            />
                            {touchedPassword && passwordError && <p className="text-xs text-error mt-1">{passwordError}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <InputField
                                ref={confirmRef}
                                label="Xác nhận mật khẩu"
                                placeholder="••••••••"
                                icon={RotateCcw}
                                isPassword
                                name="confirmPassword"
                                value={confirmPassword}
                                hasError={!!confirmPasswordError}
                                onChange={(e) => { setConfirmPassword(e.target.value); if (touchedConfirm) setConfirmPasswordError(validateConfirm(e.target.value)); }}
                                onBlur={() => { setTouchedConfirm(true); setConfirmPasswordError(validateConfirm(confirmPassword)); }}
                            />
                            {touchedConfirm && confirmPasswordError && <p className="text-xs text-error mt-1">{confirmPasswordError}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="flex items-center gap-3 group cursor-pointer">
                                <input ref={termsRef} type="checkbox" checked={acceptedTerms} onChange={(e) => { const checked = e.target.checked; setAcceptedTerms(checked); setTouchedTerms(true); setTermsError(validateTerms(checked)); }} className="checkbox checkbox-sm checkbox-primary rounded-lg transition-all" />
                                <span className="text-xs text-base-content/60 font-medium group-hover:text-base-content transition-colors">
                                    Tôi đồng ý với <a href="#" className="text-blue-600 font-bold hover:underline">Điều khoản</a> và <a href="#" className="text-blue-600 font-bold hover:underline">Chính sách bảo mật</a>
                                </span>
                            </label>
                            {touchedTerms && termsError && <p className="text-xs text-error mt-1">{termsError}</p>}
                        </motion.div>

                        <motion.button
                            type="submit"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl shadow-xl shadow-blue-600/20 border-none text-base h-12 font-bold group transition-all duration-300 mt-2"
                            disabled={loading || !acceptedTerms || password.length < 6 || !email.toLowerCase().endsWith('@gmail.com') || password !== confirmPassword}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký miễn phí'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.div variants={itemVariants} className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-base-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-base-100 px-4 text-base-content/40 font-bold tracking-widest">Hoặc đăng ký với</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn w-full btn-ghost border-base-300 hover:bg-base-200 text-base-content rounded-xl font-bold flex items-center justify-center gap-3 transition-all h-12"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm">Tiếp tục với Google</span>
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.p variants={itemVariants} className="text-center mt-10 text-sm text-base-content/60 font-medium">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

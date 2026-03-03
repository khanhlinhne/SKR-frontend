import React, { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import { Mail, Lock, Brain, Eye, EyeOff, Sparkles, HelpCircle, Database, Share2, ArrowRight, CheckCircle2, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';

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

const InputField = ({ label, type, placeholder, icon: Icon, isPassword = false, value, onChange, name }) => {
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
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-blue-600' : 'text-base-content/30'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <input
                        type={inputType}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="input w-full pl-12 bg-base-100 border-base-300 focus:border-blue-500 focus:outline-none transition-all rounded-xl font-medium h-12 text-sm"
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-blue-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Xu ly loi tu Google OAuth (neu co)
    useEffect(() => {
        const googleError = searchParams.get('error');
        if (googleError) {
            setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Xoa loi khi user go lai
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            console.log('Login response:', data);

            // Backend tra ve: { success, message, data: { user, tokens: { accessToken, refreshToken } } }
            // axiosClient interceptor tra ve response.data => data = { success, message, data: {...} }
            const token = data.data?.tokens?.accessToken;

            if (!token) {
                console.error('No token found in response! Response:', JSON.stringify(data));
                setError('Đăng nhập thất bại: Không nhận được token từ server.');
                return;
            }

            // Luu token vao localStorage
            localStorage.setItem('accessToken', token);
            console.log('Token saved:', token.substring(0, 20) + '...');

            // Chuyen den dashboard
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Left Column - Brand Content */}
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
                            Bắt đầu hành trình <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 italic">
                                Chinh phục kiến thức
                            </span>
                        </h1>
                        <p className="text-base-content/60 text-lg font-medium leading-relaxed">
                            Hệ thống học tập thông minh tích hợp AI giúp bạn tối ưu hóa thời gian và bứt phá điểm số.
                        </p>
                    </div>

                    {/* Feature Grid */}
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

                    {/* Trust indicator */}
                    <div className="flex items-center gap-4 pt-4 border-t border-base-200">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-base-100 overflow-hidden bg-base-200">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
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

            {/* Right Column - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
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
                            Chào mừng trở lại!
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-base-content/60 font-medium">
                            Đăng nhập để tiếp tục hành trình của bạn
                        </motion.p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <InputField
                                label="Địa chỉ Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                icon={Mail}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <InputField
                                label="Mật khẩu"
                                isPassword={true}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center justify-between">
                            <label className="cursor-pointer flex items-center gap-2 group">
                                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded-lg transition-all" />
                                <span className="text-sm text-base-content/60 font-medium group-hover:text-base-content transition-colors">
                                    Ghi nhớ tôi
                                </span>
                            </label>
                            <Link to="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl shadow-xl shadow-blue-600/20 border-none text-base h-12 font-bold group transition-all duration-300 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng nhập ngay
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        <motion.div variants={itemVariants} className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-base-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-base-100 px-4 text-base-content/40 font-bold tracking-widest">Hoặc đăng nhập với</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
                                }}
                                className="btn w-full btn-ghost border-base-300 hover:bg-base-200 text-base-content rounded-xl font-bold flex items-center justify-center gap-3 transition-all h-12"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm">Tiếp tục với Google</span>
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.p variants={itemVariants} className="text-center mt-10 text-sm text-base-content/60 font-medium">
                        Chưa có tài khoản?{' '}
                        <Link to="/signup" className="text-blue-600 font-black hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
                            Đăng ký miễn phí
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

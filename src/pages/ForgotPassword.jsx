import { useState } from 'react';
import * as motion from 'motion/react-client';
import {
    Mail, ArrowRight, GraduationCap, ChevronLeft, Sparkles,
    KeyRound, ShieldCheck, Lock, CheckCircle2, RefreshCw,
    AlertCircle, Clock, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsEmailSent(true);
    };

    const securityFeatures = [
        { icon: Lock, text: "Mã hóa 256-bit" },
        { icon: ShieldCheck, text: "Xác thực 2 lớp" },
        { icon: Clock, text: "Link hết hạn sau 24h" }
    ];

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-base-100 via-base-100 to-blue-50/30 font-sans selection:bg-blue-500/30 overflow-hidden relative">

            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Gradient orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 40, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/15 to-cyan-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-violet-500/15 to-purple-500/10 rounded-full blur-[120px]"
                />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

                {/* Floating particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-30"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </div>

            <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/25"
                        >
                            <GraduationCap className="w-8 h-8 text-white" strokeWidth={2} />
                        </motion.div>
                        <div>
                            <span className="text-3xl font-black text-base-content tracking-tight">
                                SKR<span className="text-blue-600">.</span>
                            </span>
                            <p className="text-xs text-base-content/40 font-medium">Smart Knowledge Revise</p>
                        </div>
                    </Link>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <div className="relative bg-base-100/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-500/5 border border-base-200 overflow-hidden">
                        {/* Top gradient accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

                        {/* Decorative corner glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                        <div className="p-8 lg:p-10">
                            {!isEmailSent ? (
                                <>
                                    {/* Header */}
                                    <motion.div variants={itemVariants} className="text-center mb-8">
                                        <motion.div
                                            className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20"
                                            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <KeyRound className="w-10 h-10 text-blue-600" />
                                        </motion.div>

                                        <h1 className="text-2xl lg:text-3xl font-black text-base-content mb-3 tracking-tight">
                                            Quên mật khẩu?
                                        </h1>
                                        <p className="text-base-content/60 font-medium leading-relaxed">
                                            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                                        </p>
                                    </motion.div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <motion.div variants={itemVariants}>
                                            <label className="block text-xs font-bold text-base-content/60 uppercase tracking-wider mb-2">
                                                Địa chỉ Email
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-blue-600 transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@example.com"
                                                    className="w-full h-14 pl-12 pr-4 bg-base-100 border-2 border-base-200 rounded-xl text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Error message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="relative w-full h-14 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl shadow-xl shadow-blue-600/25 font-bold text-base flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70"
                                        >
                                            {/* Shimmer effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                            />

                                            {isLoading ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <span className="relative">Gửi yêu cầu đặt lại</span>
                                                    <ArrowRight className="w-5 h-5 relative" />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>

                                    {/* Security badges */}
                                    <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-4">
                                        {securityFeatures.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-1.5 text-xs text-base-content/40 font-medium">
                                                <feature.icon className="w-3.5 h-3.5" />
                                                {feature.text}
                                            </div>
                                        ))}
                                    </motion.div>
                                </>
                            ) : (
                                /* Success State */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                        className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4, type: "spring" }}
                                        >
                                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                        </motion.div>
                                    </motion.div>

                                    <h2 className="text-2xl lg:text-3xl font-black text-base-content mb-3 tracking-tight">
                                        Kiểm tra Email!
                                    </h2>

                                    <p className="text-base-content/60 font-medium leading-relaxed mb-2">
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                                    </p>

                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-sm mb-6">
                                        <Mail className="w-4 h-4" />
                                        {email}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-base-content/50">
                                            Vui lòng kiểm tra cả thư mục spam nếu không thấy email.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setIsEmailSent(false)}
                                                className="px-6 py-3 bg-base-200 text-base-content rounded-xl font-bold text-sm hover:bg-base-300 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Gửi lại email
                                            </motion.button>

                                            <Link to="/login">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 w-full"
                                                >
                                                    Quay lại đăng nhập
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Back to Login */}
                            {!isEmailSent && (
                                <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-base-200 text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-base-content/50 hover:text-blue-600 transition-colors group"
                                    >
                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Quay lại trang Đăng nhập
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Help Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-sm text-base-content/40 hover:text-blue-600 font-medium transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Cần trợ giúp? Liên hệ hỗ trợ
                        </a>
                    </motion.div>
                </motion.div>

                {/* Bottom badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-base-200/50 backdrop-blur-sm rounded-full border border-base-300/50">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-4 h-4 text-blue-500" />
                        </motion.div>
                        <span className="text-xs font-bold text-base-content/40 uppercase tracking-wider">
                            Bảo mật bởi SKR AI
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

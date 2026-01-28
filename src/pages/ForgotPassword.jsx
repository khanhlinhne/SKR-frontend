import React, { useState } from 'react';
import * as motion from 'motion/react-client';
import { Mail, ArrowRight, GraduationCap, ChevronLeft, Sparkles, KeyRound, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setIsEmailSent(true);
    };

    return (
        <div className="min-h-screen w-full flex bg-base-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">

            {/* Animated Background Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.3, 1, 1.3],
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"
            />

            <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">

                {/* Logo Area */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20"
                        >
                            <GraduationCap className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-3xl font-black text-base-content tracking-tighter">
                            SKR<span className="text-blue-600">.</span>
                        </span>
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-lg bg-base-100/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 lg:p-12 border border-base-200 relative overflow-hidden"
                >
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

                    {!isEmailSent ? (
                        <>
                            <div className="text-center mb-10">
                                <motion.div
                                    variants={itemVariants}
                                    className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner"
                                >
                                    <KeyRound className="w-10 h-10" />
                                </motion.div>
                                <motion.h2 variants={itemVariants} className="text-3xl font-black text-base-content mb-3 tracking-tight">
                                    Quên mật khẩu?
                                </motion.h2>
                                <motion.p variants={itemVariants} className="text-base-content/60 font-medium leading-relaxed max-w-sm mx-auto">
                                    Đừng lo lắng! Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
                                </motion.p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={itemVariants} className="form-control w-full">
                                    <label className="label py-1">
                                        <span className="label-text font-bold text-base-content/70 text-xs uppercase tracking-widest">Địa chỉ Email</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/30 group-focus-within:text-blue-600 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="input w-full pl-12 bg-base-100 border-base-300 focus:border-blue-500 focus:outline-none transition-all rounded-xl font-medium h-14 text-sm shadow-sm"
                                        />
                                    </div>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="btn w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl shadow-xl shadow-blue-600/20 border-none h-14 font-bold text-base group transition-all duration-300"
                                >
                                    Gửi yêu cầu đặt lại
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-base-content mb-3 tracking-tight">
                                Kiểm tra Email!
                            </h2>
                            <p className="text-base-content/60 font-medium leading-relaxed mb-8">
                                Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến: <br />
                                <span className="text-blue-600 font-bold">{email}</span>
                            </p>
                            <button
                                onClick={() => setIsEmailSent(false)}
                                className="text-sm font-bold text-base-content/40 hover:text-blue-600 transition-colors"
                            >
                                Không nhận được email? Thử lại
                            </button>
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-base-200 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-base-content/60 hover:text-blue-600 transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại trang Đăng nhập
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Decorative floating elements */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-12 flex items-center gap-6"
                >
                    <div className="flex items-center gap-2 text-xs font-bold text-base-content/30 uppercase tracking-widest">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Bảo mật bởi SKR AI
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

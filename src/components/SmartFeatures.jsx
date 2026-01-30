import React from 'react';
import * as motion from 'motion/react-client';
import { CheckCircle2, Brain, Sparkles, Zap, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmartFeatures() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const floatingVariants = {
        animate: {
            y: [0, -15, 0],
            rotate: [3, 1, 3],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className="py-24 md:py-32 bg-base-100 relative overflow-hidden font-sans">
            {/* Soft decorative gradients */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-10"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            Đột phá công nghệ AI
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <h2 className="text-5xl lg:text-6xl font-black text-base-content leading-[1.1] tracking-tight">
                                Trải nghiệm ngay <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 italic">
                                    tính năng học thông minh
                                </span>
                            </h2>
                            <p className="text-base-content/70 text-xl leading-relaxed font-medium max-w-xl">
                                Hệ thống AI tiên tiến tự động phân tích hành vi học tập, điều chỉnh độ khó và tối ưu hóa tần suất lặp lại để bạn ghi nhớ kiến thức vĩnh viễn.
                            </p>
                        </motion.div>

                        <div className="grid gap-5">
                            {[
                                { text: "Tự động hóa Flashcard thông minh", icon: Zap },
                                { text: "Phân tích điểm yếu & Gợi ý cải thiện", icon: Brain },
                                { text: "Theo dõi tiến độ học tập 24/7", icon: Star }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-base-200/50 border border-base-300 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-base-content/80">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-lg h-16 px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-2xl shadow-xl shadow-blue-600/30 font-black text-lg group"
                                >
                                    Học thử miễn phí ngay
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Mockup UI */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        <motion.div
                            variants={floatingVariants}
                            animate="animate"
                            className="bg-base-200/50 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-base-300 relative z-20 overflow-hidden"
                        >
                            {/* Decorative elements inside card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10"></div>

                            {/* Header Mock */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Question #12</div>
                                        <div className="text-sm font-bold text-base-content">Biology Specialist</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-bold text-slate-400">Live AI Analysis</span>
                                </div>
                            </div>

                            {/* Question Section */}
                            <div className="mb-10">
                                <h3 className="text-2xl font-black text-base-content leading-tight mb-4">
                                    Chức năng chính của ti thể (Mitochondria) trong tế bào là gì?
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">Sinh học</span>
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">Mức độ: Khó</span>
                                </div>
                            </div>

                            {/* Options with staggered entrance */}
                            <div className="space-y-4">
                                {[
                                    { label: "A", text: "Tổng hợp Protein", status: "idle" },
                                    { label: "B", text: "Sản xuất năng lượng (ATP)", status: "correct" },
                                    { label: "C", text: "Lưu trữ thông tin di truyền", status: "idle" }
                                ].map((option, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + (i * 0.1) }}
                                        className={`p-5 rounded-2xl border transition-all duration-300 flex justify-between items-center group cursor-pointer ${option.status === 'correct'
                                            ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10'
                                            : 'bg-base-200/30 border-base-300 hover:border-blue-200 hover:bg-base-200/70 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-colors ${option.status === 'correct' ? 'bg-emerald-500 text-white' : 'bg-base-100 text-base-content/40 group-hover:text-blue-600 shadow-sm'
                                                }`}>
                                                {option.label}
                                            </span>
                                            <span className={`font-bold transition-colors ${option.status === 'correct' ? 'text-emerald-700' : 'text-base-content/70 group-hover:text-base-content'
                                                }`}>
                                                {option.text}
                                            </span>
                                        </div>
                                        {option.status === 'correct' ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.5 }}
                                            >
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                            </motion.div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-colors"></div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Background Decor */}
                        <motion.div
                            animate={{ rotate: [-6, -8, -6], scale: [1, 1.02, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-[3rem] transform -rotate-6 translate-x-4 translate-y-4 blur-sm"
                        ></motion.div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 p-5 bg-base-100 rounded-2xl shadow-xl border border-base-300 z-30 hidden lg:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-base-content">AI Tutor Active</div>
                                    <div className="text-[10px] text-slate-400 font-bold">Optimal learning path</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

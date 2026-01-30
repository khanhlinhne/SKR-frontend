import { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import { CheckCircle2, Brain, Sparkles, Zap, ArrowRight, Star, TrendingUp, Clock, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmartFeatures() {
    const [activeOption, setActiveOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [progress, setProgress] = useState(0);

    // Simulate progress animation
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) {
                    clearInterval(timer);
                    return 85;
                }
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(timer);
    }, []);

    // Auto-select correct answer after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveOption(1);
            setTimeout(() => setShowResult(true), 500);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -40 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const features = [
        {
            text: "Tự động hóa Flashcard thông minh",
            icon: Zap,
            gradient: "from-amber-500 to-orange-500",
            description: "AI tạo flashcard từ tài liệu"
        },
        {
            text: "Phân tích điểm yếu & Gợi ý cải thiện",
            icon: Brain,
            gradient: "from-blue-500 to-cyan-500",
            description: "Nhận diện gap kiến thức"
        },
        {
            text: "Theo dõi tiến độ học tập 24/7",
            icon: TrendingUp,
            gradient: "from-emerald-500 to-teal-500",
            description: "Dashboard realtime"
        },
        {
            text: "Lộ trình học tập cá nhân hóa",
            icon: Target,
            gradient: "from-violet-500 to-purple-500",
            description: "Adaptive learning path"
        }
    ];

    const questionOptions = [
        { label: "A", text: "Tổng hợp Protein", status: "idle" },
        { label: "B", text: "Sản xuất năng lượng (ATP)", status: "correct" },
        { label: "C", text: "Lưu trữ thông tin di truyền", status: "idle" },
        { label: "D", text: "Phân giải chất béo", status: "idle" }
    ];

    return (
        <section className="py-28 md:py-36 bg-base-100 relative overflow-hidden">
            {/* Enhanced Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue-500/8 to-cyan-500/8 rounded-full blur-[120px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/8 to-purple-500/8 rounded-full blur-[120px]"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                />

                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

                {/* Floating particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-20"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.4, 0.2],
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

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20"
                        >
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-4 h-4 text-blue-500" />
                            </motion.div>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-wider">
                                Công nghệ AI tiên tiến
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content leading-[1.1] tracking-tight">
                                Học thông minh với{' '}
                                <span className="relative inline-block">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                                        trí tuệ nhân tạo
                                    </span>
                                    {/* Animated underline */}
                                    <motion.div
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 rounded-full blur-sm"
                                        initial={{ scaleX: 0, originX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    />
                                </span>
                            </h2>
                            <p className="text-base-content/60 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
                                Hệ thống AI tiên tiến tự động phân tích hành vi học tập, điều chỉnh độ khó và tối ưu hóa tần suất lặp lại để bạn ghi nhớ kiến thức lâu dài.
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div variants={itemVariants} className="grid gap-4">
                            {features.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    whileHover={{ x: 8, transition: { duration: 0.2 } }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-base-200/50 border border-base-300/80 hover:border-blue-300/50 hover:bg-base-200/80 transition-all duration-300 group cursor-pointer"
                                >
                                    <motion.div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <item.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <span className="font-bold text-base-content block">{item.text}</span>
                                        <span className="text-sm text-base-content/50">{item.description}</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-base-content/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div variants={itemVariants} className="pt-4 flex flex-wrap gap-4">
                            <Link to="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative h-14 px-8 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-blue-600/25 font-bold text-lg group overflow-hidden"
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                    <span className="relative flex items-center gap-2">
                                        Bắt đầu học miễn phí
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </motion.button>
                            </Link>
                            <Link to="/features">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="h-14 px-8 bg-base-200 text-base-content rounded-2xl font-bold text-lg hover:bg-base-300 transition-colors"
                                >
                                    Tìm hiểu thêm
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right - Interactive Demo Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                        style={{ perspective: "1000px" }}
                    >
                        {/* Main Card */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotateX: [0, 1, 0],
                                rotateY: [0, 1, 0],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-base-100 rounded-[2rem] p-6 lg:p-8 shadow-2xl border border-base-200 overflow-hidden z-20"
                        >
                            {/* Card glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-200">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Brain className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <div className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Câu hỏi #12</div>
                                        <div className="font-bold text-base-content">Sinh học - Tế bào</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-emerald-500"
                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    <span className="text-xs font-bold text-emerald-600">AI Active</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-base-content/50">Tiến độ bài học</span>
                                    <span className="text-xs font-bold text-blue-600">{progress}%</span>
                                </div>
                                <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-base-content leading-tight mb-3">
                                    Chức năng chính của ti thể (Mitochondria) trong tế bào là gì?
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-bold">Sinh học</span>
                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        Mức độ: Khó
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        30 giây
                                    </span>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {questionOptions.map((option, i) => {
                                    const isActive = activeOption === i;
                                    const isCorrect = option.status === 'correct' && showResult && isActive;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            whileHover={{ scale: 1.01 }}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex justify-between items-center cursor-pointer ${isCorrect
                                                ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-500/10'
                                                : isActive
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-base-100 border-base-200 hover:border-blue-200 hover:bg-base-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-all ${isCorrect
                                                    ? 'bg-emerald-500 text-white'
                                                    : isActive
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-base-200 text-base-content/50'
                                                    }`}>
                                                    {option.label}
                                                </span>
                                                <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-base-content/70'
                                                    }`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                            {isCorrect && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                >
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* AI Insight - shows after correct answer */}
                            {showResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                                            <Lightbulb className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-blue-600 mb-1">💡 AI Giải thích</div>
                                            <p className="text-sm text-base-content/70 leading-relaxed">
                                                Ti thể được gọi là "nhà máy năng lượng" của tế bào vì nó thực hiện hô hấp tế bào để tạo ra ATP - nguồn năng lượng chính cho các hoạt động sống.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Background decorative card */}
                        <motion.div
                            animate={{ rotate: [-4, -6, -4], scale: [1, 1.01, 1] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-[2rem] transform -rotate-3 translate-x-3 translate-y-3"
                        />

                        {/* Floating Badge - AI Tutor */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-4 lg:-right-8 z-30"
                        >
                            <div className="p-4 bg-base-100 rounded-2xl shadow-xl border border-base-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-base-content">AI Tutor</div>
                                        <div className="text-xs text-base-content/50 font-medium">Đang phân tích...</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Stats */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-4 -left-4 lg:-left-8 z-30"
                        >
                            <div className="p-4 bg-base-100 rounded-2xl shadow-xl border border-base-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-emerald-600">+15%</div>
                                        <div className="text-xs text-base-content/50 font-medium">Cải thiện tuần này</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

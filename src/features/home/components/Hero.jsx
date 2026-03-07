import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Brain, Rocket, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero({
    badge = 'AI-Powered Learning Revolution',
    titleMain = 'Smart Knowledge',
    titleHighlight = 'Revise System',
    subtitle = 'Hệ thống học tập thông minh tích hợp AI giúp cá nhân hóa lộ trình ôn thi,\ntự động tạo nội dung và phân tích điểm yếu để tối ưu kết quả học tập của bạn.',
    ctaPrimaryText = 'Bắt đầu miễn phí',
    ctaSecondaryText = 'Khám phá tính năng AI',
    heroImage = 'https://i.pinimg.com/736x/05/d7/84/05d784805e083785e14d8555d9428c1b.jpg'
} = {}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const scaleInVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-base-100 overflow-hidden">
            {/* Animated background gradients */}
            <motion.div
                className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/25 to-purple-500/25 rounded-full blur-[130px]"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/25 to-pink-500/25 rounded-full blur-[130px]"
                animate={{
                    scale: [1.15, 1, 1.15],
                    opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
            />

            <motion.div
                className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16 lg:pt-32"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge at top center */}
                <motion.div
                    variants={itemVariants}
                    className="flex justify-center mb-12"
                >
                    <motion.div
                        className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-base-100/60 backdrop-blur-md border border-base-300/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-base-300"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                            <Sparkles className="w-4 h-4 text-blue-500" />
                        </motion.div>
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {badge}
                        </span>
                    </motion.div>
                </motion.div>

                {/* Main content: text left, image right */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
                    {/* Left column: Text content */}
                    <motion.div variants={itemVariants} className="flex-1 space-y-8">
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl lg:text-6xl font-black leading-[1.15] tracking-tight text-base-content">
                                {titleMain} <br />
                                <motion.span
                                    className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent italic"
                                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                >
                                    {titleHighlight}
                                </motion.span>
                            </h1>
                        </div>

                        {/* Subtitle */}
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-lg text-base-content/70 leading-relaxed font-medium max-w-xl"
                        >
                            {subtitle}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 pt-4"
                        >
                            <Link to="/login">
                                <motion.button
                                    className="btn btn-lg h-14 px-9 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl shadow-lg shadow-blue-600/30 group text-base font-bold transition-all duration-300 w-full sm:w-auto"
                                    whileHover={{ scale: 1.08, y: -3 }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    <Rocket className="w-5 h-5" />
                                    {ctaPrimaryText}
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                </motion.button>
                            </Link>
                            <motion.button
                                className="btn btn-lg h-14 px-9 btn-ghost border-2 border-base-300 text-base-content rounded-xl hover:bg-base-200/50 text-base font-bold transition-all duration-300"
                                whileHover={{ scale: 1.08, y: -3 }}
                                whileTap={{ scale: 0.93 }}
                            >
                                <Brain className="w-5 h-5" />
                                {ctaSecondaryText}
                            </motion.button>
                        </motion.div>

                        {/* Feature highlights */}
                        <motion.div
                            className="flex flex-col gap-3 pt-6"
                            variants={containerVariants}
                        >
                            {[
                                { icon: Zap, text: 'Tạo nội dung tức thì' },
                                { icon: CheckCircle, text: 'Phân tích chi tiết' },
                                { icon: Brain, text: 'AI thông minh' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="flex items-center gap-3 text-base font-medium text-base-content/80"
                                >
                                    <item.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    {item.text}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div variants={itemVariants} className="pt-8">
                            <p className="text-sm text-base-content/60 font-bold uppercase tracking-widest mb-4">
                                Tin dùng bởi 10,000+ sinh viên & giáo viên
                            </p>
                            <div className="flex gap-6">
                                {[
                                    { icon: '🎓', text: 'EDU-TECH' },
                                    { icon: '⚡', text: 'FLASH-LEARN' },
                                    { icon: '🤖', text: 'AI-STUDY' }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 group cursor-pointer"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="text-xs font-semibold text-base-content/70 group-hover:text-base-content transition-colors">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right column: Hero image */}
                    <motion.div
                        variants={scaleInVariants}
                        className="flex-1 w-full"
                    >
                        <motion.div
                            variants={floatingVariants}
                            animate="animate"
                            className="relative group"
                        >
                            {/* Notion-style frame wrapper */}
                            <div className="relative rounded-2xl overflow-hidden">
                                {/* Frame border effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 rounded-2xl pointer-events-none z-[5]" />

                                {/* Main image container */}
                                <div className="relative rounded-2xl overflow-hidden bg-base-200/30 backdrop-blur-sm border border-base-300/30 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <img
                                        src={heroImage}
                                        alt="SKR Dashboard"
                                        className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    {/* Subtle overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-base-900/30 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

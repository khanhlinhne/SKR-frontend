import * as motion from 'motion/react-client';
import { ArrowRight, Sparkles, Star, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export default function CTASection() {
    return (
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-b from-base-100 via-blue-50/50 to-base-200">
            {/* Animated background gradient orbs */}
            <motion.div
                className="absolute -top-64 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-[120px]"
                animate={{
                    y: [0, 40, 0],
                    x: [0, 30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute -bottom-64 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-400/10 rounded-full blur-[120px]"
                animate={{
                    y: [0, -40, 0],
                    x: [0, -30, 0],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="relative"
                >
                    {/* Floating accent icons */}
                    <motion.div
                        className="absolute top-12 right-12 md:right-20"
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles className="w-8 h-8 text-blue-500/40" />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-20 left-12 md:left-20"
                        animate={{
                            y: [0, 20, 0],
                            rotate: [360, 0]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    >
                        <Star className="w-8 h-8 text-violet-500/40" />
                    </motion.div>

                    <div className="relative z-10 text-center space-y-8">
                        {/* Animated Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100/60 backdrop-blur-sm rounded-full border border-blue-300/50 hover:border-blue-400 transition-colors"
                        >
                            <motion.span
                                className="relative flex h-2.5 w-2.5"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </motion.span>
                            <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Sẵn sàng bứt phá?</span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-base-content leading-[1.1] tracking-tight">
                                Bắt đầu hành trình <br className="hidden md:block" />
                                <motion.span
                                    className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"
                                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                >
                                    chinh phục kiến thức
                                </motion.span>
                            </h2>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed font-medium"
                        >
                            Tham gia cùng hàng ngàn sinh viên đang sử dụng SKR để biến việc ôn thi thành trải nghiệm thú vị và hiệu quả.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6"
                        >
                            <Link to="/login">
                                <motion.button
                                    className="btn btn-lg h-14 px-10 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl shadow-lg shadow-blue-600/30 group text-base font-bold transition-all w-full sm:w-auto"
                                    whileHover={{ scale: 1.08, y: -3 }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    Đăng ký miễn phí
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                </motion.button>
                            </Link>
                            <motion.button
                                className="btn btn-lg h-14 px-10 bg-base-100 border-2 border-base-300 text-base-content hover:bg-base-200 rounded-xl text-base font-bold transition-all"
                                whileHover={{ scale: 1.08, y: -3 }}
                                whileTap={{ scale: 0.93 }}
                            >
                                Liên hệ hỗ trợ
                            </motion.button>
                        </motion.div>

                        {/* Features highlight */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                        >
                            {[
                                { icon: Zap, text: 'Khởi động nhanh' },
                                { icon: CheckCircle, text: 'Không cần thẻ tín dụng' },
                                { icon: Star, text: 'Hỗ trợ 24/7' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm font-medium text-base-content/80"
                                    whileHover={{ x: 5 }}
                                >
                                    <item.icon className="w-5 h-5 text-blue-600" />
                                    {item.text}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Check, X, ArrowRight, Sparkles, Crown, Zap, Shield, Clock, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: "Starter",
            subtitle: "Miễn phí mãi mãi",
            price: { monthly: "0", yearly: "0" },
            period: "vĩnh viễn",
            description: "Khám phá sức mạnh học tập thông minh với các tính năng cơ bản",
            icon: Zap,
            features: [
                { text: "50 Flashcards / tháng", included: true },
                { text: "3 bộ Flashcard tùy chỉnh", included: true },
                { text: "5 lượt thi thử / ngày", included: true },
                { text: "Dashboard học tập (7 ngày)", included: true },
                { text: "Forum cộng đồng", included: true },
                { text: "Giải thích AI chi tiết", included: false },
                { text: "Spaced Repetition thông minh", included: false },
                { text: "Phân tích điểm yếu cá nhân", included: false },
            ],
            popular: false,
            gradient: "from-slate-500 to-slate-700",
            bgGradient: "from-slate-500/5 to-slate-700/5",
            iconBg: "bg-slate-500/10",
            iconColor: "text-slate-600",
            cta: "Bắt đầu miễn phí",
            ctaStyle: "secondary"
        },
        {
            name: "Premium",
            subtitle: "Phổ biến nhất",
            price: { monthly: "99.000", yearly: "79.000" },
            period: "tháng",
            description: "Unlock toàn bộ sức mạnh AI cho hành trình chinh phục tri thức",
            icon: Crown,
            features: [
                { text: "Flashcards không giới hạn", included: true, highlight: true },
                { text: "Bộ Flashcard không giới hạn", included: true, highlight: true },
                { text: "Thi thử không giới hạn", included: true, highlight: true },
                { text: "AI giải thích mọi câu hỏi", included: true, highlight: true },
                { text: "Spaced Repetition thông minh", included: true, highlight: true },
                { text: "Phân tích điểm yếu & lộ trình", included: true, highlight: true },
                { text: "Mind Map & Đồng bộ Notion", included: true },
                { text: "Hỗ trợ ưu tiên 24/7", included: true },
            ],
            popular: true,
            gradient: "from-blue-600 via-violet-600 to-purple-600",
            bgGradient: "from-blue-600/10 via-violet-600/10 to-purple-600/10",
            iconBg: "bg-gradient-to-br from-blue-500 to-violet-500",
            iconColor: "text-white",
            cta: "Nâng cấp ngay",
            ctaStyle: "primary",
            savings: "Tiết kiệm 20%"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section className="py-28 bg-base-100 relative overflow-hidden" id="pricing">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating orbs */}
                <motion.div
                    className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-[100px]"
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-[120px]"
                    animate={{
                        y: [0, 30, 0],
                        x: [0, -30, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full opacity-30"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
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

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            Bảng giá minh bạch
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content mb-6 tracking-tight leading-tight">
                        Đầu tư cho{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                tương lai
                            </span>
                            <motion.svg
                                className="absolute -bottom-2 left-0 w-full"
                                viewBox="0 0 200 12"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                <motion.path
                                    d="M2 8 Q 50 2, 100 8 T 198 6"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="50%" stopColor="#7c3aed" />
                                        <stop offset="100%" stopColor="#9333ea" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
                        Kiến thức là khoản đầu tư sinh lời nhất. Chọn gói phù hợp và bắt đầu hành trình chinh phục mọi kỳ thi.
                    </p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 inline-flex items-center gap-4 p-1.5 bg-base-200/80 backdrop-blur-sm rounded-2xl"
                    >
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'text-white'
                                    : 'text-base-content/60 hover:text-base-content'
                                }`}
                        >
                            {billingCycle === 'monthly' && (
                                <motion.div
                                    layoutId="billingBg"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">Hàng tháng</span>
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly'
                                    ? 'text-white'
                                    : 'text-base-content/60 hover:text-base-content'
                                }`}
                        >
                            {billingCycle === 'yearly' && (
                                <motion.div
                                    layoutId="billingBg"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">Hàng năm</span>
                            <span className={`relative z-10 px-2 py-0.5 text-xs font-bold rounded-full ${billingCycle === 'yearly'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-green-500/10 text-green-600'
                                }`}>
                                -20%
                            </span>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Pricing Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                >
                    {plans.map((plan, index) => (
                        <PricingCard
                            key={index}
                            plan={plan}
                            itemVariants={itemVariants}
                            billingCycle={billingCycle}
                        />
                    ))}
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 flex flex-wrap justify-center gap-8"
                >
                    {[
                        { icon: Shield, text: "Bảo mật SSL" },
                        { icon: Clock, text: "Hủy bất cứ lúc nào" },
                        { icon: Gift, text: "7 ngày dùng thử" },
                    ].map((badge, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center gap-2 text-base-content/50"
                            whileHover={{ scale: 1.05, color: "var(--bc)" }}
                        >
                            <badge.icon className="w-5 h-5" />
                            <span className="font-medium">{badge.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <p className="text-base-content/50 mb-4 font-medium">
                        Có câu hỏi về gói dịch vụ?{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-bold underline-offset-4 hover:underline transition-all">
                            Liên hệ chúng tôi
                        </a>
                    </p>
                    <motion.a
                        href="#compare"
                        className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 group transition-colors"
                        whileHover={{ x: 5 }}
                    >
                        Xem bảng so sánh chi tiết tính năng
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}

function PricingCard({ plan, itemVariants, billingCycle }) {
    const IconComponent = plan.icon;
    const displayPrice = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
        >
            {/* Glow effect for popular plan */}
            {plan.popular && (
                <motion.div
                    className="absolute -inset-[2px] bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-[2rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: "200% 200%" }}
                />
            )}

            <div className={`relative h-full bg-base-100 border-2 rounded-[2rem] p-8 lg:p-10 overflow-hidden transition-all duration-500 ${plan.popular
                    ? 'border-transparent shadow-2xl'
                    : 'border-base-200 hover:border-base-300 hover:shadow-xl'
                }`}>

                {/* Popular badge */}
                {plan.popular && (
                    <motion.div
                        className="absolute top-0 right-8"
                        initial={{ y: -40 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                    >
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-black uppercase tracking-wider rounded-b-xl shadow-lg flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5" />
                            {plan.subtitle}
                        </div>
                    </motion.div>
                )}

                {/* Card Content */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Plan Header */}
                    <div className="flex items-start gap-4 mb-6">
                        <motion.div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.iconBg} shadow-lg`}
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <IconComponent className={`w-7 h-7 ${plan.iconColor}`} />
                        </motion.div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-base-content tracking-tight">
                                {plan.name}
                            </h3>
                            {!plan.popular && (
                                <p className="text-sm text-base-content/50 font-medium">{plan.subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-base-content/60 font-medium mb-6 leading-relaxed">
                        {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-8">
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                key={displayPrice}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl lg:text-6xl font-black text-base-content tracking-tighter"
                            >
                                {displayPrice !== "0" && <span className="text-2xl font-bold align-top">đ</span>}
                                {displayPrice}
                            </motion.span>
                            <span className="text-base-content/50 font-bold">
                                /{plan.period}
                            </span>
                        </div>
                        {plan.popular && billingCycle === 'yearly' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 text-sm text-green-600 font-bold flex items-center gap-1"
                            >
                                <Gift className="w-4 h-4" />
                                {plan.savings} khi thanh toán theo năm
                            </motion.p>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link to="/signup" className="mb-8 block">
                        <motion.button
                            className={`relative w-full h-14 rounded-2xl text-lg font-black tracking-tight overflow-hidden ${plan.popular
                                    ? 'text-white shadow-xl shadow-blue-600/25'
                                    : 'bg-base-200 text-base-content hover:bg-base-300'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {plan.popular && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"
                                        animate={{
                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        style={{ backgroundSize: "200% 200%" }}
                                    />
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                </>
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {plan.cta}
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </motion.button>
                    </Link>

                    {/* Features */}
                    <div className="space-y-3 flex-grow">
                        <p className="text-xs font-black text-base-content/40 uppercase tracking-widest mb-4">
                            Tính năng bao gồm
                        </p>
                        {plan.features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className={`flex items-start gap-3 ${!feature.included && 'opacity-40'}`}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: feature.included ? 1 : 0.4, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${feature.included
                                        ? feature.highlight
                                            ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                                            : plan.popular ? 'bg-blue-500/10' : 'bg-base-200'
                                        : 'bg-base-100 border border-base-300'
                                    }`}>
                                    {feature.included ? (
                                        <Check className={`w-3.5 h-3.5 ${feature.highlight ? 'text-white' : plan.popular ? 'text-blue-600' : 'text-base-content/50'}`} strokeWidth={3} />
                                    ) : (
                                        <X className="w-3.5 h-3.5 text-base-content/30" strokeWidth={3} />
                                    )}
                                </div>
                                <span className={`font-medium ${feature.included
                                        ? feature.highlight
                                            ? 'text-base-content font-semibold'
                                            : 'text-base-content/70'
                                        : 'text-base-content/40 line-through'
                                    }`}>
                                    {feature.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Background gradient decoration */}
                <div className={`absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br ${plan.bgGradient} rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 group-hover:opacity-150`} />

                {/* Corner decoration for popular plan */}
                {plan.popular && (
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] pointer-events-none" />
                )}
            </div>
        </motion.div>
    );
}

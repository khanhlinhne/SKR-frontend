import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Brain, BookOpen, Zap, Share2, LineChart, Globe, ArrowRight, Sparkles, CheckCircle2, Play } from 'lucide-react';

export default function FeaturesSection({
    badge = 'Tính năng nổi bật',
    titleMain = 'Tất cả những gì bạn cần',
    titleHighlight = 'để thành công',
    subtitle = 'Smart Knowledge Revise mang đến trải nghiệm học tập hiện đại, thông minh và hiệu quả với công nghệ AI tiên tiến nhất.'
} = {}) {
    const [activeFeature, setActiveFeature] = useState(0);

    const mainFeatures = [
        {
            icon: Brain,
            title: "Tích hợp AI mạnh mẽ",
            subtitle: "Cá nhân hóa tối đa",
            description: "Tự động tạo câu hỏi từ tài liệu, gợi ý lộ trình học tập, chatbot giải đáp 24/7 và phân tích điểm yếu thông minh.",
            features: ["Tạo câu hỏi tự động", "Gợi ý cá nhân hóa", "Chatbot hỗ trợ 24/7", "Phân tích điểm yếu"],
            gradient: "from-blue-500 via-blue-600 to-violet-600",
            lightGradient: "from-blue-500/10 to-violet-500/10",
            accentColor: "blue",
            stats: { value: "99%", label: "Độ chính xác" }
        },
        {
            icon: BookOpen,
            title: "Đa dạng hình thức học",
            subtitle: "Học tập không nhàm chán",
            description: "Từ Flashcard, trắc nghiệm đến tự luận, video và Mind Map. Thậm chí bạn có thể thách đấu cùng bạn bè.",
            features: ["Flashcard thông minh", "Mind Map tương tác", "Gamification", "Thách đấu bạn bè"],
            gradient: "from-violet-500 via-purple-500 to-pink-500",
            lightGradient: "from-violet-500/10 to-pink-500/10",
            accentColor: "violet",
            stats: { value: "10+", label: "Hình thức học" }
        },
        {
            icon: Zap,
            title: "Nguồn nội dung linh hoạt",
            subtitle: "Mọi lúc, mọi nơi",
            description: "Tự tạo nội dung, upload file PDF/Video hoặc sử dụng ngân hàng câu hỏi khổng lồ có sẵn từ cộng đồng.",
            features: ["Upload PDF/Video", "Question Bank", "Sync Notion", "Export Anki"],
            gradient: "from-amber-500 via-orange-500 to-red-500",
            lightGradient: "from-amber-500/10 to-orange-500/10",
            accentColor: "amber",
            stats: { value: "1M+", label: "Câu hỏi" }
        }
    ];

    const bottomFeatures = [
        {
            icon: Share2,
            title: "Cộng đồng học tập",
            description: "Học nhóm, chia sẻ tài liệu và thảo luận cùng các chuyên gia.",
            gradient: "from-emerald-500 to-teal-500",
            lightGradient: "from-emerald-500/10 to-teal-500/10"
        },
        {
            icon: LineChart,
            title: "Theo dõi tiến độ",
            description: "Dashboard chi tiết giúp nắm bắt lộ trình học một cách khoa học.",
            gradient: "from-cyan-500 to-blue-500",
            lightGradient: "from-cyan-500/10 to-blue-500/10"
        },
        {
            icon: Globe,
            title: "Tích hợp mở rộng",
            description: "Đồng bộ Notion, xuất PDF/Excel và ôn tập qua Anki mọi lúc.",
            gradient: "from-indigo-500 to-purple-500",
            lightGradient: "from-indigo-500/10 to-purple-500/10"
        }
    ];

    return (
        <section className="py-28 bg-base-100 relative overflow-hidden" id="features">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-[120px]"
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-[100px]"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
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
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            {badge}
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content mb-6 tracking-tight">
                        {titleMain}{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                {titleHighlight}
                            </span>
                            <motion.svg
                                className="absolute -bottom-2 left-0 w-full"
                                viewBox="0 0 300 12"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                <motion.path
                                    d="M2 8 Q 75 2, 150 8 T 298 6"
                                    fill="none"
                                    stroke="url(#featureGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="featureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="50%" stopColor="#7c3aed" />
                                        <stop offset="100%" stopColor="#9333ea" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-3xl mx-auto font-medium leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Main Features - Bento Grid Style */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid lg:grid-cols-3 gap-6 mb-16"
                >
                    {mainFeatures.map((feature, index) => (
                        <MainFeatureCard
                            key={index}
                            feature={feature}
                            index={index}
                            isActive={activeFeature === index}
                            onClick={() => setActiveFeature(index)}
                        />
                    ))}
                </motion.div>

                {/* Bottom Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {bottomFeatures.map((feature, index) => (
                        <BottomFeatureCard key={index} feature={feature} index={index} />
                    ))}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
                        <motion.a
                            href="#demo"
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-shadow"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Play className="w-5 h-5" />
                            Xem Demo
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.a>
                        <a href="#pricing" className="text-base-content/60 hover:text-base-content font-semibold transition-colors">
                            Xem bảng giá →
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function MainFeatureCard({ feature, index, isActive, onClick }) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            onClick={onClick}
            className={`group relative bg-base-100 rounded-[2rem] p-8 overflow-hidden cursor-pointer transition-all duration-500 ${isActive
                ? 'border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10'
                : 'border-2 border-base-200 hover:border-base-300 shadow-lg hover:shadow-xl'
                }`}
        >
            {/* Background gradient on hover/active */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.lightGradient} transition-opacity duration-500`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Stats Badge */}
                    <div className="text-right">
                        <div className={`text-2xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                            {feature.stats.value}
                        </div>
                        <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                            {feature.stats.label}
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <p className={`text-sm font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent uppercase tracking-wider mb-2`}>
                    {feature.subtitle}
                </p>

                {/* Title */}
                <h3 className="text-2xl font-black text-base-content mb-4 tracking-tight">
                    {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base-content/60 leading-relaxed mb-6 font-medium">
                    {feature.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2">
                    {feature.features.map((item, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-base-200/80 rounded-lg text-xs font-bold text-base-content/70"
                        >
                            <CheckCircle2 className={`w-3 h-3 text-${feature.accentColor}-500`} />
                            {item}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Decorative corner glow */}
            <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${feature.lightGradient} rounded-full blur-[60px] opacity-50`} />
        </motion.div>
    );
}

function BottomFeatureCard({ feature, index }) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3 } }}
            className="group relative bg-base-100 border-2 border-base-200 hover:border-base-300 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl"
        >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 flex items-start gap-4">
                <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold text-base-content mb-2">
                        {feature.title}
                    </h4>
                    <p className="text-sm text-base-content/60 leading-relaxed">
                        {feature.description}
                    </p>
                </div>

                {/* Arrow indicator */}
                <ArrowRight className="w-5 h-5 text-base-content/20 group-hover:text-base-content/50 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
        </motion.div>
    );
}

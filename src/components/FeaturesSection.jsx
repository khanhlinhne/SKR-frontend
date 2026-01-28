import * as motion from 'motion/react-client';
import { CheckCircle2, Zap, Users, Brain, BookOpen, Share2, Search, LineChart, Globe } from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: Brain,
            title: "Tích hợp AI mạnh mẽ",
            subtitle: "Cá nhân hóa tối đa",
            description: "Tự động tạo câu hỏi từ tài liệu, gợi ý lộ trình học tập, chatbot giải đáp 24/7 và phân tích điểm yếu thông minh.",
            features: ["Tạo câu hỏi tự động", "Gợi ý cá nhân hóa", "Chatbot hỗ trợ", "Phân tích điểm yếu"],
            gradient: "from-blue-500 to-violet-500",
            hueA: 210,
            hueB: 270,
            size: "large"
        },
        {
            icon: BookOpen,
            title: "Đa dạng hình thức học",
            subtitle: "Học tập không nhàm chán",
            description: "Từ Flashcard, trắc nghiệm đến tự luận, video và Mind Map. Thậm chí bạn có thể thách đấu cùng bạn bè.",
            features: ["Flashcard", "Mind Map", "Gamification", "Thách đấu"],
            gradient: "from-purple-500 to-pink-500",
            hueA: 280,
            hueB: 330,
            size: "large"
        },
        {
            icon: Zap,
            title: "Nguồn nội dung linh hoạt",
            subtitle: "Mọi lúc, mọi nơi",
            description: "Tự tạo nội dung, upload file PDF/Video hoặc sử dụng ngân hàng câu hỏi khổng lồ có sẵn từ cộng đồng.",
            features: ["Upload PDF/Video", "Question Bank", "Sync Notion", "Export Anki"],
            gradient: "from-amber-500 to-orange-500",
            hueA: 30,
            hueB: 60,
            size: "large"
        }
    ];

    return (
        <section className="py-24 bg-base-100 relative overflow-hidden" id="features">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-200/30 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-bold text-base-content mb-4 tracking-tight">
                        Tính năng{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent italic">
                            vượt trội
                        </span>
                    </h2>
                    <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium">
                        Smart Knowledge Revise mang đến trải nghiệm học tập hiện đại, thông minh và hiệu quả hơn bao giờ hết.
                    </p>
                </motion.div>

                {/* Animated Feature Cards */}
                <div className="max-w-3xl mx-auto pb-20">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>

                {/* Bottom Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <SmallFeatureCard
                        icon={Share2}
                        title="Hỗ trợ cộng đồng"
                        description="Học nhóm, chia sẻ tài liệu đã kiểm duyệt và thảo luận cùng các chuyên gia trên toàn cầu."
                        gradient="from-green-500 to-emerald-500"
                        hueA={120}
                        hueB={160}
                    />
                    <SmallFeatureCard
                        icon={LineChart}
                        title="Theo dõi tiến độ"
                        description="Hệ thống Dashboard chi tiết giúp bạn nắm bắt lộ trình và thời gian học tập một cách khoa học."
                        gradient="from-cyan-500 to-blue-500"
                        hueA={180}
                        hueB={210}
                    />
                    <SmallFeatureCard
                        icon={Globe}
                        title="Tích hợp mở rộng"
                        description="Đồng bộ mượt mà với Notion, xuất bản báo cáo PDF/Excel và ôn tập qua Anki mọi lúc."
                        gradient="from-indigo-500 to-purple-500"
                        hueA={230}
                        hueB={260}
                    />
                </div>
            </div>
        </section>
    );
}

const hue = (h) => `hsl(${h}, 100%, 50%)`;

function FeatureCard({ feature, index }) {
    const Icon = feature.icon;
    const background = `linear-gradient(306deg, ${hue(feature.hueA)}, ${hue(feature.hueB)})`;

    const cardVariants = {
        offscreen: {
            y: 300,
            opacity: 0,
        },
        onscreen: {
            y: 50,
            opacity: 1,
            rotate: index % 2 === 0 ? -1 : 1,
            transition: {
                type: "spring",
                bounce: 0.4,
                duration: 0.8,
            },
        },
    };

    return (
        <motion.div
            className="relative overflow-hidden flex justify-center items-center pt-5 -mb-32"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.5, once: false }}
        >
            {/* Background splash */}
            <div
                className="absolute inset-0"
                style={{
                    background,
                    clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
                    opacity: 0.8
                }}
            />

            {/* Card */}
            <motion.div
                variants={cardVariants}
                className="relative w-full max-w-2xl min-h-[420px] flex flex-col justify-center items-start rounded-3xl bg-base-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-10 md:p-12 border border-base-200"
                style={{
                    transformOrigin: "10% 60%",
                }}
            >
                {/* Icon */}
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-2xl"
                    style={{ background }}
                >
                    <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                {feature.subtitle && (
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">
                        {feature.subtitle}
                    </p>
                )}

                <h3 className="text-3xl md:text-4xl font-black text-base-content mb-5 tracking-tight">
                    {feature.title}
                </h3>

                <p className="text-base-content/70 leading-relaxed text-lg mb-8 font-medium">
                    {feature.description}
                </p>

                {/* Feature tags */}
                {feature.features && (
                    <div className="flex flex-wrap gap-3">
                        {feature.features.map((item, i) => (
                            <span
                                key={i}
                                className="px-5 py-2.5 bg-base-200/50 rounded-xl text-sm font-bold text-base-content/80 border border-base-300"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                )}

                {/* Decorative corner */}
                <div
                    className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-[80px] opacity-20"
                    style={{ background }}
                />
            </motion.div>
        </motion.div>
    );
}

function SmallFeatureCard({ icon: Icon, title, description, gradient, hueA, hueB }) {
    const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`;

    const cardVariants = {
        offscreen: {
            y: 100,
            opacity: 0,
        },
        onscreen: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                bounce: 0.3,
                duration: 0.6,
            },
        },
    };

    return (
        <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.5, once: false }}
            variants={cardVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative bg-base-100 border border-base-300 rounded-[2rem] p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30"
        >
            {/* Gradient overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
                style={{ background }}
            />

            <div className="relative z-10">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                    style={{ background }}
                >
                    <Icon className="w-7 h-7 text-white" />
                </div>

                <h4 className="text-xl font-black text-base-content mb-3 tracking-tight">
                    {title}
                </h4>

                <p className="text-base text-base-content/60 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            {/* Decorative corner */}
            <div
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20"
                style={{ background }}
            />
        </motion.div>
    );
}



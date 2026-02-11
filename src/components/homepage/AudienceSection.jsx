import { useState } from 'react';
import * as motion from 'motion/react-client';
import { GraduationCap, BookOpenCheck, ShieldCheck, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AudienceSection() {
    const [activeCard, setActiveCard] = useState(null);

    const audiences = [
        {
            icon: GraduationCap,
            title: "Người Học",
            subtitle: "Học sinh & Sinh viên",
            description: "Cá nhân hóa lộ trình ôn thi, tự động tạo câu hỏi từ tài liệu và phân tích điểm yếu để bứt phá điểm số.",
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/10 to-cyan-500/10",
            shadowColor: "shadow-blue-500/20",
            iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
            features: [
                "Ôn thi THPT Quốc gia & Đại học",
                "Học tập với Spaced Repetition",
                "AI phân tích điểm yếu cá nhân",
                "Lấy chứng chỉ nghề nghiệp"
            ],
            stats: { value: "50K+", label: "Học viên" }
        },
        {
            icon: BookOpenCheck,
            title: "Content Creator",
            subtitle: "Giáo viên & Chuyên gia",
            description: "Xây dựng và quản lý kho học liệu chuyên nghiệp, kiếm thu nhập từ tri thức thông qua nền tảng.",
            gradient: "from-violet-500 to-purple-500",
            bgGradient: "from-violet-500/10 to-purple-500/10",
            shadowColor: "shadow-violet-500/20",
            iconBg: "bg-gradient-to-br from-violet-500 to-purple-500",
            features: [
                "Tạo Question Bank không giới hạn",
                "Phân tích Engagement chi tiết",
                "Quản lý bản quyền nội dung",
                "Kiếm tiền từ khóa học"
            ],
            stats: { value: "1K+", label: "Creators" },
            popular: true
        },
        {
            icon: ShieldCheck,
            title: "Quản Trị Viên",
            subtitle: "Enterprise & Tổ chức",
            description: "Hệ thống quản lý người dùng, nội dung và doanh thu mạnh mẽ với các chỉ số BI thông minh.",
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-500/10 to-teal-500/10",
            shadowColor: "shadow-emerald-500/20",
            iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
            features: [
                "Kiểm duyệt nội dung bằng AI",
                "Dashboard phân tích KPI",
                "Quản lý bảo mật nâng cao",
                "Tích hợp SSO doanh nghiệp"
            ],
            stats: { value: "100+", label: "Tổ chức" }
        }
    ];

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

    const cardVariants = {
        hidden: { opacity: 0, y: 60, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section className="py-28 bg-gradient-to-b from-base-100 via-base-200/50 to-base-100 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated gradient orbs */}
                <motion.div
                    className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-[100px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-[80px]"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-[100px]"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

                {/* Floating dots */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-40"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${15 + (i % 4) * 20}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.3,
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
                    className="text-center mb-20"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-emerald-500/10 border border-violet-500/20 mb-6"
                    >
                        <Users className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                            Đa dạng đối tượng
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content mb-6 tracking-tight leading-tight">
                        Dành cho{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                                mọi người
                            </span>
                            <motion.div
                                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 rounded-full blur-sm"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            />
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-3xl mx-auto font-medium leading-relaxed">
                        SKR được thiết kế linh hoạt để phục vụ nhu cầu đa dạng, từ người học cá nhân đến các chuyên gia sáng tạo nội dung và tổ chức doanh nghiệp.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
                    style={{ perspective: "1000px" }}
                >
                    {audiences.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            onHoverStart={() => setActiveCard(index)}
                            onHoverEnd={() => setActiveCard(null)}
                            whileHover={{
                                y: -12,
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            className={`relative group ${item.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                        >
                            {/* Glow effect */}
                            <motion.div
                                className={`absolute -inset-[1px] bg-gradient-to-r ${item.gradient} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                            />

                            {/* Popular badge */}
                            {item.popular && (
                                <motion.div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                                    initial={{ y: -20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                                >
                                    <div className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        Hot
                                    </div>
                                </motion.div>
                            )}

                            <div className={`relative h-full bg-base-100 p-8 lg:p-10 rounded-[2rem] border-2 overflow-hidden transition-all duration-500 ${item.popular
                                ? 'border-violet-500/30 shadow-xl shadow-violet-500/10'
                                : 'border-base-200 hover:border-base-300 shadow-lg hover:shadow-xl'
                                }`}>

                                {/* Background gradient on hover */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                />

                                {/* Card Content */}
                                <div className="relative z-10">
                                    {/* Icon & Stats Row */}
                                    <div className="flex items-start justify-between mb-6">
                                        <motion.div
                                            className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg`}
                                            whileHover={{
                                                rotate: [0, -10, 10, 0],
                                                scale: 1.1
                                            }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <item.icon className="w-8 h-8 text-white" />
                                        </motion.div>

                                        {/* Stats badge */}
                                        <motion.div
                                            className="text-right"
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <div className={`text-2xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                                                {item.stats.value}
                                            </div>
                                            <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                                                {item.stats.label}
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Title & Subtitle */}
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-black text-base-content tracking-tight mb-1">
                                            {item.title}
                                        </h3>
                                        <p className={`text-sm font-semibold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-base-content/60 mb-8 leading-relaxed font-medium">
                                        {item.description}
                                    </p>

                                    {/* Features List */}
                                    <ul className="space-y-3 mb-8">
                                        {item.features.map((feature, idx) => (
                                            <motion.li
                                                key={idx}
                                                className="flex items-center gap-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.4 + idx * 0.1 }}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                                                    <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                                <span className="text-sm font-medium text-base-content/70">
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}

                                </div>

                                {/* Decorative corner */}
                                <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${item.bgGradient} rounded-full blur-[60px] opacity-50 pointer-events-none`} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 p-8 bg-gradient-to-r from-base-200/80 via-base-100 to-base-200/80 backdrop-blur-sm rounded-3xl border border-base-300/50"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "50K+", label: "Học viên tin dùng", icon: "👨‍🎓" },
                            { value: "1M+", label: "Flashcards đã tạo", icon: "📚" },
                            { value: "99%", label: "Hài lòng dịch vụ", icon: "⭐" },
                            { value: "24/7", label: "Hỗ trợ nhiệt tình", icon: "💬" },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                            >
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-base-content/50">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

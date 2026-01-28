import * as motion from 'motion/react-client';
import { Check, X, ArrowRight, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
    const plans = [
        {
            name: "GÓI FREE",
            price: "0",
            period: "vĩnh viễn",
            description: "Trải nghiệm các tính năng cơ bản của hệ thống",
            features: [
                "Giới hạn số lượng câu hỏi/flashcard",
                "Giới hạn dung lượng upload tài liệu",
                "Giới hạn lượt thi thử mỗi ngày",
                "Dashboard học tập cơ bản (7 ngày)",
                "Forum thảo luận cộng đồng"
            ],
            notIncluded: [
                "Giải thích chi tiết bằng AI",
                "Spaced Repetition thông minh",
                "Phân tích điểm yếu cá nhân",
                "Tích hợp Notion & Mind Map"
            ],
            popular: false,
            gradient: "from-slate-400 to-slate-600",
            cta: "Bắt đầu ngay"
        },
        {
            name: "GÓI PREMIUM",
            price: "99.000",
            period: "tháng",
            description: "Sức mạnh AI tối thượng cho hành trình ôn thi",
            features: [
                "Tạo nội dung bằng AI không giới hạn",
                "Giải thích AI chi tiết cho mọi câu hỏi",
                "Lên lịch Spaced Repetition thông minh",
                "Phân tích điểm yếu & lộ trình đề xuất",
                "Tạo Mind Map & Đồng bộ Notion",
                "Thi thử & Upload không giới hạn"
            ],
            popular: true,
            gradient: "from-blue-600 to-violet-600",
            cta: "Nâng cấp Premium"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section className="py-24 bg-base-100 relative overflow-hidden" id="pricing">
            {/* Background decoration */}
            <motion.div
                className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"
                animate={{
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-base-content mb-4 tracking-tight">
                        Lựa chọn{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent italic">
                            phù hợp
                        </span>
                    </h2>
                    <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium">
                        Đầu tư cho kiến thức là khoản đầu tư sinh lợi nhất. Chọn gói dịch vụ phù hợp để bứt phá điểm số ngay hôm nay.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto"
                >
                    {plans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} itemVariants={itemVariants} />
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center mt-16"
                >
                    <p className="text-base-content/60 mb-4 font-medium">
                        Tất cả các gói đều bao gồm hỗ trợ chatbot AI cơ bản. Hủy bất cứ lúc nào.
                    </p>
                    <a href="#" className="font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 group transition-colors">
                        Xem bảng so sánh chi tiết tính năng
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

function PricingCard({ plan, itemVariants }) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -12, scale: plan.popular ? 1.02 : 1 }}
            className={`relative flex-1 bg-base-100 border rounded-[2.5rem] p-10 overflow-hidden transition-all duration-500 ${plan.popular
                ? 'border-blue-500 shadow-2xl shadow-blue-500/20 z-10'
                : 'border-base-300 hover:border-base-content/20'
                }`}
        >
            {/* Popular badge */}
            {plan.popular && (
                <div className="absolute top-0 right-10 px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-black uppercase tracking-widest rounded-b-2xl shadow-lg">
                    Phổ biến nhất
                </div>
            )}

            <div className="relative z-10 h-full flex flex-col">
                {/* Plan Header */}
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-base-content mb-2 tracking-tight">
                        {plan.name}
                    </h3>
                    <p className="text-base-content/60 font-medium">
                        {plan.description}
                    </p>
                </div>

                {/* Price */}
                <div className="mb-10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-base-content tracking-tighter">
                            {plan.price !== "0" && <span className="text-2xl font-bold align-top mr-1">đ</span>}
                            {plan.price}
                        </span>
                        <span className="text-base-content/60 font-bold ml-1 italic">
                            /{plan.period}
                        </span>
                    </div>
                </div>

                {/* CTA Button */}
                <Link to="/login" className="mb-10 block">
                    <motion.button
                        className={`w-full h-14 rounded-2xl text-lg font-black tracking-tight transition-all ${plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-600/30'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {plan.cta}
                    </motion.button>
                </Link>

                {/* Features */}
                <div className="space-y-4 mb-8 flex-grow">
                    <p className="text-xs font-black text-base-content/40 uppercase tracking-widest mb-4">Bao gồm:</p>
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.popular ? 'bg-blue-500/10' : 'bg-base-200'}`}>
                                <Check className={`w-3.5 h-3.5 ${plan.popular ? 'text-blue-600' : 'text-base-content/40'}`} strokeWidth={3} />
                            </div>
                            <span className="text-base-content/80 font-medium">
                                {feature}
                            </span>
                        </div>
                    ))}

                    {plan.notIncluded && plan.notIncluded.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4 opacity-40">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-base-100 border border-base-300">
                                <X className="w-3.5 h-3.5 text-base-content/40" strokeWidth={3} />
                            </div>
                            <span className="text-base-content/60 font-medium line-through">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative elements */}
            <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${plan.gradient} rounded-full blur-[80px] opacity-10 pointer-events-none`} />
        </motion.div>
    );
}


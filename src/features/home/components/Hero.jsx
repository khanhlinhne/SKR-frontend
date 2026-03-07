import { motion } from 'motion/react';
import { ArrowRight, BarChart3, BrainCircuit, Clock3, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroIllustration from '@/assets/hero-image.png';
import { heroHighlights, heroMetrics } from '@/features/home/constants';

const reviewStats = [
    { label: 'Flashcards đã ôn', value: '36 / 40' },
    { label: 'Tỷ lệ trả lời đúng', value: '91%' },
    { label: 'Mức độ ghi nhớ', value: 'Cao' },
];

const weeklyHeights = [36, 52, 41, 68, 74, 58, 82];
const weeklyLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const heroSummaryStats = [
    { icon: Clock3, value: '48 phút', label: 'deep work hôm nay' },
    { icon: BrainCircuit, value: '14', label: 'giải thích AI đã lưu' },
    { icon: BarChart3, value: '+12%', label: 'tăng trưởng theo tuần' },
];

export default function Hero({
    badge = 'Học tập được thiết kế lại để rõ ràng hơn',
    titleMain = 'Học sâu hơn',
    titleHighlight = 'với ít nhiễu hơn',
    subtitle = 'SKR gom bài học, flashcards, quiz và AI vào một flow tối giản để bạn biết chính xác hôm nay cần học gì và tại sao.',
    ctaPrimaryText = 'Bắt đầu miễn phí',
    ctaSecondaryText = 'Xem môn học',
} = {}) {
    return (
        <section className="relative overflow-hidden px-6 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-14">
            <motion.div
                className="apple-hero-glow pointer-events-none absolute inset-x-0 top-[-6rem] h-[34rem]"
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                <div className="max-w-2xl pt-8 lg:pt-14">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl"
                    >
                        {badge}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="apple-main-text text-[3rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[4.25rem] lg:text-[5.5rem]"
                    >
                        {titleMain}
                        <br />
                        <span className="apple-highlight-text">{titleHighlight}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="apple-secondary-text mt-6 max-w-xl text-lg leading-8 sm:text-xl"
                    >
                        {subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-9 flex flex-col gap-3 sm:flex-row"
                    >
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/signup"
                                className="apple-primary-button apple-transition inline-flex h-14 items-center justify-center rounded-full px-7 text-sm font-semibold"
                            >
                                {ctaPrimaryText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/courses"
                                className="apple-secondary-button apple-transition inline-flex h-14 items-center justify-center rounded-full px-7 text-sm font-semibold backdrop-blur-xl"
                            >
                                <PlayCircle className="mr-2 h-4 w-4" />
                                {ctaSecondaryText}
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-12 grid gap-6 sm:grid-cols-3"
                    >
                        {heroMetrics.map((metric) => (
                            <motion.div key={metric.label} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                <div className="apple-main-text text-3xl font-semibold tracking-[-0.03em]">{metric.value}</div>
                                <p className="apple-secondary-text mt-2 text-sm leading-6">{metric.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="relative"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                    >
                        <div className="absolute inset-x-12 top-8 h-40 rounded-full apple-cta-glow blur-3xl" />

                        <div className="apple-panel-strong apple-card-shadow-lg relative overflow-hidden rounded-[32px] border p-5 backdrop-blur-2xl sm:p-6">
                            <div className="apple-border relative mb-5 overflow-hidden rounded-[28px] border">
                                <motion.img
                                    src={heroIllustration}
                                    alt="Minh họa không gian học tập với AI"
                                    className="h-64 w-full object-cover sm:h-72"
                                    animate={{ scale: [1, 1.03, 1] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <div className="apple-img-overlay absolute inset-0" />
                                <div className="apple-glass-overlay apple-glass-border absolute left-5 top-5 rounded-full border px-4 py-2 text-sm font-medium text-white backdrop-blur-xl">
                                    AI study workspace
                                </div>
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                    className="apple-glass-overlay apple-glass-border absolute right-5 top-5 rounded-2xl border px-4 py-3 text-right backdrop-blur-xl"
                                >
                                    <p className="text-xs font-medium text-white/72">Gợi ý ôn tập</p>
                                    <p className="mt-1 text-sm font-semibold text-white">3 chủ đề cần ưu tiên</p>
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                                    className="apple-glass-overlay apple-glass-border absolute bottom-5 left-5 rounded-2xl border px-4 py-3 backdrop-blur-xl"
                                >
                                    <p className="text-xs font-medium text-white/72">Hôm nay</p>
                                    <p className="mt-1 text-lg font-semibold text-white">12.400 người học đang hoạt động</p>
                                </motion.div>
                            </div>

                            <div className="apple-border mb-5 flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="apple-muted-text text-xs font-semibold uppercase tracking-[0.18em]">Hôm nay</p>
                                    <h2 className="apple-main-text mt-2 text-2xl font-semibold tracking-[-0.03em]">Tổng quan học tập</h2>
                                </div>
                                <div className="apple-muted-panel apple-secondary-text rounded-full px-4 py-2 text-sm font-medium">
                                    Focus mode
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                                <div className="apple-soft-panel rounded-[28px] p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="apple-secondary-text text-sm font-medium">Lượt ôn tập tiếp theo</p>
                                            <h3 className="apple-main-text mt-1 text-2xl font-semibold tracking-[-0.03em]">Sinh học tế bào</h3>
                                        </div>
                                        <div className="apple-panel-strong apple-card-shadow rounded-2xl px-4 py-3 text-right">
                                            <p className="apple-muted-text text-xs font-medium">Bắt đầu sau</p>
                                            <p className="apple-main-text mt-1 text-lg font-semibold">12 phút</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {reviewStats.map((item) => (
                                            <motion.div
                                                key={item.label}
                                                whileHover={{ x: 3 }}
                                                className="apple-panel apple-transition flex items-center justify-between rounded-2xl border px-4 py-3"
                                            >
                                                <span className="apple-secondary-text text-sm">{item.label}</span>
                                                <span className="apple-main-text text-sm font-semibold">{item.value}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <motion.div
                                        whileHover={{ y: -3 }}
                                        className="apple-dark-surface apple-card-shadow-md rounded-[28px] border p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-white/62">Tóm tắt từ AI</p>
                                                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                                                    Nên ôn lại các điểm yếu trước
                                                </h3>
                                            </div>
                                            <BrainCircuit className="h-5 w-5 text-white/72" />
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-white/72">
                                            Phosphoryl hóa oxy hóa và tế bào chất là hai phần bạn đang chưa ổn định.
                                        </p>
                                    </motion.div>

                                    <motion.div whileHover={{ y: -3 }} className="apple-soft-panel rounded-[28px] p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="apple-secondary-text text-sm font-medium">Nhịp học trong tuần</p>
                                            <BarChart3 className="apple-muted-text h-4 w-4" />
                                        </div>
                                        <div className="flex h-28 items-end gap-2">
                                            {weeklyHeights.map((height, index) => (
                                                <motion.div key={weeklyLabels[index]} className="flex flex-1 flex-col items-center gap-2" whileHover={{ y: -2 }}>
                                                    <div
                                                        className={`w-full rounded-full ${index === 6 ? 'apple-chart-bar-active' : 'apple-chart-bar'}`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                    <span className="apple-muted-text text-[11px] font-medium">{weeklyLabels[index]}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {heroSummaryStats.map((item) => (
                                    <motion.div
                                        key={item.label}
                                        whileHover={{ y: -3 }}
                                        className="apple-panel apple-transition rounded-[24px] border px-4 py-4"
                                    >
                                        <item.icon className="apple-muted-text h-4 w-4" />
                                        <div className="apple-main-text mt-4 text-2xl font-semibold tracking-[-0.03em]">
                                            {item.value}
                                        </div>
                                        <p className="apple-secondary-text mt-1 text-sm">{item.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {heroHighlights.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.28 + index * 0.06 }}
                                whileHover={{ y: -4 }}
                                className="apple-panel apple-card-shadow apple-transition rounded-[24px] border p-5 backdrop-blur-xl"
                            >
                                <item.icon className="apple-muted-text h-5 w-5" />
                                <h3 className="apple-main-text mt-4 text-base font-semibold tracking-[-0.02em]">{item.title}</h3>
                                <p className="apple-secondary-text mt-2 text-sm leading-6">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

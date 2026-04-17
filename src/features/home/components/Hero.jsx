import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, PlayCircle, Sparkles, Brain, BookOpen, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroMetrics, heroHighlights } from '@/features/home/constants';

const carouselSlides = [
    {
        id: 1,
        title: 'Flashcards',
        subtitle: 'Thông minh',
        description: 'Tạo thẻ học nhanh với AI. Ôn tập đúng thời điểm nhờ spaced repetition.',
        icon: Brain,
        gradient: 'from-violet-600 to-indigo-600',
        stats: { value: '40K+', label: 'thẻ đã tạo' },
    },
    {
        id: 2,
        title: 'Quiz',
        subtitle: 'Tự động',
        description: 'Sinh câu hỏi từ tài liệu. Theo dõi tiến độ và đánh giá chi tiết.',
        icon: Target,
        gradient: 'from-blue-600 to-cyan-500',
        stats: { value: '92%', label: 'độ chính xác' },
    },
    {
        id: 3,
        title: 'Học tập',
        subtitle: 'Cá nhân',
        description: 'Lộ trình học được cá nhân hóa. Tập trung vào điểm yếu của bạn.',
        icon: BookOpen,
        gradient: 'from-emerald-600 to-teal-500',
        stats: { value: '3x', label: 'hiệu quả hơn' },
    },
];

const slideContent = [
    { todayTask: 'Flashcards' },
    { todayTask: 'Quiz' },
    { todayTask: 'Ôn tập' },
];

function CarouselCard({ slide, index }) {
    const IconComponent = slide.icon;
    return (
        <div className={`h-full w-full rounded-[36px] bg-gradient-to-br ${slide.gradient} p-1`}>
            <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-slate-900/95 backdrop-blur-2xl">
                {/* Header */}
                <div className="absolute left-6 top-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
                        <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-white/60">Tính năng</p>
                        <p className="text-lg font-semibold text-white">{slide.title}</p>
                    </div>
                </div>

                {/* Stats Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute right-6 top-6 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-xl"
                >
                    <p className="text-xs text-white/60">{slide.stats.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{slide.stats.value}</p>
                </motion.div>

                {/* Main Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 pb-8 pt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-xl">
                            <Sparkles className="h-3 w-3" />
                            {slide.subtitle}
                        </span>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-lg leading-relaxed text-white/80"
                    >
                        {slide.description}
                    </motion.p>

                    {/* Mini Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mt-auto grid grid-cols-2 gap-4"
                    >
                        <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-xl">
                            <p className="text-xs text-white/50">Tiến độ học</p>
                            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '78%' }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="rounded-full bg-white"
                                />
                            </div>
                            <p className="mt-2 text-sm font-medium text-white">78%</p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-xl">
                            <p className="text-xs text-white/50">Hôm nay</p>
                            <p className="mt-2 text-xl font-semibold text-white">{slideContent[index].todayTask}</p>
                            <p className="mt-1 text-xs text-white/60">Đã hoàn thành</p>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            </div>
        </div>
    );
}

export default function Hero({
    badge = 'Học tập được thiết kế lại để rõ ràng hơn',
    titleMain = 'Học sâu hơn',
    titleHighlight = 'với ít nhiễu hơn',
    subtitle = 'SKR gom bài học, flashcards, quiz và AI vào một flow tối giản để bạn biết chính xác hôm nay cần học gì và tại sao.',
    ctaPrimaryText = 'Bắt đầu miễn phí',
    ctaSecondaryText = 'Xem môn học',
} = {}) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    };

    return (
        <section className="relative overflow-hidden px-4 py-8 lg:px-8 lg:py-12">
            {/* Background Effects */}
            <motion.div
                className="apple-hero-glow pointer-events-none absolute inset-x-0 top-[-8rem] h-[40rem]"
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:items-center">
                {/* Left Column - Content */}
                <div className="max-w-2xl lg:pt-4">
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
                        className="apple-main-text mt-6 text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.5rem]"
                    >
                        {titleMain}
                        <br />
                        <span className="apple-highlight-text">{titleHighlight}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="apple-secondary-text mt-5 max-w-xl text-lg leading-8 sm:text-xl"
                    >
                        {subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-8 flex flex-col gap-3 sm:flex-row"
                    >
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/signup"
                                className="apple-primary-button apple-transition inline-flex h-13 items-center justify-center rounded-full px-6 text-base font-semibold"
                            >
                                {ctaPrimaryText}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                to="/courses"
                                className="apple-secondary-button apple-transition inline-flex h-13 items-center justify-center rounded-full px-6 text-base font-semibold backdrop-blur-xl"
                            >
                                <PlayCircle className="mr-2 h-5 w-5" />
                                {ctaSecondaryText}
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-10 grid gap-5 sm:grid-cols-3"
                    >
                        {heroMetrics.map((metric, index) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 + index * 0.08 }}
                                whileHover={{ y: -3 }}
                                className="apple-panel apple-card-shadow apple-transition rounded-2xl border p-4"
                            >
                                <div className="apple-main-text text-2xl font-semibold tracking-[-0.03em]">{metric.value}</div>
                                <p className="apple-secondary-text mt-1 text-sm leading-5">{metric.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Right Column - 3D Carousel */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative"
                >
                    {/* Carousel Container */}
                    <div className="relative h-[480px] perspective-1000">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentSlide}
                                custom={direction}
                                initial={{ opacity: 0, rotateY: direction > 0 ? 60 : -60, scale: 0.9 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                exit={{ opacity: 0, rotateY: direction > 0 ? -60 : 60, scale: 0.9 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0"
                            >
                                <CarouselCard slide={carouselSlides[currentSlide]} index={currentSlide} />
                            </motion.div>
                        </AnimatePresence>

                        {/* 3D Cards Stack Effect */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                            <div className="flex items-center gap-3">
                                {carouselSlides.map((slide, index) => {
                                    const isActive = index === currentSlide;
                                    return (
                                        <motion.button
                                            key={slide.id}
                                            onClick={() => goToSlide(index)}
                                            className={`relative h-2 rounded-full transition-all duration-300 ${
                                                isActive ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                                            }`}
                                            whileHover={{ scale: 1.2 }}
                                            animate={{
                                                scale: isActive ? 1 : 0.85,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white transition-all hover:bg-white/20"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white transition-all hover:bg-white/20"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Feature Cards Below */}
                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {heroHighlights.map((item, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
                                whileHover={{ y: -4 }}
                                className="apple-panel apple-card-shadow apple-transition rounded-2xl border p-4 backdrop-blur-xl"
                            >
                                <item.icon className="apple-accent-text h-5 w-5" />
                                <h3 className="apple-main-text mt-3 text-sm font-semibold tracking-[-0.02em]">{item.title}</h3>
                                <p className="apple-secondary-text mt-1 text-xs leading-5">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

import * as React from 'react';
import * as motion from 'motion/react-client';
import {
    GraduationCap,
    Star,
    Users,
    BookOpen,
    Play,
    ArrowRight,
    Award,
    Clock,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Utilities ──────────────────────────────────────────

/**
 * Format VND price — matches mst_subjects.price_amount (DECIMAL 12,2)
 * @param {number} amount - price in VND
 * @returns {string} formatted price string
 */
function formatPrice(amount) {
    if (amount === 0) return 'Miễn phí';
    if (amount >= 1_000_000) {
        return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    }
    return amount.toLocaleString('vi-VN') + '₫';
}

// ─── Data (mock — maps to DB tables) ────────────────────
//
// experts  → mst_users + mst_creator_profiles
// courses  → mst_subjects (with pricing fields)
// ─────────────────────────────────────────────────────────

const experts = [
    {
        id: 1,
        name: 'TS. Nguyễn Văn Minh',
        title: 'Tiến sĩ Toán học - ĐH Bách Khoa',
        avatar: 'https://i.pravatar.cc/150?img=11',
        rating: 4.9,
        students: 12500,
        courses: 8,
        verified: true,
        speciality: 'Toán học',
    },
    {
        id: 2,
        name: 'ThS. Trần Thu Hà',
        title: 'Thạc sĩ Ngôn ngữ Anh - ĐH Ngoại Ngữ',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4.8,
        students: 9800,
        courses: 12,
        verified: true,
        speciality: 'Ngôn ngữ',
    },
    {
        id: 3,
        name: 'TS. Lê Hoàng Long',
        title: 'Tiến sĩ CNTT - ĐH Công Nghệ',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4.9,
        students: 15200,
        courses: 10,
        verified: true,
        speciality: 'Lập trình',
    },
    {
        id: 4,
        name: 'PGS. Phạm Thanh Tùng',
        title: 'Phó Giáo sư Vật lý - ĐH KHTN',
        avatar: 'https://i.pravatar.cc/150?img=53',
        rating: 4.7,
        students: 7600,
        courses: 6,
        verified: true,
        speciality: 'Khoa học',
    },
];

// Mock data structure aligns with mst_subjects table:
//   price_amount, original_price, discount_percent, is_free,
//   total_chapters, total_lessons, total_videos, total_documents, total_questions,
//   estimated_duration_hours, purchase_count, rating_average, rating_count
const courses = [
    {
        id: 1,
        title: 'Toán Cao Cấp - Giải Tích & Đại Số',
        expertId: 1,
        category: 'Toán học',
        isFree: false,
        priceAmount: 299000,
        originalPrice: 499000,
        discountPercent: 40,
        ratingAverage: 4.9,
        ratingCount: 328,
        purchaseCount: 4520,
        totalChapters: 12,
        totalLessons: 48,
        totalVideos: 36,
        totalDocuments: 15,
        totalQuestions: 200,
        estimatedDurationHours: 32,
        level: 'Nâng cao',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        icon: '📐',
        tags: ['Đạo hàm', 'Tích phân', 'Ma trận'],
        flashcards: 450,
        bannerUrl: '/images/courses/math-banner.png',
    },
    {
        id: 2,
        title: 'IELTS Academic - Lộ Trình 7.0+',
        expertId: 2,
        category: 'Ngôn ngữ',
        isFree: false,
        priceAmount: 599000,
        originalPrice: 899000,
        discountPercent: 33,
        ratingAverage: 4.8,
        ratingCount: 512,
        purchaseCount: 3890,
        totalChapters: 16,
        totalLessons: 64,
        totalVideos: 52,
        totalDocuments: 24,
        totalQuestions: 500,
        estimatedDurationHours: 45,
        level: 'Trung bình - Nâng cao',
        gradient: 'from-emerald-500 to-teal-500',
        bgGradient: 'from-emerald-500/10 to-teal-500/10',
        icon: '🇬🇧',
        tags: ['Reading', 'Writing', 'Speaking'],
        flashcards: 1200,
        bannerUrl: '/images/courses/ielts-banner.png',
    },
    {
        id: 3,
        title: 'Python & AI - Từ Cơ Bản Đến Ứng Dụng',
        expertId: 3,
        category: 'Lập trình',
        isFree: false,
        priceAmount: 399000,
        originalPrice: 699000,
        discountPercent: 43,
        ratingAverage: 4.9,
        ratingCount: 687,
        purchaseCount: 6200,
        totalChapters: 14,
        totalLessons: 56,
        totalVideos: 48,
        totalDocuments: 18,
        totalQuestions: 300,
        estimatedDurationHours: 40,
        level: 'Mọi trình độ',
        gradient: 'from-violet-500 to-purple-500',
        bgGradient: 'from-violet-500/10 to-purple-500/10',
        icon: '🐍',
        tags: ['Python', 'Machine Learning', 'Deep Learning'],
        flashcards: 680,
        bannerUrl: '/images/courses/python-ai-banner.png',
    },
];

// ─── Sub-components ────────────────────────────────────

function ExpertCard({ expert, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative group"
        >
            {/* Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

            <div className="relative bg-base-100 rounded-2xl p-6 border border-base-200 hover:border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-500 text-center">
                {/* Avatar */}
                <div className="relative mx-auto mb-4 w-20 h-20">
                    <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-base-200 group-hover:ring-blue-500/30 transition-all"
                    />
                    {expert.verified && (
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', delay: 0.3 + index * 0.1 }}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center shadow-md"
                        >
                            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </div>

                {/* Info */}
                <h4 className="font-black text-base-content text-sm mb-1 tracking-tight">{expert.name}</h4>
                <p className="text-xs text-base-content/50 font-medium mb-3 leading-snug">{expert.title}</p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-bold text-orange-500">
                        <Star className="w-3.5 h-3.5 fill-orange-500" />
                        {expert.rating}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-base-300" />
                    <span className="font-semibold text-base-content/60">
                        {(expert.students / 1000).toFixed(1)}K học viên
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

function CourseCard({ course, expert, index, variants }) {
    const hasDiscount = course.discountPercent > 0 && course.originalPrice > course.priceAmount;

    return (
        <motion.div
            variants={variants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative group"
        >
            {/* Glow effect */}
            <motion.div
                className={`absolute -inset-[1px] bg-gradient-to-r ${course.gradient} rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-500`}
            />

            <div className="relative h-full bg-base-100 rounded-[1.5rem] border-2 border-base-200 hover:border-base-300 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
                {/* Banner Image */}
                <div className="relative h-44 overflow-hidden">
                    <img
                        src={course.bannerUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-80`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${course.bgGradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

                    {/* Discount badge on image */}
                    {hasDiscount && (
                        <div className="absolute top-3 right-3 z-20">
                            <motion.div
                                initial={{ scale: 0, rotate: -12 }}
                                whileInView={{ scale: 1, rotate: -12 }}
                                viewport={{ once: true }}
                                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                                className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black rounded-lg shadow-lg"
                            >
                                -{course.discountPercent}%
                            </motion.div>
                        </div>
                    )}

                    {/* Category badge on image */}
                    <div className="absolute top-3 left-3 z-20">
                        <span className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${course.gradient} text-white text-xs font-bold shadow-lg backdrop-blur-sm`}>
                            {course.icon} {course.category}
                        </span>
                    </div>
                </div>

                {/* Background gradient */}
                <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${course.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 p-5 flex-1 flex flex-col">
                    {/* Title + Level */}
                    <div className="mb-3">
                        <h3 className="text-lg font-black text-base-content tracking-tight leading-tight mb-1">
                            {course.title}
                        </h3>
                        <p className="text-xs text-base-content/50 font-medium">{course.level}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {course.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-base-200/80 text-xs font-semibold text-base-content/60"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center flex-wrap gap-3 mb-4 text-xs text-base-content/50">
                        <span className="flex items-center gap-1 font-bold text-orange-500">
                            <Star className="w-3.5 h-3.5 fill-orange-500" />
                            {course.ratingAverage} ({course.ratingCount})
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {course.purchaseCount.toLocaleString()} đã mua
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.totalChapters} chương · {course.totalLessons} bài
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.estimatedDurationHours} giờ
                        </span>
                    </div>

                    {/* Content includes */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-base-200/50 mb-5">
                        <div className="flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-base-content/60">{course.totalVideos} video</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-base-300" />
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-bold text-base-content/60">{course.flashcards} flashcard</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-base-300" />
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-base-content/60">{course.totalDocuments} tài liệu</span>
                        </div>
                    </div>

                    {/* Pricing + Expert + CTA */}
                    <div className="mt-auto pt-4 border-t border-base-200 space-y-3">
                        {/* Price display */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-black ${course.isFree ? 'text-emerald-600' : 'text-base-content'}`}>
                                    {formatPrice(course.priceAmount)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-base-content/40 line-through font-semibold">
                                        {formatPrice(course.originalPrice)}
                                    </span>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`btn btn-sm bg-gradient-to-r ${course.gradient} text-white border-none rounded-xl font-bold shadow-md`}
                            >
                                {course.isFree ? 'Học miễn phí' : 'Mua ngay'}
                            </motion.button>
                        </div>

                        {/* Expert info */}
                        {expert && (
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={expert.avatar}
                                    alt={expert.name}
                                    className="w-7 h-7 rounded-full object-cover ring-2 ring-base-200"
                                />
                                <div>
                                    <p className="text-xs font-bold text-base-content leading-tight">{expert.name}</p>
                                    <p className="text-[10px] text-base-content/50 font-medium">{expert.speciality}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────

export default function ExpertCoursesSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <section id="expert-courses" className="py-28 bg-gradient-to-b from-base-100 via-base-200/30 to-base-100 relative overflow-hidden">
            {/* ── Background Decorations ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/8 to-purple-500/8 rounded-full blur-[120px]"
                    animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/8 to-cyan-500/8 rounded-full blur-[120px]"
                    animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 0.9, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 opacity-30"
                        style={{ left: `${15 + i * 14}%`, top: `${10 + (i % 3) * 25}%` }}
                        animate={{ y: [0, -25, 0], opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
                        transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* ── Section Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        >
                            <Award className="w-4 h-4 text-violet-500" />
                        </motion.div>
                        <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
                            Chuyên gia hàng đầu
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content mb-6 tracking-tight leading-tight">
                        Học tập cùng{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Chuyên gia
                            </span>
                            <motion.div
                                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-sm"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            />
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-3xl mx-auto font-medium leading-relaxed">
                        Khám phá kho tàng kiến thức được xây dựng bởi các giảng viên, tiến sĩ và chuyên gia hàng đầu, kèm theo hệ thống Flashcard thông minh giúp bạn ghi nhớ lâu dài.
                    </p>
                </motion.div>

                {/* ── Expert Avatars Row ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-violet-500" />
                            Chuyên Gia Nổi Bật
                        </h3>
                        <Link to="/experts" className="flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors group">
                            Xem tất cả
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {experts.map((expert, i) => (
                            <ExpertCard key={expert.id} expert={expert} index={i} />
                        ))}
                    </div>
                </motion.div>

                {/* ── Courses Heading ── */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        Môn Học Nổi Bật Từ Chuyên Gia
                    </h3>
                    <Link to="/courses" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                        Xem tất cả
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── Courses Grid ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                    {courses.map((course, i) => {
                        const expert = experts.find((e) => e.id === course.expertId);
                        return (
                            <CourseCard
                                key={course.id}
                                course={course}
                                expert={expert}
                                index={i}
                                variants={cardVariants}
                            />
                        );
                    })}
                </motion.div>

                {/* ── Explore All Button ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center mt-10"
                >
                    <Link to="/courses">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-lg bg-base-200 hover:bg-base-300 text-base-content border-2 border-base-300 hover:border-violet-500/30 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 gap-2 px-8"
                        >
                            <BookOpen className="w-5 h-5" />
                            Khám phá tất cả khóa học
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* ── Bottom CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16 relative"
                >
                    <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-3xl p-10 lg:p-14 overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                                animate={{ scale: [1.3, 1, 1.3], rotate: [90, 0, 90] }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                                    <TrendingUp className="w-5 h-5 text-white/80" />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-wider">Cộng đồng đang phát triển</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                                    Trở thành Chuyên gia trên SKR
                                </h3>
                                <p className="text-white/80 text-lg font-medium max-w-xl">
                                    Chia sẻ kiến thức, xây dựng thương hiệu cá nhân và tạo thu nhập bền vững từ các khóa học & bộ Flashcard chất lượng.
                                </p>

                                {/* Trust Stats */}
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-6">
                                    {[
                                        { value: '200+', label: 'Chuyên gia' },
                                        { value: '1,500+', label: 'Khóa học' },
                                        { value: '50K+', label: 'Học viên' },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center lg:text-left">
                                            <div className="text-2xl font-black text-white">{stat.value}</div>
                                            <div className="text-xs font-semibold text-white/60">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link to="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn btn-lg bg-white text-violet-700 hover:bg-white/90 border-none rounded-xl shadow-xl font-bold group px-8 w-full"
                                    >
                                        Đăng ký làm Chuyên gia
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </Link>
                                <Link to="/courses">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn btn-lg bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 rounded-xl font-bold px-8 w-full"
                                    >
                                        Khám phá khóa học
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

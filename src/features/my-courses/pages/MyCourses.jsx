import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Search,
    Bell,
    Star,
    BookMarked,
    Frown,
    GraduationCap,
    ArrowRight,
    Sparkles,
    BookOpen,
    Play,
    TrendingUp,
    Zap,
    ChevronRight,
    Clock,
    Trophy,
    Flame,
    Target,
    CalendarDays,
    BarChart3,
} from 'lucide-react';

import { DashboardSidebar } from '@/features/learner/components';
import {
    MyCourseCard,
    MyCourseListItem,
    MyCoursesToolbar,
} from '@/features/my-courses/components';
import { enrollmentApi } from '@/shared/api';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';
import { OwlLoader } from '@/shared/ui/common';

const LEARN_PROGRESS_STORAGE_KEY = 'skr-learn-course-progress-v1';

function safeParse(value, fallback) {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function clampPercent(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, Math.round(parsed)));
}

function toNonNegativeNumber(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return parsed;
}

function getProgressStorageEntryKey(courseId, userId) {
    return `${userId || 'anonymous'}:${courseId}`;
}

function readStoredProgressSnapshot(courseId, userId) {
    if (typeof window === 'undefined' || !courseId) return null;

    const store = safeParse(localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY), {});
    const stored = store[getProgressStorageEntryKey(courseId, userId)];

    if (Array.isArray(stored)) {
        return { completedLessons: stored.length };
    }

    if (Array.isArray(stored?.completedLessonIds)) {
        return { completedLessons: stored.completedLessonIds.length };
    }

    return null;
}

function deriveProgressPercent(completedLessons, totalLessons, fallbackPercent = 0) {
    const normalizedTotalLessons = toNonNegativeNumber(totalLessons);
    const normalizedCompletedLessons = toNonNegativeNumber(completedLessons);

    if (normalizedTotalLessons > 0) {
        return clampPercent((Math.min(normalizedCompletedLessons, normalizedTotalLessons) / normalizedTotalLessons) * 100);
    }

    return clampPercent(fallbackPercent);
}

// ─── Helper: map API enrollment item to component format ──
function mapEnrollmentItem(item, userId) {
    const courseId = item.courseId || item.subjectId || item.course?.courseId || item.course?.id || null;
    const totalLessons = toNonNegativeNumber(item.totalLessons);
    const storedProgress = readStoredProgressSnapshot(courseId, userId);
    const apiCompletedLessons = toNonNegativeNumber(item.completedLessons, NaN);
    const completedLessons = storedProgress?.completedLessons != null
        ? Math.min(toNonNegativeNumber(storedProgress.completedLessons), totalLessons || Number.MAX_SAFE_INTEGER)
        : Number.isFinite(apiCompletedLessons)
            ? Math.min(apiCompletedLessons, totalLessons || Number.MAX_SAFE_INTEGER)
            : 0;
    const progressPercent = deriveProgressPercent(
        completedLessons,
        totalLessons,
        item.progressPercent ?? item.progress ?? 0,
    );

    return {
        id: item.enrollmentId || item.id,
        courseId,
        title: item.courseName || item.title,
        instructorName: item.instructorName,
        bannerUrl: item.bannerUrl,
        progressPercent,
        completedLessons,
        totalLessons,
        totalChapters: item.totalChapters ?? 0,
        estimatedDurationHours: item.estimatedDurationHours ?? 0,
        ratingAverage: item.ratingAverage ?? 0,
        ratingCount: item.ratingCount ?? 0,
        enrolledAt: item.purchasedAt || item.enrolledAt || item.createdAt,
        lastAccessedAt: item.lastAccessedAt,
    };
}

// ─── Helpers ──────────────────────────────────────────────

function computeStats(enrollments) {
    const totalCourses = enrollments.length;
    const completed = enrollments.filter((e) => (e.progressPercent ?? 0) >= 100).length;
    const inProgress = enrollments.filter(
        (e) => (e.progressPercent ?? 0) > 0 && (e.progressPercent ?? 0) < 100
    ).length;
    const totalHours = enrollments.reduce(
        (sum, e) => sum + (e.estimatedDurationHours || 0),
        0
    );
    const totalLessons = enrollments.reduce(
        (sum, e) => sum + (e.completedLessons || 0),
        0
    );
    return { totalCourses, completed, inProgress, totalHours, totalLessons };
}

function filterByStatus(enrollments, status) {
    switch (status) {
        case 'in-progress':
            return enrollments.filter(
                (e) => (e.progressPercent ?? 0) > 0 && (e.progressPercent ?? 0) < 100
            );
        case 'completed':
            return enrollments.filter((e) => (e.progressPercent ?? 0) >= 100);
        case 'not-started':
            return enrollments.filter((e) => (e.progressPercent ?? 0) === 0);
        default:
            return enrollments;
    }
}

function filterBySearch(enrollments, query) {
    if (!query) return enrollments;
    const q = query.toLowerCase();
    return enrollments.filter((e) => {
        const searchable = [e.title, e.instructorName].join(' ').toLowerCase();
        return searchable.includes(q);
    });
}

function sortEnrollments(enrollments, sortBy) {
    const sorted = [...enrollments];
    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'progress':
            return sorted.sort(
                (a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0)
            );
        case 'recent':
        default:
            return sorted.sort(
                (a, b) =>
                    new Date(b.lastAccessedAt || b.enrolledAt || 0) -
                    new Date(a.lastAccessedAt || a.enrolledAt || 0)
            );
    }
}

// ─── Animation Variants ───────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

// ─── Quick-Resume Card (for "Tiếp tục học" section) ──────

function QuickResumeCard({ enrollment }) {
    const progressPercent = enrollment.progressPercent ?? 0;

    return (
        <Link to={`/courses/${enrollment.courseId || enrollment.id}/learn`} className="block h-full">
            <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative group cursor-pointer h-full"
            >
                {/* Outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500" />

                <div className="relative bg-base-100 rounded-2xl border border-base-300/50 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 h-full">
                    <div className="flex items-stretch h-24">
                        {/* Image */}
                        <div className="relative w-28 sm:w-36 flex-shrink-0 overflow-hidden">
                            <img
                                src={enrollment.bannerUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop'}
                                alt={enrollment.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-base-100/20" />
                            {/* Accent stripe */}
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-purple-500" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3.5 flex flex-col justify-center min-w-0">
                            <h4 className="text-[13px] font-bold text-base-content line-clamp-1 mb-1 tracking-tight">
                                {enrollment.title}
                            </h4>
                            <p className="text-[11px] text-base-content/40 font-medium mb-2 line-clamp-1">
                                {enrollment.instructorName}
                            </p>

                            {/* Progress */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex-1 h-1.5 bg-base-200/80 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full" />
                                    </motion.div>
                                </div>
                                <span className="text-[11px] font-bold text-violet-600 tabular-nums flex-shrink-0">
                                    {progressPercent}%
                                </span>
                            </div>
                        </div>

                        {/* Play button */}
                        <div className="flex items-center px-3 flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                <Play className="w-4 h-4 text-white ml-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// ─── Hero Section ─────────────────────────────────────────

function HeroSection({ stats, userName = 'Người dùng', avatarUrl = '', isPremium = false }) {
    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    })();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 rounded-2xl p-5 lg:p-6"
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative">
                {/* Top row: greeting + actions */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-blue-300/60 text-xs font-medium">{greeting}</span>
                            <Sparkles className="w-3 h-3 text-amber-400/60" />
                        </div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-1">
                            Khóa Học Của Tôi
                        </h1>
                        <p className="text-sm text-blue-200/40 font-medium">
                            Quản lý và theo dõi hành trình học tập của bạn
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Notification */}
                        <div className="relative">
                            <button className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
                                <Bell className="w-4 h-4 text-white/60" />
                            </button>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">3</span>
                            </span>
                        </div>
                        {/* Profile */}
                        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="font-semibold text-xs text-white/90 leading-tight">{userName}</p>
                                {isPremium && (
                                    <div className="flex items-center justify-end gap-1">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span className="text-[10px] text-amber-400 font-semibold">Premium</span>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={userName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-white/10 text-[11px] font-black text-white">
                                            {getUserInitials(userName)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats cards row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        {
                            icon: BookMarked,
                            label: 'Tổng khóa học',
                            value: stats.totalCourses,
                            gradient: 'from-blue-500 to-cyan-400',
                            iconBg: 'bg-blue-500/20',
                        },
                        {
                            icon: TrendingUp,
                            label: 'Đang học',
                            value: stats.inProgress,
                            gradient: 'from-violet-500 to-purple-400',
                            iconBg: 'bg-violet-500/20',
                        },
                        {
                            icon: Trophy,
                            label: 'Hoàn thành',
                            value: stats.completed,
                            gradient: 'from-emerald-500 to-teal-400',
                            iconBg: 'bg-emerald-500/20',
                        },
                        {
                            icon: Clock,
                            label: 'Giờ học tập',
                            value: `${stats.totalHours}h`,
                            gradient: 'from-amber-500 to-orange-400',
                            iconBg: 'bg-amber-500/20',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                            className="group relative bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-3.5 transition-all duration-300 cursor-default"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-4 h-4 text-white/80" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-0.5">
                                        {stat.label}
                                    </p>
                                    <p className="text-lg font-bold text-white tracking-tight leading-none">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Page Component ───────────────────────────────────────

export default function MyCourses() {
    const [enrollmentItems, setEnrollmentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const { profile } = useCurrentUserProfile();
    const enrollments = useMemo(
        () => enrollmentItems.map((item) => mapEnrollmentItem(item, profile?.userId)),
        [enrollmentItems, profile?.userId],
    );

    // Fetch enrollments from real API
    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await enrollmentApi.getMyEnrollments();
                const items = response.data?.items || response.data || [];
                setEnrollmentItems(items);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
                setEnrollmentItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    // Stats
    const stats = useMemo(() => computeStats(enrollments), [enrollments]);

    // Filter + search + sort pipeline
    const displayedCourses = useMemo(() => {
        let result = filterByStatus(enrollments, statusFilter);
        result = filterBySearch(result, searchQuery);
        result = sortEnrollments(result, sortBy);
        return result;
    }, [enrollments, statusFilter, searchQuery, sortBy]);

    // Continue learning section
    const continueLearnCourses = useMemo(() => {
        return enrollments
            .filter((e) => (e.progressPercent ?? 0) > 0 && (e.progressPercent ?? 0) < 100)
            .sort(
                (a, b) =>
                    new Date(b.lastAccessedAt || 0) - new Date(a.lastAccessedAt || 0)
            )
            .slice(0, 3);
    }, [enrollments]);

    return (
        <div className="flex h-dvh bg-base-200/50 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Content — single continuous flow */}
                <motion.main
                    className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:py-6 sm:pb-24 lg:px-8 lg:pb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section with Stats */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <HeroSection
                            stats={stats}
                            userName={profile.name}
                            avatarUrl={profile.avatarUrl}
                            isPremium={profile.isPremium}
                        />
                    </motion.div>

                    {/* Loading */}
                    {loading && <OwlLoader message="Đang tải khóa học của bạn..." />}

                    {/* Error */}
                    {!loading && error && (
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col items-center justify-center py-12 text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                                <Frown className="w-7 h-7 text-red-400" />
                            </div>
                            <h3 className="text-base font-bold text-base-content mb-1.5">
                                Lỗi tải dữ liệu
                            </h3>
                            <p className="text-sm text-base-content/50 font-medium mb-4 max-w-sm">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                            >
                                Thử lại
                            </button>
                        </motion.div>
                    )}

                    {/* Main content */}
                    {!loading && !error && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Toolbar */}
                            <motion.div variants={fadeInUp} className="mb-6">
                                <MyCoursesToolbar
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    statusFilter={statusFilter}
                                    onStatusChange={setStatusFilter}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                    viewMode={viewMode}
                                    onViewChange={setViewMode}
                                    totalCourses={displayedCourses.length}
                                />
                            </motion.div>

                            {/* Continue Learning (compact, only when default view) */}
                            {statusFilter === 'all' &&
                                !searchQuery &&
                                continueLearnCourses.length > 0 && (
                                    <motion.div variants={fadeInUp} className="mb-6">
                                        <div className="bg-gradient-to-br from-violet-500/[0.03] to-purple-500/[0.05] rounded-2xl border border-violet-500/10 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
                                                        <Zap className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <h2 className="text-sm font-bold text-base-content tracking-tight">
                                                        Tiếp tục học
                                                    </h2>
                                                </div>
                                                <span className="text-[11px] font-semibold text-violet-500">
                                                    {continueLearnCourses.length} khóa học
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {continueLearnCourses.map((enrollment) => (
                                                    <QuickResumeCard
                                                        key={`continue-${enrollment.id}`}
                                                        enrollment={enrollment}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            {/* Course Grid / List */}
                            {displayedCourses.length > 0 ? (
                                <motion.div
                                    key={viewMode + sortBy + statusFilter + searchQuery}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5'
                                            : 'space-y-4'
                                    }
                                >
                                    {displayedCourses.map((enrollment) =>
                                        viewMode === 'grid' ? (
                                            <MyCourseCard
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                variants={cardVariants}
                                            />
                                        ) : (
                                            <MyCourseListItem
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                variants={cardVariants}
                                            />
                                        )
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={fadeInUp}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
                                        <Frown className="w-7 h-7 text-base-content/25" />
                                    </div>
                                    <h3 className="text-base font-bold text-base-content mb-1.5">
                                        Không tìm thấy khóa học
                                    </h3>
                                    <p className="text-sm text-base-content/50 font-medium mb-4 max-w-sm">
                                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                        }}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </motion.div>
                            )}

                            {/* Empty state */}
                            {enrollments.length === 0 && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                    <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-500/8 to-violet-500/8 flex items-center justify-center mb-5 border border-blue-500/15">
                                        <BookOpen className="w-9 h-9 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-base-content mb-2">
                                        Bạn chưa có khóa học nào
                                    </h3>
                                    <p className="text-sm text-base-content/50 font-medium mb-5 max-w-md">
                                        Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia
                                        hàng đầu và bắt đầu hành trình học tập của bạn ngay hôm nay!
                                    </p>
                                    <Link to="/courses">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                                        >
                                            Khám phá khóa học
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            )}

                            {/* CTA: Explore more */}
                            {enrollments.length > 0 && (
                                <motion.div variants={fadeInUp} className="mt-6 mb-2">
                                    <div className="relative overflow-hidden bg-base-100 rounded-2xl border border-base-300/50 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-violet-500/8 rounded-full blur-3xl pointer-events-none" />
                                        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md flex-shrink-0">
                                                    <GraduationCap className="w-4.5 h-4.5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-base-content">
                                                        Muốn học thêm?
                                                    </h3>
                                                    <p className="text-xs text-base-content/50 font-medium">
                                                        Khám phá thêm các khóa học mới từ các chuyên gia hàng đầu.
                                                    </p>
                                                </div>
                                            </div>
                                            <Link to="/courses" className="flex-shrink-0">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all"
                                                >
                                                    Xem tất cả
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </motion.button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </motion.main>
            </div>
        </div>
    );
}

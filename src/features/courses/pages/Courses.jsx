import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Search,
    Bell,
    Star,
    BookOpen,
    Frown,
    GraduationCap,
    ArrowRight,
    Loader2
} from 'lucide-react';

import { DashboardSidebar } from '@/features/learner/components';
import { CoursesToolbar, CourseCard, CourseListItem } from '@/features/courses/components';
import { subjectApi } from '@/shared/api';

// ─── Map API data to component format ──────────────────────

const mapApiToCourse = (subject) => ({
    id: subject.subjectId,
    subjectId: subject.subjectId,
    title: subject.subjectName,
    subjectName: subject.subjectName,
    description: subject.subjectDescription,
    category: subject.subjectName?.split(' ')[0] || 'Khác',
    isFree: subject.isFree,
    priceAmount: subject.priceAmount,
    originalPrice: subject.originalPrice,
    discountPercent: subject.discountPercent,
    ratingAverage: subject.ratingAverage,
    ratingCount: subject.ratingCount,
    purchaseCount: subject.purchaseCount,
    totalChapters: subject.totalChapters,
    totalLessons: subject.totalLessons,
    totalVideos: subject.totalVideos,
    totalDocuments: subject.totalDocuments,
    totalQuestions: subject.totalQuestions,
    estimatedDurationHours: subject.estimatedDurationHours,
    level: 'Cơ bản',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    icon: '📚',
    tags: [],
    bannerUrl: subject.subjectBannerUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
    visibility: subject.status === 'published' ? 'public' : 'draft',
    isPurchased: false,
    publishedAt: subject.publishedAt,
});

const mapApiToExpert = (creator) => {
    if (!creator) return null;
    return {
        id: creator.userId,
        userId: creator.userId,
        name: creator.displayName || creator.fullName || 'Chuyên gia',
        displayName: creator.displayName,
        fullName: creator.fullName,
        avatar: creator.avatarUrl || 'https://i.pravatar.cc/150?img=11',
        verified: true,
    };
};

// ─── Categories & Levels (static for now) ────────────────

const categories = [
    { value: 'Toán học', label: 'Toán học', icon: '📐' },
    { value: 'Ngôn ngữ', label: 'Ngôn ngữ', icon: '🌐' },
    { value: 'Lập trình', label: 'Lập trình', icon: '💻' },
    { value: 'Khoa học', label: 'Khoa học', icon: '🔬' },
    { value: 'Kinh tế', label: 'Kinh tế', icon: '📊' },
];

const levels = [
    { value: 'Cơ bản', label: 'Cơ bản' },
    { value: 'Trung bình', label: 'Trung bình' },
    { value: 'Nâng cao', label: 'Nâng cao' },
];

const defaultFilters = {
    category: '',
    priceRange: 'all',
    minRating: 0,
    level: '',
};

// ─── Filtering & Sorting ────────────────────────────────

function filterCourses(courses, filters, searchQuery) {
    return courses.filter(course => {
        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchable = [
                course.title, course.category, course.level,
            ].join(' ').toLowerCase();
            if (!searchable.includes(q)) return false;
        }
        // Category
        if (filters.category && course.category !== filters.category) return false;
        // Price
        if (filters.priceRange !== 'all') {
            switch (filters.priceRange) {
                case 'free': if (!course.isFree) return false; break;
                case 'under200': if (course.isFree || course.priceAmount >= 200000) return false; break;
                case '200to500': if (course.isFree || course.priceAmount < 200000 || course.priceAmount > 500000) return false; break;
                case 'above500': if (course.isFree || course.priceAmount <= 500000) return false; break;
            }
        }
        // Rating
        if (filters.minRating > 0 && course.ratingAverage < filters.minRating) return false;
        // Level
        if (filters.level && course.level !== filters.level) return false;

        return true;
    });
}

function sortCourses(courses, sortBy) {
    const sorted = [...courses];
    switch (sortBy) {
        case 'popular': return sorted.sort((a, b) => b.purchaseCount - a.purchaseCount);
        case 'newest': return sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        case 'price_asc': return sorted.sort((a, b) => a.priceAmount - b.priceAmount);
        case 'price_desc': return sorted.sort((a, b) => b.priceAmount - a.priceAmount);
        case 'rating': return sorted.sort((a, b) => b.ratingAverage - a.ratingAverage);
        default: return sorted;
    }
}

// ─── Page Component (Dashboard Layout) ──────────────────

export default function Courses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState(defaultFilters);
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch subjects from API
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await subjectApi.getAll({ limit: 100 });
                const items = response.data?.items || response.data || [];
                setSubjects(items.map(mapApiToCourse));
            } catch (err) {
                console.error('Error fetching subjects:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category) count++;
        if (filters.priceRange !== 'all') count++;
        if (filters.minRating > 0) count++;
        if (filters.level) count++;
        return count;
    }, [filters]);

    // Filter + sort
    const filteredCourses = useMemo(() => {
        return sortCourses(filterCourses(subjects, filters, searchQuery), sortBy);
    }, [subjects, filters, searchQuery, sortBy]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setSearchQuery('');
    };

    // Animation variants (same as Dashboard)
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
            opacity: 1, y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    };

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <CoursesPageHeader />

                {/* Content */}
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Page Title */}
                    <motion.div variants={cardVariants} className="mb-6">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-base-content tracking-tight">Danh Sách Môn Học</h1>
                                <p className="text-sm text-base-content/60 font-medium">
                                    Khám phá tất cả khóa học từ các chuyên gia hàng đầu
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Toolbar: Search + Filter + Sort + View */}
                    <motion.div variants={cardVariants} className="mb-6">
                        <CoursesToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onResetFilters={handleResetFilters}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            viewMode={viewMode}
                            onViewChange={setViewMode}
                            totalCourses={filteredCourses.length}
                            activeFilterCount={activeFilterCount}
                            categories={categories}
                            levels={levels}
                        />
                    </motion.div>

                    {/* Loading State */}
                    {loading && (
                        <motion.div
                            variants={cardVariants}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-sm text-base-content/50 font-medium">Đang tải dữ liệu...</p>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <motion.div
                            variants={cardVariants}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
                                <Frown className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-base-content mb-2">Lỗi tải dữ liệu</h3>
                            <p className="text-sm text-base-content/50 font-medium mb-5 max-w-sm">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold"
                            >
                                Thử lại
                            </button>
                        </motion.div>
                    )}

                    {/* Course Grid / List */}
                    {!loading && !error && filteredCourses.length > 0 ? (
                        <motion.div
                            key={viewMode + sortBy + JSON.stringify(filters) + searchQuery}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5'
                                    : 'space-y-4'
                            }
                        >
                            {filteredCourses.map((course) => {
                                const expert = mapApiToExpert(course.creator);
                                return viewMode === 'grid' ? (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        expert={expert}
                                        variants={cardVariants}
                                    />
                                ) : (
                                    <CourseListItem
                                        key={course.id}
                                        course={course}
                                        expert={expert}
                                        variants={cardVariants}
                                    />
                                );
                            })}
                        </motion.div>
                    ) : (
                        /* Empty state */
                        !loading && !error && (
                            <motion.div
                                variants={cardVariants}
                                className="flex flex-col items-center justify-center py-16 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-5">
                                    <Frown className="w-8 h-8 text-base-content/30" />
                                </div>
                                <h3 className="text-lg font-black text-base-content mb-2">Không tìm thấy môn học</h3>
                                <p className="text-sm text-base-content/50 font-medium mb-5 max-w-sm">
                                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white border-none rounded-xl font-bold"
                                >
                                    Xóa bộ lọc
                                </button>
                            </motion.div>
                        )
                    )}

                    {/* CTA: Become Expert */}
                    {!loading && !error && filteredCourses.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            className="mt-10"
                        >
                            <div className="bg-base-100 rounded-2xl border border-base-300 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-base-content">Bạn là chuyên gia?</h3>
                                        <p className="text-sm text-base-content/50 font-medium">
                                            Chia sẻ kiến thức, tạo thu nhập bền vững trên SKR.
                                        </p>
                                    </div>
                                </div>
                                <Link to="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn btn-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-none rounded-xl font-bold shadow-lg gap-1"
                                    >
                                        Đăng ký làm Chuyên Gia
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </motion.main>
            </div>
        </div>
    );
}

// ─── Header (same pattern as Dashboard.Header) ──────────

function CoursesPageHeader() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-base-100 border-b border-base-300 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">Môn Học</h2>
                    <p className="text-sm text-base-content/60 font-medium">Khám phá và đăng ký khóa học mới</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-96 pl-10 rounded-full bg-base-200 border-base-300 focus:border-blue-500"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    {/* Notifications */}
                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-base-300">
                        <div className="text-right">
                            <p className="font-bold text-sm text-base-content">Đoàn Thế Anh</p>
                            <div className="flex items-center justify-end gap-1">
                                <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                <p className="text-xs text-orange-500 font-bold">Premium User</p>
                            </div>
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                <img src="https://i.pravatar.cc/150?img=33" alt="User" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

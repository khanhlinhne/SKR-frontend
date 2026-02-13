import { useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Link } from 'react-router-dom';
import {
    Search,
    Bell,
    Star,
    BookOpen,
    Frown,
    GraduationCap,
    ArrowRight,
    Sparkles
} from 'lucide-react';

import { DashboardSidebar } from '../components/learner';
import { CoursesToolbar, CourseCard, CourseListItem } from '../components/courses';

// ─── Mock Data (maps to mst_users → experts) ───────────

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
        name: 'TS. Đoàn Thế Anh',
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
    {
        id: 5,
        name: 'ThS. Lê Hoàng Nam',
        title: 'Thạc sĩ Kinh tế - ĐH Kinh tế TP.HCM',
        avatar: 'https://i.pravatar.cc/150?img=60',
        rating: 4.6,
        students: 5400,
        courses: 4,
        verified: true,
        speciality: 'Kinh tế',
    },
];

// ─── Mock Courses (maps to mst_subjects) ────────────────

const allCourses = [
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
        bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2025-12-01',
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
        level: 'Trung bình',
        gradient: 'from-emerald-500 to-teal-500',
        bgGradient: 'from-emerald-500/10 to-teal-500/10',
        icon: '🇬🇧',
        tags: ['Reading', 'Writing', 'Speaking'],
        flashcards: 1200,
        bannerUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: true,
        publishedAt: '2025-11-15',
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
        level: 'Cơ bản',
        gradient: 'from-violet-500 to-purple-500',
        bgGradient: 'from-violet-500/10 to-purple-500/10',
        icon: '🐍',
        tags: ['Python', 'Machine Learning', 'Deep Learning'],
        flashcards: 680,
        bannerUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2026-01-10',
    },
    {
        id: 4,
        title: 'Nhập Môn Cơ Sở Dữ Liệu',
        expertId: 3,
        category: 'Lập trình',
        isFree: true,
        priceAmount: 0,
        originalPrice: 0,
        discountPercent: 0,
        ratingAverage: 4.7,
        ratingCount: 245,
        purchaseCount: 8900,
        totalChapters: 8,
        totalLessons: 32,
        totalVideos: 24,
        totalDocuments: 10,
        totalQuestions: 150,
        estimatedDurationHours: 20,
        level: 'Cơ bản',
        gradient: 'from-amber-500 to-orange-500',
        bgGradient: 'from-amber-500/10 to-orange-500/10',
        icon: '💾',
        tags: ['SQL', 'ERD', 'Normalization'],
        flashcards: 320,
        bannerUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2026-01-20',
    },
    {
        id: 5,
        title: 'Vật Lý Đại Cương - Cơ Học & Nhiệt',
        expertId: 4,
        category: 'Khoa học',
        isFree: false,
        priceAmount: 249000,
        originalPrice: 349000,
        discountPercent: 29,
        ratingAverage: 4.6,
        ratingCount: 178,
        purchaseCount: 2100,
        totalChapters: 10,
        totalLessons: 40,
        totalVideos: 30,
        totalDocuments: 12,
        totalQuestions: 180,
        estimatedDurationHours: 28,
        level: 'Trung bình',
        gradient: 'from-rose-500 to-pink-500',
        bgGradient: 'from-rose-500/10 to-pink-500/10',
        icon: '⚛️',
        tags: ['Newton', 'Nhiệt động', 'Sóng'],
        flashcards: 280,
        bannerUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2025-10-05',
    },
    {
        id: 6,
        title: 'Kinh Tế Vĩ Mô Nâng Cao',
        expertId: 5,
        category: 'Kinh tế',
        isFree: false,
        priceAmount: 449000,
        originalPrice: 649000,
        discountPercent: 31,
        ratingAverage: 4.5,
        ratingCount: 134,
        purchaseCount: 1800,
        totalChapters: 11,
        totalLessons: 44,
        totalVideos: 33,
        totalDocuments: 16,
        totalQuestions: 220,
        estimatedDurationHours: 35,
        level: 'Nâng cao',
        gradient: 'from-indigo-500 to-sky-500',
        bgGradient: 'from-indigo-500/10 to-sky-500/10',
        icon: '📊',
        tags: ['GDP', 'Lạm phát', 'Chính sách'],
        flashcards: 360,
        bannerUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2025-09-15',
    },
    {
        id: 7,
        title: 'React & Next.js - Fullstack Web Development',
        expertId: 3,
        category: 'Lập trình',
        isFree: false,
        priceAmount: 699000,
        originalPrice: 999000,
        discountPercent: 30,
        ratingAverage: 4.9,
        ratingCount: 432,
        purchaseCount: 5100,
        totalChapters: 18,
        totalLessons: 72,
        totalVideos: 60,
        totalDocuments: 22,
        totalQuestions: 350,
        estimatedDurationHours: 55,
        level: 'Nâng cao',
        gradient: 'from-cyan-500 to-blue-500',
        bgGradient: 'from-cyan-500/10 to-blue-500/10',
        icon: '⚛️',
        tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
        flashcards: 520,
        bannerUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
        visibility: 'premium_only',
        isPurchased: false,
        publishedAt: '2026-02-01',
    },
    {
        id: 8,
        title: 'Luyện Thi TOEIC 800+ - Chiến Lược Toàn Diện',
        expertId: 2,
        category: 'Ngôn ngữ',
        isFree: false,
        priceAmount: 349000,
        originalPrice: 499000,
        discountPercent: 30,
        ratingAverage: 4.7,
        ratingCount: 289,
        purchaseCount: 3200,
        totalChapters: 12,
        totalLessons: 48,
        totalVideos: 40,
        totalDocuments: 20,
        totalQuestions: 400,
        estimatedDurationHours: 38,
        level: 'Trung bình',
        gradient: 'from-teal-500 to-emerald-500',
        bgGradient: 'from-teal-500/10 to-emerald-500/10',
        icon: '📝',
        tags: ['Listening', 'Reading', 'Grammar'],
        flashcards: 900,
        bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: true,
        publishedAt: '2025-12-20',
    },
    {
        id: 9,
        title: 'Xác Suất Thống Kê Ứng Dụng',
        expertId: 1,
        category: 'Toán học',
        isFree: true,
        priceAmount: 0,
        originalPrice: 0,
        discountPercent: 0,
        ratingAverage: 4.5,
        ratingCount: 156,
        purchaseCount: 6700,
        totalChapters: 6,
        totalLessons: 24,
        totalVideos: 18,
        totalDocuments: 8,
        totalQuestions: 120,
        estimatedDurationHours: 16,
        level: 'Cơ bản',
        gradient: 'from-fuchsia-500 to-pink-500',
        bgGradient: 'from-fuchsia-500/10 to-pink-500/10',
        icon: '🎲',
        tags: ['Xác suất', 'Phân phối', 'Kiểm định'],
        flashcards: 200,
        bannerUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop',
        visibility: 'public',
        isPurchased: false,
        publishedAt: '2026-01-28',
    },
];

// ─── Categories & Levels ────────────────────────────────

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
            const expert = experts.find(e => e.id === course.expertId);
            const searchable = [
                course.title, course.category, course.level,
                ...course.tags,
                expert?.name || '', expert?.speciality || '',
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
        return sortCourses(filterCourses(allCourses, filters, searchQuery), sortBy);
    }, [filters, searchQuery, sortBy]);

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

                    {/* Course Grid / List */}
                    {filteredCourses.length > 0 ? (
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
                                const expert = experts.find(e => e.id === course.expertId);
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
                    )}

                    {/* CTA: Become Expert */}
                    {filteredCourses.length > 0 && (
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

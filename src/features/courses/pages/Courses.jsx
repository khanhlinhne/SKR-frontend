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
    ThumbsUp,
    Gift,
    Flame,
} from 'lucide-react';

import { DashboardSidebar } from '@/features/learner/components';
import { CoursesToolbar, CourseCard, CourseListItem } from '@/features/courses/components';
import { subjectApi } from '@/shared/api';
import { useCurrentUserProfile, getUserInitials } from '@/shared/user';
import { OwlLoader } from '@/shared/ui/common';

const mapApiToCourse = (subject) => {
    const priceAmount = Number(subject.priceAmount) || 0;
    const isFree = subject.isFree || priceAmount === 0;

    return {
        id: subject.subjectId,
        subjectId: subject.subjectId,
        title: subject.subjectName,
        subjectName: subject.subjectName,
        description: subject.subjectDescription,
        category: subject.subjectName?.split(' ')[0] || 'Khác',
        isFree,
        priceAmount,
        originalPrice: Number(subject.originalPrice) || 0,
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
        creator: subject.creator,
    };
};

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

const MOCK_DEMO_COURSE = {
    id: 1,
    subjectId: 1,
    title: 'Toán Cao Cấp - Giải Tích & Đại Số',
    subjectName: 'Toán Cao Cấp - Giải Tích & Đại Số',
    description: 'Khóa học toán cao cấp toàn diện dành cho sinh viên đại học.',
    category: 'Toán học',
    isFree: true,
    priceAmount: 0,
    originalPrice: 0,
    discountPercent: 0,
    ratingAverage: 4.9,
    ratingCount: 1248,
    purchaseCount: 3420,
    totalChapters: 12,
    totalLessons: 48,
    totalVideos: 36,
    totalDocuments: 8,
    totalQuestions: 120,
    estimatedDurationHours: 24,
    level: 'Cơ bản -> Nâng cao',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    icon: '📐',
    tags: ['Đạo hàm', 'Tích phân', 'Ma trận', 'Giới hạn'],
    bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
    visibility: 'public',
    isPurchased: false,
    publishedAt: '2024-01-15T00:00:00Z',
    creator: {
        userId: 'expert-1',
        displayName: 'TS. Nguyễn Văn Minh',
        fullName: 'TS. Nguyễn Văn Minh',
        avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
};

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

function filterCourses(courses, filters, searchQuery) {
    return courses.filter((course) => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchable = [course.title, course.category, course.level].join(' ').toLowerCase();
            if (!searchable.includes(q)) return false;
        }

        if (filters.category && course.category !== filters.category) return false;

        if (filters.priceRange !== 'all') {
            switch (filters.priceRange) {
                case 'free':
                    if (!course.isFree) return false;
                    break;
                case 'under200':
                    if (course.isFree || course.priceAmount >= 200000) return false;
                    break;
                case '200to500':
                    if (course.isFree || course.priceAmount < 200000 || course.priceAmount > 500000) return false;
                    break;
                case 'above500':
                    if (course.isFree || course.priceAmount <= 500000) return false;
                    break;
            }
        }

        if (filters.minRating > 0 && course.ratingAverage < filters.minRating) return false;
        if (filters.level && course.level !== filters.level) return false;

        return true;
    });
}

function sortCourses(courses, sortBy) {
    const sorted = [...courses];

    switch (sortBy) {
        case 'popular':
            return sorted.sort((a, b) => b.purchaseCount - a.purchaseCount);
        case 'newest':
            return sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        case 'price_asc':
            return sorted.sort((a, b) => a.priceAmount - b.priceAmount);
        case 'price_desc':
            return sorted.sort((a, b) => b.priceAmount - a.priceAmount);
        case 'rating':
            return sorted.sort((a, b) => b.ratingAverage - a.ratingAverage);
        default:
            return sorted;
    }
}

export default function Courses({
    layout = 'dashboard',
    initialShowAll = false,
    showHighlightSections = true,
}) {
    const isPublicLayout = layout === 'public';
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState(defaultFilters);
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(initialShowAll);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await subjectApi.getAll({ limit: 100 });
                const items = response.data?.items || response.data || [];
                const apiCourses = items.map(mapApiToCourse);
                setSubjects(apiCourses);
            } catch (err) {
                console.error('Error fetching subjects:', err);
                setError(err.message);
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.category) count++;
        if (filters.priceRange !== 'all') count++;
        if (filters.minRating > 0) count++;
        if (filters.level) count++;
        return count;
    }, [filters]);

    const filteredCourses = useMemo(
        () => sortCourses(filterCourses(subjects, filters, searchQuery), sortBy),
        [subjects, filters, searchQuery, sortBy]
    );

    const topSellers = useMemo(
        () => [...subjects].sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 4),
        [subjects]
    );

    const topRated = useMemo(
        () => [...subjects]
            .filter((course) => course.ratingAverage > 0)
            .sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount)
            .slice(0, 4),
        [subjects]
    );

    const freeCourses = useMemo(
        () => [...subjects].filter((course) => course.isFree).sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 4),
        [subjects]
    );

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setSearchQuery('');
    };

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

    const pageContent = (
        <>
            <motion.div variants={cardVariants} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-base-content">Danh Sách Môn Học</h1>
                        <p className="text-sm font-medium text-base-content/60">
                            Khám phá tất cả khóa học từ các chuyên gia hàng đầu
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={cardVariants} className="mb-8">
                <CoursesToolbar
                    searchQuery={searchQuery}
                    onSearchChange={(value) => {
                        setSearchQuery(value);
                        setShowAll(true);
                    }}
                    filters={filters}
                    onFilterChange={(key, value) => {
                        handleFilterChange(key, value);
                        setShowAll(true);
                    }}
                    onResetFilters={() => {
                        handleResetFilters();
                        setShowAll(true);
                    }}
                    sortBy={sortBy}
                    onSortChange={(value) => {
                        setSortBy(value);
                        setShowAll(true);
                    }}
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                    totalCourses={filteredCourses.length}
                    activeFilterCount={activeFilterCount}
                    categories={categories}
                    levels={levels}
                />
            </motion.div>

            {loading && <OwlLoader message="Đang tải môn học..." />}

            {!loading && error && (
                <motion.div variants={cardVariants} className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <Frown className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-base-content">Lỗi tải dữ liệu</h3>
                    <p className="mb-5 max-w-sm text-sm font-medium text-base-content/50">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white"
                    >
                        Thử lại
                    </button>
                </motion.div>
            )}

            {!loading && !error && showAll && filteredCourses.length > 0 && (
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight text-base-content">
                            Kết quả tìm kiếm
                            <span className="ml-2 text-sm font-medium text-base-content/50">
                                ({filteredCourses.length} môn học)
                            </span>
                        </h2>
                        {showHighlightSections && (
                            <button
                                onClick={() => setShowAll(false)}
                                className="btn btn-sm btn-ghost gap-1 font-bold text-base-content/50"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Ẩn bớt
                            </button>
                        )}
                    </div>
                    <motion.div
                        key={viewMode + sortBy + JSON.stringify(filters) + searchQuery}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                                : 'space-y-4'
                        }
                    >
                        {filteredCourses.map((course) => {
                            const expert = mapApiToExpert(course.creator);
                            return viewMode === 'grid' ? (
                                <CourseCard key={course.id} course={course} expert={expert} variants={cardVariants} />
                            ) : (
                                <CourseListItem key={course.id} course={course} expert={expert} variants={cardVariants} />
                            );
                        })}
                    </motion.div>
                </div>
            )}

            {!loading && !error && showAll && filteredCourses.length === 0 && (
                <motion.div variants={cardVariants} className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-base-300">
                        <Frown className="h-8 w-8 text-base-content/30" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-base-content">Không tìm thấy môn học</h3>
                    <p className="mb-5 max-w-sm text-sm font-medium text-base-content/50">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.
                    </p>
                    <button
                        onClick={() => {
                            handleResetFilters();
                            setShowAll(false);
                        }}
                        className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white"
                    >
                        Xóa bộ lọc
                    </button>
                </motion.div>
            )}

            {!loading && !error && showHighlightSections && !showAll && subjects.length > 0 && (
                <div className="mb-8 space-y-8">
                    <CategorySection
                        title="Top Bán Chạy"
                        icon={<Flame className="h-5 w-5" />}
                        iconBg="from-orange-500 to-red-500"
                        courses={topSellers}
                        mapApiToExpert={mapApiToExpert}
                        containerVariants={containerVariants}
                        cardVariants={cardVariants}
                    />

                    <CategorySection
                        title="Top Đánh Giá Cao"
                        icon={<ThumbsUp className="h-5 w-5" />}
                        iconBg="from-violet-500 to-purple-500"
                        courses={topRated}
                        mapApiToExpert={mapApiToExpert}
                        containerVariants={containerVariants}
                        cardVariants={cardVariants}
                    />

                    <CategorySection
                        title="Khóa Học Miễn Phí"
                        icon={<Gift className="h-5 w-5" />}
                        iconBg="from-emerald-500 to-teal-500"
                        courses={freeCourses}
                        mapApiToExpert={mapApiToExpert}
                        containerVariants={containerVariants}
                        cardVariants={cardVariants}
                    />
                </div>
            )}

            {!loading && !error && showHighlightSections && (
                <motion.div variants={cardVariants} className="mb-8 flex justify-center">
                    <button
                        onClick={() => setShowAll(true)}
                        className="btn gap-2 rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 px-8 font-bold text-white shadow-lg hover:from-blue-700 hover:to-violet-700"
                    >
                        Xem tất cả {subjects.length} môn học
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </motion.div>
            )}

            {!loading && !error && filteredCourses.length > 0 && (
                <motion.div variants={cardVariants} className="mt-10">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm sm:flex-row">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-base-content">Bạn là chuyên gia?</h3>
                                <p className="text-sm font-medium text-base-content/50">
                                    Chia sẻ kiến thức, tạo thu nhập bền vững trên SKR.
                                </p>
                            </div>
                        </div>
                        <Link to="/signup">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm gap-1 rounded-xl border-none bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-lg hover:from-blue-700 hover:to-violet-700"
                            >
                                Đăng ký làm Chuyên Gia
                                <ArrowRight className="h-4 w-4" />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            )}
        </>
    );

    if (isPublicLayout) {
        return (
            <section className="w-full bg-base-200">
                <motion.main
                    className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {pageContent}
                </motion.main>
            </section>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <CoursesPageHeader />
                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {pageContent}
                </motion.main>
            </div>
        </div>
    );
}

function CategorySection({
    title,
    icon,
    iconBg,
    courses,
    mapApiToExpert,
    containerVariants,
    cardVariants,
}) {
    if (courses.length === 0) return null;

    return (
        <section>
            <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} text-white shadow-lg`}>
                    {icon}
                </div>
                <h2 className="text-xl font-black tracking-tight text-base-content">{title}</h2>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
                {courses.map((course) => {
                    const expert = mapApiToExpert(course.creator);
                    return <CourseCard key={course.id} course={course} expert={expert} variants={cardVariants} />;
                })}
            </motion.div>
        </section>
    );
}

function CoursesPageHeader() {
    const { profile } = useCurrentUserProfile();
    const displayName = profile.name || 'Người dùng';

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-b border-base-300 bg-base-100 px-8 py-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-base-content">Môn Học</h2>
                    <p className="text-sm font-medium text-base-content/60">Khám phá và đăng ký khóa học mới</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <input
                            type="text"
                            placeholder="Tìm môn học, flashcard, bài thi..."
                            className="input input-bordered w-96 rounded-full border-base-300 bg-base-200 pl-10 focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />
                    </div>

                    <div className="indicator">
                        <span className="indicator-item badge badge-sm badge-primary">3</span>
                        <button className="btn btn-circle btn-ghost">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 border-l border-base-300 pl-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-base-content">{displayName}</p>
                            {profile.isPremium && (
                                <div className="flex items-center justify-end gap-1">
                                    <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                                    <p className="text-xs font-bold text-orange-500">Premium User</p>
                                </div>
                            )}
                        </div>
                        <div className="avatar">
                            <div className="w-10 rounded-full ring ring-blue-500 ring-offset-2 ring-offset-base-100">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={displayName} className="h-10 w-10 object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-xs font-black text-base-content">
                                        {getUserInitials(displayName)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

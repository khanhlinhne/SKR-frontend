import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ExpertLayout } from '@/features/expert/components';
import courseApi from '@/shared/api/courseApi';
import { OwlLoader } from '@/shared/ui/common';
import {
    BookOpen,
    Search,
    Filter,
    Plus,
    ChevronRight,
    Layers,
    Users,
    Clock,
    Eye,
    Pencil,
    BarChart3,
    GraduationCap,
    FolderOpen,
    AlertCircle,
    RefreshCw,
    Star,
    TrendingUp,
    LayoutGrid,
    List,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== STATUS CONFIG =====
const statusConfig = {
    published: { label: 'Đã xuất bản', color: 'badge-success', dot: 'bg-emerald-500' },
    draft: { label: 'Bản nháp', color: 'badge-warning', dot: 'bg-amber-500' },
    archived: { label: 'Lưu trữ', color: 'badge-ghost', dot: 'bg-base-content/30' },
};

// ===== COURSE CARD =====
function CourseCard({ course }) {
    const navigate = useNavigate();
    const status = statusConfig[course.status] || statusConfig.draft;
    const hasContent = (course._count?.chapters || course.chaptersCount || 0) > 0;
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;

    return (
        <motion.div variants={itemVariants} layout>
            <div
                onClick={() => navigate(`/expert/curriculum/${course.courseId || course.id}`)}
                className="block group cursor-pointer"
            >
                <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group-hover:border-violet-500/30">
                    {/* Banner */}
                    <div className="relative h-36 overflow-hidden">
                        {course.courseBannerUrl ? (
                            <img
                                src={course.courseBannerUrl}
                                alt={course.courseName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-purple-600/20 flex items-center justify-center">
                                <GraduationCap className="w-12 h-12 text-violet-500/40" />
                            </div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                            <span className={`badge badge-sm font-bold gap-1.5 ${status.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                        </div>
                        {/* Content indicator */}
                        <div className="absolute top-3 right-3">
                            {hasContent ? (
                                <span className="badge badge-sm bg-violet-600 text-white border-none font-bold gap-1">
                                    <Pencil className="w-3 h-3" />
                                    Chỉnh sửa
                                </span>
                            ) : (
                                <span className="badge badge-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none font-bold gap-1">
                                    <Plus className="w-3 h-3" />
                                    Thêm nội dung
                                </span>
                            )}
                        </div>
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        {/* Course name */}
                        <div>
                            {course.courseCode && (
                                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">
                                    {course.courseCode}
                                </p>
                            )}
                            <h3 className="font-black text-base-content text-base leading-tight line-clamp-2 group-hover:text-violet-600 transition-colors">
                                {course.courseName}
                            </h3>
                        </div>

                        {/* Description */}
                        {course.courseDescription && (
                            <p className="text-xs text-base-content/50 line-clamp-2 leading-relaxed">
                                {course.courseDescription}
                            </p>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                                <Layers className="w-3.5 h-3.5 text-violet-500" />
                                <span className="font-bold">{chapterCount}</span>
                                <span>chương</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-bold">{lessonCount}</span>
                                <span>bài</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="font-bold">{studentCount}</span>
                                <span>HV</span>
                            </div>
                        </div>

                        {/* Progress bar (content completeness) */}
                        {hasContent && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-base-content/40 uppercase tracking-wider">Nội dung</span>
                                    <span className="text-violet-600">{lessonCount} bài giảng</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-base-300 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (lessonCount / Math.max(1, chapterCount * 5)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Action hint */}
                        <div className="flex items-center justify-between pt-1">
                            {course.priceAmount > 0 ? (
                                <span className="text-xs font-black text-emerald-600">
                                    {Number(course.priceAmount).toLocaleString('vi-VN')}đ
                                </span>
                            ) : (
                                <span className="badge badge-xs badge-ghost font-bold">Miễn phí</span>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>{hasContent ? 'Quản lý nội dung' : 'Bắt đầu soạn'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ===== COURSE LIST ITEM (for list view) =====
function CourseListItem({ course }) {
    const navigate = useNavigate();
    const status = statusConfig[course.status] || statusConfig.draft;
    const hasContent = (course._count?.chapters || course.chaptersCount || 0) > 0;
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;

    return (
        <motion.div variants={itemVariants} layout>
            <div
                onClick={() => navigate(`/expert/curriculum/${course.courseId || course.id}`)}
                className="block group cursor-pointer"
            >
                <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group-hover:border-violet-500/30 p-4 flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {course.courseBannerUrl ? (
                            <img
                                src={course.courseBannerUrl}
                                alt={course.courseName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-purple-600/20 flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-violet-500/40" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {course.courseCode && (
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {course.courseCode}
                                </span>
                            )}
                            <span className={`badge badge-xs font-bold gap-1 ${status.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                        </div>
                        <h3 className="font-black text-base-content text-sm leading-tight truncate group-hover:text-violet-600 transition-colors">
                            {course.courseName}
                        </h3>
                        {course.courseDescription && (
                            <p className="text-xs text-base-content/40 truncate mt-0.5">{course.courseDescription}</p>
                        )}
                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <Layers className="w-3 h-3 text-violet-500" />
                                <span className="font-bold">{chapterCount}</span> chương
                            </div>
                            <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <BookOpen className="w-3 h-3 text-blue-500" />
                                <span className="font-bold">{lessonCount}</span> bài
                            </div>
                            <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <Users className="w-3 h-3 text-emerald-500" />
                                <span className="font-bold">{studentCount}</span> HV
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {course.priceAmount > 0 ? (
                            <span className="text-sm font-black text-emerald-600">
                                {Number(course.priceAmount).toLocaleString('vi-VN')}đ
                            </span>
                        ) : (
                            <span className="badge badge-sm badge-ghost font-bold">Miễn phí</span>
                        )}
                        {hasContent ? (
                            <span className="badge badge-sm bg-violet-600 text-white border-none font-bold gap-1 hidden sm:flex">
                                <Pencil className="w-3 h-3" />
                                Chỉnh sửa
                            </span>
                        ) : (
                            <span className="badge badge-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none font-bold gap-1 hidden sm:flex">
                                <Plus className="w-3 h-3" />
                                Thêm nội dung
                            </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-violet-600 transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ===== EMPTY STATE =====
function EmptyState({ searchTerm }) {
    return (
        <motion.div variants={cardVariants} className="col-span-full">
            <div className="bg-base-100 rounded-2xl border-2 border-dashed border-base-300 p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-4">
                    <FolderOpen className="w-10 h-10 text-violet-500/50" />
                </div>
                <h3 className="text-lg font-black text-base-content mb-2">
                    {searchTerm ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
                </h3>
                <p className="text-sm text-base-content/50 max-w-md mx-auto">
                    {searchTerm
                        ? `Không có khóa học nào trùng khớp với "${searchTerm}". Hãy thử từ khóa khác.`
                        : 'Bạn chưa được phân công quản lý khóa học nào. Vui lòng liên hệ Admin để được giao khóa học.'
                    }
                </p>
            </div>
        </motion.div>
    );
}

// ===== ERROR STATE =====
function ErrorState({ message, onRetry }) {
    return (
        <motion.div variants={cardVariants} className="col-span-full">
            <div className="bg-base-100 rounded-2xl border border-red-500/20 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-base-content mb-2">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-base-content/50 mb-4">{message}</p>
                <button onClick={onRetry} className="btn btn-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold gap-1.5">
                    <RefreshCw className="w-4 h-4" />
                    Thử lại
                </button>
            </div>
        </motion.div>
    );
}

// ===== MAIN COMPONENT =====
export default function ExpertCurriculum() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState(() => {
        try { return localStorage.getItem('skr-expert-curriculum-view') || 'grid'; } catch { return 'grid'; }
    });

    const handleViewChange = (mode) => {
        setViewMode(mode);
        try { localStorage.setItem('skr-expert-curriculum-view', mode); } catch { /* ignore */ }
    };

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Lấy userId từ localStorage — expert chỉ xem khóa học được admin giao
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = storedUser.userId || storedUser.id || storedUser.user_id;

            if (!userId) {
                setCourses([]);
                setLoading(false);
                return;
            }

            // Luôn truyền creatorId để chỉ lấy khóa học được giao cho expert này
            // Truyền admin=true để có thể xem cả draft/archived
            const res = await courseApi.getAll({
                limit: 50,
                creatorId: userId,
                admin: true,
            });
            const data = res?.data?.courses || res?.data?.items || res?.data || res?.courses || res?.items || [];
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[ExpertCurriculum] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách khóa học.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // ===== FILTERED COURSES =====
    const filteredCourses = courses.filter(c => {
        const matchSearch = !searchTerm ||
            c.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ===== STATS =====
    const stats = [
        {
            label: 'Tổng khóa học',
            value: courses.length,
            icon: GraduationCap,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
        },
        {
            label: 'Đã xuất bản',
            value: courses.filter(c => c.status === 'published').length,
            icon: Eye,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Bản nháp',
            value: courses.filter(c => c.status === 'draft').length,
            icon: Pencil,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
        {
            label: 'Tổng học viên',
            value: courses.reduce((sum, c) => sum + (c._count?.enrollments || c.enrollmentsCount || c.purchaseCount || 0), 0),
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
    ];

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-base-content/50 font-medium">Expert Studio</span>
                            <ChevronRight className="w-3 h-3 text-base-content/30" />
                            <span className="text-sm text-violet-600 font-bold">Chương trình học</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content">Khóa học của tôi</h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Chọn khóa học để quản lý chương, bài giảng và nội dung
                        </p>
                    </div>
                    <button
                        onClick={fetchCourses}
                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-base-100 rounded-xl p-3.5 border border-base-300 flex items-center gap-3 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-base-content">{stat.value}</p>
                                <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Search & Filter Bar */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                        <input
                            type="text"
                            placeholder="Tìm khóa học theo tên hoặc mã..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input input-bordered w-full pl-10 rounded-xl font-medium text-sm h-10"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 bg-base-100 rounded-xl border border-base-300 p-1">
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'published', label: 'Đã xuất bản' },
                            { key: 'draft', label: 'Bản nháp' },
                            { key: 'archived', label: 'Lưu trữ' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    statusFilter === f.key
                                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                                        : 'text-base-content/50 hover:text-base-content hover:bg-base-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-base-100 rounded-xl border border-base-300 p-1">
                        <button
                            onClick={() => handleViewChange('grid')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                                    : 'text-base-content/40 hover:text-base-content hover:bg-base-200'
                            }`}
                            title="Hiển thị dạng lưới"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleViewChange('list')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                viewMode === 'list'
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                                    : 'text-base-content/40 hover:text-base-content hover:bg-base-200'
                            }`}
                            title="Hiển thị dạng danh sách"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Course Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <OwlLoader
                            message="Đang tải chương trình học..."
                            subMessage="SKR đang lấy danh sách khóa học và cấu trúc nội dung để bạn tiếp tục biên soạn."
                            className="py-8"
                        />
                    </div>
                ) : (
                    <motion.div
                        key={viewMode}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                            : 'flex flex-col gap-3'
                        }
                    >
                        {error && <ErrorState message={error} onRetry={fetchCourses} />}
                        {!error && filteredCourses.length === 0 && <EmptyState searchTerm={searchTerm} />}
                        {!error && filteredCourses.map(course =>
                            viewMode === 'grid'
                                ? <CourseCard key={course.courseId || course.id} course={course} />
                                : <CourseListItem key={course.courseId || course.id} course={course} />
                        )}
                    </motion.div>
                )}
            </motion.div>
        </ExpertLayout>
    );
}

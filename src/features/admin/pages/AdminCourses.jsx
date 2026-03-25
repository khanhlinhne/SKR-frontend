import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AdminLayout } from '@/features/admin/components';
import adminApi from '@/shared/api/adminApi';
import CourseEditModal from '@/features/admin/components/adminCourses/CourseEditModal';
import CourseCreateModal from '@/features/admin/components/adminCourses/CourseCreateModal';
import {
    Search,
    Plus,
    MoreHorizontal,
    Eye,
    Edit3,
    Trash2,
    Star,
    Users,
    BookOpen,
    Download,
    Grid3X3,
    List,
    DollarSign,
    ArrowUpDown,
    Clock,
    Layers,
    CheckCircle2,
    AlertCircle,
    Archive,
    ToggleLeft,
    ToggleRight,
    X,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    RefreshCw,
    Globe,
    EyeOff,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

// ─── Animation Variants ───────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.08 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' },
    },
};

// ─── Normalize API course ─────────────────────────────────

function normalizeCourse(course) {
    const students = Number(course.purchaseCount ?? course.enrolledCount ?? course.totalStudents ?? course.students ?? 0);
    const price = Number(course.priceAmount ?? course.price ?? 0);
    const revenue = Number(course.revenue ?? 0) || (students * price);

    return {
        id: course.subjectId ?? course.courseId ?? course.id,
        name: course.subjectName ?? course.courseName ?? course.name ?? '',
        category: course.category ?? course.subjectCategory ?? '',
        price,
        originalPrice: Number(course.originalPrice ?? course.subjectPrice ?? course.priceAmount ?? 0),
        students,
        rating: Number(course.ratingAverage ?? course.averageRating ?? course.rating ?? 0),
        ratingCount: Number(course.ratingCount ?? 0),
        status: course.status ?? 'draft',
        lessons: Number(course.totalLessons ?? course.lessons ?? 0),
        chapters: Number(course.totalChapters ?? course.chapters ?? 0),
        image: course.subjectIconUrl ?? course.courseIconUrl ?? course.image ?? '',
        revenue,
        completionRate: Number(course.completionRate ?? 0),
        createdAt: course.createdAt ?? course.created_date ?? '',
        updatedAt: course.updatedAt ?? course.updated_date ?? '',
        instructor: course.instructorName ?? course.instructor ?? course.creator?.fullName ?? course.creator?.displayName ?? course.creatorName ?? '',
        bannerUrl: course.subjectBannerUrl ?? course.courseBannerUrl ?? course.bannerUrl ?? '',
        subjectCode: course.subjectCode ?? course.courseCode ?? '',
        description: course.subjectDescription ?? course.courseDescription ?? '',
        publishedAt: course.publishedAt ?? course.published_date ?? null,
        isFeatured: course.isFeatured ?? false,
    };
}

const statusConfig = {
    published: {
        label: 'Đã xuất bản',
        color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle2,
        dotColor: 'bg-emerald-500',
    },
    draft: {
        label: 'Bản nháp',
        color: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
        icon: AlertCircle,
        dotColor: 'bg-amber-500',
    },
    archived: {
        label: 'Đã lưu trữ',
        color: 'text-base-content/60 bg-base-200 border-base-300',
        icon: Archive,
        dotColor: 'bg-base-content/40',
    },
};

// ─── Helpers ──────────────────────────────────────────────

function formatPrice(amount) {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

function formatRevenue(amount) {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// ─── KPI Cards ────────────────────────────────────────────

function KPICards({ courses }) {
    const totalCourses = courses.length;
    const published = courses.filter(c => c.status === 'published').length;
    const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
    const totalRevenue = courses.reduce((sum, c) => sum + c.revenue, 0);
    const ratedCourses = courses.filter(c => c.rating > 0);
    const avgRating = ratedCourses.length > 0
        ? ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length
        : 0;
    const ratedCompletions = courses.filter(c => c.completionRate > 0);
    const avgCompletion = ratedCompletions.length > 0
        ? ratedCompletions.reduce((sum, c) => sum + c.completionRate, 0) / ratedCompletions.length
        : 0;

    const kpis = [
        {
            label: 'Tổng khóa học',
            value: totalCourses,
            subLabel: `${published} đã xuất bản`,
            icon: BookOpen,
            gradient: 'from-blue-500 to-indigo-500',
            iconBg: 'bg-blue-500/15',
            iconColor: 'text-blue-600',
            trend: `+${courses.length > 0 ? published : 0}`,
            trendUp: true,
        },
        {
            label: 'Tổng học viên',
            value: totalStudents.toLocaleString('vi-VN'),
            subLabel: 'Đăng ký toàn hệ thống',
            icon: Users,
            gradient: 'from-violet-500 to-purple-500',
            iconBg: 'bg-violet-500/15',
            iconColor: 'text-violet-600',
            trend: '+' + totalStudents,
            trendUp: true,
        },
        {
            label: 'Tổng doanh thu',
            value: formatRevenue(totalRevenue),
            subLabel: formatPrice(totalRevenue),
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-600',
            trend: formatRevenue(totalRevenue),
            trendUp: true,
        },
        {
            label: 'Đánh giá TB',
            value: avgRating > 0 ? avgRating.toFixed(1) : '—',
            subLabel: `Hoàn thành TB ${Math.round(avgCompletion)}%`,
            icon: Star,
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-600',
            trend: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : '—',
            trendUp: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
                <motion.div
                    key={kpi.label}
                    variants={cardVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="relative overflow-hidden bg-base-100 rounded-2xl border border-base-300/60 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-default"
                >
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-[0.06] blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`} />
                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">
                                    {kpi.label}
                                </p>
                                <p className={`text-2xl font-bold ${kpi.iconColor} tracking-tight leading-none`}>
                                    {kpi.value}
                                </p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {kpi.trend}
                        </div>
                    </div>
                    <p className="text-[11px] text-base-content/40 font-medium mt-2 ml-[3.4rem]">
                        {kpi.subLabel}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Publish Toggle ────────────────────────────────────────

function PublishToggle({ course, onToggle, loading }) {
    const isPublished = course.status === 'published';
    const handleClick = (e) => {
        e.stopPropagation();
        onToggle(course);
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                isPublished ? 'bg-emerald-500' : 'bg-base-300'
            }`}
            title={isPublished ? 'Hủy công khai' : 'Công khai khóa học'}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white mx-auto" />
            ) : (
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            )}
        </button>
    );
}

// ─── Admin Course Card (Grid View) ────────────────────────

function AdminCourseCard({ course, onView, onEdit, onTogglePublish, togglingId }) {
    const status = statusConfig[course.status] || statusConfig.draft;
    const StatusIcon = status.icon;
    const isFree = course.price === 0;
    const discount = course.originalPrice > 0 && course.price > 0
        ? Math.round((1 - course.price / course.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group bg-base-100 rounded-2xl border border-base-300/60 hover:border-base-content/8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* Banner Image */}
            <div className="relative h-36 overflow-hidden">
                {course.bannerUrl ? (
                    <img
                        src={course.bannerUrl}
                        alt={course.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                        <span className="text-4xl">{course.image || '📚'}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${status.color} text-[11px] font-bold backdrop-blur-sm`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </span>
                </div>

                {/* Quick actions (top right) */}
                <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Edit3 className="w-3.5 h-3.5 text-base-content/70" />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        title="Thêm tùy chọn"
                    >
                        <MoreHorizontal className="w-3.5 h-3.5 text-base-content/70" />
                    </button>
                </div>

                {/* Bottom overlay: category + lessons */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        {course.category || 'Khác'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
                        <span className="flex items-center gap-0.5">
                            <Layers className="w-3 h-3" />
                            {course.chapters} chương
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                        <span className="flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" />
                            {course.lessons} bài
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-[15px] font-bold text-base-content leading-snug mb-1 line-clamp-1 tracking-tight">
                    {course.name}
                </h3>

                {/* Instructor */}
                <p className="text-[11px] text-base-content/40 font-medium mb-3 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0 flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">
                            {course.instructor?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                    </span>
                    {course.instructor || 'Chưa gán'}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Học viên</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <Users className="w-3 h-3 text-violet-500" />
                            {course.students.toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Doanh thu</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            {formatRevenue(course.revenue)}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Đánh giá</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            {course.rating > 0 ? (
                                <>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {course.rating}
                                    <span className="text-[10px] text-base-content/30 font-normal">({course.ratingCount})</span>
                                </>
                            ) : (
                                <span className="text-base-content/30 text-xs">N/A</span>
                            )}
                        </p>
                    </div>
                    <div className="bg-base-200/50 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-base-content/40 font-medium mb-0.5">Hoàn thành</p>
                        <p className="text-sm font-bold text-base-content flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-500" />
                            {course.completionRate}%
                        </p>
                    </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-base-200">
                    <div>
                        {isFree ? (
                            <span className="text-sm font-bold text-emerald-600">Miễn phí</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-base-content">
                                    {formatPrice(course.price)}
                                </span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-[11px] text-base-content/30 line-through">
                                            {formatPrice(course.originalPrice)}
                                        </span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                            -{discount}%
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onView}
                        className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-xl font-bold gap-1 shadow-md hover:shadow-lg transition-shadow text-xs px-3"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Page Component ───────────────────────────────────────

export default function AdminCourses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('students');
    const [viewMode, setViewMode] = useState('grid');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editCourse, setEditCourse] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const navigate = useNavigate();

    // ─── Fetch courses ───────────────────────────────────────
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await adminApi.getAllCourses();
            const items = Array.isArray(res?.items)
                ? res.items
                : Array.isArray(res?.data?.items)
                ? res.data.items
                : Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : [];
            setCourses(items.map(normalizeCourse));
        } catch (err) {
            console.error('Lỗi khi tải khóa học:', err);
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // ─── Toggle publish ──────────────────────────────────────
    const handleTogglePublish = async (course) => {
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setTogglingId(course.id);
        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourses(prev =>
                prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c)
            );
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setTogglingId(null);
        }
    };

    // ─── Edit modal success ─────────────────────────────────
    const handleEditSuccess = (updatedCourse) => {
        const updatedId = updatedCourse?.courseId ?? updatedCourse?.id;
        setCourses(prev =>
            prev.map(c => c.id === updatedId ? normalizeCourse(updatedCourse) : c)
        );
        setEditCourse(null);
    };

    // ─── Create modal success ────────────────────────────────
    const handleCreateSuccess = (newCourse) => {
        setCourses(prev => [normalizeCourse(newCourse), ...prev]);
        setShowCreateModal(false);
    };

    // ─── Filter + sort ───────────────────────────────────────
    const filteredCourses = useMemo(() => {
        let result = courses.filter(course => {
            const matchSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchStatus = filterStatus === 'all' || course.status === filterStatus;
            return matchSearch && matchStatus;
        });

        switch (sortBy) {
            case 'students':
                result.sort((a, b) => b.students - a.students);
                break;
            case 'revenue':
                result.sort((a, b) => b.revenue - a.revenue);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return result;
    }, [courses, searchQuery, filterStatus, sortBy]);

    const statusCounts = useMemo(() => ({
        all: courses.length,
        published: courses.filter(c => c.status === 'published').length,
        draft: courses.filter(c => c.status === 'draft').length,
        archived: courses.filter(c => c.status === 'archived').length,
    }), [courses]);

    const sortOptions = [
        { value: 'students', label: 'Nhiều học viên nhất', icon: Users },
        { value: 'revenue', label: 'Doanh thu cao nhất', icon: DollarSign },
        { value: 'rating', label: 'Đánh giá cao nhất', icon: Star },
        { value: 'newest', label: 'Mới tạo nhất', icon: Clock },
        { value: 'name', label: 'Tên A-Z', icon: ArrowUpDown },
    ];

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-5"
            >
                {/* ─── Page Title + Actions ─── */}
                <motion.div variants={fadeInUp} className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-base-content tracking-tight">
                                    Quản lý Khóa học
                                </h1>
                                <p className="text-sm text-base-content/50 font-medium">
                                    Quản lý nội dung, giá cả và hiệu suất các khóa học trên hệ thống
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchCourses}
                            disabled={loading}
                            className="btn btn-sm btn-ghost font-bold rounded-xl gap-1.5 text-base-content/60 hover:text-base-content"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                        <button className="btn btn-sm btn-ghost font-bold rounded-xl gap-1.5 text-base-content/60 hover:text-base-content">
                            <Download className="w-4 h-4" />
                            Xuất báo cáo
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none shadow-lg shadow-emerald-500/20 font-bold rounded-xl gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo khóa học
                        </button>
                    </div>
                </motion.div>

                {/* ─── KPI Cards ─── */}
                <motion.div variants={fadeInUp}>
                    <KPICards courses={courses} />
                </motion.div>

                {/* ─── Toolbar: Search + Filter + Sort + View ─── */}
                <motion.div variants={fadeInUp}>
                    <div className="bg-base-100 rounded-2xl border border-base-300/60 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-0">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khóa học, giảng viên, danh mục..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-base-200/50 border border-base-300/50 focus:border-emerald-500/50 focus:bg-base-100 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Status filter pills */}
                            <div className="flex items-center gap-1 bg-base-200/40 rounded-xl p-1 flex-shrink-0">
                                {[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'published', label: 'Xuất bản' },
                                    { value: 'draft', label: 'Nháp' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilterStatus(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                            filterStatus === opt.value
                                                ? 'bg-base-100 text-base-content shadow-sm border border-base-300/50'
                                                : 'text-base-content/40 hover:text-base-content/70 hover:bg-base-200/40'
                                        }`}
                                    >
                                        {opt.label}
                                        <span className="ml-1 text-[10px] opacity-60">
                                            {statusCounts[opt.value] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="hidden lg:block w-px h-6 bg-base-300/50 flex-shrink-0" />

                            {/* Sort dropdown */}
                            <div className="dropdown dropdown-end flex-shrink-0">
                                <label
                                    tabIndex={0}
                                    className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5 text-base-content/50 text-xs"
                                >
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        {sortOptions.find(o => o.value === sortBy)?.label}
                                    </span>
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-56 border border-base-200 mt-2"
                                >
                                    {sortOptions.map(opt => {
                                        const Icon = opt.icon;
                                        return (
                                            <li key={opt.value}>
                                                <button
                                                    onClick={() => setSortBy(opt.value)}
                                                    className={`flex items-center gap-2 rounded-xl text-sm font-medium ${
                                                        sortBy === opt.value
                                                            ? 'bg-emerald-500/10 text-emerald-600 font-bold'
                                                            : 'text-base-content/60'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {opt.label}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* View toggle */}
                            <div className="join flex-shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`btn btn-sm join-item ${
                                        viewMode === 'grid'
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none'
                                            : 'btn-ghost text-base-content/40'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`btn btn-sm join-item ${
                                        viewMode === 'table'
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none'
                                            : 'btn-ghost text-base-content/40'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Count */}
                            <span className="text-[11px] font-semibold text-base-content/30 hidden lg:inline flex-shrink-0 tabular-nums">
                                {filteredCourses.length} khóa học
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Loading State ─── */}
                {loading && (
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                        <p className="text-base-content/50 font-medium">Đang tải danh sách khóa học...</p>
                    </motion.div>
                )}

                {/* ─── Error State ─── */}
                {!loading && error && (
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col items-center justify-center py-16 text-center bg-red-500/5 rounded-2xl border border-red-500/10"
                    >
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-bold text-base-content mb-2">{error}</h3>
                        <button
                            onClick={fetchCourses}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-shadow mt-2"
                        >
                            Thử lại
                        </button>
                    </motion.div>
                )}

                {/* ─── Content: Grid or Table ─── */}
                {!loading && !error && (
                    <AnimatePresence mode="wait">
                        {viewMode === 'grid' ? (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
                            >
                                {filteredCourses.map((course) => (
                                    <AdminCourseCard
                                        key={course.id}
                                        course={course}
                                        onView={() => navigate(`/admin/courses/${course.id}`)}
                                        onEdit={() => setEditCourse(course)}
                                        onTogglePublish={handleTogglePublish}
                                        togglingId={togglingId}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="table"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0 }}
                                className="bg-base-100 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-base-300/60 overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr className="bg-base-200/30 border-b border-base-200">
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Khóa học</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Trạng thái</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Hiển thị</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Giá</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Học viên</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Doanh thu</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3">Cập nhật</th>
                                                <th className="font-bold text-[10px] uppercase tracking-wider text-base-content/40 py-3 text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCourses.map((course, i) => {
                                                const status = statusConfig[course.status] || statusConfig.draft;
                                                const StatusIcon = status.icon;
                                                return (
                                                    <motion.tr
                                                        key={course.id}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 + i * 0.04 }}
                                                        className="hover:bg-base-200/30 group border-b border-base-200/50 last:border-0"
                                                    >
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center">
                                                                    {course.bannerUrl ? (
                                                                        <img
                                                                            src={course.bannerUrl}
                                                                            alt={course.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xl">{course.image || '📚'}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-sm text-base-content truncate max-w-[200px]">
                                                                        {course.name}
                                                                    </p>
                                                                    <p className="text-[11px] text-base-content/40 font-medium">
                                                                        {course.instructor || 'Chưa gán'} • {course.category || 'Khác'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border ${status.color}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <PublishToggle
                                                                course={course}
                                                                onToggle={handleTogglePublish}
                                                                loading={togglingId === course.id}
                                                            />
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`font-bold text-sm ${course.price === 0 ? 'text-emerald-600' : 'text-base-content'}`}>
                                                                {formatPrice(course.price)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="flex items-center gap-1 text-sm font-semibold">
                                                                <Users className="w-3 h-3 text-violet-500" />
                                                                {course.students.toLocaleString('vi-VN')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="text-sm font-bold text-emerald-600">
                                                                {formatRevenue(course.revenue)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="text-[11px] text-base-content/40 font-medium">
                                                                {formatDate(course.updatedAt)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                                                                    className="btn btn-ghost btn-xs btn-circle hover:bg-emerald-500/10"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditCourse(course)}
                                                                    className="btn btn-ghost btn-xs btn-circle hover:bg-blue-500/10"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Bạn có chắc muốn xóa khóa học "${course.name}"?`)) {
                                                                            adminApi.deleteCourse(course.id).then(() => {
                                                                                setCourses(prev => prev.filter(c => c.id !== course.id));
                                                                            }).catch(err => {
                                                                                console.error('Lỗi khi xóa khóa học:', err);
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="btn btn-ghost btn-xs btn-circle hover:bg-red-500/10"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table footer */}
                                <div className="px-4 py-3 border-t border-base-200 flex items-center justify-between">
                                    <p className="text-xs text-base-content/40 font-medium">
                                        Hiển thị {filteredCourses.length} / {courses.length} khóa học
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* ─── Empty state ─── */}
                {!loading && !error && filteredCourses.length === 0 && (
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-5">
                            <BookOpen className="w-8 h-8 text-base-content/25" />
                        </div>
                        <h3 className="text-lg font-bold text-base-content mb-2">
                            Không tìm thấy khóa học
                        </h3>
                        <p className="text-sm text-base-content/50 font-medium mb-5 max-w-sm">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                                : 'Chưa có khóa học nào trong hệ thống.'}
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                        >
                            Xóa bộ lọc
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* ─── Edit Modal ─── */}
            <AnimatePresence>
                {editCourse && (
                    <CourseEditModal
                        course={editCourse}
                        onClose={() => setEditCourse(null)}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </AnimatePresence>

            {/* ─── Create Modal ─── */}
            <AnimatePresence>
                {showCreateModal && (
                    <CourseCreateModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

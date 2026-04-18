import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft, Edit3, Trash2, ExternalLink, MoreHorizontal,
    Globe, EyeOff, RefreshCw, Loader2, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import { OwlDialog, OwlLoader, useOwlDialog } from '@/shared/ui/common';
import {
    BusinessKPICards,
    RevenueChart,
    EnrollmentTrend,
    RecentOrdersTable,
    RevenueBreakdown,
    CourseSummaryCard,
    ExpertAssignmentCard,
    CourseEditModal,
    containerVariants,
    cardVariants,
    statusConfig,
} from '@/features/admin/components/adminCourses';
import adminApi from '@/shared/api/adminApi';

function normalizeCourse(course) {
    const students = Number(course.purchaseCount ?? course.enrolledCount ?? course.totalStudents ?? course.students ?? 0);
    const price = Number(course.priceAmount ?? course.price ?? 0);
    const revenue = Number(course.revenue ?? 0) || (students * price);

    return {
        id: course.subjectId ?? course.courseId ?? course.id,
        name: course.subjectName ?? course.courseName ?? course.name ?? '',
        category: course.category ?? course.subjectCategory ?? '',
        price,
        originalPrice: Number(course.originalPrice ?? course.subjectPrice ?? 0),
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
        totalVideos: Number(course.totalVideos ?? 0),
        totalDocuments: Number(course.totalDocuments ?? 0),
        totalQuestions: Number(course.totalQuestions ?? 0),
        estimatedHours: Number(course.estimatedDurationHours ?? course.estimatedHours ?? 0),
        totalStudents: students,
        creator: course.creator ?? course.instructor ?? null,
    };
}

/**
 * AdminCourseDetail — Trang chi tiết khóa học dành cho Admin
 */
export default function AdminCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();

    const fetchCourse = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const res = await adminApi.getCourseById(id);
            setCourse(normalizeCourse(res?.data ?? res));
        } catch (err) {
            console.error('Lỗi khi tải chi tiết khóa học:', err);
            setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleTogglePublish = async () => {
        if (!course) return;
        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setToggling(true);
        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourse(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setToggling(false);
        }
    };

    const handleEditSuccess = (updatedCourse) => {
        setCourse(normalizeCourse(updatedCourse));
        setShowEditModal(false);
    };

    const handleExpertAssigned = (updatedCourse) => {
        setCourse(normalizeCourse(updatedCourse));
    };

    const handleDelete = () => {
        if (!course) return;
        openDialog({
            variant: 'warning',
            title: `Xóa khóa học "${course.name}"?`,
            message: 'Cú quản trị cần bạn xác nhận trước khi xóa khóa học này khỏi hệ thống.',
            details: 'Hành động này không thể hoàn tác. Sau khi xóa, bạn sẽ được đưa về lại danh sách khóa học.',
            showCancel: true,
            confirmLabel: 'Xóa ngay',
            cancelLabel: 'Quay lại',
            confirmTone: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteCourse(course.id);
                    navigate('/admin/courses');
                    return true;
                } catch (err) {
                    console.error('Lỗi khi xóa khóa học:', err);
                    openDialog({
                        variant: 'error',
                        title: 'Không thể xóa khóa học',
                        message: `Cú chưa thể xóa "${course.name}" lúc này.`,
                        details: 'Vui lòng thử lại sau vài giây hoặc kiểm tra dữ liệu liên quan.',
                        confirmLabel: 'Đã hiểu',
                        confirmTone: 'warning',
                    });
                    return false;
                }
            },
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <OwlLoader
                        message="Đang tải thông tin khóa học..."
                        subMessage="SKR đang lấy số liệu vận hành, doanh thu và thông tin phụ trách của khóa học."
                        className="py-8"
                    />
                </div>
            </AdminLayout>
        );
    }

    if (error || !course) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <AlertTriangle className="w-14 h-14 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-base-content mb-2">
                        {error || 'Không tìm thấy khóa học'}
                    </h3>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={fetchCourse}
                            className="btn btn-sm btn-ghost font-bold rounded-xl gap-1.5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Thử lại
                        </button>
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="btn btn-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none font-bold rounded-xl gap-1.5"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const status = statusConfig[course.status] || statusConfig.draft;

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* ===== HEADER ===== */}
                <motion.div
                    variants={cardVariants}
                    className="flex flex-wrap items-center justify-between gap-4"
                >
                    {/* Left — Back + Title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="btn btn-circle btn-ghost btn-sm"
                            title="Quay lại"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-base-content flex flex-wrap items-center gap-2">
                                {course.name}
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                                    {status.label}
                                </span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {course.subjectCode && (
                                    <>
                                        <span className="text-sm font-medium text-base-content/60">
                                            Mã khóa: {course.subjectCode}
                                        </span>
                                        <span className="text-sm text-base-content/30">•</span>
                                    </>
                                )}
                                <span className="text-sm font-medium text-base-content/60">
                                    {course.category || 'Khác'}
                                </span>
                                <span className="text-sm text-base-content/30">•</span>
                                <span className="text-sm font-medium text-base-content/60">
                                    {course.lessons} bài học • {course.chapters} chương
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right — Actions */}
                    <div className="flex items-center gap-2">
                        {/* Publish toggle */}
                        <button
                            onClick={handleTogglePublish}
                            disabled={toggling}
                            className={`btn btn-sm font-bold rounded-xl gap-1.5 ${
                                course.status === 'published'
                                    ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20'
                            }`}
                        >
                            {toggling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : course.status === 'published' ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Globe className="w-4 h-4" />
                            )}
                            {course.status === 'published' ? 'Hủy công khai' : 'Công khai ngay'}
                        </button>

                        <button
                            onClick={() => setShowEditModal(true)}
                            className="btn btn-sm bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl gap-1.5"
                        >
                            <Edit3 className="w-4 h-4" />
                            Chỉnh sửa
                        </button>

                        {course.status === 'published' && (
                            <a
                                href={`/courses/${course.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Xem Landing Page
                            </a>
                        )}

                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-48 border border-base-300">
                                <li>
                                    <button
                                        onClick={handleDelete}
                                        className="text-red-500 font-bold text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa khóa học
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* ===== KPI CARDS ===== */}
                <BusinessKPICards course={course} />

                {/* ===== REVENUE CHART ===== */}
                <RevenueChart course={course} />

                {/* ===== MAIN DASHBOARD BODY ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3 width) - Charts & Tables */}
                    <div className="lg:col-span-2 space-y-6">
                        <EnrollmentTrend course={course} />
                        <RecentOrdersTable course={course} />
                    </div>

                    {/* Right Column (1/3 width) - Info, Breakdown & Expert */}
                    <div className="space-y-6">
                        <CourseSummaryCard course={course} />
                        <ExpertAssignmentCard creator={course.creator} courseId={course.id} onExpertAssigned={handleExpertAssigned} />
                        <RevenueBreakdown course={course} />
                    </div>
                </div>
            </motion.div>

            {/* ===== EDIT MODAL ===== */}
            <AnimatePresence>
                {showEditModal && (
                    <CourseEditModal
                        course={course}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </AnimatePresence>

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onClose={closeDialog}
                onConfirm={handleDialogConfirm}
            />
        </AdminLayout>
    );
}

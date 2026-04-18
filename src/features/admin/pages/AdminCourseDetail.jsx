import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import {
    AdminCourseDetailHeader,
    BusinessKPICards,
    CourseEditModal,
    CourseSummaryCard,
    EnrollmentTrend,
    ExpertAssignmentCard,
    RecentOrdersTable,
    RevenueChart,
    containerVariants,
} from '@/features/admin/components/adminCourses';
import useAdminCourseDetail from '@/features/admin/hooks/useAdminCourseDetail';
import { OwlDialog, OwlLoader } from '@/shared/ui/common';

export default function AdminCourseDetail() {
    const {
        course,
        activeAnalytics,
        timeRange,
        pendingRange,
        isRangeLoading,
        loading,
        error,
        toggling,
        showEditModal,
        setShowEditModal,
        dialog,
        closeDialog,
        handleDialogConfirm,
        fetchCourse,
        handleTogglePublish,
        handleEditSuccess,
        handleExpertAssigned,
        handleDelete,
        handleRangeChange,
        goBack,
    } = useAdminCourseDetail();

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[60vh] flex-col items-center justify-center">
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
                <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                    <AlertTriangle className="mb-4 h-14 w-14 text-red-500" />
                    <h3 className="mb-2 text-xl font-bold text-base-content">
                        {error || 'Không tìm thấy khóa học'}
                    </h3>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={fetchCourse}
                            className="btn btn-sm btn-ghost gap-1.5 rounded-xl font-bold"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Thử lại
                        </button>
                        <button
                            onClick={goBack}
                            className="btn btn-sm gap-1.5 rounded-xl border-none bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-7xl space-y-6"
            >
                <AdminCourseDetailHeader
                    course={course}
                    toggling={toggling}
                    onBack={goBack}
                    onTogglePublish={handleTogglePublish}
                    onEdit={() => setShowEditModal(true)}
                    onDelete={handleDelete}
                />

                <BusinessKPICards
                    course={course}
                    analytics={activeAnalytics}
                    range={timeRange}
                    loading={isRangeLoading}
                />

                <RevenueChart
                    range={pendingRange}
                    loading={isRangeLoading}
                    onRangeChange={handleRangeChange}
                    title={activeAnalytics?.title}
                    subtitle={activeAnalytics?.subtitle}
                    revenueSeries={activeAnalytics?.revenueSeries || []}
                    revenuePeriods={{
                        total: activeAnalytics?.totalRevenue ?? 0,
                        rangeLabel: activeAnalytics?.totalLabel ?? 'Tháng này',
                        growthPercent: activeAnalytics?.growthPercent ?? 0,
                    }}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <EnrollmentTrend
                            range={timeRange}
                            loading={isRangeLoading}
                            subtitle={activeAnalytics?.enrollmentSubtitle}
                            enrollments={activeAnalytics?.enrollmentSeries || []}
                            totalNew={activeAnalytics?.completedOrders ?? 0}
                        />
                        <RecentOrdersTable
                            range={timeRange}
                            loading={isRangeLoading}
                            subtitle={activeAnalytics?.ordersSubtitle}
                            orders={activeAnalytics?.recentOrders || []}
                            courseName={course.name}
                            totalOrders={activeAnalytics?.totalOrders ?? 0}
                        />
                    </div>

                    <div className="space-y-6">
                        <CourseSummaryCard course={course} />
                        <ExpertAssignmentCard
                            creator={course.creator}
                            courseId={course.id}
                            onExpertAssigned={handleExpertAssigned}
                        />
                    </div>
                </div>
            </motion.div>

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

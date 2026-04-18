import { AnimatePresence, motion } from 'motion/react';
import {
    AlertTriangle,
    BookOpen,
    Download,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import {
    AdminCourseCard,
    AdminCoursesKPI,
    AdminCoursesTable,
    AdminCoursesToolbar,
    CourseCreateModal,
    CourseEditModal,
} from '@/features/admin/components/adminCourses';
import useAdminCoursesPage from '@/features/admin/hooks/useAdminCoursesPage';
import { OwlDialog, OwlLoader } from '@/shared/ui/common';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.08 },
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

export default function AdminCourses() {
    const {
        courses,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        editCourse,
        setEditCourse,
        showCreateModal,
        setShowCreateModal,
        togglingId,
        dialog,
        closeDialog,
        handleDialogConfirm,
        filteredCourses,
        statusCounts,
        sortOptions,
        fetchCourses,
        handleTogglePublish,
        handleEditSuccess,
        handleCreateSuccess,
        handleDeleteCourse,
        handleViewCourse,
        clearFilters,
    } = useAdminCoursesPage();

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-5"
            >
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

                <motion.div variants={fadeInUp}>
                    <AdminCoursesKPI courses={courses} />
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <AdminCoursesToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearchClear={() => setSearchQuery('')}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                        statusCounts={statusCounts}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        sortOptions={sortOptions}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        filteredCount={filteredCourses.length}
                    />
                </motion.div>

                {loading && (
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <OwlLoader
                            message="Đang tải danh sách khóa học..."
                            subMessage="SKR đang tổng hợp trạng thái xuất bản, doanh thu và chỉ số của từng khóa học."
                            className="py-4"
                        />
                    </motion.div>
                )}

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

                {!loading && !error && filteredCourses.length > 0 && (
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
                                        onView={() => handleViewCourse(course)}
                                        onEdit={() => setEditCourse(course)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <AdminCoursesTable
                                key="table"
                                courses={filteredCourses}
                                totalCourses={courses.length}
                                togglingId={togglingId}
                                onView={handleViewCourse}
                                onEdit={setEditCourse}
                                onDelete={handleDeleteCourse}
                                onTogglePublish={handleTogglePublish}
                            />
                        )}
                    </AnimatePresence>
                )}

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
                            onClick={clearFilters}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                        >
                            Xóa bộ lọc
                        </button>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {editCourse && (
                    <CourseEditModal
                        course={editCourse}
                        onClose={() => setEditCourse(null)}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCreateModal && (
                    <CourseCreateModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
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

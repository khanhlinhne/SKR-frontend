import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Edit3, Trash2, ExternalLink, MoreHorizontal } from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import {
    BusinessKPICards,
    RevenueChart,
    EnrollmentTrend,
    RecentOrdersTable,
    RevenueBreakdown,
    CourseSummaryCard,
    ExpertAssignmentCard,
    containerVariants,
    cardVariants,
    statusConfig,
    mockCourseDetail,
} from '@/features/admin/components/adminCourses';

/**
 * AdminCourseDetail — Trang chi tiết khóa học dành cho Admin
 * Tập trung vào dashboard tỷ lệ chuyển đổi, doanh thu, và theo dõi tiến độ expert
 */
export default function AdminCourseDetail() {
    const navigate = useNavigate();

    // TODO: Replace with API call — subjectApi.getById(id)
    const course = mockCourseDetail;
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
                            <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                                {course.name}
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.color}`}>
                                    {status.label}
                                </span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-medium text-base-content/60">Mã khóa: {course.subjectCode}</span>
                                <span className="text-sm text-base-content/30">•</span>
                                <span className="text-sm font-medium text-base-content/60">{course.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — Actions */}
                    <div className="flex items-center gap-2">
                        <button className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5">
                            <ExternalLink className="w-4 h-4" />
                            Xem Landing Page
                        </button>
                        <button className="btn btn-sm bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-none shadow-lg font-bold rounded-xl gap-1.5">
                            <Edit3 className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-xl w-48 border border-base-300">
                                <li>
                                    <button className="text-red-500 font-bold text-sm">
                                        <Trash2 className="w-4 h-4" />
                                        Ngừng kinh doanh
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
                        <ExpertAssignmentCard creator={course.creator} />
                        <RevenueBreakdown course={course} />
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}





import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
    AlertCircle,
    BarChart3,
    Eye,
    FolderOpen,
    GraduationCap,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { ExpertLayout } from '@/features/expert/components';
import AnalyticsDashboard from '@/features/expert/components/analytics/AnalyticsDashboard';
import CourseRow from '@/features/expert/components/analytics/CourseRow';
import courseApi from '@/shared/api/courseApi';
import { OwlLoader } from '@/shared/ui/common';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function resolveCurrentUserId() {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        return storedUser.userId || storedUser.id || storedUser.user_id || null;
    } catch {
        return null;
    }
}

export default function ExpertAnalytics() {
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const userId = resolveCurrentUserId();
            if (!userId) {
                setCourses([]);
                return;
            }

            const response = await courseApi.getAll({ limit: 50, creatorId: userId, admin: true });
            const data = response?.data?.courses || response?.data?.items || response?.data || response?.courses || response?.items || [];
            const list = Array.isArray(data) ? data : [];
            setCourses(list);

            const targetId = location.state?.courseId;
            if (targetId && list.length > 0) {
                const found = list.find((course) => (course.courseId || course.id) === targetId);
                if (found) {
                    setSelectedCourse(found);
                }
            }
        } catch (err) {
            console.error('[ExpertAnalytics] fetch error:', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách khóa học.');
        } finally {
            setLoading(false);
        }
    }, [location.state?.courseId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        const query = searchTerm.toLowerCase();

        return courses.filter((course) =>
            course.courseName?.toLowerCase().includes(query)
            || course.courseCode?.toLowerCase().includes(query),
        );
    }, [courses, searchTerm]);

    const overallStats = useMemo(() => ({
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, course) => sum + (course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0), 0),
        published: courses.filter((course) => course.status === 'published').length,
        totalRevenue: courses.reduce((sum, course) => {
            const price = course.priceAmount || 0;
            const students = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;
            return sum + (price * students);
        }, 0),
    }), [courses]);

    return (
        <ExpertLayout>
            <AnimatePresence mode="wait">
                {selectedCourse ? (
                    <AnalyticsDashboard
                        key="dashboard"
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                    />
                ) : (
                    <motion.div
                        key="list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <motion.div variants={cardVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="flex items-center gap-3 text-2xl font-black text-base-content lg:text-3xl">
                                    <BarChart3 className="h-8 w-8 text-violet-500" />
                                    Dữ liệu & Thống kê
                                </h1>
                                <p className="mt-1 text-sm text-base-content/60">Xem danh sách khóa học và quản lý đăng ký học viên</p>
                            </div>
                            <button onClick={fetchCourses} className="btn btn-sm btn-ghost gap-1.5 rounded-xl font-bold" disabled={loading}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                        </motion.div>

                        <motion.div variants={cardVariants} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                { label: 'Khóa học', value: overallStats.totalCourses, icon: GraduationCap, gradient: 'from-violet-500 to-fuchsia-600' },
                                { label: 'Tổng học viên', value: overallStats.totalStudents, icon: Users, gradient: 'from-blue-500 to-cyan-600' },
                                { label: 'Đã xuất bản', value: overallStats.published, icon: Eye, gradient: 'from-emerald-500 to-teal-600' },
                                { label: 'Doanh thu ước tính', value: overallStats.totalRevenue > 0 ? `${(overallStats.totalRevenue / 1e6).toFixed(1)}M` : '0đ', icon: TrendingUp, gradient: 'from-amber-500 to-orange-600' },
                            ].map((stat) => (
                                <motion.div key={stat.label} variants={cardVariants} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg">
                                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                        <stat.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-base-content/50">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-base-content">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div variants={cardVariants} className="mb-5">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/30" />
                                <input
                                    type="text"
                                    placeholder="Tìm khóa học theo tên hoặc mã..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="input input-bordered h-11 w-full rounded-xl pl-10 text-sm font-medium"
                                />
                            </div>
                        </motion.div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <OwlLoader message="Đang tải danh sách khóa học..." subMessage="SKR đang lấy dữ liệu thống kê." className="py-8" />
                            </div>
                        ) : error ? (
                            <motion.div variants={cardVariants} className="rounded-2xl border border-red-500/20 bg-base-100 p-12 text-center">
                                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                                <h3 className="mb-2 text-lg font-black text-base-content">Lỗi tải dữ liệu</h3>
                                <p className="mb-4 text-sm text-base-content/50">{error}</p>
                                <button onClick={fetchCourses} className="btn btn-sm rounded-xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white gap-1.5">
                                    <RefreshCw className="h-4 w-4" />
                                    Thử lại
                                </button>
                            </motion.div>
                        ) : filteredCourses.length === 0 ? (
                            <motion.div variants={cardVariants}>
                                <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-100 p-12 text-center">
                                    <FolderOpen className="mx-auto mb-3 h-10 w-10 text-violet-500/50" />
                                    <h3 className="mb-2 text-lg font-black text-base-content">
                                        {searchTerm ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
                                    </h3>
                                    <p className="text-sm text-base-content/50">
                                        {searchTerm ? `Không trùng khớp với "${searchTerm}".` : 'Bạn chưa được phân công khóa học nào.'}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div className="space-y-3" initial="hidden" animate="visible" variants={containerVariants}>
                                {filteredCourses.map((course) => (
                                    <CourseRow key={course.courseId || course.id} course={course} onViewDetail={setSelectedCourse} />
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </ExpertLayout>
    );
}

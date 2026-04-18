import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import {
    AdminDashboardHeader,
    AdminDashboardStatsGrid,
    RecentOrdersTableCard,
    RecentUsersTableCard,
    RevenueChartCard,
    TopCoursesCard,
    containerVariants,
} from '@/features/admin/components/adminDashboard';
import useAdminDashboard from '@/features/admin/hooks/useAdminDashboard';

export default function AdminDashboard() {
    const {
        timeRange,
        setTimeRange,
        dashboard,
        statsData,
        loading,
        error,
    } = useAdminDashboard();

    return (
        <AdminLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AdminDashboardHeader
                    page={dashboard.ui.page}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                />

                {error && (
                    <motion.div className="alert alert-error mb-6 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <AdminDashboardStatsGrid statsData={statsData} loading={loading} />

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <RevenueChartCard
                        data={dashboard.revenueSeries}
                        ui={dashboard.ui.revenueChart}
                        loading={loading}
                    />
                    <TopCoursesCard
                        courses={dashboard.topCourses}
                        ui={dashboard.ui.featuredCourses}
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentUsersTableCard
                        users={dashboard.recentUsers}
                        ui={dashboard.ui.recentUsers}
                        loading={loading}
                    />
                    <RecentOrdersTableCard
                        orders={dashboard.recentOrders}
                        ui={dashboard.ui.recentOrders}
                        loading={loading}
                    />
                </div>
            </motion.div>
        </AdminLayout>
    );
}

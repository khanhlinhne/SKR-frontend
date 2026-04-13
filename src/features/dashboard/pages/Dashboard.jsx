import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import { cardVariants, containerVariants } from '@/features/dashboard/constants';
import { normalizeDashboardResponse } from '@/features/dashboard/dashboardData';
import {
    DashboardHeader,
    DashboardInsightsPanel,
    DashboardQuickStats,
    DashboardSubjectsPanel,
    DashboardTopCards,
} from '@/features/dashboard/components';
import dashboardApi from '@/shared/api/dashboardApi';
import { OwlLoader } from '@/shared/ui/common';

function hasRenderableDashboardData(dashboard) {
    return Boolean(
        dashboard.stats.studyTime ||
        dashboard.stats.performance ||
        dashboard.stats.flashcardsReviewed ||
        dashboard.stats.testsCompleted ||
        dashboard.stats.studyStreak ||
        dashboard.studyData.length ||
        dashboard.upcomingReviews.length ||
        dashboard.subjects.length ||
        dashboard.weakTopics.length ||
        dashboard.recentSubject,
    );
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('all');
    const [dashboardPayload, setDashboardPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const dashboard = useMemo(() => normalizeDashboardResponse(dashboardPayload), [dashboardPayload]);
    const isEmptyDashboard = !loading && !hasRenderableDashboardData(dashboard);

    useEffect(() => {
        let isMounted = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError('');

                const response = await dashboardApi.getMe();
                if (!isMounted) {
                    return;
                }

                setDashboardPayload(response);
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                console.error('Dashboard load failed:', loadError);
                setError(loadError?.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
            <DashboardSidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader />

                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {loading ? (
                        <motion.div variants={cardVariants} className="mb-6 rounded-3xl border border-base-300 bg-base-100 shadow-lg">
                            <OwlLoader
                                message="Đang lấy dữ liệu..."
                                subMessage="Cú đang mang dữ liệu học tập tới cho bạn."
                                className="py-10"
                            />
                        </motion.div>
                    ) : null}

                    {error ? (
                        <motion.div variants={cardVariants} className="mb-6 flex items-start gap-3 rounded-2xl border border-error/20 bg-base-100 p-4 shadow">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-base-content">Không tải được dữ liệu dashboard</p>
                                <p className="text-xs text-base-content/60">{error}</p>
                            </div>
                        </motion.div>
                    ) : null}

                    {isEmptyDashboard ? (
                        <motion.div variants={cardVariants} className="mb-6 rounded-2xl border border-warning/20 bg-base-100 p-4 shadow">
                            <p className="text-sm font-bold text-base-content">Chưa có dữ liệu để hiển thị.</p>
                            <p className="mt-1 text-xs text-base-content/60">
                                Dữ liệu học tập sẽ xuất hiện khi hệ thống ghi nhận hoạt động của bạn.
                            </p>
                        </motion.div>
                    ) : null}

                    <DashboardTopCards
                        stats={dashboard.stats}
                        studyData={dashboard.studyData}
                        upcomingReviews={dashboard.upcomingReviews}
                        variants={cardVariants}
                    />

                    <DashboardQuickStats stats={dashboard.stats} variants={cardVariants} />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <DashboardInsightsPanel
                            recentSubject={dashboard.recentSubject}
                            weakTopics={dashboard.weakTopics}
                            variants={cardVariants}
                        />
                        <DashboardSubjectsPanel
                            subjects={dashboard.subjects}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            variants={cardVariants}
                        />
                    </div>
                </motion.main>
            </div>
        </div>
    );
}

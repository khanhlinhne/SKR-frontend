import { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '@/features/learner/components';
import {
    cardVariants,
    containerVariants,
    DASHBOARD_STATS,
    RECENT_SUBJECT,
    STUDY_DATA,
    SUBJECTS,
    UPCOMING_REVIEWS,
    WEAK_TOPICS,
} from '@/features/dashboard/constants';
import {
    DashboardHeader,
    DashboardInsightsPanel,
    DashboardQuickStats,
    DashboardSubjectsPanel,
    DashboardTopCards,
} from '@/features/dashboard/components';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('all');

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden">
            <DashboardSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <motion.main
                    className="flex-1 overflow-y-auto p-6 lg:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <DashboardTopCards
                        stats={DASHBOARD_STATS}
                        studyData={STUDY_DATA}
                        upcomingReviews={UPCOMING_REVIEWS}
                        variants={cardVariants}
                    />

                    <DashboardQuickStats stats={DASHBOARD_STATS} variants={cardVariants} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardInsightsPanel
                            recentSubject={RECENT_SUBJECT}
                            weakTopics={WEAK_TOPICS}
                            variants={cardVariants}
                        />
                        <DashboardSubjectsPanel
                            subjects={SUBJECTS}
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

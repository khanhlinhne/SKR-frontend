import { useEffect, useMemo, useState } from 'react';

function generateMockDashboard(course) {
    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;
    const price = course.priceAmount || 0;
    const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

    const lessonNames = [
        'Giới thiệu khóa học',
        'Setup môi trường',
        'Kiến thức nền tảng',
        'Bài thực hành 1',
        'Lý thuyết nâng cao',
        'Design Patterns',
        'Project thực tế',
        'Tối ưu hóa',
        'Testing',
        'Dự án cuối khóa',
    ];

    const names = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
        'Hoàng Thu Hà', 'Vũ Quang Huy', 'Đặng Thị Kim', 'Bùi Văn Long',
        'Ngô Thị Mai', 'Đinh Quốc Nam', 'Lý Thái Phong', 'Hồ Thị Quỳnh',
        'Trịnh Văn Sơn', 'Dương Thị Trang', 'Phan Anh Tuấn', 'Mai Thị Uyên',
    ];
    const statuses = ['active', 'active', 'active', 'active', 'completed', 'completed', 'expired', 'pending'];

    const enrollments = [];
    const count = Math.max(studentCount, 5);
    for (let i = 0; i < count; i += 1) {
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        enrollments.push({
            id: `ENR-${String(1000 + i).slice(-4)}`,
            fullName: names[i % names.length],
            email: `user${i + 1}@example.com`,
            mobile: `0${9e8 + Math.floor(Math.random() * 1e8)}`.slice(0, 10),
            date: date.toISOString(),
            cost: price,
            status: statuses[i % statuses.length],
            progress: Math.floor(Math.random() * 100),
        });
    }

    return {
        stats: {
            totalRevenue: price * studentCount,
            revenueChange: '+12.5%',
            revSparkline: Array.from({ length: 12 }, () => Math.floor(Math.random() * price * 15 + price * 5)),
            newStudentsWeek: Math.floor(studentCount * 0.1),
            newStudentsToday: Math.floor(studentCount * 0.02),
            stdSparkline: Array.from({ length: 12 }, (_, i) => Math.floor(studentCount * 0.3 + Math.random() * studentCount * 0.1 * i)),
            completionRate: Math.floor(40 + Math.random() * 40),
            avgStudyTime: (Math.random() * 20 + 10).toFixed(1),
            lessonsViewed: Math.floor(studentCount * 3.5),
            avgRating: (3.5 + Math.random() * 1.5).toFixed(1),
        },
        weeklyEnrollments: weekLabels.map((label) => ({
            label,
            value: Math.floor(Math.random() * 30 + 5),
        })),
        monthlyEnrollments: months.map((label) => ({
            label,
            value: Math.floor(Math.random() * 80 + 20),
        })),
        weeklyActivity: weekLabels.map((label) => ({
            label,
            value: Math.floor(Math.random() * 80 + 10),
            suffix: ' lượt',
        })),
        lessonProgress: lessonNames.map((name, index) => ({
            name,
            studentsAtLesson: Math.max(0, Math.floor(studentCount * (1 - index * 0.08) * (0.8 + Math.random() * 0.2))),
            completionRate: Math.max(5, Math.floor(95 - index * 8 + Math.random() * 10)),
            dropRate: Math.floor(Math.random() * 15 + (index > 5 ? 10 : 2)),
        })),
        enrollments,
    };
}

export const enrollmentStatusConfig = {
    active: { label: 'Đang học', color: 'text-emerald-700 bg-emerald-500/10', progressColor: 'bg-emerald-500' },
    completed: { label: 'Hoàn thành', color: 'text-blue-700 bg-blue-500/10', progressColor: 'bg-blue-500' },
    expired: { label: 'Hết hạn', color: 'text-red-600 bg-red-500/10', progressColor: 'bg-red-500' },
    pending: { label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-500/10', progressColor: 'bg-amber-500' },
};

export function useExpertAnalyticsDashboard(course) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setDashboard(generateMockDashboard(course));
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [course]);

    const filteredEnrollments = useMemo(() => {
        if (!dashboard) return [];

        const list = dashboard.enrollments.filter((enrollment) => {
            const query = searchTerm.trim().toLowerCase();
            const matchesSearch = !query
                || enrollment.fullName.toLowerCase().includes(query)
                || enrollment.email.toLowerCase().includes(query)
                || enrollment.id.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        list.sort((left, right) => {
            let valueLeft;
            let valueRight;

            if (sortField === 'date') {
                valueLeft = new Date(left.date);
                valueRight = new Date(right.date);
            } else if (sortField === 'cost') {
                valueLeft = left.cost;
                valueRight = right.cost;
            } else if (sortField === 'name') {
                valueLeft = left.fullName;
                valueRight = right.fullName;
            } else {
                valueLeft = left.id;
                valueRight = right.id;
            }

            if (valueLeft < valueRight) return sortDirection === 'asc' ? -1 : 1;
            if (valueLeft > valueRight) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [dashboard, searchTerm, statusFilter, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
            return;
        }

        setSortField(field);
        setSortDirection('desc');
    };

    const studentCount = course._count?.enrollments || course.enrollmentsCount || course.purchaseCount || 0;
    const chapterCount = course._count?.chapters || course.chaptersCount || 0;
    const lessonCount = course._count?.lessons || course.lessonsCount || 0;

    const overview = useMemo(() => {
        if (!dashboard) {
            return null;
        }

        const { stats, weeklyEnrollments, monthlyEnrollments, weeklyActivity, lessonProgress, enrollments } = dashboard;

        return {
            stats,
            enrollments,
            lessonProgress,
            chartData: chartPeriod === 'week' ? weeklyEnrollments : monthlyEnrollments,
            weeklyActivity,
            metricCards: [
                {
                    label: 'Doanh thu tổng',
                    value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1e6).toFixed(1)}M` : '0đ',
                    change: stats.revenueChange,
                    trend: 'up',
                    icon: 'DollarSign',
                    gradient: 'from-emerald-500 to-teal-600',
                    sparkData: stats.revSparkline,
                    sparkColor: '#10b981',
                },
                {
                    label: 'Học viên mới tuần này',
                    value: stats.newStudentsWeek,
                    change: `+${stats.newStudentsToday} hôm nay`,
                    trend: 'up',
                    icon: 'Users',
                    gradient: 'from-blue-500 to-cyan-600',
                    sparkData: stats.stdSparkline,
                    sparkColor: '#3b82f6',
                },
                {
                    label: 'Tỷ lệ hoàn thành',
                    value: `${stats.completionRate}%`,
                    change: '+3.2%',
                    trend: 'up',
                    icon: 'Target',
                    gradient: 'from-violet-500 to-fuchsia-600',
                    donut: stats.completionRate,
                },
                {
                    label: 'Thời gian học TB',
                    value: `${stats.avgStudyTime} phút`,
                    change: '+1.5 phút',
                    trend: 'up',
                    icon: 'Clock',
                    gradient: 'from-amber-500 to-orange-600',
                    sparkData: Array.from({ length: 12 }, () => Math.random() * 20 + 10),
                    sparkColor: '#f59e0b',
                },
                {
                    label: 'Bài học đã xem',
                    value: stats.lessonsViewed.toLocaleString(),
                    change: '+247',
                    trend: 'up',
                    icon: 'Eye',
                    gradient: 'from-pink-500 to-rose-600',
                    sparkData: Array.from({ length: 12 }, () => Math.random() * 300 + 100),
                    sparkColor: '#ec4899',
                },
                {
                    label: 'Rating trung bình',
                    value: `${stats.avgRating} ★`,
                    change: '+0.2',
                    trend: 'up',
                    icon: 'Star',
                    gradient: 'from-yellow-500 to-amber-600',
                    rating: parseFloat(stats.avgRating),
                },
            ],
            funnelSteps: [
                { label: 'Đăng ký', pct: 100, count: studentCount, color: 'from-violet-500 to-violet-600' },
                { label: 'Bắt đầu học', pct: 85, count: Math.floor(studentCount * 0.85), color: 'from-blue-500 to-blue-600' },
                { label: 'Hoàn thành 50%', pct: 58, count: Math.floor(studentCount * 0.58), color: 'from-cyan-500 to-cyan-600' },
                { label: 'Hoàn thành 75%', pct: 35, count: Math.floor(studentCount * 0.35), color: 'from-amber-500 to-amber-600' },
                { label: 'Hoàn thành 100%', pct: stats.completionRate, count: Math.floor(studentCount * stats.completionRate / 100), color: 'from-emerald-500 to-emerald-600' },
            ],
            ratingBreakdown: [
                { stars: 5, pct: 45 },
                { stars: 4, pct: 28 },
                { stars: 3, pct: 15 },
                { stars: 2, pct: 8 },
                { stars: 1, pct: 4 },
            ],
            quickStudentStats: [
                { icon: 'Users', label: 'Tổng đăng ký', value: enrollments.length, bg: 'bg-violet-500/10', color: 'text-violet-500' },
                { icon: 'UserCheck', label: 'Đang học', value: enrollments.filter((item) => item.status === 'active').length, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
                { icon: 'ShieldCheck', label: 'Hoàn thành', value: enrollments.filter((item) => item.status === 'completed').length, bg: 'bg-blue-500/10', color: 'text-blue-500' },
                { icon: 'DollarSign', label: 'Doanh thu', value: stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1e6).toFixed(1)}M` : '0đ', bg: 'bg-amber-500/10', color: 'text-amber-500' },
            ],
        };
    }, [chartPeriod, course, dashboard, studentCount]);

    return {
        loading,
        dashboard,
        chartPeriod,
        setChartPeriod,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        sortField,
        sortDirection,
        handleSort,
        filteredEnrollments,
        studentCount,
        chapterCount,
        lessonCount,
        overview,
    };
}

import { useEffect, useMemo, useState } from 'react';
import {
    BookOpen,
    DollarSign,
    ShoppingCart,
    Users,
} from 'lucide-react';
import { adminApi } from '@/shared/api';
import {
    formatCompactCurrencyVND,
    formatCount,
    formatGrowth,
    normalizeDashboardData,
    toNumber,
} from '@/features/admin/utils/adminDashboardData';

const STATS_META = [
    {
        id: 'users',
        label: 'Tổng người dùng',
        icon: Users,
        bgGradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'courses',
        label: 'Khóa học',
        icon: BookOpen,
        bgGradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'orders',
        label: 'Đơn hàng',
        icon: ShoppingCart,
        bgGradient: 'from-violet-500 to-purple-600',
    },
    {
        id: 'revenue',
        label: 'Doanh thu',
        icon: DollarSign,
        bgGradient: 'from-amber-500 to-orange-600',
    },
];

export default function useAdminDashboard() {
    const [timeRange, setTimeRange] = useState('month');
    const [dashboardPayload, setDashboardPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await adminApi.getDashboardStats({ period: timeRange });
                if (!cancelled) {
                    setDashboardPayload(response);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError?.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [timeRange]);

    const dashboard = useMemo(
        () => normalizeDashboardData(dashboardPayload),
        [dashboardPayload],
    );

    const statsData = useMemo(() => (
        STATS_META.map((meta) => {
            const value = dashboard.totals[meta.id];
            const growth = dashboard.growth[meta.id];

            return {
                ...meta,
                value: meta.id === 'revenue' ? formatCompactCurrencyVND(value) : formatCount(value),
                change: formatGrowth(growth),
                trend: toNumber(growth, 0) < 0 ? 'down' : toNumber(growth, 0) > 0 ? 'up' : 'flat',
            };
        })
    ), [dashboard]);

    return {
        timeRange,
        setTimeRange,
        dashboard,
        statsData,
        loading,
        error,
    };
}

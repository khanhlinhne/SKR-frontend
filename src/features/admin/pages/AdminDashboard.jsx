import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AdminLayout } from '@/features/admin/components';
import { adminApi } from '@/shared/api';
import {
    Users,
    BookOpen,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    UserPlus,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Star,
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const TIME_RANGE_LABELS = {
    week: 'Tu\u1ea7n',
    month: 'Th\u00e1ng',
    year: 'N\u0103m',
};

const STATS_META = [
    {
        id: 'users',
        label: 'T\u1ed5ng ng\u01b0\u1eddi d\u00f9ng',
        icon: Users,
        bgGradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'courses',
        label: 'Kh\u00f3a h\u1ecdc',
        icon: BookOpen,
        bgGradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'orders',
        label: '\u0110\u01a1n h\u00e0ng',
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

function pickCandidate(source, candidates, fallback = undefined) {
    for (const candidate of candidates) {
        const value = typeof candidate === 'function' ? candidate(source) : source?.[candidate];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return fallback;
}

function firstObject(...values) {
    return values.find((value) => value && typeof value === 'object' && !Array.isArray(value));
}

function firstArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function formatCount(value) {
    return new Intl.NumberFormat('en-US').format(toNumber(value));
}

function formatGrowth(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }

    const numeric = toNumber(value, 0);
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: Number.isInteger(numeric) ? 0 : 1,
        maximumFractionDigits: 1,
    }).format(numeric);

    return `${numeric > 0 ? '+' : ''}${formatted}%`;
}

function formatCurrencyVND(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(toNumber(value));
}

function formatCompactCurrencyVND(value) {
    const numeric = toNumber(value);
    const absValue = Math.abs(numeric);

    if (absValue >= 1_000_000_000) {
        return `\u20ab${(numeric / 1_000_000_000).toFixed(absValue >= 10_000_000_000 ? 0 : 1)}B`;
    }

    if (absValue >= 1_000_000) {
        return `\u20ab${(numeric / 1_000_000).toFixed(absValue >= 10_000_000 ? 0 : 1)}M`;
    }

    if (absValue >= 1_000) {
        return `\u20ab${(numeric / 1_000).toFixed(absValue >= 10_000 ? 0 : 1)}K`;
    }

    return formatCurrencyVND(numeric);
}
function formatRelativeTime(value) {
    if (!value) {
        return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) {
        return `${Math.max(1, diffMinutes)} ph\u00fat tr\u01b0\u1edbc`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} gi\u1edd tr\u01b0\u1edbc`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
        return `${diffDays} ng\u00e0y tr\u01b0\u1edbc`;
    }

    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(date);
}

function formatMonthLabel(value, index) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `T${value}`;
    }

    if (typeof value === 'string' && value.trim()) {
        return value;
    }

    if (value) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return `T${date.getMonth() + 1}`;
        }
    }

    return `T${index + 1}`;
}

function formatRole(value) {
    const normalized = String(value || '').toLowerCase();

    switch (normalized) {
        case 'admin':
            return 'Admin';
        case 'creator':
        case 'expert':
            return 'Expert';
        case 'staff':
            return 'Staff';
        case 'premium':
            return 'Premium';
        case 'learner':
        case 'student':
        case 'user':
            return 'Learner';
        default:
            return value || 'Learner';
    }
}

function deriveUserStatus(user) {
    const rawStatus = String(pickCandidate(user, ['status'], '')).toLowerCase();

    if (rawStatus.includes('ban') || rawStatus.includes('block') || rawStatus.includes('inactive')) {
        return 'banned';
    }

    if (rawStatus.includes('pending') || rawStatus.includes('wait') || rawStatus.includes('verify')) {
        return 'pending';
    }

    if (user?.isBlocked || user?.banned || user?.isActive === false) {
        return 'banned';
    }

    if (user?.isVerified === false || user?.emailVerified === false || user?.isEmailVerified === false) {
        return 'pending';
    }

    return 'active';
}

function deriveOrderStatus(order) {
    const rawStatus = String(pickCandidate(order, ['status', 'paymentStatus'], '')).toLowerCase();

    if (rawStatus.includes('cancel')) {
        return 'cancelled';
    }

    if (rawStatus.includes('pending') || rawStatus.includes('process') || rawStatus.includes('wait')) {
        return 'pending';
    }

    return 'completed';
}

function unwrapDashboardPayload(payload) {
    const base = payload?.data ?? payload ?? {};
    return base.dashboard ?? base;
}

function normalizeRevenueSeries(items) {
    return firstArray(items).map((item, index) => ({
        month: formatMonthLabel(pickCandidate(item, ['label', 'month', 'period', 'date'], null), index),
        revenue: toNumber(pickCandidate(item, ['amount', 'revenue', 'totalRevenue', 'value'], 0)),
        displayAmount: pickCandidate(item, ['displayAmount'], null),
    }));
}

function normalizeTopCourses(items) {
    return firstArray(items)
        .map((course) => ({
            name: pickCandidate(course, [
                'courseName',
                'name',
                'title',
                'courseTitle',
                (value) => value?.course?.title,
                (value) => value?.course?.name,
            ], 'Kh\u00f3a h\u1ecdc'),
            students: toNumber(pickCandidate(course, [
                'studentCount',
                'students',
                'totalStudents',
                'totalEnrollments',
                'enrollmentsCount',
                'learners',
            ], 0)),
            revenue: toNumber(pickCandidate(course, ['revenue', 'totalRevenue', 'grossRevenue', 'amount'], 0)),
            rating: toNumber(pickCandidate(course, ['rating', 'averageRating', 'avgRating'], 0)),
            growth: pickCandidate(course, ['growthPercent', 'growth', 'revenueGrowth', 'percentChange'], null),
            growthDisplay: pickCandidate(course, ['growthDisplay'], null),
            revenueDisplay: pickCandidate(course, ['revenueDisplay'], null),
        }))
        .slice(0, 4);
}

function normalizeRecentUsers(items) {
    return firstArray(items)
        .map((user, index) => {
            const roles = Array.isArray(user?.roles) ? user.roles : [pickCandidate(user, ['role'], 'user')];
            const primaryRole = roles.find(Boolean) || 'user';

            return {
                id: pickCandidate(user, ['userId', 'id', '_id'], `user-${index}`),
                name: pickCandidate(user, ['fullName', 'name', 'username'], 'Ng\u01b0\u1eddi d\u00f9ng'),
                email: pickCandidate(user, ['email'], '--'),
                role: formatRole(pickCandidate(user, ['roleLabel', 'roleCode'], primaryRole)),
                status: pickCandidate(user, ['statusCode'], deriveUserStatus(user)),
                statusLabel: pickCandidate(user, ['statusLabel'], null),
                joinDate: pickCandidate(user, ['joinedRelative'], formatRelativeTime(pickCandidate(user, ['createdAt', 'created_at', 'joinedAt', 'joinedAtUtc'], null))),
                avatar: pickCandidate(user, ['avatarUrl', 'avatar', 'profilePicture', 'photoURL'], ''),
            };
        })
        .slice(0, 5);
}

function normalizeRecentOrders(items) {
    return firstArray(items)
        .map((order, index) => ({
            id: pickCandidate(order, ['displayCode', 'orderCode', 'code', 'id', '_id'], `ORD-${index + 1}`),
            course: pickCandidate(order, [
                'courseOrItemName',
                'courseTitle',
                'courseName',
                (value) => value?.course?.title,
                (value) => value?.course?.name,
            ], 'Kh\u00f3a h\u1ecdc'),
            user: pickCandidate(order, [
                'customerName',
                'userName',
                'customerName',
                (value) => value?.user?.fullName,
                (value) => value?.user?.name,
            ], 'Kh\u00e1ch h\u00e0ng'),
            amount: toNumber(pickCandidate(order, ['amount', 'totalAmount', 'total', 'revenue'], 0)),
            amountDisplay: pickCandidate(order, ['amountDisplay'], null),
            status: pickCandidate(order, ['paymentStatus'], deriveOrderStatus(order)),
            statusLabel: pickCandidate(order, ['paymentStatusLabel'], null),
            date: pickCandidate(order, ['createdRelative'], formatRelativeTime(pickCandidate(order, ['createdAt', 'created_at', 'paidAt', 'updatedAt', 'createdAtUtc'], null))),
        }))
        .slice(0, 5);
}

function normalizeDashboardData(payload) {
    const root = unwrapDashboardPayload(payload);
    const summary = firstObject(root.summary, root.overview, root.stats, root.metrics, root.kpis) || {};
    const charts = firstObject(root.charts, root.chart, root.analytics) || {};
    const ui = firstObject(root.ui) || {};

    return {
        totals: {
            users: toNumber(pickCandidate(summary.users || {}, ['total', 'value'], pickCandidate(summary, ['totalUsers', 'usersCount', 'userCount'], 0))),
            courses: toNumber(pickCandidate(summary.courses || {}, ['total', 'value'], pickCandidate(summary, ['totalCourses', 'coursesCount', 'courseCount'], 0))),
            orders: toNumber(pickCandidate(summary.orders || {}, ['total', 'value'], pickCandidate(summary, ['totalOrders', 'ordersCount', 'orderCount'], 0))),
            revenue: toNumber(pickCandidate(summary.revenue || {}, ['totalInPeriod', 'total', 'value'], pickCandidate(summary, ['totalRevenue', 'revenue', 'grossRevenue'], 0))),
        },
        growth: {
            users: pickCandidate(summary.users || {}, ['changePercent'], pickCandidate(summary, ['usersGrowth', 'userGrowth', 'usersChangePercent', 'userChangePercent'], null)),
            courses: pickCandidate(summary.courses || {}, ['changePercent'], pickCandidate(summary, ['coursesGrowth', 'courseGrowth', 'coursesChangePercent', 'courseChangePercent'], null)),
            orders: pickCandidate(summary.orders || {}, ['changePercent'], pickCandidate(summary, ['ordersGrowth', 'orderGrowth', 'ordersChangePercent', 'orderChangePercent'], null)),
            revenue: pickCandidate(summary.revenue || {}, ['changePercent'], pickCandidate(summary, ['revenueGrowth', 'revenueChangePercent', 'growthRevenue'], null)),
        },
        revenueSeries: normalizeRevenueSeries(firstArray(
            root.revenueByMonth,
            root.ui?.revenueChart?.points,
            root.monthlyRevenue,
            root.revenueChart,
            charts.revenueByMonth,
            charts.monthlyRevenue,
            charts.revenueChart,
        )),
        topCourses: normalizeTopCourses(firstArray(root.featuredCourses, root.ui?.featuredCourses?.items, root.topCourses, root.bestSellingCourses, root.popularCourses)),
        recentUsers: normalizeRecentUsers(firstArray(root.recentUsers, root.ui?.recentUsers?.items, root.latestUsers, root.newUsers)),
        recentOrders: normalizeRecentOrders(firstArray(root.recentOrders, root.ui?.recentOrders?.items, root.latestOrders, root.orders)),
        ui: {
            page: ui.page || {
                sectionTitle: 'Dashboard',
                sectionSubtitle: 'T\u1ed5ng quan ho\u1ea1t \u0111\u1ed9ng h\u1ec7 th\u1ed1ng SKR',
            },
            revenueChart: ui.revenueChart || {
                title: 'Bi\u1ec3u \u0111\u1ed3 Doanh thu',
                subtitle: 'T\u1ed5ng doanh thu 12 th\u00e1ng qua',
                legendLabel: 'Doanh thu',
            },
            featuredCourses: ui.featuredCourses || {
                title: 'Kh\u00f3a h\u1ecdc N\u1ed5i b\u1eadt',
                actionLabel: 'Xem t\u1ea5t c\u1ea3',
            },
            recentUsers: ui.recentUsers || {
                title: 'Ng\u01b0\u1eddi d\u00f9ng M\u1edbi',
                actionLabel: 'Xem t\u1ea5t c\u1ea3',
                columns: [
                    { key: 'user', label: 'Ng\u01b0\u1eddi d\u00f9ng' },
                    { key: 'role', label: 'Vai tr\u00f2' },
                    { key: 'status', label: 'Tr\u1ea1ng th\u00e1i' },
                    { key: 'joined', label: 'Tham gia' },
                ],
            },
            recentOrders: ui.recentOrders || {
                title: '\u0110\u01a1n h\u00e0ng G\u1ea7n \u0111\u00e2y',
                actionLabel: 'Xem t\u1ea5t c\u1ea3',
                columns: [
                    { key: 'order', label: 'M\u00e3 \u0111\u01a1n' },
                    { key: 'course', label: 'Kh\u00f3a h\u1ecdc' },
                    { key: 'amount', label: 'S\u1ed1 ti\u1ec1n' },
                    { key: 'status', label: 'Tr\u1ea1ng th\u00e1i' },
                ],
            },
        },
    };
}

function getInitials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';
}
export default function AdminDashboard() {
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
                    setError(loadError?.response?.data?.message || 'Kh\u00f4ng th\u1ec3 t\u1ea3i d\u1eef li\u1ec7u dashboard.');
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

    const dashboard = useMemo(() => normalizeDashboardData(dashboardPayload), [dashboardPayload]);

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

    return (
        <AdminLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={cardVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-base-content lg:text-3xl">{dashboard.ui.page.sectionTitle}</h1>
                        <p className="mt-1 text-sm text-base-content/60">{dashboard.ui.page.sectionSubtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                type="button"
                                onClick={() => setTimeRange(range)}
                                className={`btn btn-sm rounded-xl font-bold ${
                                    timeRange === range
                                        ? 'border-none bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                                        : 'btn-ghost'
                                }`}
                            >
                                {TIME_RANGE_LABELS[range]}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {error && (
                    <motion.div variants={cardVariants} className="alert alert-error mb-6 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {statsData.map((stat) => (
                        <StatsCard key={stat.id} stat={stat} loading={loading} />
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <RevenueChart data={dashboard.revenueSeries} ui={dashboard.ui.revenueChart} loading={loading} />
                    <TopCoursesCard courses={dashboard.topCourses} ui={dashboard.ui.featuredCourses} loading={loading} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentUsersTable users={dashboard.recentUsers} ui={dashboard.ui.recentUsers} loading={loading} />
                    <RecentOrdersTable orders={dashboard.recentOrders} ui={dashboard.ui.recentOrders} loading={loading} />
                </div>
            </motion.div>
        </AdminLayout>
    );
}

function StatsCard({ stat, loading }) {
    const TrendIcon = stat.trend === 'down' ? TrendingDown : TrendingUp;

    return (
        <motion.div
            variants={cardVariants}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg transition-shadow hover:shadow-xl"
        >
            <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                </div>
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-base-content/60">{stat.label}</p>
            <div className="flex items-end justify-between gap-3">
                <h3 className="text-2xl font-black text-base-content lg:text-3xl">{loading ? '...' : stat.value}</h3>
                <span
                    className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold ${
                        stat.trend === 'up'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : stat.trend === 'down'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-base-200 text-base-content/60'
                    }`}
                >
                    <TrendIcon className="h-3 w-3" />
                    {loading ? '--' : stat.change}
                </span>
            </div>
        </motion.div>
    );
}

function RevenueChart({ data, ui, loading }) {
    const maxRevenue = Math.max(...data.map((item) => item.revenue), 0);

    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-lg font-black text-base-content">{ui?.title || 'Bi\u1ec3u \u0111\u1ed3 Doanh thu'}</h3>
                    <p className="text-sm text-base-content/60">{ui?.subtitle || 'D\u1eef li\u1ec7u doanh thu t\u1eeb dashboard th\u1ef1c t\u1ebf'}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                        {ui?.legendLabel || 'Doanh thu'}
                    </span>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <SectionLoading />
            ) : data.length === 0 ? (
                <EmptyState message="Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u doanh thu." />
            ) : (
                <div className="relative px-1">
                    <div className="flex items-end gap-2" style={{ height: '192px' }}>
                        {data.map((item, index) => {
                            const heightPx = maxRevenue > 0
                                ? Math.max(8, Math.round((item.revenue / (maxRevenue * 1.15)) * 180))
                                : 0;
                            const isHighlighted = index === data.length - 1;

                            return (
                                <div key={`${item.month}-${index}`} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                                    <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-base-content px-2.5 py-1 text-[10px] font-bold text-base-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                        {item.displayAmount || formatCompactCurrencyVND(item.revenue)}
                                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-base-content" />
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: heightPx }}
                                        transition={{ delay: 0.35 + index * 0.05, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className={`w-full rounded-t-lg transition-colors ${
                                            isHighlighted
                                                ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-lg'
                                                : 'bg-emerald-500/30 group-hover:bg-emerald-500/60'
                                        }`}
                                        style={{ minHeight: heightPx > 0 ? '4px' : '0' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 flex gap-2">
                        {data.map((item, index) => (
                            <div key={`${item.month}-label-${index}`} className="flex-1 text-center">
                                <span className="text-[10px] font-bold text-base-content/50">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
function TopCoursesCard({ courses, ui, loading }) {
    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content">{ui?.title || 'Kh\u00f3a h\u1ecdc N\u1ed5i b\u1eadt'}</h3>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem t\u1ea5t c\u1ea3'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && courses.length === 0 ? (
                <SectionLoading />
            ) : courses.length === 0 ? (
                <EmptyState message="Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u kh\u00f3a h\u1ecdc n\u1ed5i b\u1eadt." />
            ) : (
                <div className="space-y-4">
                    {courses.map((course, index) => (
                        <motion.div
                            key={`${course.name}-${index}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.08 }}
                            className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200"
                        >
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${
                                    index === 0
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow'
                                        : index === 1
                                            ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                                            : index === 2
                                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                                : 'bg-base-200 text-base-content/60'
                                }`}
                            >
                                {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-bold text-base-content">{course.name}</h4>
                                <p className="text-xs text-base-content/60">
                                    {`${formatCount(course.students)} học viên${course.rating > 0 ? ` • ⭐ ${course.rating.toFixed(1)}` : ''}`}
                                </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-black text-base-content">{course.revenueDisplay || formatCompactCurrencyVND(course.revenue)}</p>
                                <p className="text-xs font-bold text-emerald-600">{course.growthDisplay || formatGrowth(course.growth)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function RecentUsersTable({ users, ui, loading }) {
    const statusConfig = {
        active: { label: 'Ho\u1ea1t \u0111\u1ed9ng', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
        pending: { label: 'Ch\u1edd x\u00e1c minh', icon: AlertCircle, color: 'text-amber-600 bg-amber-500/10' },
        banned: { label: 'B\u1ecb kh\u00f3a', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
    };

    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-black text-base-content">{ui?.title || 'Ng\u01b0\u1eddi d\u00f9ng M\u1edbi'}</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem t\u1ea5t c\u1ea3'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && users.length === 0 ? (
                <SectionLoading />
            ) : users.length === 0 ? (
                <EmptyState message="Ch\u01b0a c\u00f3 ng\u01b0\u1eddi d\u00f9ng m\u1edbi." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr className="text-base-content/60">
                                {(ui?.columns || []).map((column) => (
                                    <th key={column.key} className="text-xs font-bold uppercase">{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => {
                                const status = statusConfig[user.status] || statusConfig.active;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 + index * 0.06 }}
                                        className="cursor-pointer hover:bg-base-200/50"
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <div className="avatar">
                                                        <div className="h-8 w-8 rounded-full">
                                                            <img src={user.avatar} alt={user.name} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-black text-emerald-600">
                                                        {getInitials(user.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-base-content">{user.name}</p>
                                                    <p className="text-xs text-base-content/50">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm font-bold ${user.role === 'Premium' ? 'badge-warning' : 'badge-ghost'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {user.statusLabel || status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-1 text-xs text-base-content/60">
                                                <Clock className="h-3 w-3" />
                                                {user.joinDate}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

function RecentOrdersTable({ orders, ui, loading }) {
    const statusConfig = {
        completed: { label: 'Ho\u00e0n th\u00e0nh', color: 'text-emerald-600 bg-emerald-500/10', icon: CheckCircle2 },
        pending: { label: '\u0110ang x\u1eed l\u00fd', color: 'text-amber-600 bg-amber-500/10', icon: Activity },
        cancelled: { label: '\u0110\u00e3 h\u1ee7y', color: 'text-red-500 bg-red-500/10', icon: XCircle },
    };

    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-violet-500" />
                    <h3 className="text-lg font-black text-base-content">{ui?.title || '\u0110\u01a1n h\u00e0ng G\u1ea7n \u0110\u00e2y'}</h3>
                </div>
                <button type="button" className="btn btn-ghost btn-xs font-bold text-emerald-600">
                    {ui?.actionLabel || 'Xem t\u1ea5t c\u1ea3'}
                    <ArrowUpRight className="h-3 w-3" />
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <SectionLoading />
            ) : orders.length === 0 ? (
                <EmptyState message="Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng g\u1ea7n \u0111\u00e2y." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr className="text-base-content/60">
                                {(ui?.columns || []).map((column) => (
                                    <th key={column.key} className="text-xs font-bold uppercase">{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const status = statusConfig[order.status] || statusConfig.completed;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={`${order.id}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 + index * 0.06 }}
                                        className="cursor-pointer hover:bg-base-200/50"
                                    >
                                        <td>
                                            <span className="font-mono text-sm font-bold text-base-content">{order.id}</span>
                                            <br />
                                            <span className="text-xs text-base-content/50">{order.date}</span>
                                        </td>
                                        <td>
                                            <p className="max-w-[150px] truncate text-sm font-bold text-base-content">{order.course}</p>
                                            <p className="text-xs text-base-content/50">{order.user}</p>
                                        </td>
                                        <td>
                                            <span className="text-sm font-black text-base-content">{order.amountDisplay || formatCurrencyVND(order.amount)}</span>
                                        </td>
                                        <td>
                                            <span className={`flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {order.statusLabel || status.label}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

function SectionLoading() {
    return (
        <div className="flex items-center justify-center py-16 text-base-content/60">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="rounded-2xl border border-dashed border-base-300 px-4 py-10 text-center">
            <div className="mb-2 flex justify-center">
                <Star className="h-5 w-5 text-base-content/30" />
            </div>
            <p className="text-sm font-medium text-base-content/60">{message}</p>
        </div>
    );
}

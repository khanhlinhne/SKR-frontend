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
        return `₫${(numeric / 1_000_000_000).toFixed(absValue >= 10_000_000_000 ? 0 : 1)}B`;
    }

    if (absValue >= 1_000_000) {
        return `₫${(numeric / 1_000_000).toFixed(absValue >= 10_000_000 ? 0 : 1)}M`;
    }

    if (absValue >= 1_000) {
        return `₫${(numeric / 1_000).toFixed(absValue >= 10_000 ? 0 : 1)}K`;
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
        return `${Math.max(1, diffMinutes)} phút trước`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
        return `${diffDays} ngày trước`;
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
    return payload?.data?.data || payload?.data || payload || {};
}

function normalizeRevenueSeries(items) {
    return items.map((item, index) => ({
        month: formatMonthLabel(pickCandidate(item, ['month', 'label', 'name', 'x', 'date'], null), index),
        revenue: toNumber(pickCandidate(item, ['revenue', 'amount', 'value', 'total'], 0)),
        displayAmount: pickCandidate(item, ['displayAmount', 'formattedAmount', 'formattedValue'], null),
    }));
}

function normalizeTopCourses(items) {
    return items
        .map((course, index) => ({
            id: pickCandidate(course, ['courseId', 'id'], `course-${index}`),
            name: pickCandidate(course, ['courseName', 'name', 'title'], 'Khóa học'),
            students: toNumber(pickCandidate(course, ['studentCount', 'students', 'totalStudents'], 0)),
            rating: toNumber(pickCandidate(course, ['rating', 'averageRating'], 0)),
            revenue: toNumber(pickCandidate(course, ['revenue', 'totalRevenue', 'value'], 0)),
            revenueDisplay: pickCandidate(course, ['formattedRevenue', 'revenueDisplay'], null),
            growth: pickCandidate(course, ['growthPercent', 'changePercent', 'growth'], 0),
            growthDisplay: pickCandidate(course, ['growthLabel', 'formattedGrowth'], null),
        }))
        .slice(0, 4);
}

function normalizeRecentUsers(items) {
    return items
        .map((user, index) => ({
            id: pickCandidate(user, ['userId', 'id', '_id'], `user-${index}`),
            name: pickCandidate(user, [
                'fullName',
                'displayName',
                'name',
                'email',
            ], 'Người dùng mới'),
            email: pickCandidate(user, ['email'], '—'),
            avatar: pickCandidate(user, ['avatarUrl', 'avatar'], ''),
            role: formatRole(pickCandidate(user, ['role', 'accountType'], 'Learner')),
            status: deriveUserStatus(user),
            statusLabel: pickCandidate(user, ['statusLabel'], null),
            joinDate: pickCandidate(user, ['joinedRelative', 'createdRelative'], formatRelativeTime(pickCandidate(user, ['createdAt', 'created_at', 'joinedAt'], null))),
        }))
        .slice(0, 5);
}

function normalizeRecentOrders(items) {
    return items
        .map((order, index) => ({
            id: pickCandidate(order, ['displayCode', 'orderCode', 'code', 'id'], `ORD-${index + 1}`),
            course: pickCandidate(order, [
                'courseName',
                'itemName',
                (value) => value?.course?.name,
                (value) => value?.subject?.subjectName,
            ], 'Khóa học'),
            user: pickCandidate(order, [
                'customerName',
                (value) => value?.user?.fullName,
                (value) => value?.customer?.fullName,
            ], 'Người mua'),
            amount: toNumber(pickCandidate(order, ['amount', 'totalAmount', 'paidAmount', 'finalAmount'], 0)),
            amountDisplay: pickCandidate(order, ['formattedAmount', 'amountDisplay'], null),
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
                sectionSubtitle: 'Tổng quan hoạt động hệ thống SKR',
            },
            revenueChart: ui.revenueChart || {
                title: 'Biểu đồ Doanh thu',
                subtitle: 'Tổng doanh thu 12 tháng qua',
                legendLabel: 'Doanh thu',
            },
            featuredCourses: ui.featuredCourses || {
                title: 'Khóa học Nổi bật',
                actionLabel: 'Xem tất cả',
            },
            recentUsers: ui.recentUsers || {
                title: 'Người dùng Mới',
                actionLabel: 'Xem tất cả',
                columns: [
                    { key: 'user', label: 'Người dùng' },
                    { key: 'role', label: 'Vai trò' },
                    { key: 'status', label: 'Trạng thái' },
                    { key: 'joined', label: 'Tham gia' },
                ],
            },
            recentOrders: ui.recentOrders || {
                title: 'Đơn hàng Gần đây',
                actionLabel: 'Xem tất cả',
                columns: [
                    { key: 'order', label: 'Mã đơn' },
                    { key: 'course', label: 'Khóa học' },
                    { key: 'amount', label: 'Số tiền' },
                    { key: 'status', label: 'Trạng thái' },
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

export {
    formatCompactCurrencyVND,
    formatCount,
    formatCurrencyVND,
    formatGrowth,
    getInitials,
    normalizeDashboardData,
    toNumber,
};

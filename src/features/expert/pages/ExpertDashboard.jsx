import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    DollarSign,
    RefreshCw,
    Star,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { ExpertLayout } from '@/features/expert/components';
import { expertDashboardApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const summaryCardConfig = {
    courses: {
        icon: BookOpen,
        gradient: 'from-violet-500 to-purple-600',
    },
    students: {
        icon: Users,
        gradient: 'from-blue-500 to-cyan-600',
    },
    revenue: {
        icon: DollarSign,
        gradient: 'from-emerald-500 to-teal-600',
    },
    rating: {
        icon: Star,
        gradient: 'from-amber-500 to-orange-600',
    },
};

const courseAccentGradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
];

function formatInteger(value) {
    const number = Number(value ?? 0);
    return Number.isFinite(number) ? number.toLocaleString('vi-VN') : '0';
}

function formatCurrency(value, currencyCode = 'VND') {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number)) {
        return '0đ';
    }

    if (currencyCode === 'VND') {
        return `${number.toLocaleString('vi-VN')}đ`;
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
    }).format(number);
}

function formatRating(value) {
    const number = Number(value ?? 0);
    return Number.isFinite(number) ? number.toFixed(1) : '0.0';
}

function formatPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return null;
    }

    const sign = number > 0 ? '+' : '';
    return `${sign}${number.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function getChangeTone(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number === 0) {
        return 'neutral';
    }

    return number > 0 ? 'up' : 'down';
}

function formatDateTime(value) {
    if (!value) {
        return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatShortDate(value) {
    if (!value) {
        return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatPeriodLabel(period) {
    if (period === 'week') {
        return 'Theo tuần';
    }

    if (period === 'year') {
        return 'Theo năm';
    }

    return 'Theo tháng';
}

function getFallbackSummaryCards(summary) {
    return [
        {
            key: 'courses',
            title: 'Khóa học',
            value: summary?.courses?.total ?? 0,
        },
        {
            key: 'students',
            title: 'Học viên',
            value: summary?.students?.total ?? 0,
        },
        {
            key: 'revenue',
            title: 'Doanh thu',
            value: summary?.revenue?.totalInPeriod ?? 0,
            currencyCode: summary?.revenue?.currencyCode ?? 'VND',
            changePercent: summary?.revenue?.changePercent,
        },
        {
            key: 'rating',
            title: 'Đánh giá',
            value: summary?.rating?.average ?? 0,
        },
    ];
}

function normalizeDashboardResponse(response) {
    const payload = response?.data ?? {};
    const ui = payload.ui ?? {};
    const summary = payload.summary ?? {};
    const summaryCards = Array.isArray(ui.summaryCards) && ui.summaryCards.length > 0
        ? ui.summaryCards
        : getFallbackSummaryCards(summary);
    const studentLoginChart = ui.studentLoginChart ?? {};
    const chartPoints = Array.isArray(studentLoginChart.points) && studentLoginChart.points.length > 0
        ? studentLoginChart.points
        : (Array.isArray(payload.studentLoginsByMonth) ? payload.studentLoginsByMonth : []);
    const myCourses = ui.myCourses ?? {};
    const topCourses = Array.isArray(myCourses.items) && myCourses.items.length > 0
        ? myCourses.items
        : (Array.isArray(payload.topCourses) ? payload.topCourses : []);

    return {
        period: payload.period ?? 'month',
        periodBounds: payload.periodBounds ?? {},
        summary,
        pageTitle: ui.page?.sectionTitle ?? 'Tổng quan',
        pageSubtitle: ui.page?.sectionSubtitle ?? 'Theo dõi khóa học và người học của bạn',
        summaryCards,
        studentLoginChart: {
            title: studentLoginChart.title ?? 'Biểu đồ học viên đăng nhập',
            subtitle: studentLoginChart.subtitle ?? 'Số học viên đăng nhập theo tháng',
            legendLabel: studentLoginChart.legendLabel ?? 'Học viên đăng nhập',
            points: chartPoints,
        },
        myCourses: {
            title: myCourses.title ?? 'Khóa học của tôi',
            items: topCourses,
        },
    };
}

function formatSummaryValue(card) {
    if (card.key === 'revenue') {
        return formatCurrency(card.value, card.currencyCode);
    }

    if (card.key === 'rating') {
        return formatRating(card.value);
    }

    return formatInteger(card.value);
}

function getSummaryDescription(card, dashboard) {
    if (card.key === 'courses') {
        return `${formatInteger(dashboard.summary?.courses?.total)} khóa học đang quản lý`;
    }

    if (card.key === 'students') {
        return `${formatInteger(dashboard.summary?.students?.total)} học viên tích lũy`;
    }

    if (card.key === 'revenue') {
        return `Trong kỳ ${formatPeriodLabel(dashboard.period).toLowerCase()}`;
    }

    if (card.key === 'rating') {
        return `${formatInteger(dashboard.summary?.rating?.ratedCourseCount)} khóa học có đánh giá`;
    }

    return '';
}

function StatsCard({ card, dashboard }) {
    const config = summaryCardConfig[card.key] ?? summaryCardConfig.courses;
    const Icon = config.icon;
    const changeText = formatPercent(card.changePercent);
    const tone = getChangeTone(card.changePercent);
    const TrendIcon = tone === 'down' ? TrendingDown : TrendingUp;

    return (
        <motion.div
            variants={cardVariants}
            className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg"
        >
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {changeText && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            tone === 'up'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : tone === 'down'
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-base-200 text-base-content/60'
                        }`}
                    >
                        <TrendIcon className="h-3.5 w-3.5" />
                        {changeText}
                    </span>
                )}
            </div>

            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/45">
                {card.title}
            </p>
            <h3 className="text-3xl font-black text-base-content">{formatSummaryValue(card)}</h3>
            <p className="mt-1 text-sm font-medium text-base-content/55">
                {getSummaryDescription(card, dashboard)}
            </p>
        </motion.div>
    );
}

function StudentLoginChartCard({ chart }) {
    const points = Array.isArray(chart.points) ? chart.points : [];
    const maxValue = Math.max(1, ...points.map((item) => Number(item.total ?? 0)));
    const totalLogins = points.reduce((sum, item) => sum + Number(item.total ?? 0), 0);

    return (
        <motion.div
            variants={cardVariants}
            className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg lg:col-span-2"
        >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-base-content">{chart.title}</h3>
                    <p className="mt-1 text-sm text-base-content/60">{chart.subtitle}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                    {chart.legendLabel}
                </div>
            </div>

            {points.length === 0 ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/40 px-6 text-center text-sm text-base-content/55">
                    Chưa có dữ liệu đăng nhập để hiển thị biểu đồ.
                </div>
            ) : (
                <div className="rounded-2xl bg-gradient-to-b from-violet-500/[0.05] to-transparent p-4">
                    <div className="flex items-end gap-2" style={{ height: '240px' }}>
                        {points.map((item, index) => {
                            const total = Number(item.total ?? 0);
                            const height = Math.max(total > 0 ? 12 : 4, Math.round((total / maxValue) * 180));
                            const isLatest = index === points.length - 1;

                            return (
                                <div key={`${item.year}-${item.month}-${item.label}`} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                                    <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-xl bg-base-content px-3 py-2 text-xs font-bold text-base-100 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                        <p>{item.label}: {formatInteger(total)} học viên</p>
                                        <p className="mt-0.5 text-[10px] font-medium text-base-100/80">
                                            {item.month}/{item.year}
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height }}
                                        transition={{
                                            delay: 0.2 + index * 0.04,
                                            duration: 0.55,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                        }}
                                        className={`w-full rounded-t-[18px] transition-colors ${
                                            isLatest
                                                ? 'bg-gradient-to-t from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/25'
                                                : 'bg-violet-500/25 group-hover:bg-violet-500/45'
                                        }`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex gap-2">
                        {points.map((item) => (
                            <div key={`${item.year}-${item.month}-label`} className="flex-1 text-center">
                                <span className="text-[10px] font-bold text-base-content/45">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4">
                <p className="text-sm text-base-content/60">
                    Ghi nhận <span className="font-black text-base-content">{formatInteger(totalLogins)}</span> học viên đăng nhập trong 12 mốc gần nhất
                </p>
                <p className="text-xs font-medium text-base-content/45">
                    Mốc cao nhất: {formatInteger(maxValue)} học viên
                </p>
            </div>
        </motion.div>
    );
}

function MyCoursesCard({ coursesTitle, courses }) {
    return (
        <motion.div
            variants={cardVariants}
            className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg"
        >
            <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-base-content">{coursesTitle}</h3>
                <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-bold text-base-content/60">
                    {formatInteger(courses.length)} khóa
                </span>
            </div>

            {courses.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/40 px-6 text-center text-sm text-base-content/55">
                    Chưa có khóa học nổi bật trong kỳ này.
                </div>
            ) : (
                <div className="space-y-3">
                    {courses.map((course, index) => (
                        <div
                            key={course.courseId || `${course.courseCode}-${index}`}
                            className="flex items-start gap-3 rounded-2xl border border-base-300/70 bg-base-100 p-4 transition-colors hover:bg-base-200/40"
                        >
                            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${courseAccentGradients[index % courseAccentGradients.length]} text-sm font-black text-white shadow-lg`}>
                                #{course.rank ?? index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="truncate text-sm font-black text-base-content">
                                            {course.courseName}
                                        </h4>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                                            {course.courseCode || 'Đang cập nhật mã khóa học'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-base-content">
                                            {formatCurrency(course.revenue)}
                                        </p>
                                        <p className="mt-1 text-[11px] font-medium text-base-content/45">
                                            Doanh thu
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-600">
                                        <Users className="h-3.5 w-3.5" />
                                        {formatInteger(course.studentCount)} học viên
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-600">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        {formatRating(course.rating)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function ReportingPeriodCard({ period, periodBounds }) {
    return (
        <motion.div
            variants={cardVariants}
            className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg"
        >
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-base-content">Kỳ báo cáo</h3>
                    <p className="text-sm text-base-content/60">{formatPeriodLabel(period)}</p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-base-200/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/45">Kỳ hiện tại</p>
                    <p className="mt-2 text-sm font-bold text-base-content">
                        {formatDateTime(periodBounds.currentStartUtc)}
                    </p>
                    <p className="mt-1 text-sm text-base-content/60">
                        đến {formatDateTime(periodBounds.currentEndUtc)}
                    </p>
                </div>

                <div className="rounded-2xl bg-base-200/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/45">Kỳ trước</p>
                    <p className="mt-2 text-sm font-bold text-base-content">
                        {formatDateTime(periodBounds.previousStartUtc)}
                    </p>
                    <p className="mt-1 text-sm text-base-content/60">
                        đến {formatDateTime(periodBounds.previousEndUtc)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default function ExpertDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await expertDashboardApi.getMe();
            setDashboard(normalizeDashboardResponse(response));
        } catch (err) {
            console.error('[ExpertDashboard] fetch error:', err);
            setError(err?.response?.data?.message || err?.message || 'Không thể tải dashboard chuyên gia lúc này.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <ExpertLayout>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <OwlLoader
                        message="Đang tải dashboard chuyên gia..."
                        subMessage="SKR đang đồng bộ dữ liệu khóa học và học viên của bạn."
                        className="py-8"
                    />
                </div>
            ) : error ? (
                <div className="rounded-3xl border border-red-500/20 bg-base-100 p-10 text-center shadow-lg">
                    <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                    <h2 className="text-xl font-black text-base-content">Không thể tải dữ liệu</h2>
                    <p className="mt-2 text-sm text-base-content/55">{error}</p>
                    <button
                        type="button"
                        onClick={fetchDashboard}
                        className="btn mt-5 rounded-2xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-white shadow-lg shadow-violet-500/25"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Thử lại
                    </button>
                </div>
            ) : dashboard ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={cardVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-base-content lg:text-3xl">
                                {dashboard.pageTitle}
                            </h1>
                            <p className="mt-1 text-sm text-base-content/60">
                                {dashboard.pageSubtitle}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/45">
                                    Kỳ hiện tại
                                </p>
                                <p className="mt-1 text-sm font-bold text-base-content">
                                    {formatShortDate(dashboard.periodBounds.currentStartUtc)} - {formatShortDate(dashboard.periodBounds.currentEndUtc)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fetchDashboard}
                                className="btn rounded-2xl border-base-300 bg-base-100 px-4 shadow-sm"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Làm mới
                            </button>
                        </div>
                    </motion.div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboard.summaryCards.map((card) => (
                            <StatsCard key={card.key} card={card} dashboard={dashboard} />
                        ))}
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <StudentLoginChartCard chart={dashboard.studentLoginChart} />
                        <MyCoursesCard
                            coursesTitle={dashboard.myCourses.title}
                            courses={dashboard.myCourses.items}
                        />
                    </div>

                    <ReportingPeriodCard
                        period={dashboard.period}
                        periodBounds={dashboard.periodBounds}
                    />
                </motion.div>
            ) : null}
        </ExpertLayout>
    );
}

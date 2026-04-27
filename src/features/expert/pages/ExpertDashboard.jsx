import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    FileText,
    GraduationCap,
    HelpCircle,
    Layers3,
    LineChart,
    ListChecks,
    PlayCircle,
    RefreshCw,
    Star,
    TrendingDown,
    TrendingUp,
    Users,
    Activity,
    PieChart,
    Zap,
} from 'lucide-react';
import { ExpertLayout } from '@/features/expert/components';
import { expertDashboardApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & CONFIG
   ═══════════════════════════════════════════════════════════ */

const PERIOD_OPTIONS = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'year', label: 'Năm' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const summaryCardConfig = {
    courses: { icon: BookOpen, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/8', title: 'Khóa học' },
    students: { icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/8', title: 'Học viên' },
    activeLearners: { icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/8', title: 'Đang học' },
    completedLearners: { icon: CheckCircle2, gradient: 'from-sky-500 to-indigo-500', bg: 'bg-sky-500/8', title: 'Hoàn thành' },
    rating: { icon: Star, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/8', title: 'Đánh giá' },
    content: { icon: Layers3, gradient: 'from-fuchsia-500 to-rose-500', bg: 'bg-fuchsia-500/8', title: 'Nội dung' },
};

const courseAccentGradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-rose-500',
];

const DONUT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];
const BAR_GRADIENTS = [
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-rose-500',
];

/* ═══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function unwrapDashboardResponse(response) {
    return response?.data?.data ?? response?.data ?? response ?? {};
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function toNumber(value, fallback = 0) {
    const number = Number(value ?? fallback);
    return Number.isFinite(number) ? number : fallback;
}

function pickNumber(source, keys, fallback = 0) {
    const object = asObject(source);
    const foundKey = keys.find((key) => object[key] !== undefined && object[key] !== null);
    return foundKey ? toNumber(object[foundKey], fallback) : fallback;
}

function pickText(source, keys, fallback = 'Đang cập nhật') {
    const object = asObject(source);
    const foundKey = keys.find((key) => object[key] !== undefined && object[key] !== null && object[key] !== '');
    return foundKey ? String(object[foundKey]) : fallback;
}

function formatInteger(value) {
    return toNumber(value).toLocaleString('vi-VN');
}

function formatCompact(value) {
    return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(toNumber(value));
}

function formatRating(value) {
    return toNumber(value).toFixed(1);
}

function formatPercentValue(value) {
    const number = toNumber(value);
    const normalized = number > 0 && number <= 1 ? number * 100 : number;
    return `${normalized.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function formatChange(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number === 0) return null;
    const sign = number > 0 ? '+' : '';
    return `${sign}${number.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function formatMinutes(value) {
    const minutes = toNumber(value);
    if (minutes < 60) return `${formatInteger(minutes)} phút`;
    return `${(minutes / 60).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giờ`;
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(date);
}

function formatShortDate(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatPeriodLabel(period) {
    if (period === 'week') return 'Theo tuần';
    if (period === 'year') return 'Theo năm';
    return 'Theo tháng';
}

/* ═══════════════════════════════════════════════════════════
   DATA NORMALIZATION
   ═══════════════════════════════════════════════════════════ */

function getFallbackSummaryCards(summary, contentQuality, learnerOverview) {
    return [
        { key: 'courses', value: summary?.courses?.total ?? 0 },
        { key: 'students', value: summary?.students?.total ?? 0 },
        { key: 'activeLearners', value: learnerOverview?.activeLearners ?? summary?.students?.active ?? 0 },
        { key: 'completedLearners', value: learnerOverview?.completedLearners ?? summary?.students?.completed ?? 0 },
        { key: 'rating', value: summary?.rating?.average ?? 0 },
        { key: 'content', value: contentQuality?.totals?.total ?? contentQuality?.totals?.items ?? 0 },
    ];
}

function normalizeChartPoint(point, index) {
    const label = pickText(point, ['label', 'period', 'monthLabel', 'date'], `Tuần ${index + 1}`);
    return {
        ...point,
        label,
        total: pickNumber(point, ['total', 'count', 'value', 'newLearners', 'students', 'learners']),
    };
}

function normalizeDashboardResponse(response, selectedPeriod) {
    const payload = unwrapDashboardResponse(response);
    const ui = asObject(payload.ui);
    const summary = asObject(payload.summary);
    const courseStatus = asObject(payload.courseStatus);
    const learnerOverview = asObject(payload.learnerOverview);
    const learningProgress = asObject(payload.learningProgress);
    const contentQuality = asObject(payload.contentQuality);
    const quizOverview = asObject(payload.quizOverview);

    const apiCards = asArray(ui.summaryCards).filter((card) => card?.key !== 'revenue');
    const summaryCards = (apiCards.length > 0 ? apiCards : getFallbackSummaryCards(summary, contentQuality, learnerOverview))
        .filter((card) => card?.key !== 'revenue')
        .map((card) => ({
            ...card,
            title: summaryCardConfig[card.key]?.title ?? 'Chỉ số',
            value: card.value ?? 0,
        }));

    const studentLoginChart = asObject(ui.studentLoginChart);
    const chartPoints = asArray(learnerOverview.newLearnerSeries).length > 0
        ? asArray(learnerOverview.newLearnerSeries)
        : (asArray(studentLoginChart.points).length > 0 ? asArray(studentLoginChart.points) : asArray(payload.studentLoginsByMonth));
    const myCourses = asObject(ui.myCourses);
    const topCourses = asArray(myCourses.items).length > 0 ? asArray(myCourses.items) : asArray(payload.topCourses);

    return {
        period: payload.period ?? selectedPeriod,
        periodBounds: asObject(payload.periodBounds),
        summary,
        pageTitle: 'Tổng quan',
        pageSubtitle: 'Theo dõi khóa học, học viên và chất lượng nội dung của bạn',
        summaryCards,
        newLearnerChart: {
            title: 'Học viên mới theo kỳ',
            subtitle: `Số lượng học viên mới ${formatPeriodLabel(payload.period ?? selectedPeriod).toLowerCase()}`,
            legendLabel: 'Học viên mới',
            points: chartPoints.map(normalizeChartPoint),
        },
        myCourses: { title: 'Khóa học nổi bật', items: topCourses },
        courseStatus: {
            summary: asObject(courseStatus.summary),
            missingContentCourses: asArray(courseStatus.missingContentCourses),
            noStudentCourses: asArray(courseStatus.noStudentCourses),
            lowRatedCourses: asArray(courseStatus.lowRatedCourses),
            mostStudiedCourses: asArray(courseStatus.mostStudiedCourses),
            bestCompletionCourses: asArray(courseStatus.bestCompletionCourses),
        },
        learnerOverview: {
            ...learnerOverview,
            newLearnerSeries: chartPoints.map(normalizeChartPoint),
            inactiveBuckets: asArray(learnerOverview.inactiveBuckets),
            topActiveLearners: asArray(learnerOverview.topActiveLearners),
            learnersNeedingAttention: asArray(learnerOverview.learnersNeedingAttention),
        },
        learningProgress: {
            ...learningProgress,
            progressDistribution: asArray(learningProgress.progressDistribution),
            topLessons: asArray(learningProgress.topLessons),
            topVideos: asArray(learningProgress.topVideos),
            dropOffPoints: asArray(learningProgress.dropOffPoints),
            totalVideoWatchMinutes: toNumber(learningProgress.totalVideoWatchMinutes),
        },
        contentQuality: {
            ...contentQuality,
            totals: asObject(contentQuality.totals),
            newInPeriod: asObject(contentQuality.newInPeriod),
            pending: asObject(contentQuality.pending),
            lowCompletionVideos: asArray(contentQuality.lowCompletionVideos),
            topDocuments: asArray(contentQuality.topDocuments),
            topFlashcards: asArray(contentQuality.topFlashcards),
            weakQuestions: asArray(contentQuality.weakQuestions),
        },
        quizOverview: {
            ...quizOverview,
            totalQuestions: toNumber(quizOverview.totalQuestions),
            questionTypeBreakdown: asArray(quizOverview.questionTypeBreakdown),
            difficultyBreakdown: asArray(quizOverview.difficultyBreakdown),
            totalAttempts: toNumber(quizOverview.totalAttempts),
            averageScore: toNumber(quizOverview.averageScore),
            passRate: toNumber(quizOverview.passRate),
            mostMissedQuestions: asArray(quizOverview.mostMissedQuestions),
        },
    };
}

function formatSummaryValue(card) {
    if (card.key === 'rating') return formatRating(card.value);
    return formatInteger(card.value);
}

function getSummaryDescription(card, dashboard) {
    if (card.key === 'courses') return `${formatInteger(dashboard.summary?.courses?.total)} khóa học đang quản lý`;
    if (card.key === 'students') return `${formatInteger(dashboard.summary?.students?.total)} học viên tích lũy`;
    if (card.key === 'activeLearners') return `Có hoạt động trong ${formatPeriodLabel(dashboard.period).toLowerCase()}`;
    if (card.key === 'completedLearners') return 'Đã hoàn thành khóa học';
    if (card.key === 'rating') return `${formatInteger(dashboard.summary?.rating?.ratedCourseCount)} khóa học có đánh giá`;
    if (card.key === 'content') return 'Video, tài liệu, flashcard và câu hỏi';
    return '';
}

/* ═══════════════════════════════════════════════════════════
   SVG CHART COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function DonutChart({ segments, size = 140, strokeWidth = 16, centerLabel, centerValue }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;
    const total = segments.reduce((sum, s) => sum + toNumber(s.value), 0);
    let accumulatedOffset = 0;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-base-200" />
                {total > 0 && segments.map((seg, i) => {
                    const pct = toNumber(seg.value) / total;
                    const dashLength = pct * circumference;
                    const gap = segments.length > 1 ? 3 : 0;
                    const offset = accumulatedOffset;
                    accumulatedOffset += dashLength + gap;
                    if (pct <= 0) return null;
                    return (
                        <motion.circle
                            key={seg.label || i}
                            cx={center} cy={center} r={radius}
                            fill="none"
                            stroke={seg.color || DONUT_COLORS[i % DONUT_COLORS.length]}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${Math.max(0, dashLength - gap)} ${circumference - Math.max(0, dashLength - gap)}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${Math.max(0, dashLength - gap)} ${circumference - Math.max(0, dashLength - gap)}` }}
                            transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                    );
                })}
            </svg>
            {(centerLabel || centerValue !== undefined) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {centerValue !== undefined && <span className="text-2xl font-black text-base-content">{centerValue}</span>}
                    {centerLabel && <span className="text-[10px] font-bold text-base-content/50">{centerLabel}</span>}
                </div>
            )}
        </div>
    );
}

function GaugeChart({ value, max = 100, size = 130, strokeWidth = 14, color = '#8b5cf6', label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius;
    const center = size / 2;
    const pct = max > 0 ? Math.min(1, toNumber(value) / max) : 0;
    const dashLength = pct * circumference;

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
                <path
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
                    className="text-base-200"
                />
                <motion.path
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - dashLength }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                <span className="text-xl font-black text-base-content">{formatPercentValue(value)}</span>
                {label && <span className="text-[10px] font-bold text-base-content/45">{label}</span>}
            </div>
        </div>
    );
}

function HorizontalBarChart({ items, maxValue: propMax, colorIndex = 0 }) {
    const maxValue = propMax || Math.max(1, ...items.map((item) => toNumber(item.value)));
    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const val = toNumber(item.value);
                const pct = maxValue > 0 ? (val / maxValue) * 100 : 0;
                const gradient = BAR_GRADIENTS[(colorIndex + i) % BAR_GRADIENTS.length];
                return (
                    <div key={item.label || i}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-base-content">{item.label}</span>
                            <span className="flex-shrink-0 text-xs font-black text-base-content">{item.display || formatInteger(val)}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-base-200">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(pct > 0 ? 4 : 0, pct)}%` }}
                                transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════
   UI BUILDING BLOCKS
   ═══════════════════════════════════════════════════════════ */

function StatsCard({ card, dashboard }) {
    const config = summaryCardConfig[card.key] ?? summaryCardConfig.courses;
    const Icon = config.icon;
    const changeText = formatChange(card.changePercent);
    const isDown = toNumber(card.changePercent) < 0;
    const TrendIcon = isDown ? TrendingDown : TrendingUp;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-base-300/60 bg-base-100 p-5 shadow-md transition-shadow hover:shadow-xl"
        >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-[0.06] transition-opacity group-hover:opacity-[0.12]`} />
            <div className="relative">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {changeText && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${isDown ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            <TrendIcon className="h-3 w-3" />
                            {changeText}
                        </span>
                    )}
                </div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-base-content/40">{card.title}</p>
                <h3 className="text-3xl font-black tracking-tight text-base-content">{formatSummaryValue(card)}</h3>
                <p className="mt-1.5 text-[11px] font-semibold text-base-content/50">{getSummaryDescription(card, dashboard)}</p>
            </div>
        </motion.div>
    );
}

function SectionCard({ title, subtitle, icon: Icon, children, className = '', noPadding = false }) {
    return (
        <motion.section variants={cardVariants} className={`overflow-hidden rounded-2xl border border-base-300/60 bg-base-100 shadow-md ${className}`}>
            <div className="flex items-start gap-3 border-b border-base-200/80 px-6 py-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-600">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-black text-base-content">{title}</h3>
                    {subtitle && <p className="mt-0.5 text-xs text-base-content/50">{subtitle}</p>}
                </div>
            </div>
            <div className={noPadding ? '' : 'p-6'}>{children}</div>
        </motion.section>
    );
}

function EmptyState({ children = 'Chưa có dữ liệu cho kỳ này.' }) {
    return (
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200/30 px-6 text-center text-xs font-semibold text-base-content/45">
            {children}
        </div>
    );
}

function ChartLegend({ items }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {items.map((item, i) => (
                <div key={item.label || i} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || DONUT_COLORS[i] }} />
                    <span className="text-[10px] font-bold text-base-content/55">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

function CompactList({ items, emptyText, renderItem }) {
    if (items.length === 0) return <EmptyState>{emptyText}</EmptyState>;
    return <div className="space-y-2">{items.slice(0, 5).map(renderItem)}</div>;
}

/* ═══════════════════════════════════════════════════════════
   SECTION: NEW LEARNER CHART (Bar + Area)
   ═══════════════════════════════════════════════════════════ */

function NewLearnerChartCard({ chart }) {
    const points = asArray(chart.points);
    const maxValue = Math.max(1, ...points.map((item) => toNumber(item.total)));
    const totalLearners = points.reduce((sum, item) => sum + toNumber(item.total), 0);

    /* Generate grid lines — 4 horizontal guides */
    const gridSteps = 4;
    const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
        const val = Math.round((maxValue / gridSteps) * (gridSteps - i));
        return { value: val, pct: (i / gridSteps) * 100 };
    });

    const barHeight = 220;

    return (
        <SectionCard title={chart.title} subtitle={chart.subtitle} icon={LineChart} className="lg:col-span-2">
            {/* Legend row */}
            <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/8 px-3 py-1.5 text-[10px] font-black text-violet-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-sm shadow-violet-400/40" />
                    {chart.legendLabel}
                </div>
                <div className="flex items-center gap-3">
                    <span className="rounded-md bg-base-200/60 px-2 py-1 text-[10px] font-bold text-base-content/50">
                        Cao nhất: <span className="font-black text-violet-600">{formatInteger(maxValue)}</span>
                    </span>
                </div>
            </div>

            {points.length === 0 ? (
                <EmptyState>Chưa có học viên mới để hiển thị biểu đồ.</EmptyState>
            ) : (
                <div className="rounded-2xl border border-base-200/60 bg-gradient-to-b from-violet-500/[0.03] via-transparent to-transparent p-5">
                    {/* Chart area with Y-axis labels + grid lines */}
                    <div className="flex gap-3">
                        {/* Y-axis labels */}
                        <div className="flex w-8 flex-shrink-0 flex-col justify-between py-0.5" style={{ height: barHeight }}>
                            {gridLines.map((g) => (
                                <span key={g.value} className="text-right text-[9px] font-bold tabular-nums text-base-content/30">
                                    {g.value}
                                </span>
                            ))}
                        </div>

                        {/* Bars area */}
                        <div className="relative flex-1">
                            {/* Grid lines */}
                            {gridLines.map((g) => (
                                <div
                                    key={`grid-${g.value}`}
                                    className="absolute left-0 right-0 border-t border-base-300/40"
                                    style={{ top: `${g.pct}%` }}
                                />
                            ))}

                            {/* Bars */}
                            <div className="relative flex items-end gap-2" style={{ height: barHeight }}>
                                {points.map((item, index) => {
                                    const total = toNumber(item.total);
                                    const heightPx = Math.max(total > 0 ? 16 : 6, Math.round((total / maxValue) * (barHeight - 24)));
                                    const isLatest = index === points.length - 1;
                                    const isMax = total === maxValue && total > 0;

                                    return (
                                        <div key={`${item.label}-${index}`} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                                            {/* Tooltip on hover */}
                                            <div className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 z-20 w-max -translate-x-1/2 scale-90 rounded-xl bg-base-content px-3 py-2 text-center opacity-0 shadow-2xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                                                <p className="text-[10px] font-black text-base-100">{formatInteger(total)}</p>
                                                <p className="text-[9px] font-semibold text-base-100/60">{item.label}</p>
                                                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-base-content" />
                                            </div>

                                            {/* Value label above bar */}
                                            <motion.span
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + index * 0.05 }}
                                                className={`mb-1.5 text-[10px] font-black ${isMax ? 'text-violet-600' : 'text-base-content/40'}`}
                                            >
                                                {total > 0 ? formatInteger(total) : ''}
                                            </motion.span>

                                            {/* Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: heightPx }}
                                                transition={{ delay: 0.15 + index * 0.05, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                className={`relative w-full cursor-pointer rounded-t-xl transition-all duration-200 group-hover:scale-x-105 ${
                                                    isLatest || isMax
                                                        ? 'bg-gradient-to-t from-violet-600 via-violet-500 to-fuchsia-400 shadow-lg shadow-violet-500/25'
                                                        : 'bg-gradient-to-t from-violet-400/30 to-violet-300/20 group-hover:from-violet-500/50 group-hover:to-violet-400/30 group-hover:shadow-md group-hover:shadow-violet-400/15'
                                                }`}
                                            >
                                                {/* Inner highlight for depth */}
                                                <div className="absolute inset-x-1 top-1 h-1/3 rounded-t-lg bg-white/10" />
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-axis labels */}
                            <div className="mt-3 flex gap-2">
                                {points.map((item, index) => (
                                    <div key={`${item.label}-${index}-label`} className="min-w-0 flex-1 text-center">
                                        <span className="block truncate text-[10px] font-bold text-base-content/45">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer stats */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-base-200 pt-4">
                <div className="flex items-center gap-4">
                    <p className="text-xs text-base-content/55">
                        Tổng cộng <span className="font-black text-violet-600">{formatInteger(totalLearners)}</span> học viên mới
                    </p>
                    <span className="h-3.5 w-px bg-base-300" />
                    <p className="text-xs text-base-content/40">
                        Trung bình <span className="font-bold text-base-content/60">{points.length > 0 ? formatInteger(Math.round(totalLearners / points.length)) : 0}</span>/kỳ
                    </p>
                </div>
            </div>
        </SectionCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: MY COURSES
   ═══════════════════════════════════════════════════════════ */

function MyCoursesCard({ coursesTitle, courses }) {
    return (
        <SectionCard title={coursesTitle} subtitle={`${formatInteger(courses.length)} khóa nổi bật`} icon={GraduationCap}>
            {courses.length === 0 ? (
                <EmptyState>Chưa có khóa học nổi bật trong kỳ này.</EmptyState>
            ) : (
                <div className="space-y-2.5">
                    {courses.slice(0, 5).map((course, index) => {
                        const studied = pickNumber(course, ['studiedCount', 'studentCount', 'learnerCount', 'enrollmentCount', 'students']);
                        const completion = pickNumber(course, ['completionRate', 'completedRate', 'averageProgress']);

                        return (
                            <div key={course.courseId || course.id || `${course.courseCode}-${index}`} className="group flex items-start gap-3 rounded-xl border border-base-200/80 bg-base-100 p-3.5 transition-all hover:border-violet-500/20 hover:bg-base-200/30 hover:shadow-sm">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${courseAccentGradients[index % courseAccentGradients.length]} text-xs font-black text-white shadow-md`}>
                                    #{course.rank ?? index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="truncate text-sm font-black text-base-content">{pickText(course, ['courseName', 'name', 'title'], 'Khóa học')}</h4>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">{pickText(course, ['courseCode', 'code', 'slug'], '--')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-base-content">{formatPercentValue(completion)}</p>
                                            <p className="text-[10px] font-semibold text-base-content/40">Hoàn thành</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/8 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                            <Users className="h-3 w-3" /> {formatInteger(studied)} HV
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/8 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                            <Star className="h-3 w-3 fill-current" /> {formatRating(pickNumber(course, ['rating', 'averageRating']))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: COURSE STATUS (with Donut Chart)
   ═══════════════════════════════════════════════════════════ */

function CourseStatusSection({ data }) {
    const summary = asObject(data.summary);
    const entries = Object.entries(summary);

    const statusLabels = {
        total: 'Tổng', published: 'Đã xuất bản', draft: 'Bản nháp',
        active: 'Đang hoạt động', pending: 'Chờ duyệt', archived: 'Lưu trữ',
    };

    const donutSegments = entries
        .filter(([key]) => key !== 'total')
        .map(([key, value], i) => ({
            label: statusLabels[key] || key,
            value: toNumber(value),
            color: DONUT_COLORS[i % DONUT_COLORS.length],
        }));

    const totalCourses = toNumber(summary.total) || donutSegments.reduce((s, seg) => s + seg.value, 0);

    return (
        <SectionCard title="Tình trạng khóa học" subtitle="Phân bổ trạng thái và các điểm cần chú ý" icon={PieChart}>
            <div className="grid gap-6 xl:grid-cols-5">
                {/* Donut */}
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-base-200/30 p-5 xl:col-span-2">
                    {donutSegments.length > 0 ? (
                        <>
                            <DonutChart segments={donutSegments} centerValue={formatInteger(totalCourses)} centerLabel="Khóa học" />
                            <ChartLegend items={donutSegments} />
                        </>
                    ) : (
                        <div className="text-center">
                            <DonutChart segments={[{ value: 1, color: '#e5e7eb' }]} centerValue={formatInteger(totalCourses)} centerLabel="Khóa học" />
                            <p className="mt-3 text-xs font-semibold text-base-content/40">Chưa có dữ liệu phân bổ</p>
                        </div>
                    )}
                </div>

                {/* Insight Lists */}
                <div className="grid gap-3 sm:grid-cols-2 xl:col-span-3">
                    <InsightList title="Thiếu nội dung" items={data.missingContentCourses} emptyText="Không có khóa thiếu nội dung." tone="warning" />
                    <InsightList title="Chưa có học viên" items={data.noStudentCourses} emptyText="Tất cả khóa đã có học viên." tone="info" />
                    <InsightList title="Đánh giá thấp" items={data.lowRatedCourses} emptyText="Chưa có khóa bị đánh giá thấp." tone="danger" />
                    <InsightList title="Hoàn thành tốt" items={data.bestCompletionCourses} emptyText="Chưa có dữ liệu hoàn thành." tone="success" />
                </div>
            </div>
        </SectionCard>
    );
}

function InsightList({ title, items, emptyText, tone = 'info' }) {
    const toneConfig = {
        info: { bg: 'bg-blue-500/8', text: 'text-blue-600', dot: 'bg-blue-500' },
        warning: { bg: 'bg-amber-500/8', text: 'text-amber-600', dot: 'bg-amber-500' },
        danger: { bg: 'bg-red-500/8', text: 'text-red-500', dot: 'bg-red-500' },
        success: { bg: 'bg-emerald-500/8', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    }[tone];

    return (
        <div className="rounded-xl border border-base-200/80 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-base-content">
                <span className={`h-2 w-2 rounded-full ${toneConfig.dot}`} />
                {title}
            </h4>
            <CompactList
                items={items}
                emptyText={emptyText}
                renderItem={(item, index) => (
                    <div key={item.courseId || item.id || `${title}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-base-200/40 px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-base-content">{pickText(item, ['courseName', 'name', 'title'], 'Khóa học')}</p>
                        </div>
                        <span className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black ${toneConfig.bg} ${toneConfig.text}`}>
                            {formatCompact(pickNumber(item, ['count', 'studentCount', 'completionRate', 'rating', 'missingCount', 'value']))}
                        </span>
                    </div>
                )}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: LEARNER OVERVIEW (with HorizontalBarChart)
   ═══════════════════════════════════════════════════════════ */

function LearnerOverviewSection({ data }) {
    const bucketItems = asArray(data.inactiveBuckets).map((b) => ({
        label: pickText(b, ['label', 'bucket', 'range'], 'Nhóm'),
        value: pickNumber(b, ['count', 'total', 'learners']),
    }));

    const activeLearnerCount = toNumber(data.activeLearners);
    const inactiveTotal = bucketItems.reduce((s, b) => s + b.value, 0);

    const overviewDonut = [
        { label: 'Đang hoạt động', value: activeLearnerCount, color: '#10b981' },
        { label: 'Ít hoạt động', value: inactiveTotal, color: '#f59e0b' },
    ].filter((s) => s.value > 0);

    return (
        <SectionCard title="Tổng quan học viên" subtitle="Nhóm học viên tích cực, ngừng hoạt động và cần hỗ trợ" icon={Users}>
            <div className="grid gap-5 lg:grid-cols-3">
                {/* Left: Donut + Bar Chart */}
                <div className="space-y-5">
                    {overviewDonut.length > 0 && (
                        <div className="flex flex-col items-center gap-3 rounded-xl bg-base-200/30 p-4">
                            <DonutChart
                                segments={overviewDonut}
                                size={120}
                                strokeWidth={14}
                                centerValue={formatInteger(activeLearnerCount + inactiveTotal)}
                                centerLabel="Tổng"
                            />
                            <ChartLegend items={overviewDonut} />
                        </div>
                    )}
                    {bucketItems.length > 0 ? (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Nhóm ít hoạt động</h4>
                            <HorizontalBarChart items={bucketItems} colorIndex={3} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Nhóm ít hoạt động</h4>
                            <EmptyState>Chưa có dữ liệu nhóm học viên.</EmptyState>
                        </div>
                    )}
                </div>

                {/* Middle: Active Learners */}
                <PersonList title="Học viên tích cực" items={data.topActiveLearners} metricKeys={['activityCount', 'completedLessons', 'watchMinutes', 'score']} tone="success" />

                {/* Right: Needs Attention */}
                <PersonList title="Cần chú ý" items={data.learnersNeedingAttention} metricKeys={['inactiveDays', 'dropOffCount', 'missedCount', 'riskScore']} tone="danger" />
            </div>
        </SectionCard>
    );
}

function PersonList({ title, items, metricKeys, tone = 'success' }) {
    const isSuccess = tone === 'success';
    return (
        <div className="rounded-xl border border-base-200/80 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-base-content">
                <span className={`h-2 w-2 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {title}
            </h4>
            <CompactList
                items={items}
                emptyText="Chưa có học viên trong nhóm này."
                renderItem={(learner, index) => (
                    <div key={learner.userId || learner.learnerId || learner.id || index} className="flex items-center gap-3 rounded-lg bg-base-200/40 px-3 py-2.5">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white ${isSuccess ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                            {(pickText(learner, ['learnerName', 'studentName', 'name'], '?')).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-base-content">{pickText(learner, ['learnerName', 'studentName', 'name', 'email'], 'Học viên')}</p>
                            <p className="truncate text-[10px] text-base-content/45">{pickText(learner, ['courseName', 'email', 'lastActivityLabel'], 'Đang cập nhật')}</p>
                        </div>
                        <span className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black ${isSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                            {formatCompact(pickNumber(learner, metricKeys))}
                        </span>
                    </div>
                )}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: LEARNING PROGRESS (with Gauge + HorizontalBar)
   ═══════════════════════════════════════════════════════════ */

function LearningProgressSection({ data }) {
    const progressItems = asArray(data.progressDistribution).map((item) => ({
        label: pickText(item, ['label', 'range', 'bucket'], 'Mốc'),
        value: pickNumber(item, ['percent', 'percentage', 'rate', 'count']),
    }));

    const avgProgress = progressItems.length > 0
        ? Math.round(progressItems.reduce((s, p) => s + p.value, 0) / progressItems.length)
        : 0;

    return (
        <SectionCard title="Tiến độ học tập" subtitle={`Tổng thời lượng xem video: ${formatMinutes(data.totalVideoWatchMinutes)}`} icon={BarChart3}>
            <div className="grid gap-5 xl:grid-cols-4">
                {/* Gauge + Progress Distribution */}
                <div className="space-y-4 xl:col-span-1">
                    <div className="flex flex-col items-center gap-2 rounded-xl bg-base-200/30 p-4">
                        <GaugeChart value={avgProgress} label="TB tiến độ" color="#8b5cf6" size={120} />
                    </div>
                    {progressItems.length > 0 ? (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Phân bổ tiến độ</h4>
                            <HorizontalBarChart items={progressItems} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Phân bổ tiến độ</h4>
                            <EmptyState>Chưa có dữ liệu tiến độ.</EmptyState>
                        </div>
                    )}
                </div>

                {/* Content Lists */}
                <div className="grid gap-4 sm:grid-cols-3 xl:col-span-3">
                    <RankedContent title="Bài học nổi bật" items={data.topLessons} icon={BookOpen} />
                    <RankedContent title="Video xem nhiều" items={data.topVideos} icon={PlayCircle} />
                    <RankedContent title="Điểm rơi học tập" items={data.dropOffPoints} icon={TrendingDown} />
                </div>
            </div>
        </SectionCard>
    );
}

function RankedContent({ title, items, icon: Icon }) {
    return (
        <div className="rounded-xl border border-base-200/80 p-4">
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-black text-base-content">
                <Icon className="h-3.5 w-3.5 text-violet-600" />
                {title}
            </h4>
            <CompactList
                items={items}
                emptyText="Chưa có dữ liệu."
                renderItem={(item, index) => (
                    <div key={item.lessonId || item.videoId || item.id || index} className="flex items-center justify-between gap-2 rounded-lg bg-base-200/40 px-3 py-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-base-content">{pickText(item, ['lessonTitle', 'videoTitle', 'title', 'name'], 'Nội dung')}</p>
                            <p className="truncate text-[10px] text-base-content/40">{pickText(item, ['courseName', 'chapterName', 'reason'], '')}</p>
                        </div>
                        <span className="flex-shrink-0 rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-black text-violet-600">
                            {formatCompact(pickNumber(item, ['count', 'completedCount', 'watchMinutes', 'dropOffCount', 'value']))}
                        </span>
                    </div>
                )}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: CONTENT QUALITY (with Donut Chart)
   ═══════════════════════════════════════════════════════════ */

function ContentQualitySection({ data }) {
    const totals = data.totals;
    const newInPeriod = data.newInPeriod;
    const pending = data.pending;

    const contentTypes = [
        { label: 'Video', value: pickNumber(totals, ['videos', 'video']), color: '#8b5cf6' },
        { label: 'Tài liệu', value: pickNumber(totals, ['documents', 'document']), color: '#06b6d4' },
        { label: 'Flashcard', value: pickNumber(totals, ['flashcards', 'flashcard']), color: '#10b981' },
        { label: 'Câu hỏi', value: pickNumber(totals, ['questions', 'question']), color: '#f59e0b' },
    ];
    const totalContent = contentTypes.reduce((s, c) => s + c.value, 0);

    const summaryStats = [
        { label: 'Mới trong kỳ', value: formatInteger(pickNumber(newInPeriod, ['total', 'items', 'count'])), icon: Zap, gradient: 'from-emerald-500 to-teal-500' },
        { label: 'Chờ duyệt', value: formatInteger(pickNumber(pending, ['total', 'items', 'count'])), icon: AlertCircle, gradient: 'from-amber-500 to-orange-500' },
    ];

    return (
        <SectionCard title="Chất lượng nội dung" subtitle="Tổng quan nội dung, nội dung mới và các điểm cần cải thiện" icon={FileText}>
            <div className="grid gap-5 xl:grid-cols-5">
                {/* Donut + Stats */}
                <div className="space-y-4 xl:col-span-2">
                    <div className="flex flex-col items-center gap-3 rounded-xl bg-base-200/30 p-5">
                        <DonutChart segments={contentTypes} centerValue={formatInteger(totalContent)} centerLabel="Tổng nội dung" size={150} strokeWidth={18} />
                        <ChartLegend items={contentTypes} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {summaryStats.map((stat) => {
                            const StatIcon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-2.5 rounded-xl border border-base-200/80 p-3">
                                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                        <StatIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black leading-none text-base-content">{stat.value}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-base-content/40">{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Lists */}
                <div className="grid gap-3 sm:grid-cols-3 xl:col-span-3">
                    <RankedContent title="Video hoàn thành thấp" items={data.lowCompletionVideos} icon={PlayCircle} />
                    <RankedContent title="Tài liệu được mở nhiều" items={data.topDocuments} icon={FileText} />
                    <div className="space-y-3">
                        <RankedContent title="Flashcard nổi bật" items={data.topFlashcards} icon={Layers3} />
                        <RankedContent title="Câu hỏi yếu" items={data.weakQuestions} icon={HelpCircle} />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: QUIZ OVERVIEW (with Gauge + Donut + HorizontalBar)
   ═══════════════════════════════════════════════════════════ */

function QuizOverviewSection({ data }) {
    const typeItems = asArray(data.questionTypeBreakdown).map((item, i) => ({
        label: pickText(item, ['label', 'type', 'name'], 'Nhóm'),
        value: pickNumber(item, ['count', 'total', 'value']),
        color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));

    const difficultyItems = asArray(data.difficultyBreakdown).map((item) => ({
        label: pickText(item, ['label', 'difficulty', 'name'], 'Nhóm'),
        value: pickNumber(item, ['count', 'total', 'value']),
    }));

    const passRate = toNumber(data.passRate);
    const normalizedPassRate = passRate > 0 && passRate <= 1 ? passRate * 100 : passRate;

    return (
        <SectionCard title="Quiz và câu hỏi" subtitle="Phân bổ câu hỏi, lượt làm bài và câu hỏi hay sai" icon={Award}>
            <div className="grid gap-5 xl:grid-cols-4">
                {/* Stats + Gauge */}
                <div className="space-y-4 xl:col-span-1">
                    <div className="flex flex-col items-center gap-2 rounded-xl bg-base-200/30 p-4">
                        <GaugeChart value={normalizedPassRate} label="Tỷ lệ đạt" color="#10b981" size={130} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Câu hỏi', value: formatInteger(data.totalQuestions), gradient: 'from-violet-500 to-purple-500' },
                            { label: 'Lượt làm', value: formatInteger(data.totalAttempts), gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Điểm TB', value: data.averageScore.toLocaleString('vi-VN', { maximumFractionDigits: 1 }), gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Tỷ lệ đạt', value: formatPercentValue(data.passRate), gradient: 'from-amber-500 to-orange-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-base-200/80 p-3 text-center">
                                <p className="text-lg font-black text-base-content">{stat.value}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-base-content/40">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut + Bar Charts */}
                <div className="space-y-4 xl:col-span-1">
                    {typeItems.length > 0 ? (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Loại câu hỏi</h4>
                            <div className="flex flex-col items-center gap-3">
                                <DonutChart segments={typeItems} size={110} strokeWidth={12} centerValue={formatInteger(data.totalQuestions)} centerLabel="Tổng" />
                                <ChartLegend items={typeItems} />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Loại câu hỏi</h4>
                            <EmptyState>Chưa có dữ liệu phân bổ.</EmptyState>
                        </div>
                    )}

                    {difficultyItems.length > 0 ? (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Độ khó</h4>
                            <HorizontalBarChart items={difficultyItems} colorIndex={2} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-base-200/80 p-4">
                            <h4 className="mb-3 text-xs font-black text-base-content">Độ khó</h4>
                            <EmptyState>Chưa có dữ liệu phân bổ.</EmptyState>
                        </div>
                    )}
                </div>

                {/* Most Missed Questions */}
                <div className="xl:col-span-2">
                    <RankedContent title="Câu hỏi sai nhiều" items={data.mostMissedQuestions} icon={HelpCircle} />
                </div>
            </div>
        </SectionCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: REPORTING PERIOD
   ═══════════════════════════════════════════════════════════ */

function ReportingPeriodCard({ period, periodBounds }) {
    return (
        <SectionCard title="Kỳ báo cáo" subtitle={formatPeriodLabel(period)} icon={CalendarDays}>
            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600/60">Kỳ hiện tại</p>
                    <p className="mt-2 text-sm font-bold text-base-content">{formatDateTime(periodBounds.currentStartUtc)}</p>
                    <p className="mt-0.5 text-xs text-base-content/50">đến {formatDateTime(periodBounds.currentEndUtc)}</p>
                </div>
                <div className="rounded-xl bg-base-200/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-base-content/40">Kỳ trước</p>
                    <p className="mt-2 text-sm font-bold text-base-content">{formatDateTime(periodBounds.previousStartUtc)}</p>
                    <p className="mt-0.5 text-xs text-base-content/50">đến {formatDateTime(periodBounds.previousEndUtc)}</p>
                </div>
            </div>
        </SectionCard>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function ExpertDashboard() {
    const [period, setPeriod] = useState('month');
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await expertDashboardApi.getMe({ period });
            setDashboard(normalizeDashboardResponse(response, period));
        } catch (err) {
            console.error('[ExpertDashboard] fetch error:', err);
            setError(err?.response?.data?.message || err?.message || 'Không thể tải dashboard chuyên gia lúc này.');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const hasDetailedData = useMemo(() => {
        if (!dashboard) return false;
        return [
            ...Object.values(dashboard.courseStatus).filter(Array.isArray),
            dashboard.learnerOverview.inactiveBuckets,
            dashboard.learnerOverview.topActiveLearners,
            dashboard.learningProgress.progressDistribution,
            dashboard.contentQuality.lowCompletionVideos,
            dashboard.quizOverview.mostMissedQuestions,
        ].some((items) => asArray(items).length > 0);
    }, [dashboard]);

    return (
        <ExpertLayout>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <OwlLoader
                        message="Đang tải dashboard chuyên gia..."
                        subMessage="SKR đang đồng bộ dữ liệu khóa học, học viên và nội dung của bạn."
                        className="py-8"
                    />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-500/20 bg-base-100 p-10 text-center shadow-lg">
                    <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                    <h2 className="text-xl font-black text-base-content">Không thể tải dữ liệu</h2>
                    <p className="mt-2 text-sm text-base-content/55">{error}</p>
                    <button
                        type="button"
                        onClick={fetchDashboard}
                        className="btn mt-5 rounded-xl border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-white shadow-lg shadow-violet-500/25"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Thử lại
                    </button>
                </div>
            ) : dashboard ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Header */}
                    <motion.div variants={cardVariants} className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-base-content">{dashboard.pageTitle}</h1>
                            <p className="mt-1 text-sm text-base-content/50">{dashboard.pageSubtitle}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex rounded-xl border border-base-300/70 bg-base-100 p-1 shadow-sm">
                                {PERIOD_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setPeriod(option.value)}
                                        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${period === option.value ? 'bg-violet-600 text-white shadow-md' : 'text-base-content/50 hover:bg-base-200 hover:text-base-content'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="rounded-xl border border-base-300/70 bg-base-100 px-3.5 py-2 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-base-content/35">Kỳ hiện tại</p>
                                <p className="mt-0.5 text-xs font-bold text-base-content">
                                    {formatShortDate(dashboard.periodBounds.currentStartUtc)} – {formatShortDate(dashboard.periodBounds.currentEndUtc)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={fetchDashboard}
                                className="btn btn-sm rounded-xl border-base-300/70 bg-base-100 shadow-sm hover:bg-base-200"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Làm mới
                            </button>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                        {dashboard.summaryCards.map((card) => (
                            <StatsCard key={card.key} card={card} dashboard={dashboard} />
                        ))}
                    </div>

                    {/* Charts Row: New Learners + Top Courses */}
                    <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
                        <NewLearnerChartCard chart={dashboard.newLearnerChart} />
                        <MyCoursesCard coursesTitle={dashboard.myCourses.title} courses={dashboard.myCourses.items} />
                    </div>

                    {!hasDetailedData && (
                        <motion.div variants={cardVariants} className="mb-6 rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 text-center text-xs text-base-content/50">
                            <Activity className="mx-auto mb-2 h-6 w-6 text-base-content/25" />
                            Backend chưa trả đủ dữ liệu chi tiết cho kỳ này. Các biểu đồ sẽ hiển thị khi có dữ liệu.
                        </motion.div>
                    )}

                    {/* Detailed Sections */}
                    <div className="space-y-5">
                        <CourseStatusSection data={dashboard.courseStatus} />
                        <LearnerOverviewSection data={dashboard.learnerOverview} />
                        <LearningProgressSection data={dashboard.learningProgress} />
                        <ContentQualitySection data={dashboard.contentQuality} />
                        <QuizOverviewSection data={dashboard.quizOverview} />
                        <ReportingPeriodCard period={dashboard.period} periodBounds={dashboard.periodBounds} />
                    </div>
                </motion.div>
            ) : null}
        </ExpertLayout>
    );
}

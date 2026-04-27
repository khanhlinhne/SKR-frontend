import { motion } from 'motion/react';
import {
    Activity,
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileText,
    GraduationCap,
    HelpCircle,
    Layers3,
    PlayCircle,
    Star,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    asArray,
    asObject,
    formatCompactCurrencyVND,
    formatCount,
    formatCurrencyVND,
    toNumber,
} from '@/features/admin/utils/adminDashboardData';
import { cardVariants, EmptyState, SectionLoading } from './shared';

const TITLE_KEYS = [
    'courseName',
    'courseTitle',
    'lessonTitle',
    'videoTitle',
    'documentTitle',
    'flashcardTitle',
    'questionText',
    'questionTitle',
    'creatorName',
    'expertName',
    'couponCode',
    'method',
    'status',
    'label',
    'name',
    'title',
    'email',
];

const SUBTITLE_KEYS = [
    'courseCode',
    'courseName',
    'chapterName',
    'creatorEmail',
    'expertEmail',
    'reason',
    'description',
    'updatedAt',
    'createdAt',
];

const METRIC_KEYS = [
    'value',
    'count',
    'total',
    'studentCount',
    'enrollmentCount',
    'attemptCount',
    'incorrectCount',
    'missedCount',
    'watchMinutes',
    'completionRate',
    'averageProgress',
    'rating',
    'averageRating',
    'revenue',
    'amount',
];

const toneClasses = {
    neutral: 'bg-base-200/50 text-base-content/65',
    info: 'bg-blue-500/10 text-blue-600',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-500',
    violet: 'bg-violet-500/10 text-violet-600',
};

function pickCandidate(source, keys, fallback = '') {
    const object = asObject(source);
    const key = keys.find((candidate) => object[candidate] !== undefined && object[candidate] !== null && object[candidate] !== '');
    return key ? object[key] : fallback;
}

function formatPercent(value) {
    const numeric = toNumber(value);
    const normalized = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
    return `${normalized.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function formatScore(value) {
    return toNumber(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

function formatMinutes(value) {
    const minutes = toNumber(value);
    if (minutes < 60) return `${formatCount(minutes)} phút`;
    return `${(minutes / 60).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giờ`;
}

function getObjectTotal(source, keys = ['total', 'count', 'items']) {
    if (Array.isArray(source)) return source.length;

    const object = asObject(source);
    const direct = pickCandidate(object, keys, null);
    if (direct !== null) return toNumber(direct);

    return Object.values(object).reduce((sum, value) => sum + toNumber(value), 0);
}

function formatMetricValue(value, key = '') {
    const normalizedKey = String(key).toLowerCase();

    if (normalizedKey.includes('rate') || normalizedKey.includes('progress') || normalizedKey.includes('percent')) {
        return formatPercent(value);
    }

    if (normalizedKey.includes('amount') || normalizedKey.includes('revenue')) {
        return formatCompactCurrencyVND(value);
    }

    if (normalizedKey.includes('minute')) {
        return formatMinutes(value);
    }

    return formatScore(value);
}

function toBreakdownItems(source) {
    if (Array.isArray(source)) {
        return source.map((item, index) => ({
            id: pickCandidate(item, ['id', 'key', 'type', 'status', 'label', 'name'], `item-${index}`),
            label: String(pickCandidate(item, ['label', 'name', 'type', 'status', 'difficulty', 'method'], `Nhóm ${index + 1}`)),
            value: toNumber(pickCandidate(item, ['count', 'total', 'value', 'amount'], 0)),
        }));
    }

    return Object.entries(asObject(source)).map(([key, value]) => ({
        id: key,
        label: key,
        value: toNumber(value),
    }));
}

function AnalyticsSection({ title, subtitle, icon: Icon, children }) {
    return (
        <motion.section variants={cardVariants} className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
            <div className="flex items-start gap-3 border-b border-base-200 px-6 py-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-blue-500/15 text-emerald-600">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-black text-base-content">{title}</h3>
                    <p className="mt-1 text-xs font-medium text-base-content/55">{subtitle}</p>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </motion.section>
    );
}

function AnalyticsOverviewHeader({ loading }) {
    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Admin analytics</p>
                    <h2 className="mt-1 text-xl font-black text-base-content">Phân tích vận hành hệ thống</h2>
                    <p className="mt-1 text-sm text-base-content/55">
                        Dữ liệu mới từ backend cho khóa học, học liệu, học tập, thanh toán, creator và quiz.
                    </p>
                </div>
                {loading && (
                    <span className="loading loading-spinner loading-md text-emerald-600" />
                )}
            </div>
        </motion.div>
    );
}

function MetricGrid({ metrics }) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                    <div key={metric.label} className="rounded-2xl border border-base-200 bg-base-100 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${metric.gradient}`}>
                                <Icon className="h-4 w-4 text-white" />
                            </div>
                            {metric.badge && (
                                <span className={`rounded-lg px-2 py-1 text-[10px] font-black ${toneClasses[metric.tone || 'neutral']}`}>
                                    {metric.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-xl font-black text-base-content">{metric.value}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-base-content/45">{metric.label}</p>
                    </div>
                );
            })}
        </div>
    );
}

function DataList({ title, items, icon: Icon, emptyText, tone = 'violet', metricKeys = METRIC_KEYS }) {
    const safeItems = asArray(items).slice(0, 5);

    return (
        <div className="rounded-2xl border border-base-200 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-base-content">
                <Icon className="h-4 w-4 text-emerald-600" />
                {title}
            </h4>
            {safeItems.length === 0 ? (
                <EmptyState message={emptyText || 'Chưa có dữ liệu.'} />
            ) : (
                <div className="space-y-2">
                    {safeItems.map((item, index) => {
                        const itemObject = asObject(item);
                        const titleText = pickCandidate(item, TITLE_KEYS, `Mục ${index + 1}`);
                        const subtitle = pickCandidate(item, SUBTITLE_KEYS, '');
                        const metricKey = metricKeys.find((key) => itemObject[key] !== undefined && itemObject[key] !== null && itemObject[key] !== '');
                        const metric = metricKey ? itemObject[metricKey] : null;

                        return (
                            <div key={pickCandidate(item, ['id', 'courseId', 'lessonId', 'videoId', 'questionId', 'creatorId'], `${title}-${index}`)} className="flex items-center gap-3 rounded-xl bg-base-200/45 px-3 py-2.5">
                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${toneClasses[tone]}`}>
                                    {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-base-content">{String(titleText)}</p>
                                    {subtitle && <p className="truncate text-[10px] text-base-content/45">{String(subtitle)}</p>}
                                </div>
                                {metric !== null && (
                                    <span className={`flex-shrink-0 rounded-lg px-2 py-1 text-[10px] font-black ${toneClasses[tone]}`}>
                                        {formatMetricValue(metric, metricKey)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function BreakdownBars({ title, items, emptyText }) {
    const rows = toBreakdownItems(items).filter((item) => item.value > 0);
    const maxValue = Math.max(1, ...rows.map((item) => item.value));

    return (
        <div className="rounded-2xl border border-base-200 p-4">
            <h4 className="mb-3 text-xs font-black text-base-content">{title}</h4>
            {rows.length === 0 ? (
                <EmptyState message={emptyText || 'Chưa có dữ liệu phân bổ.'} />
            ) : (
                <div className="space-y-3">
                    {rows.slice(0, 8).map((item) => (
                        <div key={item.id}>
                            <div className="mb-1 flex items-center justify-between gap-3">
                                <span className="truncate text-xs font-bold text-base-content/65">{item.label}</span>
                                <span className="text-xs font-black text-base-content">{formatCount(item.value)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-base-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                                    style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CourseHealthBarChart({ bars }) {
    const maxValue = Math.max(1, ...bars.map((b) => b.value));
    const chartHeight = 200;

    return (
        <div className="rounded-2xl border border-base-200 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-transparent p-5">
            <h4 className="mb-1 text-xs font-black text-base-content">Tổng quan sức khỏe</h4>
            <p className="mb-5 text-[10px] font-medium text-base-content/40">So sánh các chỉ số khóa học</p>

            {/* Y-axis + Bars */}
            <div className="flex gap-3">
                {/* Y-axis */}
                <div className="flex w-7 flex-shrink-0 flex-col justify-between py-0.5" style={{ height: chartHeight }}>
                    {Array.from({ length: 5 }, (_, i) => {
                        const val = Math.round((maxValue / 4) * (4 - i));
                        return (
                            <span key={val} className="text-right text-[9px] font-bold tabular-nums text-base-content/30">
                                {val}
                            </span>
                        );
                    })}
                </div>

                {/* Bars container */}
                <div className="relative flex-1">
                    {/* Grid lines */}
                    {Array.from({ length: 5 }, (_, i) => (
                        <div key={`grid-${i}`} className="absolute left-0 right-0 border-t border-base-300/40" style={{ top: `${(i / 4) * 100}%` }} />
                    ))}

                    {/* Bars */}
                    <div className="relative flex items-end justify-around gap-2" style={{ height: chartHeight }}>
                        {bars.map((bar, index) => {
                            const heightPx = Math.max(bar.value > 0 ? 16 : 6, Math.round((bar.value / maxValue) * (chartHeight - 20)));
                            const BarIcon = bar.icon;
                            return (
                                <div key={bar.label} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                                    {/* Tooltip */}
                                    <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max -translate-x-1/2 scale-90 rounded-xl bg-base-content px-3 py-2 text-center opacity-0 shadow-2xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                                        <p className="text-[10px] font-black text-base-100">{formatCount(bar.value)}</p>
                                        <p className="text-[9px] font-semibold text-base-100/60">{bar.label}</p>
                                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-base-content" />
                                    </div>

                                    {/* Value above bar */}
                                    <motion.span
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.08 }}
                                        className="mb-1 text-[10px] font-black text-base-content/50"
                                    >
                                        {bar.value > 0 ? formatCount(bar.value) : ''}
                                    </motion.span>

                                    {/* Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: heightPx }}
                                        transition={{ delay: 0.12 + index * 0.07, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className={`relative w-full cursor-pointer rounded-t-xl transition-all duration-200 group-hover:scale-x-105 bg-gradient-to-t ${bar.gradient} group-hover:shadow-lg`}
                                    >
                                        <div className="absolute inset-x-1 top-1 h-1/3 rounded-t-lg bg-white/15" />
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels with icons */}
                    <div className="mt-3 flex justify-around gap-2">
                        {bars.map((bar) => {
                            const BarIcon = bar.icon;
                            return (
                                <div key={`label-${bar.label}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                                    <BarIcon className="h-3.5 w-3.5 text-base-content/35" />
                                    <span className="block truncate text-center text-[9px] font-bold leading-tight text-base-content/45">{bar.shortLabel || bar.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CourseStatusDonut({ summary }) {
    const entries = Object.entries(summary).filter(([key]) => key !== 'total');
    const total = toNumber(summary.total) || entries.reduce((s, [, v]) => s + toNumber(v), 0);

    const statusConfig = {
        published: { label: 'Đã xuất bản', color: '#10b981' },
        active: { label: 'Đang hoạt động', color: '#3b82f6' },
        draft: { label: 'Bản nháp', color: '#f59e0b' },
        pending: { label: 'Chờ duyệt', color: '#8b5cf6' },
        archived: { label: 'Lưu trữ', color: '#6b7280' },
        inactive: { label: 'Ngưng hoạt động', color: '#ef4444' },
    };

    const segments = entries.map(([key, value]) => ({
        label: statusConfig[key]?.label || key,
        value: toNumber(value),
        color: statusConfig[key]?.color || '#94a3b8',
    })).filter((seg) => seg.value > 0);

    const size = 140;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativePercent = 0;

    return (
        <div className="rounded-2xl border border-base-200 bg-base-200/20 p-5">
            <h4 className="mb-4 text-xs font-black text-base-content">Phân bổ trạng thái</h4>

            <div className="flex flex-col items-center gap-4">
                {/* Donut SVG */}
                <div className="relative">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-base-200" />
                        {segments.map((seg, i) => {
                            const segPercent = total > 0 ? seg.value / total : 0;
                            const dashLength = segPercent * circumference;
                            const gap = segments.length > 1 ? 3 : 0;
                            const offset = cumulativePercent * circumference;
                            cumulativePercent += segPercent;

                            return (
                                <motion.circle
                                    key={seg.label}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={seg.color}
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={`${Math.max(0, dashLength - gap)} ${circumference - Math.max(0, dashLength - gap)}`}
                                    strokeDashoffset={-offset}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-base-content">{formatCount(total)}</span>
                        <span className="text-[10px] font-bold text-base-content/45">Khóa học</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                    {segments.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-[10px] font-bold text-base-content/55">{seg.label} ({formatCount(seg.value)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CourseHealthMetricCard({ icon: Icon, label, value, gradient, tone, badge }) {
    return (
        <motion.div
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="group relative overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 transition-shadow hover:shadow-md"
        >
            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] transition-opacity group-hover:opacity-[0.14]`} />
            <div className="relative">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    {badge && (
                        <span className={`rounded-lg px-2 py-1 text-[10px] font-black ${toneClasses[tone || 'neutral']}`}>
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xl font-black text-base-content">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-base-content/45">{label}</p>
            </div>
        </motion.div>
    );
}

function CourseSystemHealthSection({ data }) {
    const summary = asObject(data.summary);
    const totalCourses = getObjectTotal(summary, ['total', 'courses']);
    const missingCount = asArray(data.missingContentCourses).length;
    const noStudentCount = asArray(data.noStudentCourses).length;
    const lowRatedCount = asArray(data.lowRatedCourses).length;
    const lowCompletionCount = asArray(data.lowCompletionCourses).length;
    const recentCount = asArray(data.recentlyUpdatedCourses).length;
    const enrolledCount = asArray(data.mostEnrolledCourses).length;
    const topRatedCount = asArray(data.topRatedCourses).length;

    // Bar chart data — compare issue counts vs positive counts
    const barChartData = [
        { label: 'Thiếu nội dung', shortLabel: 'Thiếu ND', value: missingCount, icon: AlertCircle, gradient: 'from-amber-500/80 to-orange-500/80' },
        { label: 'Không HV', shortLabel: 'Không HV', value: noStudentCount, icon: Users, gradient: 'from-sky-400/80 to-cyan-500/80' },
        { label: 'Rating thấp', shortLabel: 'Rating thấp', value: lowRatedCount, icon: TrendingDown, gradient: 'from-red-400/80 to-rose-500/80' },
        { label: 'Hoàn thành thấp', shortLabel: 'HT thấp', value: lowCompletionCount, icon: Clock3, gradient: 'from-violet-400/80 to-purple-500/80' },
        { label: 'Đông HV nhất', shortLabel: 'Đông HV', value: enrolledCount, icon: TrendingUp, gradient: 'from-emerald-400/80 to-teal-500/80' },
        { label: 'Rating cao', shortLabel: 'Rating cao', value: topRatedCount, icon: Award, gradient: 'from-emerald-500/80 to-green-500/80' },
    ];

    // Metrics summary row
    const summaryMetrics = [
        { label: 'Tổng khóa học', value: formatCount(totalCourses), icon: BookOpen, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Cần chú ý', value: formatCount(missingCount + lowRatedCount + lowCompletionCount), icon: AlertCircle, gradient: 'from-amber-500 to-orange-600', tone: 'warning', badge: missingCount + lowRatedCount + lowCompletionCount > 0 ? 'Cảnh báo' : null },
        { label: 'Hoạt động tốt', value: formatCount(enrolledCount + topRatedCount + recentCount), icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', tone: 'success', badge: enrolledCount + topRatedCount + recentCount > 0 ? 'Tốt' : null },
        { label: 'Mới cập nhật', value: formatCount(recentCount), icon: CheckCircle2, gradient: 'from-sky-500 to-cyan-600', tone: 'info' },
    ];

    return (
        <AnalyticsSection title="Tình trạng khóa học" subtitle="Theo dõi sức khỏe khóa học trên toàn hệ thống" icon={GraduationCap}>
            {/* Row 1: Summary metric cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {summaryMetrics.map((m) => (
                    <CourseHealthMetricCard key={m.label} {...m} />
                ))}
            </div>

            {/* Row 2: Bar chart + Donut */}
            <div className="mb-6 grid gap-5 xl:grid-cols-5">
                <div className="xl:col-span-3">
                    <CourseHealthBarChart bars={barChartData} />
                </div>
                <div className="xl:col-span-2">
                    <CourseStatusDonut summary={summary} />
                </div>
            </div>

            {/* Row 3: Data lists — 3-column grid for details */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DataList title="Thiếu nội dung" items={data.missingContentCourses} icon={AlertCircle} tone="warning" />
                <DataList title="Chưa có học viên" items={data.noStudentCourses} icon={Users} tone="info" />
                <DataList title="Đánh giá thấp" items={data.lowRatedCourses} icon={Star} tone="danger" metricKeys={['rating', 'averageRating']} />
                <DataList title="Hoàn thành thấp" items={data.lowCompletionCourses} icon={TrendingDown} tone="warning" metricKeys={['completionRate', 'averageProgress']} />
                <DataList title="Đông học viên nhất" items={data.mostEnrolledCourses} icon={TrendingUp} tone="success" metricKeys={['studentCount', 'enrollmentCount', 'totalStudents']} />
                <DataList title="Đánh giá cao" items={data.topRatedCourses} icon={Award} tone="success" metricKeys={['rating', 'averageRating']} />
                <DataList title="Mới cập nhật" items={data.recentlyUpdatedCourses} icon={CheckCircle2} tone="info" metricKeys={['updatedDaysAgo', 'count', 'value']} />
            </div>
        </AnalyticsSection>
    );
}

function ContentQualitySection({ data }) {
    const totals = asObject(data.totals);
    const metrics = [
        { label: 'Video', value: formatCount(toNumber(totals.videos ?? totals.video)), icon: PlayCircle, gradient: 'from-blue-500 to-cyan-600' },
        { label: 'Tài liệu', value: formatCount(toNumber(totals.documents ?? totals.document)), icon: FileText, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Flashcard', value: formatCount(toNumber(totals.flashcards ?? totals.flashcard)), icon: Layers3, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Câu hỏi', value: formatCount(toNumber(totals.questions ?? totals.question)), icon: HelpCircle, gradient: 'from-amber-500 to-orange-600' },
        { label: 'Chờ duyệt', value: formatCount(getObjectTotal(data.pending)), icon: AlertCircle, gradient: 'from-red-500 to-rose-600' },
        { label: 'Mới trong kỳ', value: formatCount(getObjectTotal(data.newInPeriod)), icon: CheckCircle2, gradient: 'from-sky-500 to-indigo-600' },
    ];

    return (
        <AnalyticsSection title="Nội dung và học liệu" subtitle="Tổng quan học liệu, nội dung mới và điểm cần cải thiện" icon={FileText}>
            <div className="grid gap-5 xl:grid-cols-5">
                <div className="space-y-4 xl:col-span-2">
                    <MetricGrid metrics={metrics} />
                    <BreakdownBars title="Loại câu hỏi" items={data.questionTypeBreakdown} />
                    <BreakdownBars title="Độ khó câu hỏi" items={data.questionDifficultyBreakdown} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:col-span-3">
                    <DataList title="Video hoàn thành thấp" items={data.lowCompletionVideos} icon={PlayCircle} tone="warning" metricKeys={['completionRate', 'averageProgress']} />
                    <DataList title="Tài liệu nổi bật" items={data.topDocuments} icon={FileText} tone="info" />
                    <DataList title="Flashcard nổi bật" items={data.topFlashcards} icon={Layers3} tone="success" />
                    <DataList title="Câu hỏi sai nhiều" items={data.highIncorrectQuestions} icon={HelpCircle} tone="danger" metricKeys={['incorrectCount', 'missedCount', 'attemptCount']} />
                </div>
            </div>
        </AnalyticsSection>
    );
}

function LearningActivitySection({ data }) {
    const metrics = [
        { label: 'Ghi danh', value: formatCount(data.totalEnrollments), icon: Users, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Đang học', value: formatCount(data.activeLearners), icon: Activity, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Hoàn thành', value: formatCount(data.completedLearners), icon: CheckCircle2, gradient: 'from-sky-500 to-cyan-600' },
        { label: 'Tiến độ TB', value: formatPercent(data.averageProgress), icon: BarChart3, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Bài đã hoàn thành', value: formatCount(data.completedLessonCount), icon: BookOpen, gradient: 'from-amber-500 to-orange-600' },
        { label: 'Thời lượng video', value: formatMinutes(data.totalVideoWatchMinutes), icon: PlayCircle, gradient: 'from-red-500 to-rose-600' },
    ];

    return (
        <AnalyticsSection title="Hoạt động học tập" subtitle="Mức độ học tập và điểm rơi trong toàn hệ thống" icon={Activity}>
            <div className="grid gap-5 xl:grid-cols-5">
                <div className="space-y-4 xl:col-span-2">
                    <MetricGrid metrics={metrics} />
                    <BreakdownBars title="Phân bổ tiến độ" items={data.progressDistribution} />
                </div>
                <div className="grid gap-4 md:grid-cols-3 xl:col-span-3">
                    <DataList title="Bài học nổi bật" items={data.topLessons} icon={BookOpen} tone="success" />
                    <DataList title="Video xem nhiều" items={data.topVideos} icon={PlayCircle} tone="info" metricKeys={['watchMinutes', 'viewCount', 'count']} />
                    <DataList title="Điểm rơi học tập" items={data.dropOffPoints} icon={TrendingDown} tone="danger" metricKeys={['dropOffCount', 'count', 'value']} />
                </div>
            </div>
        </AnalyticsSection>
    );
}

function PaymentOperationsSection({ data }) {
    const metrics = [
        { label: 'Tỷ lệ thành công', value: formatPercent(data.successRate), icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Doanh thu kỳ này', value: formatCompactCurrencyVND(data.revenueInPeriod), icon: CreditCard, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Hoàn tiền', value: formatCurrencyVND(data.refundAmount), icon: TrendingDown, gradient: 'from-amber-500 to-orange-600' },
        { label: 'Giao dịch lỗi', value: formatCount(asArray(data.failedTransactions).length), icon: AlertCircle, gradient: 'from-red-500 to-rose-600' },
        { label: 'Đơn pending lâu', value: formatCount(asArray(data.stalePendingOrders).length), icon: Clock3, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Mã giảm giá', value: formatCount(asArray(data.topCoupons).length), icon: Award, gradient: 'from-sky-500 to-cyan-600' },
    ];

    return (
        <AnalyticsSection title="Thanh toán và đơn hàng" subtitle="Theo dõi dòng tiền, lỗi thanh toán và đơn hàng tồn đọng" icon={CreditCard}>
            <div className="grid gap-5 xl:grid-cols-5">
                <div className="space-y-4 xl:col-span-2">
                    <MetricGrid metrics={metrics} />
                    <BreakdownBars title="Trạng thái đơn hàng" items={data.statusCounts} />
                    <BreakdownBars title="Phương thức thanh toán" items={data.paymentMethods} />
                </div>
                <div className="grid gap-4 md:grid-cols-3 xl:col-span-3">
                    <DataList title="Giao dịch thất bại" items={data.failedTransactions} icon={AlertCircle} tone="danger" metricKeys={['amount', 'totalAmount', 'finalAmount']} />
                    <DataList title="Pending quá lâu" items={data.stalePendingOrders} icon={Clock3} tone="warning" metricKeys={['amount', 'totalAmount', 'finalAmount']} />
                    <DataList title="Coupon hiệu quả" items={data.topCoupons} icon={Award} tone="success" metricKeys={['usageCount', 'count', 'discountAmount']} />
                </div>
            </div>
        </AnalyticsSection>
    );
}

function CreatorPerformanceSection({ data }) {
    const metrics = [
        { label: 'Creator', value: formatCount(data.totalCreators), icon: Users, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Có nháp/inactive', value: formatCount(asArray(data.creatorsWithDraftOrInactiveCourses).length), icon: AlertCircle, gradient: 'from-amber-500 to-orange-600' },
        { label: 'Thiếu nội dung', value: formatCount(asArray(data.creatorsWithMissingContent).length), icon: FileText, gradient: 'from-red-500 to-rose-600' },
    ];

    return (
        <AnalyticsSection title="Hiệu suất creator" subtitle="Xếp hạng creator theo xuất bản, học viên và chất lượng" icon={Users}>
            <div className="grid gap-5 xl:grid-cols-5">
                <div className="xl:col-span-1">
                    <MetricGrid metrics={metrics} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:col-span-4 xl:grid-cols-3">
                    <DataList title="Xuất bản nhiều" items={data.topPublishedCreators} icon={BookOpen} tone="success" metricKeys={['publishedCourseCount', 'courseCount', 'count']} />
                    <DataList title="Nhiều học viên" items={data.topStudentCreators} icon={GraduationCap} tone="info" metricKeys={['studentCount', 'totalStudents', 'enrollmentCount']} />
                    <DataList title="Rating cao" items={data.highestRatedCreators} icon={Star} tone="success" metricKeys={['rating', 'averageRating']} />
                    <DataList title="Rating thấp" items={data.lowestRatedCreators} icon={TrendingDown} tone="danger" metricKeys={['rating', 'averageRating']} />
                    <DataList title="Có nháp/inactive" items={data.creatorsWithDraftOrInactiveCourses} icon={AlertCircle} tone="warning" metricKeys={['draftCourseCount', 'inactiveCourseCount', 'count']} />
                    <DataList title="Thiếu nội dung" items={data.creatorsWithMissingContent} icon={FileText} tone="danger" metricKeys={['missingContentCount', 'courseCount', 'count']} />
                </div>
            </div>
        </AnalyticsSection>
    );
}

function QuizQualitySection({ data }) {
    const metrics = [
        { label: 'Lượt làm quiz', value: formatCount(data.totalAttempts), icon: Award, gradient: 'from-violet-500 to-purple-600' },
        { label: 'Điểm trung bình', value: formatScore(data.averageScore), icon: BarChart3, gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Tỷ lệ đạt', value: formatPercent(data.passRate), icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Câu chưa dùng', value: formatCount(asArray(data.unusedQuestions).length), icon: HelpCircle, gradient: 'from-amber-500 to-orange-600' },
    ];

    return (
        <AnalyticsSection title="Quiz và câu hỏi" subtitle="Chất lượng câu hỏi, tỷ lệ đạt và các câu bị sai nhiều" icon={Award}>
            <div className="grid gap-5 xl:grid-cols-5">
                <div className="space-y-4 xl:col-span-2">
                    <MetricGrid metrics={metrics} />
                    <BreakdownBars title="Loại câu hỏi" items={data.questionTypeBreakdown} />
                    <BreakdownBars title="Độ khó câu hỏi" items={data.questionDifficultyBreakdown} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:col-span-3">
                    <DataList title="Câu sai nhiều" items={data.mostMissedQuestions} icon={HelpCircle} tone="danger" metricKeys={['incorrectCount', 'missedCount', 'attemptCount']} />
                    <DataList title="Câu chưa dùng" items={data.unusedQuestions} icon={Clock3} tone="warning" metricKeys={['createdDaysAgo', 'attemptCount', 'count']} />
                </div>
            </div>
        </AnalyticsSection>
    );
}

export default function AdminDashboardAnalyticsSections({ dashboard, loading }) {
    const sections = [
        { key: 'courseSystemHealth', component: CourseSystemHealthSection },
        { key: 'contentQuality', component: ContentQualitySection },
        { key: 'learningActivity', component: LearningActivitySection },
        { key: 'paymentOperations', component: PaymentOperationsSection },
        { key: 'creatorPerformance', component: CreatorPerformanceSection },
        { key: 'quizQuality', component: QuizQualitySection },
    ];

    return (
        <div className="mt-6 space-y-6">
            <AnalyticsOverviewHeader loading={loading} />
            {loading && (
                <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 shadow-lg">
                    <SectionLoading />
                </motion.div>
            )}
            {sections.map(({ key, component: Section }) => (
                <Section key={key} data={asObject(dashboard[key])} />
            ))}
        </div>
    );
}

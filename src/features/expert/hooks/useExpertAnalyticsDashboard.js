import { useEffect, useMemo, useState } from 'react';
import expertAnalyticsApi from '@/shared/api/expertAnalyticsApi';
import courseApi from '@/shared/api/courseApi';

const FUNNEL_COLOR_MAP = {
    violet: 'from-violet-500 to-violet-600',
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
};

const EMPTY_RATING_BREAKDOWN = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    pct: 0,
    count: 0,
}));

function resolveResponseData(response) {
    return response?.data ?? response ?? null;
}

function resolveCourseEntity(response) {
    const payload = resolveResponseData(response);

    return payload?.course
        || payload?.item
        || payload?.subject
        || payload?.data?.course
        || payload?.data?.item
        || payload?.data?.subject
        || payload;
}

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}

function formatTrimmedNumber(value, maximumFractionDigits = 1) {
    const numericValue = toNumber(value);
    if (numericValue === null) {
        return null;
    }

    return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits,
        minimumFractionDigits: 0,
    }).format(numericValue);
}

function formatInteger(value) {
    const numericValue = toNumber(value);
    if (numericValue === null) {
        return '0';
    }

    return Math.round(numericValue).toLocaleString('vi-VN');
}

function formatCurrencyShort(value, formattedShort) {
    if (formattedShort) {
        return formattedShort;
    }

    const numericValue = toNumber(value);
    if (numericValue === null) {
        return '--';
    }

    if (numericValue === 0) {
        return '0đ';
    }

    if (Math.abs(numericValue) >= 1_000_000_000) {
        return `${formatTrimmedNumber(numericValue / 1_000_000_000)}B`;
    }

    if (Math.abs(numericValue) >= 1_000_000) {
        return `${formatTrimmedNumber(numericValue / 1_000_000)}M`;
    }

    if (Math.abs(numericValue) >= 1_000) {
        return `${formatTrimmedNumber(numericValue / 1_000)}K`;
    }

    return `${numericValue.toLocaleString('vi-VN')}đ`;
}

function formatSignedValue(value, suffix = '', options = {}) {
    const numericValue = toNumber(value);
    if (numericValue === null) {
        return null;
    }

    const { maximumFractionDigits = 1, zeroPrefix = false } = options;
    const formattedValue = new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits,
        minimumFractionDigits: 0,
    }).format(numericValue);

    if (numericValue > 0) {
        return `+${formattedValue}${suffix}`;
    }

    if (numericValue < 0) {
        return `${formattedValue}${suffix}`;
    }

    return `${zeroPrefix ? '+' : ''}${formattedValue}${suffix}`;
}

function getTrend(value) {
    const numericValue = toNumber(value);
    if (numericValue === null) {
        return null;
    }

    return numericValue < 0 ? 'down' : 'up';
}

function useDebouncedValue(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedValue(value), delay);
        return () => window.clearTimeout(timer);
    }, [delay, value]);

    return debouncedValue;
}

function buildCourseIdCandidates(course) {
    return [...new Set(
        [course?.courseId, course?.subjectId, course?.id]
            .filter((value) => value !== null && value !== undefined && value !== '')
            .map((value) => String(value)),
    )];
}

function buildOverviewParams(chartPeriod) {
    const params = {};

    if (chartPeriod && chartPeriod !== 'week') {
        params.chartPeriod = chartPeriod;
    }

    return params;
}

function buildEnrollmentsParams({ page, limit, search, statusFilter, sortField, sortDirection }) {
    const params = { page, limit };

    if (search) {
        params.search = search;
    }

    if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
    }

    if (sortField && sortField !== 'date') {
        params.sortField = sortField;
    }

    if (sortDirection && sortDirection !== 'desc') {
        params.sortDirection = sortDirection;
    }

    return params;
}

function buildExportParams({ search, statusFilter, sortField, sortDirection }) {
    const params = {};

    if (search) {
        params.search = search;
    }

    if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
    }

    if (sortField && sortField !== 'date') {
        params.sortField = sortField;
    }

    if (sortDirection && sortDirection !== 'desc') {
        params.sortDirection = sortDirection;
    }

    return params;
}

function getErrorDebugMeta(error) {
    return {
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url,
        params: error?.config?.params,
    };
}

function isRequestCanceled(error) {
    return error?.code === 'ERR_CANCELED'
        || error?.name === 'CanceledError'
        || error?.message === 'canceled';
}

function getReadableApiErrorMessage(error, fallbackMessage) {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;

    if (status === 401) {
        return 'Phiên đăng nhập đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại.';
    }

    if (status === 403) {
        return 'Tài khoản hiện tại không có quyền xem dữ liệu analytics của khóa học này.';
    }

    if (serverMessage) {
        return serverMessage;
    }

    return fallbackMessage;
}

async function requestWithCourseIdFallback(candidateIds, requestFactory, onResolved) {
    let lastError = null;

    for (const candidateId of candidateIds) {
        try {
            const response = await requestFactory(candidateId);
            onResolved?.(candidateId);
            return response;
        } catch (error) {
            if (isRequestCanceled(error)) {
                throw error;
            }

            lastError = error;
            const status = error?.response?.status;
            const canRetryWithAnotherId = [400, 404, 500].includes(status);

            console.error('[expert-analytics] request failed for candidate course id', candidateId, getErrorDebugMeta(error));

            if (!canRetryWithAnotherId || candidateIds[candidateIds.length - 1] === candidateId) {
                break;
            }
        }
    }

    throw lastError;
}

function normalizeRatingBreakdown(items) {
    const mappedItems = new Map(
        ensureArray(items).map((item) => [Number(item.stars), {
            stars: Number(item.stars),
            pct: toNumber(item.pct) || 0,
            count: toNumber(item.count) || 0,
        }]),
    );

    return EMPTY_RATING_BREAKDOWN.map((item) => mappedItems.get(item.stars) || item);
}

function normalizeMetricCards(metrics, sparklines) {
    const totalRevenue = metrics.totalRevenue || {};
    const newStudents = metrics.newStudents || {};
    const completionRate = metrics.completionRate || {};
    const avgStudyTimeMinutes = metrics.avgStudyTimeMinutes || {};
    const lessonsViewed = metrics.lessonsViewed || {};
    const avgRating = metrics.avgRating || {};

    const avgRatingValue = toNumber(avgRating.value);

    return [
        {
            label: 'Doanh thu tổng',
            value: formatCurrencyShort(totalRevenue.value, totalRevenue.formattedShort),
            change: formatSignedValue(totalRevenue.changePct, '%'),
            trend: getTrend(totalRevenue.changePct),
            icon: 'DollarSign',
            gradient: 'from-emerald-500 to-teal-600',
            sparkData: ensureArray(sparklines.revenue),
            sparkColor: '#10b981',
        },
        {
            label: 'Học viên mới tuần này',
            value: formatInteger(newStudents.value),
            change: newStudents.today === null || newStudents.today === undefined
                ? formatSignedValue(newStudents.changePct, '%')
                : `${toNumber(newStudents.today) > 0 ? '+' : ''}${formatInteger(newStudents.today)} hôm nay`,
            trend: getTrend(newStudents.changePct ?? newStudents.today),
            icon: 'Users',
            gradient: 'from-blue-500 to-cyan-600',
            sparkData: ensureArray(sparklines.newStudents),
            sparkColor: '#3b82f6',
        },
        {
            label: 'Tỷ lệ hoàn thành',
            value: toNumber(completionRate.value) === null ? '--' : `${formatTrimmedNumber(completionRate.value)}%`,
            change: formatSignedValue(completionRate.changePct, '%'),
            trend: getTrend(completionRate.changePct),
            icon: 'Target',
            gradient: 'from-violet-500 to-fuchsia-600',
            donut: Math.max(0, Math.min(100, toNumber(completionRate.value) || 0)),
        },
        {
            label: 'Thời gian học TB',
            value: toNumber(avgStudyTimeMinutes.value) === null ? '--' : `${formatTrimmedNumber(avgStudyTimeMinutes.value)} phút`,
            change: formatSignedValue(avgStudyTimeMinutes.changeMinutes, ' phút'),
            trend: getTrend(avgStudyTimeMinutes.changeMinutes),
            icon: 'Clock',
            gradient: 'from-amber-500 to-orange-600',
            sparkData: ensureArray(sparklines.avgStudyTime),
            sparkColor: '#f59e0b',
        },
        {
            label: 'Bài học đã xem',
            value: formatInteger(lessonsViewed.value),
            change: formatSignedValue(lessonsViewed.change, ''),
            trend: getTrend(lessonsViewed.change),
            icon: 'Eye',
            gradient: 'from-pink-500 to-rose-600',
            sparkData: ensureArray(sparklines.lessonsViewed),
            sparkColor: '#ec4899',
        },
        {
            label: 'Rating trung bình',
            value: avgRatingValue === null ? '--' : `${formatTrimmedNumber(avgRatingValue)} ★`,
            change: formatSignedValue(avgRating.change, ''),
            trend: getTrend(avgRating.change),
            icon: 'Star',
            gradient: 'from-yellow-500 to-amber-600',
            rating: avgRatingValue,
        },
    ];
}

function normalizeOverviewResponse(response) {
    const data = resolveResponseData(response) || {};
    const metrics = data.metrics || {};
    const sparklines = data.sparklines || {};
    const totalRevenue = metrics.totalRevenue || {};

    return {
        raw: data,
        stats: metrics,
        chartData: ensureArray(data.newEnrollmentChart),
        weeklyActivity: ensureArray(data.weeklyActivityChart).map((item) => ({
            ...item,
            suffix: 'HV',
        })),
        lessonProgress: ensureArray(data.lessonProgress).map((lesson) => ({
            ...lesson,
            name: lesson.lessonName || lesson.name || 'Bài học',
            studentsAtLesson: toNumber(lesson.studentsAtLesson) || 0,
            completionRate: toNumber(lesson.completionRate) || 0,
            dropRate: toNumber(lesson.dropRate) || 0,
        })),
        funnelSteps: ensureArray(data.completionFunnel).map((step) => ({
            ...step,
            pct: toNumber(step.pct) || 0,
            count: toNumber(step.count) || 0,
            color: FUNNEL_COLOR_MAP[step.colorToken] || 'from-violet-500 to-violet-600',
        })),
        ratingBreakdown: normalizeRatingBreakdown(data.ratingBreakdown),
        metricCards: normalizeMetricCards(metrics, sparklines),
        quickStudentStats: [],
        generatedAt: data.generatedAt || null,
        formattedRevenue: formatCurrencyShort(totalRevenue.value, totalRevenue.formattedShort),
    };
}

function normalizeEnrollmentsResponse(response) {
    const data = resolveResponseData(response) || {};
    const summary = data.summary || {};
    const pagination = data.pagination || {};
    const items = ensureArray(data.items).map((item) => ({
        ...item,
        progress: Math.max(0, Math.min(100, toNumber(item.progress) || 0)),
    }));

    return {
        enrollments: items,
        summary,
        pagination: {
            page: toNumber(pagination.page) || 1,
            limit: toNumber(pagination.limit) || 20,
            totalItems: toNumber(pagination.totalItems) || 0,
            totalPages: Math.max(1, toNumber(pagination.totalPages) || 1),
        },
        quickStudentStats: [
            { icon: 'Users', label: 'Tổng đăng ký', value: formatInteger(summary.totalEnrollments), bg: 'bg-violet-500/10', color: 'text-violet-500' },
            { icon: 'UserCheck', label: 'Đang học', value: formatInteger(summary.activeCount), bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
            { icon: 'ShieldCheck', label: 'Hoàn thành', value: formatInteger(summary.completedCount), bg: 'bg-blue-500/10', color: 'text-blue-500' },
            { icon: 'DollarSign', label: 'Doanh thu', value: formatCurrencyShort(summary.grossRevenue), bg: 'bg-amber-500/10', color: 'text-amber-500' },
        ],
    };
}

export const enrollmentStatusConfig = {
    active: { label: 'Đang học', color: 'text-emerald-700 bg-emerald-500/10', progressColor: 'bg-emerald-500' },
    completed: { label: 'Hoàn thành', color: 'text-blue-700 bg-blue-500/10', progressColor: 'bg-blue-500' },
    expired: { label: 'Hết hạn', color: 'text-red-600 bg-red-500/10', progressColor: 'bg-red-500' },
    pending: { label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-500/10', progressColor: 'bg-amber-500' },
};

export function useExpertAnalyticsDashboard(course) {
    const baseCourseIdCandidates = useMemo(() => buildCourseIdCandidates(course), [course]);
    const [courseIdCandidates, setCourseIdCandidates] = useState(baseCourseIdCandidates);
    const [resolvedCourseId, setResolvedCourseId] = useState(null);
    const courseId = resolvedCourseId || courseIdCandidates[0] || null;

    const [overview, setOverview] = useState(null);
    const [dashboard, setDashboard] = useState({
        enrollments: [],
        summary: null,
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
    });
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [overviewError, setOverviewError] = useState('');
    const [studentsError, setStudentsError] = useState('');
    const [chartPeriod, setChartPeriod] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [activeTab, setActiveTab] = useState('overview');
    const [page, setPage] = useState(1);
    const [exportingCsv, setExportingCsv] = useState(false);
    const debouncedSearchTerm = useDebouncedValue(searchTerm);

    useEffect(() => {
        setCourseIdCandidates(baseCourseIdCandidates);
        setResolvedCourseId(null);
        setChartPeriod('week');
        setSearchTerm('');
        setStatusFilter('all');
        setSortField('date');
        setSortDirection('desc');
        setActiveTab('overview');
        setPage(1);
        setOverview(null);
        setDashboard({
            enrollments: [],
            summary: null,
            pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
        });
        setOverviewError('');
        setStudentsError('');
    }, [baseCourseIdCandidates, course?.courseId, course?.subjectId, course?.id]);

    useEffect(() => {
        if (!baseCourseIdCandidates.length) {
            return undefined;
        }

        let cancelled = false;

        const hydrateCourseIdentifiers = async () => {
            try {
                const response = await courseApi.getById(baseCourseIdCandidates[0]);
                const courseDetail = resolveCourseEntity(response);
                const extraCandidates = buildCourseIdCandidates(courseDetail);

                if (cancelled || extraCandidates.length === 0) {
                    return;
                }

                const mergedCandidates = [...new Set([...baseCourseIdCandidates, ...extraCandidates])];
                setCourseIdCandidates(mergedCandidates);
                console.info('[expert-analytics] hydrated course id candidates', mergedCandidates);
            } catch (error) {
                if (!cancelled) {
                    console.warn('[expert-analytics] unable to hydrate course detail identifiers', getErrorDebugMeta(error));
                }
            }
        };

        hydrateCourseIdentifiers();

        return () => {
            cancelled = true;
        };
    }, [baseCourseIdCandidates]);

    useEffect(() => {
        if (!courseIdCandidates.length) {
            setOverview(null);
            setLoadingOverview(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();

        const loadOverview = async () => {
            setLoadingOverview(true);
            setOverviewError('');

            try {
                const orderedCandidateIds = resolvedCourseId
                    ? [resolvedCourseId, ...courseIdCandidates.filter((item) => item !== resolvedCourseId)]
                    : courseIdCandidates;

                const response = await requestWithCourseIdFallback(
                    orderedCandidateIds,
                    (candidateId) => expertAnalyticsApi.getOverview(
                        candidateId,
                        buildOverviewParams(chartPeriod),
                        { signal: controller.signal },
                    ),
                    setResolvedCourseId,
                );

                if (cancelled) {
                    return;
                }

                setOverview(normalizeOverviewResponse(response));
            } catch (error) {
                if (cancelled || isRequestCanceled(error)) {
                    return;
                }

                console.error('[useExpertAnalyticsDashboard] overview error:', getErrorDebugMeta(error));
                setOverviewError(getReadableApiErrorMessage(error, 'Không thể tải dữ liệu tổng quan của khóa học.'));
                setOverview(null);
            } finally {
                if (!cancelled) {
                    setLoadingOverview(false);
                }
            }
        };

        loadOverview();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [chartPeriod, courseIdCandidates, resolvedCourseId]);

    useEffect(() => {
        if (!courseIdCandidates.length) {
            setDashboard({
                enrollments: [],
                summary: null,
                pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
            });
            setLoadingStudents(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();

        const loadEnrollments = async () => {
            setLoadingStudents(true);
            setStudentsError('');

            try {
                const orderedCandidateIds = resolvedCourseId
                    ? [resolvedCourseId, ...courseIdCandidates.filter((item) => item !== resolvedCourseId)]
                    : courseIdCandidates;

                const response = await requestWithCourseIdFallback(
                    orderedCandidateIds,
                    (candidateId) => expertAnalyticsApi.getEnrollments(candidateId, buildEnrollmentsParams({
                        page,
                        limit: 20,
                        search: debouncedSearchTerm.trim(),
                        statusFilter,
                        sortField,
                        sortDirection,
                    }), { signal: controller.signal }),
                    setResolvedCourseId,
                );

                if (cancelled) {
                    return;
                }

                setDashboard(normalizeEnrollmentsResponse(response));
            } catch (error) {
                if (cancelled || isRequestCanceled(error)) {
                    return;
                }

                console.error('[useExpertAnalyticsDashboard] enrollments error:', getErrorDebugMeta(error));
                setStudentsError(getReadableApiErrorMessage(error, 'Không thể tải danh sách học viên.'));
                setDashboard({
                    enrollments: [],
                    summary: null,
                    pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
                });
            } finally {
                if (!cancelled) {
                    setLoadingStudents(false);
                }
            }
        };

        loadEnrollments();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [courseIdCandidates, debouncedSearchTerm, page, resolvedCourseId, sortDirection, sortField, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, statusFilter, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
            return;
        }

        setSortField(field);
        setSortDirection('desc');
    };

    const handleExportCsv = async () => {
        if (!courseIdCandidates.length) {
            return;
        }

        setExportingCsv(true);
        setStudentsError('');

        try {
            const orderedCandidateIds = resolvedCourseId
                ? [resolvedCourseId, ...courseIdCandidates.filter((item) => item !== resolvedCourseId)]
                : courseIdCandidates;

            const blob = await requestWithCourseIdFallback(
                orderedCandidateIds,
                (candidateId) => expertAnalyticsApi.exportEnrollments(candidateId, buildExportParams({
                    search: searchTerm.trim(),
                    statusFilter,
                    sortField,
                    sortDirection,
                })),
                setResolvedCourseId,
            );

            const fileUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = fileUrl;
            anchor.download = `course-${resolvedCourseId || courseId || 'analytics'}-enrollments.csv`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(fileUrl);
        } catch (error) {
            if (isRequestCanceled(error)) {
                return;
            }

            console.error('[useExpertAnalyticsDashboard] export error:', getErrorDebugMeta(error));
            setStudentsError(getReadableApiErrorMessage(error, 'Không thể xuất file CSV.'));
        } finally {
            setExportingCsv(false);
        }
    };

    const fallbackStudentCount = course?._count?.enrollments || course?.enrollmentsCount || course?.purchaseCount || 0;
    const studentCount = dashboard.summary?.totalEnrollments ?? fallbackStudentCount;
    const chapterCount = course?._count?.chapters || course?.chaptersCount || 0;
    const lessonCount = course?._count?.lessons || course?.lessonsCount || 0;
    const filteredEnrollments = dashboard.enrollments;

    const hydratedOverview = useMemo(() => {
        if (!overview) {
            return null;
        }

        return {
            ...overview,
            quickStudentStats: dashboard.quickStudentStats?.length
                ? dashboard.quickStudentStats
                : [
                    { icon: 'Users', label: 'Tổng đăng ký', value: formatInteger(studentCount), bg: 'bg-violet-500/10', color: 'text-violet-500' },
                    { icon: 'UserCheck', label: 'Đang học', value: '0', bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
                    { icon: 'ShieldCheck', label: 'Hoàn thành', value: '0', bg: 'bg-blue-500/10', color: 'text-blue-500' },
                    { icon: 'DollarSign', label: 'Doanh thu', value: overview.formattedRevenue, bg: 'bg-amber-500/10', color: 'text-amber-500' },
                ],
        };
    }, [dashboard.quickStudentStats, overview, studentCount]);

    return {
        loading: loadingOverview,
        loadingStudents,
        error: overviewError,
        studentsError,
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
        overview: hydratedOverview,
        page,
        setPage,
        exportingCsv,
        handleExportCsv,
    };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOwlDialog } from '@/shared/ui/common';
import adminApi from '@/shared/api/adminApi';
import expertAnalyticsApi from '@/shared/api/expertAnalyticsApi';
import {
    buildCourseAnalytics,
    mergeCourseWithAnalytics,
    normalizeCourse,
} from '@/features/admin/utils/adminCourseDetailAnalytics';
import { extractOrderList } from '@/features/admin/utils/adminCourseDetailOrders';

function getMetricNumber(metric, fallback = 0) {
    if (metric === null || metric === undefined) {
        return fallback;
    }

    if (typeof metric === 'object') {
        const value = Number(metric.value);
        return Number.isFinite(value) ? value : fallback;
    }

    const value = Number(metric);
    return Number.isFinite(value) ? value : fallback;
}

function resolveOverviewPayload(response) {
    return response?.data ?? response ?? null;
}

function toFiniteNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeRevenueSeries(series, fallbackSeries = []) {
    if (!Array.isArray(series) || series.length === 0) {
        return fallbackSeries;
    }

    return series.map((item, index) => ({
        month: item?.month || item?.shortLabel || item?.label || item?.name || `W${index + 1}`,
        label: item?.label || item?.month || item?.shortLabel || item?.name || `W${index + 1}`,
        revenue: toFiniteNumber(item?.revenue ?? item?.value ?? item?.amount ?? item?.totalRevenue, 0),
    }));
}

function normalizeEnrollmentSeries(series, fallbackSeries = []) {
    if (!Array.isArray(series) || series.length === 0) {
        return fallbackSeries;
    }

    return series.map((item, index) => ({
        shortLabel: item?.shortLabel || item?.label || item?.name || `W${index + 1}`,
        label: item?.label || item?.shortLabel || item?.name || `W${index + 1}`,
        count: toFiniteNumber(item?.count ?? item?.value ?? item?.total ?? item?.students ?? item?.newStudents, 0),
    }));
}

function extractOverviewOrders(overviewPayload) {
    if (!overviewPayload) {
        return [];
    }

    const recentOrderItems = extractOrderList(overviewPayload.recentOrderItems);
    if (recentOrderItems.length > 0) {
        return recentOrderItems;
    }

    const recentOrders = extractOrderList(overviewPayload.recentOrders);
    if (recentOrders.length > 0) {
        return recentOrders;
    }

    return [];
}

function mergeCourseWithOverviewPayload(course, overviewPayload) {
    if (!overviewPayload) {
        return course;
    }

    const courseOverview = overviewPayload.courseOverview || {};
    const expert = overviewPayload.expert || {};
    const avgRating = overviewPayload.metrics?.avgRating || {};
    const totalRevenue = overviewPayload.metrics?.totalRevenue || {};
    const learningCompletionRate = overviewPayload.metrics?.learningCompletionRate ?? overviewPayload.metrics?.completionRate;
    const creatorName = expert.fullName || expert.displayName || expert.username || '';
    const baseCreator = course.creator && typeof course.creator === 'object' ? course.creator : {};

    return {
        ...course,
        subjectCode: course.subjectCode || courseOverview.courseCode || courseOverview.subjectCode || '',
        category: course.category || courseOverview.categoryName || courseOverview.category || '',
        totalChapters: Number(courseOverview.totalChapters ?? course.totalChapters ?? course.chapters ?? 0),
        totalLessons: Number(courseOverview.totalLessons ?? course.totalLessons ?? course.lessons ?? 0),
        totalVideos: Number(courseOverview.totalVideos ?? course.totalVideos ?? 0),
        totalDocuments: Number(courseOverview.totalDocuments ?? course.totalDocuments ?? 0),
        totalQuestions: Number(courseOverview.totalQuestions ?? course.totalQuestions ?? 0),
        estimatedHours: Number(
            courseOverview.estimatedDurationHours
            ?? courseOverview.estimatedHours
            ?? course.estimatedHours
            ?? 0,
        ),
        lessons: Number(courseOverview.totalLessons ?? course.totalLessons ?? course.lessons ?? 0),
        chapters: Number(courseOverview.totalChapters ?? course.totalChapters ?? course.chapters ?? 0),
        rating: course.rating > 0 ? course.rating : getMetricNumber(avgRating.value, 0),
        ratingCount: Number(avgRating.ratingCount ?? course.ratingCount ?? 0),
        revenue: course.revenue > 0 ? course.revenue : getMetricNumber(totalRevenue.value, 0),
        completionRate: getMetricNumber(learningCompletionRate, course.completionRate ?? 0),
        creator: creatorName
            ? {
                ...baseCreator,
                ...expert,
                fullName: creatorName,
            }
            : course.creator,
        instructor: course.instructor || creatorName,
    };
}

function getOrderTotalsFromPayload(overviewPayload) {
    const recentOrders = overviewPayload?.recentOrders;
    const orderCompletionRate = overviewPayload?.orderCompletionRate;

    const totalOrders = Number(
        recentOrders?.total
        ?? recentOrders?.count
        ?? orderCompletionRate?.totalOrders
        ?? orderCompletionRate?.total
        ?? 0,
    );
    const completedOrders = Number(
        orderCompletionRate?.completedOrders
        ?? orderCompletionRate?.completed
        ?? orderCompletionRate?.successOrders
        ?? 0,
    );
    const orderRateValue = getMetricNumber(orderCompletionRate, null);

    return {
        totalOrders: Number.isFinite(totalOrders) ? totalOrders : 0,
        completedOrders: Number.isFinite(completedOrders) ? completedOrders : 0,
        orderCompletionRate: orderRateValue,
    };
}

function mergeAnalyticsWithOverviewPayload(analytics, overviewPayload) {
    if (!overviewPayload) {
        return analytics;
    }

    const totalRevenue = getMetricNumber(overviewPayload.metrics?.totalRevenue, analytics.totalRevenue ?? 0);
    const newStudents = getMetricNumber(overviewPayload.metrics?.newStudents, analytics.totalStudents ?? 0);
    const totals = getOrderTotalsFromPayload(overviewPayload);
    const normalizedRevenueSeries = normalizeRevenueSeries(
        overviewPayload.revenueSeries,
        analytics.ranges?.month?.revenueSeries || [],
    );
    const normalizedEnrollmentSeries = normalizeEnrollmentSeries(
        overviewPayload.enrollmentSeries,
        analytics.ranges?.month?.enrollmentSeries || [],
    );
    const rateSource = Number.isFinite(totals.orderCompletionRate)
        ? totals.orderCompletionRate
        : (totals.totalOrders > 0 ? Math.round((totals.completedOrders / totals.totalOrders) * 100) : 0);
    const effectiveCompletedOrders = totals.completedOrders > 0
        ? totals.completedOrders
        : (totals.totalOrders > 0 ? Math.round((rateSource / 100) * totals.totalOrders) : analytics.completedOrders);
    const nextRanges = Object.fromEntries(
        Object.entries(analytics.ranges || {}).map(([key, range]) => [
            key,
            {
                ...range,
                totalRevenue: key === 'month' ? totalRevenue : range.totalRevenue,
                totalOrders: key === 'month' ? totals.totalOrders : range.totalOrders,
                completedOrders: key === 'month' ? effectiveCompletedOrders : range.completedOrders,
                totalStudents: key === 'month' ? newStudents : range.totalStudents,
                revenueSeries: key === 'month' ? normalizedRevenueSeries : range.revenueSeries,
                enrollmentSeries: key === 'month' ? normalizedEnrollmentSeries : range.enrollmentSeries,
            },
        ]),
    );

    return {
        ...analytics,
        totalRevenue,
        totalOrders: totals.totalOrders,
        completedOrders: effectiveCompletedOrders,
        totalStudents: newStudents,
        ranges: nextRanges,
    };
}

export default function useAdminCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [pendingRange, setPendingRange] = useState('month');
    const [isRangeLoading, setIsRangeLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { dialog, openDialog, closeDialog, handleDialogConfirm } = useOwlDialog();
    const rangeSwitchTimeoutRef = useRef(null);

    const fetchCourse = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError('');

        try {
            const [courseResult, overviewResult] = await Promise.allSettled([
                adminApi.getCourseById(id),
                expertAnalyticsApi.getOverview(id, { chartPeriod: 'month' }),
            ]);

            if (courseResult.status !== 'fulfilled') {
                throw courseResult.reason;
            }

            const normalizedCourse = normalizeCourse(courseResult.value?.data ?? courseResult.value);
            const overviewPayload = overviewResult.status === 'fulfilled'
                ? resolveOverviewPayload(overviewResult.value)
                : null;
            const rawOrders = extractOverviewOrders(overviewPayload);
            const nextAnalytics = mergeAnalyticsWithOverviewPayload(
                buildCourseAnalytics(normalizedCourse, rawOrders, { courseScoped: true }),
                overviewPayload,
            );
            const nextCourse = mergeCourseWithOverviewPayload(normalizedCourse, overviewPayload);

            if (overviewResult.status !== 'fulfilled') {
                console.error('Không thể tải analytics khóa học:', overviewResult.reason);
            }

            setAnalytics(nextAnalytics);
            setCourse(mergeCourseWithAnalytics(nextCourse, nextAnalytics));
        } catch (err) {
            console.error('Lỗi khi tải chi tiết khóa học:', err);
            setError('Không thể tải thông tin khóa học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    useEffect(() => () => {
        if (rangeSwitchTimeoutRef.current) {
            clearTimeout(rangeSwitchTimeoutRef.current);
        }
    }, []);

    const handleTogglePublish = useCallback(async () => {
        if (!course) return;

        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setToggling(true);

        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourse((previous) => ({ ...previous, status: newStatus }));
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setToggling(false);
        }
    }, [course]);

    const handleEditSuccess = useCallback((updatedCourse) => {
        const normalizedCourse = normalizeCourse(updatedCourse);
        setCourse(mergeCourseWithAnalytics(normalizedCourse, analytics));
        setShowEditModal(false);
    }, [analytics]);

    const handleExpertAssigned = useCallback((updatedCourse) => {
        setCourse(mergeCourseWithAnalytics(normalizeCourse(updatedCourse), analytics));
    }, [analytics]);

    const handleDelete = useCallback(() => {
        if (!course) return;

        openDialog({
            variant: 'warning',
            title: `Xóa khóa học "${course.name}"?`,
            message: 'Cú quản trị cần bạn xác nhận trước khi xóa khóa học này khỏi hệ thống.',
            details: 'Hành động này không thể hoàn tác. Sau khi xóa, bạn sẽ được đưa về lại danh sách khóa học.',
            showCancel: true,
            confirmLabel: 'Xóa ngay',
            cancelLabel: 'Quay lại',
            confirmTone: 'danger',
            onConfirm: async () => {
                try {
                    await adminApi.deleteCourse(course.id);
                    navigate('/admin/courses');
                    return true;
                } catch (err) {
                    console.error('Lỗi khi xóa khóa học:', err);
                    openDialog({
                        variant: 'error',
                        title: 'Không thể xóa khóa học',
                        message: `Cú chưa thể xóa "${course.name}" lúc này.`,
                        details: 'Vui lòng thử lại sau vài giây hoặc kiểm tra dữ liệu liên quan.',
                        confirmLabel: 'Đã hiểu',
                        confirmTone: 'warning',
                    });
                    return false;
                }
            },
        });
    }, [course, navigate, openDialog]);

    const handleRangeChange = useCallback((nextRange) => {
        if (nextRange === pendingRange && !isRangeLoading) {
            return;
        }

        setPendingRange(nextRange);

        if (nextRange === timeRange) {
            setIsRangeLoading(false);
            return;
        }

        if (rangeSwitchTimeoutRef.current) {
            clearTimeout(rangeSwitchTimeoutRef.current);
        }

        setIsRangeLoading(true);
        rangeSwitchTimeoutRef.current = setTimeout(() => {
            setTimeRange(nextRange);
            setIsRangeLoading(false);
        }, 220);
    }, [isRangeLoading, pendingRange, timeRange]);

    const activeAnalytics = useMemo(
        () => analytics?.ranges?.[timeRange] || analytics?.ranges?.month || null,
        [analytics, timeRange],
    );

    const goBack = useCallback(() => {
        navigate('/admin/courses');
    }, [navigate]);

    return {
        course,
        analytics,
        activeAnalytics,
        timeRange,
        pendingRange,
        isRangeLoading,
        loading,
        error,
        toggling,
        showEditModal,
        setShowEditModal,
        dialog,
        closeDialog,
        handleDialogConfirm,
        fetchCourse,
        handleTogglePublish,
        handleEditSuccess,
        handleExpertAssigned,
        handleDelete,
        handleRangeChange,
        goBack,
    };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft, Edit3, Trash2, ExternalLink, MoreHorizontal,
    Globe, EyeOff, RefreshCw, Loader2, AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '@/features/admin/components';
import { OwlDialog, OwlLoader, useOwlDialog } from '@/shared/ui/common';
import {
    BusinessKPICards,
    RevenueChart,
    EnrollmentTrend,
    RecentOrdersTable,
    CourseSummaryCard,
    ExpertAssignmentCard,
    CourseEditModal,
    containerVariants,
    cardVariants,
    statusConfig,
} from '@/features/admin/components/adminCourses';
import adminApi from '@/shared/api/adminApi';

function normalizeCourse(course) {
    const students = Number(course.purchaseCount ?? course.enrolledCount ?? course.totalStudents ?? course.students ?? 0);
    const price = Number(course.priceAmount ?? course.price ?? 0);
    const revenue = Number(course.revenue ?? 0) || (students * price);

    return {
        id: course.subjectId ?? course.courseId ?? course.id,
        name: course.subjectName ?? course.courseName ?? course.name ?? '',
        category: course.category ?? course.subjectCategory ?? '',
        price,
        originalPrice: Number(course.originalPrice ?? course.subjectPrice ?? 0),
        students,
        rating: Number(course.ratingAverage ?? course.averageRating ?? course.rating ?? 0),
        ratingCount: Number(course.ratingCount ?? 0),
        status: course.status ?? 'draft',
        lessons: Number(course.totalLessons ?? course.lessons ?? 0),
        chapters: Number(course.totalChapters ?? course.chapters ?? 0),
        image: course.subjectIconUrl ?? course.courseIconUrl ?? course.image ?? '',
        revenue,
        completionRate: Number(course.completionRate ?? 0),
        createdAt: course.createdAt ?? course.created_date ?? '',
        updatedAt: course.updatedAt ?? course.updated_date ?? '',
        instructor: course.instructorName ?? course.instructor ?? course.creator?.fullName ?? course.creator?.displayName ?? course.creatorName ?? '',
        bannerUrl: course.subjectBannerUrl ?? course.courseBannerUrl ?? course.bannerUrl ?? '',
        subjectCode: course.subjectCode ?? course.courseCode ?? '',
        description: course.subjectDescription ?? course.courseDescription ?? '',
        publishedAt: course.publishedAt ?? course.published_date ?? null,
        isFeatured: course.isFeatured ?? false,
        totalVideos: Number(course.totalVideos ?? 0),
        totalDocuments: Number(course.totalDocuments ?? 0),
        totalQuestions: Number(course.totalQuestions ?? 0),
        estimatedHours: Number(course.estimatedDurationHours ?? course.estimatedHours ?? 0),
        totalStudents: students,
        creator: course.creator ?? course.instructor ?? null,
    };
}

function pickCandidate(source, candidates, fallback = undefined) {
    for (const candidate of candidates) {
        const value = typeof candidate === 'function' ? candidate(source) : source?.[candidate];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return fallback;
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

function normalizeComparableId(value) {
    return String(value ?? '').trim().toLowerCase();
}

function toValidDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function endOfDay(date) {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
}

function startOfWeek(date) {
    const next = startOfDay(date);
    const day = next.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    next.setDate(next.getDate() + diff);
    return next;
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function endOfYear(date) {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
}

function addMonths(date, amount) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatCurrencyVND(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(toNumber(value));
}

function formatDate(value) {
    const date = toValidDate(value);
    if (!date) {
        return '--';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function extractOrderList(payload) {
    const base = payload?.data ?? payload ?? {};

    return firstArray(
        base.orders,
        base.items,
        base.results,
        base.data?.orders,
        base.data?.items,
        base.data?.results,
        base.list,
        base.data?.list,
    );
}

function getOrderItems(order) {
    return firstArray(
        order?.items,
        order?.orderItems,
        order?.details,
        order?.products,
        order?.data?.items,
    );
}

function normalizeOrderStatus(order) {
    const rawStatus = String(pickCandidate(order, [
        'status',
        'paymentStatus',
        (value) => value?.transaction?.status,
    ], '')).toLowerCase();

    if (rawStatus.includes('refund')) {
        return 'refunded';
    }

    if (rawStatus.includes('cancel')) {
        return 'cancelled';
    }

    if (rawStatus.includes('process')) {
        return 'processing';
    }

    if (rawStatus.includes('pending') || rawStatus.includes('wait')) {
        return 'pending';
    }

    return 'completed';
}

function itemMatchesCourse(item, courseId) {
    const normalizedCourseId = normalizeComparableId(courseId);
    const candidateIds = [
        item?.courseId,
        item?.subjectId,
        item?.itemId,
        item?.id,
        item?.course?.id,
        item?.subject?.id,
    ];

    return candidateIds.some((candidate) => normalizeComparableId(candidate) === normalizedCourseId);
}

function orderMatchesCourse(order, courseId) {
    const normalizedCourseId = normalizeComparableId(courseId);

    const directCandidates = [
        order?.courseId,
        order?.subjectId,
        order?.itemId,
        order?.course?.id,
        order?.subject?.id,
    ];

    if (directCandidates.some((candidate) => normalizeComparableId(candidate) === normalizedCourseId)) {
        return true;
    }

    return getOrderItems(order).some((item) => itemMatchesCourse(item, courseId));
}

function getItemTotal(item) {
    const quantity = Math.max(1, toNumber(item?.quantity, 1));
    const total = toNumber(item?.totalPrice ?? item?.finalAmount ?? item?.amount, NaN);

    if (Number.isFinite(total)) {
        return total;
    }

    return quantity * toNumber(item?.unitPrice ?? item?.price ?? item?.priceAmount, 0);
}

function getOrderCourseAmount(order, courseId) {
    const items = getOrderItems(order);

    if (items.length > 0) {
        const matchingItems = items.filter((item) => itemMatchesCourse(item, courseId));
        if (matchingItems.length === 0) {
            return 0;
        }

        const matchingGross = matchingItems.reduce((sum, item) => sum + getItemTotal(item), 0);
        const allGross = items.reduce((sum, item) => sum + getItemTotal(item), 0);
        const netAmount = toNumber(pickCandidate(order, [
            'finalAmount',
            'amount',
            'totalAmount',
            'paidAmount',
            (value) => value?.transaction?.amount,
        ], 0));

        if (allGross > 0 && netAmount > 0) {
            return Math.round((matchingGross / allGross) * netAmount);
        }

        return matchingGross;
    }

    if (!orderMatchesCourse(order, courseId)) {
        return 0;
    }

    return toNumber(pickCandidate(order, [
        'finalAmount',
        'amount',
        'totalAmount',
        'paidAmount',
        (value) => value?.transaction?.amount,
    ], 0));
}

function getOrderOccurredAt(order) {
    return pickCandidate(order, [
        'completedAt',
        'paidAt',
        'updatedAt',
        'createdAt',
        'created_at',
        (value) => value?.transaction?.createdAt,
    ], null);
}

function normalizeCourseOrder(order, courseId, index) {
    if (!orderMatchesCourse(order, courseId)) {
        return null;
    }

    const occurredAt = getOrderOccurredAt(order);
    const amount = getOrderCourseAmount(order, courseId);
    const status = normalizeOrderStatus(order);

    return {
        id: pickCandidate(order, ['displayCode', 'orderCode', 'code', 'id', '_id'], `ORD-${index + 1}`),
        studentId: pickCandidate(order, [
            (value) => value?.user?.id,
            (value) => value?.user?._id,
            'userId',
            'customerId',
            'studentId',
        ], ''),
        studentName: pickCandidate(order, [
            (value) => value?.user?.fullName,
            (value) => value?.user?.name,
            (value) => value?.customer?.fullName,
            (value) => value?.student?.fullName,
            'customerName',
            'userName',
            'studentName',
        ], 'Học viên'),
        studentEmail: pickCandidate(order, [
            (value) => value?.user?.email,
            (value) => value?.customer?.email,
            'customerEmail',
            'userEmail',
        ], ''),
        avatar: pickCandidate(order, [
            (value) => value?.user?.avatarUrl,
            (value) => value?.user?.avatar,
            (value) => value?.customer?.avatarUrl,
            (value) => value?.student?.avatarUrl,
        ], ''),
        amount,
        paymentMethod: String(pickCandidate(order, [
            'paymentMethod',
            (value) => value?.transaction?.paymentMethod,
        ], '')),
        status,
        createdAt: pickCandidate(order, ['createdAt', 'created_at'], occurredAt),
        occurredAt,
        dateLabel: formatDate(occurredAt ?? order?.createdAt ?? order?.created_at),
    };
}

function calculateGrowthPercent(currentValue, previousValue) {
    if (previousValue <= 0) {
        return currentValue > 0 ? 100 : 0;
    }

    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
}

function getRangeConfig(range, now = new Date()) {
    if (range === 'week') {
        const end = endOfDay(now);
        const start = startOfDay(addDays(now, -6));
        const previousStart = startOfDay(addDays(start, -7));
        const previousEnd = endOfDay(addDays(start, -1));
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        return {
            key: range,
            start,
            end,
            previousStart,
            previousEnd,
            title: 'Doanh thu theo ngày',
            subtitle: '7 ngày gần nhất của khóa học này',
            enrollmentSubtitle: 'Theo ngày trong 7 ngày gần nhất',
            ordersSubtitle: 'Đơn hàng trong 7 ngày gần nhất',
            totalLabel: '7 ngày gần nhất',
            buckets: Array.from({ length: 7 }, (_, index) => {
                const bucketStart = startOfDay(addDays(start, index));
                const bucketEnd = endOfDay(bucketStart);
                const weekdayLabel = weekdays[bucketStart.getDay()];

                return {
                    key: bucketStart.toISOString(),
                    shortLabel: weekdayLabel,
                    label: formatDate(bucketStart),
                    start: bucketStart,
                    end: bucketEnd,
                };
            }),
        };
    }

    if (range === 'year') {
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const end = endOfMonth(currentMonth);
        const previousStart = new Date(start.getFullYear(), start.getMonth() - 12, 1);
        const previousEnd = endOfMonth(new Date(end.getFullYear(), end.getMonth() - 12, 1));

        return {
            key: range,
            start,
            end,
            previousStart,
            previousEnd,
            title: 'Doanh thu theo tháng',
            subtitle: '12 tháng gần nhất của khóa học này',
            enrollmentSubtitle: 'Theo tháng trong 12 tháng gần nhất',
            ordersSubtitle: 'Đơn hàng trong 12 tháng gần nhất',
            totalLabel: '12 tháng gần nhất',
            buckets: Array.from({ length: 12 }, (_, index) => {
                const bucketStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
                const bucketEnd = endOfMonth(bucketStart);

                return {
                    key: `${bucketStart.getFullYear()}-${index}`,
                    shortLabel: `T${index + 1}`,
                    label: `Tháng ${index + 1}`,
                    start: bucketStart,
                    end: bucketEnd,
                };
            }),
        };
    }

    const end = endOfDay(now);
    const start = startOfWeek(addDays(now, -27));
    const previousEnd = endOfDay(addDays(start, -1));
    const previousStart = startOfWeek(addDays(previousEnd, -27));
    const totalWeeks = 4;

    return {
        key: 'month',
        start,
        end,
        previousStart,
        previousEnd,
        title: 'Doanh thu theo tuần',
        subtitle: '4 tuần gần nhất của khóa học này',
        enrollmentSubtitle: 'Theo tuần trong 4 tuần gần nhất',
        ordersSubtitle: 'Đơn hàng trong 4 tuần gần nhất',
        totalLabel: '4 tuần gần nhất',
        buckets: Array.from({ length: totalWeeks }, (_, index) => {
            const bucketStart = startOfDay(addDays(start, index * 7));
            const bucketEnd = endOfDay(new Date(Math.min(addDays(bucketStart, 6).getTime(), end.getTime())));

            return {
                key: bucketStart.toISOString(),
                shortLabel: `W${index + 1}`,
                label: `${formatDate(bucketStart)} - ${formatDate(bucketEnd)}`,
                start: bucketStart,
                end: bucketEnd,
            };
        }),
    };
}

function sumRevenueInRange(orders, startDate, endDate) {
    return orders.reduce((sum, order) => {
        const date = toValidDate(order.occurredAt);
        if (!date || date < startDate || date > endDate) {
            return sum;
        }

        return sum + order.amount;
    }, 0);
}

function buildRangeAnalytics(allOrders, completedOrders, range, now = new Date()) {
    const config = getRangeConfig(range, now);
    const filteredOrders = allOrders.filter((order) => {
        const date = toValidDate(order.occurredAt);
        return Boolean(date) && date >= config.start && date <= config.end;
    });
    const filteredCompletedOrders = completedOrders.filter((order) => {
        const date = toValidDate(order.occurredAt);
        return Boolean(date) && date >= config.start && date <= config.end;
    });

    const buckets = config.buckets.map((bucket) => {
        const revenue = filteredCompletedOrders.reduce((sum, order) => {
            const date = toValidDate(order.occurredAt);
            if (!date || date < bucket.start || date > bucket.end) {
                return sum;
            }

            return sum + order.amount;
        }, 0);

        const count = filteredCompletedOrders.reduce((sum, order) => {
            const date = toValidDate(order.occurredAt);
            if (!date || date < bucket.start || date > bucket.end) {
                return sum;
            }

            return sum + 1;
        }, 0);

        return {
            shortLabel: bucket.shortLabel,
            label: bucket.label,
            revenue,
            count,
        };
    });

    const uniqueStudents = new Set(
        filteredCompletedOrders.map((order) => normalizeComparableId(order.studentId || order.studentEmail || order.studentName || order.id)).filter(Boolean),
    );
    const totalRevenue = filteredCompletedOrders.reduce((sum, order) => sum + order.amount, 0);
    const previousRevenue = sumRevenueInRange(completedOrders, config.previousStart, config.previousEnd);

    return {
        range,
        title: config.title,
        subtitle: config.subtitle,
        enrollmentSubtitle: config.enrollmentSubtitle,
        ordersSubtitle: config.ordersSubtitle,
        totalLabel: config.totalLabel,
        totalRevenue,
        totalOrders: filteredOrders.length,
        completedOrders: filteredCompletedOrders.length,
        totalStudents: uniqueStudents.size,
        growthPercent: calculateGrowthPercent(totalRevenue, previousRevenue),
        revenueSeries: buckets.map((bucket) => ({
            month: bucket.shortLabel,
            label: bucket.label,
            revenue: bucket.revenue,
        })),
        enrollmentSeries: buckets.map((bucket) => ({
            shortLabel: bucket.shortLabel,
            label: bucket.label,
            count: bucket.count,
        })),
        recentOrders: filteredOrders
            .slice()
            .sort((left, right) => (new Date(right.occurredAt || right.createdAt).getTime()) - (new Date(left.occurredAt || left.createdAt).getTime()))
            .slice(0, 6),
    };
}

function buildCourseAnalytics(course, rawOrders) {
    const normalizedOrders = rawOrders
        .map((order, index) => normalizeCourseOrder(order, course.id, index))
        .filter(Boolean)
        .sort((left, right) => (new Date(right.occurredAt || right.createdAt).getTime()) - (new Date(left.occurredAt || left.createdAt).getTime()));

    const completedOrders = normalizedOrders.filter((order) => order.status === 'completed');

    const uniqueStudents = new Set(
        completedOrders.map((order) => normalizeComparableId(order.studentId || order.studentEmail || order.studentName || order.id)).filter(Boolean),
    );

    return {
        hasOrderData: normalizedOrders.length > 0,
        totalOrders: normalizedOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue: completedOrders.reduce((sum, order) => sum + order.amount, 0),
        totalStudents: uniqueStudents.size,
        recentOrders: normalizedOrders.slice(0, 6),
        ranges: {
            week: buildRangeAnalytics(normalizedOrders, completedOrders, 'week'),
            month: buildRangeAnalytics(normalizedOrders, completedOrders, 'month'),
            year: buildRangeAnalytics(normalizedOrders, completedOrders, 'year'),
        },
    };
}

function mergeCourseWithAnalytics(course, analytics) {
    if (!analytics) {
        return course;
    }

    return {
        ...course,
        revenue: course.revenue > 0 ? course.revenue : analytics.totalRevenue,
        students: Math.max(course.students || 0, analytics.totalStudents || 0),
        totalStudents: Math.max(course.totalStudents || 0, analytics.totalStudents || 0),
    };
}

/**
 * AdminCourseDetail - Trang chi tiết khóa học dành cho Admin
 */
export default function AdminCourseDetail() {
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
            const [courseResult, ordersResult] = await Promise.allSettled([
                adminApi.getCourseById(id),
                adminApi.getAllOrders({ limit: 1000 }),
            ]);

            if (courseResult.status !== 'fulfilled') {
                throw courseResult.reason;
            }

            const normalizedCourse = normalizeCourse(courseResult.value?.data ?? courseResult.value);
            const rawOrders = ordersResult.status === 'fulfilled' ? extractOrderList(ordersResult.value) : [];
            const nextAnalytics = buildCourseAnalytics(normalizedCourse, rawOrders);

            if (ordersResult.status !== 'fulfilled') {
                console.error('Không thể tải danh sách đơn hàng khóa học:', ordersResult.reason);
            }

            setAnalytics(nextAnalytics);
            setCourse(mergeCourseWithAnalytics(normalizedCourse, nextAnalytics));
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

    const handleTogglePublish = async () => {
        if (!course) return;

        const newStatus = course.status === 'published' ? 'draft' : 'published';
        setToggling(true);

        try {
            await adminApi.togglePublish(course.id, newStatus);
            setCourse((prev) => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setToggling(false);
        }
    };

    const handleEditSuccess = (updatedCourse) => {
        const normalizedCourse = normalizeCourse(updatedCourse);
        setCourse(mergeCourseWithAnalytics(normalizedCourse, analytics));
        setShowEditModal(false);
    };

    const handleExpertAssigned = (updatedCourse) => {
        setCourse(mergeCourseWithAnalytics(normalizeCourse(updatedCourse), analytics));
    };

    const handleDelete = () => {
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
    };

    const handleRangeChange = (nextRange) => {
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
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[60vh] flex-col items-center justify-center">
                    <OwlLoader
                        message="Đang tải thông tin khóa học..."
                        subMessage="SKR đang lấy số liệu vận hành, doanh thu và thông tin phụ trách của khóa học."
                        className="py-8"
                    />
                </div>
            </AdminLayout>
        );
    }

    if (error || !course) {
        return (
            <AdminLayout>
                <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                    <AlertTriangle className="mb-4 h-14 w-14 text-red-500" />
                    <h3 className="mb-2 text-xl font-bold text-base-content">
                        {error || 'Không tìm thấy khóa học'}
                    </h3>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={fetchCourse}
                            className="btn btn-sm btn-ghost gap-1.5 rounded-xl font-bold"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Thử lại
                        </button>
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="btn btn-sm gap-1.5 rounded-xl border-none bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const status = statusConfig[course.status] || statusConfig.draft;
    const activeAnalytics = analytics?.ranges?.[timeRange] || analytics?.ranges?.month || null;

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-7xl space-y-6"
            >
                <motion.div
                    variants={cardVariants}
                    className="flex flex-wrap items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="btn btn-circle btn-ghost btn-sm"
                            title="Quay lại"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-base-content lg:text-3xl">
                                {course.name}
                                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${status.color}`}>
                                    {status.label}
                                </span>
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                {course.subjectCode && (
                                    <>
                                        <span className="text-sm font-medium text-base-content/60">
                                            Mã khóa: {course.subjectCode}
                                        </span>
                                        <span className="text-sm text-base-content/30">•</span>
                                    </>
                                )}
                                <span className="text-sm font-medium text-base-content/60">
                                    {course.category || 'Khác'}
                                </span>
                                <span className="text-sm text-base-content/30">•</span>
                                <span className="text-sm font-medium text-base-content/60">
                                    {course.lessons} bài học • {course.chapters} chương
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleTogglePublish}
                            disabled={toggling}
                            className={`btn btn-sm gap-1.5 rounded-xl font-bold ${
                                course.status === 'published'
                                    ? 'border border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                    : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            }`}
                        >
                            {toggling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : course.status === 'published' ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Globe className="h-4 w-4" />
                            )}
                            {course.status === 'published' ? 'Hủy công khai' : 'Công khai ngay'}
                        </button>

                        <button
                            onClick={() => setShowEditModal(true)}
                            className="btn btn-sm gap-1.5 rounded-xl border-none bg-gradient-to-r from-emerald-600 to-cyan-600 font-bold text-white shadow-lg"
                        >
                            <Edit3 className="h-4 w-4" />
                            Chỉnh sửa
                        </button>

                        {course.status === 'published' && (
                            <a
                                href={`/courses/${course.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-ghost gap-1.5 rounded-xl font-bold"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Xem Landing Page
                            </a>
                        )}

                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu z-[1] w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl">
                                <li>
                                    <button
                                        onClick={handleDelete}
                                        className="text-sm font-bold text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Xóa khóa học
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <BusinessKPICards course={course} analytics={activeAnalytics} range={timeRange} loading={isRangeLoading} />

                <RevenueChart
                    range={pendingRange}
                    loading={isRangeLoading}
                    onRangeChange={handleRangeChange}
                    title={activeAnalytics?.title}
                    subtitle={activeAnalytics?.subtitle}
                    revenueSeries={activeAnalytics?.revenueSeries || []}
                    revenuePeriods={{
                        total: activeAnalytics?.totalRevenue ?? 0,
                        rangeLabel: activeAnalytics?.totalLabel ?? 'Tháng này',
                        growthPercent: activeAnalytics?.growthPercent ?? 0,
                    }}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <EnrollmentTrend
                            range={timeRange}
                            loading={isRangeLoading}
                            subtitle={activeAnalytics?.enrollmentSubtitle}
                            enrollments={activeAnalytics?.enrollmentSeries || []}
                            totalNew={activeAnalytics?.completedOrders ?? 0}
                        />
                        <RecentOrdersTable
                            range={timeRange}
                            loading={isRangeLoading}
                            subtitle={activeAnalytics?.ordersSubtitle}
                            orders={activeAnalytics?.recentOrders || []}
                            courseName={course.name}
                            totalOrders={activeAnalytics?.totalOrders ?? 0}
                        />
                    </div>

                    <div className="space-y-6">
                        <CourseSummaryCard course={course} />
                        <ExpertAssignmentCard creator={course.creator} courseId={course.id} onExpertAssigned={handleExpertAssigned} />
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showEditModal && (
                    <CourseEditModal
                        course={course}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </AnimatePresence>

            <OwlDialog
                isOpen={dialog.isOpen}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                details={dialog.details}
                confirmLabel={dialog.confirmLabel}
                cancelLabel={dialog.cancelLabel}
                showCancel={dialog.showCancel}
                confirmTone={dialog.confirmTone}
                loading={dialog.loading}
                onClose={closeDialog}
                onConfirm={handleDialogConfirm}
            />
        </AdminLayout>
    );
}

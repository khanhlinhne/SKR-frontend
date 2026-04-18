import { normalizeCourse as normalizeBaseCourse } from '@/features/admin/components/adminCourses/adminCourseDisplay';
import {
    normalizeComparableId,
    normalizeCourseOrder,
    toValidDate,
} from './adminCourseDetailOrders';

function normalizeCourse(course) {
    const baseCourse = normalizeBaseCourse(course);

    return {
        ...baseCourse,
        originalPrice: Number(course.originalPrice ?? course.subjectPrice ?? 0),
        totalVideos: Number(course.totalVideos ?? 0),
        totalDocuments: Number(course.totalDocuments ?? 0),
        totalQuestions: Number(course.totalQuestions ?? 0),
        estimatedHours: Number(course.estimatedDurationHours ?? course.estimatedHours ?? 0),
        totalStudents: baseCourse.students,
        creator: course.creator ?? course.instructor ?? null,
    };
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

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
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

export {
    buildCourseAnalytics,
    mergeCourseWithAnalytics,
    normalizeCourse,
};
